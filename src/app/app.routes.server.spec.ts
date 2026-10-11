import { RenderMode } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

const renderModeOf = (path: string) => serverRoutes.find((route) => route.path === path)?.renderMode;

describe('serverRoutes', () => {
  it('renders owner pages and business forms (/my/business/new, /my/businesses/:id/edit) in the browser', () => {
    expect(renderModeOf('my/**')).toBe(RenderMode.Client);
  });

  it('renders the interactive map in the browser', () => {
    expect(renderModeOf('map')).toBe(RenderMode.Client);
  });

  it('keeps server rendering for every other (public, SEO) page, as the last entry', () => {
    const fallback = serverRoutes.at(-1);
    expect(fallback?.path).toBe('**');
    expect(fallback?.renderMode).toBe(RenderMode.Server);
  });
});
