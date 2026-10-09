import { Component, input, output } from '@angular/core';

@Component({
  selector: 'tk-empty-state',
  standalone: true,
  template: `
    <section class="empty" aria-live="polite">
      <span class="icon" aria-hidden="true">{{ icon() }}</span>
      <h2>{{ title() }}</h2>
      <p>{{ message() }}</p>
      @if (actionLabel()) { <button class="tk-button tk-button-primary" type="button" (click)="action.emit()">{{ actionLabel() }}</button> }
    </section>
  `,
  styles: `
    :host { display: block; }
    .empty { display: grid; justify-items: center; gap: 0.75rem; padding: clamp(2rem, 6vw, 4rem) 1.5rem; border: 2px dashed var(--tk-gray-400); border-radius: var(--tk-radius-lg); text-align: center; }
    .icon { display: grid; width: 3.5rem; height: 3.5rem; place-items: center; border-radius: 50%; background: var(--tk-yellow-light); font-size: 1.5rem; }
    h2 { margin: 0; font-size: 1.35rem; }
    p { max-width: 34rem; margin: 0; color: var(--tk-gray-600); line-height: 1.5; }
  `,
})
export class EmptyStateComponent {
  readonly title = input('Nothing here yet');
  readonly message = input('');
  readonly icon = input('✳');
  readonly actionLabel = input('');
  readonly action = output<void>();
}
