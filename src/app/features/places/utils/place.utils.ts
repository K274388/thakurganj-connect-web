import { PlaceCategory } from '../models/place-category.models';
import { Place } from '../models/place.models';

export function getActivePlaceCategories(categories: PlaceCategory[]): PlaceCategory[] {
  return categories.filter((category) => category.active).sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
}

export function getFeaturedPlaces(places: Place[], limit = 3): Place[] {
  return places
    .filter((place) => place.active && place.featured)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
    .slice(0, Math.max(0, limit));
}

export function getRelatedPlaces(places: Place[], current: Place, limit = 3): Place[] {
  const byOrder = (a: Place, b: Place) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name);
  const candidates = places.filter((place) => place.active && place.slug !== current.slug).sort(byOrder);
  const sameCategory = candidates.filter((place) => place.categorySlug === current.categorySlug);
  const others = candidates.filter((place) => place.categorySlug !== current.categorySlug);
  return [...sameCategory, ...others].slice(0, Math.max(0, limit));
}

export function getPlaceGalleryImages(place: Place): string[] {
  const urls = [place.coverImageUrl, ...place.images].filter(
    (url): url is string => typeof url === 'string' && url.trim().length > 0,
  );
  return [...new Set(urls)];
}

export function buildDirectionsUrl(place: Place): string | null {
  const { latitude, longitude } = place;
  const hasCoordinates =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;
  const destination = hasCoordinates
    ? `${latitude},${longitude}`
    : place.address?.trim()
      ? [place.address, place.area].filter((part) => part?.trim()).join(', ')
      : '';
  return destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    : null;
}
