import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MapItem } from '../../models/map-item.models';
import { FakeMap, FakeMarker, FakePopup, fakeLibrary, resetMapFakes } from '../../testing/map-fakes';
import { MAP_LIBRARY_LOADER } from './map-library';
import { MapViewComponent } from './map-view.component';

const item = (key: string, entityType: 'business' | 'place', lat: number, lng: number): MapItem => ({
  key,
  entityType,
  id: key,
  slug: key,
  name: `Name ${key}`,
  categoryId: 1,
  categorySlug: 'c',
  categoryName: 'Cat',
  latitude: lat,
  longitude: lng,
  area: 'Area',
  shortDescription: '',
  imageUrl: '',
});

const flush = async (fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) => {
  await fixture.whenStable();
  await Promise.resolve();
  fixture.detectChanges();
  await fixture.whenStable();
};

describe('MapViewComponent', () => {
  let loader: ReturnType<typeof vi.fn>;

  function create(platform: string = 'browser') {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        { provide: MAP_LIBRARY_LOADER, useValue: loader },
      ],
    });
    const fixture = TestBed.createComponent(MapViewComponent);
    fixture.componentRef.setInput('items', [item('business-1', 'business', 26.1, 87.9), item('place-2', 'place', 26.2, 88)]);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    // Instances are static, so clear what earlier specs in this worker created.
    resetMapFakes();
    loader = vi.fn(async () => fakeLibrary());
  });

  it('never loads or initialises MapLibre on the server', async () => {
    const fixture = create('server');
    await flush(fixture);
    expect(loader).not.toHaveBeenCalled();
    expect(FakeMap.instances.length).toBe(0);
  });

  it('creates the map once, renders distinguishable markers and fits bounds', async () => {
    const fixture = create();
    await flush(fixture);
    expect(FakeMap.instances.length).toBe(1);
    expect(FakeMarker.instances.length).toBe(2);
    const [business, place] = FakeMarker.instances.map((m) => m.options.element);
    expect(business.classList.contains('tk-marker-business')).toBe(true);
    expect(place.classList.contains('tk-marker-place')).toBe(true);
    expect(business.textContent).toBe('B');
    expect(place.textContent).toBe('P');
    expect(FakeMarker.instances[0].lngLat).toEqual([87.9, 26.1]);
    expect(FakeMap.instances[0].fitBounds).toHaveBeenCalled();
    expect((FakeMap.instances[0].options['attributionControl'] as { compact: boolean }).compact).toBe(false);

    fixture.componentRef.setInput('items', [item('business-1', 'business', 26.1, 87.9)]);
    await flush(fixture);
    expect(FakeMap.instances.length).toBe(1);
    expect(FakeMarker.instances.filter((m) => m.removed).length).toBe(1);
    expect(FakeMap.instances[0].jumpTo).toHaveBeenCalled();
  });

  it('emits marker selection and opens a popup with a real link for the selected item', async () => {
    const fixture = create();
    const selected: string[] = [];
    fixture.componentInstance.markerSelected.subscribe((key) => selected.push(key));
    await flush(fixture);
    FakeMarker.instances[1].options.element.click();
    expect(selected).toEqual(['place-2']);

    fixture.componentRef.setInput('selectedKey', 'place-2');
    await flush(fixture);
    const popup = FakePopup.instances.at(-1)!;
    expect(popup.content?.textContent).toContain('Name place-2');
    const link = popup.content!.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/places/place-2');
    expect(link.textContent).toBe('View place ?');
    expect(FakeMarker.instances[1].options.element.classList.contains('selected')).toBe(true);

    fixture.componentRef.setInput('selectedKey', 'business-1');
    await flush(fixture);
    expect(popup.removed).toBe(true);
    expect(FakePopup.instances.at(-1)!.content!.querySelector('a')!.getAttribute('href')).toBe('/businesses/business-1');
  });

  it('shows a failure fallback and retries', async () => {
    loader.mockRejectedValueOnce(new Error('no webgl'));
    const fixture = create();
    await flush(fixture);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("We couldn't load the map.");
    expect(el.textContent).toContain('You can still browse the available locations below.');
    el.querySelector<HTMLButtonElement>('.retry')!.click();
    await flush(fixture);
    expect(el.querySelector('.failure')).toBeNull();
    expect(FakeMap.instances.length).toBe(1);
  });

  it('cleans up markers, popup and map on destroy', async () => {
    const fixture = create();
    fixture.componentRef.setInput('selectedKey', 'place-2');
    await flush(fixture);
    fixture.destroy();
    expect(FakeMap.instances[0].removed).toBe(true);
    expect(FakeMarker.instances.every((m) => m.removed)).toBe(true);
    expect(FakePopup.instances.every((p) => p.removed)).toBe(true);
  });
});
