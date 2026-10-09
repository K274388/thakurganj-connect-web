import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((module) => module.HomeComponent),
    title: 'Thakurganj Connect | Local Information for Your Town',
    data: {
      description: 'Every shop, service and landmark in Thakurganj — find it, call it, get directions.',
    },
  },
];
