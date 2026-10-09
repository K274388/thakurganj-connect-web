import { Routes } from '@angular/router';

export const PLACES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/place-directory/place-directory.component').then(
        (module) => module.PlaceDirectoryComponent,
      ),
    title: 'Explore Thakurganj | Places & Landmarks | Thakurganj Connect',
    data: {
      description:
        'Explore landmarks, religious places, markets, transportation, hospitals, schools, parks and other useful places in Thakurganj.',
    },
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./pages/place-details/place-details.component').then(
        (module) => module.PlaceDetailsComponent,
      ),
    // The component sets the title once the place is resolved (no inject() in route callbacks).
    title: 'Place | Thakurganj Connect',
  },
];
