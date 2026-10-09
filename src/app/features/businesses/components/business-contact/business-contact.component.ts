import { Component, computed, input } from '@angular/core';
import { Business } from '../../models/business.models';
import { phoneDigits, safeWebsite, whatsappLink } from '../../utils/business-links';

@Component({
  selector: 'app-business-contact',
  standalone: true,
  template: `
    <dl class="contact">
      @if (business().phone) {
        <div><dt>Phone</dt><dd><a [href]="'tel:' + phoneValue()">{{ business().phone }}</a></dd></div>
      }
      @if (whatsapp()) {
        <div><dt>WhatsApp</dt><dd><a [href]="whatsapp()" target="_blank" rel="noopener noreferrer">{{ business().whatsapp }}<span class="sr-only"> (opens in a new tab)</span></a></dd></div>
      }
      @if (business().email) {
        <div><dt>Email</dt><dd><a [href]="'mailto:' + business().email">{{ business().email }}</a></dd></div>
      }
      @if (website()) {
        <div><dt>Website</dt><dd><a [href]="website()" target="_blank" rel="noopener noreferrer">{{ business().website }}<span class="sr-only"> (opens in a new tab)</span></a></dd></div>
      }
    </dl>
  `,
  styles: `
    .contact { display: grid; gap: 0.85rem; margin: 0; }
    dt { font-size: 0.8rem; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; color: var(--tk-gray-600); }
    dd { margin: 0.15rem 0 0; overflow-wrap: anywhere; font-weight: 700; }
    a { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
    a:focus-visible { outline: 3px solid var(--tk-magenta); outline-offset: 2px; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  `,
})
export class BusinessContactComponent {
  readonly business = input.required<Business>();
  protected readonly phoneValue = computed(() => phoneDigits(this.business().phone));
  protected readonly whatsapp = computed(() => whatsappLink(this.business().whatsapp, this.business().name));
  protected readonly website = computed(() => safeWebsite(this.business().website));
}
