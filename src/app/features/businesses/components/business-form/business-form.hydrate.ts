import { FormControl } from '@angular/forms';
import { Business } from '../../models/business.models';
import { BusinessFormGroup } from './business-form.factory';

/** Fills the reusable form from an existing business, then marks it pristine. */
export function hydrateBusinessForm(form: BusinessFormGroup, business: Business): void {
  const { basicInfo, contact, location, services, hours } = form.controls;

  // Category first (its change clears the subcategory), then the subcategory.
  basicInfo.controls.name.setValue(business.name);
  basicInfo.controls.category.setValue(business.categorySlug);
  basicInfo.controls.subcategory.setValue(business.subcategorySlug ?? '');
  basicInfo.controls.description.setValue(business.description ?? '');

  const phone = business.phone ?? '';
  const whatsapp = business.whatsapp ?? '';
  contact.controls.phone.setValue(phone);
  contact.controls.whatsapp.setValue(whatsapp);
  contact.controls.email.setValue(business.email ?? '');
  contact.controls.website.setValue(business.website ?? '');
  // Only linked when the stored values genuinely match.
  contact.controls.whatsappSameAsPhone.setValue(!!phone && phone === whatsapp);

  location.controls.address.setValue(business.address ?? '');
  location.controls.area.setValue(business.area ?? '');
  location.controls.landmark.setValue(business.landmark ?? '');
  location.controls.pinCode.setValue(business.pinCode ?? '');
  location.controls.latitude.setValue(business.latitude ?? null);
  location.controls.longitude.setValue(business.longitude ?? null);

  services.controls.items.clear();
  for (const item of business.services ?? []) {
    services.controls.items.push(new FormControl(item, { nonNullable: true }));
  }

  for (const group of hours.controls) {
    const saved = business.hours?.find((entry) => entry.day === group.controls.day.value);
    if (!saved) continue;
    group.controls.closed.setValue(!!saved.closed);
    group.controls.openTime.setValue(saved.openTime ?? '');
    group.controls.closeTime.setValue(saved.closeTime ?? '');
  }

  form.markAsPristine();
  form.markAsUntouched();
}
