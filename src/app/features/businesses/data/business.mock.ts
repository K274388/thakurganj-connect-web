import { MOCK_CURRENT_USER } from '../../../core/auth/mock-current-user';
import { BUSINESS_CATEGORIES } from '../../categories/data/category.mock';
import { Business, BusinessDay, BusinessDayHours } from '../models/business.models';

function createDemoBusiness(
  id: number,
  categorySlug: string,
  subcategorySlug: string,
  name: string,
  area: string,
  shortDescription: string,
  services: string[],
  status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
): Business {
  const category = BUSINESS_CATEGORIES.find((item) => item.slug === categorySlug)!;
  const subcategory = category.subcategories.find((item) => item.slug === subcategorySlug)!;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id,
    name,
    slug,
    categoryId: category.id,
    categorySlug,
    categoryName: category.name,
    category: category.name,
    subcategoryId: subcategory.id,
    subcategorySlug,
    subcategoryName: subcategory.name,
    shortDescription,
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    address: `Demo address ${id}, ${area}`,
    area,
    landmark: 'Demo landmark',
    latitude: undefined,
    longitude: undefined,
    imageUrl: '',
    services,
    status,
    createdAt: `2026-09-${String((id % 25) + 1).padStart(2, '0')}T09:00:00.000Z`,
  };
}

export const MOCK_BUSINESSES: Business[] = [
  createDemoBusiness(1, 'food-restaurants', 'restaurant', 'Demo Saffron Kitchen', 'Main Road', 'Fictional restaurant listing for directory development.', ['Dine-in', 'Takeaway']),
  createDemoBusiness(2, 'food-restaurants', 'bakery', 'Demo Sunrise Bakery', 'Station Road', 'Fictional bakery listing for directory development.', ['Bread', 'Cakes']),
  createDemoBusiness(3, 'food-restaurants', 'tea-shop', 'Demo Chai Corner', 'Market Area', 'Fictional tea shop listing for directory development.', ['Tea', 'Snacks']),
  createDemoBusiness(4, 'food-restaurants', 'sweets', 'Demo Mithai House', 'Main Road', 'Fictional sweets shop listing for directory development.', ['Sweets', 'Gift boxes']),
  createDemoBusiness(5, 'shopping', 'mobile', 'Demo Mobile Hub', 'Main Road', 'Fictional mobile shop listing for directory development.', ['Mobile phones', 'Accessories']),
  createDemoBusiness(6, 'shopping', 'clothing', 'Demo Thread & Loom', 'Market Area', 'Fictional clothing shop listing for directory development.', ['Clothing', 'Alterations']),
  createDemoBusiness(7, 'shopping', 'grocery', 'Demo Daily Basket', 'Station Road', 'Fictional grocery listing for directory development.', ['Groceries', 'Household items']),
  createDemoBusiness(8, 'shopping', 'electronics', 'Demo Circuit Electronics', 'College Road', 'Fictional electronics shop listing for directory development.', ['Electronics', 'Batteries']),
  createDemoBusiness(9, 'health', 'clinic', 'Demo Community Clinic', 'College Road', 'Fictional clinic listing for directory development.', ['General consultation']),
  createDemoBusiness(10, 'health', 'pharmacy', 'Demo Care Pharmacy', 'Main Road', 'Fictional pharmacy listing for directory development.', ['Pharmacy products']),
  createDemoBusiness(11, 'health', 'dental', 'Demo Bright Dental', 'Station Road', 'Fictional dental care listing for directory development.', ['Dental consultation']),
  createDemoBusiness(12, 'services', 'tailor', 'Demo Stitch Tailors', 'Market Area', 'Fictional tailoring service listing for directory development.', ['Stitching', 'Alterations']),
  createDemoBusiness(13, 'services', 'electrician', 'Demo Fix-It Services', 'Main Road', 'Fictional repair service listing for directory development.', ['Appliance repair']),
  createDemoBusiness(14, 'services', 'computer-service', 'Demo Quick Computer Care', 'College Road', 'Fictional computer service listing for directory development.', ['Computer repair', 'Printing']),
  createDemoBusiness(15, 'education', 'school', 'Demo Learning School', 'Station Road', 'Fictional school listing for directory development.', ['Primary education']),
  createDemoBusiness(16, 'education', 'coaching', 'Demo Study Circle', 'College Road', 'Fictional tutoring service listing for directory development.', ['Tutoring', 'Exam preparation']),
  createDemoBusiness(17, 'education', 'computer-institute', 'Demo Digital Skills Centre', 'Market Area', 'Fictional training centre listing for directory development.', ['Computer training']),
  createDemoBusiness(18, 'automobile', 'car-repair', 'Demo Roadside Garage', 'Bypass Road', 'Fictional garage listing for directory development.', ['Vehicle repair']),
  createDemoBusiness(19, 'automobile', 'spare-parts', 'Demo Auto Parts Depot', 'Main Road', 'Fictional auto parts listing for directory development.', ['Auto parts']),
  createDemoBusiness(20, 'automobile', 'bike-repair', 'Demo Two-Wheeler Works', 'Station Road', 'Fictional repair listing for directory development.', ['Two-wheeler repair']),
  createDemoBusiness(21, 'shopping', 'mobile', 'Demo Pocket Tech', 'Bypass Road', 'Inactive fictional mobile shop listing.', ['Mobile accessories'], 'INACTIVE'),
];

const DAYS: BusinessDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function weeklyHours(openTime: string, closeTime: string, closedDays: BusinessDay[] = []): BusinessDayHours[] {
  return DAYS.map((day) =>
    closedDays.includes(day) ? { day, closed: true } : { day, openTime, closeTime, closed: false },
  );
}

const DEMO_DETAILS: Record<number, Partial<Business>> = {
  1: {
    description:
      'Demo Saffron Kitchen is a fictional restaurant used only to develop and test the Thakurganj Connect business profile page. None of the details here describe a real business.',
    phone: '+910000000001',
    whatsapp: '+910000000001',
    email: 'demo-saffron@example.com',
    website: 'https://example.com/demo-saffron-kitchen',
    latitude: 26.1,
    longitude: 87.9,
    pinCode: '000001',
    services: ['Family Dining', 'Takeaway', 'Snacks', 'Tea'],
    coverImageUrl: 'https://placehold.co/1200x700?text=Demo+Cover',
    images: [
      { url: 'https://placehold.co/1200x700?text=Demo+Cover', alt: 'Demo Saffron Kitchen demo cover image' },
      { url: 'https://placehold.co/1200x700?text=Demo+Dining', alt: 'Demo Saffron Kitchen demo dining area image' },
      { url: 'https://placehold.co/1200x700?text=Demo+Menu', alt: 'Demo Saffron Kitchen demo menu image' },
    ],
    hours: weeklyHours('09:00', '20:00', ['sunday']),
  },
  5: {
    description: 'Demo Mobile Hub is a fictional shop used only for development of the business profile page.',
    phone: '+910000000005',
    latitude: 26.11,
    longitude: 87.91,
    hours: weeklyHours('10:00', '21:00'),
  },
  9: {
    description: 'Demo Community Clinic is a fictional clinic used only for development and testing.',
    phone: '+910000000009',
    whatsapp: '+910000000009',
    hours: weeklyHours('08:00', '14:00', ['sunday']),
  },
  12: {
    description: 'Demo Stitch Tailors is a fictional tailoring service used only for development and testing.',
    email: 'demo-tailor@example.com',
  },
};

// Demo ownership: the mock current user owns two ACTIVE businesses and one INACTIVE business.
const DEMO_OWNED_BUSINESS_IDS = [1, 2, 21];
const OTHER_DEMO_OWNER_ID = 2;

for (const business of MOCK_BUSINESSES) {
  Object.assign(business, DEMO_DETAILS[Number(business.id)]);
  business.ownerId = DEMO_OWNED_BUSINESS_IDS.includes(Number(business.id)) ? MOCK_CURRENT_USER.id : OTHER_DEMO_OWNER_ID;
  business.description ??= `${business.name}: ${business.shortDescription} This is placeholder demo content, not a real business.`;
}
