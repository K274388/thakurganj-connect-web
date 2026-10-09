import { Business } from '../models/business.models';

/** Keeps digits and a leading "+" so the value is safe in tel: links. */
export function phoneDigits(phone: string | undefined): string {
  const value = (phone ?? '').trim();
  const digits = value.replace(/\D/g, '');
  return digits ? (value.startsWith('+') ? `+${digits}` : digits) : '';
}

export function whatsappLink(whatsapp: string | undefined, businessName: string): string {
  const digits = (whatsapp ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const text = encodeURIComponent(`Hello ${businessName}, I found you on Thakurganj Connect.`);
  return `https://wa.me/${digits}?text=${text}`;
}

/** Only http(s) URLs are allowed as external website links. */
export function safeWebsite(website: string | undefined): string {
  const value = (website ?? '').trim();
  if (!value) return '';
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export function directionsLink(business: Business): string {
  const { latitude, longitude } = business;
  if (typeof latitude === 'number' && typeof longitude === 'number') {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  const address = [business.address, business.area].filter(Boolean).join(', ').trim();
  return address ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}` : '';
}
