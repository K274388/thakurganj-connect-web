import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    page = fixture.nativeElement;
  });

  it('renders the hero and local images', () => {
    expect(page.querySelector('h1')?.textContent).toContain('Thakurganj');
    expect(page.querySelectorAll('img').length).toBeGreaterThanOrEqual(10);
  });

  it('renders quick links, categories and places with router links', () => {
    expect(page.querySelectorAll('.quick-links a').length).toBe(8);
    expect(page.querySelectorAll('.category-grid a').length).toBe(8);
    expect(page.querySelectorAll('.place-grid a').length).toBe(5);
    expect(page.querySelector<HTMLAnchorElement>('.cta a')?.getAttribute('href')).toBe('/my/business/new');
  });

  it('points the homepage business CTA to the registration page', () => {
    expect(page.querySelector<HTMLAnchorElement>('.cta a')?.getAttribute('href')).toBe('/my/business/new');
  });
});
