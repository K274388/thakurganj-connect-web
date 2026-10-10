import { BusinessCategory } from '../../../categories/models/category.models';
import { BusinessDayHours, CreateBusinessRequest } from '../../models/business.models';
import { BusinessFormGroup } from './business-form.factory';

const clean = (value: string | null | undefined): string | undefined => value?.trim() || undefined;

/** Maps form values to a create request. Backend-owned fields (status, ownerId, timestamps) are intentionally absent. */
export function toCreateBusinessRequest(form: BusinessFormGroup, categories: BusinessCategory[]): CreateBusinessRequest {
  const { basicInfo, contact, location, services, hours } = form.getRawValue();
  const category = categories.find((item) => item.slug === basicInfo.category);
  if (!category) throw new Error('A category is required.');
  const subcategory = category.subcategories.find((item) => item.slug === basicInfo.subcategory);

  const businessHours: BusinessDayHours[] = [];
  for (const day of hours) {
    if (day.closed) businessHours.push({ day: day.day, closed: true });
    else if (day.openTime && day.closeTime)
      businessHours.push({ day: day.day, openTime: day.openTime, closeTime: day.closeTime, closed: false });
  }

  return {
    name: basicInfo.name.trim(),
    categoryId: category.id,
    categorySlug: category.slug,
    subcategoryId: subcategory?.id,
    subcategorySlug: subcategory?.slug,
    description: clean(basicInfo.description),
    phone: clean(contact.phone),
    whatsapp: clean(contact.whatsapp),
    email: clean(contact.email),
    website: clean(contact.website),
    address: clean(location.address),
    area: clean(location.area),
    landmark: clean(location.landmark),
    pinCode: clean(location.pinCode),
    latitude: location.latitude ?? undefined,
    longitude: location.longitude ?? undefined,
    services: services.items.length ? [...services.items] : undefined,
    hours: businessHours.length ? businessHours : undefined,
  };
}
