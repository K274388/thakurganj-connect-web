import { TEST_PLACE_CATEGORIES } from '../../../../core/testing/fixtures';
import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FakeCategoryRepository } from '../../../../core/testing/fake-repositories';
import { BusinessRepository } from '../../../businesses/data/business.repository';
import { Business } from '../../../businesses/models/business.models';
import { CategoryRepository } from '../../../categories/data/category.repository';
import { PlaceRepository } from '../../../places/data/place.repository';
import { Place } from '../../../places/models/place.models';
import { MAP_LIBRARY_LOADER } from '../../components/map-view/map-library';
import { FakeMarker, fakeLibrary } from '../../testing/map-fakes';
import { business, place } from '../../testing/map-fixtures';
import { MAP_DESCRIPTION, MapExplorerComponent } from './map-explorer.component';

@Component({ template: 'stub' })
class StubComponent {}

describe('MapExplorerComponent', () => {
  const businesses = signal<Business[]>([]);
  const places = signal<Place[]>([]);
  let harness: RouterTestingHarness;
  let router: Router;
  let el: HTMLElement;

  async function settle() {
    for (let i = 0; i < 3; i++) {
      await harness.fixture.whenStable();
      await Promise.resolve();
      harness.detectChanges();
    }
  }

  async function open(url: string, platform: string = 'browser') {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'map', component: MapExplorerComponent },
          { path: 'places/:slug', component: StubComponent },
          { path: 'businesses/:id', component: StubComponent },
        ]),
        { provide: PLATFORM_ID, useValue: platform },
        { provide: MAP_LIBRARY_LOADER, useValue: async () => fakeLibrary() },
        { provide: BusinessRepository, useValue: { businesses } },
        { provide: CategoryRepository, useClass: FakeCategoryRepository },
        { provide: PlaceRepository, useValue: { places, categories: signal(TEST_PLACE_CATEGORIES) } },
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, MapExplorerComponent);
    router = TestBed.inject(Router);
    el = harness.routeNativeElement as HTMLElement;
    await settle();
  }

  const names = () => Array.from(el.querySelectorAll('tk-map-result-card strong')).map((n) => n.textContent);
  const search = (term: string) => {
    const input = el.querySelector<HTMLInputElement>('input[type="search"]')!;
    input.value = term;
    input.dispatchEvent(new Event('input'));
    el.querySelector<HTMLButtonElement>('tk-search-box button[type="submit"]')!.click();
  };
  const pill = (label: string) =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('tk-filter-pill button')).find((b) => b.textContent?.trim() === label)!;

  beforeEach(() => {
    businesses.set([
      business(),
      business({ id: 102, name: 'Cloth House', categoryId: 2, categorySlug: 'shopping', categoryName: 'Shopping', area: 'Bazaar', shortDescription: 'Sarees', latitude: 0, longitude: 0 }),
      business({ id: 103, name: 'Hidden Biz', status: 'INACTIVE' }),
      business({ id: 104, name: 'No Coords', latitude: undefined, longitude: undefined }),
    ]);
    places.set([
      place(),
      place({ id: 'p2', slug: 'mandir', name: 'Hargauri Mandir', categorySlug: 'religious', categoryName: 'Religious Places', categoryId: 'place-category-religious', area: 'Hargauri' }),
      place({ id: 'p3', slug: 'hidden', name: 'Hidden Place', active: false }),
      place({ id: 'p4', slug: 'nocoords', name: 'No Coords Place', latitude: null, longitude: null }),
    ]);
  });

  it('renders one h1, results of public mappable items only and counts', async () => {
    await open('/map');
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(names()).toEqual(['Saffron Kitchen', 'Cloth House', 'Thakurganj Junction', 'Hargauri Mandir']);
    expect(el.querySelector('[role="status"]')?.textContent).toContain('4 results');
    expect(el.querySelector('[role="status"]')?.textContent).toContain('2 businesses � 2 places');
    expect(el.textContent).toContain('Only listings with map locations are shown here.');
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toBe(MAP_DESCRIPTION);
  });

  it('keeps markers and results on the same filtered collection', async () => {
    await open('/map?type=place');
    expect(names()).toEqual(['Thakurganj Junction', 'Hargauri Mandir']);
    const keys = FakeMarker.instances.filter((m) => !m.removed).map((m) => m.options.element.getAttribute('aria-label'));
    expect(keys).toEqual(['Place: Thakurganj Junction', 'Place: Hargauri Mandir']);
  });

  it('initialises filters from the query string', async () => {
    await open('/map?type=business');
    expect(names()).toEqual(['Saffron Kitchen', 'Cloth House']);
    expect(pill('Businesses').getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('[role="status"]')?.textContent).toContain('2 results');
    expect(el.querySelector('[role="status"]')?.textContent).not.toContain('places');
  });

  it('filters by business and place categories', async () => {
    await open('/map?type=business&category=food-restaurants');
    expect(names()).toEqual(['Saffron Kitchen']);
    expect(el.querySelector('[role="status"]')?.textContent).toContain('1 result');
    expect(el.querySelector('[role="status"]')?.textContent).not.toContain('1 results');

    TestBed.resetTestingModule();
    await open('/map?type=place&category=religious');
    expect(names()).toEqual(['Hargauri Mandir']);

    TestBed.resetTestingModule();
    await open('/map?category=place:religious');
    expect(names()).toEqual(['Hargauri Mandir']);
    expect(el.querySelectorAll('select optgroup').length).toBe(2);
  });

  it('applies search, trims and updates the URL', async () => {
    await open('/map');
    search('  pizza ');
    await settle();
    expect(router.url).toBe('/map?search=pizza');
    expect(names()).toEqual([]);
    search('bazaar');
    await settle();
    expect(names()).toEqual(['Cloth House']);
  });

  it('combines type, category and search', async () => {
    await open('/map?type=business&category=shopping&search=saree');
    expect(names()).toEqual(['Cloth House']);
  });

  it('updates query params from the type pills and category select', async () => {
    await open('/map');
    pill('Places').click();
    await settle();
    expect(router.url).toBe('/map?type=place');
    const select = el.querySelector<HTMLSelectElement>('select')!;
    select.value = 'place:religious';
    select.dispatchEvent(new Event('change'));
    await settle();
    expect(router.url).toBe('/map?type=place&category=religious');
    pill('All').click();
    await settle();
    expect(router.url).toBe('/map?category=place:religious');
    pill('Businesses').click();
    await settle();
    expect(router.url).toBe('/map?type=business');
  });

  it('supports a selected deep link and highlights the result', async () => {
    await open('/map?selected=business-101');
    const card = el.querySelector('tk-map-result-card .card.selected');
    expect(card?.textContent).toContain('Saffron Kitchen');
    expect(card?.querySelector('button')?.getAttribute('aria-pressed')).toBe('true');
    expect(card?.textContent).toContain('Selected');
  });

  it('removes an invalid selected param', async () => {
    await open('/map?selected=business-103');
    expect(router.url).toBe('/map');
    expect(el.querySelector('.card.selected')).toBeNull();
  });

  it('clears selection when a filter removes the selected item', async () => {
    await open('/map?selected=business-101');
    pill('Places').click();
    await settle();
    expect(router.url).toBe('/map?type=place');
    expect(el.querySelector('.card.selected')).toBeNull();
  });

  it('selects from a result and from a marker', async () => {
    await open('/map');
    el.querySelectorAll<HTMLButtonElement>('tk-map-result-card .select')[2].click();
    await settle();
    expect(router.url).toBe('/map?selected=place-p1');
    expect(el.querySelector('.card.selected')?.textContent).toContain('Thakurganj Junction');

    FakeMarker.instances.find((m) => m.options.element.getAttribute('aria-label') === 'Business: Cloth House')!.options.element.click();
    await settle();
    expect(router.url).toBe('/map?selected=business-102');
    expect(el.querySelector('.card.selected')?.textContent).toContain('Cloth House');
  });

  it('navigates to business and place details', async () => {
    await open('/map');
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('tk-map-result-card a'));
    expect(links[0].getAttribute('href')).toBe('/businesses/101');
    expect(links[2].getAttribute('href')).toBe('/places/junction');
    links[2].click();
    await settle();
    expect(router.url).toBe('/places/junction');
  });

  it('shows an empty filter state and clears filters', async () => {
    await open('/map?search=zzzz&type=place');
    expect(el.textContent).toContain('No map results found.');
    expect(el.textContent).toContain('Try another search or change your filters.');
    el.querySelector<HTMLButtonElement>('.empty .clear')!.click();
    await settle();
    expect(router.url).toBe('/map');
    expect(names().length).toBe(4);
  });

  it('clear filters also resets selected', async () => {
    await open('/map?type=business&search=saffron&selected=business-101');
    el.querySelector<HTMLButtonElement>('.filters .clear')!.click();
    await settle();
    expect(router.url).toBe('/map');
  });

  it('shows the no-mappable-data state', async () => {
    businesses.set([business({ latitude: undefined })]);
    places.set([]);
    await open('/map');
    expect(el.textContent).toContain('No locations are available on the map yet.');
    expect(el.textContent).toContain('Businesses and places will appear here once map locations are available.');
    expect(el.querySelector('tk-map-view')).toBeNull();
  });

  it('keeps the results list usable when the map fails', async () => {
    TestBed.configureTestingModule({});
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'map', component: MapExplorerComponent }]),
        { provide: MAP_LIBRARY_LOADER, useValue: async () => { throw new Error('fail'); } },
        { provide: BusinessRepository, useValue: { businesses } },
        { provide: CategoryRepository, useClass: FakeCategoryRepository },
        { provide: PlaceRepository, useValue: { places, categories: signal(TEST_PLACE_CATEGORIES) } },
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/map', MapExplorerComponent);
    el = harness.routeNativeElement as HTMLElement;
    await settle();
    expect(el.textContent).toContain("We couldn't load the map.");
    expect(names().length).toBe(4);
  });

  it('does not initialise MapLibre on the server', async () => {
    const loader = vi.fn(async () => fakeLibrary());
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'map', component: MapExplorerComponent }]),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: MAP_LIBRARY_LOADER, useValue: loader },
        { provide: BusinessRepository, useValue: { businesses } },
        { provide: CategoryRepository, useClass: FakeCategoryRepository },
        { provide: PlaceRepository, useValue: { places, categories: signal(TEST_PLACE_CATEGORIES) } },
      ],
    });
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/map', MapExplorerComponent);
    await settle();
    expect(loader).not.toHaveBeenCalled();
  });

  describe('mobile results sheet', () => {
    const sheet = () => el.querySelector('section.results')!;
    const control = (text: string) =>
      Array.from(el.querySelectorAll<HTMLButtonElement>('.sheet-controls button')).find((b) => b.textContent?.trim() === text);

    it('opens, closes and expands', async () => {
      await open('/map');
      expect(sheet().getAttribute('data-sheet')).toBe('partial');
      control('Hide results')!.click();
      await settle();
      expect(sheet().getAttribute('data-sheet')).toBe('collapsed');
      expect(control('Show results')!.getAttribute('aria-expanded')).toBe('false');
      control('Show results')!.click();
      await settle();
      expect(sheet().getAttribute('data-sheet')).toBe('partial');
      control('Expand results')!.click();
      await settle();
      expect(sheet().getAttribute('data-sheet')).toBe('expanded');
      expect(control('Collapse results')).toBeTruthy();
    });

    it('marker tap selects the item and raises a collapsed sheet to partial', async () => {
      await open('/map');
      control('Hide results')!.click();
      await settle();
      FakeMarker.instances[0].options.element.click();
      await settle();
      expect(sheet().getAttribute('data-sheet')).toBe('partial');
      expect(el.querySelector('.card.selected')).toBeTruthy();
      expect(el.querySelector('tk-map-view')).toBeTruthy();
    });

    it('selecting from an expanded sheet returns to partial so the map stays visible', async () => {
      await open('/map');
      control('Expand results')!.click();
      await settle();
      el.querySelector<HTMLButtonElement>('tk-map-result-card .select')!.click();
      await settle();
      expect(sheet().getAttribute('data-sheet')).toBe('partial');
    });
  });
});
