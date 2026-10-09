export type MapEntityType = 'business' | 'place';
export type MapTypeFilter = 'all' | MapEntityType;

export interface MapItem {
  key: string;
  entityType: MapEntityType;
  id: string | number;
  slug: string;
  name: string;
  categoryId: string | number;
  categorySlug: string;
  categoryName: string;
  latitude: number;
  longitude: number;
  area: string;
  shortDescription: string;
  imageUrl: string;
}

/** A category selection that stays unambiguous across the Business and Place category domains. */
export interface MapCategorySelection {
  entityType: MapEntityType;
  slug: string;
}

export interface MapFilters {
  type: MapTypeFilter;
  category: MapCategorySelection | null;
  search: string;
}
