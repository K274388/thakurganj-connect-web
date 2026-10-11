import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { provideFakeRepositories } from './core/testing/fake-repositories';
import { MAP_LIBRARY_LOADER } from './features/map/components/map-view/map-library';
import { fakeLibrary } from './features/map/testing/map-fakes';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { UserLayoutComponent } from './layout/user-layout/user-layout.component';

const ADD_BUSINESS_HEADING = 'Apna kaam';
const MAP_HEADING = 'Explore Thakurganj on the map';

/** Direct navigation and client-side routing to the pages that render in the browser only. */
describe('client-rendered routes', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        ...provideFakeRepositories(),
        provideRouter(routes, withComponentInputBinding()),
        { provide: MAP_LIBRARY_LOADER, useValue: async () => fakeLibrary() },
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  const heading = () => harness.routeNativeElement?.querySelector('h1')?.textContent ?? '';
  const url = () => TestBed.inject(Router).url;

  async function click(selector: string): Promise<void> {
    const link = harness.routeNativeElement?.querySelector<HTMLAnchorElement>(selector);
    expect(link, selector).toBeTruthy();
    link!.click();
    await harness.fixture.whenStable();
  }

  it('opens the business registration page directly', async () => {
    await harness.navigateByUrl('/my/business/new', UserLayoutComponent);
    await harness.fixture.whenStable();
    expect(heading()).toContain(ADD_BUSINESS_HEADING);
    expect(TestBed.inject(Title).getTitle()).toBe('Add your business | Thakurganj Connect');
  });

  it('reaches the business registration page from the header CTA', async () => {
    await harness.navigateByUrl('/', PublicLayoutComponent);
    await click('a.cta[href="/my/business/new"]');
    expect(url()).toBe('/my/business/new');
    expect(heading()).toContain(ADD_BUSINESS_HEADING);
  });

  it('leaves the business registration page and comes back to it with client-side routing', async () => {
    await harness.navigateByUrl('/my/business/new', UserLayoutComponent);
    await harness.navigateByUrl('/businesses', PublicLayoutComponent);
    await click('a.cta[href="/my/business/new"]');
    expect(url()).toBe('/my/business/new');
    expect(heading()).toContain(ADD_BUSINESS_HEADING);
  });

  it('opens the other business management pages directly', async () => {
    await harness.navigateByUrl('/my/businesses', UserLayoutComponent);
    expect(heading()).toContain('Your businesses');
    await harness.navigateByUrl('/my/businesses/1/edit', UserLayoutComponent);
    expect(TestBed.inject(Title).getTitle()).toBe('Edit your business | Thakurganj Connect');
  });

  it('opens the map directly and from the header navigation', async () => {
    await harness.navigateByUrl('/map', PublicLayoutComponent);
    expect(heading()).toContain(MAP_HEADING);

    await harness.navigateByUrl('/about', PublicLayoutComponent);
    await click('nav a[href="/map"]');
    expect(url()).toBe('/map');
    expect(heading()).toContain(MAP_HEADING);
  });
});
