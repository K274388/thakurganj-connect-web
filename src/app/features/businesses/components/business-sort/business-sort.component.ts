import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BusinessSort } from '../../models/business.models';

@Component({
  selector: 'app-business-sort',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label class="sort">
      <span>Sort</span>
      <select class="tk-select" aria-label="Sort businesses" [ngModel]="sort()" name="sort" (ngModelChange)="sortChange.emit($event)">
        <option value="name-asc">Name A-Z</option>
        <option value="name-desc">Name Z-A</option>
        <option value="newest">Newest</option>
      </select>
    </label>
  `,
  styles: `
    :host { display: block; }
    .sort { display: flex; align-items: center; gap: 0.55rem; color: var(--tk-gray-600); font-size: 0.875rem; font-weight: 750; }
    select { min-width: 9rem; }
  `,
})
export class BusinessSortComponent {
  readonly sort = input.required<BusinessSort>();
  readonly sortChange = output<BusinessSort>();
}
