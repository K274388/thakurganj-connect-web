import { Category, CategoryColorVariant } from '../../../shared/models/category';
import { Business } from '../../businesses/models/business.models';
import { BusinessCategory, BusinessSubcategory, CategoryVisualVariant } from '../models/category.models';

const BY_DISPLAY_ORDER = (a: { displayOrder: number }, b: { displayOrder: number }): number =>
  a.displayOrder - b.displayOrder;

export function getActiveCategories(categories: BusinessCategory[]): BusinessCategory[] {
  return categories.filter((category) => category.active).sort(BY_DISPLAY_ORDER);
}

export function getActiveSubcategories(category: BusinessCategory | undefined): BusinessSubcategory[] {
  return (category?.subcategories ?? []).filter((subcategory) => subcategory.active).sort(BY_DISPLAY_ORDER);
}

/** Returns the category for a slug, regardless of its active flag, so callers can tell "inactive" from "missing". */
export function findCategoryBySlug(categories: BusinessCategory[], slug: string): BusinessCategory | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getActiveBusinesses(businesses: Business[]): Business[] {
  return businesses.filter((business) => business.status === 'ACTIVE');
}

export function getBusinessCountForCategory(categoryId: number, businesses: Business[]): number {
  return getActiveBusinesses(businesses).filter((business) => business.categoryId === categoryId).length;
}

export function getBusinessCountForSubcategory(subcategoryId: number, businesses: Business[]): number {
  return getActiveBusinesses(businesses).filter((business) => business.subcategoryId === subcategoryId).length;
}

export function getCategoryBusinesses(categoryId: number, businesses: Business[], limit?: number): Business[] {
  const matches = getActiveBusinesses(businesses).filter((business) => business.categoryId === categoryId);
  return limit === undefined ? matches : matches.slice(0, limit);
}

export function formatBusinessCount(count: number): string {
  return `${count} ${count === 1 ? 'business' : 'businesses'}`;
}

const VARIANT_MAP: Record<CategoryVisualVariant, CategoryColorVariant> = {
  dark: 'black',
  yellow: 'yellow',
  magenta: 'magenta',
  cream: 'light-yellow',
  light: 'light-gray',
};

const ICON_GLYPHS: Record<string, string> = {
  utensils: '🍴',
  shopping: '▣',
  health: '+',
  services: '↗',
  education: '✎',
  automobile: '⌁',
  home: '⌂',
  finance: '₹',
};

export function toCategoryCard(category: BusinessCategory, businessCount?: number): Category {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    icon: ICON_GLYPHS[category.icon ?? ''] ?? '✳',
    colorVariant: VARIANT_MAP[category.visualVariant ?? 'cream'],
    businessCount,
  };
}
