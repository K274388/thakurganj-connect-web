import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-business-cta',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="cta-section" aria-labelledby="business-cta-title">
      <div class="tk-container cta-content">
        <h2 id="business-cta-title" class="tk-heading-xl">Got a shop? Put it on the map — free.</h2>
        <a class="tk-button tk-button-primary" routerLink="/my/business/new">List your business <span aria-hidden="true">→</span></a>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .cta-section { padding-block: clamp(2.5rem, 6vw, 5rem); background: var(--tk-magenta); color: var(--tk-white); }
    .cta-content { display: flex; align-items: center; justify-content: space-between; gap: 2rem; }
    h2 { max-width: 17ch; margin: 0; color: inherit; }
    .tk-button { min-height: 3.25rem; flex: 0 0 auto; padding-inline: 1.4rem; border-width: 2px; }
    @media (max-width: 700px) { .cta-content { align-items: flex-start; flex-direction: column; gap: 1.25rem; } }
  `,
})
export class BusinessCtaComponent {}
