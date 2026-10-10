import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export type DataSource = 'mock' | 'http';

export interface ApiConfig {
  /** Base URL of the Spring Boot API, e.g. `http://localhost:8080/api/v1`. */
  baseUrl: string;
  /** `mock` serves the bundled JSON demo data; `http` calls the API. Switching must not change the UI. */
  dataSource: DataSource;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => ({ baseUrl: environment.apiBaseUrl, dataSource: environment.dataSource }),
});

/** Joins the configured base URL and an endpoint path from `API_ENDPOINTS`. */
export function apiUrl(config: ApiConfig, path: string): string {
  return `${config.baseUrl.replace(/\/+$/, '')}${path}`;
}
