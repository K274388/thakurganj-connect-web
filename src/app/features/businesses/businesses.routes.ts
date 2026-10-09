import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const BUSINESSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/business-directory/business-directory.component').then(
        (module) => module.BusinessDirectoryComponent,
      ),
    title: 'Businesses in Thakurganj | Thakurganj Connect',
    data: {
      description: 'Find shops, restaurants, healthcare, services and local businesses in Thakurganj.',
    },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/business-details/business-details.component').then(
        (module) => module.BusinessDetailsComponent,
      ),
    // The component sets the title once the business is resolved (no inject() in route callbacks).
    title: 'Business | Thakurganj Connect',
  },
];

/** Account-oriented routes under /my/businesses (private, noindex). */
export const MY_BUSINESSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/my-businesses/my-businesses.component').then((module) => module.MyBusinessesComponent),
    title: 'My businesses | Thakurganj Connect',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/add-business/add-business.component').then((module) => module.AddBusinessComponent),
    canDeactivate: [unsavedChangesGuard],
    title: 'Add your business | Thakurganj Connect',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/edit-business/edit-business.component').then((module) => module.EditBusinessComponent),
    canDeactivate: [unsavedChangesGuard],
    title: 'Edit your business | Thakurganj Connect',
  },
];
