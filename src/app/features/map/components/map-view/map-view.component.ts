import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { Map as MapLibreMap, Marker, Popup } from 'maplibre-gl';
import { MAP_CONFIG, buildMapStyle } from '../../../../core/config/map.config';
import { MapItem } from '../../models/map-item.models';
import { MAP_LIBRARY_LOADER } from './map-library';
import { createMarkerElement, createPopupContent, setMarkerSelected } from './map-marker';

/** Presentation-only map: renders whatever items it is given and reports interactions. */
@Component({
  selector: 'tk-map-view',
  standalone: true,
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapViewComponent {
  readonly items = input<MapItem[]>([]);
  readonly selectedKey = input<string | null>(null);
  /** When false the map stays on the town centre instead of zooming to the results. */
  readonly fitToResults = input(true);
  readonly markerSelected = output<string>();
  readonly itemOpened = output<MapItem>();

  private readonly config = inject(MAP_CONFIG);
  private readonly loader = inject(MAP_LIBRARY_LOADER);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly container = viewChild<ElementRef<HTMLElement>>('container');

  protected readonly failed = signal(false);
  protected readonly ready = signal(false);

  private lib: typeof import('maplibre-gl') | null = null;
  private map: MapLibreMap | null = null;
  private popup: Popup | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private markers = new Map<string, { marker: Marker; element: HTMLElement; item: MapItem }>();
  private destroyed = false;
  private attempt = 0;

  constructor() {
    afterNextRender(() => void this.initialize());
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.dispose();
    });

    effect(() => {
      const items = this.items();
      if (!this.ready()) return;
      untracked(() => this.syncMarkers(items));
    });
    effect(() => {
      const key = this.selectedKey();
      if (!this.ready()) return;
      this.items();
      untracked(() => this.applySelection(key));
    });
  }

  protected retry(): void {
    void this.initialize();
  }

  private async initialize(): Promise<void> {
    const element = this.container()?.nativeElement;
    if (!this.isBrowser || !element || this.destroyed) return;
    const attempt = ++this.attempt;
    this.dispose();
    this.failed.set(false);
    try {
      this.lib ??= await this.loader();
      if (this.destroyed || attempt !== this.attempt) return;
      const lib = this.lib;
      const { fallbackCenter } = this.config;
      const map = new lib.Map({
        container: element,
        style: buildMapStyle(this.config),
        center: [fallbackCenter.longitude, fallbackCenter.latitude],
        zoom: this.config.fallbackZoom,
        maxZoom: this.config.maxZoom,
        attributionControl: { compact: false },
      });
      this.map = map;
      map.addControl(new lib.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new lib.FullscreenControl({ container: element.parentElement ?? element }), 'top-right');
      map.on('error', (event) => {
        // Individual tile failures must not abort the whole map.
        if (this.ready() || this.map !== map || (event as { tile?: unknown }).tile) return;
        this.fail();
      });
      map.once('load', () => {
        if (this.map !== map || this.destroyed) return;
        map.resize();
        this.ready.set(true);
      });
      // The container may still be laid out at 0 size on first render; re-measure once layout settles.
      requestAnimationFrame(() => {
        if (this.map === map) map.resize();
      });
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => map.resize());
        this.resizeObserver.observe(element);
      }
    } catch {
      if (attempt === this.attempt) this.fail();
    }
  }

  private fail(): void {
    this.dispose();
    this.failed.set(true);
  }

  private syncMarkers(items: MapItem[]): void {
    const map = this.map;
    const lib = this.lib;
    if (!map || !lib) return;
    const nextKeys = new Set(items.map((item) => item.key));
    for (const [key, entry] of this.markers) {
      if (!nextKeys.has(key)) {
        entry.marker.remove();
        this.markers.delete(key);
      }
    }
    for (const item of items) {
      if (this.markers.has(item.key)) continue;
      const element = createMarkerElement(item, false, (key) => this.markerSelected.emit(key));
      const marker = new lib.Marker({ element }).setLngLat([item.longitude, item.latitude]).addTo(map);
      this.markers.set(item.key, { marker, element, item });
    }
    this.fitToItems(items);
  }

  private fitToItems(items: MapItem[]): void {
    const map = this.map;
    const lib = this.lib;
    if (!map || !lib) return;
    if (items.length === 0 || !this.fitToResults()) {
      const { fallbackCenter, fallbackZoom } = this.config;
      map.jumpTo({ center: [fallbackCenter.longitude, fallbackCenter.latitude], zoom: fallbackZoom });
    } else if (items.length === 1) {
      map.jumpTo({ center: [items[0].longitude, items[0].latitude], zoom: this.config.selectedZoom });
    } else {
      const bounds = new lib.LngLatBounds();
      items.forEach((item) => bounds.extend([item.longitude, item.latitude]));
      map.fitBounds(bounds, { padding: 56, maxZoom: this.config.maxFitZoom, duration: 0 });
    }
  }

  private applySelection(key: string | null): void {
    const lib = this.lib;
    const map = this.map;
    for (const [markerKey, entry] of this.markers) setMarkerSelected(entry.element, markerKey === key);
    this.popup?.remove();
    this.popup = null;
    const entry = key ? this.markers.get(key) : undefined;
    if (!entry || !lib || !map) return;
    const { item } = entry;
    map.easeTo({ center: [item.longitude, item.latitude], zoom: Math.max(map.getZoom(), this.config.selectedZoom - 2) });
    this.popup = new lib.Popup({ offset: 22, closeButton: true, maxWidth: '240px' })
      .setLngLat([item.longitude, item.latitude])
      .setDOMContent(createPopupContent(item, (opened) => this.itemOpened.emit(opened)))
      .addTo(map);
  }

  private dispose(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.popup?.remove();
    this.popup = null;
    this.markers.forEach((entry) => entry.marker.remove());
    this.markers.clear();
    const map = this.map;
    this.map = null;
    this.ready.set(false);
    map?.remove();
  }
}
