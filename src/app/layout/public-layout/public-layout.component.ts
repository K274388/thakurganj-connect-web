import { Component } from '@angular/core';
import { AppShellComponent } from '../app-shell/app-shell.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [AppShellComponent],
  template: '<app-shell />',
})
export class PublicLayoutComponent {}
