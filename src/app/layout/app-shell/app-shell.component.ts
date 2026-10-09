import { Component, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnnouncementBarComponent } from '../announcement-bar/announcement-bar.component';
import { FooterComponent, FooterLink } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { AnnouncementBarItem } from '../../shared/models/announcement-bar-item';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [AnnouncementBarComponent, HeaderComponent, FooterComponent, RouterOutlet],
  template: `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <app-announcement-bar [items]="announcements()" />
    <app-header />
    <main id="main-content" tabindex="-1"><router-outlet /></main>
    <app-footer [footerText]="footerText()" [links]="footerLinks()" />
  `,
  styles: `
    :host { display: flex; min-height: 100vh; flex-direction: column; color: var(--tk-black); }
    main { flex: 1; min-height: 55vh; }
    .skip-link { position: fixed; z-index: 100; top: 0.5rem; left: 0.5rem; padding: 0.75rem 1rem; transform: translateY(-150%); border: 2px solid var(--tk-border); border-radius: var(--tk-radius-sm); background: var(--tk-yellow); color: var(--tk-black); font-weight: 800; }
    .skip-link:focus { transform: translateY(0); }
  `,
})
export class AppShellComponent {
  readonly announcements = input<AnnouncementBarItem[]>([
    { id: 'welcome', title: 'Welcome to Thakurganj Connect' },
  ]);
  readonly footerText = input('Local information, shared by our community.');
  readonly footerLinks = input<FooterLink[]>([
    { label: 'About', href: '/about' },
    { label: 'Contact', href: 'mailto:hello@thakurganj.connect' },
    { label: 'Instagram', href: 'https://www.instagram.com/', external: true },
  ]);
}
