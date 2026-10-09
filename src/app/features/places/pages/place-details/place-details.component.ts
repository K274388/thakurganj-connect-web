import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImagePlaceholderComponent } from '../../../../shared/components/image-placeholder/image-placeholder.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { PlaceCardComponent } from '../../../../shared/components/place-card/place-card.component';
import { PlaceRepository } from '../../data/place.repository';
import { Place } from '../../models/place.models';
import { buildDirectionsUrl, getPlaceGalleryImages, getRelatedPlaces } from '../../utils/place.utils';

type PlaceDetailsState =
  | { status: 'loading' }
  | { status: 'success'; place: Place }
  | { status: 'not-found' }
  | { status: 'unavailable' }
  | { status: 'error' };

const SITE_NAME = 'Thakurganj Connect';

@Component({
  selector: 'app-place-details',
  standalone: true,
  imports: [RouterLink, ImagePlaceholderComponent, LoadingComponent, PlaceCardComponent],
  templateUrl: './place-details.component.html',
  styleUrl: './place-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly repository = inject(PlaceRepository);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private slug = '';
  private feedbackTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly state = signal<PlaceDetailsState>({ status: 'loading' });
  protected readonly selectedIndex = signal(0);
  protected readonly shareFeedback = signal('');

  protected readonly place = computed(() => {
    const state = this.state();
    return state.status === 'success' ? state.place : null;
  });
  protected readonly gallery = computed(() => {
    const place = this.place();
    return place ? getPlaceGalleryImages(place) : [];
  });
  protected readonly mainImage = computed(() => {
    const images = this.gallery();
    return images[this.selectedIndex()] ?? images[0] ?? '';
  });
  protected readonly imageAlt = computed(() => {
    const place = this.place();
    if (!place) return '';
    const count = this.gallery().length;
    return count > 1 ? `${place.name} - photo ${this.selectedIndex() + 1} of ${count}` : place.name;
  });
  protected readonly locationSummary = computed(() => {
    const place = this.place();
    return place ? place.area.trim() || place.landmark.trim() : '';
  });
  protected readonly locationRows = computed(() => {
    const place = this.place();
    if (!place) return [];
    return [
      { label: 'Address', value: place.address },
      { label: 'Area', value: place.area },
      { label: 'Landmark', value: place.landmark },
      { label: 'PIN Code', value: place.pinCode },
    ].filter((row) => row.value?.trim());
  });
  protected readonly aboutText = computed(() => {
    const place = this.place();
    return place ? place.description.trim() || place.shortDescription.trim() : '';
  });
  protected readonly directionsUrl = computed(() => {
    const place = this.place();
    return place ? buildDirectionsUrl(place) : null;
  });
  protected readonly relatedPlaces = computed(() => {
    const place = this.place();
    return place ? getRelatedPlaces(this.repository.getPlaces(), place, 3) : [];
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.feedbackTimer));
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.slug = params.get('slug') ?? '';
      this.load();
    });
  }

  protected load(): void {
    this.state.set({ status: 'loading' });
    this.selectedIndex.set(0);
    this.shareFeedback.set('');
    try {
      const place = this.repository.getPlaceBySlug(this.slug);
      if (!place) this.state.set({ status: 'not-found' });
      else if (!place.active) this.state.set({ status: 'unavailable' });
      else this.state.set({ status: 'success', place });
    } catch {
      this.state.set({ status: 'error' });
    }
    this.updateSeo();
  }

  protected selectImage(index: number): void {
    if (index >= 0 && index < this.gallery().length) this.selectedIndex.set(index);
  }

  protected onThumbnailKeydown(event: KeyboardEvent, index: number): void {
    const last = this.gallery().length - 1;
    const target =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? index >= last ? 0 : index + 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? index <= 0 ? last : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;
    if (target === null) return;
    event.preventDefault();
    this.selectImage(target);
    if (this.isBrowser) {
      const buttons = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>('button');
      buttons?.[target]?.focus();
    }
  }

  protected async share(): Promise<void> {
    const place = this.place();
    if (!place || !this.isBrowser) return;
    const url = this.publicUrl(place.slug);
    const nav = this.document.defaultView?.navigator;
    if (!nav) return;

    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: place.name, text: place.shortDescription || place.name, url });
      } catch {
        // User dismissed the share sheet; nothing to report.
      }
      return;
    }
    if (nav.clipboard?.writeText) {
      try {
        await nav.clipboard.writeText(url);
        this.announce('Link copied');
      } catch {
        this.announce('Could not copy the link');
      }
      return;
    }
    this.announce('Sharing is not supported in this browser');
  }

  private announce(message: string): void {
    this.shareFeedback.set(message);
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => this.shareFeedback.set(''), 4000);
  }

  private publicUrl(slug: string): string {
    const origin = this.document.location?.origin ?? '';
    return `${origin}/places/${encodeURIComponent(slug)}`;
  }

  private updateSeo(): void {
    const state = this.state();
    const place = state.status === 'success' ? state.place : null;
    const pageTitle = place
      ? `${place.name} | ${SITE_NAME}`
      : state.status === 'loading'
        ? `Loading place | ${SITE_NAME}`
        : state.status === 'error'
          ? `Place error | ${SITE_NAME}`
          : state.status === 'not-found'
            ? `Place not found | ${SITE_NAME}`
            : `Place unavailable | ${SITE_NAME}`;
    this.title.setTitle(pageTitle);

    if (!place) {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
      this.meta.removeTag('property="og:image"');
      return;
    }
    this.meta.removeTag('name="robots"');
    const description =
      place.shortDescription.trim() ||
      `Explore ${place.name}, location information and useful details in Thakurganj.`;
    const path = `/places/${place.slug}`;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:url', content: this.publicUrl(place.slug) });
    const image = this.gallery()[0];
    if (image) this.meta.updateTag({ property: 'og:image', content: image });
    else this.meta.removeTag('property="og:image"');

    let canonical = this.document.head?.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? null;
    if (!canonical && this.document.head) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical?.setAttribute('href', path);
  }
}
