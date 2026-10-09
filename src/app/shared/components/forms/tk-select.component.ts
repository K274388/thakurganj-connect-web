import { Component, input, output } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'tk-select',
  standalone: true,
  template: `
    <label class="tk-field">
      <span class="tk-field-label">{{ label() }}{{ required() ? ' *' : '' }}</span>
      <select
        class="tk-select"
        [value]="value()"
        [required]="required()"
        [disabled]="disabled()"
        (change)="onChange($event)"
      >
        @if (placeholder()) { <option value="" disabled>{{ placeholder() }}</option> }
        @for (option of options(); track option.value) { <option [value]="option.value">{{ option.label }}</option> }
      </select>
      @if (error()) { <span class="field-error" role="alert">{{ error() }}</span> }
    </label>
  `,
  styles: `.field-error { color: var(--tk-danger); font-size: 0.85rem; }`,
})
export class TkSelectComponent {
  readonly label = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly value = input('');
  readonly placeholder = input('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly error = input('');
  readonly valueChange = output<string>();

  protected onChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) this.valueChange.emit(target.value);
  }
}
