import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapItem } from '../../models/map-item.models';
import { mapItemHref } from '../../utils/map-item.utils';

@Component({
  selector: 'tk-map-result-card',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" [class.selected]="selected()">
      <button type="button" class="select" [attr.aria-pressed]="selected()" (click)="chosen.emit(item().key)">
        @if (item().imageUrl) {
          <img [src]="item().imageUrl" alt="" loading="lazy" />
        }
        <span class="text">
          <span class="type">{{ item().entityType === 'business' ? 'Business' : 'Place' }}@if (selected()) { · Selected }</span>
          <strong>{{ item().name }}</strong>
          <span class="meta">{{ item().categoryName }}@if (item().area) { · {{ item().area }} }</span>
        </span>
      </button>
      <a class="view" [routerLink]="href()" [attr.aria-label]="'View details for ' + item().name">View ?</a>
    </div>
  `,
  styles: `
    :host { display: block; }
    .card { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.75rem 0.4rem 0.4rem; border: 2px solid #15120f; border-radius: 1rem; background: #fff; }
    .card.selected { border-width: 4px; background: #fff9e8; box-shadow: 0 0 0 2px #f9b900; }
    .select { display: flex; flex: 1; min-width: 0; align-items: center; gap: 0.7rem; padding: 0.2rem; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
    img { width: 3.5rem; height: 3.5rem; flex: none; border-radius: 0.7rem; object-fit: cover; }
    .text { display: grid; min-width: 0; gap: 0.1rem; }
    .type { color: #c20d55; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    strong { overflow-wrap: anywhere; }
    .meta { color: #4a443d; font-size: 0.85rem; }
    .view { flex: none; color: #15120f; font-size: 0.85rem; font-weight: 800; }
    .select:focus-visible, .view:focus-visible { outline: 3px solid #c20d55; outline-offset: 2px; border-radius: 0.5rem; }
  `,
})
export class MapResultCardComponent {
  readonly item = input.required<MapItem>();
  readonly selected = input(false);
  readonly chosen = output<string>();

  protected href(): string {
    return mapItemHref(this.item());
  }
}
