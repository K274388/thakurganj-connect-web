import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlaceCardData } from '../../models/place-card-data';
import { ImagePlaceholderComponent } from '../image-placeholder/image-placeholder.component';

@Component({
  selector: 'tk-place-card',
  standalone: true,
  imports: [RouterLink, ImagePlaceholderComponent],
  template: `
    <article class="card tk-card-hover">
      <a class="image-link" [routerLink]="['/places', place().slug]" [attr.aria-label]="'View ' + place().name">
        <tk-image-placeholder [src]="place().coverImageUrl ?? ''" [alt]="imageAlt()" />
      </a>
      <div class="content">
        <p class="category">{{ place().categoryName }}</p>
        <h3><a [routerLink]="['/places', place().slug]">{{ place().name }}</a></h3>
        @if (place().area || place().address) { <p class="area">{{ place().area || place().address }}</p> }
        @if (place().shortDescription) { <p class="description">{{ place().shortDescription }}</p> }
        <a class="view-link" [routerLink]="['/places', place().slug]">View place</a>
      </div>
    </article>
  `,
  styles: `
    :host { display: block; }
    .card { overflow: hidden; border: 2px solid var(--tk-border); border-radius: var(--tk-radius-md); background: var(--tk-white); }
    .image-link { display: block; height: clamp(12rem, 20vw, 17rem); }
    tk-image-placeholder { height: 100%; }
    .content { padding: 1rem 1.15rem 1.25rem; }
    .category { margin: 0 0 0.35rem; color: var(--tk-magenta-dark); font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
    h3 { margin: 0; font-size: 1.2rem; }
    h3 a { color: inherit; text-decoration: none; }
    h3 a:hover { text-decoration: underline; text-underline-offset: 0.2em; }
    .area, .description { margin: 0.5rem 0 0; color: var(--tk-gray-600); font-size: 0.9rem; line-height: 1.5; }
    .view-link { display: inline-block; margin-top: 0.85rem; color: var(--tk-black); font-weight: 800; text-underline-offset: 0.2em; }
    a:focus-visible { outline: 3px solid var(--tk-magenta); outline-offset: 3px; border-radius: 2px; }
  `,
})
export class PlaceCardComponent {
  readonly place = input.required<PlaceCardData>();

  protected imageAlt(): string {
    const { name, area, address } = this.place();
    const location = area || address;
    return location ? `${name} in ${location}` : name;
  }
}
