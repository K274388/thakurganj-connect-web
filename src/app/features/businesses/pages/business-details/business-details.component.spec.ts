import { TEST_BUSINESSES } from '../../../../core/testing/fixtures';
import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Business } from '../../models/business.models';
import { directionsLink, safeWebsite, whatsappLink } from '../../utils/business-links';
import { BusinessDetailsComponent } from './business-details.component';
import { provideFakeRepositories } from '../../../../core/testing/fake-repositories';

@Component({ standalone: true, template: '<p>Destination</p>' })
class TestDestinationComponent {}

describe('BusinessDetailsComponent', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessDetailsComponent],
      providers: [
        ...provideFakeRepositories(),
        provideRouter([
          { path: 'businesses/:id', component: BusinessDetailsComponent },
          { path: 'businesses', component: TestDestinationComponent },
          { path: 'my/business/new', component: TestDestinationComponent },
          { path: '**', component: TestDestinationComponent },
        ]),
      ],
    }).compileComponents();
    harness = await RouterTestingHarness.create();
  });

  async function open(id: string): Promise<HTMLElement> {
    await harness.navigateByUrl(`/businesses/${id}`, BusinessDetailsComponent);
    harness.detectChanges();
    return harness.routeNativeElement as HTMLElement;
  }

  const links = (el: HTMLElement) => [...el.querySelectorAll<HTMLAnchorElement>('a')];
  const text = (el: HTMLElement) => el.textContent ?? '';

  it('loads an ACTIVE business with name, category, description and services', async () => {
    const page = await open('1');
    expect(page.querySelectorAll('.header h2').length).toBe(1);
    expect(page.querySelector('.header h2')!.textContent).toContain('Demo Saffron Kitchen');
    expect(text(page)).toContain('Food & Restaurants');
    expect(text(page)).toContain('fictional restaurant');
    expect(text(page)).toContain('Products & services');
    expect(text(page)).toContain('Family Dining');
    expect(text(page)).toContain('Takeaway');
  });

  it('shows business hours including closed days', async () => {
    const page = await open('1');
    expect(text(page)).toContain('Monday');
    expect(text(page)).toContain('09:00 – 20:00');
    expect(text(page)).toMatch(/Sunday\s*Closed/);
  });

  it('shows contact information and conditional actions when data exists', async () => {
    const page = await open('1');
    const hrefs = links(page).map((a) => a.getAttribute('href') ?? '');
    expect(hrefs.some((h) => h.startsWith('tel:+910000000001'))).toBe(true);
    expect(hrefs.some((h) => h.startsWith('https://wa.me/910000000001?text='))).toBe(true);
    expect(hrefs).toContain('mailto:demo-saffron@example.com');
    const website = links(page).find((a) =>
      a.getAttribute('href')?.startsWith('https://example.com'),
    )!;
    expect(website.getAttribute('rel')).toContain('noopener');
    expect(website.getAttribute('target')).toBe('_blank');
    expect(text(page)).toContain('Get directions');
    expect(hrefs.some((h) => h.includes('destination=26.1,87.9'))).toBe(true);
  });

  it('omits Call, WhatsApp, Email and Website when missing', async () => {
    const page = await open('2');
    const hrefs = links(page).map((a) => a.getAttribute('href') ?? '');
    expect(hrefs.some((h) => h.startsWith('tel:'))).toBe(false);
    expect(hrefs.some((h) => h.includes('wa.me'))).toBe(false);
    expect(hrefs.some((h) => h.startsWith('mailto:'))).toBe(false);
    expect(text(page)).not.toContain('Website');
    expect(page.querySelector('app-business-contact')).toBeNull();
    expect(page.querySelector('app-business-hours')).toBeNull();
  });

  it('shows Call when phone exists but not WhatsApp or Email', async () => {
    const page = await open('5');
    const hrefs = links(page).map((a) => a.getAttribute('href') ?? '');
    expect(hrefs.some((h) => h.startsWith('tel:'))).toBe(true);
    expect(hrefs.some((h) => h.includes('wa.me'))).toBe(false);
    expect(hrefs.some((h) => h.startsWith('mailto:'))).toBe(false);
  });

  it('shows Email only when email exists', async () => {
    const page = await open('12');
    expect(
      links(page).some((a) => a.getAttribute('href') === 'mailto:demo-tailor@example.com'),
    ).toBe(true);
    expect(links(page).some((a) => a.getAttribute('href')?.startsWith('tel:'))).toBe(false);
  });

  it('omits directions when neither coordinates nor address exist', () => {
    const base = {
      ...TEST_BUSINESSES[0],
      latitude: undefined,
      longitude: undefined,
      address: '',
      area: '',
    } as Business;
    expect(directionsLink(base)).toBe('');
    expect(directionsLink({ ...base, address: '1 Demo Lane' })).toContain(
      encodeURIComponent('1 Demo Lane'),
    );
  });

  it('rejects unsafe website URLs and encodes WhatsApp text', () => {
    expect(safeWebsite('javascript:alert(1)')).toBe('');
    expect(safeWebsite('example.com')).toBe('https://example.com/');
    expect(whatsappLink('', 'X')).toBe('');
    expect(whatsappLink('+91 000 000', 'A & B')).toContain(encodeURIComponent('A & B'));
  });

  it('renders location fields and the map placeholder without empty labels', async () => {
    const page = await open('1');
    expect(text(page)).toContain('PIN Code');
    expect(text(page)).toContain('000001');
    expect(text(page)).toContain('LOCATION MAP');
    expect(text(page)).toContain('Map coming soon');

    const minimal = await open('2');
    expect(text(minimal)).not.toContain('PIN Code');
  });

  it('skips photos and leads with business details on every business profile', async () => {
    for (let id = 1; id <= 20; id += 1) {
      const page = await open(String(id));
      const main = page.querySelector('.layout > .main')!;

      expect(main.firstElementChild?.classList.contains('header')).toBe(true);
      expect(main.querySelector('.header h2')?.textContent).toContain(`Demo `);
      expect(main.querySelector('app-business-gallery')).toBeNull();
      expect(main.querySelector('tk-image-placeholder')).toBeNull();
    }
  });

  it('shows the unavailable state for an INACTIVE business without private data', async () => {
    const page = await open('21');
    expect(text(page)).toContain('Business unavailable');
    expect(text(page)).toContain(
      'This business is currently not available in the public directory.',
    );
    expect(text(page)).toContain('Back to businesses');
    expect(text(page)).not.toContain('Demo Pocket Tech');
    expect(links(page).some((a) => a.getAttribute('href')?.startsWith('tel:'))).toBe(false);
  });

  it('shows not found for an unknown id', async () => {
    const page = await open('99999');
    expect(text(page)).toContain('Business not found');
    expect(text(page)).toContain(
      "The business you're looking for doesn't exist or is no longer available.",
    );
  });

  it('navigates to the directory from the not found action', async () => {
    const page = await open('99999');
    page.querySelector<HTMLButtonElement>('tk-empty-state button')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/businesses');
  });

  it('renders breadcrumb links and current page', async () => {
    const page = await open('1');
    const nav = page.querySelector('nav[aria-label="Breadcrumb"]')!;
    const crumbs = [...nav.querySelectorAll('a')];
    expect(crumbs[0].textContent).toContain('Businesses');
    const router = TestBed.inject(Router);
    expect(
      router.serializeUrl(
        router.createUrlTree(['/businesses'], { queryParams: { category: 'food-restaurants' } }),
      ),
    ).toBe('/businesses?category=food-restaurants');
    expect(crumbs[1].getAttribute('href')).toBe('/businesses?category=food-restaurants');
    expect(nav.querySelector('[aria-current="page"]')!.textContent).toContain(
      'Demo Saffron Kitchen',
    );
  });

  it('navigates to the new business page from the CTA', async () => {
    const page = await open('1');
    const cta = links(page).find((a) => a.getAttribute('href') === '/my/business/new')!;
    expect(cta).toBeTruthy();
    cta.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/my/business/new');
  });

  it('shows the report prompt', async () => {
    const page = await open('1');
    expect(text(page)).toContain('Is something wrong with this information?');
    expect(text(page)).toContain('Report information');
  });

  it('sets the dynamic title and description', async () => {
    await open('1');
    expect(TestBed.inject(Title).getTitle()).toBe('Demo Saffron Kitchen | Thakurganj Connect');
    expect(TestBed.inject(Meta).getTag('name="description"')!.content).toContain(
      'Fictional restaurant',
    );
  });
});
