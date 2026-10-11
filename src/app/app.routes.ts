import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { UserLayoutComponent } from './layout/user-layout/user-layout.component';
import { unsavedChangesGuard } from './features/businesses/guards/unsaved-changes.guard';

function page(path: string, title: string, description: string, notice?: string) {
  return {
    path,
    loadComponent: () =>
      import('./shared/components/page-placeholder/page-placeholder.component').then(
        (component) => component.PagePlaceholderComponent,
      ),
    title,
    data: { title, description, ...(notice ? { notice } : {}) },
  };
}

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/home/home.routes').then((module) => module.HOME_ROUTES),
      },
      {
        path: 'businesses',
        loadChildren: () =>
          import('./features/businesses/businesses.routes').then((module) => module.BUSINESSES_ROUTES),
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/categories/categories.routes').then((module) => module.CATEGORIES_ROUTES),
      },
      { path: 'places', pathMatch: 'full', redirectTo: '/' },
      { path: 'places/:slug', redirectTo: '/' },
      {
        path: 'transportation',
        loadComponent: () =>
          import('./features/transportation/transportation.component').then(
            (module) => module.TransportationComponent,
          ),
        title: 'Transportation in Thakurganj | Thakurganj Connect',
        data: {
          description:
            'Find railway, road, bus, airport and local travel information for Thakurganj.',
        },
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./features/map/pages/map-explorer/map-explorer.component').then(
            (module) => module.MapExplorerComponent,
          ),
        title: 'Map of Thakurganj | Businesses & Places | Thakurganj Connect',
        data: {
          description:
            'Explore businesses, landmarks, markets, transportation and useful places across Thakurganj on an interactive map.',
        },
      },
      page('events', 'Events', 'See what is happening in Thakurganj.'),
      page('events/:id', 'Event details', 'Event information for the Thakurganj community.'),
      page(
        'announcements',
        'Announcements',
        'This page will show events and programs happening, or coming up, in the Thakurganj area.',
        'This page is in development. Announcements will be shared here once it is connected to the admin panel.',
      ),
      page('announcements/:id', 'Announcement details', 'Read the full announcement.'),
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/pages/about/about.component').then(
            (module) => module.AboutComponent,
          ),
        title: 'About Thakurganj | Thakurganj Connect',
        data: {
          description:
            'Discover Thakurganj’s geography, history, culture, agriculture and community with Thakurganj Connect.',
        },
      },
      { path: 'legal', pathMatch: 'full', redirectTo: 'legal/terms' },
      { path: 'terms', redirectTo: 'legal/terms' },
      { path: 'privacy', redirectTo: 'legal/privacy' },
      {
        path: 'legal/:section',
        loadComponent: () =>
          import('./features/legal/pages/legal/legal.component').then(
            (module) => module.LegalComponent,
          ),
        // The component sets the title and description for the selected section.
        title: 'Policies | Thakurganj Connect',
      },
      page('emergency', 'Emergency information', 'Emergency contacts for Thakurganj.'),
      page('login', 'Log in', 'Log in to your Thakurganj Connect account.'),
      page('register', 'Create an account', 'Create an account to connect with the local community.'),
    ],
  },
  {
    path: 'my',
    component: UserLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'businesses' },
      {
        path: 'businesses',
        loadChildren: () =>
          import('./features/businesses/businesses.routes').then((module) => module.MY_BUSINESSES_ROUTES),
      },
      {
        path: 'business',
        children: [
          { path: '', pathMatch: 'full', redirectTo: '/my/businesses' },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/businesses/pages/add-business/add-business.component').then(
                (module) => module.AddBusinessComponent,
              ),
            canDeactivate: [unsavedChangesGuard],
            title: 'Add your business | Thakurganj Connect',
          },
        ],
      },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      page('dashboard', 'Admin dashboard', 'Manage Thakurganj Connect from one place.'),
    ],
  },
  page('**', 'Page not found', 'The page you are looking for does not exist.'),
];
