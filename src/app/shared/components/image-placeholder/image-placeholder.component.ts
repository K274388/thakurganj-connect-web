import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'tk-image-placeholder',
  standalone: true,
  template: `
    @if (src()) {
      <img
        [src]="src()"
        [alt]="alt()"
        [attr.loading]="lazy() ? 'lazy' : 'eager'"
        (error)="failedSource.set(src())"
        [hidden]="failedSource() === src()"
      />
    }
    @if (!src() || failedSource() === src()) {
      <div
        class="placeholder"
        [class.category-artwork]="placeholderIcon()"
        role="img"
        [attr.aria-label]="alt() || 'Image unavailable'"
      >
        @if (placeholderIcon()) {
          <span class="artwork-icon" aria-hidden="true">{{ placeholderIcon() }}</span>
          <span class="artwork-label">{{ placeholderText() }}</span>
        } @else {
          <span>{{ placeholderText() }}</span>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      background: var(--tk-gray-100);
    }
    img,
    .placeholder {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 8rem;
      object-fit: cover;
    }
    .placeholder {
      display: grid;
      place-items: center;
      padding: 1rem;
      background: repeating-linear-gradient(
        135deg,
        var(--tk-yellow-light),
        var(--tk-yellow-light) 12px,
        var(--tk-gray-100) 12px,
        var(--tk-gray-100) 24px
      );
      color: var(--tk-black);
      text-align: center;
    }
    .placeholder span {
      padding: 0.4rem 0.65rem;
      border: 2px solid var(--tk-border);
      border-radius: var(--tk-radius-sm);
      background: var(--tk-off-white);
      font-size: 0.85rem;
      font-weight: 800;
    }
    .placeholder.category-artwork {
      align-content: center;
      gap: 0.7rem;
      background:
        radial-gradient(circle at 50% 32%, var(--tk-white) 0 24%, transparent 25%),
        linear-gradient(145deg, var(--tk-yellow-light), var(--tk-gray-100));
    }
    .category-artwork .artwork-icon {
      display: grid;
      width: clamp(4rem, 9vw, 6.5rem);
      aspect-ratio: 1;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: var(--tk-white);
      box-shadow: 0 5px 18px rgb(0 0 0 / 9%);
      font-size: clamp(2.3rem, 5vw, 3.6rem);
    }
    .category-artwork .artwork-label {
      border: 0;
      background: transparent;
      color: var(--tk-gray-600);
      font-size: 0.85rem;
      font-weight: 800;
    }
  `,
})
export class ImagePlaceholderComponent {
  readonly src = input('');
  readonly alt = input('');
  readonly lazy = input(true);
  readonly placeholderText = input('Photo coming soon');
  readonly placeholderIcon = input('');
  protected readonly failedSource = signal('');
}
