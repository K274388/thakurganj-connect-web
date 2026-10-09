import { Injectable } from '@angular/core';
import { CategoryInfo } from '../models/category-info.models';
import { CATEGORY_INFO } from './category-info.data';

@Injectable({ providedIn: 'root' })
export class CategoryInfoService {
  getBySlug(slug: string): CategoryInfo | null {
    return CATEGORY_INFO.find((info) => info.slug === slug) ?? null;
  }
}
