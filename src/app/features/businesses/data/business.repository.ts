import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { API_ENDPOINTS, API_MAX_PAGE_SIZE } from '../../../core/api/api-endpoints';
import { ApiListResource, apiListResource } from '../../../core/api/api-resource';
import { API_CONFIG, apiUrl } from '../../../core/api/api.config';
import { PagedResponse } from '../../../core/api/api-responses';
import { Business, BusinessListQuery, CreateBusinessRequest, UpdateBusinessRequest } from '../models/business.models';

/** Mirrors the API's 403/404 responses. */
export class BusinessAccessError extends Error {
  constructor(readonly code: 'NOT_FOUND' | 'FORBIDDEN') {
    super(code === 'NOT_FOUND' ? 'Business not found.' : 'You do not have permission to manage this listing.');
  }
}

/**
 * Single source of business data, shared by the directory, details, categories, map and My Businesses.
 * Public data comes from `GET /businesses` and `GET /businesses/{id}`; owner data from `/my/businesses`.
 * The backend derives the owner from the authenticated principal, so `ownerId` is never sent.
 */
@Injectable({ providedIn: 'root' })
export class BusinessRepository {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly publicList = apiListResource(
    this.http,
    `${apiUrl(this.config, API_ENDPOINTS.businesses.list)}?pageSize=${API_MAX_PAGE_SIZE}`,
    (response) => (response as PagedResponse<Business>).items,
  );
  /** Private endpoint: only requested once an owner page asks for it. */
  private ownerList?: ApiListResource<Business>;

  /** Public ACTIVE listings (the directory, categories and map filter further themselves). */
  readonly businesses = this.publicList.items;

  /**
   * The signed-in owner's listings, including inactive ones; loads on first call. Call it from a field
   * initializer or constructor (not inside `computed`), because it starts a request.
   */
  ownerBusinesses(): Signal<Business[]> {
    this.ownerList ??= apiListResource(
      this.http,
      `${apiUrl(this.config, API_ENDPOINTS.myBusinesses.list)}?pageSize=${API_MAX_PAGE_SIZE}`,
      (response) => (response as PagedResponse<Business>).items,
    );
    return this.ownerList.items;
  }

  /** One page of public listings filtered, sorted and paged by the server (`GET /businesses?category=…`). */
  listBusinesses(query: BusinessListQuery): Observable<PagedResponse<Business>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    }
    return this.http.get<PagedResponse<Business>>(apiUrl(this.config, API_ENDPOINTS.businesses.list), { params });
  }

  /** One listing with its detail-only fields; emits `undefined` when it does not exist. */
  loadBusiness(id: string | number): Observable<Business | undefined> {
    return this.http
      .get<Business>(apiUrl(this.config, API_ENDPOINTS.businesses.byId(id)))
      .pipe(catchError((error) => (isStatus(error, 404) ? of(undefined) : throwError(() => error))));
  }

  /** Businesses are ACTIVE immediately; there is no approval workflow. */
  createBusiness(request: CreateBusinessRequest): Observable<Business> {
    return this.http
      .post<Business>(apiUrl(this.config, API_ENDPOINTS.myBusinesses.create), request)
      .pipe(tap(() => this.refresh()));
  }

  /**
   * Updates editable fields only. Errors with `BusinessAccessError` when the listing is missing or owned by
   * someone else; the server enforces ownership.
   */
  updateBusiness(id: string | number, request: UpdateBusinessRequest): Observable<Business> {
    return this.http.put<Business>(apiUrl(this.config, API_ENDPOINTS.myBusinesses.update(id)), request).pipe(
      tap(() => this.refresh()),
      catchError((error) => {
        if (isStatus(error, 404)) return throwError(() => new BusinessAccessError('NOT_FOUND'));
        if (isStatus(error, 403)) return throwError(() => new BusinessAccessError('FORBIDDEN'));
        return throwError(() => error);
      }),
    );
  }

  getBusinesses(): Business[] {
    return this.businesses();
  }

  getBusiness(id: string | number): Business | undefined {
    return this.businesses().find((business) => String(business.id) === String(id));
  }

  private refresh(): void {
    this.publicList.reload();
    this.ownerList?.reload();
  }
}

function isStatus(error: unknown, status: number): boolean {
  return error instanceof HttpErrorResponse && error.status === status;
}
