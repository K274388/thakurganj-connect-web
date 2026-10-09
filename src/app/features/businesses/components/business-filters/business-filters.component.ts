import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BusinessCategory, BusinessSubcategory } from '../../../categories/models/category.models';
import { BusinessDirectoryFilters } from '../../models/business.models';

export interface BusinessFilterOptions {
  areas: string[];
  subcategories: Pick<BusinessSubcategory, 'slug' | 'name'>[];
}

@Component({
  selector: 'app-business-filters',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="filters" (submit)="$event.preventDefault()">
      <h2>Refine your search</h2>
      <label class="tk-field">
        <span class="tk-field-label">Category</span>
        <select class="tk-select" aria-label="Category" [ngModel]="filters().category" name="category" (ngModelChange)="categoryChange.emit($event)">
          <option value="">All categories</option>
          @for (category of categories(); track category.slug) { <option [value]="category.slug">{{ category.name }}</option> }
        </select>
      </label>
      <label class="tk-field">
        <span class="tk-field-label">Subcategory</span>
        <select class="tk-select" aria-label="Subcategory" [ngModel]="filters().subcategory" name="subcategory" [disabled]="!filters().category" (ngModelChange)="subcategoryChange.emit($event)">
          <option value="">All subcategories</option>
          @for (subcategory of options().subcategories; track subcategory.slug) { <option [value]="subcategory.slug">{{ subcategory.name }}</option> }
        </select>
      </label>
      <label class="tk-field">
        <span class="tk-field-label">Area</span>
        <select class="tk-select" aria-label="Area" [ngModel]="filters().area" name="area" (ngModelChange)="areaChange.emit($event)">
          <option value="">All areas</option>
          @for (area of options().areas; track area) { <option [value]="slug(area)">{{ area }}</option> }
        </select>
      </label>
    </form>
  `,
  styles: `
    :host { display: block; }
    .filters { display: grid; gap: 1rem; }
    h2 { margin: 0 0 0.25rem; font-size: 1.15rem; }
  `,
})
export class BusinessFiltersComponent {
  readonly filters = input.required<BusinessDirectoryFilters>();
  readonly options = input.required<BusinessFilterOptions>();
  readonly categoryChange = output<string>();
  readonly subcategoryChange = output<string>();
  readonly areaChange = output<string>();
  readonly categories = input.required<BusinessCategory[]>();

  protected slug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
}
