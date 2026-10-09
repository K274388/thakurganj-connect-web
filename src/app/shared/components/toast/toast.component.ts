import { Component, input } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'warning' | 'information';

@Component({
  selector: 'tk-toast',
  standalone: true,
  template: `
    <div class="toast" [class]="kindClass()" [attr.role]="kind() === 'error' ? 'alert' : 'status'" [attr.aria-live]="kind() === 'error' ? 'assertive' : 'polite'">
      <span class="icon" aria-hidden="true">{{ icon() }}</span>
      <span><ng-content /></span>
    </div>
  `,
  styles: `
    :host { display: block; }
    .toast { display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1rem; border: 2px solid currentColor; border-radius: var(--tk-radius-sm); font-weight: 650; }
    .success { background: var(--tk-success-surface); color: var(--tk-success); }
    .error { background: var(--tk-danger-surface); color: var(--tk-danger); }
    .warning { background: var(--tk-warning-surface); color: #795000; }
    .information { background: var(--tk-information-surface); color: var(--tk-information); }
    .icon { font-weight: 900; }
  `,
})
export class ToastComponent {
  readonly kind = input<ToastKind>('information');

  protected icon(): string {
    return { success: '✓', error: '×', warning: '!', information: 'i' }[this.kind()];
  }

  protected kindClass(): string {
    return `toast ${this.kind()}`;
  }
}
