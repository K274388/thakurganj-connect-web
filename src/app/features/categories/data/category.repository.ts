import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ENDPOINTS } from '../../../core/api/api-endpoints';
import { apiListResource } from '../../../core/api/api-resource';
import { API_CONFIG, apiUrl } from '../../../core/api/api.config';
import { ItemsResponse } from '../../../core/api/api-responses';
import { BusinessCategory } from '../models/category.models';

/**
 * Business category catalog from `GET /categories`.
 * Server-rendered responses are reused on the client through the HTTP transfer cache.
 */
@Injectable({ providedIn: 'root' })
export class CategoryRepository {
  private readonly config = inject(API_CONFIG);

  /** All categories, including inactive ones; use the category utils to filter and order them. */
  readonly categories = apiListResource(
    inject(HttpClient),
    apiUrl(this.config, API_ENDPOINTS.categories.list),
    (response) => (response as ItemsResponse<BusinessCategory>).items,
  ).items;
}
