import { Component, input } from '@angular/core';
import { BusinessDayHours } from '../../models/business.models';

@Component({
  selector: 'app-business-hours',
  standalone: true,
  template: `
    <dl class="hours">
      @for (entry of hours(); track entry.day) {
        <div class="row">
          <dt>{{ label(entry.day) }}</dt>
          <dd>
            @if (entry.closed || !entry.openTime || !entry.closeTime) {
              Closed
            } @else {
              {{ entry.openTime }} – {{ entry.closeTime }}
            }
          </dd>
        </div>
      }
    </dl>
  `,
  styles: `
    .hours { display: grid; margin: 0; }
    .row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.55rem 0; border-bottom: 1px solid var(--tk-gray-200, #ddd); }
    .row:last-child { border-bottom: 0; }
    dt { font-weight: 800; }
    dd { margin: 0; text-align: right; }
  `,
})
export class BusinessHoursComponent {
  readonly hours = input<BusinessDayHours[]>([]);

  protected label(day: string): string {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }
}
