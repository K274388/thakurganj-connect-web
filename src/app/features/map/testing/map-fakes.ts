import { vi } from 'vitest';
import { MapLibreModule } from '../components/map-view/map-library';

export class FakeMap {
  static instances: FakeMap[] = [];
  removed = false;
  jumpTo = vi.fn();
  fitBounds = vi.fn();
  easeTo = vi.fn();
  resize = vi.fn();
  addControl = vi.fn();
  getZoom = () => 10;
  handlers: Record<string, () => void> = {};
  constructor(readonly options: Record<string, unknown>) {
    FakeMap.instances.push(this);
  }
  on(name: string, handler: () => void) { this.handlers[name] = handler; }
  once(name: string, handler: () => void) { if (name === 'load') queueMicrotask(handler); else this.handlers[name] = handler; }
  remove() { this.removed = true; }
}
export class FakeMarker {
  static instances: FakeMarker[] = [];
  removed = false;
  lngLat: number[] = [];
  constructor(readonly options: { element: HTMLElement }) { FakeMarker.instances.push(this); }
  setLngLat(value: number[]) { this.lngLat = value; return this; }
  addTo() { return this; }
  remove() { this.removed = true; }
}
export class FakePopup {
  static instances: FakePopup[] = [];
  removed = false;
  content: HTMLElement | null = null;
  constructor(readonly options: unknown) { FakePopup.instances.push(this); }
  setLngLat() { return this; }
  setDOMContent(content: HTMLElement) { this.content = content; return this; }
  addTo() { return this; }
  remove() { this.removed = true; }
}
class FakeControl {}
class FakeBounds { points: number[][] = []; extend(p: number[]) { this.points.push(p); } }

export function fakeLibrary(): MapLibreModule {
  FakeMap.instances = [];
  FakeMarker.instances = [];
  FakePopup.instances = [];
  return {
    Map: FakeMap,
    Marker: FakeMarker,
    Popup: FakePopup,
    NavigationControl: FakeControl,
    FullscreenControl: FakeControl,
    LngLatBounds: FakeBounds,
  } as unknown as MapLibreModule;
}

