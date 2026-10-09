import { Component, input } from '@angular/core';
import { CategoryCardComponent } from '../../../../shared/components/category-card/category-card.component';
import { HomeCategory } from '../../models/home.models';

@Component({
  selector: 'app-home-category-section',
  standalone: true,
  imports: [CategoryCardComponent],
  template: `
    <section class="category-section tk-section" aria-labelledby="categories-title">
      <div class="tk-container">
        <h2 id="categories-title" class="tk-heading-xl">What do you need today?</h2>
        <div class="categories">
          @for (category of categories(); track category.id) {
            <tk-category-card [category]="category" [route]="['/businesses']" [queryParams]="{ category: (category.slug ?? category.id).toString() }" />
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .category-section { background: var(--tk-off-white); }
    h2 { margin: 0 0 1.75rem; }
    .categories { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 1rem; }
    @media (max-width: 1100px) { .categories { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 600px) { .categories { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; } }
  `,
})
export class CategorySectionComponent {
  readonly categories = input.required<HomeCategory[]>();
}
