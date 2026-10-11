import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AnnouncementRepository } from '../../features/announcements/data/announcement.repository';
import { BusinessAccessError, BusinessRepository } from '../../features/businesses/data/business.repository';
import { CreateBusinessRequest } from '../../features/businesses/models/business.models';
import { CategoryRepository } from '../../features/categories/data/category.repository';
import { PlaceRepository } from '../../features/places/data/place.repository';
import { authInterceptor } from '../auth/auth.interceptor';
import { AuthService } from '../auth/auth.service';
import { TEST_BUSINESSES, TEST_CATEGORIES, TEST_PLACES, TEST_PLACE_CATEGORIES } from '../testing/fixtures';
import { API_ENDPOINTS, API_MAX_PAGE_SIZE } from './api-endpoints';
import { API_CONFIG, ApiConfig, apiUrl } from './api.config';

const BASE = 'http://api.test/api/v1';
const REQUEST: CreateBusinessRequest = { name: 'Demo Shop', categoryId: 2, categorySlug: 'shopping', phone: '9876543210' };

function setup(platform: 'browser' | 'server' = 'browser') {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
      { provide: API_CONFIG, useValue: { baseUrl: `${BASE}/` } satisfies ApiConfig },
      { provide: PLATFORM_ID, useValue: platform },
    ],
  });
  return TestBed.inject(HttpTestingController);
}

/** httpResource applies a flushed response asynchronously. */
const settle = () => TestBed.inject(ApplicationRef).whenStable();

const paged = <T>(items: T[]) => ({ items, page: 1, pageSize: API_MAX_PAGE_SIZE, totalItems: items.length, totalPages: 1 });

describe('apiUrl', () => {
  it('joins the base URL and endpoint path without doubling slashes', () => {
    expect(apiUrl({ baseUrl: `${BASE}/` }, API_ENDPOINTS.businesses.byId(7))).toBe(`${BASE}/businesses/7`);
    expect(apiUrl({ baseUrl: '' }, API_ENDPOINTS.categories.list)).toBe('/categories');
  });

  it('encodes path parameters', () => {
    expect(API_ENDPOINTS.places.bySlug('a b/c')).toBe('/places/a%20b%2Fc');
  });
});

describe('CategoryRepository', () => {
  it('loads GET /categories once and unwraps the items envelope', async () => {
    const http = setup();
    const repository = TestBed.inject(CategoryRepository);
    TestBed.tick();
    http.expectOne(`${BASE}/categories`).flush({ items: TEST_CATEGORIES });
    await settle();
    expect(repository.categories()).toEqual(TEST_CATEGORIES);
    http.verify();
  });

  it('exposes an empty list instead of throwing when the request fails', async () => {
    const http = setup();
    const repository = TestBed.inject(CategoryRepository);
    TestBed.tick();
    http.expectOne(`${BASE}/categories`).flush('down', { status: 500, statusText: 'Server Error' });
    await settle();
    expect(repository.categories()).toEqual([]);
  });
});

describe('PlaceRepository', () => {
  it('loads places and place categories from their endpoints', async () => {
    const http = setup();
    const repository = TestBed.inject(PlaceRepository);
    TestBed.tick();
    http.expectOne(`${BASE}/places?pageSize=${API_MAX_PAGE_SIZE}`).flush(paged(TEST_PLACES));
    http.expectOne(`${BASE}/place-categories`).flush({ items: TEST_PLACE_CATEGORIES });
    await settle();
    expect(repository.places()).toEqual(TEST_PLACES);
    expect(repository.getPlaceBySlug(TEST_PLACES[0].slug)).toEqual(TEST_PLACES[0]);
    expect(repository.categories()).toEqual(TEST_PLACE_CATEGORIES);
  });
});

describe('BusinessRepository', () => {
  let http: HttpTestingController;
  let repository: BusinessRepository;

  beforeEach(async () => {
    http = setup();
    repository = TestBed.inject(BusinessRepository);
    TestBed.tick();
    http.expectOne(`${BASE}/businesses?pageSize=${API_MAX_PAGE_SIZE}`).flush(paged(TEST_BUSINESSES));
    await settle();
  });

  afterEach(() => http.verify());

  it('loads the public list from the pagination envelope', () => {
    expect(repository.businesses()).toEqual(TEST_BUSINESSES);
    expect(repository.getBusiness(TEST_BUSINESSES[0].id)).toEqual(TEST_BUSINESSES[0]);
  });

  it('does not call the private owner endpoint until an owner page asks for it', async () => {
    http.expectNone(`${BASE}/my/businesses?pageSize=${API_MAX_PAGE_SIZE}`);
    const owned = repository.ownerBusinesses();
    TestBed.tick();
    const mine = TEST_BUSINESSES.filter((business) => business.ownerId === 1);
    http.expectOne(`${BASE}/my/businesses?pageSize=${API_MAX_PAGE_SIZE}`).flush(paged(mine));
    await settle();
    expect(owned()).toEqual(mine);
  });

  it('lists a category page through GET /businesses with only the non-empty filters', async () => {
    const food = TEST_BUSINESSES.filter((business) => business.categorySlug === 'food-restaurants');
    const result = firstValueFrom(
      repository.listBusinesses({ category: 'food-restaurants', subcategory: '', search: '', page: 1, pageSize: 12 }),
    );
    http.expectOne(`${BASE}/businesses?category=food-restaurants&page=1&pageSize=12`).flush(paged(food));
    expect((await result).items).toEqual(food);
  });

  it('loads one business by id and maps 404 to undefined', async () => {
    const found = firstValueFrom(repository.loadBusiness(1));
    http.expectOne(`${BASE}/businesses/1`).flush(TEST_BUSINESSES[0]);
    expect(await found).toEqual(TEST_BUSINESSES[0]);

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
    post.flush({ ...TEST_BUSINESSES[0], id: 99, name: REQUEST.name });
    expect((await created).id).toBe(99);
    TestBed.tick();
    http.expectOne(`${BASE}/businesses?pageSize=${API_MAX_PAGE_SIZE}`).flush(paged(TEST_BUSINESSES));
  });

  it('updates through PUT /my/businesses/{id} and maps 403/404 to BusinessAccessError', async () => {
    const forbidden = firstValueFrom(repository.updateBusiness(5, REQUEST));
    const put = http.expectOne(`${BASE}/my/businesses/5`);
    expect(put.request.method).toBe('PUT');
    put.flush(null, { status: 403, statusText: 'Forbidden' });
    await expect(forbidden).rejects.toEqual(new BusinessAccessError('FORBIDDEN'));

    const missing = firstValueFrom(repository.updateBusiness(999, REQUEST));
    http.expectOne(`${BASE}/my/businesses/999`).flush(null, { status: 404, statusText: 'Not Found' });
    await expect(missing).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('AnnouncementRepository', () => {
  it('loads the active notices for the header bar', async () => {
    const http = setup();
    const repository = TestBed.inject(AnnouncementRepository);
    TestBed.tick();
    const notice = { id: 3, title: 'Water supply notice', date: '2026-10-12', link: '/announcements/3' };
    http.expectOne(`${BASE}/announcements?active=true&limit=5`).flush({ ...paged([notice]), pageSize: 12 });
    await settle();
    expect(repository.active()).toEqual([notice]);
  });
});

describe('AuthService and authInterceptor', () => {
  const USER = { id: 1, name: 'Demo Owner', email: 'demo-owner@example.com', role: 'USER' as const };
  const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(resolve));

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('stores the token on login and attaches it to API requests only', async () => {
    const http = setup();
    const auth = TestBed.inject(AuthService);
    const client = TestBed.inject(HttpClient);

    const login = firstValueFrom(auth.login({ email: USER.email, password: 'secret' }));
    const post = http.expectOne(`${BASE}/auth/login`);
    expect(post.request.method).toBe('POST');
    expect(post.request.headers.has('Authorization')).toBe(false);
    post.flush({ accessToken: 'abc', tokenType: 'Bearer', expiresIn: 3600, user: USER });
    expect(await login).toEqual(USER);
    expect(auth.user()).toEqual(USER);
    expect(localStorage.getItem('tkg.accessToken')).toBe('abc');

    client.get(`${BASE}/my/businesses`).subscribe();
    expect(http.expectOne(`${BASE}/my/businesses`).request.headers.get('Authorization')).toBe('Bearer abc');
    client.get('https://tile.example/1.png').subscribe();
    expect(http.expectOne('https://tile.example/1.png').request.headers.has('Authorization')).toBe(false);
    http.verify();
  });

  it('restores the session from storage through GET /auth/me', async () => {
    localStorage.setItem('tkg.accessToken', 'saved');
    const http = setup();
    const auth = TestBed.inject(AuthService);
    await flushMicrotasks();
    const me = http.expectOne(`${BASE}/auth/me`);
    expect(me.request.headers.get('Authorization')).toBe('Bearer saved');
    me.flush(USER);
    expect(auth.user()).toEqual(USER);
  });

  it('clears a token the API rejects with 401', async () => {
    localStorage.setItem('tkg.accessToken', 'expired');
    const http = setup();
    const auth = TestBed.inject(AuthService);
    await flushMicrotasks();
    http.expectOne(`${BASE}/auth/me`).flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.token()).toBeNull();
    expect(auth.user()).toBeNull();
    expect(localStorage.getItem('tkg.accessToken')).toBeNull();
  });

  it('never reads or sends a token during server rendering', () => {
    localStorage.setItem('tkg.accessToken', 'saved');
    const http = setup('server');
    expect(TestBed.inject(AuthService).token()).toBeNull();
    TestBed.inject(HttpClient).get(`${BASE}/businesses`).subscribe();
    expect(http.expectOne(`${BASE}/businesses`).request.headers.has('Authorization')).toBe(false);
  });

  it('revokes the token on logout', () => {
    localStorage.setItem('tkg.accessToken', 'saved');
    const http = setup();
    const auth = TestBed.inject(AuthService);
    auth.logout();
    const post = http.expectOne(`${BASE}/auth/logout`);
    expect(post.request.headers.get('Authorization')).toBe('Bearer saved');
    post.flush(null, { status: 204, statusText: 'No Content' });
    expect(auth.token()).toBeNull();
    expect(localStorage.getItem('tkg.accessToken')).toBeNull();
  });
});
