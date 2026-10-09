import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventCardComponent } from '../../../../shared/components/event-card/event-card.component';
import { HomeEvent } from '../../models/home.models';

@Component({
  selector: 'app-home-happening-town',
  standalone: true,
  imports: [EventCardComponent, RouterLink],
  template: `
    <section class="happening" aria-labelledby="happening-title">
      <p class="eyebrow">Community calendar</p>
      <h2 id="happening-title" class="tk-heading-xl">Happening in town</h2>
      <div class="events">
        @for (event of events(); track event.id) {
          <tk-event-card [event]="event" />
        }
      </div>
      <a class="all-events" routerLink="/events">See all events and announcements <span aria-hidden="true">→</span></a>
    </section>
  `,
  styles: `
    :host { display: block; }
    .happening { height: 100%; }
    .eyebrow { margin: 0 0 0.45rem; color: var(--tk-magenta-dark); font-size: 0.75rem; font-weight: 850; letter-spacing: 0.12em; text-transform: uppercase; }
    h2 { margin: 0 0 1.5rem; }
    .events { display: grid; gap: 0.85rem; }
    .all-events { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 1.25rem; color: var(--tk-black); font-weight: 800; text-decoration-color: var(--tk-magenta); text-underline-offset: 0.25rem; }
  `,
})
export class HappeningTownComponent {
  readonly events = input.required<HomeEvent[]>();
}
