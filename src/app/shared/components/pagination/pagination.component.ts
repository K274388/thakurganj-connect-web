import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'tk-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 1) {
      <nav class="pagination" aria-label="Pagination">
        <button type="button" class="tk-button tk-button-outline" [disabled]="currentPage() <= 1" (click)="pageChange.emit(currentPage() - 1)">Previous</button>
        @for (page of pages(); track page) {
          @if (page === null) {
            <span class="ellipsis" aria-hidden="true">…</span>
          } @else {
            <button type="button" class="number" [class.active]="page === currentPage()" [attr.aria-current]="page === currentPage() ? 'page' : null" [attr.aria-label]="'Page ' + page" (click)="pageChange.emit(page)">{{ page }}</button>
          }
        }
        <button type="button" class="tk-button tk-button-outline" [disabled]="currentPage() >= totalPages()" (click)="pageChange.emit(currentPage() + 1)">Next</button>
      </nav>
    }
  `,
  styles: `
    :host { display: block; }
    .pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0.5rem; }
    .tk-button { min-height: 2.5rem; padding: 0.55rem 0.85rem; font-size: 0.875rem; }
    .number { min-width: 2.5rem; min-height: 2.5rem; border: 2px solid var(--tk-border); border-radius: 50%; background: var(--tk-white); color: var(--tk-black); cursor: pointer; font-weight: 750; }
    .number.active { background: var(--tk-black); color: var(--tk-white); }
    .number:disabled, .tk-button:disabled { cursor: not-allowed; opacity: 0.5; }
    .ellipsis { padding-inline: 0.25rem; }
  `,
})
export class PaginationComponent {
  readonly currentPage = input(1);
  readonly totalPages = input(1);
  readonly pageChange = output<number>();
  protected readonly pages = computed<(number | null)[]>(() => {
    const total = Math.max(1, Math.floor(this.totalPages()));
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const current = Math.min(Math.max(1, this.currentPage()), total);
    if (current <= 4) return [1, 2, 3, 4, 5, null, total];
    if (current >= total - 3) return [1, null, total - 4, total - 3, total - 2, total - 1, total];
    return [1, null, current - 1, current, current + 1, null, total];
  });
}
