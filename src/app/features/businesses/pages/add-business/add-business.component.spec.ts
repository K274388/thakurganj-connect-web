import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By, Meta } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { throwError } from 'rxjs';
import { vi } from 'vitest';
import { BusinessBasicInfoFormComponent } from '../../components/business-basic-info-form/business-basic-info-form.component';
import { BusinessFormComponent } from '../../components/business-form/business-form.component';
import { BUSINESS_SUCCESS_MESSAGE } from '../../components/business-form/business-form.config';
import { BusinessRepository } from '../../data/business.repository';
import { unsavedChangesGuard } from '../../guards/unsaved-changes.guard';
import { BusinessDirectoryComponent } from '../business-directory/business-directory.component';
import { AddBusinessComponent } from './add-business.component';
import { BUSINESS_CATEGORIES } from '../../../categories/data/category.mock';

@Component({ standalone: true, template: '<p>Destination</p>' })
class TestDestinationComponent {}

describe('AddBusinessComponent', () => {
  let harness: RouterTestingHarness;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'my/business/new',
            component: AddBusinessComponent,
            canDeactivate: [unsavedChangesGuard],
          },
          { path: 'my/businesses', component: TestDestinationComponent },
          { path: 'businesses', component: BusinessDirectoryComponent },
          { path: '**', component: TestDestinationComponent },
        ]),
      ],
    }).compileComponents();
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/my/business/new', AddBusinessComponent);
    harness.detectChanges();
    page = harness.routeNativeElement as HTMLElement;
  });

  const el = <T extends HTMLElement = HTMLInputElement>(id: string) =>
    page.querySelector<T>(`#${id}`)!;
  const router = () => TestBed.inject(Router);
  const repository = () => TestBed.inject(BusinessRepository);
  const form = () =>
    (
      harness.fixture.debugElement.query(By.directive(BusinessFormComponent))
        .componentInstance as BusinessFormComponent
    ).form;
  const settle = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };
  const fill = (id: string, value: string) => {
    const field = el<HTMLInputElement | HTMLSelectElement>(id);
    field.value = value;
    field.dispatchEvent(
      new Event(field instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }),
    );
    harness.detectChanges();
  };
  const blur = (id: string) => {
    el(id).dispatchEvent(new Event('blur'));
    harness.detectChanges();
  };
  const click = (selector: string) => {
    page.querySelector<HTMLElement>(selector)!.click();
    harness.detectChanges();
  };
  const submit = () => {
    page
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    harness.detectChanges();
    harness.detectChanges();
  };
  const fillValid = (name = 'Aaa Fresh Tea') => {
    fill('bf-name', name);
    fill('bf-category', 'shopping');
    fill('bf-phone', '9876543210');
    fill('bf-area', 'Main Market');
  };
  const dialogButton = (label: string) =>
    [...document.querySelectorAll('button')].find(
      (button) => button.textContent!.trim() === label,
    )!;

  it('renders the redesigned quick registration page and actions without approval wording', () => {
    expect(page.querySelectorAll('h1').length).toBe(1);
    expect(page.textContent).toContain('YOUR CITY. YOUR BUSINESS. YOUR PEOPLE.');
    expect(page.querySelector('h1')?.textContent).toContain('Apna kaam, sabko batao.');
    expect(page.querySelector('.intro-hindi')?.textContent).toContain(
      'आपकी पहचान, आपके शहर के नाम!',
    );
    expect(page.querySelector('.intro-hindi')?.textContent).toContain(
      'अपना व्यवसाय या पेशा रजिस्टर करें, ताकि ठाकुरगंज के लोग आप तक आसानी से पहुँच सकें',
    );
    expect(page.textContent).toContain('Get discovered locally');
    expect(page.textContent).toContain('Quick Register');
    expect(page.textContent).toContain('Add More Details');
    const legends = [...page.querySelectorAll('legend')].map((item) =>
      item.textContent!.replace(/\s+/g, ' ').trim(),
    );
    expect(legends.length).toBe(3);
    expect(legends[0]).toContain('Basic information');
    expect(page.querySelector('#bf-phone')).not.toBeNull();
    expect(page.querySelector('#bf-area')).not.toBeNull();
    expect(page.querySelector('#bf-email')).toBeNull();
    page.querySelector<HTMLButtonElement>('.tabs button:last-child')!.click();
    harness.detectChanges();
    expect(page.querySelectorAll('legend').length).toBe(6);
    expect(page.querySelector('#bf-email')).not.toBeNull();
    expect(
      [...page.querySelectorAll<HTMLInputElement>('.media-grid input[type="file"]')].every(
        (input) => input.matches(':disabled'),
      ),
    ).toBe(true);
    expect(page.querySelector('#bf-photos-note')?.textContent).toContain(
      'Photo uploads are currently disabled.',
    );
    expect(page.querySelector<HTMLAnchorElement>('#bf-photos-note a')?.getAttribute('href')).toBe(
      'mailto:hello@thakurganj.connect',
    );
    expect(legends[2]).toContain('Location');
    expect(
      [...page.querySelectorAll('.actions button')].map((item) => item.textContent!.trim()),
    ).toEqual(['Cancel', 'Add your business']);
    expect(page.textContent).not.toMatch(/approval|pending|awaiting/i);
  });

  it('builds a nested reactive form and is noindex', () => {
    expect(Object.keys(form().controls)).toEqual([
      'basicInfo',
      'contact',
      'location',
      'services',
      'hours',
      'media',
    ]);
    expect(form().controls.hours.length).toBe(7);
    expect(TestBed.inject(Meta).getTag('name="robots"')!.content).toBe('noindex, nofollow');
  });

  it('updates the listing preview as required fields are entered', () => {
    fill('bf-name', 'Sharma Mobile Repair');
    fill('bf-category', 'shopping');
    fill('bf-subcategory', 'mobile');
    fill('bf-phone', '9876543210');
    fill('bf-area', 'Station Road');
    expect(page.querySelector('.preview')?.textContent).toContain('Sharma Mobile Repair');
    expect(page.querySelector('.preview')?.textContent).toContain('Shopping · Mobile');
    expect(page.querySelector('.preview')?.textContent).toContain('Station Road');
    expect(page.querySelector('.preview')?.textContent).toContain('9876543210');
  });

  it('lists the centralized active categories', () => {
    const values = [...el<HTMLSelectElement>('bf-category').options]
      .map((option) => option.value)
      .filter(Boolean);
    expect(values).toEqual(
      BUSINESS_CATEGORIES.filter((item) => item.active).map((item) => item.slug),
    );
  });

  it('hides inactive categories and subcategories', () => {
    const fixture = TestBed.createComponent(BusinessBasicInfoFormComponent);
    fixture.componentRef.setInput('group', form().controls.basicInfo);
    fixture.componentRef.setInput(
      'categories',
      BUSINESS_CATEGORIES.map((item, index) => (index === 0 ? { ...item, active: false } : item)),
    );
    fixture.detectChanges();
    const values = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLOptionElement>(
        '#bf-category option',
      ),
    ].map((option) => option.value);
    expect(values).not.toContain(BUSINESS_CATEGORIES[0].slug);
  });

  it('derives subcategories from the category and clears them on change', () => {
    expect(el<HTMLSelectElement>('bf-subcategory').textContent).toContain(
      'Select a category first',
    );
    fill('bf-category', 'shopping');
    const values = [...el<HTMLSelectElement>('bf-subcategory').options].map(
      (option) => option.value,
    );
    expect(values).toContain('mobile');
    fill('bf-subcategory', 'mobile');
    expect(form().controls.basicInfo.controls.subcategory.value).toBe('mobile');
    const other = BUSINESS_CATEGORIES.find((item) => item.slug !== 'shopping' && item.active)!;
    fill('bf-category', other.slug);
    expect(form().controls.basicInfo.controls.subcategory.value).toBe('');
    expect(
      [...el<HTMLSelectElement>('bf-subcategory').options].map((option) => option.value),
    ).not.toContain('mobile');
  });

  it('requires a phone number and validates optional contact fields only when populated', () => {
    blur('bf-phone');
    expect(page.textContent).toContain('Please enter a contact number.');
    fill('bf-phone', '9876543210');
    expect(page.textContent).not.toContain('Please enter a contact number.');
    page.querySelector<HTMLButtonElement>('.tabs button:last-child')!.click();
    harness.detectChanges();
    for (const id of ['bf-email', 'bf-website']) blur(id);
    expect(page.querySelectorAll('.error').length).toBe(0);
    fill('bf-email', 'not-an-email');
    blur('bf-email');
    expect(page.querySelectorAll('.error').length).toBe(1);
    expect(el('bf-email').getAttribute('aria-invalid')).toBe('true');
    expect(el('bf-email').getAttribute('aria-describedby')).toBe('bf-email-error');
    fill('bf-email', 'me@example.com');
    expect(page.querySelectorAll('.error').length).toBe(0);
  });

  it('keeps WhatsApp synchronized with phone when Same as phone is selected', () => {
    click('.tabs button:last-child');
    fill('bf-phone', '9876543210');
    el('bf-whatsapp-same').click();
    harness.detectChanges();
    expect(form().controls.contact.controls.whatsapp.value).toBe('9876543210');
    fill('bf-phone', '9123456789');
    expect(form().controls.contact.controls.whatsapp.value).toBe('9123456789');
  });

  describe('services', () => {
    beforeEach(() => click('.tabs button:last-child'));

    const items = () => form().controls.services.controls.items.value;
    const add = (value: string) => {
      fill('bf-service', value);
      click('.add-row button');
    };

    it('adds trimmed values, ignores empty and duplicate values, and removes', () => {
      add('  Tea ');
      add('   ');
      add('Tea');
      expect(items()).toEqual(['Tea']);
      expect(page.textContent).toContain('already been added');
      add('Snacks');
      expect(page.querySelectorAll('.chip').length).toBe(2);
      click('button[aria-label="Remove Tea"]');
      expect(items()).toEqual(['Snacks']);
    });

    it('adds with Enter without submitting', () => {
      fill('bf-service', 'Breakfast');
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      el('bf-service').dispatchEvent(event);
      harness.detectChanges();
      expect(items()).toEqual(['Breakfast']);
      expect(event.defaultPrevented).toBe(true);
      expect(page.querySelector('.summary')).toBeNull();
    });
  });

  describe('business hours', () => {
    beforeEach(() => click('.tabs button:last-child'));

    const rows = () => [...page.querySelectorAll<HTMLElement>('.hours-row')];

    it('renders seven days and disables times for closed days', () => {
      expect(rows().length).toBe(7);
      rows()[6].querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
      harness.detectChanges();
      expect(
        [...rows()[6].querySelectorAll<HTMLInputElement>('input[type="time"]')].every(
          (input) => input.disabled,
        ),
      ).toBe(true);
    });

    it('applies Monday hours to weekdays only', () => {
      const monday = rows()[0].querySelectorAll<HTMLInputElement>('input[type="time"]');
      monday[0].value = '09:00';
      monday[0].dispatchEvent(new Event('input', { bubbles: true }));
      monday[1].value = '20:00';
      monday[1].dispatchEvent(new Event('input', { bubbles: true }));
      const apply = [...page.querySelectorAll('button')].find((button) =>
        button.textContent!.includes('Apply Monday'),
      )!;
      apply.click();
      harness.detectChanges();
      const values = form().controls.hours.getRawValue();
      expect(values[4].openTime).toBe('09:00');
      expect(values[5].openTime).toBeFalsy();
    });
  });

  describe('submission', () => {
    it('shows summary and field errors when invalid, without creating a business', () => {
      const before = repository().getBusinesses().length;
      submit();
      expect(page.querySelector('.summary')!.textContent).toContain(
        "We couldn't add your business yet.",
      );

      expect(page.textContent).toContain('Please enter a business name.');
      expect(el('bf-name').getAttribute('aria-invalid')).toBe('true');
      expect(repository().getBusinesses().length).toBe(before);
    });

    it('creates an ACTIVE business, shows the exact message and exposes it in the directory', async () => {
      fillValid();
      submit();
      await settle();
      const business = repository()
        .getBusinesses()
        .find((item) => item.name === 'Aaa Fresh Tea')!;
      expect(business.status).toBe('ACTIVE');
      expect(business.ownerId).toBe(1);
      expect(page.querySelector('.success-message')!.textContent).toBe(BUSINESS_SUCCESS_MESSAGE);
      expect(BUSINESS_SUCCESS_MESSAGE).toBe(
        '✓ Your business is live. People can now find it on Thakurganj Connect.',
      );
      expect(page.textContent).not.toMatch(/approval|pending/i);
      expect(page.querySelector(`a[href="/businesses/${business.id}"]`)).not.toBeNull();
      expect(page.querySelector('a[href="/my/businesses"]')).not.toBeNull();

      await router().navigateByUrl('/businesses');
      harness.detectChanges();
      expect((harness.routeNativeElement as HTMLElement).textContent).toContain('Aaa Fresh Tea');
    });

    it('resets the form for Add another business', async () => {
      fillValid();
      submit();
      await settle();
      click('.success-actions button');
      expect(page.querySelector('.success')).toBeNull();
      expect(el('bf-name').value).toBe('');
    });

    it('shows a retryable error and keeps data when saving fails', async () => {
      vi.spyOn(repository(), 'createBusiness').mockImplementationOnce(() => throwError(() => new Error('boom')));
      fillValid();
      submit();
      expect(page.querySelector('.save-error')!.textContent).toContain(
        "We couldn't add your business.",
      );
      expect(el('bf-name').value).toBe('Aaa Fresh Tea');
      click('.save-error button');
      await settle();
      expect(page.querySelector('.success')).not.toBeNull();
    });
  });

  describe('cancel and unsaved changes', () => {
    it('leaves immediately when untouched', async () => {
      click('.actions button');
      await settle();
      expect(router().url).toBe('/my/businesses');
    });

    it('keeps editing when the dialog is dismissed', async () => {
      fill('bf-name', 'Half typed');
      click('.actions button');
      await new Promise((resolve) => setTimeout(resolve));
      harness.detectChanges();
      expect(document.body.textContent).toContain('Discard changes?');
      dialogButton('Keep editing').click();
      await settle();
      expect(router().url).toBe('/my/business/new');
      expect(el('bf-name').value).toBe('Half typed');
    });

    it('discards and navigates when confirmed', async () => {
      fill('bf-name', 'Half typed');
      click('.actions button');
      await new Promise((resolve) => setTimeout(resolve));
      harness.detectChanges();
      dialogButton('Discard').click();
      await settle();
      expect(router().url).toBe('/my/businesses');
    });
  });
});
