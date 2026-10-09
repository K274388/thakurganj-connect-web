import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { MOCK_BUSINESSES } from '../../../businesses/data/business.mock';
import { Business } from '../../../businesses/models/business.models';
import { BUSINESS_CATEGORIES } from '../../data/category.mock';
import { CategoryDetailsComponent } from './category-details.component';

@Component({ standalone: true, template: '<p>Destination</p>' })
class TestDestinationComponent {}

describe('CategoryDetailsComponent', () => {
  let harness: RouterTestingHarness;
  let component: CategoryDetailsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryDetailsComponent],
      providers: [
        provideRouter([
          { path: 'categories/:slug', component: CategoryDetailsComponent },
          { path: '**', component: TestDestinationComponent },
        ]),
      ],
    }).compileComponents();
    harness = await RouterTestingHarness.create();
  });

  async function open(slug: string): Promise<HTMLElement> {
    component = await harness.navigateByUrl(`/categories/${slug}`, CategoryDetailsComponent);
    harness.detectChanges();
    return harness.routeNativeElement as HTMLElement;
  }

  const text = (el: HTMLElement) => el.textContent ?? '';
  const router = () => TestBed.inject(Router);

  it('loads a valid category with breadcrumb, description and count', async () => {
    const page = await open('food-restaurants');
    expect(page.querySelectorAll('h1').length).toBe(1);
    expect(page.querySelector('h1')!.textContent).toContain('Food & Restaurants');
    expect(text(page)).toContain('Restaurants, food shops and local places to eat.');
    expect(text(page)).toContain('4 local businesses');
    const crumbs = [...page.querySelectorAll('nav[aria-label="Breadcrumb"] li')].map((li) => li.textContent?.trim());
    expect(crumbs).toEqual(['Home', 'Categories', 'Food & Restaurants']);
    expect(page.querySelector('[aria-current="page"]')!.textContent).toContain('Food & Restaurants');
  });

  it('sets dynamic SEO title and description from category data', async () => {
    await open('shopping');
    expect(TestBed.inject(Title).getTitle()).toBe('Shopping in Thakurganj | Thakurganj Connect');
    expect(TestBed.inject(Meta).getTag('name="description"')!.content).toContain('Clothing, groceries');
  });

  it('lists active subcategories in displayOrder with counts', async () => {
    const page = await open('food-restaurants');
    const links = [...page.querySelectorAll('.type-link')];
    expect(links.map((link) => link.querySelector('.type-name')!.textContent)).toEqual([
      'Restaurant', 'Dhaba', 'Bakery', 'Sweets', 'Tea Shop', 'Fast Food',
    ]);
    expect(links[0].textContent).toContain('1 business');
    expect(links[0].textContent).not.toContain('1 businesses');
    expect(links[1].textContent).toContain('0 businesses');
  });

  it('hides inactive subcategories and honors subcategory displayOrder', async () => {
    const page = await open('food-restaurants');
    component.allCategories.set(
      BUSINESS_CATEGORIES.map((category) =>
        category.slug !== 'food-restaurants'
          ? category
          : {
              ...category,
              subcategories: category.subcategories.map((sub) =>
                sub.slug === 'dhaba' ? { ...sub, active: false } : sub.slug === 'bakery' ? { ...sub, displayOrder: 0 } : sub,
              ),
            },
      ),
    );
    harness.detectChanges();
    const names = [...page.querySelectorAll('.type-name')].map((el) => el.textContent);
    expect(names[0]).toBe('Bakery');
    expect(names).not.toContain('Dhaba');
  });

  it('links subcategories to directory query parameters', async () => {
    const page = await open('food-restaurants');
    const bakery = [...page.querySelectorAll<HTMLAnchorElement>('.type-link')].find((a) => a.textContent?.includes('Bakery'))!;
    expect(bakery.getAttribute('href')).toBe('/businesses?category=food-restaurants&subcategory=bakery');
    bakery.click();
    await harness.fixture.whenStable();
    expect(router().url).toBe('/businesses?category=food-restaurants&subcategory=bakery');
  });

  it('previews only ACTIVE businesses using the shared business card', async () => {
    const page = await open('shopping');
    expect(page.querySelectorAll('tk-business-card').length).toBe(4);
    expect(text(page)).not.toContain('Demo Pocket Tech');
  });

  it('limits the preview to six businesses', async () => {
    const page = await open('food-restaurants');
    const extra = Array.from({ length: 5 }, (_, index) => ({ ...MOCK_BUSINESSES[0], id: 200 + index })) as Business[];
    component.businesses.set([...MOCK_BUSINESSES, ...extra]);
    harness.detectChanges();
    expect(page.querySelectorAll('tk-business-card').length).toBe(6);
  });

  it('links View all to the category-filtered directory', async () => {
    const page = await open('food-restaurants');
    const viewAll = page.querySelector<HTMLAnchorElement>('.view-all a')!;
    expect(viewAll.textContent).toContain('View all Food & Restaurants businesses →');
    viewAll.click();
    await harness.fixture.whenStable();
    expect(router().url).toBe('/businesses?category=food-restaurants');
  });

  it('shows the no-businesses state with a List your business link', async () => {
    const page = await open('finance');
    expect(text(page)).toContain('0 local businesses');
    expect(text(page)).toContain('No businesses listed in this category yet.');
    expect(text(page)).toContain('Own a local business in this category?');
    expect(page.querySelector('.no-businesses a')!.getAttribute('href')).toBe('/my/business/new');
    expect(page.querySelectorAll('tk-business-card').length).toBe(0);
  });

  it('shows Category not found for an unknown slug and navigates back', async () => {
    const page = await open('does-not-exist');
    expect(text(page)).toContain('Category not found');
    expect(text(page)).toContain("The category you're looking for doesn't exist or is no longer available.");
    page.querySelector<HTMLButtonElement>('tk-empty-state button')!.click();
    await harness.fixture.whenStable();
    expect(router().url).toBe('/categories');
  });

  it('treats an inactive category as unavailable without exposing its content', async () => {
    const page = await open('shopping');
    component.allCategories.set(
      BUSINESS_CATEGORIES.map((category) => (category.slug === 'shopping' ? { ...category, active: false } : category)),
    );
    harness.detectChanges();
    expect(text(page)).toContain('Category unavailable');
    expect(text(page)).toContain('This category is currently not available.');
    expect(page.querySelectorAll('tk-business-card').length).toBe(0);
    expect(page.querySelector('.type-link')).toBeNull();
  });
});
