import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="top">
        <div>
          <a class="brand" routerLink="/">Thakurganj.connect</a>
          <p>{{ footerText() }}</p>
        </div>
        <nav aria-label="Footer navigation">
          @for (link of links(); track link.label) {
            @if (link.href.startsWith('/')) {
              <a [routerLink]="link.href">{{ link.label }}</a>
            } @else {
              <a [href]="link.href" [attr.target]="link.external ? '_blank' : null" [attr.rel]="link.external ? 'noreferrer' : null">{{ link.label }}</a>
            }
          }
        </nav>
      </div>
      <div class="bottom"><span>Â© {{ year }} Thakurganj Connect</span><span>Made for our town.</span></div>
    </footer>
  `,
  styles: `
    :host { display: block; }
    .footer { padding: 2.5rem max(1rem, calc((100% - var(--tk-container-width)) / 2)) 1.25rem; background: #10243b; color: #fff; }
    .top, .bottom { display: flex; align-items: flex-start; justify-content: space-between; gap: 2rem; }
    .brand { color: #fff; font-size: 1.4rem; font-weight: 900; letter-spacing: -0.06em; text-decoration: none; }
    p { max-width: 30rem; margin: 0.65rem 0 0; color: #d3dbe6; line-height: 1.5; }
    nav { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 1.25rem; }
    nav a { color: #d3dbe6; font-weight: 700; text-decoration: none; }
    nav a:hover { text-decoration: underline; }
    .bottom { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ffffff22; color: #afbbcc; font-size: 0.8rem; }
    @media (max-width: 650px) { .top, .bottom { flex-direction: column; gap: 1rem; } nav { justify-content: flex-start; } .bottom { gap: 0.35rem; } }
  `,
})
export class FooterComponent {
  readonly footerText = input('Local information, shared by our community.');
  readonly links = input<FooterLink[]>([
    { label: 'About', href: '/about' },
    { label: 'Contact', href: 'mailto:hello@thakurganj.connect' },
    { label: 'Instagram', href: 'https://www.instagram.com/', external: true },
  ]);
  protected readonly year = new Date().getFullYear();
}

