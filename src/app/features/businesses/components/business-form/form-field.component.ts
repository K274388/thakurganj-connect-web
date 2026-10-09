import { Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { businessErrorMessage } from './business-form.validators';

/** Label + projected control + inline error. Errors show once the control is touched (or after a submit attempt marks all touched). */
@Component({
  selector: 'app-form-field',
  standalone: true,
  template: `
    <div class="field">
      <label [for]="controlId()">{{ label() }}@if (required()) {<span class="req" aria-hidden="true"> *</span>}</label>
      <ng-content />
      @if (message(); as text) {
        <p class="error" [id]="controlId() + '-error'">{{ text }}</p>
      }
    </div>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .field { display: grid; gap: 0.4rem; }
    label { color: var(--tk-black); font-size: 0.9rem; font-weight: 750; }
    .req { color: var(--tk-magenta-dark); }
    .error { margin: 0; color: var(--tk-danger); font-size: 0.85rem; font-weight: 700; }
  `,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly controlId = input.required<string>();
  readonly control = input<AbstractControl | null>(null);
  readonly required = input(false);
  readonly requiredMessage = input('');

  /** Bumped on every control event (touched, value, status) so the message re-evaluates under any change-detection mode. */
  private readonly tick = signal(0);

  constructor() {
    effect((onCleanup) => {
      const subscription = this.control()?.events.subscribe(() => this.tick.update((value) => value + 1));
      onCleanup(() => subscription?.unsubscribe());
    });
  }

  protected readonly message = computed(() => {
    this.tick();
    const control = this.control();
    if (!control || !control.touched || !control.invalid) return '';
    if (control.errors?.['required'] && this.requiredMessage()) return this.requiredMessage();
    return businessErrorMessage(this.label(), control.errors);
  });
}
