import { vi } from 'vitest';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { PlaceRepository } from '../../data/place.repository';
import { Place } from '../../models/place.models';
import { buildDirectionsUrl, getRelatedPlaces } from '../../utils/place.utils';
import { PlaceDetailsComponent } from './place-details.component';

function makePlace(overrides: Partial<Place> & { slug: string }): Place {
  return {
    id: overrides.slug,
    name: overrides.slug.toUpperCase(),
    categoryId: 'c1',
    categorySlug: 'landmarks',
    categoryName: 'Landmarks',
    shortDescription: 'Short text',
    description: 'Full description',
    address: 'Main Road',
    area: 'Central',
    landmark: 'Near the clock',
    pinCode: '734238',
    latitude: null,
    longitude: null,
    coverImageUrl: null,
    images: [],
    featured: false,
    active: true,
    displayOrder: 1,
    ...overrides,
  };
}

describe('PlaceDetailsComponent', () => {
  let places: Place[];
  let throwOnLookup = false;

  async function setup(url: string, platformId: object | string = 'browser') {
    TestBed.configureTestingModule({
      imports: [PlaceDetailsComponent],
      providers: [
        provideRouter([
          { path: 'places/:slug', component: PlaceDetailsComponent },
          { path: 'places', component: PlaceDetailsComponent },
          { path: '', component: PlaceDetailsComponent },
        ]),
        { provide: PLATFORM_ID, useValue: platformId },
        {
          provide: PlaceRepository,
          useValue: {
            getPlaces: () => places,
            getPlaceBySlug: (slug: string) => {
              if (throwOnLookup) throw new Error('boom');
              return places.find((p) => p.slug === slug);
            },
          },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, PlaceDetailsComponent);
    harness.detectChanges();
    return { harness, el: harness.routeNativeElement as HTMLElement };
  }

  beforeEach(() => {
    throwOnLookup = false;
    places = [
      makePlace({
        slug: 'alpha',
        name: 'Alpha Place',
        categorySlug: 'landmarks',
        categoryName: 'Landmarks',
        coverImageUrl: '/a.jpg',
        images: ['/a.jpg', '/b.jpg', '/c.jpg'],
        latitude: 26.1,
        longitude: 88.2,
      }),
      makePlace({ slug: 'beta', name: 'Beta', categorySlug: 'markets', categoryName: 'Markets', displayOrder: 2 }),
      makePlace({ slug: 'gamma', name: 'Gamma', displayOrder: 5 }),
      makePlace({ slug: 'delta', name: 'Delta', displayOrder: 6 }),
      makePlace({ slug: 'hidden', name: 'Hidden', active: false, displayOrder: 3, description: 'SECRET TEXT' }),
      makePlace({
        slug: 'bare',
        name: 'Bare',
        description: '',
        address: '',
        area: '',
        landmark: '',
        pinCode: '',
      }),
    ];
  });

  it('renders name as the only h1, breadcrumb, category link and description', async () => {
    const { el } = await setup('/places/alpha');
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('h1')?.textContent).toBe('Alpha Place');
    const crumbs = el.querySelectorAll('nav[aria-label="Breadcrumb"] li');
    expect(crumbs[0].textContent).toContain('Home');
    expect(crumbs[0].querySelector('a')?.getAttribute('href')).toBe('/');
    expect(crumbs[1].querySelector('a')?.getAttribute('href')).toBe('/places');
    expect(crumbs[2].textContent).toContain('Alpha Place');
    const category = el.querySelector<HTMLAnchorElement>('a.category');
    expect(category?.getAttribute('href')).toBe('/places?category=landmarks');
    expect(el.textContent).toContain('Full description');
    expect(el.textContent).toContain('Location map');
    expect(el.textContent).toContain('Interactive map coming soon');
  });

  it('shows location rows only when populated and omits missing optional fields', async () => {
    const { el } = await setup('/places/alpha');
    const labels = Array.from(el.querySelectorAll('dt')).map((n) => n.textContent);
    expect(labels).toEqual(['Address', 'Area', 'Landmark', 'PIN Code']);
    expect(el.textContent).not.toContain('26.1');

    TestBed.resetTestingModule();
    const bare = await setup('/places/bare');
    expect(bare.el.querySelector('dl')).toBeNull();
    expect(bare.el.textContent).toContain('Short text');
    expect(bare.el.textContent).not.toMatch(/N\/A|Unknown/);
    expect(bare.el.querySelector('a[href*="google.com/maps"]')).toBeNull();
  });

  it('renders cover image, gallery thumbnails and selection', async () => {
    const { harness, el } = await setup('/places/alpha');
    expect(el.querySelector<HTMLImageElement>('.main-image img')?.getAttribute('src')).toBe('/a.jpg');
    const thumbs = el.querySelectorAll<HTMLButtonElement>('.thumb');
    expect(thumbs.length).toBe(3);
    thumbs[2].click();
    harness.detectChanges();
    expect(el.querySelector<HTMLImageElement>('.main-image img')?.getAttribute('src')).toBe('/c.jpg');
    expect(el.querySelectorAll('.thumb')[2].getAttribute('aria-pressed')).toBe('true');

    el.querySelectorAll<HTMLButtonElement>('.thumb')[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    harness.detectChanges();
    expect(el.querySelector<HTMLImageElement>('.main-image img')?.getAttribute('src')).toBe('/a.jpg');
  });

  it('falls back to first image, then placeholder', async () => {
    places[0] = makePlace({ slug: 'alpha', name: 'Alpha Place', images: ['/only.jpg'] });
    const first = await setup('/places/alpha');
    expect(first.el.querySelector<HTMLImageElement>('.main-image img')?.getAttribute('src')).toBe('/only.jpg');
    expect(first.el.querySelector('.thumb')).toBeNull();

    TestBed.resetTestingModule();
    const none = await setup('/places/beta');
    expect(none.el.querySelector('.main-image img')).toBeNull();
    expect(none.el.querySelector('.main-image .placeholder')).not.toBeNull();
  });

  it('builds directions from coordinates, then address, otherwise omits', () => {
    expect(buildDirectionsUrl(places[0])).toContain('destination=26.1%2C88.2');
    expect(buildDirectionsUrl(places[1])).toContain('destination=Main%20Road%2C%20Central');
    expect(buildDirectionsUrl(places[5])).toBeNull();
  });

  it('renders a real directions link', async () => {
    const { el } = await setup('/places/alpha');
    const link = el.querySelector<HTMLAnchorElement>('.actions a');
    expect(link?.textContent).toContain('Get directions');
    expect(link?.getAttribute('href')).toContain('26.1');
  });

  it('uses Web Share when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    try {
      const { el } = await setup('/places/alpha');
      el.querySelector<HTMLButtonElement>('.actions button')!.click();
      await Promise.resolve();
      expect(share).toHaveBeenCalled();
      expect(share.mock.calls.at(-1)![0].url).toContain('/places/alpha');
    } finally {
      delete (navigator as unknown as Record<string, unknown>)['share'];
    }
  });

  it('copies the link with accessible feedback when Web Share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    try {
      const { harness, el } = await setup('/places/alpha');
      el.querySelector<HTMLButtonElement>('.actions button')!.click();
      await new Promise((r) => setTimeout(r));
      harness.detectChanges();
      expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/\/places\/alpha$/));
      expect(el.querySelector('[role="status"]')?.textContent).toContain('Link copied');
    } finally {
      delete (navigator as unknown as Record<string, unknown>)['share'];
    }
  });

  it('does not touch browser APIs when rendered on the server', async () => {
    const share = vi.fn();
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    try {
      const { el } = await setup('/places/alpha', 'server');
      el.querySelector<HTMLButtonElement>('.actions button')!.click();
      await Promise.resolve();
      expect(share).not.toHaveBeenCalled();
    } finally {
      delete (navigator as unknown as Record<string, unknown>)['share'];
    }
  });

  it('computes related places: active only, excludes current, same category first, max 3', () => {
    const related = getRelatedPlaces(places, places[0]);
    expect(related.length).toBe(3);
    expect(related.map((p) => p.slug)).not.toContain('alpha');
    expect(related.map((p) => p.slug)).not.toContain('hidden');
    expect(related[0].categorySlug).toBe('landmarks');
    expect(related.map((p) => p.slug)).toEqual(['bare', 'gamma', 'delta']);
    expect(getRelatedPlaces([places[0], places[1]], places[0]).map((p) => p.slug)).toEqual(['beta']);
  });

  it('renders related places with cards linking to details, and explore all link', async () => {
    const { el } = await setup('/places/alpha');
    expect(el.querySelector('#related-heading')?.textContent).toBe('More places to explore');
    expect(el.querySelectorAll('tk-place-card').length).toBe(3);
    expect(el.querySelector('tk-place-card a')?.getAttribute('href')).toMatch(/^\/places\//);
    expect(el.querySelector('.explore-all a')?.getAttribute('href')).toBe('/places');
  });

  it('updates when the route slug changes on the same component', async () => {
    const { harness, el } = await setup('/places/alpha');
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/places/beta');
    harness.detectChanges();
    expect(el.querySelector('h1')?.textContent).toBe('Beta');
  });

  it('shows unavailable state without hidden details', async () => {
    const { el } = await setup('/places/hidden');
    expect(el.querySelector('h1')?.textContent).toBe('Place unavailable');
    expect(el.textContent).toContain('This place is currently not available in the public directory.');
    expect(el.textContent).toContain('Explore places');
    expect(el.textContent).not.toContain('SECRET TEXT');
    expect(el.textContent).not.toContain('Location');
    expect(el.querySelector('.gallery')).toBeNull();
    expect(el.querySelector('a[href*="google.com"]')).toBeNull();
  });

  it('shows not found for an invalid slug', async () => {
    const { el } = await setup('/places/nope');
    expect(el.querySelector('h1')?.textContent).toBe('Place not found');
    expect(el.textContent).toContain("The place you're looking for doesn't exist or is no longer available.");
    expect(el.textContent).not.toContain('We couldn');
  });

  it('shows a distinct error state and retries', async () => {
    throwOnLookup = true;
    const { harness, el } = await setup('/places/alpha');
    expect(el.querySelector('h1')?.textContent).toBe("We couldn't load this place.");
    expect(el.textContent).toContain('Please try again.');
    expect(el.textContent).not.toContain('Place not found');
    throwOnLookup = false;
    el.querySelector<HTMLButtonElement>('button')!.click();
    harness.detectChanges();
    expect(el.querySelector('h1')?.textContent).toBe('Alpha Place');
  });

  it('starts in a loading state backed by the skeleton component', async () => {
    TestBed.configureTestingModule({
      imports: [PlaceDetailsComponent],
      providers: [provideRouter([]), { provide: PlaceRepository, useValue: { getPlaces: () => [], getPlaceBySlug: () => undefined } }],
    });
    const fixture = TestBed.createComponent(PlaceDetailsComponent);
    const component = fixture.componentInstance as unknown as { state: { set(v: { status: string }): void } };
    component.state.set({ status: 'loading' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tk-loading')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('h1')).toBeNull();
  });

  it('sets title and meta description / Open Graph tags', async () => {
    await setup('/places/alpha');
    const title = TestBed.inject(Title);
    const meta = TestBed.inject(Meta);
    expect(title.getTitle()).toBe('Alpha Place | Thakurganj Connect');
    expect(meta.getTag('name="description"')?.content).toBe('Short text');
    expect(meta.getTag('property="og:title"')?.content).toBe('Alpha Place | Thakurganj Connect');
    expect(meta.getTag('property="og:type"')).toBeTruthy();
    expect(meta.getTag('property="og:image"')?.content).toBe('/a.jpg');
  });

  it('uses a fallback meta description when short description is missing', async () => {
    places[1] = makePlace({ slug: 'beta', name: 'Beta', shortDescription: '' });
    await setup('/places/beta');
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toBe(
      'Explore Beta, location information and useful details in Thakurganj.',
    );
  });
});
