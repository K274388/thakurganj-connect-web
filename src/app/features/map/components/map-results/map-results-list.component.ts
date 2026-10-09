import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MapItem } from '../../models/map-item.models';
import { MapResultCardComponent } from './map-result-card.component';

@Component({
  selector: 'tk-map-results-list',
  standalone: true,
  imports: [MapResultCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul aria-label="Map results">
      @for (item of items(); track item.key) {
        <li><tk-map-result-card [item]="item" [selected]="item.key === selectedKey()" (chosen)="itemSelected.emit($event)" /></li>
      }
    </ul>
  `,
  styles: `
    ul { display: grid; gap: 0.6rem; margin: 0; padding: 0; list-style: none; }
  `,
})
export class MapResultsListComponent {
  readonly items = input<MapItem[]>([]);
  readonly selectedKey = input<string | null>(null);
  readonly itemSelected = output<string>();
}
