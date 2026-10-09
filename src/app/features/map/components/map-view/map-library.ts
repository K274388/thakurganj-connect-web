import { InjectionToken } from '@angular/core';

export type MapLibreModule = typeof import('maplibre-gl');

/** Lazily loads MapLibre so it is never evaluated during SSR; replaceable in tests. */
export const MAP_LIBRARY_LOADER = new InjectionToken<() => Promise<MapLibreModule>>('MAP_LIBRARY_LOADER', {
  providedIn: 'root',
  factory: () => () => import('maplibre-gl'),
});
