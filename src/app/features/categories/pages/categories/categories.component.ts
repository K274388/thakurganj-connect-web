import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { CategoryCardComponent } from '../../../../shared/components/category-card/category-card.component';
import { BusinessCtaComponent } from '../../../home/components/business-cta/business-cta.component';
import { BusinessRepository } from '../../../businesses/data/business.repository';
import { BUSINESS_CATEGORIES } from '../../data/category.mock';
import { getActiveCategories, getBusinessCountForCategory, toCategoryCard } from '../../utils/category.utils';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink, CategoryCardComponent, BusinessCtaComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  readonly allCategories = signal(BUSINESS_CATEGORIES);
  readonly businesses = signal(inject(BusinessRepository).getBusinesses());

  readonly cards = computed(() =>
    getActiveCategories(this.allCategories()).map((category) =>
      toCategoryCard(category, getBusinessCountForCategory(category.id, this.businesses())),
    ),
  );

  constructor(meta: Meta) {
    meta.updateTag({
      name: 'description',
      content:
        'Browse restaurants, shops, healthcare, services, education and other local businesses in Thakurganj.',
    });
  }
}
