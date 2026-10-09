import { MOCK_BUSINESSES } from '../../businesses/data/business.mock';
import { Business } from '../../businesses/models/business.models';
import { BUSINESS_CATEGORIES } from '../data/category.mock';
import { BusinessCategory } from '../models/category.models';
import {
  findCategoryBySlug,
  formatBusinessCount,
  getActiveCategories,
  getActiveSubcategories,
  getBusinessCountForCategory,
  getBusinessCountForSubcategory,
  getCategoryBusinesses,
  toCategoryCard,
} from './category.utils';

describe('category utilities', () => {
  const categories: BusinessCategory[] = [
    { id: 2, slug: 'b', name: 'B', displayOrder: 2, active: true, subcategories: [] },
    { id: 3, slug: 'c', name: 'C', displayOrder: 3, active: false, subcategories: [] },
    { id: 1, slug: 'a', name: 'A', displayOrder: 1, active: true, subcategories: [] },
  ];

  it('returns only active categories sorted by displayOrder, not alphabetically', () => {
    expect(getActiveCategories(categories).map((item) => item.slug)).toEqual(['a', 'b']);
    const reversed = categories.map((item) => ({ ...item, displayOrder: 10 - item.displayOrder }));
    expect(getActiveCategories(reversed).map((item) => item.slug)).toEqual(['b', 'a']);
  });

  it('returns only active subcategories sorted by displayOrder', () => {
    const category: BusinessCategory = {
      ...categories[0],
      subcategories: [
        { id: 1, slug: 'z', categoryId: 2, name: 'Z', displayOrder: 1, active: true },
        { id: 2, slug: 'x', categoryId: 2, name: 'X', displayOrder: 3, active: false },
        { id: 3, slug: 'a', categoryId: 2, name: 'A', displayOrder: 2, active: true },
      ],
    };
    expect(getActiveSubcategories(category).map((item) => item.slug)).toEqual(['z', 'a']);
    expect(getActiveSubcategories(undefined)).toEqual([]);
  });

  it('finds categories by slug including inactive ones', () => {
    expect(findCategoryBySlug(categories, 'c')?.active).toBe(false);
    expect(findCategoryBySlug(categories, 'missing')).toBeUndefined();
  });

  it('counts only ACTIVE businesses', () => {
    const food = BUSINESS_CATEGORIES[0];
    const shopping = BUSINESS_CATEGORIES[1];
    expect(getBusinessCountForCategory(food.id, MOCK_BUSINESSES)).toBe(4);
    expect(getBusinessCountForCategory(shopping.id, MOCK_BUSINESSES)).toBe(4);
    expect(getBusinessCountForCategory(7, MOCK_BUSINESSES)).toBe(0);
    const mobile = shopping.subcategories.find((item) => item.slug === 'mobile')!;
    expect(getBusinessCountForSubcategory(mobile.id, MOCK_BUSINESSES)).toBe(1);
  });

  it('limits and filters category businesses', () => {
    const many = Array.from({ length: 9 }, (_, index) => ({
      ...MOCK_BUSINESSES[0],
      id: 100 + index,
      status: index === 0 ? 'INACTIVE' : 'ACTIVE',
    })) as Business[];
    expect(getCategoryBusinesses(1, many).length).toBe(8);
    expect(getCategoryBusinesses(1, many, 6).length).toBe(6);
  });

  it('formats business counts with correct grammar', () => {
    expect(formatBusinessCount(0)).toBe('0 businesses');
    expect(formatBusinessCount(1)).toBe('1 business');
    expect(formatBusinessCount(2)).toBe('2 businesses');
  });

  it('maps category data to a card using visual variant from data', () => {
    const card = toCategoryCard({ ...BUSINESS_CATEGORIES[2] }, 3);
    expect(card.slug).toBe('health');
    expect(card.colorVariant).toBe('magenta');
    expect(card.businessCount).toBe(3);
  });

  it('defines eight V1 categories with unique ids and slugs', () => {
    expect(BUSINESS_CATEGORIES.length).toBe(8);
    expect(new Set(BUSINESS_CATEGORIES.map((item) => item.slug)).size).toBe(8);
    const subIds = BUSINESS_CATEGORIES.flatMap((item) => item.subcategories.map((sub) => sub.id));
    expect(new Set(subIds).size).toBe(subIds.length);
  });
});
