import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { map } from 'rxjs';
import { BusinessCardComponent } from '../../../../shared/components/business-card/business-card.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { BusinessCtaComponent } from '../../../home/components/business-cta/business-cta.component';
import { BusinessRepository } from '../../../businesses/data/business.repository';
import { BUSINESS_CATEGORIES } from '../../data/category.mock';
import {
  findCategoryBySlug,
  formatBusinessCount,
  getActiveSubcategories,
  getBusinessCountForCategory,
  getBusinessCountForSubcategory,
  getCategoryBusinesses,
  toCategoryCard,
} from '../../utils/category.utils';

export const CATEGORY_PREVIEW_LIMIT = 6;

@Component({
  selector: 'app-category-details',
  standalone: true,
  imports: [RouterLink, BusinessCardComponent, EmptyStateComponent, BusinessCtaComponent],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetailsComponent {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly allCategories = signal(BUSINESS_CATEGORIES);
  readonly businesses = signal(inject(BusinessRepository).getBusinesses());
  readonly previewLimit = CATEGORY_PREVIEW_LIMIT;
  protected readonly formatCount = formatBusinessCount;

  private readonly slug = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );

  /** `unavailable` covers categories that exist but are not active; `notFound` covers unknown slugs. */
  readonly state = computed(() => {
    const category = findCategoryBySlug(this.allCategories(), this.slug());
    if (!category) return { status: 'notFound' as const };
    if (!category.active) return { status: 'unavailable' as const };
    return { status: 'success' as const, category };
  });

  readonly category = computed(() => {
    const state = this.state();
    return state.status === 'success' ? state.category : null;
  });
  readonly card = computed(() => {
    const category = this.category();
    return category ? toCategoryCard(category) : null;
  });
  readonly businessCount = computed(() => {
    const category = this.category();
    return category ? getBusinessCountForCategory(category.id, this.businesses()) : 0;
  });
  readonly subcategories = computed(() =>
    getActiveSubcategories(this.category() ?? undefined).map((subcategory) => ({
      ...subcategory,
      count: getBusinessCountForSubcategory(subcategory.id, this.businesses()),
    })),
  );
  readonly preview = computed(() => {
    const category = this.category();
    return category ? getCategoryBusinesses(category.id, this.businesses(), CATEGORY_PREVIEW_LIMIT) : [];
  });

  constructor() {
    effect(() => this.updateSeo());
  }

  protected browseCategories(): void {
    void this.router.navigate(['/categories']);
  }

  private updateSeo(): void {
    const category = this.category();
    if (category) {
      this.title.setTitle(`${category.name} in Thakurganj | Thakurganj Connect`);
      this.meta.updateTag({
        name: 'description',
        content: `${category.description ?? `Local businesses in ${category.name}.`} Find ${category.name} businesses in Thakurganj.`,
      });
    } else {
      const label = this.state().status === 'unavailable' ? 'Category unavailable' : 'Category not found';
      this.title.setTitle(`${label} | Thakurganj Connect`);
    }
  }
}

