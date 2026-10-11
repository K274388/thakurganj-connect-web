import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_CONFIG, ApiConfig, resolveApiBaseUrl } from './api.config';
import {
  API_SERVER_ORIGIN,
  SSR_API_TIMEOUT_MS,
  serverApiInterceptor,
  transferCacheOriginMap,
} from './server-api.interceptor';

const BASE = 'https://dev.thakurganj.info/api/v1';
const API_ORIGIN = 'http://localhost:8080';

/** Without `serverOrigin` the injector looks like the browser's: the server config is what provides it. */
function setup(serverOrigin?: string) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([serverApiInterceptor])),
      provideHttpClientTesting(),
      { provide: API_CONFIG, useValue: { baseUrl: BASE } satisfies ApiConfig },
      ...(serverOrigin ? [{ provide: API_SERVER_ORIGIN, useValue: serverOrigin }] : []),
    ],
  });
  return { http: TestBed.inject(HttpClient), backend: TestBed.inject(HttpTestingController) };
}

describe('resolveApiBaseUrl', () => {
  it('makes a path-only base absolute against the page origin, including the tunnel hostname', () => {
    expect(resolveApiBaseUrl('/api/v1', { protocol: 'https:', hostname: 'dev.thakurganj.info', port: '' })).toBe(BASE);
    expect(resolveApiBaseUrl('/api/v1', { protocol: 'http:', hostname: 'localhost', port: '4200' })).toBe(
      'http://localhost:4200/api/v1',
    );
  });

  it('keeps absolute, protocol-relative and unconfigured bases unchanged', () => {
    const location = { protocol: 'https:', hostname: 'dev.thakurganj.info', port: '' };
    expect(resolveApiBaseUrl('https://api.example.test/api/v1', location)).toBe('https://api.example.test/api/v1');
    expect(resolveApiBaseUrl('//api.example.test/api/v1', location)).toBe('//api.example.test/api/v1');
    expect(resolveApiBaseUrl('', location)).toBe('');
  });
});

describe('serverApiInterceptor', () => {
  it('leaves browser requests on the public origin', () => {
    const { http, backend } = setup();
    http.get(`${BASE}/categories`).subscribe();
    backend.expectOne(`${BASE}/categories`).flush({ items: [] });
    backend.verify();
  });

  it('sends server-side API calls straight to the API origin, keeping path and query', () => {
    const { http, backend } = setup(API_ORIGIN);
    http.get(`${BASE}/businesses?pageSize=100`).subscribe();
    backend.expectOne(`${API_ORIGIN}/api/v1/businesses?pageSize=100`).flush({ items: [] });
    backend.verify();
  });

  it('does not touch non-API requests on the server', () => {
    const { http, backend } = setup(API_ORIGIN);
    http.get('https://tile.openstreetmap.org/1/1/1.png', { responseType: 'blob' }).subscribe();
    backend.expectOne('https://tile.openstreetmap.org/1/1/1.png').flush(new Blob());
    backend.verify();
  });

  it('bounds how long a server-side API call may hold the render', () => {
    const { http, backend } = setup(API_ORIGIN);
    http.get(`${BASE}/categories`).subscribe();
    const request = backend.expectOne(`${API_ORIGIN}/api/v1/categories`);
    expect(request.request.timeout).toBe(SSR_API_TIMEOUT_MS);
    request.flush({ items: [] });
  });

  it('does not time out browser requests', () => {
    const { http, backend } = setup();
    http.get(`${BASE}/categories`).subscribe();
    const request = backend.expectOne(`${BASE}/categories`);
    expect(request.request.timeout).toBeUndefined();
    request.flush({ items: [] });
  });
});

describe('transferCacheOriginMap', () => {
  it('stores server responses under the origin the browser requests', () => {
    expect(transferCacheOriginMap(API_ORIGIN, BASE)).toEqual({ [API_ORIGIN]: 'https://dev.thakurganj.info' });
  });

  it('maps nothing when the API base is not configured', () => {
    expect(transferCacheOriginMap(API_ORIGIN, '')).toEqual({});
  });
});
