import { Component, input, output } from '@angular/core';

@Component({
  selector: 'tk-choice',
  standalone: true,
  template: `
    <label class="choice">
      <input
        [type]="type()"
        [name]="name()"
        [checked]="checked()"
        [disabled]="disabled()"
        [required]="required()"
        (change)="onChange($event)"
      />
      <span>{{ label() }}</span>
    </label>
  `,
  styles: `
    .choice { display: inline-flex; align-items: center; gap: 0.55rem; cursor: pointer; }
    input { width: 1.1rem; height: 1.1rem; margin: 0; accent-color: var(--tk-magenta); }
    input:disabled, input:disabled + span { cursor: not-allowed; opacity: 0.6; }
  `,
})
export class TkChoiceComponent {
  readonly type = input<'checkbox' | 'radio'>('checkbox');
  readonly name = input('');
  readonly label = input.required<string>();
  readonly checked = input(false);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly checkedChange = output<boolean>();

  protected onChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) this.checkedChange.emit(target.checked);
  }
}
