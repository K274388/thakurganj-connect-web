import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideX } from '@lucide/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { catchError, distinctUntilChanged, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { API_MAX_PAGE_SIZE } from '../../../../core/api/api-endpoints';
import { PagedResponse } from '../../../../core/api/api-responses';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { getBusinessImageArtwork } from '../../../../shared/utils/business-image-artwork';
import { CategoryRepository } from '../../../categories/data/category.repository';
import { BusinessCategory, BusinessSubcategory } from '../../../categories/models/category.models';
import { getActiveCategories, getActiveSubcategories } from '../../../categories/utils/category.utils';
import { BusinessRepository } from '../../data/business.repository';
import { Business, BusinessSort } from '../../models/business.models';

const DEFAULT_SORT: BusinessSort = 'name-asc';
const PAGE_SIZE = 12;
const EMPTY_RESULTS: PagedResponse<Business> = { items: [], page: 1, pageSize: PAGE_SIZE, totalItems: 0, totalPages: 0 };

@Component({
  selector: 'app-business-directory',
  standalone: true,
  imports: [RouterLink, PaginationComponent, LucideX],
  templateUrl: './business-directory.component.html',
  styleUrl: './business-directory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessDirectoryComponent {
  private readonly businessRepository = inject(BusinessRepository);
  private readonly categoryRepository = inject(CategoryRepository);

  readonly allCategories = linkedSignal(() => this.categoryRepository.categories());
  readonly categories = computed(() => getActiveCategories(this.allCategories()));
  readonly searchTerm = signal('');
  readonly selectedCategory = signal('');
  readonly selectedSubcategory = signal('');
  readonly selectedArea = signal('');
  readonly sortBy = signal<BusinessSort>(DEFAULT_SORT);
  readonly currentPage = signal(1);

  /** The current page of results, as returned by `GET /businesses` for the URL's filters. */
  readonly results = signal<PagedResponse<Business>>(EMPTY_RESULTS);
  readonly loading = signal(true);
  readonly loadFailed = signal(false);

  readonly selectedCategoryData = computed(() =>
    this.categories().find((category) => category.slug === this.selectedCategory()),
  );
  readonly filterOptions = computed(() => ({
    subcategories: getActiveSubcategories(this.selectedCategoryData()),
  }));
  /** Businesses in the selected category (and area), counted per subcategory; loaded per category. */
  readonly subcategoryCounts = signal({ total: 0, counts: new Map<string, number>() });
  readonly resultTitle = computed(
    () => this.subcategoryLabel() || this.categoryLabel() || 'Local businesses',
  );
  readonly hasFilters = computed(
    () => !!(this.searchTerm() || this.selectedCategory() || this.selectedSubcategory() || this.selectedArea()),
  );
  readonly pagedBusinesses = computed(() => this.results().items);
  readonly resultCount = computed(() => this.results().totalItems);
  readonly totalPages = computed(() => Math.max(1, this.results().totalPages));
  readonly safePage = computed(() => Math.min(Math.max(1, this.currentPage()), this.totalPages()));

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    meta: Meta,
  ) {
    meta.updateTag({
      name: 'description',
      content: 'Find shops, restaurants, healthcare, services and local businesses in Thakurganj.',
    });
    const filters$ = this.route.queryParamMap.pipe(
      map((params) => ({
        search: params.get('search')?.trim() ?? '',
        category: params.get('category') ?? '',
        subcategory: params.get('subcategory') ?? '',
        area: params.get('area') ?? '',
        sort: this.parseSort(params.get('sort')),
        page: this.parsePage(params.get('page')),
      })),
      tap((filters) => {
        this.searchTerm.set(filters.search);
        this.selectedCategory.set(filters.category);
        this.selectedSubcategory.set(filters.subcategory);
        this.selectedArea.set(filters.area);
        this.sortBy.set(filters.sort);
        this.currentPage.set(filters.page);
      }),
      // Replay so the second subscriber also gets the route's synchronous first emission.
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    filters$
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap((filters) =>
          this.businessRepository.listBusinesses({ ...filters, pageSize: PAGE_SIZE }).pipe(
            map((response) => ({ response, failed: false })),
            catchError(() => of({ response: EMPTY_RESULTS, failed: true })),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ response, failed }) => {
        this.results.set(response);
        this.loadFailed.set(failed);
        this.loading.set(false);
      });

    filters$
      .pipe(
        distinctUntilChanged((a, b) => a.category === b.category && a.area === b.area),
        switchMap(({ category, area }) =>
          category
            ? this.businessRepository
                .listBusinesses({ category, area, pageSize: API_MAX_PAGE_SIZE })
                .pipe(catchError(() => of(EMPTY_RESULTS)))
            : of(EMPTY_RESULTS),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        const counts = new Map<string, number>();
        for (const business of response.items) {
          const slug = business.subcategorySlug;
          if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
        }
        this.subcategoryCounts.set({ total: response.totalItems, counts });
      });
  }

  protected onSearchSubmit(event: Event, search: string): void {
    event.preventDefault();
    this.applySearch(search, false);
  }

  protected onSearchInput(search: string): void {
    this.applySearch(search, true);
  }

  protected toggleCategory(category: string): void {
    void this.updateQuery({
      category: this.selectedCategory() === category ? null : category,
      subcategory: null,
      search: null,
      page: null,
    });
  }

  protected clearCategory(): void {
    void this.updateQuery({ category: null, subcategory: null, page: null });
  }

  protected setSubcategory(subcategory: string): void {
    void this.updateQuery({ subcategory: subcategory || null, page: null });
  }

  protected setSort(sort: BusinessSort): void {
    void this.updateQuery({ sort: sort === DEFAULT_SORT ? null : sort, page: null });
  }

  protected setPage(page: number): void {
    const validPage = Math.min(Math.max(1, Math.floor(page)), this.totalPages());
    void this.updateQuery({ page: validPage === 1 ? null : validPage });
  }

  protected resetAll(): void {
    void this.router.navigate([], { relativeTo: this.route });
  }

  protected categoryIcon(categoryName: string): string {
    return getBusinessImageArtwork(categoryName)?.icon ?? '🏪';
  }

  protected businessIcon(business: Business): string {
    return getBusinessImageArtwork(business.categoryName, business.subcategoryName)?.icon ?? '🏪';
  }

  protected subcategoryPreview(category: BusinessCategory): string {
    return getActiveSubcategories(category)
      .slice(0, 3)
      .map((subcategory: Pick<BusinessSubcategory, 'name'>) => subcategory.name)
      .join(' · ');
  }

  protected categoryLabel(): string {
    return this.categories().find((category) => category.slug === this.selectedCategory())?.name ?? '';
  }

  protected subcategoryLabel(): string {
    const subcategories = this.categories().flatMap((category) => category.subcategories);
    return subcategories.find((subcategory) => subcategory.slug === this.selectedSubcategory())?.name ?? '';
  }

  private applySearch(search: string, replaceUrl: boolean): void {
    const value = search.trim();
    const params: Record<string, string | number | null> = { search: value || null, page: null };
    if (value) {
      params['category'] = null;
      params['subcategory'] = null;
    }
    void this.updateQuery(params, replaceUrl);
  }

  private async updateQuery(
    params: Record<string, string | number | null>,
    replaceUrl = false,
  ): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }

  private parseSort(sort: string | null): BusinessSort {
    return sort === 'name-desc' || sort === 'newest' ? sort : DEFAULT_SORT;
  }

  private parsePage(page: string | null): number {
    const value = Number(page);
    return Number.isSafeInteger(value) && value > 0 ? value : 1;
  }
}
