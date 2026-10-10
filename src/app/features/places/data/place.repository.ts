import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, inject, signal } from '@angular/core';
import { API_ENDPOINTS, API_MAX_PAGE_SIZE } from '../../../core/api/api-endpoints';
import { apiListResource } from '../../../core/api/api-resource';
import { API_CONFIG, apiUrl } from '../../../core/api/api.config';
import { ItemsResponse, PagedResponse } from '../../../core/api/api-responses';
import { PlaceCategory } from '../models/place-category.models';
import { Place } from '../models/place.models';
import { PLACE_CATEGORIES } from './place-category.mock';
import { MOCK_PLACES } from './place.mock';

/** Places and place categories. The implementation follows `environment.dataSource`. */
@Injectable({
  providedIn: 'root',
  useFactory: () =>
    inject(API_CONFIG).dataSource === 'http' ? inject(HttpPlaceRepository) : inject(MockPlaceRepository),
})
export abstract class PlaceRepository {
  abstract readonly places: Signal<Place[]>;
  abstract readonly categories: Signal<PlaceCategory[]>;

  getPlaces(): Place[] {
    return this.places();
  }

  getPlaceBySlug(slug: string): Place | undefined {
    return this.places().find((place) => place.slug === slug);
  }
}

@Injectable({ providedIn: 'root' })
export class MockPlaceRepository extends PlaceRepository {
  readonly places = signal<Place[]>(MOCK_PLACES.map((place) => ({ ...place, images: [...place.images] }))).asReadonly();
  readonly categories = signal(PLACE_CATEGORIES).asReadonly();
}

/** `GET /places` and `GET /place-categories`. */
@Injectable({ providedIn: 'root' })
export class HttpPlaceRepository extends PlaceRepository {
  private readonly config = inject(API_CONFIG);
  private readonly http = inject(HttpClient);

  readonly places = apiListResource(
    this.http,
    `${apiUrl(this.config, API_ENDPOINTS.places.list)}?pageSize=${API_MAX_PAGE_SIZE}`,
    (response) => (response as PagedResponse<Place>).items,
  ).items;
  readonly categories = apiListResource(
    this.http,
    apiUrl(this.config, API_ENDPOINTS.placeCategories.list),
    (response) => (response as ItemsResponse<PlaceCategory>).items,
  ).items;
}
