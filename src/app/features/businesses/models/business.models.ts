import { BusinessCardData } from '../../../shared/models/business-card-data';

export type BusinessStatus = 'ACTIVE' | 'INACTIVE';
export type BusinessSort = 'name-asc' | 'name-desc' | 'newest';

export type BusinessDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface BusinessImage {
  url: string;
  alt: string;
}

export interface BusinessDayHours {
  day: BusinessDay;
  openTime?: string;
  closeTime?: string;
  closed: boolean;
}

export interface Business extends BusinessCardData {
  description?: string;
  pinCode?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  images?: BusinessImage[];
  hours?: BusinessDayHours[];
  slug: string;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  subcategoryId?: number;
  subcategorySlug?: string;
  subcategoryName?: string;
  shortDescription: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  area: string;
  landmark: string;
  latitude?: number;
  longitude?: number;
  imageUrl: string;
  services: string[];
  status: BusinessStatus;
  createdAt: string;
  updatedAt?: string;
  ownerId?: number;
}

export interface BusinessDirectoryFilters {
  search: string;
  category: string;
  subcategory: string;
  area: string;
  sort: BusinessSort;
}

/** Query parameters of `GET /businesses`; empty values are omitted from the request. */
export interface BusinessListQuery extends Partial<BusinessDirectoryFilters> {
  page?: number;
  pageSize?: number;
}

/** Input for creating a business. Backend-owned values (id, status, ownerId, timestamps) are added by the repository. */
export interface CreateBusinessRequest {
  name: string;
  categoryId: number;
  categorySlug: string;
  subcategoryId?: number;
  subcategorySlug?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  area?: string;
  landmark?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  services?: string[];
  hours?: BusinessDayHours[];
}

/** Editable fields only. id, ownerId, status and createdAt are never accepted from the form. */
export type UpdateBusinessRequest = CreateBusinessRequest;
