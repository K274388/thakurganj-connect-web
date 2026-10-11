import { PlatformLocation } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ApiConfig {
  /** Absolute base URL of the Spring Boot API, e.g. `https://dev.thakurganj.info/api/v1`. */
  baseUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => ({ baseUrl: resolveApiBaseUrl(environment.apiBaseUrl, inject(PlatformLocation)) }),
});

/**
 * Makes a path-only base (`/api/v1`) absolute against the origin the page was served from, so the browser calls the
 * API on its own host (localhost, the dev.thakurganj.info tunnel or production) without CORS, and server and browser
 * build the same URLs, which the HTTP transfer cache needs. Absolute bases and `''` (not configured) are kept.
 */
export function resolveApiBaseUrl(
  base: string,
  location: Pick<PlatformLocation, 'protocol' | 'hostname' | 'port'>,
): string {
  if (!base.startsWith('/') || base.startsWith('//')) return base;
  const port = location.port ? `:${location.port}` : '';
  return `${location.protocol}//${location.hostname}${port}${base}`;
}

/** Joins the configured base URL and an endpoint path from `API_ENDPOINTS`. */
export function apiUrl(config: ApiConfig, path: string): string {
  return `${config.baseUrl.replace(/\/+$/, '')}${path}`;
}
