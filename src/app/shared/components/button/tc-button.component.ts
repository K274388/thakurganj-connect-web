import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'dark' | 'danger' | 'link' | 'icon';

@Component({
  selector: 'tk-button',
  standalone: true,
  template: `
    <button
      class="tk-button"
      [class.tk-button-primary]="variant() === 'primary'"
      [class.tk-button-secondary]="variant() === 'secondary'"
      [class.tk-button-outline]="variant() === 'outline'"
      [class.tk-button-dark]="variant() === 'dark'"
      [class.tk-button-danger]="variant() === 'danger'"
      [class.tk-button-link]="variant() === 'link'"
      [class.tk-button-icon]="variant() === 'icon'"
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-busy]="loading()"
    >
      @if (loading()) { <span class="spinner" aria-hidden="true"></span> }
      <ng-content />
    </button>
  `,
  styles: `
    .spinner { width: 1rem; height: 1rem; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin 700ms linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 2s; } }
  `,
})
export class TcButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly ariaLabel = input('');
}
