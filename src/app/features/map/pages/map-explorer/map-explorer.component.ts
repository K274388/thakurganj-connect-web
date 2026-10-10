import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessRepository } from '../../../businesses/data/business.repository';
import { CategoryRepository } from '../../../categories/data/category.repository';
import { getActiveCategories } from '../../../categories/utils/category.utils';
import { PlaceRepository } from '../../../places/data/place.repository';
import { getActivePlaceCategories } from '../../../places/utils/place.utils';
import { FilterPillComponent } from '../../../../shared/components/filter-pill/filter-pill.component';
import { SearchBoxComponent } from '../../../../shared/components/search-box/search-box.component';
import { MapViewComponent } from '../../components/map-view/map-view.component';
import { MapResultsListComponent } from '../../components/map-results/map-results-list.component';
import { MapFilters, MapItem, MapTypeFilter } from '../../models/map-item.models';
import {
  buildMapItems,
  categoryToOptionValue,
  categoryToParam,
  countByType,
  filterMapItems,
  mapItemHref,
  optionValueToCategory,
  parseCategoryParam,
  parseTypeParam,
} from '../../utils/map-item.utils';

export const MAP_DESCRIPTION =
  'Explore businesses, landmarks, markets, transportation and useful places across Thakurganj on an interactive map.';

type SheetState = 'collapsed' | 'partial' | 'expanded';
type Params = Record<string, string | null>;

@Component({
  selector: 'app-map-explorer',
  standalone: true,
  imports: [FilterPillComponent, MapResultsListComponent, MapViewComponent, SearchBoxComponent],
  templateUrl: './map-explorer.component.html',
  styleUrl: './map-explorer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapExplorerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly businesses = inject(BusinessRepository);
  private readonly places = inject(PlaceRepository);
  private readonly categories = inject(CategoryRepository);
  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly typeOptions: { value: MapTypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'business', label: 'Businesses' },
    { value: 'place', label: 'Places' },
  ];
  protected readonly businessCategories = computed(() => getActiveCategories(this.categories.categories()));
  protected readonly placeCategories = computed(() => getActivePlaceCategories(this.places.categories()));
  protected readonly sheetState = signal<SheetState>('partial');

  protected readonly allItems = computed(() => buildMapItems(this.businesses.businesses(), this.places.places()));
  protected readonly filters = computed<MapFilters>(() => {
    const params = this.query();
    const type = parseTypeParam(params.get('type'));
    const parsed = parseCategoryParam(params.get('category'), type);
    const known =
      parsed &&
      (parsed.entityType === 'business' ? this.businessCategories() : this.placeCategories()).some(
        (category) => category.slug === parsed.slug,
      );
    return { type, category: known ? parsed : null, search: params.get('search')?.trim() ?? '' };
  });
  protected readonly items = computed(() => filterMapItems(this.allItems(), this.filters()));
  protected readonly counts = computed(() => countByType(this.items()));
  protected readonly selectedKey = computed(() => {
    const key = this.query().get('selected');
    return key && this.items().some((item) => item.key === key) ? key : null;
  });
  protected readonly categoryValue = computed(() => {
    const category = this.filters().category;
    return category ? categoryToOptionValue(category) : '';
  });
  protected readonly hasFilters = computed(() => {
    const { type, category, search } = this.filters();
    return type !== 'all' || !!category || !!search;
  });
  protected readonly summary = computed(() => {
    const total = this.items().length;
    return `${total} ${total === 1 ? 'result' : 'results'}`;
  });
  protected readonly breakdown = computed(() => {
    const { business, place } = this.counts();
    return `${business} ${business === 1 ? 'business' : 'businesses'} � ${place} ${place === 1 ? 'place' : 'places'}`;
  });
  protected readonly showBusinessCategories = computed(() => this.filters().type !== 'place');
  protected readonly showPlaceCategories = computed(() => this.filters().type !== 'business');

  constructor(meta: Meta) {
    meta.updateTag({ name: 'description', content: MAP_DESCRIPTION });
    // Normalises invalid/stale params (unknown category, selected item no longer in the results).
    effect(() => {
      const filters = this.filters();
      const canonical: Params = {
        type: filters.type === 'all' ? null : filters.type,
        category: categoryToParam(filters.category, filters.type),
        search: filters.search || null,
        selected: this.selectedKey(),
      };
      const params = this.query();
      const stale = (Object.keys(canonical) as (keyof Params)[]).some(
        (name) => (params.get(name as string) ?? null) !== canonical[name],
      );
      if (stale) untracked(() => this.navigate(canonical, true));
    });
  }

  protected setType(type: MapTypeFilter): void {
    const { category } = this.filters();
    const keep = category && (type === 'all' || type === category.entityType) ? category : null;
    this.navigate({
      type: type === 'all' ? null : type,
      category: categoryToParam(keep, type),
      selected: null,
    });
  }

  protected setCategory(value: string): void {
    const category = optionValueToCategory(value);
    this.navigate({ category: categoryToParam(category, this.filters().type), selected: null });
  }

  protected setSearch(search: string): void {
    this.navigate({ search: search.trim() || null, selected: null });
  }

  protected clearFilters(): void {
    void this.router.navigateByUrl('/map');
  }

  protected selectFromMap(key: string): void {
    if (this.sheetState() === 'collapsed') this.sheetState.set('partial');
    this.navigate({ selected: key }, true);
  }

  protected selectFromList(key: string): void {
    if (this.sheetState() === 'expanded') this.sheetState.set('partial');
    this.navigate({ selected: key }, true);
  }

  protected openItem(item: MapItem): void {
    void this.router.navigateByUrl(mapItemHref(item));
  }

  protected toggleSheet(): void {
    this.sheetState.update((state) => (state === 'collapsed' ? 'partial' : 'collapsed'));
  }

  protected toggleExpanded(): void {
    this.sheetState.update((state) => (state === 'expanded' ? 'partial' : 'expanded'));
  }

  private navigate(queryParams: Params, replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }
}
