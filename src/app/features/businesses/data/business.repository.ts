import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { MockCurrentUserService } from '../../../core/auth/mock-current-user';
import { API_ENDPOINTS, API_MAX_PAGE_SIZE } from '../../../core/api/api-endpoints';
import { ApiListResource, apiListResource } from '../../../core/api/api-resource';
import { API_CONFIG, apiUrl } from '../../../core/api/api.config';
import { PagedResponse } from '../../../core/api/api-responses';
import { CategoryRepository } from '../../categories/data/category.repository';
import { Business, CreateBusinessRequest, UpdateBusinessRequest } from '../models/business.models';
import { MOCK_BUSINESSES } from './business.mock';

const SHORT_DESCRIPTION_LENGTH = 160;

/** Mirrors the API's 403/404 responses. */
export class BusinessAccessError extends Error {
  constructor(readonly code: 'NOT_FOUND' | 'FORBIDDEN') {
    super(code === 'NOT_FOUND' ? 'Business not found.' : 'You do not have permission to manage this listing.');
  }
}

/**
 * Single source of business data, shared by the directory, details, categories, map and My Businesses.
 * The implementation follows `environment.dataSource`; both expose the same signals and observables, and the
 * mock emits synchronously so the rendered UI is identical in either mode.
 */
@Injectable({
  providedIn: 'root',
  useFactory: () =>
    inject(API_CONFIG).dataSource === 'http' ? inject(HttpBusinessRepository) : inject(MockBusinessRepository),
})
export abstract class BusinessRepository {
  /** Public listings (the directory, categories and map filter by status themselves). */
  abstract readonly businesses: Signal<Business[]>;

  /**
   * The current owner's listings, including inactive ones; loads on first call. Call it from a field initializer
   * or constructor (not inside `computed`), because the HTTP implementation starts a request.
   */
  abstract ownerBusinesses(): Signal<Business[]>;

  /** One listing with its detail-only fields; emits `undefined` when it does not exist. */
  abstract loadBusiness(id: string | number): Observable<Business | undefined>;

  /** Businesses are ACTIVE immediately; there is no approval workflow. */
  abstract createBusiness(request: CreateBusinessRequest): Observable<Business>;

  /**
   * Updates editable fields only. Errors with `BusinessAccessError` when the listing is missing or owned by
   * someone else. id, slug, ownerId, status and createdAt are always preserved.
   */
  abstract updateBusiness(id: string | number, ownerId: number, request: UpdateBusinessRequest): Observable<Business>;

  getBusinesses(): Business[] {
    return this.businesses();
  }

  getBusiness(id: string | number): Business | undefined {
    return this.businesses().find((business) => String(business.id) === String(id));
  }

  getBusinessesByOwner(ownerId: number): Business[] {
    return this.businesses().filter((business) => business.ownerId === ownerId);
  }
}

/** In-memory store seeded from businesses.mock.json. Changes last until the page is reloaded. */
@Injectable({ providedIn: 'root' })
export class MockBusinessRepository extends BusinessRepository {
  private readonly currentUser = inject(MockCurrentUserService);
  private readonly categories = inject(CategoryRepository);
  private readonly store = signal<Business[]>(MOCK_BUSINESSES.map((business) => ({ ...business })));
  private readonly owned = computed(() =>
    this.store().filter((business) => business.ownerId === this.currentUser.user().id),
  );

  readonly businesses = this.store.asReadonly();

  ownerBusinesses(): Signal<Business[]> {
    return this.owned;
  }

  loadBusiness(id: string | number): Observable<Business | undefined> {
    return of(this.getBusiness(id));
  }

  createBusiness(request: CreateBusinessRequest): Observable<Business> {
    try {
      return of(this.create(request));
    } catch (error) {
      return throwError(() => error);
    }
  }

  updateBusiness(id: string | number, ownerId: number, request: UpdateBusinessRequest): Observable<Business> {
    try {
      return of(this.update(id, ownerId, request));
    } catch (error) {
      return throwError(() => error);
    }
  }

  private create(request: CreateBusinessRequest): Business {
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

  /** Ownership is verified here independently of any component check. Editing never changes status. */
  private update(id: string | number, ownerId: number, request: UpdateBusinessRequest): Business {
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
    const category = this.categories.categories().find((item) => item.id === request.categoryId);
    if (!category) throw new Error(`Unknown category ${request.categoryId}`);
    const subcategory = request.subcategoryId
      ? category.subcategories.find((item) => item.id === request.subcategoryId)
      : undefined;
    if (request.subcategoryId && !subcategory) throw new Error(`Unknown subcategory ${request.subcategoryId}`);
    return { category, subcategory };
  }
}

/**
 * `GET /businesses`, `GET /businesses/{id}` and the owner endpoints under `/my/businesses`.
 * The backend derives the owner from the authenticated principal, so `ownerId` is never sent.
 */
@Injectable({ providedIn: 'root' })
export class HttpBusinessRepository extends BusinessRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly publicList = apiListResource(
    this.http,
    `${apiUrl(this.config, API_ENDPOINTS.businesses.list)}?pageSize=${API_MAX_PAGE_SIZE}`,
    (response) => (response as PagedResponse<Business>).items,
  );
  /** Private endpoint: only requested once an owner page asks for it. */
  private ownerList?: ApiListResource<Business>;

  readonly businesses = this.publicList.items;

  ownerBusinesses(): Signal<Business[]> {
    this.ownerList ??= apiListResource(
      this.http,
      `${apiUrl(this.config, API_ENDPOINTS.myBusinesses.list)}?pageSize=${API_MAX_PAGE_SIZE}`,
      (response) => (response as PagedResponse<Business>).items,
    );
    return this.ownerList.items;
  }

  loadBusiness(id: string | number): Observable<Business | undefined> {
    return this.http
      .get<Business>(apiUrl(this.config, API_ENDPOINTS.businesses.byId(id)))
      .pipe(catchError((error) => (isStatus(error, 404) ? of(undefined) : throwError(() => error))));
  }

  createBusiness(request: CreateBusinessRequest): Observable<Business> {
    return this.http
      .post<Business>(apiUrl(this.config, API_ENDPOINTS.myBusinesses.create), request)
      .pipe(tap(() => this.refresh()));
  }

  updateBusiness(id: string | number, _ownerId: number, request: UpdateBusinessRequest): Observable<Business> {
    return this.http.put<Business>(apiUrl(this.config, API_ENDPOINTS.myBusinesses.update(id)), request).pipe(
      tap(() => this.refresh()),
      catchError((error) => {
        if (isStatus(error, 404)) return throwError(() => new BusinessAccessError('NOT_FOUND'));
        if (isStatus(error, 403)) return throwError(() => new BusinessAccessError('FORBIDDEN'));
        return throwError(() => error);
      }),
    );
  }

  private refresh(): void {
    this.publicList.reload();
    this.ownerList?.reload();
  }
}

function isStatus(error: unknown, status: number): boolean {
  return error instanceof HttpErrorResponse && error.status === status;
}
