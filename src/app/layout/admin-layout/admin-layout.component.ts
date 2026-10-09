import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="admin-shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/admin/dashboard">TC <span>Admin</span></a>
        <nav aria-label="Admin navigation">
          <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
        </nav>
        <a class="back-link" routerLink="/">View public site</a>
      </aside>
      <div class="workspace">
        <header class="topbar">Thakurganj Connect <span>Administration</span></header>
        <main><router-outlet /></main>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; min-height: 100vh; color: var(--tk-black); }
    .admin-shell { display: grid; min-height: 100vh; grid-template-columns: 15rem minmax(0, 1fr); }
    .sidebar { display: flex; flex-direction: column; gap: 2rem; padding: 1.5rem; border-right: 2px solid var(--tk-border); background: var(--tk-black); color: var(--tk-white); }
    .brand { color: var(--tk-white); font-size: 1.35rem; font-weight: 900; text-decoration: none; }
    .brand span { display: block; margin-top: 0.25rem; color: var(--tk-yellow); font-size: 0.8rem; letter-spacing: 0.12em; text-transform: uppercase; }
    nav { display: grid; gap: 0.5rem; }
    nav a, .back-link { padding: 0.75rem; border-radius: 0.5rem; color: inherit; font-weight: 650; text-decoration: none; }
    nav a.active, nav a:hover, .back-link:hover { background: var(--tk-dark); }
    .back-link { margin-top: auto; }
    .workspace { min-width: 0; }
    .topbar { display: flex; justify-content: space-between; padding: 1.25rem 2rem; border-bottom: 2px solid var(--tk-border); font-weight: 800; }
    .topbar span { color: var(--tk-gray-600); font-weight: 500; }
    @media (max-width: 700px) {
      .admin-shell { grid-template-columns: 1fr; }
      .sidebar { gap: 1rem; padding: 1rem; border-right: 0; border-bottom: 2px solid var(--tk-border); }
      nav { display: flex; }
      .back-link { margin-top: 0; }
      .topbar { padding: 1rem; }
    }
  `,
})
export class AdminLayoutComponent {}
