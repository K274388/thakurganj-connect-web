import { Component, input, output } from '@angular/core';

@Component({
  selector: 'tk-input',
  standalone: true,
  template: `
    <label class="tk-field">
      <span class="tk-field-label">{{ label() }}{{ required() ? ' *' : '' }}</span>
      <input
        class="tk-input"
        [type]="type()"
        [value]="value()"
        [placeholder]="placeholder()"
        [required]="required()"
        [disabled]="disabled()"
        [attr.autocomplete]="autocomplete() || null"
        (input)="onInput($event)"
      />
      @if (error()) { <span class="field-error" role="alert">{{ error() }}</span> }
    </label>
  `,
  styles: `.field-error { color: var(--tk-danger); font-size: 0.85rem; }`,
})
export class TkInputComponent {
  readonly label = input.required<string>();
  readonly type = input<'text' | 'email' | 'tel' | 'url' | 'password' | 'number'>('text');
  readonly value = input('');
  readonly placeholder = input('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly autocomplete = input('');
  readonly error = input('');
  readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) this.valueChange.emit(target.value);
  }
}
