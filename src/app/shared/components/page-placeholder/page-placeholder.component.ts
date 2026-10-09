import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-placeholder',
  standalone: true,
  template: `
    <section class="placeholder" aria-labelledby="page-title">
      <p class="eyebrow">Thakurganj Connect</p>
      <h1 id="page-title">{{ title() }}</h1>
      <p class="description">{{ description() }}</p>
    </section>
  `,
  styles: `
    .placeholder {
      box-sizing: border-box;
      max-width: 72rem;
      min-height: 55vh;
      margin: 0 auto;
      padding: clamp(3rem, 9vw, 7rem) 1.5rem;
    }

    .eyebrow {
      margin: 0 0 1rem;
      color: var(--tk-magenta-dark);
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    h1 {
      max-width: 15ch;
      margin: 0;
      font-size: clamp(2.5rem, 7vw, 5rem);
      line-height: 0.98;
    }

    .description {
      max-width: 42rem;
      margin: 1.5rem 0 0;
      color: var(--tk-gray-600);
      font-size: 1.125rem;
      line-height: 1.6;
    }
  `,
})
export class PagePlaceholderComponent {
  readonly title = input('Thakurganj Connect');
  readonly description = input('Local information for Thakurganj, Bihar.');
}
