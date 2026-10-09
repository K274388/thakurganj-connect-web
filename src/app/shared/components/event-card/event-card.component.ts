import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventCardData } from '../../models/event-card-data';
import { ImagePlaceholderComponent } from '../image-placeholder/image-placeholder.component';

@Component({
  selector: 'tk-event-card',
  standalone: true,
  imports: [RouterLink, ImagePlaceholderComponent],
  template: `
    <article class="event">
      @if (event().imageUrl) {
        <a class="image" [routerLink]="['/events', event().id]" [attr.aria-label]="'View ' + event().title">
          <tk-image-placeholder [src]="event().imageUrl ?? ''" [alt]="event().title" />
        </a>
      }
      <div class="date" aria-label="Event date">
        <strong>{{ dateParts().day }}</strong>
        <span>{{ dateParts().month }}</span>
      </div>
      <div class="details">
        <h3><a [routerLink]="['/events', event().id]">{{ event().title }}</a></h3>
        <p>{{ dateParts().full }} · {{ event().venue }}</p>
        @if (event().description) { <p class="description">{{ event().description }}</p> }
      </div>
    </article>
  `,
  styles: `
    :host { display: block; }
    .event { display: grid; grid-template-columns: 4.75rem minmax(0, 1fr); gap: 1rem; align-items: center; padding: 1rem; border: 2px solid var(--tk-border); border-radius: var(--tk-radius-md); background: var(--tk-white); }
    .image { grid-column: 1 / -1; height: 10rem; }
    tk-image-placeholder { height: 100%; }
    .date { display: grid; min-height: 4.75rem; align-content: center; justify-items: center; border: 2px solid var(--tk-border); border-radius: var(--tk-radius-sm); background: var(--tk-yellow); text-transform: uppercase; }
    .date strong { font-size: 1.8rem; line-height: 1; }
    .date span { margin-top: 0.25rem; font-size: 0.7rem; font-weight: 850; }
    h3 { margin: 0; font-size: 1.15rem; }
    h3 a { color: inherit; text-decoration: none; }
    h3 a:hover { text-decoration: underline; }
    p { margin: 0.4rem 0 0; color: var(--tk-gray-600); font-size: 0.9rem; }
    .description { color: var(--tk-black); }
  `,
})
export class EventCardComponent {
  readonly event = input.required<EventCardData>();

  protected dateParts(): { day: string; month: string; full: string } {
    const date = new Date(this.event().date);
    if (Number.isNaN(date.getTime())) return { day: '—', month: 'DATE', full: this.event().date };
    return {
      day: new Intl.DateTimeFormat('en', { day: '2-digit', timeZone: 'UTC' }).format(date),
      month: new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(date).toUpperCase(),
      full: new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date),
    };
  }
}
