import { expect, Page, test } from '@playwright/test';

/**
 * Render modes and loading of the business management pages and the map: direct navigation, refresh and client-side
 * routing, plus the server's behaviour when a request is cancelled mid-render. Runs against the production SSR build.
 */

const ORIGIN = 'http://127.0.0.1';

/** Pages rendered in the browser only (app.routes.server.ts). */
const CLIENT_RENDERED = ['/my/business/new', '/my/businesses', '/my/businesses/1/edit', '/map'];

/** Public pages that keep server rendering for SEO, with the title the server must already send. */
const SERVER_RENDERED = [
  { path: '/about', title: 'About Thakurganj | Thakurganj Connect', page: 'app-about' },
  { path: '/businesses', title: 'Businesses in Thakurganj | Thakurganj Connect', page: 'app-business-directory' },
  { path: '/transportation', title: 'Transportation in Thakurganj | Thakurganj Connect', page: 'app-transportation' },
];

const ADD_BUSINESS_HEADING = /Apna kaam/;
const MAP_HEADING = 'Explore Thakurganj on the map';

/** MapLibre's web worker does not load from the production bundle (pre-existing, see visual.spec.ts). */
const KNOWN_ERRORS = [/^Error: Worker failed to load/];

/** Collects uncaught errors and Angular runtime/hydration errors. API availability is not under test here. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() !== 'error' || text.startsWith('Failed to load resource')) return;
    if (KNOWN_ERRORS.some((pattern) => pattern.test(text))) return;
    errors.push(text);
  });
  return errors;
}

/** Opens a server-rendered page and waits until its scripts have loaded (hydration) and its data calls settled. */
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/** Counts full document loads, so client-side routing can be told apart from a page load. */
function countDocumentLoads(page: Page): () => number {
  let loads = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) loads++;
  });
  return () => loads;
}

test.beforeEach(async ({ page }) => {
  // Map tiles come from the network; keep runs deterministic.
  await page.route((url) => !url.href.startsWith(ORIGIN), (route) => route.abort());
});

test.describe('server responses', () => {
  for (const path of CLIENT_RENDERED) {
    test(`${path} is answered with the client-rendered shell`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toMatch(/<app-root><\/app-root>/);
      expect(html).not.toContain('ng-server-context');
    });
  }

  for (const { path, title, page } of SERVER_RENDERED) {
    test(`${path} keeps server rendering with its title, description and content`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain('ng-server-context="ssr"');
      expect(html).toContain(`<title>${title}</title>`);
      expect(html).toMatch(/<meta name="description" content="[^"]+">/);
      expect(html, 'page content is in the server HTML').toMatch(new RegExp(`<${page}[\\s>][\\s\\S]*</${page}>`));
    });
  }

  test('/api/v1 is forwarded to the API instead of being rendered by Angular', async ({ request }) => {
    const response = await request.get('/api/v1/categories');
    // 200 when the API is running, 502 problem details when it is not; never an HTML page.
    expect([200, 502]).toContain(response.status());
    expect(response.headers()['content-type']).toMatch(/json/);
  });

  test('the browser reuses API responses fetched during server rendering', async ({ page, request }) => {
    const api = await request.get('/api/v1/categories');
    test.skip(api.status() !== 200, 'needs the API running');
    // Spring Security's default headers mark every response no-store, and Angular does not transfer those.
    test.fixme(/no-store/.test(api.headers()['cache-control'] ?? ''), 'API responses are Cache-Control: no-store');
    const apiCalls: string[] = [];
    page.on('request', (call) => {
      if (new URL(call.url()).pathname.startsWith('/api/')) apiCalls.push(call.url());
    });
    await openHydrated(page, '/businesses');
    expect(apiCalls, 'served from the HTTP transfer cache').toEqual([]);
  });

  test('a request cancelled mid-render does not affect later requests', async ({ request, baseURL }) => {
    for (const path of ['/businesses', '/about', '/my/business/new']) {
      const controller = new AbortController();
      const pending = fetch(new URL(path, baseURL), { signal: controller.signal }).catch(() => undefined);
      setTimeout(() => controller.abort(), 5);
      await pending;
    }
    for (const path of ['/businesses', '/my/business/new']) {
      expect((await request.get(path)).status()).toBe(200);
    }
  });
});

test.describe('business registration page', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('loads on direct navigation and on every refresh', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/my/business/new');
    const heading = page.getByRole('heading', { level: 1, name: ADD_BUSINESS_HEADING });
    await expect(heading).toBeVisible();
    await expect(page).toHaveTitle('Add your business | Thakurganj Connect');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');

    for (let refresh = 0; refresh < 3; refresh++) {
      await page.reload();
      await expect(heading).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test('opens from the header CTA with client-side routing and survives back/forward', async ({ page }) => {
    const errors = trackErrors(page);
    await openHydrated(page, '/about');
    const documentLoads = countDocumentLoads(page);

    await page.getByRole('link', { name: '+ Add Business' }).click();
    await expect(page).toHaveURL(/\/my\/business\/new$/);
    await expect(page.getByRole('heading', { level: 1, name: ADD_BUSINESS_HEADING })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/about$/);
    await page.goForward();
    await expect(page.getByRole('heading', { level: 1, name: ADD_BUSINESS_HEADING })).toBeVisible();

    expect(documentLoads(), 'navigations stay inside the app').toBe(0);
    expect(errors).toEqual([]);
  });

  test('loads on a narrow (mobile) viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/my/business/new');
    await expect(page.getByRole('heading', { level: 1, name: ADD_BUSINESS_HEADING })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, 'page must not scroll horizontally').toBeLessThanOrEqual(0);
  });
});

test.describe('other client-rendered pages', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('My businesses and the edit form load directly and on refresh', async ({ page }) => {
    const errors = trackErrors(page);
    for (const path of ['/my/businesses', '/my/businesses/1/edit']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.reload();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test('the map loads directly, on refresh and from the header navigation', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/map');
    const heading = page.getByRole('heading', { level: 1, name: MAP_HEADING });
    await expect(heading).toBeVisible();
    await expect(page).toHaveTitle(/Map of Thakurganj/);
    await page.reload();
    await expect(heading).toBeVisible();

    await openHydrated(page, '/about');
    const documentLoads = countDocumentLoads(page);
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Map' }).click();
    await expect(page).toHaveURL(/\/map$/);
    await expect(heading).toBeVisible();
    expect(documentLoads(), 'navigation stays inside the app').toBe(0);
    expect(errors).toEqual([]);
  });
});
