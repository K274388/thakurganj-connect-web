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
      <div class="bottom">
        <span>© {{ year }} Thakurganj Connect · Independent community information service</span>
        <nav class="legal" aria-label="Legal">
          @for (link of legalLinks; track link.href) {
            <a [routerLink]="link.href">{{ link.label }}</a>
          }
        </nav>
      </div>
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
    .bottom { align-items: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ffffff22; color: #afbbcc; font-size: 0.8rem; }
    .legal { gap: 0.25rem 1rem; }
    .legal a { padding-block: 0.35rem; color: #afbbcc; font-weight: 600; }
    .legal a:hover { color: #fff; }
    @media (max-width: 650px) {
      .top, .bottom { flex-direction: column; align-items: flex-start; gap: 1rem; }
      nav { justify-content: flex-start; }
      .legal { display: grid; grid-template-columns: 1fr 1fr; width: 100%; gap: 0.25rem 1rem; }
      .legal a { padding-block: 0.55rem; }
    }
  `,
})
export class FooterComponent {
  readonly footerText = input('Local information, shared by our community.');
  readonly links = input<FooterLink[]>([
    { label: 'About', href: '/about' },
    { label: 'Contact', href: 'mailto:hello@thakurganj.connect' },
    { label: 'Instagram', href: 'https://www.instagram.com/', external: true },
  ]);
  protected readonly legalLinks: FooterLink[] = [
    { label: 'Terms & Conditions', href: '/legal/terms' },
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Disclaimer', href: '/legal/disclaimer' },
    { label: 'Report an Issue', href: '/legal/report' },
  ];
  protected readonly year = new Date().getFullYear();
}

