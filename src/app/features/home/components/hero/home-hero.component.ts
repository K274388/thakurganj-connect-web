import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { SearchBoxComponent } from '../../../../shared/components/search-box/search-box.component';
import { ImagePlaceholderComponent } from '../../../../shared/components/image-placeholder/image-placeholder.component';
import { HomeStatistics } from '../../models/home.models';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [SearchBoxComponent, ImagePlaceholderComponent],
  template: `
    <section class="hero" aria-labelledby="hero-title">
      <div class="tk-container hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Thakurganj, Bihar</p>
          <h1 id="hero-title" class="tk-display-xl">Apne shehar ki apni<br class="desktop-break" /> jankari.</h1>
          <p class="intro">Every shop, service and landmark in Thakurganj — find it, call it, get directions.</p>
          <tk-search-box
            class="hero-search"
            placeholder="What are you looking for?"
            buttonText="Search"
            (search)="search($event)"
          />
        </div>

        <div class="hero-visual">
          <div class="stats" aria-label="Thakurganj Connect directory statistics">
            <article class="stat businesses">
              <strong>{{ statistics().businessCount }}</strong>
              <span>businesses<br />listed</span>
            </article>
            <article class="stat places">
              <strong>{{ statistics().placeCount }}</strong>
              <span>places to<br />explore</span>
            </article>
          </div>
          <div class="hero-image">
            <tk-image-placeholder
              [src]="heroImageUrl() ?? ''"
              alt="Photo of Thakurganj market"
              placeholderText="Photo of Thakurganj market"
              [lazy]="false"
            />
            <span class="image-caption">THAKURGANJ · OUR TOWN</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .hero { overflow: hidden; padding-block: clamp(3rem, 7vw, 6rem); border-bottom: 2px solid var(--tk-border); background: var(--tk-yellow); }
    .hero-grid { display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; gap: clamp(2rem, 5vw, 5rem); }
    .eyebrow { margin: 0 0 1rem; font-size: 0.8rem; font-weight: 850; letter-spacing: 0.14em; text-transform: uppercase; }
    .hero h1 { margin: 0; font-size: clamp(3rem, 5vw, 5rem); }
    .intro { max-width: 36rem; margin: 1.25rem 0 1.75rem; font-size: clamp(1.05rem, 1.7vw, 1.3rem); font-weight: 550; line-height: 1.5; }
    .hero-search { width: min(100%, 43rem); }
    .hero-visual { display: grid; gap: 1rem; }
    .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .stat { display: flex; min-height: 7rem; align-items: center; gap: 0.9rem; padding: 1rem; border: 2px solid var(--tk-border); border-radius: var(--tk-radius-md); background: var(--tk-black); color: var(--tk-white); }
    .stat strong { font-size: clamp(2rem, 3.4vw, 3.25rem); font-weight: 900; letter-spacing: -0.06em; line-height: 1; }
    .stat span { font-size: 0.88rem; font-weight: 750; line-height: 1.2; }
    .stat.places { background: var(--tk-magenta); }
    .hero-image { position: relative; overflow: hidden; min-height: 16rem; border: 2px solid var(--tk-border); border-radius: var(--tk-radius-lg); background: var(--tk-yellow-light); }
    tk-image-placeholder { position: absolute; inset: 0; }
    .image-caption { position: absolute; right: 0.8rem; bottom: 0.8rem; padding: 0.4rem 0.6rem; border: 2px solid var(--tk-border); border-radius: var(--tk-radius-sm); background: var(--tk-white); font-size: 0.7rem; font-weight: 900; letter-spacing: 0.08em; }
    @media (min-width: 1200px) {
      .hero-grid { grid-template-columns: minmax(0, 1.15fr) minmax(20rem, 0.85fr); }
    }
    @media (max-width: 767px) {
      .desktop-break { display: none; }
      .hero-visual { grid-template-columns: minmax(0, 1fr); }
      .stats { gap: 0.65rem; }
      .stat { min-height: 6rem; flex-direction: row; align-items: center; padding: 0.75rem; }
      .stat strong { font-size: clamp(1.8rem, 8vw, 2.6rem); }
      .stat span { font-size: 0.78rem; }
      .hero-image { min-height: 13rem; }
    }
  `,
})
export class HomeHeroComponent {
  readonly statistics = input.required<HomeStatistics>();
  readonly heroImageUrl = input<string | undefined>();

  constructor(private readonly router: Router) {}

  protected search(term: string): void {
    const search = term.trim();
    if (search) void this.router.navigate(['/businesses'], { queryParams: { search } });
  }
}
