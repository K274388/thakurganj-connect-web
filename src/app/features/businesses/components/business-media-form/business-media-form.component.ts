import { Component, OnDestroy, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BUSINESS_MEDIA_CONFIG } from '../business-form/business-form.config';
import { BusinessFormGroup, LocalImage } from '../business-form/business-form.factory';

type SingleKind = 'logo' | 'cover';
type MediaKind = SingleKind | 'photos';

const ALLOWED: readonly string[] = BUSINESS_MEDIA_CONFIG.allowedTypes;

/** Local preview only. Nothing is uploaded; persistence arrives with the upload API story. */
@Component({
  selector: 'app-business-media-form',
  standalone: true,
  styleUrl: '../business-form/business-form-section.scss',
  template: `
    <fieldset class="section" disabled aria-describedby="bf-photos-note">
      <legend>
        <span class="num" aria-hidden="true">06</span><span class="title">Photos</span>
      </legend>
      <p class="note" id="bf-photos-note">
        Photo uploads are currently disabled. To add JPG, PNG or WebP images (up to
        {{ maxSizeMb }} MB each),
        <a href="mailto:hello@thakurganj.connect">contact us to request upload permission</a>.
      </p>
      <div class="media-grid">
        @for (slot of singleSlots; track slot.kind) {
          <div>
            <label class="tk-field-label" [for]="'bf-' + slot.kind">{{ slot.label }}</label>
            <input
              [id]="'bf-' + slot.kind"
              class="tk-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              [attr.aria-describedby]="
                errors()[slot.kind].length ? 'bf-' + slot.kind + '-error' : null
              "
              (change)="select(slot.kind, $event)"
            />
            @for (message of errors()[slot.kind]; track message) {
              <p class="error-text" [id]="'bf-' + slot.kind + '-error'" role="alert">
                {{ message }}
              </p>
            }
            @if (image(slot.kind); as selected) {
              <ul class="preview-list">
                <li class="preview">
                  @if (selected.previewUrl) {
                    <img
                      [src]="selected.previewUrl"
                      [alt]="slot.label + ' preview: ' + selected.name"
                    />
                  } @else {
                    <span class="file-name">{{ selected.name }}</span>
                  }
                  <button
                    type="button"
                    class="remove"
                    [attr.aria-label]="'Remove ' + slot.label.toLowerCase() + ' ' + selected.name"
                    (click)="removeSingle(slot.kind)"
                  >
                    <span aria-hidden="true">�</span>
                  </button>
                </li>
              </ul>
            }
          </div>
        }

        <div>
          <label class="tk-field-label" for="bf-photos">Business photos</label>
          <input
            id="bf-photos"
            class="tk-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            [attr.aria-describedby]="errors().photos.length ? 'bf-photos-error' : null"
            (change)="select('photos', $event)"
          />
          <p class="note">{{ photos().length }} of {{ maxGallery }} photos added.</p>
          @for (message of errors().photos; track message) {
            <p class="error-text" id="bf-photos-error" role="alert">{{ message }}</p>
          }
          @if (photos().length) {
            <ul class="preview-list" aria-label="Selected business photos">
              @for (photo of photos(); track photo.previewUrl + photo.name; let index = $index) {
                <li class="preview">
                  @if (photo.previewUrl) {
                    <img [src]="photo.previewUrl" [alt]="'Business photo preview: ' + photo.name" />
                  } @else {
                    <span class="file-name">{{ photo.name }}</span>
                  }
                  <button
                    type="button"
                    class="remove"
                    [attr.aria-label]="'Remove photo ' + photo.name"
                    (click)="removePhoto(index)"
                  >
                    <span aria-hidden="true">�</span>
                  </button>
                </li>
              }
            </ul>
          }
        </div>
      </div>
    </fieldset>
  `,
})
export class BusinessMediaFormComponent implements OnDestroy {
  readonly group = input.required<BusinessFormGroup['controls']['media']>();

  protected readonly singleSlots: { kind: SingleKind; label: string }[] = [
    { kind: 'logo', label: 'Business logo' },
    { kind: 'cover', label: 'Cover image' },
  ];
  protected readonly maxSizeMb = BUSINESS_MEDIA_CONFIG.maxFileSizeBytes / (1024 * 1024);
  protected readonly maxGallery = BUSINESS_MEDIA_CONFIG.maxGalleryImages;
  protected readonly errors = signal<Record<MediaKind, string[]>>({
    logo: [],
    cover: [],
    photos: [],
  });

  protected image(kind: SingleKind): LocalImage | null {
    return this.group().controls[kind].value;
  }

  protected photos(): LocalImage[] {
    return this.group().controls.photos.value;
  }

  protected select(kind: MediaKind, event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    const messages: string[] = [];
    const valid: File[] = [];

    for (const file of files) {
      if (!ALLOWED.includes(file.type))
        messages.push(`${file.name} is not a JPG, PNG or WebP image.`);
      else if (file.size > BUSINESS_MEDIA_CONFIG.maxFileSizeBytes)
        messages.push(`${file.name} is larger than ${this.maxSizeMb} MB.`);
      else valid.push(file);
    }

    if (kind === 'photos') {
      const room = this.maxGallery - this.photos().length;
      if (valid.length > room) messages.push(`You can add up to ${this.maxGallery} photos.`);
      const accepted = valid.slice(0, Math.max(room, 0)).map((file) => this.toLocalImage(file));
      if (accepted.length)
        this.commit(this.group().controls.photos, [...this.photos(), ...accepted]);
    } else if (valid.length) {
      const control = this.group().controls[kind];
      this.revoke(control.value);
      this.commit(control, this.toLocalImage(valid[0]));
    }
    this.errors.update((current) => ({ ...current, [kind]: messages }));
  }

  protected removeSingle(kind: SingleKind): void {
    const control = this.group().controls[kind];
    this.revoke(control.value);
    this.commit(control, null);
  }

  protected removePhoto(index: number): void {
    const photos = this.photos();
    this.revoke(photos[index]);
    this.commit(
      this.group().controls.photos,
      photos.filter((_, position) => position !== index),
    );
  }

  ngOnDestroy(): void {
    const { logo, cover, photos } = this.group().controls;
    [logo.value, cover.value, ...photos.value].forEach((image) => this.revoke(image));
  }

  private commit<T>(control: FormControl<T>, value: T): void {
    control.setValue(value);
    control.markAsDirty();
    control.markAsTouched();
  }

  private toLocalImage(file: File): LocalImage {
    const canPreview = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
    return { name: file.name, previewUrl: canPreview ? URL.createObjectURL(file) : '' };
  }

  private revoke(image: LocalImage | null | undefined): void {
    if (
      image?.previewUrl &&
      typeof URL !== 'undefined' &&
      typeof URL.revokeObjectURL === 'function'
    ) {
      URL.revokeObjectURL(image.previewUrl);
    }
  }
}
