import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface MapConfig {
  tileUrls: readonly string[];
  tileSize: number;
  maxZoom: number;
  attribution: string;
  fallbackCenter: { latitude: number; longitude: number };
  fallbackZoom: number;
  selectedZoom: number;
  maxFitZoom: number;
}

export const MAP_CONFIG = new InjectionToken<MapConfig>('MAP_CONFIG', {
  providedIn: 'root',
  factory: () => environment.map,
});

/** Single place that defines the OpenStreetMap-compatible raster style; swap the tile source via environment config. */
export function buildMapStyle(config: MapConfig) {
  return {
    version: 8 as const,
    sources: {
      basemap: {
        type: 'raster' as const,
        tiles: [...config.tileUrls],
        tileSize: config.tileSize,
        maxzoom: config.maxZoom,
        attribution: config.attribution,
      },
    },
    layers: [{ id: 'basemap', type: 'raster' as const, source: 'basemap' }],
  };
}
