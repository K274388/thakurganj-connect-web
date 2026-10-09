import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category';

@Component({
  selector: 'tk-category-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a
      [class]="variantClass()"
      [routerLink]="route() ?? ['/categories', category().slug ?? category().id]"
      [queryParams]="queryParams()"
    >
      <span class="icon" aria-hidden="true">{{ category().icon || '✳' }}</span>
      <span class="name">{{ category().name }}</span>
      @if (category().description && showDescription()) {
        <span class="description">{{ category().description }}</span>
      }
      @if (category().businessCount !== undefined) {
        <span class="count">{{ category().businessCount }} {{ category().businessCount === 1 ? 'business' : 'businesses' }}</span>
      }
      @if (actionLabel()) {
        <span class="action" aria-hidden="true">{{ actionLabel() }}</span>
      }
      <span class="visually-hidden">Browse category</span>
    </a>
  `,
  styles: `
    :host { display: block; }
    .category { display: flex; height: 100%; min-height: 11rem; flex-direction: column; align-items: flex-start; justify-content: space-between; gap: 0.5rem; padding: 1.25rem; border: 2px solid var(--tk-border); border-radius: var(--tk-radius-md); color: var(--tk-black); text-decoration: none; }
    .category:focus-visible { outline: 3px solid var(--tk-magenta); outline-offset: 3px; }
    .icon { font-size: 2rem; }
    .name { font-size: 1.2rem; font-weight: 850; line-height: 1.1; overflow-wrap: anywhere; }
    .description { font-size: 0.9rem; line-height: 1.4; }
    .count { font-size: 0.8rem; font-weight: 700; }
    .action { margin-top: auto; font-weight: 900; }
    .variant-black { background: var(--tk-black); color: var(--tk-white); }
    .variant-yellow { background: var(--tk-yellow); }
    .variant-light-yellow { background: var(--tk-yellow-light); }
    .variant-magenta { background: var(--tk-magenta); color: var(--tk-white); }
    .variant-light-gray { background: var(--tk-gray-100); }
    .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }
  `,
})
export class CategoryCardComponent {
  readonly category = input.required<Category>();
  readonly route = input<string[] | null>(null);
  readonly queryParams = input<Record<string, string> | null>(null);
  readonly showDescription = input(false);
  readonly actionLabel = input('');
  protected variantClass(): string {
    return `category tk-card-hover variant-${this.category().colorVariant ?? 'light-yellow'}`;
  }
}
