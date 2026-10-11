import { Business } from '../../features/businesses/models/business.models';
import { BusinessCategory } from '../../features/categories/models/category.models';
import { PlaceCategory } from '../../features/places/models/place-category.models';
import { Place } from '../../features/places/models/place.models';
import businesses from './fixtures/businesses.json';
import categories from './fixtures/categories.json';
import placeCategories from './fixtures/place-categories.json';
import places from './fixtures/places.json';

/**
 * Unit-test fixtures shaped like the API responses (docs/api/openapi.yaml). Spec files only; the app always loads
 * its data from the backend. Owner 1 owns businesses 1, 2 and 21 (21 is INACTIVE); every other listing is owner 2's.
 */
export const TEST_BUSINESSES = businesses as Business[];
export const TEST_CATEGORIES = categories as BusinessCategory[];
export const TEST_PLACES = places as Place[];
export const TEST_PLACE_CATEGORIES = placeCategories as PlaceCategory[];
