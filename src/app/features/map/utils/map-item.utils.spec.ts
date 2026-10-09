import { describe, expect, it } from 'vitest';
import { business, place } from '../testing/map-fixtures';
import {
  businessToMapItem,
  buildMapItems,
  categoryToParam,
  filterMapItems,
  hasValidCoordinates,
  mapItemsToGeoJson,
  parseCategoryParam,
  placeToMapItem,
} from './map-item.utils';

describe('map item utils', () => {
  it('adapts a business to a MapItem with a collision-free key', () => {
    expect(businessToMapItem(business())).toMatchObject({
      key: 'business-101',
      entityType: 'business',
      id: 101,
      name: 'Saffron Kitchen',
      categorySlug: 'food-restaurants',
      area: 'Main Road',
      latitude: 26.1,
      longitude: 87.9,
    });
  });

  it('adapts a place to a MapItem', () => {
    expect(placeToMapItem(place())).toMatchObject({ key: 'place-p1', entityType: 'place', slug: 'junction', categoryName: 'Transportation' });
    expect(buildMapItems([business({ id: 1 })], [place({ id: 1 })]).map((i) => i.key)).toEqual(['business-1', 'place-1']);
  });

  it('excludes inactive businesses and places', () => {
    expect(businessToMapItem(business({ status: 'INACTIVE' }))).toBeNull();
    expect(placeToMapItem(place({ active: false }))).toBeNull();
  });

  it('validates coordinates, treating zero as valid', () => {
    expect(hasValidCoordinates({ latitude: 0, longitude: 0 })).toBe(true);
    expect(businessToMapItem(business({ latitude: 0, longitude: 0 }))).not.toBeNull();
    expect(placeToMapItem(place({ latitude: 0, longitude: 0 }))).not.toBeNull();
    expect(hasValidCoordinates({ latitude: 91, longitude: 0 })).toBe(false);
    expect(hasValidCoordinates({ latitude: 0, longitude: -181 })).toBe(false);
    expect(hasValidCoordinates({ latitude: NaN, longitude: 0 })).toBe(false);
    expect(hasValidCoordinates({ latitude: Infinity, longitude: 0 })).toBe(false);
    expect(hasValidCoordinates({ latitude: null, longitude: 10 })).toBe(false);
    expect(businessToMapItem(business({ latitude: undefined }))).toBeNull();
  });

  it('filters by type, category, search and combinations', () => {
    const items = buildMapItems(
      [business(), business({ id: 102, name: 'Cloth House', categorySlug: 'shopping', categoryName: 'Shopping', area: 'Bazaar', shortDescription: 'Sarees' })],
      [place(), place({ id: 'p2', slug: 'mandir', name: 'Hargauri Mandir', categorySlug: 'religious', categoryName: 'Religious Places' })],
    );
    const all = { type: 'all', category: null, search: '' } as const;
    expect(filterMapItems(items, all).length).toBe(4);
    expect(filterMapItems(items, { ...all, type: 'business' }).length).toBe(2);
    expect(filterMapItems(items, { ...all, type: 'place' }).length).toBe(2);
    expect(filterMapItems(items, { ...all, category: { entityType: 'business', slug: 'food-restaurants' } }).map((i) => i.key)).toEqual(['business-101']);
    expect(filterMapItems(items, { ...all, category: { entityType: 'place', slug: 'religious' } }).map((i) => i.key)).toEqual(['place-p2']);
    expect(filterMapItems(items, { ...all, search: '  KEBAB ' }).map((i) => i.key)).toEqual(['business-101']);
    expect(filterMapItems(items, { ...all, search: 'bazaar' }).map((i) => i.key)).toEqual(['business-102']);
    expect(filterMapItems(items, { ...all, search: 'religious' }).map((i) => i.key)).toEqual(['place-p2']);
    expect(filterMapItems(items, { type: 'place', category: null, search: 'kebab' })).toEqual([]);
    expect(filterMapItems(items, { type: 'business', category: { entityType: 'business', slug: 'shopping' }, search: 'saree' }).length).toBe(1);
  });

  it('keeps business and place categories unambiguous in query params', () => {
    expect(parseCategoryParam('food-restaurants', 'business')).toEqual({ entityType: 'business', slug: 'food-restaurants' });
    expect(parseCategoryParam('business:food-restaurants', 'all')).toEqual({ entityType: 'business', slug: 'food-restaurants' });
    expect(parseCategoryParam('place:religious', 'business')).toBeNull();
    expect(parseCategoryParam('religious', 'all')).toBeNull();
    expect(categoryToParam({ entityType: 'place', slug: 'religious' }, 'all')).toBe('place:religious');
    expect(categoryToParam({ entityType: 'place', slug: 'religious' }, 'place')).toBe('religious');
  });

  it('produces GeoJSON in longitude, latitude order', () => {
    const geo = mapItemsToGeoJson(buildMapItems([business()], []));
    expect(geo.features[0].geometry.coordinates).toEqual([87.9, 26.1]);
  });
});
