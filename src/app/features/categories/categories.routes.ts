import { Routes } from '@angular/router';
import { BUSINESS_CATEGORIES } from './data/category.mock';
import { findCategoryBySlug } from './utils/category.utils';

const SITE = 'Thakurganj Connect';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/categories/categories.component').then((module) => module.CategoriesComponent),
    title: `Business Categories | ${SITE}`,
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./pages/category-details/category-details.component').then(
        (module) => module.CategoryDetailsComponent,
      ),
    title: (route) => {
      const category = findCategoryBySlug(BUSINESS_CATEGORIES, route.paramMap.get('slug') ?? '');
      return category?.active ? `${category.name} in Thakurganj | ${SITE}` : `Category not found | ${SITE}`;
    },
  },
];
