import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { CategoryCardComponent } from '../../../../shared/components/category-card/category-card.component';
import { BusinessCtaComponent } from '../../../home/components/business-cta/business-cta.component';
import { BusinessRepository } from '../../../businesses/data/business.repository';
import { CategoryRepository } from '../../data/category.repository';
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
  private readonly categoryRepository = inject(CategoryRepository);
  private readonly businessRepository = inject(BusinessRepository);

  readonly allCategories = linkedSignal(() => this.categoryRepository.categories());
  readonly businesses = linkedSignal(() => this.businessRepository.businesses());

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
