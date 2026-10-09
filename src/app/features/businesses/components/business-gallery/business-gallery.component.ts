import { Component, computed, input, signal } from '@angular/core';
import { ImagePlaceholderComponent } from '../../../../shared/components/image-placeholder/image-placeholder.component';
import { getBusinessImageArtwork } from '../../../../shared/utils/business-image-artwork';
import { BusinessImage } from '../../models/business.models';

@Component({
  selector: 'app-business-gallery',
  standalone: true,
  imports: [ImagePlaceholderComponent],
  template: `
    <div class="main">
      <tk-image-placeholder
        [src]="selected()?.url ?? ''"
        [alt]="selected()?.alt ?? businessName() + ' photo'"
        [lazy]="false"
        [placeholderIcon]="artwork()?.icon ?? ''"
        [placeholderText]="artwork()?.label ?? 'Photo coming soon'"
      />
    </div>
    @if (gallery().length > 1) {
      <ul class="thumbs" aria-label="Business photos">
        @for (image of gallery(); track image.url; let index = $index) {
          <li>
            <button
              type="button"
              class="thumb"
              [attr.aria-pressed]="index === selectedIndex()"
              [attr.aria-label]="
                'Show photo ' + (index + 1) + ' of ' + gallery().length + ': ' + image.alt
              "
              (click)="selectedIndex.set(index)"
            >
              <img [src]="image.url" alt="" [attr.loading]="index === 0 ? 'eager' : 'lazy'" />
            </button>
          </li>
        }
      </ul>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .main {
      height: clamp(15rem, 40vw, 26rem);
      overflow: hidden;
      border: 3px solid var(--tk-border);
      border-radius: var(--tk-radius-lg);
    }
    .thumbs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin: 0.9rem 0 0;
      padding: 0;
      list-style: none;
    }
    .thumb {
      width: 5.5rem;
      height: 4rem;
      padding: 0;
      overflow: hidden;
      border: 3px solid var(--tk-border);
      border-radius: var(--tk-radius-sm);
      background: var(--tk-white);
      cursor: pointer;
    }
    .thumb[aria-pressed='true'] {
      border-color: var(--tk-magenta);
    }
    .thumb:focus-visible {
      outline: 3px solid var(--tk-magenta);
      outline-offset: 2px;
    }
    .thumb img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
})
export class BusinessGalleryComponent {
  readonly businessName = input.required<string>();
  readonly categoryName = input('');
  readonly subcategoryName = input('');
  readonly coverImageUrl = input('');
  readonly images = input<BusinessImage[]>([]);

  protected readonly selectedIndex = signal(0);
  protected readonly artwork = computed(() =>
    getBusinessImageArtwork(this.categoryName(), this.subcategoryName()),
  );
  protected readonly gallery = computed<BusinessImage[]>(() => {
    const images = this.images();
    if (images.length) return images;
    const cover = this.coverImageUrl();
    return cover ? [{ url: cover, alt: `${this.businessName()} cover photo` }] : [];
  });
  protected readonly selected = computed(
    () => this.gallery()[this.selectedIndex()] ?? this.gallery()[0],
  );
}
