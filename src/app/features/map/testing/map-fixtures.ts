import { Business } from '../../businesses/models/business.models';
import { Place } from '../../places/models/place.models';

export function business(overrides: Partial<Business> = {}): Business {
  return {
    id: 101,
    slug: 'saffron',
    name: 'Saffron Kitchen',
    category: 'Food & Restaurants',
    categoryId: 1,
    categorySlug: 'food-restaurants',
    categoryName: 'Food & Restaurants',
    shortDescription: 'Curries and kebabs',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    address: '',
    area: 'Main Road',
    landmark: '',
    latitude: 26.1,
    longitude: 87.9,
    imageUrl: '',
    services: [],
    status: 'ACTIVE',
    createdAt: '',
    ...overrides,
  };
}

export function place(overrides: Partial<Place> = {}): Place {
  return {
    id: 'p1',
    slug: 'junction',
    name: 'Thakurganj Junction',
    categoryId: 'place-category-transportation',
    categorySlug: 'transportation',
    categoryName: 'Transportation',
    shortDescription: 'Railway station',
    description: '',
    address: '',
    area: 'Station Road',
    landmark: '',
    pinCode: '',
    latitude: 26.2,
    longitude: 88,
    coverImageUrl: null,
    images: [],
    featured: false,
    active: true,
    displayOrder: 1,
    ...overrides,
  };
}

