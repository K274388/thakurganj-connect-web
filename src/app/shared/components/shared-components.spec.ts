import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BusinessCardComponent } from './business-card/business-card.component';
import { CategoryCardComponent } from './category-card/category-card.component';
import { EmptyStateComponent } from './empty-state/empty-state.component';
import { ErrorStateComponent } from './error-state/error-state.component';
import { EventCardComponent } from './event-card/event-card.component';
import { FilterPillComponent } from './filter-pill/filter-pill.component';
import { ImagePlaceholderComponent } from './image-placeholder/image-placeholder.component';
import { LoadingComponent } from './loading/loading.component';
import { ModalComponent } from './modal/modal.component';
import { PaginationComponent } from './pagination/pagination.component';
import { PlaceCardComponent } from './place-card/place-card.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { TcButtonComponent } from './button/tc-button.component';
import { ToastComponent } from './toast/toast.component';

describe('shared UI components', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TcButtonComponent,
        SearchBoxComponent,
        CategoryCardComponent,
        BusinessCardComponent,
        PlaceCardComponent,
        ImagePlaceholderComponent,
        EventCardComponent,
        FilterPillComponent,
        ToastComponent,
        ModalComponent,
        PaginationComponent,
        LoadingComponent,
        EmptyStateComponent,
        ErrorStateComponent,
      ],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders a disabled button when disabled', () => {
    const fixture = TestBed.createComponent(TcButtonComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });

  it('submits the search query', () => {
    const fixture = TestBed.createComponent(SearchBoxComponent);
    fixture.componentRef.setInput('value', 'local bakery');
    const searches: string[] = [];
    fixture.componentInstance.search.subscribe((term) => searches.push(term));
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(searches).toEqual(['local bakery']);
  });

  it('renders category label and variant', () => {
    const fixture = TestBed.createComponent(CategoryCardComponent);
    fixture.componentRef.setInput('category', {
      id: 1,
      name: 'Food & Restaurants',
      colorVariant: 'yellow',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Food & Restaurants');
    expect(fixture.nativeElement.querySelector('a').classList).toContain('variant-yellow');
  });

  it('renders business information and a call action', () => {
    const fixture = TestBed.createComponent(BusinessCardComponent);
    fixture.componentRef.setInput('business', {
      id: 1,
      name: 'ABC Restaurant',
      category: 'Restaurant',
      area: 'Main Road',
      phone: '+911234567890',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('ABC Restaurant');
    expect(fixture.nativeElement.querySelector('a[href^="tel:"]').getAttribute('href')).toBe(
      'tel:+911234567890',
    );
  });

  it('shows category artwork until a business photo is available', () => {
    const fixture = TestBed.createComponent(BusinessCardComponent);
    fixture.componentRef.setInput('business', {
      id: 2,
      name: 'Mithai House',
      category: 'Food & Restaurants',
      subcategoryName: 'Sweets',
    });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.category-artwork .artwork-icon')?.textContent,
    ).toBe('🍬');
    expect(fixture.nativeElement.querySelector('.artwork-label')?.textContent).toBe('Sweets');

    fixture.componentRef.setInput('business', {
      id: 2,
      name: 'Mithai House',
      category: 'Food & Restaurants',
      subcategoryName: 'Sweets',
      imageUrl: '/images/mithai-house.webp',
    });
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('tk-image-placeholder img')?.getAttribute('src'),
    ).toBe('/images/mithai-house.webp');
    expect(fixture.nativeElement.querySelector('.category-artwork')).toBeNull();
  });

  it('renders place information', () => {
    const fixture = TestBed.createComponent(PlaceCardComponent);
    fixture.componentRef.setInput('place', {
      id: 5,
      name: 'Thakurganj Junction',
      category: 'Transport',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Thakurganj Junction');
  });

  it('renders a fallback for an unavailable image', () => {
    const fixture = TestBed.createComponent(ImagePlaceholderComponent);
    fixture.componentRef.setInput('src', '/missing-image.png');
    fixture.componentRef.setInput('alt', 'Town market');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="img"]').getAttribute('aria-label')).toBe(
      'Town market',
    );
  });

  it('renders event title and venue', () => {
    const fixture = TestBed.createComponent(EventCardComponent);
    fixture.componentRef.setInput('event', {
      id: 10,
      title: 'Community Event',
      date: '2026-10-15T12:00:00',
      venue: 'Club Field',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Community Event');
    expect(fixture.nativeElement.textContent).toContain('Club Field');
  });

  it('emits when a filter pill is selected', () => {
    const fixture = TestBed.createComponent(FilterPillComponent);
    fixture.componentRef.setInput('label', 'Markets');
    let selected = false;
    fixture.componentInstance.selected.subscribe(() => (selected = true));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(selected).toBe(true);
  });

  it('exposes the selected toast role and message', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.componentRef.setInput('kind', 'success');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('✓');
  });

  it('emits confirmation from an open modal', () => {
    const fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Delete Business?');
    let confirmed = false;
    fixture.componentInstance.confirmed.subscribe(() => (confirmed = true));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Delete Business?');
    fixture.nativeElement.querySelector('.tk-button-danger').click();
    expect(confirmed).toBe(true);
  });

  it('emits a requested pagination page', () => {
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('totalPages', 4);
    let requestedPage = 0;
    fixture.componentInstance.pageChange.subscribe((page) => (requestedPage = page));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button[aria-label="Page 3"]').click();
    expect(requestedPage).toBe(3);
  });

  it('renders an accessible loading status', () => {
    const fixture = TestBed.createComponent(LoadingComponent);
    fixture.componentRef.setInput('label', 'Loading places');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').getAttribute('aria-label')).toBe(
      'Loading places',
    );
  });

  it('emits an empty-state action', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('actionLabel', 'Try another search');
    let invoked = false;
    fixture.componentInstance.action.subscribe(() => (invoked = true));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(invoked).toBe(true);
  });

  it('emits a retry action from the error state', () => {
    const fixture = TestBed.createComponent(ErrorStateComponent);
    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(retried).toBe(true);
  });
});
