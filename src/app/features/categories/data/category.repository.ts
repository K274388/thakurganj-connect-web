import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, inject, signal } from '@angular/core';
import { API_ENDPOINTS } from '../../../core/api/api-endpoints';
import { apiListResource } from '../../../core/api/api-resource';
import { API_CONFIG, apiUrl } from '../../../core/api/api.config';
import { ItemsResponse } from '../../../core/api/api-responses';
import { BusinessCategory } from '../models/category.models';
import { BUSINESS_CATEGORIES } from './category.mock';

/** Business category catalog. The implementation follows `environment.dataSource`. */
@Injectable({
  providedIn: 'root',
  useFactory: () =>
    inject(API_CONFIG).dataSource === 'http' ? inject(HttpCategoryRepository) : inject(MockCategoryRepository),
})
export abstract class CategoryRepository {
  /** All categories, including inactive ones; use the category utils to filter and order them. */
  abstract readonly categories: Signal<BusinessCategory[]>;
}

@Injectable({ providedIn: 'root' })
export class MockCategoryRepository extends CategoryRepository {
  readonly categories = signal(BUSINESS_CATEGORIES).asReadonly();
}

/** `GET /categories`. Server-rendered responses are reused on the client through the HTTP transfer cache. */
@Injectable({ providedIn: 'root' })
export class HttpCategoryRepository extends CategoryRepository {
  private readonly config = inject(API_CONFIG);

  readonly categories = apiListResource(
    inject(HttpClient),
    apiUrl(this.config, API_ENDPOINTS.categories.list),
    (response) => (response as ItemsResponse<BusinessCategory>).items,
  ).items;
}
