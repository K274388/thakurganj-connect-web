import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Owner pages and the business forms (/my/businesses, /my/business/new, /my/businesses/:id/edit) need the bearer
  // token, which only exists in the browser, and are noindex, so server rendering them has no benefit. The server
  // answers with the client shell immediately instead of waiting on API calls.
  {
    path: 'my/**',
    renderMode: RenderMode.Client
  },
  // The interactive map (MapLibre) only works in the browser; rendering it on the server would only delay the response
  // while it waits for every business and place.
  {
    path: 'map',
    renderMode: RenderMode.Client
  },
  // Public, SEO-oriented pages keep server rendering.
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
