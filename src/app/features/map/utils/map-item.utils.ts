import { Business } from '../../businesses/models/business.models';
import { Place } from '../../places/models/place.models';
import { MapCategorySelection, MapEntityType, MapFilters, MapItem, MapTypeFilter } from '../models/map-item.models';

export function isValidLatitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;
}

export function hasValidCoordinates(value: { latitude?: number | null; longitude?: number | null }): boolean {
  return isValidLatitude(value.latitude) && isValidLongitude(value.longitude);
}

/** Returns null for non-public entities or entities without valid coordinates. */
export function businessToMapItem(business: Business): MapItem | null {
  if (business.status !== 'ACTIVE') return null;
  const { latitude, longitude } = business;
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) return null;
  return {
    key: `business-${business.id}`,
    entityType: 'business',
    id: business.id,
    slug: business.slug,
    name: business.name,
    categoryId: business.categoryId,
    categorySlug: business.categorySlug,
    categoryName: business.categoryName,
    latitude,
    longitude,
    area: business.area ?? '',
    shortDescription: business.shortDescription ?? '',
    imageUrl: business.coverImageUrl || business.imageUrl || '',
  };
}

export function placeToMapItem(place: Place): MapItem | null {
  if (!place.active) return null;
  const { latitude, longitude } = place;
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) return null;
  return {
    key: `place-${place.id}`,
    entityType: 'place',
    id: place.id,
    slug: place.slug,
    name: place.name,
    categoryId: place.categoryId,
    categorySlug: place.categorySlug,
    categoryName: place.categoryName,
    latitude,
    longitude,
    area: place.area,
    shortDescription: place.shortDescription,
    imageUrl: place.coverImageUrl ?? '',
  };
}

export function buildMapItems(businesses: Business[], places: Place[]): MapItem[] {
  return [
    ...businesses.map(businessToMapItem).filter((item): item is MapItem => item !== null),
    ...places.map(placeToMapItem).filter((item): item is MapItem => item !== null),
  ];
}

export function filterMapItems(items: MapItem[], filters: MapFilters): MapItem[] {
  const query = filters.search.trim().toLocaleLowerCase();
  return items.filter((item) => {
    if (filters.type !== 'all' && item.entityType !== filters.type) return false;
    if (filters.category && (item.entityType !== filters.category.entityType || item.categorySlug !== filters.category.slug)) {
      return false;
    }
    return (
      !query ||
      [item.name, item.categoryName, item.area, item.shortDescription].join(' ').toLocaleLowerCase().includes(query)
    );
  });
}

export function parseTypeParam(value: string | null): MapTypeFilter {
  return value === 'business' || value === 'place' ? value : 'all';
}

/** Typed mode uses a plain slug (`food-restaurants`); All mode uses `business:slug` / `place:slug`. */
export function parseCategoryParam(value: string | null, type: MapTypeFilter): MapCategorySelection | null {
  if (!value) return null;
  const separator = value.indexOf(':');
  if (separator > 0) {
    const entityType = parseTypeParam(value.slice(0, separator));
    const slug = value.slice(separator + 1);
    if (entityType === 'all' || !slug || (type !== 'all' && type !== entityType)) return null;
    return { entityType, slug };
  }
  return type === 'all' ? null : { entityType: type, slug: value };
}

export function categoryToParam(category: MapCategorySelection | null, type: MapTypeFilter): string | null {
  if (!category) return null;
  return type === 'all' ? `${category.entityType}:${category.slug}` : category.slug;
}

export function categoryToOptionValue(category: MapCategorySelection): string {
  return `${category.entityType}:${category.slug}`;
}

export function optionValueToCategory(value: string): MapCategorySelection | null {
  return parseCategoryParam(value, 'all');
}

export function countByType(items: MapItem[]): Record<MapEntityType, number> {
  return {
    business: items.filter((item) => item.entityType === 'business').length,
    place: items.filter((item) => item.entityType === 'place').length,
  };
}

/** GeoJSON order is [longitude, latitude]. Prepared for a future GeoJSON source / symbol layer / clustering. */
export function mapItemsToGeoJson(items: MapItem[]) {
  return {
    type: 'FeatureCollection' as const,
    features: items.map((item) => ({
      type: 'Feature' as const,
      id: item.key,
      geometry: { type: 'Point' as const, coordinates: [item.longitude, item.latitude] as [number, number] },
      properties: { key: item.key, entityType: item.entityType, name: item.name },
    })),
  };
}

export function mapItemHref(item: MapItem): string {
  return item.entityType === 'business' ? `/businesses/${item.id}` : `/places/${item.slug}`;
}
