import { MOCK_PLACES } from '../data/place.mock';
import { PLACE_CATEGORIES } from '../data/place-category.mock';
import { getActivePlaceCategories, getFeaturedPlaces } from './place.utils';

describe('place utilities', () => {
  it('returns active categories in display order', () => {
    const categories = getActivePlaceCategories();
    expect(categories.length).toBe(9);
    expect(categories.map((category) => category.slug)).toEqual([
      'landmarks',
      'religious',
      'markets',
      'transportation',
      'hospitals',
      'schools',
      'parks',
      'sports',
      'other',
    ]);
  });

  it('selects only active featured places, sorts explicitly and applies the requested limit', () => {
    const places = getFeaturedPlaces(MOCK_PLACES);
    expect(places.map((place) => place.slug)).toEqual([
      'thakurganj-junction',
      'hargauri-mandir',
      'demo-landmark-1',
    ]);
    expect(getFeaturedPlaces(MOCK_PLACES, 2).length).toBe(2);
    expect(getFeaturedPlaces(MOCK_PLACES, 0)).toEqual([]);
    expect(PLACE_CATEGORIES.every((category) => category.active)).toBe(true);
  });
});
