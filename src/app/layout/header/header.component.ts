import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideMenu, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideMenu, LucideX],
  template: `
    <header class="header">
      <a class="brand" routerLink="/" aria-label="Thakurganj Connect home">
        <span class="leaf" aria-hidden="true">◕</span>
        <span><strong>Thakurganj Connect</strong><small>Apne Shehar Ki Apni Jankari</small></span>
      </a>
      <button class="menu-toggle" type="button" [attr.aria-expanded]="menuOpen()" aria-controls="primary-navigation" (click)="menuOpen.update(value => !value)">
        @if (menuOpen()) { <svg lucideX></svg> } @else { <svg lucideMenu></svg> }
        <span class="visually-hidden">{{ menuOpen() ? 'Close menu' : 'Open menu' }}</span>
      </button>
      <nav id="primary-navigation" aria-label="Main navigation" [class.open]="menuOpen()">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="menuOpen.set(false)">Home</a>
        <a routerLink="/about" routerLinkActive="active" (click)="menuOpen.set(false)">About Thakurganj</a>
        <a routerLink="/businesses" routerLinkActive="active" (click)="menuOpen.set(false)">Businesses</a>
        <a routerLink="/announcements" routerLinkActive="active" (click)="menuOpen.set(false)">News</a>
        <a routerLink="/map" routerLinkActive="active" (click)="menuOpen.set(false)">Map</a>
        <a class="cta" routerLink="/my/business/new" (click)="menuOpen.set(false)">+ Add Business</a>
      </nav>
    </header>
  `,
  styles: `
    :host { display: block; position: relative; z-index: 10; background: #fff; box-shadow: 0 1px 4px #10274715; color: #102747; }
    .header { display: flex; height: 68px; align-items: center; justify-content: space-between; gap: 24px; width: min(1200px, 94%); margin-inline: auto; }
    .brand { display: flex; align-items: center; gap: 9px; min-width: max-content; color: inherit; text-decoration: none; }
    .leaf { display: grid; place-items: center; width: 37px; height: 37px; border-radius: 70% 0 70% 0; background: linear-gradient(135deg, #72bf50, #007f41); color: #fff; font-size: 29px; transform: rotate(-12deg); }
    .brand strong { display: block; font-size: 17px; letter-spacing: -0.5px; }
    .brand small { display: block; margin-top: 2px; color: #627587; font-size: 10px; }
    nav { display: flex; height: 100%; align-items: center; gap: 22px; }
    nav a { display: flex; height: 100%; align-items: center; border-bottom: 2px solid transparent; color: inherit; font-size: 11px; font-weight: 600; text-decoration: none; white-space: nowrap; }
    nav a:hover, nav a.active { border-bottom-color: #07863c; }
    nav a.cta { height: auto; padding: 13px 21px; border: 0; border-radius: 6px; background: #09662d; color: #fff; font-weight: 700; }
    .menu-toggle { display: none; border: 0; background: none; color: inherit; cursor: pointer; }
    .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    @media (max-width: 1100px) { nav { gap: 12px; } nav a { font-size: 10px; } .header { gap: 10px; } }
    @media (max-width: 900px) {
      .header { height: 62px; }
      .menu-toggle { display: block; margin-left: auto; }
      nav { position: absolute; top: 62px; right: 0; left: 0; display: none; height: auto; flex-direction: column; align-items: stretch; gap: 0; background: #fff; box-shadow: 0 12px 20px #0002; }
      nav.open { display: flex; }
      nav a { height: auto; padding: 13px 5%; font-size: 13px; }
      nav a.cta { margin: 0.5rem 5% 1rem; text-align: center; justify-content: center; }
    }
  `,
})
export class HeaderComponent {
  protected readonly menuOpen = signal(false);
}
