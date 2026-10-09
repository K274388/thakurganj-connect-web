import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  FULL_MAP_URL,
  MAP_EMBED_URL,
  REACH_GUIDE,
  TRANSPORT_CATEGORIES,
  TRANSPORT_PLACES,
  TRANSPORT_ROUTES,
  TransportCategory,
  TransportMode,
  directionsUrl,
  mapSearchUrl,
} from './transportation.data';

type Filter = 'all' | TransportMode;
type Sort = 'relevance' | 'name' | 'category';

@Component({
  selector: 'app-transportation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './transportation.component.html',
  styleUrl: './transportation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closeDetail()' },
})
export class TransportationComponent {
  protected readonly categories = TRANSPORT_CATEGORIES;
  protected readonly reachGuide = REACH_GUIDE;
  protected readonly fullMapUrl = FULL_MAP_URL;
  protected readonly mapUrl: SafeResourceUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(MAP_EMBED_URL);
  protected readonly routes = TRANSPORT_ROUTES.map((route) => ({ ...route, url: directionsUrl(route.query) }));
  protected readonly filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: TRANSPORT_PLACES.length },
    ...TRANSPORT_CATEGORIES.map((category) => ({
      key: category.key,
      label: category.shortTitle,
      count: TRANSPORT_PLACES.filter((place) => place.category === category.key).length,
    })),
  ];

  protected readonly filter = signal<Filter>('all');
  protected readonly query = signal('');
  protected readonly sort = signal<Sort>('relevance');
  protected readonly saved = signal<ReadonlySet<string>>(new Set());
  protected readonly selected = signal<TransportCategory | null>(null);

  protected readonly places = computed(() => {
    const filter = this.filter();
    const query = this.query().trim().toLowerCase();
    const sort = this.sort();
    const order = (key: TransportMode) => this.categories.findIndex((category) => category.key === key);
    const result = TRANSPORT_PLACES.filter(
      (place) =>
        (filter === 'all' || place.category === filter) &&
        [place.name, place.type, place.address, place.description].join(' ').toLowerCase().includes(query),
    ).map((place) => ({
      ...place,
      icon: this.categories[order(place.category)].icon,
      directions: directionsUrl(place.destination),
      url: mapSearchUrl(place.destination),
    }));
    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'category') result.sort((a, b) => order(a.category) - order(b.category));
    return result;
  });

  protected scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected showCategory(key: TransportMode): void {
    this.filter.set(key);
    this.scrollTo('places');
  }

  protected openDetail(key: TransportMode): void {
    this.selected.set(this.categories.find((category) => category.key === key) ?? null);
  }

  protected closeDetail(): void {
    this.selected.set(null);
  }

  protected toggleSaved(name: string): void {
    this.saved.update((current) => {
      const next = new Set(current);
      if (!next.delete(name)) next.add(name);
      return next;
    });
  }

  protected onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected onSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as Sort);
  }
}
