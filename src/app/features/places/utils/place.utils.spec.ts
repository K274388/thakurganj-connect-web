import { TEST_PLACES, TEST_PLACE_CATEGORIES } from '../../../core/testing/fixtures';
import { getActivePlaceCategories, getFeaturedPlaces } from './place.utils';

describe('place utilities', () => {
  it('returns active categories in display order', () => {
    const categories = getActivePlaceCategories(TEST_PLACE_CATEGORIES);
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
    const places = getFeaturedPlaces(TEST_PLACES);
    expect(places.map((place) => place.slug)).toEqual([
      'thakurganj-junction',
      'hargauri-mandir',
      'demo-landmark-1',
    ]);
    expect(getFeaturedPlaces(TEST_PLACES, 2).length).toBe(2);
    expect(getFeaturedPlaces(TEST_PLACES, 0)).toEqual([]);
    expect(TEST_PLACE_CATEGORIES.every((category) => category.active)).toBe(true);
  });
});
