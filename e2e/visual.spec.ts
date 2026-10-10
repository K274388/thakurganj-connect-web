import { expect, Page, test } from '@playwright/test';

/** Viewport widths from the UI-preservation requirement. */
const VIEWPORTS = [320, 375, 430, 768, 1024, 1440];

/** Every public screen and directory state captured for the visual baseline. */
const SCREENS: { name: string; path: string }[] = [
  { name: 'home', path: '/' },
  { name: 'directory', path: '/businesses' },
  { name: 'directory-category', path: '/businesses?category=food-restaurants' },
  { name: 'directory-subcategory', path: '/businesses?category=food-restaurants&subcategory=bakery' },
  { name: 'directory-search', path: '/businesses?search=tea' },
  { name: 'directory-empty', path: '/businesses?search=zzzz-no-match' },
  { name: 'directory-page-2', path: '/businesses?page=2' },
  { name: 'directory-sort-newest', path: '/businesses?sort=newest' },
  { name: 'business-details', path: '/businesses/1' },
  { name: 'business-not-found', path: '/businesses/99999' },
  { name: 'categories', path: '/categories' },
  { name: 'category-details', path: '/categories/food-restaurants' },
  { name: 'category-not-found', path: '/categories/does-not-exist' },
  { name: 'map', path: '/map' },
  { name: 'transportation', path: '/transportation' },
  { name: 'about', path: '/about' },
  { name: 'legal-terms', path: '/legal/terms' },
  { name: 'legal-privacy', path: '/legal/privacy' },
  { name: 'my-businesses', path: '/my/businesses' },
  { name: 'add-business', path: '/my/business/new' },
  { name: 'edit-business', path: '/my/businesses/1/edit' },
  { name: 'events-placeholder', path: '/events' },
  { name: 'not-found', path: '/no-such-page' },
];

const ORIGIN = 'http://127.0.0.1';

/**
 * Errors that already exist in the baseline build and are reported separately.
 * MapLibre's web worker does not load from the production bundle (pre-existing, not a refactor regression).
 */
const KNOWN_BASELINE_ERRORS = [/^Error: Worker failed to load/];

/** Loads a page, waits for hydration and lazy images, and fails on Angular runtime errors. */
async function open(page: Page, path: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    // Third-party requests are blocked below, so their load failures are expected.
    if (text.startsWith('Failed to load resource') && !message.location().url.startsWith(ORIGIN)) return;
    if (KNOWN_BASELINE_ERRORS.some((pattern) => pattern.test(text))) return;
    errors.push(text);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  // Map tiles and embedded maps come from the network and are masked; block them so runs stay deterministic.
  await page.route((url) => !url.href.startsWith(ORIGIN), (route) => route.abort());
  await page.goto(path, { waitUntil: 'load' });
  await settle(page);
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
    // Force lazy images to load so captures never race the IntersectionObserver under CPU load.
    for (const image of document.images) image.loading = "eager";
    // An image that never finishes loading must not hang the capture.
    const loaded = (image: HTMLImageElement) =>
      image.complete
        ? image.decode()
        : new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
            setTimeout(resolve, 5_000);
          });
    await Promise.all([...document.images].map((image) => loaded(image).catch(() => undefined)));
  });
  await settle(page);
  await waitForScrollIdle(page);
  await pinHorizontalScrollers(page);
  return errors;
}

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, 'page must not scroll horizontally').toBeLessThanOrEqual(0);
}

for (const width of VIEWPORTS) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: width < 768 ? 800 : 900 } });

    for (const screen of SCREENS) {
      test(screen.name, async ({ page }) => {
        const errors = await open(page, screen.path);
        await expectNoHorizontalScroll(page);
        await expect(page).toHaveScreenshot(`${screen.name}-${width}.png`, {
          fullPage: true,
          // The map panel's state depends on when the (pre-existing) MapLibre worker failure surfaces.
          mask: [page.locator('.map-wrap'), page.locator('iframe')],
        });
        expect(errors, 'no console, hydration or NG0xxx errors').toEqual([]);
      });
    }
  });
}

test.describe('directory interactions', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('category, subcategory, keyword search and clear all work in place', async ({ page }) => {
    const errors = await open(page, '/businesses');

    await page.getByRole('button', { name: /Food & Restaurants/ }).click();
    await expect(page).toHaveURL(/category=food-restaurants/);
    await expect(page.locator('#subcategory-title')).toContainText('Food & Restaurants');
    await expect(page.locator('#business-section')).toHaveScreenshot('interaction-category.png');

    await page.locator('.subgrid .sub', { hasText: 'Bakery' }).click();
    await expect(page).toHaveURL(/subcategory=bakery/);
    await expect(page.locator('#business-section')).toHaveScreenshot('interaction-subcategory.png');

    await page.locator('#query').fill('mobile');
    await expect(page).toHaveURL(/search=mobile/);
    await expect(page).not.toHaveURL(/category=/);
    await expect(page.locator('#business-section')).toHaveScreenshot('interaction-search.png');

    await page.locator('#query').fill('zzzz-no-match');
    await expect(page.locator('.empty')).toBeVisible();

    await page.getByRole('button', { name: /Show all businesses/ }).click();
    await expect(page).toHaveURL(/\/businesses$/);
    await expect(page.locator('#business-section')).toHaveScreenshot('interaction-reset.png');

    await page.locator('.sort').selectOption('name-desc');
    await expect(page).toHaveURL(/sort=name-desc/);
    await expect(page.locator('#business-section')).toHaveScreenshot('interaction-sort.png');

    expect(errors).toEqual([]);
  });

  test('header navigation reaches every primary section', async ({ page }) => {
    await open(page, '/');
    const links = page.locator('header a[href^="/"]');
    const hrefs = [...new Set(await links.evaluateAll((items) => items.map((a) => a.getAttribute('href')!)))];
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const response = await page.request.get(href);
      expect(response.status(), href).toBeLessThan(400);
    }
  });
});

/** Waits for the network to go quiet; the map page keeps polling, so cap the wait instead of failing. */
async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined);
}

/** Waits until no element is still scrolling (e.g. a tab strip smooth-scrolling its active tab into view). */
async function waitForScrollIdle(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      new Promise<boolean>((resolve) => {
        const snapshot = () =>
          [...document.querySelectorAll('*')]
            .filter((element) => element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight)
            .map((element) => `${element.scrollLeft},${element.scrollTop}`)
            .join('|') + `|${window.scrollX},${window.scrollY}`;
        const first = snapshot();
        setTimeout(() => resolve(snapshot() === first), 300);
      }),
    undefined,
    { timeout: 10_000 },
  );
}

/**
 * Proximity scroll-snap (e.g. the legal tab strip) may or may not snap after hydration depending on timing.
 * Disable snapping and reset horizontal scrollers so baseline and comparison runs capture the same frame.
 */
async function pinHorizontalScrollers(page: Page): Promise<void> {
  await page.addStyleTag({ content: '* { scroll-snap-type: none !important; scroll-behavior: auto !important; }' });
  await page.evaluate(() => {
    for (const element of document.querySelectorAll('*')) {
      if (element.scrollWidth > element.clientWidth) element.scrollLeft = 0;
    }
  });
}

test.describe('SEO and server rendering', () => {
  for (const screen of SCREENS) {
    test(`${screen.name} keeps title, description and server-rendered heading`, async ({ page, request }) => {
      // Raw server HTML (no JavaScript) must already carry the content crawlers index.
      const html = await (await request.get(screen.path)).text();
      const pick = (pattern: RegExp) => (html.match(pattern)?.[1] ?? '').replace(/\s+/g, ' ').trim();
      const server = {
        title: pick(/<title>([^<]*)<\/title>/),
        description: pick(/<meta name="description" content="([^"]*)"/),
        headings: [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/g)]
          .slice(0, 4)
          .map((match) => match[1].replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()),
        cards: (html.match(/<article\b/g) ?? []).length,
      };
      await open(page, screen.path);
      const client = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
        headings: [...document.querySelectorAll('h1, h2')]
          .slice(0, 4)
          .map((heading) => heading.textContent?.replace(/\s+/g, ' ').trim() ?? ''),
        cards: document.querySelectorAll('article').length,
      }));
      expect(JSON.stringify({ server, client }, null, 2)).toMatchSnapshot(`seo-${screen.name}.txt`);
    });
  }
});
