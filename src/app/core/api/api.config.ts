import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ApiConfig {
  /** Base URL of the Spring Boot API, e.g. `http://localhost:8080/api/v1`. */
  baseUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => ({ baseUrl: environment.apiBaseUrl }),
});

/** Joins the configured base URL and an endpoint path from `API_ENDPOINTS`. */
export function apiUrl(config: ApiConfig, path: string): string {
  return `${config.baseUrl.replace(/\/+$/, '')}${path}`;
}
