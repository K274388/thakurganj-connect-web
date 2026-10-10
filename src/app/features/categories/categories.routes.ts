import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { CategoryRepository } from './data/category.repository';
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
    // Title resolvers run in an injection context. The page also sets the title once its data is available.
    title: (route) => {
      const category = findCategoryBySlug(inject(CategoryRepository).categories(), route.paramMap.get('slug') ?? '');
      return category?.active ? `${category.name} in Thakurganj | ${SITE}` : `Category not found | ${SITE}`;
    },
  },
];
