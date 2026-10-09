import { Component, input, output } from '@angular/core';

@Component({
  selector: 'tk-date-time',
  standalone: true,
  template: `
    <label class="tk-field">
      <span class="tk-field-label">{{ label() }}{{ required() ? ' *' : '' }}</span>
      <input
        class="tk-input"
        [type]="type()"
        [value]="value()"
        [min]="min()"
        [required]="required()"
        [disabled]="disabled()"
        (input)="onInput($event)"
      />
    </label>
  `,
})
export class TkDateTimeComponent {
  readonly label = input.required<string>();
  readonly type = input<'date' | 'time'>('date');
  readonly value = input('');
  readonly min = input('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) this.valueChange.emit(target.value);
  }
}
