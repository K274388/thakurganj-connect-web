import { Component, input } from '@angular/core';

@Component({
  selector: 'tk-section-header',
  standalone: true,
  template: `
    <header class="section-header">
      <div>
        @if (eyebrow()) { <p class="eyebrow">{{ eyebrow() }}</p> }
        <h2>{{ title() }}</h2>
        @if (description()) { <p class="description">{{ description() }}</p> }
      </div>
      <ng-content />
    </header>
  `,
  styles: `
    :host { display: block; }
    .section-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 1.5rem; }
    .eyebrow { margin: 0 0 0.5rem; color: var(--tk-magenta-dark); font-size: 0.75rem; font-weight: 850; letter-spacing: 0.12em; text-transform: uppercase; }
    h2 { margin: 0; font-size: clamp(1.8rem, 4vw, 3.2rem); font-weight: 850; letter-spacing: -0.04em; line-height: 1.05; }
    .description { max-width: 42rem; margin: 0.75rem 0 0; color: var(--tk-gray-600); line-height: 1.55; }
    @media (max-width: 600px) { .section-header { align-items: flex-start; flex-direction: column; } }
  `,
})
export class SectionHeaderComponent {
  readonly title = input.required<string>();
  readonly eyebrow = input('');
  readonly description = input('');
}
