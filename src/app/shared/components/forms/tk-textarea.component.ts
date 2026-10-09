import { Component, input, output } from '@angular/core';

@Component({
  selector: 'tk-textarea',
  standalone: true,
  template: `
    <label class="tk-field">
      <span class="tk-field-label">{{ label() }}{{ required() ? ' *' : '' }}</span>
      <textarea
        class="tk-textarea"
        [value]="value()"
        [placeholder]="placeholder()"
        [required]="required()"
        [disabled]="disabled()"
        [rows]="rows()"
        (input)="onInput($event)"
      ></textarea>
      @if (error()) { <span class="field-error" role="alert">{{ error() }}</span> }
    </label>
  `,
  styles: `.field-error { color: var(--tk-danger); font-size: 0.85rem; }`,
})
export class TkTextareaComponent {
  readonly label = input.required<string>();
  readonly value = input('');
  readonly placeholder = input('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly rows = input(4);
  readonly error = input('');
  readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement) this.valueChange.emit(target.value);
  }
}
