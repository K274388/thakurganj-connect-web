import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { getBusinessImageArtwork } from '../../../../shared/utils/business-image-artwork';
import { BUSINESS_CATEGORIES } from '../../../categories/data/category.mock';
import { BusinessCategory, BusinessSubcategory } from '../../../categories/models/category.models';
import { getActiveCategories, getActiveSubcategories } from '../../../categories/utils/category.utils';
import { BusinessRepository } from '../../data/business.repository';
import { Business, BusinessSort } from '../../models/business.models';

const DEFAULT_SORT: BusinessSort = 'name-asc';
const PAGE_SIZE = 12;

@Component({
  selector: 'app-business-directory',
  standalone: true,
  imports: [RouterLink, PaginationComponent],
  templateUrl: './business-directory.component.html',
  styleUrl: './business-directory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessDirectoryComponent {
  readonly businesses = signal<Business[]>(inject(BusinessRepository).getBusinesses());
  readonly allCategories = signal(BUSINESS_CATEGORIES);
  readonly categories = computed(() => getActiveCategories(this.allCategories()));
  readonly searchTerm = signal('');
  readonly selectedCategory = signal('');
  readonly selectedSubcategory = signal('');
  readonly selectedArea = signal('');
  readonly sortBy = signal<BusinessSort>(DEFAULT_SORT);
  readonly currentPage = signal(1);

  readonly activeBusinesses = computed(() =>
    this.businesses().filter((business) => business.status === 'ACTIVE'),
  );
  readonly selectedCategoryData = computed(() =>
    this.categories().find((category) => category.slug === this.selectedCategory()),
  );
  readonly filterOptions = computed(() => ({
    subcategories: getActiveSubcategories(this.selectedCategoryData()),
  }));
  readonly resultTitle = computed(
    () => this.subcategoryLabel() || this.categoryLabel() || 'Local businesses',
  );
  readonly filteredBusinesses = computed(() => {
    const query = this.searchTerm().trim().toLocaleLowerCase();
    return this.activeBusinesses().filter((business) => {
      const matchesSearch =
        !query ||
        [
          business.name,
          business.shortDescription,
          business.categoryName,
          business.subcategoryName,
          ...business.services,
          business.area,
        ]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query);
      const matchesCategory = !this.selectedCategory() || business.categorySlug === this.selectedCategory();
      const matchesSubcategory =
        !this.selectedSubcategory() || business.subcategorySlug === this.selectedSubcategory();
      const matchesArea = !this.selectedArea() || this.slug(business.area) === this.selectedArea();
      return matchesSearch && matchesCategory && matchesSubcategory && matchesArea;
    });
  });
  readonly resultCount = computed(() => this.filteredBusinesses().length);
  readonly sortedBusinesses = computed(() => {
    const businesses = [...this.filteredBusinesses()];
    if (this.sortBy() === 'newest') {
      return businesses.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    const direction = this.sortBy() === 'name-desc' ? -1 : 1;
    return businesses.sort((a, b) => direction * a.name.localeCompare(b.name));
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.resultCount() / PAGE_SIZE)));
  readonly safePage = computed(() => Math.min(Math.max(1, this.currentPage()), this.totalPages()));
  readonly pagedBusinesses = computed(() => {
    const start = (this.safePage() - 1) * PAGE_SIZE;
    return this.sortedBusinesses().slice(start, start + PAGE_SIZE);
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    meta: Meta,
  ) {
    meta.updateTag({
      name: 'description',
      content: 'Find shops, restaurants, healthcare, services and local businesses in Thakurganj.',
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.searchTerm.set(params.get('search')?.trim() ?? '');
      this.selectedCategory.set(params.get('category') ?? '');
      this.selectedSubcategory.set(params.get('subcategory') ?? '');
      this.selectedArea.set(params.get('area') ?? '');
      this.sortBy.set(this.parseSort(params.get('sort')));
      this.currentPage.set(this.parsePage(params.get('page')));
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

  private slug(value: string): string {
    return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
}
