/** Centralized frontend validation/configuration. Align with the Spring Boot contract when the API is connected. */
export const BUSINESS_FIELD_RULES = {
  name: { required: true, maxLength: 150 },
  category: { required: true },
  subcategory: { required: false },
  description: { required: false, maxLength: 1000 },
  phone: { required: true, pattern: /^\+?[0-9\s()-]{7,20}$/ },
  whatsapp: { pattern: /^\+?[0-9\s()-]{7,20}$/ },
  email: { maxLength: 254 },
  website: { maxLength: 300 },
  address: { maxLength: 300 },
  area: { required: true, maxLength: 100 },
  landmark: { maxLength: 150 },
  pinCode: { pattern: /^[0-9]{6}$/ },
  latitude: { min: -90, max: 90 },
  longitude: { min: -180, max: 180 },
  service: { maxLength: 80, maxItems: 30 },
} as const;

/** Local-only image limits. Adjust when the upload API is implemented. */
export const BUSINESS_MEDIA_CONFIG = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSizeBytes: 5 * 1024 * 1024,
  maxGalleryImages: 8,
} as const;

export const BUSINESS_SUCCESS_MESSAGE = '✓ Your business is live. People can now find it on Thakurganj Connect.';

export const BUSINESS_UPDATE_SUCCESS_MESSAGE = '✓ Business information updated successfully.';
