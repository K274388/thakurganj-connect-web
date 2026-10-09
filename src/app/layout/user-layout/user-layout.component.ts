import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet],
  template: `
    <app-header />
    <main><router-outlet /></main>
  `,
  styles: `
    :host { display: block; min-height: 100vh; color: var(--tk-black); }
    main { min-height: 70vh; }
  `,
})
export class UserLayoutComponent {}
