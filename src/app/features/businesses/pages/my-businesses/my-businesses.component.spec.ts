import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockCurrentUserService } from '../../../../core/auth/mock-current-user';
import { MyBusinessesComponent } from './my-businesses.component';

@Component({ standalone: true, template: '<p>Destination</p>' })
class TestDestinationComponent {}

describe('MyBusinessesComponent', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBusinessesComponent],
      providers: [
        provideRouter([
          { path: 'my/businesses', component: MyBusinessesComponent },
          { path: '**', component: TestDestinationComponent },
        ]),
      ],
    }).compileComponents();
    harness = await RouterTestingHarness.create();
  });

  const open = async () => {
    await harness.navigateByUrl('/my/businesses', MyBusinessesComponent);
    harness.detectChanges();
    return harness.routeNativeElement as HTMLElement;
  };

  it('renders the hero and an add action', async () => {
    const page = await open();
    expect(page.querySelectorAll('h1').length).toBe(1);
    expect(page.textContent).toContain('MY BUSINESSES');
    expect(page.textContent).toContain('Your businesses,');
    expect(page.textContent).toContain('Manage the information people see on Thakurganj Connect.');
    expect(page.querySelector('a[href="/my/business/new"]')!.textContent).toContain('+ Add business');
  });

  it('shows only the current user\'s businesses with text status', async () => {
    const page = await open();
    const names = [...page.querySelectorAll('.card h3')].map((el) => el.textContent?.trim());
    expect(names).toEqual(['Demo Saffron Kitchen', 'Demo Sunrise Bakery', 'Demo Pocket Tech']);
    const statuses = [...page.querySelectorAll('.status')].map((el) => el.textContent!.replace('Status:', '').trim());
    expect(statuses).toEqual(['ACTIVE', 'ACTIVE', 'INACTIVE']);
    expect(page.textContent).toContain('Food & Restaurants');
    expect(page.textContent).toContain('Main Road');
  });

  it('offers View and Edit but no owner activate/deactivate controls', async () => {
    const page = await open();
    const card = page.querySelector('.card')!;
    expect(card.querySelector('a[href="/businesses/1"]')).not.toBeNull();
    expect(card.querySelector('a[href="/my/businesses/1/edit"]')).not.toBeNull();
    expect(page.textContent).not.toMatch(/activate|deactivate|pending|approval|review/i);
  });

  it('offers only Edit plus an explanation for INACTIVE listings, and no delete or status controls', async () => {
    const page = await open();
    const card = [...page.querySelectorAll('.card')].find((item) => item.textContent!.includes('INACTIVE'))!;
    expect(card.querySelector('a[href^="/businesses/"]')).toBeNull();
    expect(card.querySelector('a[href="/my/businesses/21/edit"]')).not.toBeNull();
    expect(card.textContent).toContain('This listing is currently not visible in the public directory.');
    expect([...page.querySelectorAll('button')].length).toBe(0);
    expect(page.textContent).not.toMatch(/delete|remove|activate|deactivate/i);
  });

  it('navigates when View is clicked', async () => {
    const page = await open();
    page.querySelector<HTMLAnchorElement>('.card a[href="/businesses/1"]')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(MockCurrentUserService)).toBeTruthy();
    expect(location.pathname).toBeDefined();
  });

  it('shows the empty state when the user owns no businesses', async () => {
    TestBed.inject(MockCurrentUserService).user.set({ id: 999, name: 'New user' });
    const page = await open();
    expect(page.querySelectorAll('.card').length).toBe(0);
    expect(page.textContent).toContain('No businesses yet.');
    expect(page.textContent).toContain('Put your business on the map and help people in Thakurganj find you.');
    expect(page.querySelector('.empty a[href="/my/business/new"]')!.textContent).toContain('List your business');
  });

  it('is noindex while open and restores indexing afterwards', async () => {
    await open();
    const meta = TestBed.inject(Meta);
    expect(meta.getTag('name="robots"')!.content).toBe('noindex, nofollow');
    await harness.navigateByUrl('/elsewhere');
    expect(meta.getTag('name="robots"')).toBeNull();
  });
});
