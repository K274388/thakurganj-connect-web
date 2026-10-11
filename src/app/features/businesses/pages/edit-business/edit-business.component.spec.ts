import { TEST_CATEGORIES } from '../../../../core/testing/fixtures';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By, Meta } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { throwError } from 'rxjs';
import { vi } from 'vitest';
import { emitted } from '../../../../core/testing/emitted';
import { BusinessFormComponent } from '../../components/business-form/business-form.component';
import { BUSINESS_UPDATE_SUCCESS_MESSAGE } from '../../components/business-form/business-form.config';
import { unsavedChangesGuard } from '../../guards/unsaved-changes.guard';
import { Business, CreateBusinessRequest } from '../../models/business.models';
import { BusinessDirectoryComponent } from '../business-directory/business-directory.component';
import { EditBusinessComponent } from './edit-business.component';
import { FakeBusinessRepository, provideFakeRepositories } from '../../../../core/testing/fake-repositories';

@Component({ standalone: true, template: '<p>Destination</p>' })
class TestDestinationComponent {}

const shopping = TEST_CATEGORIES.find((item) => item.slug === 'shopping')!;
const mobile = shopping.subcategories.find((item) => item.slug === 'mobile')!;

const REQUEST: CreateBusinessRequest = {
  name: 'Aaa Edit Me Mobiles',
  categoryId: shopping.id,
  categorySlug: shopping.slug,
  subcategoryId: mobile.id,
  subcategorySlug: mobile.slug,
  description: 'Phones and repairs',
  phone: '9876543210',
  whatsapp: '9876543210',
  email: 'shop@example.com',
  website: 'https://example.com',
  address: '1 Main Road',
  area: 'Bazaar',
  landmark: 'Clock tower',
  pinCode: '854318',
  latitude: 26.1,
  longitude: 87.6,
  services: ['Repairs', 'Accessories'],
  hours: [
    { day: 'monday', openTime: '09:00', closeTime: '20:00', closed: false },
    { day: 'sunday', closed: true },
  ],
};

describe('EditBusinessComponent', () => {
  let harness: RouterTestingHarness;
  let page: HTMLElement;
  let repository: FakeBusinessRepository;
  let owned: Business;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        ...provideFakeRepositories(),
        provideRouter([
          { path: 'my/businesses/:id/edit', component: EditBusinessComponent, canDeactivate: [unsavedChangesGuard] },
          { path: 'my/businesses', component: TestDestinationComponent },
          { path: 'businesses', component: BusinessDirectoryComponent },
          { path: '**', component: TestDestinationComponent },
        ]),
      ],
    }).compileComponents();
    repository = TestBed.inject(FakeBusinessRepository);
    owned = emitted(repository.createBusiness(REQUEST));
    harness = await RouterTestingHarness.create();
  });

  const open = async (id: string | number) => {
    await harness.navigateByUrl(`/my/businesses/${id}/edit`, EditBusinessComponent);
    harness.detectChanges();
    page = harness.routeNativeElement as HTMLElement;
  };
  const el = <T extends HTMLElement = HTMLInputElement>(id: string) => page.querySelector<T>(`#${id}`)!;
  const router = () => TestBed.inject(Router);
  const form = () =>
    (harness.fixture.debugElement.query(By.directive(BusinessFormComponent)).componentInstance as BusinessFormComponent).form;
  const settle = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };
  const fill = (id: string, value: string) => {
    const field = el<HTMLInputElement | HTMLSelectElement>(id);
    field.value = value;
    field.dispatchEvent(new Event(field instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
    harness.detectChanges();
  };
  const click = (selector: string) => {
    page.querySelector<HTMLElement>(selector)!.click();
    harness.detectChanges();
  };
  const submit = () => {
    page.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    harness.detectChanges();
    harness.detectChanges();
  };
  const dialogButton = (label: string) =>
    [...document.querySelectorAll('button')].find((button) => button.textContent!.trim() === label)!;
  const tick = () => new Promise((resolve) => setTimeout(resolve));

  describe('owner access and hydration', () => {
    beforeEach(() => open(owned.id));

    it('shows the edit hero, business summary and a single h1', () => {
      expect(page.querySelectorAll('h1').length).toBe(1);
      expect(page.textContent).toContain('MY BUSINESSES / EDIT');
      expect(page.textContent).toContain('Update the information people see about your business.');
      expect(page.querySelector('.summary-line')!.textContent).toContain('Aaa Edit Me Mobiles');
      expect(page.querySelector('.summary-line')!.textContent).toContain('Bazaar');
      expect(page.querySelector('.status')!.textContent).toContain('ACTIVE');
      expect(page.querySelector('.actions button[type="submit"]')!.textContent!.trim()).toBe('Save changes');
      expect(page.textContent).not.toMatch(/\b(approval|pending|resubmit|review)\b/i);
    });

    it('is noindex', () => {
      expect(TestBed.inject(Meta).getTag('name="robots"')!.content).toBe('noindex, nofollow');
    });

    it('pre-populates basic, contact, location, services and hours values', () => {
      const value = form().getRawValue();
      expect(value.basicInfo).toEqual({
        name: 'Aaa Edit Me Mobiles',
        category: 'shopping',
        subcategory: 'mobile',
        description: 'Phones and repairs',
      });
      expect(value.contact).toMatchObject({ phone: '9876543210', email: 'shop@example.com', website: 'https://example.com' });
      expect(value.location).toEqual({
        address: '1 Main Road', area: 'Bazaar', landmark: 'Clock tower', pinCode: '854318', latitude: 26.1, longitude: 87.6,
      });
      expect(value.services.items).toEqual(['Repairs', 'Accessories']);
      expect(value.hours.length).toBe(7);
      expect(value.hours[0]).toMatchObject({ day: 'monday', openTime: '09:00', closeTime: '20:00', closed: false });
      expect(value.hours[6]).toMatchObject({ day: 'sunday', closed: true });
      expect(el('bf-name').value).toBe('Aaa Edit Me Mobiles');
      expect(page.querySelectorAll('.chip').length).toBe(2);
      expect(form().pristine).toBe(true);
    });

    it('keeps the stored subcategory during hydration and offers only that category\'s subcategories', () => {
      expect(el<HTMLSelectElement>('bf-subcategory').value).toBe('mobile');
      const values = [...el<HTMLSelectElement>('bf-subcategory').options].map((option) => option.value);
      expect(values).toContain('clothing');
      expect(values).not.toContain('restaurant');
    });

    it('clears an incompatible subcategory when the category changes later', () => {
      const other = TEST_CATEGORIES.find((item) => item.slug !== 'shopping' && item.active)!;
      fill('bf-category', other.slug);
      expect(form().controls.basicInfo.controls.subcategory.value).toBe('');
    });

    it('selects Same as phone only when phone and WhatsApp match', () => {
      expect(form().controls.contact.controls.whatsappSameAsPhone.value).toBe(true);
    });

    it('does not select Same as phone, nor overwrite a distinct WhatsApp number', async () => {
      const distinct = emitted(repository.createBusiness({ ...REQUEST, name: 'Distinct WA', whatsapp: '9123456789' }));
      await open(distinct.id);
      expect(form().controls.contact.controls.whatsappSameAsPhone.value).toBe(false);
      expect(form().controls.contact.controls.whatsapp.value).toBe('9123456789');
    });

    it('supports the closed toggle and service changes on hydrated data', () => {
      const sunday = page.querySelectorAll<HTMLElement>('.hours-row')[6];
      expect([...sunday.querySelectorAll<HTMLInputElement>('input[type="time"]')].every((input) => input.disabled)).toBe(true);
      fill('bf-service', 'Repairs');
      click('.add-row button');
      expect(form().controls.services.controls.items.length).toBe(2);
      click('button[aria-label="Remove Repairs"]');
      expect(form().controls.services.controls.items.value).toEqual(['Accessories']);
    });
  });

  describe('saving', () => {
    beforeEach(() => open(owned.id));

    it('updates the shared business, preserving id, ownerId, status and createdAt', async () => {
      fill('bf-name', 'Aaa Edit Me Updated');
      fill('bf-area', 'New Area');
      submit();
      await settle();
      const updated = repository.getBusiness(owned.id)!;
      expect(updated.name).toBe('Aaa Edit Me Updated');
      expect(updated.area).toBe('New Area');
      expect(updated.id).toBe(owned.id);
      expect(updated.ownerId).toBe(1);
      expect(updated.status).toBe('ACTIVE');
      expect(updated.createdAt).toBe(owned.createdAt);
      expect(JSON.stringify(updated).toLowerCase()).not.toMatch(/pending|approv|review/);
      expect(page.querySelector('.success-message')!.textContent).toBe(BUSINESS_UPDATE_SUCCESS_MESSAGE);
      expect(BUSINESS_UPDATE_SUCCESS_MESSAGE).toBe('✓ Business information updated successfully.');
      expect(page.querySelector(`a[href="/businesses/${owned.id}"]`)).not.toBeNull();
      expect(page.querySelector('a[href="/my/businesses"]')).not.toBeNull();
    });

    it('shows the updated active business in the public directory', async () => {
      fill('bf-name', 'Aaa Edit Me Updated');
      submit();
      await settle();
      await router().navigateByUrl('/businesses');
      harness.detectChanges();
      const text = (harness.routeNativeElement as HTMLElement).textContent!;
      expect(text).toContain('Aaa Edit Me Updated');
      expect(text).not.toContain('Aaa Edit Me Mobiles');
    });

    it('marks the form pristine so leaving after success does not prompt', async () => {
      fill('bf-name', 'Aaa Edit Me Updated');
      submit();
      await settle();
      expect(await router().navigateByUrl('/my/businesses')).toBe(true);
    });

    it('returns to the hydrated form with Continue editing', async () => {
      fill('bf-name', 'Aaa Edit Me Updated');
      submit();
      await settle();
      click('.success-actions button');
      expect(el('bf-name').value).toBe('Aaa Edit Me Updated');
      expect(form().pristine).toBe(true);
    });

    it('shows validation errors and does not save when invalid', () => {
      fill('bf-name', '');
      submit();
      expect(page.querySelector('.summary')!.textContent).toContain("We couldn't save your changes yet.");
      expect(page.textContent).toContain('Please enter a business name.');
      expect(repository.getBusiness(owned.id)!.name).toBe('Aaa Edit Me Mobiles');
    });

    it('keeps the form and shows a retryable error when saving fails', async () => {
      vi.spyOn(repository, 'updateBusiness').mockImplementationOnce(() => throwError(() => new Error('boom')));
      fill('bf-name', 'Aaa Unsaved');
      submit();
      const error = page.querySelector('.save-error')!.textContent!;
      expect(error).toContain("We couldn't save your changes.");
      expect(error).toContain('Your edits have not been lost. Please try again.');
      expect(el('bf-name').value).toBe('Aaa Unsaved');
      click('.save-error button');
      await settle();
      expect(page.querySelector('.success')).not.toBeNull();
      expect(repository.getBusiness(owned.id)!.name).toBe('Aaa Unsaved');
    });
  });

  describe('unsaved changes', () => {
    beforeEach(() => open(owned.id));

    it('prompts when dirty and stays on Keep editing', async () => {
      fill('bf-name', 'Half typed');
      click('.actions button');
      await tick();
      harness.detectChanges();
      expect(document.body.textContent).toContain('Discard changes?');
      expect(document.body.textContent).toContain('Your unsaved changes will be lost.');
      dialogButton('Keep editing').click();
      await settle();
      expect(router().url).toBe(`/my/businesses/${owned.id}/edit`);
      expect(el('bf-name').value).toBe('Half typed');
    });

    it('leaves on Discard without saving', async () => {
      fill('bf-name', 'Half typed');
      click('.actions button');
      await tick();
      harness.detectChanges();
      dialogButton('Discard').click();
      await settle();
      expect(router().url).toBe('/my/businesses');
      expect(repository.getBusiness(owned.id)!.name).toBe('Aaa Edit Me Mobiles');
    });

    it('leaves immediately when nothing changed', async () => {
      click('.actions button');
      await settle();
      expect(router().url).toBe('/my/businesses');
    });
  });

  describe('INACTIVE business', () => {
    it('can be edited without being reactivated', async () => {
      await open(21);
      expect(page.querySelector('.status')!.textContent).toContain('INACTIVE');
      expect(page.textContent).toContain('This listing is currently not visible in the public directory.');
      fill('bf-description', 'Updated description');
      submit();
      await settle();
      const updated = repository.findStored(21)!;
      expect(updated.description).toBe('Updated description');
      expect(updated.status).toBe('INACTIVE');
      expect(page.querySelector('.success-message')).not.toBeNull();
      expect(page.querySelector('a[href="/businesses/21"]')).toBeNull();
    });
  });

  describe('blocked access', () => {
    it('blocks editing another user\'s business without rendering the form', async () => {
      const foreign = repository.getBusinesses().find((item) => item.ownerId !== 1)!;
      await open(foreign.id);
      expect(page.textContent).toContain("You can't edit this business.");
      expect(page.textContent).toContain("You don't have permission to manage this listing.");
      expect(page.querySelector('form')).toBeNull();
      expect(page.textContent).not.toContain(foreign.name);
      expect(page.querySelectorAll('h1').length).toBe(1);
      expect(page.querySelector('a[href="/my/businesses"]')!.textContent).toContain('Back to My Businesses');
    });

    it('shows Not found for unknown ids', async () => {
      await open(999999);
      expect(page.textContent).toContain('Business not found');
      expect(page.textContent).toContain("The business you're trying to edit doesn't exist or is no longer available.");
      expect(page.querySelector('form')).toBeNull();
    });
  });
});
