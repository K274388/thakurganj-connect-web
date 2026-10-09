import { Component, input } from '@angular/core';

@Component({
  selector: 'tk-loading',
  standalone: true,
  template: `
    @if (variant() === 'spinner') {
      <div class="spinner-wrap" role="status" [attr.aria-label]="label()"><span class="spinner"></span><span>{{ label() }}</span></div>
    } @else {
      <div class="skeleton-list" role="status" [attr.aria-label]="label()">
        @for (item of skeletons(); track item) {
          <article class="skeleton-card"><span></span><span></span><span></span></article>
        }
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    .spinner-wrap { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 2rem; color: var(--tk-gray-600); }
    .spinner { width: 1.5rem; height: 1.5rem; border: 3px solid var(--tk-gray-200); border-top-color: var(--tk-magenta); border-radius: 50%; animation: spin 700ms linear infinite; }
    .skeleton-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: 1rem; }
    .skeleton-card { display: grid; gap: 0.75rem; padding: 1rem; border: 2px solid var(--tk-gray-200); border-radius: var(--tk-radius-md); }
    .skeleton-card span { display: block; height: 0.9rem; border-radius: 0.4rem; background: linear-gradient(90deg, var(--tk-gray-100), var(--tk-gray-200), var(--tk-gray-100)); background-size: 200% 100%; animation: shimmer 1.3s ease-in-out infinite; }
    .skeleton-card span:first-child { height: 7rem; }
    .skeleton-card span:last-child { width: 60%; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer { to { background-position: -200% 0; } }
    @media (prefers-reduced-motion: reduce) { .spinner, .skeleton-card span { animation-duration: 2s; } }
  `,
})
export class LoadingComponent {
  readonly variant = input<'spinner' | 'skeleton'>('spinner');
  readonly count = input(3);
  readonly label = input('Loading');
  protected skeletons(): number[] {
    return Array.from({ length: Math.max(1, this.count()) }, (_, index) => index);
  }
}
