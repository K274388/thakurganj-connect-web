import { Component, input, output } from '@angular/core';
import { Business } from '../../models/business.models';
import { BusinessCardComponent } from '../../../../shared/components/business-card/business-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-business-results',
  standalone: true,
  imports: [BusinessCardComponent, PaginationComponent],
  template: `
    <p class="result-count" aria-live="polite">
      {{ resultCount() }} {{ resultCount() === 1 ? 'business' : 'businesses' }} found
    </p>
    @if (resultCount()) {
      <div class="business-grid">
        @for (business of businesses(); track business.id) {
          <tk-business-card [business]="business" />
        }
      </div>
      <div class="pagination-summary">
        <p>Showing {{ startItem() }}-{{ endItem() }} of {{ resultCount() }}</p>
        <tk-pagination [currentPage]="currentPage()" [totalPages]="totalPages()" (pageChange)="pageChange.emit($event)" />
      </div>
    }
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .result-count { margin: 0 0 1rem; color: var(--tk-gray-600); font-size: 0.9rem; font-weight: 700; }
    .business-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: start; gap: 1rem; }
    .pagination-summary { display: grid; gap: 0.75rem; margin-top: 1.5rem; }
    .pagination-summary p { margin: 0; color: var(--tk-gray-600); font-size: 0.875rem; text-align: center; }
    @media (max-width: 1200px) { .business-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 600px) { .business-grid { grid-template-columns: minmax(0, 1fr); } }
  `,
})
export class BusinessResultsComponent {
  readonly businesses = input.required<Business[]>();
  readonly resultCount = input.required<number>();
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageSize = input(12);
  readonly pageChange = output<number>();

  protected startItem(): number {
    return this.resultCount() ? (this.currentPage() - 1) * this.pageSize() + 1 : 0;
  }

  protected endItem(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.resultCount());
  }
}
