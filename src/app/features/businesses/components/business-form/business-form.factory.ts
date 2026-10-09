import { FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BusinessDay } from '../../models/business.models';
import { BUSINESS_FIELD_RULES as RULES } from './business-form.config';
import { hoursDayValidator, optionalPhone, optionalPinCode, optionalUrl } from './business-form.validators';

export const BUSINESS_DAYS: { day: BusinessDay; label: string }[] = [
  { day: 'monday', label: 'Monday' },
  { day: 'tuesday', label: 'Tuesday' },
  { day: 'wednesday', label: 'Wednesday' },
  { day: 'thursday', label: 'Thursday' },
  { day: 'friday', label: 'Friday' },
  { day: 'saturday', label: 'Saturday' },
  { day: 'sunday', label: 'Sunday' },
];

/** Image selected locally. It is only previewed; nothing is uploaded in mock mode. */
export interface LocalImage {
  name: string;
  previewUrl: string;
}

const text = (validators: ValidatorFn[] = [], value = '') =>
  new FormControl(value, { nonNullable: true, validators });
const maxLength = (length: number) => Validators.maxLength(length);

export function createHoursGroup(day: BusinessDay) {
  const group = new FormGroup(
    {
      day: new FormControl<BusinessDay>(day, { nonNullable: true }),
      closed: new FormControl(false, { nonNullable: true }),
      openTime: text(),
      closeTime: text(),
    },
    { validators: hoursDayValidator },
  );
  group.controls.closed.valueChanges.subscribe((closed) => {
    for (const control of [group.controls.openTime, group.controls.closeTime]) {
      if (closed) control.disable({ emitEvent: false });
      else control.enable({ emitEvent: false });
    }
    group.updateValueAndValidity();
  });
  return group;
}

export function createBusinessForm() {
  const basicInfo = new FormGroup({
    name: text([Validators.required, maxLength(RULES.name.maxLength), Validators.pattern(/\S/)]),
    category: text([Validators.required]),
    subcategory: text(),
    description: text([maxLength(RULES.description.maxLength)]),
  });
  // Changing the category always clears a subcategory that may belong to the previous one.
  basicInfo.controls.category.valueChanges.subscribe(() =>
    basicInfo.controls.subcategory.setValue('', { emitEvent: false }),
  );

  const contact = new FormGroup({
    phone: text([Validators.required, optionalPhone]),
    whatsappSameAsPhone: new FormControl(false, { nonNullable: true }),
    whatsapp: text([optionalPhone]),
    email: text([Validators.email, maxLength(RULES.email.maxLength)]),
    website: text([optionalUrl, maxLength(RULES.website.maxLength)]),
  });
  const syncWhatsapp = () => {
    if (contact.controls.whatsappSameAsPhone.value) {
      contact.controls.whatsapp.setValue(contact.controls.phone.value, { emitEvent: false });
    }
  };
  contact.controls.phone.valueChanges.subscribe(syncWhatsapp);
  contact.controls.whatsappSameAsPhone.valueChanges.subscribe(syncWhatsapp);

  const location = new FormGroup({
    address: text([maxLength(RULES.address.maxLength)]),
    area: text([Validators.required, maxLength(RULES.area.maxLength)]),
    landmark: text([maxLength(RULES.landmark.maxLength)]),
    pinCode: text([optionalPinCode]),
    latitude: new FormControl<number | null>(null, [Validators.min(RULES.latitude.min), Validators.max(RULES.latitude.max)]),
    longitude: new FormControl<number | null>(null, [Validators.min(RULES.longitude.min), Validators.max(RULES.longitude.max)]),
  });

  const services = new FormGroup({
    items: new FormArray<FormControl<string>>([]),
    draft: text([maxLength(RULES.service.maxLength)]),
  });

  const hours = new FormArray(BUSINESS_DAYS.map(({ day }) => createHoursGroup(day)));

  const media = new FormGroup({
    logo: new FormControl<LocalImage | null>(null),
    cover: new FormControl<LocalImage | null>(null),
    photos: new FormControl<LocalImage[]>([], { nonNullable: true }),
  });

  return new FormGroup({ basicInfo, contact, location, services, hours, media });
}

export type BusinessFormGroup = ReturnType<typeof createBusinessForm>;
