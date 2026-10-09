import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FilterPillComponent } from '../../../../shared/components/filter-pill/filter-pill.component';
import { PlaceCardComponent } from '../../../../shared/components/place-card/place-card.component';
import { PlaceRepository } from '../../../places/data/place.repository';
import { getActivePlaceCategories, getFeaturedPlaces } from '../../../places/utils/place.utils';

@Component({
  selector: 'app-home-explore-town',
  standalone: true,
  imports: [FilterPillComponent, PlaceCardComponent, RouterLink],
  template: `
    <section class="explore tk-section" aria-labelledby="explore-title">
      <div class="tk-container">
        <div class="section-top">
          <div>
            <p class="eyebrow">Discover Thakurganj</p>
            <h2 id="explore-title" class="tk-heading-xl">Explore the town</h2>
          </div>
          <div class="filters" role="group" aria-label="Filter places by category">
            @for (filter of filters; track filter.slug) {
              <tk-filter-pill [label]="filter.label" [active]="selectedCategory() === filter.slug" (selected)="selectFilter(filter.slug)" />
            }
          </div>
        </div>
        <div class="places">
          @for (place of filteredPlaces(); track place.id) {
            <tk-place-card [place]="place" />
          }
        </div>
        <a class="explore-all" [routerLink]="selectedCategory() === 'transportation' ? ['/transportation'] : ['/places']" [queryParams]="selectedCategory() === 'all' || selectedCategory() === 'transportation' ? {} : { category: selectedCategory() }">
          Explore all places →
        </a>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .explore { background: var(--tk-white); }
    .section-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.75rem; }
    .eyebrow { margin: 0 0 0.45rem; color: var(--tk-magenta-dark); font-size: 0.75rem; font-weight: 850; letter-spacing: 0.12em; text-transform: uppercase; }
    h2 { margin: 0; }
    .filters { display: flex; max-width: 62%; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem; }
    .places { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; }
    .explore-all { display: inline-block; margin-top: 1.5rem; color: var(--tk-black); font-weight: 850; text-underline-offset: 0.25em; }
    .explore-all:focus-visible { outline: 3px solid var(--tk-magenta); outline-offset: 4px; }
    @media (max-width: 900px) { .section-top { align-items: flex-start; flex-direction: column; } .filters { max-width: 100%; justify-content: flex-start; } .places { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 600px) { .filters { width: calc(100vw - 2rem); flex-wrap: nowrap; overflow-x: auto; padding: 0.25rem 0.1rem 0.5rem; } .filters tk-filter-pill { flex: 0 0 auto; } .places { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class ExploreTownComponent {
  private readonly repository = inject(PlaceRepository);
  protected readonly filters = [
    { slug: 'all', label: 'All' },
    ...['landmarks', 'religious', 'markets', 'transportation'].flatMap((slug) => {
      const category = getActivePlaceCategories().find((item) => item.slug === slug);
      return category
        ? [
            {
              slug,
              label:
                slug === 'religious'
                  ? 'Religious'
                  : slug === 'transportation'
                    ? 'Transport'
                    : category.name,
            },
          ]
        : [];
    }),
  ];
  protected readonly selectedCategory = signal('all');
  protected readonly places = computed(() => getFeaturedPlaces(this.repository.getPlaces()));
  protected readonly filteredPlaces = computed(() => {
    const category = this.selectedCategory();
    return category === 'all' ? this.places() : this.places().filter((place) => place.categorySlug === category);
  });

  protected selectFilter(category: string): void {
    this.selectedCategory.set(category);
  }
}
