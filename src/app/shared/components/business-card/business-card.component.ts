import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BusinessCardData } from '../../models/business-card-data';
import { ImagePlaceholderComponent } from '../image-placeholder/image-placeholder.component';
import { getBusinessImageArtwork } from '../../utils/business-image-artwork';

@Component({
  selector: 'tk-business-card',
  standalone: true,
  imports: [RouterLink, ImagePlaceholderComponent],
  template: `
    <article class="card tk-card-hover">
      <a
        class="image-link"
        [routerLink]="['/businesses', business().id]"
        [attr.aria-label]="'View ' + business().name"
      >
        <tk-image-placeholder
          [src]="business().imageUrl ?? ''"
          [alt]="business().name"
          [placeholderIcon]="artwork()?.icon ?? ''"
          [placeholderText]="artwork()?.label ?? 'Photo coming soon'"
        />
      </a>
      <div class="body">
        <p class="category">{{ business().category }}</p>
        <h3>
          <a [routerLink]="['/businesses', business().id]">{{ business().name }}</a>
        </h3>
        @if (business().subcategoryName) {
          <p class="subcategory">{{ business().subcategoryName }}</p>
        }
        @if (business().area) {
          <p class="area">{{ business().area }}</p>
        }
        @if (business().shortDescription) {
          <p class="description">{{ business().shortDescription }}</p>
        }
        <div class="actions">
          <a class="tk-button tk-button-primary" [routerLink]="['/businesses', business().id]"
            >View Details</a
          >
          @if (business().phone) {
            <a class="tk-button tk-button-outline" [href]="'tel:' + business().phone">Call</a>
          }
          @if (directionsUrl()) {
            <a
              class="tk-button tk-button-dark"
              [href]="directionsUrl()"
              target="_blank"
              rel="noreferrer"
              >Directions</a
            >
          }
        </div>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
    .card {
      overflow: hidden;
      border: 2px solid var(--tk-border);
      border-radius: var(--tk-radius-md);
      background: var(--tk-white);
    }
    .image-link {
      display: block;
      height: clamp(8rem, 16vw, 9.5rem);
    }
    tk-image-placeholder {
      height: 100%;
    }
    .body {
      padding: 0.85rem 1rem 1rem;
    }
    .category {
      margin: 0 0 0.35rem;
      color: var(--tk-magenta-dark);
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
    }
    h3 {
      margin: 0;
      font-size: 1.2rem;
    }
    h3 a {
      color: inherit;
      text-decoration: none;
    }
    h3 a:hover {
      text-decoration: underline;
      text-underline-offset: 0.2em;
    }
    .subcategory {
      margin: 0.4rem 0 0;
      color: var(--tk-gray-600);
      font-size: 0.85rem;
    }
    .area {
      margin: 0.4rem 0 0;
      color: var(--tk-gray-600);
      font-size: 0.9rem;
    }
    .description {
      margin: 0.6rem 0 0;
      color: var(--tk-gray-600);
      font-size: 0.9rem;
      line-height: 1.45;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    .actions .tk-button {
      min-height: 2.4rem;
      padding: 0.55rem 0.9rem;
      font-size: 0.85rem;
    }
  `,
})
export class BusinessCardComponent {
  readonly business = input.required<BusinessCardData>();
  protected readonly artwork = computed(() =>
    getBusinessImageArtwork(this.business().category, this.business().subcategoryName),
  );

  protected directionsUrl(): string {
    const { latitude, longitude } = this.business();
    return latitude !== undefined && longitude !== undefined
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : '';
  }
}
