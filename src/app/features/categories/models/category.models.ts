export type CategoryVisualVariant = 'dark' | 'yellow' | 'magenta' | 'cream' | 'light';

export interface BusinessSubcategory {
  /** Database-style identifier. Never use it in URLs; use `slug` instead. */
  id: number;
  slug: string;
  categoryId: number;
  name: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

export interface BusinessCategory {
  /** Database-style identifier. Never use it in URLs; use `slug` instead. */
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  visualVariant?: CategoryVisualVariant;
  displayOrder: number;
  active: boolean;
  subcategories: BusinessSubcategory[];
}
