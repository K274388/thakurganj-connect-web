import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ENDPOINTS, API_MAX_PAGE_SIZE } from '../../../core/api/api-endpoints';
import { apiListResource } from '../../../core/api/api-resource';
import { API_CONFIG, apiUrl } from '../../../core/api/api.config';
import { ItemsResponse, PagedResponse } from '../../../core/api/api-responses';
import { PlaceCategory } from '../models/place-category.models';
import { Place } from '../models/place.models';

/** Places and place categories from `GET /places` and `GET /place-categories`. */
@Injectable({ providedIn: 'root' })
export class PlaceRepository {
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

  getPlaces(): Place[] {
    return this.places();
  }

  getPlaceBySlug(slug: string): Place | undefined {
    return this.places().find((place) => place.slug === slug);
  }
}
