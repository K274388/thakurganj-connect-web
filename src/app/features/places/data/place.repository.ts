import { Injectable, signal } from '@angular/core';
import { MOCK_PLACES } from './place.mock';
import { Place } from '../models/place.models';

/** Isolates the directory from its mock source for future API-backed loading. */
@Injectable({ providedIn: 'root' })
export class PlaceRepository {
  private readonly store = signal<Place[]>(MOCK_PLACES.map((place) => ({ ...place, images: [...place.images] })));

  readonly places = this.store.asReadonly();

  getPlaces(): Place[] {
    return this.store();
  }

  getPlaceBySlug(slug: string): Place | undefined {
    return this.store().find((place) => place.slug === slug);
  }
}
