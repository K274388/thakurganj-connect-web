import { TEST_CATEGORIES } from '../../../../core/testing/fixtures';
import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { CategoriesComponent } from './categories.component';
import { provideFakeRepositories } from '../../../../core/testing/fake-repositories';

@Component({ standalone: true, template: '<p>Destination</p>' })
class TestDestinationComponent {}

describe('CategoriesComponent', () => {
  let harness: RouterTestingHarness;
  let component: CategoriesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [
        ...provideFakeRepositories(),
        provideRouter([
          { path: 'categories', component: CategoriesComponent },
          { path: '**', component: TestDestinationComponent },
        ]),
      ],
    }).compileComponents();
    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/categories', CategoriesComponent);
    harness.detectChanges();
  });

  const page = () => harness.routeNativeElement as HTMLElement;
  const names = () => [...page().querySelectorAll('tk-category-card .name')].map((el) => el.textContent?.trim());

  it('renders the hero with one H1 and the breadcrumb', () => {
    expect(page().querySelectorAll('h1').length).toBe(1);
    expect(page().querySelector('h1')!.textContent).toContain('What do you need today?');
    expect(page().textContent).toContain('EXPLORE BUSINESSES');
    expect(page().textContent).toContain('Browse shops, services and local businesses by category.');
    expect(page().querySelector('nav[aria-label="Breadcrumb"] [aria-current="page"]')!.textContent).toContain('Categories');
  });

  it('renders all eight active categories in displayOrder', () => {
    expect(names()).toEqual([
      'Food & Restaurants', 'Shopping', 'Health', 'Services', 'Education', 'Automobile', 'Home Services', 'Finance',
    ]);
  });

  it('hides inactive categories and respects displayOrder changes', () => {
    component.allCategories.set(
      TEST_CATEGORIES.map((item) =>
        item.slug === 'health' ? { ...item, active: false } : item.slug === 'finance' ? { ...item, displayOrder: 0 } : item,
      ),
    );
    harness.detectChanges();
    expect(names()[0]).toBe('Finance');
    expect(names()).not.toContain('Health');
    expect(names().length).toBe(7);
  });

  it('shows ACTIVE business counts and zero-business categories', () => {
    const text = (slug: string) =>
      page().querySelector<HTMLAnchorElement>(`tk-category-card a[href="/categories/${slug}"]`)!.textContent!;
    expect(text('food-restaurants')).toContain('4 businesses');
    expect(text('shopping')).toContain('4 businesses');
    expect(text('home-services')).toContain('0 businesses');
    expect(text('finance')).toContain('0 businesses');
    component.businesses.update((list) => list.filter((item) => item.id === 1));
    harness.detectChanges();
    expect(text('food-restaurants')).toContain('1 business');
    expect(text('food-restaurants')).not.toContain('1 businesses');
  });

  it('renders description and Explore action on each card', () => {
    const first = page().querySelector('tk-category-card')!;
    expect(first.textContent).toContain('Restaurants, food shops and local places to eat.');
    expect(first.textContent).toContain('Explore →');
    expect(first.querySelector('.icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('navigates to the category slug route', async () => {
    page().querySelector<HTMLAnchorElement>('tk-category-card a[href="/categories/shopping"]')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/categories/shopping');
  });

  it('uses data-driven visual variants rather than child position', () => {
    const link = (slug: string) => page().querySelector(`tk-category-card a[href="/categories/${slug}"]`)!;
    expect(link('food-restaurants').classList).toContain('variant-black');
    expect(link('shopping').classList).toContain('variant-light-yellow');
    expect(link('health').classList).toContain('variant-magenta');
    expect(link('services').classList).toContain('variant-light-gray');
    expect(link('education').classList).toContain('variant-yellow');
  });

  it('includes the business CTA and meta description', () => {
    expect(page().querySelector('a[href="/my/business/new"]')).not.toBeNull();
    expect(TestBed.inject(Meta).getTag('name="description"')!.content).toContain('Browse restaurants, shops');
  });
});
