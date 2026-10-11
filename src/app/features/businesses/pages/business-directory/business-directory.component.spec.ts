import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { BusinessDirectoryComponent } from './business-directory.component';
import { provideFakeRepositories } from '../../../../core/testing/fake-repositories';

@Component({ standalone: true, template: '<p>Destination</p>' })
class TestDestinationComponent {}

describe('BusinessDirectoryComponent', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessDirectoryComponent],
      providers: [
        ...provideFakeRepositories(),
        provideRouter([
          { path: 'businesses', component: BusinessDirectoryComponent },
          { path: 'businesses/:id', component: TestDestinationComponent },
          { path: 'my/business/new', component: TestDestinationComponent },
          { path: '**', component: TestDestinationComponent },
        ]),
      ],
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/businesses', BusinessDirectoryComponent);
    router = TestBed.inject(Router);
    harness.detectChanges();
  });

  function page(): HTMLElement {
    return harness.routeNativeElement as HTMLElement;
  }

  async function navigate(url: string): Promise<void> {
    await harness.navigateByUrl(url, BusinessDirectoryComponent);
    harness.detectChanges();
  }

  async function settle(): Promise<void> {
    await harness.fixture.whenStable();
    harness.detectChanges();
  }

  it('renders hero, categories and business cards', () => {
    expect(page().querySelector('h1')?.textContent).toContain('What are you looking for?');
    expect(page().querySelectorAll('.cat').length).toBe(8);
    expect(page().textContent).toContain('20 businesses found');
    expect(page().querySelectorAll('.business').length).toBe(12);
  });

  it('selecting a category filters and toggles off', async () => {
    page().querySelectorAll<HTMLButtonElement>('.cat')[0].click();
    await settle();
    expect(router.url).toContain('category=food-restaurants');
    expect(page().querySelectorAll('.business').length).toBe(4);
    expect(page().querySelectorAll('.sub').length).toBeGreaterThan(1);

    page().querySelector<HTMLButtonElement>('.cat[aria-pressed="true"]')!.click();
    await settle();
    expect(router.url).not.toContain('category=');
  });

  it('selecting a subcategory updates the query', async () => {
    await navigate('/businesses?category=food-restaurants');
    page().querySelectorAll<HTMLButtonElement>('.sub')[1].click();
    await settle();
    expect(router.url).toContain('subcategory=');
  });

  it('search clears the category and filters results', async () => {
    await navigate('/businesses?category=food-restaurants');
    const input = page().querySelector<HTMLInputElement>('.search input')!;
    input.value = 'zzzz-no-match';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    expect(router.url).toContain('search=zzzz-no-match');
    expect(router.url).not.toContain('category=');
    expect(page().querySelector('.empty')).not.toBeNull();
  });

  it('sort and pagination update the query', async () => {
    const sort = page().querySelector<HTMLSelectElement>('select[aria-label="Sort businesses"]')!;
    sort.value = 'name-desc';
    sort.dispatchEvent(new Event('change', { bubbles: true }));
    await settle();
    expect(router.url).toContain('sort=name-desc');

    await navigate('/businesses?page=2');
    expect(page().querySelectorAll('.business').length).toBe(8);
  });

  it('show all resets filters', async () => {
    await navigate('/businesses?category=shopping&sort=newest');
    page().querySelector<HTMLButtonElement>('.linkbtn')!.click();
    await settle();
    expect(router.url).toBe('/businesses');
  });

  it('links to business details and the listing form', () => {
    const hrefs = [...page().querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs.some((h) => /^\/businesses\/\d+$/.test(h ?? ''))).toBe(true);
    expect(hrefs).toContain('/my/business/new');
  });
});
