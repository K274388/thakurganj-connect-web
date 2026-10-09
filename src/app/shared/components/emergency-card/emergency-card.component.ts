import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface EmergencyContact {
  name: string;
  phone: string;
}

@Component({
  selector: 'tk-emergency-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="emergency" [class.dark]="variant() === 'dark'" aria-labelledby="emergency-title">
      <div class="heading">
        <h2 id="emergency-title">{{ title() }}</h2>
        @if (viewAllLink()) { <a [routerLink]="viewAllLink()">View all</a> }
      </div>
      <ul>
        @for (contact of contacts(); track contact.name) {
          <li>
            <span>{{ contact.name }}</span>
            @if (isCallable(contact.phone)) {
              <a [href]="'tel:' + contact.phone" [attr.aria-label]="'Call ' + contact.name + ' at ' + contact.phone">{{ contact.phone }}</a>
            } @else {
              <span class="coming-soon">{{ contact.phone }}</span>
            }
          </li>
        }
      </ul>
    </section>
  `,
  styles: `
    :host { display: block; }
    .emergency { padding: 1.5rem; border: 2px solid var(--tk-border); border-radius: var(--tk-radius-md); background: var(--tk-magenta); color: var(--tk-white); }
    .emergency.dark { background: var(--tk-black); }
    .emergency.dark h2 { color: var(--tk-yellow); }
    .heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    h2 { margin: 0; font-size: 1.35rem; }
    .heading > a { color: inherit; font-weight: 700; }
    ul { display: grid; gap: 0.75rem; margin: 1rem 0 0; padding: 0; list-style: none; }
    li { display: flex; justify-content: space-between; gap: 1rem; padding: 0.75rem; border-radius: var(--tk-radius-sm); background: rgb(255 255 255 / 8%); }
    li a { color: inherit; font-weight: 800; white-space: nowrap; }
    .coming-soon { color: var(--tk-yellow-light); font-size: 0.875rem; font-weight: 750; white-space: nowrap; }
  `,
})
export class EmergencyCardComponent {
  readonly title = input('Emergency');
  readonly contacts = input<EmergencyContact[]>([]);
  readonly viewAllLink = input('');
  readonly variant = input<'magenta' | 'dark'>('magenta');

  protected isCallable(phone: string): boolean {
    return /^[+\d][\d\s()-]*$/.test(phone);
  }
}
