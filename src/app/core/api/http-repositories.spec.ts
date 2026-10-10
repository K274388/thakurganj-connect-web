import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  BusinessAccessError,
  BusinessRepository,
  HttpBusinessRepository,
  MockBusinessRepository,
} from '../../features/businesses/data/business.repository';
import { MOCK_BUSINESSES } from '../../features/businesses/data/business.mock';
import { CreateBusinessRequest } from '../../features/businesses/models/business.models';
import { BUSINESS_CATEGORIES } from '../../features/categories/data/category.mock';
import {
  CategoryRepository,
  HttpCategoryRepository,
  MockCategoryRepository,
} from '../../features/categories/data/category.repository';
import { PLACE_CATEGORIES } from '../../features/places/data/place-category.mock';
import { MOCK_PLACES } from '../../features/places/data/place.mock';
import { HttpPlaceRepository, MockPlaceRepository, PlaceRepository } from '../../features/places/data/place.repository';
import { API_ENDPOINTS, API_MAX_PAGE_SIZE } from './api-endpoints';
import { API_CONFIG, ApiConfig, apiUrl } from './api.config';

const BASE = 'http://api.test/api/v1';
const REQUEST: CreateBusinessRequest = { name: 'Demo Shop', categoryId: 2, categorySlug: 'shopping', phone: '9876543210' };

function setup(dataSource: ApiConfig['dataSource']) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_CONFIG, useValue: { baseUrl: `${BASE}/`, dataSource } satisfies ApiConfig },
    ],
  });
  return TestBed.inject(HttpTestingController);
}

/** httpResource applies a flushed response asynchronously. */
const settle = () => TestBed.inject(ApplicationRef).whenStable();

const paged = <T>(items: T[]) => ({ items, page: 1, pageSize: API_MAX_PAGE_SIZE, totalItems: items.length, totalPages: 1 });

describe('apiUrl', () => {
  it('joins the base URL and endpoint path without doubling slashes', () => {
    expect(apiUrl({ baseUrl: `${BASE}/`, dataSource: 'http' }, API_ENDPOINTS.businesses.byId(7))).toBe(`${BASE}/businesses/7`);
    expect(apiUrl({ baseUrl: '', dataSource: 'http' }, API_ENDPOINTS.categories.list)).toBe('/categories');
  });

  it('encodes path parameters', () => {
    expect(API_ENDPOINTS.places.bySlug('a b/c')).toBe('/places/a%20b%2Fc');
  });
});

describe('data source selection', () => {
  it('uses the JSON-backed repositories in mock mode without any HTTP traffic', () => {
    const http = setup('mock');
    expect(TestBed.inject(BusinessRepository)).toBeInstanceOf(MockBusinessRepository);
    expect(TestBed.inject(CategoryRepository)).toBeInstanceOf(MockCategoryRepository);
    expect(TestBed.inject(PlaceRepository)).toBeInstanceOf(MockPlaceRepository);
    TestBed.tick();
    http.verify();
  });

  it('serves exactly the bundled JSON data in mock mode', () => {
    setup('mock');
    expect(TestBed.inject(CategoryRepository).categories()).toEqual(BUSINESS_CATEGORIES);
    expect(TestBed.inject(BusinessRepository).businesses()).toEqual(MOCK_BUSINESSES);
    expect(TestBed.inject(PlaceRepository).places()).toEqual(MOCK_PLACES);
    expect(TestBed.inject(PlaceRepository).categories()).toEqual(PLACE_CATEGORIES);
  });

  it('uses the API-backed repositories in http mode', () => {
    setup('http');
    expect(TestBed.inject(BusinessRepository)).toBeInstanceOf(HttpBusinessRepository);
    expect(TestBed.inject(CategoryRepository)).toBeInstanceOf(HttpCategoryRepository);
    expect(TestBed.inject(PlaceRepository)).toBeInstanceOf(HttpPlaceRepository);
  });
});

describe('HttpCategoryRepository', () => {
  it('loads GET /categories once and unwraps the items envelope', async () => {
    const http = setup('http');
    const repository = TestBed.inject(CategoryRepository);
    TestBed.tick();
    http.expectOne(`${BASE}/categories`).flush({ items: BUSINESS_CATEGORIES });
    await settle();
    expect(repository.categories()).toEqual(BUSINESS_CATEGORIES);
    http.verify();
  });

  it('exposes an empty list instead of throwing when the request fails', async () => {
    const http = setup('http');
    const repository = TestBed.inject(CategoryRepository);
    TestBed.tick();
    http.expectOne(`${BASE}/categories`).flush('down', { status: 500, statusText: 'Server Error' });
    await settle();
    expect(repository.categories()).toEqual([]);
  });
});

describe('HttpPlaceRepository', () => {
  it('loads places and place categories from their endpoints', async () => {
    const http = setup('http');
    const repository = TestBed.inject(PlaceRepository);
    TestBed.tick();
    http.expectOne(`${BASE}/places?pageSize=${API_MAX_PAGE_SIZE}`).flush(paged(MOCK_PLACES));
    http.expectOne(`${BASE}/place-categories`).flush({ items: PLACE_CATEGORIES });
    await settle();
    expect(repository.places()).toEqual(MOCK_PLACES);
    expect(repository.getPlaceBySlug(MOCK_PLACES[0].slug)).toEqual(MOCK_PLACES[0]);
    expect(repository.categories()).toEqual(PLACE_CATEGORIES);
  });
});

describe('HttpBusinessRepository', () => {
  let http: HttpTestingController;
  let repository: BusinessRepository;

  beforeEach(async () => {
    http = setup('http');
    repository = TestBed.inject(BusinessRepository);
    TestBed.tick();
    http.expectOne(`${BASE}/businesses?pageSize=${API_MAX_PAGE_SIZE}`).flush(paged(MOCK_BUSINESSES));
    await settle();
  });

  afterEach(() => http.verify());

  it('loads the public list from the pagination envelope', () => {
    expect(repository.businesses()).toEqual(MOCK_BUSINESSES);
    expect(repository.getBusiness(MOCK_BUSINESSES[0].id)).toEqual(MOCK_BUSINESSES[0]);
  });

  it('does not call the private owner endpoint until an owner page asks for it', async () => {
    http.expectNone(`${BASE}/my/businesses?pageSize=${API_MAX_PAGE_SIZE}`);
    const owned = repository.ownerBusinesses();
    TestBed.tick();
    const mine = MOCK_BUSINESSES.filter((business) => business.ownerId === 1);
    http.expectOne(`${BASE}/my/businesses?pageSize=${API_MAX_PAGE_SIZE}`).flush(paged(mine));
    await settle();
    expect(owned()).toEqual(mine);
  });

  it('loads one business by id and maps 404 to undefined', async () => {
    const found = firstValueFrom(repository.loadBusiness(1));
    http.expectOne(`${BASE}/businesses/1`).flush(MOCK_BUSINESSES[0]);
    expect(await found).toEqual(MOCK_BUSINESSES[0]);

    const missing = firstValueFrom(repository.loadBusiness(404));
    http.expectOne(`${BASE}/businesses/404`).flush(null, { status: 404, statusText: 'Not Found' });
    expect(await missing).toBeUndefined();
  });

  it('creates through POST /my/businesses without sending owner or status, then refreshes the list', async () => {
    const created = firstValueFrom(repository.createBusiness(REQUEST));
    const post = http.expectOne(`${BASE}/my/businesses`);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual(REQUEST);
    expect(post.request.body).not.toHaveProperty('ownerId');
    post.flush({ ...MOCK_BUSINESSES[0], id: 99, name: REQUEST.name });
    expect((await created).id).toBe(99);
    TestBed.tick();
    http.expectOne(`${BASE}/businesses?pageSize=${API_MAX_PAGE_SIZE}`).flush(paged(MOCK_BUSINESSES));
  });

  it('updates through PUT /my/businesses/{id} and maps 403/404 to BusinessAccessError', async () => {
    const forbidden = firstValueFrom(repository.updateBusiness(5, 1, REQUEST));
    const put = http.expectOne(`${BASE}/my/businesses/5`);
    expect(put.request.method).toBe('PUT');
    put.flush(null, { status: 403, statusText: 'Forbidden' });
    await expect(forbidden).rejects.toEqual(new BusinessAccessError('FORBIDDEN'));

    const missing = firstValueFrom(repository.updateBusiness(999, 1, REQUEST));
    http.expectOne(`${BASE}/my/businesses/999`).flush(null, { status: 404, statusText: 'Not Found' });
    await expect(missing).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
