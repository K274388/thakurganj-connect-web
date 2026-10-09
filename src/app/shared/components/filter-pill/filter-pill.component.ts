import { Component, input, output } from '@angular/core';

@Component({
  selector: 'tk-filter-pill',
  standalone: true,
  template: `
    <button
      class="pill"
      type="button"
      [class.active]="active()"
      [disabled]="disabled()"
      [attr.aria-pressed]="active()"
      (click)="selected.emit()"
    >{{ label() }}</button>
  `,
  styles: `
    :host { display: inline-block; }
    .pill { min-height: 2.5rem; padding: 0.55rem 1rem; border: 2px solid var(--tk-border); border-radius: var(--tk-radius-pill); background: var(--tk-white); color: var(--tk-black); cursor: pointer; font-weight: 700; }
    .pill:hover:not(:disabled) { background: var(--tk-yellow-light); }
    .pill.active { background: var(--tk-black); color: var(--tk-white); }
    .pill:disabled { cursor: not-allowed; opacity: 0.5; }
  `,
})
export class FilterPillComponent {
  readonly label = input.required<string>();
  readonly active = input(false);
  readonly disabled = input(false);
  readonly selected = output<void>();
}
