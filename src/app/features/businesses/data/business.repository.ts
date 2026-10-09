import { Injectable, inject, signal } from '@angular/core';
import { MockCurrentUserService } from '../../../core/auth/mock-current-user';
import { BUSINESS_CATEGORIES } from '../../categories/data/category.mock';
import { Business, CreateBusinessRequest, UpdateBusinessRequest } from '../models/business.models';
import { MOCK_BUSINESSES } from './business.mock';

const SHORT_DESCRIPTION_LENGTH = 160;

/** Mirrors the future API's 403/404 responses. */
export class BusinessAccessError extends Error {
  constructor(readonly code: 'NOT_FOUND' | 'FORBIDDEN') {
    super(code === 'NOT_FOUND' ? 'Business not found.' : 'You do not have permission to manage this listing.');
  }
}

/**
 * Single source of business data in mock mode, shared by the directory, details and My Businesses.
 * Replace the internals with HTTP calls when the Spring Boot API is connected.
 */
@Injectable({ providedIn: 'root' })
export class BusinessRepository {
  private readonly currentUser = inject(MockCurrentUserService);
  private readonly store = signal<Business[]>(MOCK_BUSINESSES.map((business) => ({ ...business })));

  readonly businesses = this.store.asReadonly();

  getBusinesses(): Business[] {
    return this.store();
  }

  getBusiness(id: string | number): Business | undefined {
    return this.store().find((business) => String(business.id) === String(id));
  }

  getBusinessesByOwner(ownerId: number): Business[] {
    return this.store().filter((business) => business.ownerId === ownerId);
  }

  /** Businesses are ACTIVE immediately; there is no approval workflow. */
  createBusiness(request: CreateBusinessRequest): Business {
    const { category, subcategory } = this.resolveCategory(request);
    const id = this.store().reduce((max, business) => Math.max(max, Number(business.id)), 0) + 1;
    const now = new Date().toISOString();
    const slug = `${request.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${id}`;
    const description = request.description?.trim() ?? '';

    const business: Business = {
      id,
      slug,
      name: request.name,
      category: category.name,
      categoryId: category.id,
      categorySlug: category.slug,
      categoryName: category.name,
      subcategoryId: subcategory?.id,
      subcategorySlug: subcategory?.slug,
      subcategoryName: subcategory?.name,
      description: description || undefined,
      shortDescription: description.slice(0, SHORT_DESCRIPTION_LENGTH),
      phone: request.phone ?? '',
      whatsapp: request.whatsapp ?? '',
      email: request.email ?? '',
      website: request.website ?? '',
      address: request.address ?? '',
      area: request.area ?? '',
      landmark: request.landmark ?? '',
      pinCode: request.pinCode,
      latitude: request.latitude,
      longitude: request.longitude,
      imageUrl: '',
      services: request.services ?? [],
      hours: request.hours,
      status: 'ACTIVE',
      ownerId: this.currentUser.user().id,
      createdAt: now,
      updatedAt: now,
    };
    this.store.update((list) => [...list, business]);
    return business;
  }

  /**
   * Updates editable fields only. Ownership is verified here independently of any component check,
   * and id, slug, ownerId, status and createdAt are always preserved (editing never changes status).
   */
  updateBusiness(id: string | number, ownerId: number, request: UpdateBusinessRequest): Business {
    const existing = this.getBusiness(id);
    if (!existing) throw new BusinessAccessError('NOT_FOUND');
    if (existing.ownerId === undefined || existing.ownerId !== ownerId) throw new BusinessAccessError('FORBIDDEN');

    const { category, subcategory } = this.resolveCategory(request);
    const description = request.description?.trim() ?? '';
    const updated: Business = {
      ...existing,
      name: request.name,
      category: category.name,
      categoryId: category.id,
      categorySlug: category.slug,
      categoryName: category.name,
      subcategoryId: subcategory?.id,
      subcategorySlug: subcategory?.slug,
      subcategoryName: subcategory?.name,
      description: description || undefined,
      shortDescription: description.slice(0, SHORT_DESCRIPTION_LENGTH),
      phone: request.phone ?? '',
      whatsapp: request.whatsapp ?? '',
      email: request.email ?? '',
      website: request.website ?? '',
      address: request.address ?? '',
      area: request.area ?? '',
      landmark: request.landmark ?? '',
      pinCode: request.pinCode,
      latitude: request.latitude,
      longitude: request.longitude,
      services: request.services ?? [],
      hours: request.hours,
      updatedAt: new Date().toISOString(),
    };
    this.store.update((list) => list.map((business) => (business.id === existing.id ? updated : business)));
    return updated;
  }

  private resolveCategory(request: CreateBusinessRequest) {
    const category = BUSINESS_CATEGORIES.find((item) => item.id === request.categoryId);
    if (!category) throw new Error(`Unknown category ${request.categoryId}`);
    const subcategory = request.subcategoryId
      ? category.subcategories.find((item) => item.id === request.subcategoryId)
      : undefined;
    if (request.subcategoryId && !subcategory) throw new Error(`Unknown subcategory ${request.subcategoryId}`);
    return { category, subcategory };
  }
}
