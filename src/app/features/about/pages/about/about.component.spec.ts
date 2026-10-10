import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the town overview and requested information sections', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('#about-title')?.textContent).toContain('Your town your story');
    expect(page.querySelector('#discover-title')?.textContent).toContain('Our town, at a glance.');
    expect(page.querySelectorAll('.story-card img')).toHaveLength(0);
    expect(page.textContent).toContain('ठाकुरगंज – हमारी मिट्टी, हमारी पहचान');
    expect(page.textContent).toContain('January 14, 1990');
    expect(page.textContent).toContain('tea gardens in the Thakurganj and Pothia areas');
    expect(page.textContent).toContain('Apne Shehar Ki Apni Jankari.');
    expect(page.textContent).toContain('Connecting People, Places & Businesses.');
    expect(page.querySelector('.hero-visual img')?.getAttribute('src')).toBe(
      '/images/thakurganj-location-map.png',
    );
    expect(page.querySelector('.hero-visual img')?.getAttribute('alt')).toContain(
      'Kishanganj district',
    );
    expect(page.querySelectorAll('.about-content section[aria-labelledby]')).toHaveLength(1);
    expect(page.querySelectorAll('details.story-card')).toHaveLength(6);
  });

  it('uses small icons instead of photographs in the at-a-glance cards', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const titles = Array.from(page.querySelectorAll('.story-card summary strong')).map((el) =>
      el.textContent?.trim(),
    );

    expect(titles).toEqual([
      'Geography & Location',
      'History & Heritage',
      'Culture & Community',
      'Agriculture & Economy',
      'Transport & Connectivity',
      'Our Community Mission',
    ]);
    expect(page.querySelectorAll('.story-card .story-icon')).toHaveLength(6);
  });

  it('links visitors to local businesses, and categories', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('a[href="/businesses"]')?.textContent).toContain(
      'Find local businesses',
    );
    expect(page.querySelector('a[href="/categories"]')?.textContent).toContain('Browse categories');
  });
});
