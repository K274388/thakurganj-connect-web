import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { PlaceRepository } from '../../data/place.repository';
import { MOCK_PLACES } from '../../data/place.mock';
import { Place } from '../../models/place.models';
import { PlaceDirectoryComponent } from './place-directory.component';
import { PagePlaceholderComponent } from '../../../../shared/components/page-placeholder/page-placeholder.component';

describe('PlaceDirectoryComponent', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceDirectoryComponent, PagePlaceholderComponent],
      providers: [
        provideRouter([
          { path: 'places', component: PlaceDirectoryComponent },
          { path: 'places/:slug', component: PagePlaceholderComponent },
        ]),
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/places', PlaceDirectoryComponent);
    router = TestBed.inject(Router);
    harness.detectChanges();
  });

  it('renders the directory hero, result count and page-one range', () => {
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelectorAll('h1').length).toBe(1);
    expect(page.querySelector('h1')?.textContent).toContain('Places worth');
    expect(page.textContent).toContain('EXPLORE THAKURGANJ');
    expect(page.querySelector<HTMLInputElement>('input[type="search"]')?.placeholder).toBe('Search places...');
    expect(page.textContent).toContain('16 places found');
    expect(page.textContent).toContain('Showing 1-12 of 16');
  });

  it('only shows active places', () => {
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelectorAll('tk-place-card').length).toBe(12);
    expect(page.textContent).not.toContain('Demo Inactive Place');
  });

  it('searches place names case-insensitively and uses singular result wording', async () => {
    await searchFor('  JUNCTION  ');
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.textContent).toContain('1 place found');
    expect(page.textContent).toContain('Thakurganj Junction');
    expect(router.parseUrl(router.url).queryParams['search']).toBe('JUNCTION');
  });

  it('searches across description, category, address, area and landmark fields', async () => {
    await searchFor('railway station');
    expect((harness.routeNativeElement as HTMLElement).textContent).toContain('Thakurganj Junction');

    await searchFor('transportation');
    expect((harness.routeNativeElement as HTMLElement).textContent).toContain('Thakurganj Junction');

    await searchFor('demo area');
    expect((harness.routeNativeElement as HTMLElement).textContent).toContain('Demo Market 1');

    await searchFor('generic sample description');
    expect((harness.routeNativeElement as HTMLElement).textContent).toContain('Demo Park 1');

    await searchFor('demo address 17');
    expect((harness.routeNativeElement as HTMLElement).textContent).toContain('Demo Park 1');

    await searchFor('demo landmark marker');
    expect((harness.routeNativeElement as HTMLElement).textContent).toContain('Demo Park 1');
  });

  it('filters by category and combines category with search', async () => {
    await selectCategory('Markets');
    let page = harness.routeNativeElement as HTMLElement;
    expect(router.parseUrl(router.url).queryParams['category']).toBe('markets');
    expect(page.textContent).toContain('Demo Market 1');
    expect(page.textContent).not.toContain('Demo Hospital 1');

    await searchFor('market 2');
    page = harness.routeNativeElement as HTMLElement;
    expect(page.textContent).toContain('1 place found');
    expect(page.textContent).toContain('Demo Market 2');
  });

  it('initializes search, category and page from query parameters', async () => {
    await harness.navigateByUrl('/places?search=Demo&category=schools&page=2', PlaceDirectoryComponent);
    harness.detectChanges();
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector<HTMLInputElement>('input[type="search"]')?.value).toBe('Demo');
    expect(page.querySelector<HTMLButtonElement>('tk-filter-pill button[aria-pressed="true"]')?.textContent?.trim()).toBe('Schools');
    expect(page.textContent).toContain('Demo School 2');
  });

  it('updates query parameters on search and resets page when filters change', async () => {
    await harness.navigateByUrl('/places?page=2', PlaceDirectoryComponent);
    harness.detectChanges();
    await searchFor('junction');
    expect(router.parseUrl(router.url).queryParams).toEqual({ search: 'junction' });

    await harness.navigateByUrl('/places?page=2', PlaceDirectoryComponent);
    harness.detectChanges();
    await selectCategory('Transport');
    expect(router.parseUrl(router.url).queryParams).toEqual({ category: 'transportation' });
  });

  it('treats an invalid category as All and removes the invalid parameter', async () => {
    await harness.navigateByUrl('/places?category=unknown', PlaceDirectoryComponent);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(router.parseUrl(router.url).queryParams['category']).toBeUndefined();
    expect((harness.routeNativeElement as HTMLElement).textContent).toContain('16 places found');
    expect((harness.routeNativeElement as HTMLElement).querySelector('tk-filter-pill button[aria-pressed="true"]')?.textContent?.trim()).toBe('All');
  });

  it('clears search, category and page from the URL', async () => {
    await harness.navigateByUrl('/places?search=no-match&category=markets&page=2', PlaceDirectoryComponent);
    harness.detectChanges();
    (harness.routeNativeElement as HTMLElement).querySelector<HTMLButtonElement>('.empty button')!.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(router.url).toBe('/places');
    expect((harness.routeNativeElement as HTMLElement).textContent).toContain('16 places found');
  });

  it('paginates and keeps the range and current page accessible', async () => {
    const page = harness.routeNativeElement as HTMLElement;
    const next = [...page.querySelectorAll<HTMLButtonElement>('tk-pagination button')]
      .find((button) => button.textContent?.trim() === 'Next')!;
    next.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(router.parseUrl(router.url).queryParams['page']).toBe('2');
    expect((harness.routeNativeElement as HTMLElement).textContent).toContain('Showing 13-16 of 16');
    expect((harness.routeNativeElement as HTMLElement).querySelector('[aria-current="page"]')?.textContent).toBe('2');
  });

  it('navigates cards to the reserved slug route and renders the image fallback', async () => {
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.querySelector('tk-image-placeholder .placeholder')).not.toBeNull();
    page.querySelector<HTMLAnchorElement>('tk-place-card h3 a')!.click();
    await harness.fixture.whenStable();
    expect(router.url).toBe('/places/thakurganj-junction');
  });

  it('omits optional card details when their values are empty', async () => {
    const place: Place = {
      ...MOCK_PLACES[0],
      address: '',
      area: '',
      shortDescription: '',
      coverImageUrl: null,
    };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PlaceDirectoryComponent, PagePlaceholderComponent],
      providers: [
        { provide: PlaceRepository, useValue: { getPlaces: () => [place] } },
        provideRouter([
          { path: 'places', component: PlaceDirectoryComponent },
          { path: 'places/:slug', component: PagePlaceholderComponent },
        ]),
      ],
    }).compileComponents();
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/places', PlaceDirectoryComponent);
    const card = harness.routeNativeElement!.querySelector('tk-place-card')!;
    expect(card.querySelector('.area')).toBeNull();
    expect(card.querySelector('.description')).toBeNull();
    expect(card.querySelector('tk-image-placeholder .placeholder')).not.toBeNull();
  });

  async function searchFor(query: string): Promise<void> {
    const page = harness.routeNativeElement as HTMLElement;
    const input = page.querySelector<HTMLInputElement>('input[type="search"]')!;
    input.value = query;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.closest('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await harness.fixture.whenStable();
    harness.detectChanges();
  }

  async function selectCategory(label: string): Promise<void> {
    const page = harness.routeNativeElement as HTMLElement;
    [...page.querySelectorAll<HTMLButtonElement>('nav[aria-label="Filter places by category"] button')]
      .find((button) => button.textContent?.trim() === label)!
      .click();
    await harness.fixture.whenStable();
    harness.detectChanges();
  }
});

describe('Place directory with no active places', () => {
  it('shows the directory-specific empty state without a business CTA', async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceDirectoryComponent],
      providers: [
        { provide: PlaceRepository, useValue: { getPlaces: () => [] } },
        provideRouter([{ path: 'places', component: PlaceDirectoryComponent }]),
      ],
    }).compileComponents();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/places', PlaceDirectoryComponent);
    const page = harness.routeNativeElement as HTMLElement;
    expect(page.textContent).toContain('No places available yet.');
    expect(page.textContent).toContain("We're still building the Thakurganj places directory.");
    expect(page.textContent).not.toContain('List your business');
  });
});
