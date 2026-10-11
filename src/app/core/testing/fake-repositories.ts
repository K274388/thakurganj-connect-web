import { Injectable, Provider, Signal, computed, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AnnouncementRepository } from '../../features/announcements/data/announcement.repository';
import { BusinessAccessError, BusinessRepository } from '../../features/businesses/data/business.repository';
import {
  Business,
  BusinessListQuery,
  CreateBusinessRequest,
  UpdateBusinessRequest,
} from '../../features/businesses/models/business.models';
import { PagedResponse } from '../api/api-responses';
import { CategoryRepository } from '../../features/categories/data/category.repository';
import { PlaceRepository } from '../../features/places/data/place.repository';
import { AnnouncementBarItem } from '../../shared/models/announcement-bar-item';
import { TEST_BUSINESSES, TEST_CATEGORIES, TEST_PLACE_CATEGORIES, TEST_PLACES } from './fixtures';

type PublicApi<T> = { [K in keyof T]: T[K] };

const SHORT_DESCRIPTION_LENGTH = 160;

/** Owner id the fake treats as signed in; matches the fixtures (owner 1 owns businesses 1, 2 and 21). */
export const TEST_OWNER_ID = 1;

@Injectable()
export class FakeCategoryRepository implements PublicApi<CategoryRepository> {
  readonly categories = signal(TEST_CATEGORIES).asReadonly();
}

@Injectable()
export class FakePlaceRepository implements PublicApi<PlaceRepository> {
  readonly places = signal(TEST_PLACES.map((place) => ({ ...place, images: [...place.images] }))).asReadonly();
  readonly categories = signal(TEST_PLACE_CATEGORIES).asReadonly();

  getPlaces() {
    return this.places();
  }

  getPlaceBySlug(slug: string) {
    return this.places().find((place) => place.slug === slug);
  }
}

@Injectable()
export class FakeAnnouncementRepository implements PublicApi<AnnouncementRepository> {
  readonly active = signal<AnnouncementBarItem[]>([]).asReadonly();
}

/**
 * In-memory stand-in for the API: emits synchronously and applies the server's rules (owner from the session,
 * ACTIVE on create, status and ownership preserved on update, 403/404 as BusinessAccessError).
 */
@Injectable()
export class FakeBusinessRepository implements PublicApi<BusinessRepository> {
  private readonly categories = inject(CategoryRepository);
  private readonly store = signal<Business[]>(TEST_BUSINESSES.map((business) => ({ ...business })));

  /** The signed-in owner; change it to simulate another account. */
  readonly ownerId = signal(TEST_OWNER_ID);
  readonly businesses = computed(() => this.store().filter((business) => business.status === 'ACTIVE'));
  private readonly owned = computed(() => this.store().filter((business) => business.ownerId === this.ownerId()));

  ownerBusinesses(): Signal<Business[]> {
    return this.owned;
  }

  /** Applies the API's filters, sort and paging to the ACTIVE listings. */
  listBusinesses(query: BusinessListQuery): Observable<PagedResponse<Business>> {
    const search = query.search?.trim().toLocaleLowerCase();
    const items = this.businesses()
      .filter(
        (business) =>
          (!search ||
            [business.name, business.shortDescription, business.categoryName, business.subcategoryName, ...business.services, business.area]
              .join(' ')
              .toLocaleLowerCase()
              .includes(search)) &&
          (!query.category || business.categorySlug === query.category) &&
          (!query.subcategory || business.subcategorySlug === query.subcategory) &&
          (!query.area || slug(business.area) === query.area),
      )
      .sort((a, b) =>
        query.sort === 'newest'
          ? b.createdAt.localeCompare(a.createdAt)
          : (query.sort === 'name-desc' ? -1 : 1) * a.name.localeCompare(b.name),
      );
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    return of({
      items: items.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / pageSize),
    });
  }

  /** Also returns INACTIVE listings (the API answers 404) so specs can cover the page's defensive state. */
  loadBusiness(id: string | number): Observable<Business | undefined> {
    return of(this.findStored(id));
  }

  createBusiness(request: CreateBusinessRequest): Observable<Business> {
    try {
      return of(this.create(request));
    } catch (error) {
      return throwError(() => error);
    }
  }

  updateBusiness(id: string | number, request: UpdateBusinessRequest): Observable<Business> {
    try {
      return of(this.update(id, request));
    } catch (error) {
      return throwError(() => error);
    }
  }

  getBusinesses(): Business[] {
    return this.businesses();
  }

  getBusiness(id: string | number): Business | undefined {
    return this.businesses().find((business) => String(business.id) === String(id));
  }

  /** Any stored listing, including INACTIVE ones. */
  findStored(id: string | number): Business | undefined {
    return this.store().find((business) => String(business.id) === String(id));
  }

  private create(request: CreateBusinessRequest): Business {
    const id = this.store().reduce((max, business) => Math.max(max, Number(business.id)), 0) + 1;
    const now = new Date().toISOString();
    const business: Business = {
      ...this.editable(request),
      id,
      slug: `${request.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${id}`,
      imageUrl: '',
      status: 'ACTIVE',
      ownerId: this.ownerId(),
      createdAt: now,
      updatedAt: now,
    };
    this.store.update((list) => [...list, business]);
    return business;
  }

  private update(id: string | number, request: UpdateBusinessRequest): Business {
    const existing = this.findStored(id);
    if (!existing) throw new BusinessAccessError('NOT_FOUND');
    if (existing.ownerId !== this.ownerId()) throw new BusinessAccessError('FORBIDDEN');
    const updated: Business = { ...existing, ...this.editable(request), updatedAt: new Date().toISOString() };
    this.store.update((list) => list.map((business) => (business.id === existing.id ? updated : business)));
    return updated;
  }

  private editable(request: CreateBusinessRequest) {
    const category = this.categories.categories().find((item) => item.id === request.categoryId);
    if (!category) throw new Error(`Unknown category ${request.categoryId}`);
    const subcategory = category.subcategories.find((item) => item.id === request.subcategoryId);
    const description = request.description?.trim() ?? '';
    return {
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
    };
  }
}

function slug(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Replaces every API-backed repository with in-memory fakes seeded from the fixtures. */
export function provideFakeRepositories(): Provider[] {
  return [
    FakeCategoryRepository,
    FakePlaceRepository,
    FakeBusinessRepository,
    FakeAnnouncementRepository,
    { provide: CategoryRepository, useExisting: FakeCategoryRepository },
    { provide: PlaceRepository, useExisting: FakePlaceRepository },
    { provide: BusinessRepository, useExisting: FakeBusinessRepository },
    { provide: AnnouncementRepository, useExisting: FakeAnnouncementRepository },
  ];
}
