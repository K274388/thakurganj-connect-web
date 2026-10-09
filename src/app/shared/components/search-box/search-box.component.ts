import { Component, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'tk-search-box',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="search" role="search" (ngSubmit)="submit()">
      <input
        name="search"
        type="search"
        [attr.aria-label]="placeholder()"
        [placeholder]="placeholder()"
        [ngModel]="value()"
        (ngModelChange)="query.set($event)"
        [disabled]="loading()"
        autocomplete="off"
      />
      @if (query()) {
        <button class="clear" type="button" aria-label="Clear search" (click)="clear()">×</button>
      }
      <button class="tk-button tk-button-primary submit" type="submit" [disabled]="loading()">
        {{ loading() ? 'Searching…' : buttonText() }}
      </button>
    </form>
  `,
  styles: `
    :host { display: block; }
    .search { display: flex; min-width: 0; align-items: stretch; gap: 0.5rem; padding: 0.35rem; border: 2px solid var(--tk-border); border-radius: var(--tk-radius-pill); background: var(--tk-white); }
    input { flex: 1; min-width: 0; padding: 0.65rem 1rem; border: 0; outline: 0; background: transparent; }
    input:focus-visible { outline: 3px solid var(--tk-magenta); outline-offset: -2px; border-radius: var(--tk-radius-pill); }
    .submit { flex-shrink: 0; }
    .clear { width: 2.25rem; border: 0; border-radius: 50%; background: transparent; color: var(--tk-gray-600); cursor: pointer; font-size: 1.3rem; }
    @media (max-width: 520px) { .search { flex-wrap: wrap; border-radius: var(--tk-radius-md); } input { flex-basis: calc(100% - 3rem); } .submit { width: 100%; } }
  `,
})
export class SearchBoxComponent {
  readonly placeholder = input('What are you looking for?');
  readonly buttonText = input('Search');
  readonly value = input('');
  readonly loading = input(false);
  readonly search = output<string>();
  protected readonly query = linkedSignal(() => this.value());

  protected submit(): void {
    const value = this.query().trim();
    if (value && !this.loading()) this.search.emit(value);
  }

  protected clear(): void {
    this.query.set('');
    this.search.emit('');
  }
}
