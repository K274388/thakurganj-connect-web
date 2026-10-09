import { Component, input, output } from '@angular/core';

@Component({
  selector: 'tk-error-state',
  standalone: true,
  template: `
    <section class="error" role="alert">
      <span aria-hidden="true">!</span>
      <h2>{{ title() }}</h2>
      <p>{{ message() }}</p>
      <button class="tk-button tk-button-outline" type="button" (click)="retry.emit()">{{ retryLabel() }}</button>
    </section>
  `,
  styles: `
    :host { display: block; }
    .error { display: grid; justify-items: center; gap: 0.75rem; padding: 2.5rem 1.5rem; border: 2px solid var(--tk-danger); border-radius: var(--tk-radius-md); background: var(--tk-danger-surface); text-align: center; }
    span { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border-radius: 50%; background: var(--tk-danger); color: var(--tk-white); font-weight: 900; }
    h2 { margin: 0; font-size: 1.3rem; }
    p { max-width: 32rem; margin: 0 0 0.5rem; color: var(--tk-gray-600); line-height: 1.5; }
  `,
})
export class ErrorStateComponent {
  readonly title = input('Something went wrong.');
  readonly message = input("We couldn't load this information.");
  readonly retryLabel = input('Try again');
  readonly retry = output<void>();
}
