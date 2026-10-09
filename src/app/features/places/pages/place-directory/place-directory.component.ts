import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { FilterPillComponent } from '../../../../shared/components/filter-pill/filter-pill.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { PlaceCardComponent } from '../../../../shared/components/place-card/place-card.component';
import { SearchBoxComponent } from '../../../../shared/components/search-box/search-box.component';
import { CategoryOverviewComponent } from '../../components/category-overview/category-overview.component';
import { CategoryInfoService } from '../../data/category-info.service';
import { PlaceRepository } from '../../data/place.repository';
import { PlaceCategory } from '../../models/place-category.models';
import { Place } from '../../models/place.models';
import { getActivePlaceCategories } from '../../utils/place.utils';

const PAGE_SIZE = 12;
const PLACE_DIRECTORY_DESCRIPTION =
  'Explore landmarks, religious places, markets, transportation, hospitals, schools, parks and other useful places in Thakurganj.';

@Component({
  selector: 'app-place-directory',
  standalone: true,
  imports: [CategoryOverviewComponent, EmptyStateComponent, FilterPillComponent, PaginationComponent, PlaceCardComponent, SearchBoxComponent],
  templateUrl: './place-directory.component.html',
  styleUrl: './place-directory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceDirectoryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repository = inject(PlaceRepository);
  private readonly categoryInfoService = inject(CategoryInfoService);
  private readonly categories: PlaceCategory[] = getActivePlaceCategories();

  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal('');
  protected readonly categoryInfo = computed(() => this.categoryInfoService.getBySlug(this.selectedCategory()));
  protected readonly currentPage = signal(1);
  protected readonly pageSize = PAGE_SIZE;
  protected readonly categoryFilters = [
    { slug: '', label: 'All' },
    ...this.categories.map((category) => ({
      slug: category.slug,
      label:
        category.slug === 'religious'
          ? 'Religious'
          : category.slug === 'transportation'
            ? 'Transport'
            : category.name,
    })),
  ];
  protected readonly activePlaces = computed(() => this.repository.getPlaces().filter((place) => place.active));
  protected readonly filteredPlaces = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    const category = this.selectedCategory();

    return this.activePlaces()
      .filter((place) => {
        const matchesSearch =
          !query ||
          [
            place.name,
            place.categoryName,
            place.shortDescription,
            place.description,
            place.address,
            place.area,
            place.landmark,
          ]
            .join(' ')
            .toLocaleLowerCase()
            .includes(query);
        return matchesSearch && (!category || place.categorySlug === category);
      })
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  });
  protected readonly resultCount = computed(() => this.filteredPlaces().length);
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.resultCount() / PAGE_SIZE)));
  protected readonly safePage = computed(() => Math.min(Math.max(1, this.currentPage()), this.totalPages()));
  protected readonly pagedPlaces = computed(() => {
    const start = (this.safePage() - 1) * PAGE_SIZE;
    return this.filteredPlaces().slice(start, start + PAGE_SIZE);
  });
  protected readonly showingStart = computed(() =>
    this.resultCount() ? (this.safePage() - 1) * PAGE_SIZE + 1 : 0,
  );
  protected readonly showingEnd = computed(() => Math.min(this.safePage() * PAGE_SIZE, this.resultCount()));

  constructor(meta: Meta) {
    meta.updateTag({ name: 'description', content: PLACE_DIRECTORY_DESCRIPTION });
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const category = params.get('category') ?? '';
      const isValidCategory = !category || this.categories.some((item) => item.slug === category);
      this.searchTerm.set(params.get('search')?.trim() ?? '');
      this.selectedCategory.set(isValidCategory ? category : '');
      this.currentPage.set(this.parsePage(params.get('page')));

      if (!isValidCategory) {
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { category: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  protected submitSearch(search: string): void {
    void this.updateQuery({ search: search.trim() || null, page: null });
  }

  protected setCategory(category: string): void {
    void this.updateQuery({ category: category || null, page: null });
  }

  protected setPage(page: number): void {
    const validPage = Math.min(Math.max(1, Math.floor(page)), this.totalPages());
    void this.updateQuery({ page: validPage === 1 ? null : validPage });
  }

  protected clearFilters(): void {
    void this.router.navigateByUrl('/places');
  }

  private parsePage(value: string | null): number {
    const page = Number(value);
    return Number.isInteger(page) && page > 0 ? page : 1;
  }

  private updateQuery(
    queryParams: { search?: string | null; category?: string | null; page?: number | null },
  ): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
