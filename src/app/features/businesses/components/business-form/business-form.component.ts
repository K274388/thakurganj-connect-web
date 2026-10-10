import { Component, ElementRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryRepository } from '../../../categories/data/category.repository';
import { Business, CreateBusinessRequest } from '../../models/business.models';
import { BusinessBasicInfoFormComponent } from '../business-basic-info-form/business-basic-info-form.component';
import { BusinessContactFormComponent } from '../business-contact-form/business-contact-form.component';
import { BusinessHoursFormComponent } from '../business-hours-form/business-hours-form.component';
import { BusinessLocationFormComponent } from '../business-location-form/business-location-form.component';
import { BusinessMediaFormComponent } from '../business-media-form/business-media-form.component';
import { BusinessServicesFormComponent } from '../business-services-form/business-services-form.component';
import { createBusinessForm } from './business-form.factory';
import { hydrateBusinessForm } from './business-form.hydrate';
import { toCreateBusinessRequest } from './business-form.mapper';

export type BusinessFormMode = 'create' | 'edit';
export type BusinessSaveState = 'idle' | 'saving' | 'success' | 'error';

/** Reusable form for adding or editing a business. Routing, authorization and persistence stay with the host page. */
@Component({
  selector: 'app-business-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BusinessBasicInfoFormComponent,
    BusinessContactFormComponent,
    BusinessLocationFormComponent,
    BusinessServicesFormComponent,
    BusinessHoursFormComponent,
    BusinessMediaFormComponent,
  ],
  styleUrl: './business-form.component.scss',
  template: `
    <div class="form-layout">
      <div class="form-card">
        @if (!isEdit()) {
          <div class="tabs" aria-label="Registration details">
            <button type="button" class="tab" [class.active]="!detailsExpanded()" [attr.aria-pressed]="!detailsExpanded()"
              (click)="detailsExpanded.set(false)">Quick Register</button>
            <button type="button" class="tab" [class.active]="detailsExpanded()" [attr.aria-pressed]="detailsExpanded()"
              (click)="detailsExpanded.set(true)">Add More Details</button>
          </div>
        }
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @if (showSummary()) {
            <div #summary class="summary" role="alert" tabindex="-1">
              <h2>{{ isEdit() ? "We couldn't save your changes yet." : "We couldn't add your business yet." }}</h2>
              <p>Please review the highlighted fields below.</p>
            </div>
          }
          @if (saveState() === 'error') {
            <div class="summary save-error" role="alert">
              <h2>{{ isEdit() ? "We couldn't save your changes." : "We couldn't add your business." }}</h2>
              <p>{{ isEdit() ? 'Your edits have not been lost. Please try again.' : 'Your information has not been lost. Please try again.' }}</p>
              <button type="button" class="tk-button tk-button-dark" (click)="submit()">Try again</button>
            </div>
          }

          <h2 class="form-title">Tell us about your work</h2>
          <p class="form-subtitle">Just a few details to get started. Fields marked * are required.</p>
          <app-business-basic-info-form [group]="form.controls.basicInfo" [showDetails]="isEdit() || detailsExpanded()" />
          <app-business-contact-form [group]="form.controls.contact" [showDetails]="isEdit() || detailsExpanded()"
            [requiredFields]="!isEdit()" />
          <app-business-location-form [group]="form.controls.location" [showDetails]="isEdit() || detailsExpanded()"
            [requiredFields]="!isEdit()" />
          @if (isEdit() || detailsExpanded()) {
            <app-business-services-form [group]="form.controls.services" />
            <app-business-hours-form [hours]="form.controls.hours" />
            @if (existingImageUrl()) {
              <figure class="saved-image">
                <img [src]="existingImageUrl()" alt="Current saved business photo" />
                <figcaption>Current saved photo. Photos you select below are local previews only and are not saved yet.</figcaption>
              </figure>
            }
            <app-business-media-form [group]="form.controls.media" />
          }

          <div class="actions">
            <button type="button" class="tk-button tk-button-outline" (click)="cancelled.emit()">Cancel</button>
            <button type="submit" class="tk-button tk-button-primary" [disabled]="saveState() === 'saving'">
              {{ saveState() === 'saving' ? (isEdit() ? 'Saving changes...' : 'Adding business...') : label() }}
            </button>
          </div>
        </form>
      </div>

      @if (!isEdit()) {
        <aside class="listing-aside" aria-labelledby="listing-preview-title">
          <h2 id="listing-preview-title">Your listing preview</h2>
          <p class="aside-intro">See how people might find you.</p>
          <div class="preview">
            <p class="preview-label">LOCAL LISTING</p>
            <h3>{{ preview().name || 'Your business name' }}</h3>
            <p>{{ preview().category || 'Category will appear here' }}</p>
            <p>📍 {{ preview().area || 'Thakurganj, Bihar' }}</p>
            <p>☎ {{ preview().phone || 'Contact number' }}</p>
          </div>
          <ul class="benefits">
            <li>Free local visibility</li>
            <li>Customers can call you</li>
            <li>Suitable for shops and individuals</li>
            <li>Add more information anytime</li>
          </ul>
        </aside>
      }
    </div>
  `,
})
export class BusinessFormComponent implements OnInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly categories = inject(CategoryRepository).categories;

  readonly saveState = input<BusinessSaveState>('idle');
  readonly mode = input<BusinessFormMode>('create');
  readonly business = input<Business | null>(null);
  readonly submitLabel = input('');
  readonly saved = output<CreateBusinessRequest>();
  readonly cancelled = output<void>();

  readonly form = createBusinessForm();
  protected readonly showSummary = signal(false);
  protected readonly isEdit = computed(() => this.mode() === 'edit');
  protected readonly detailsExpanded = signal(false);
  protected readonly preview = signal({ name: '', category: '', area: '', phone: '' });
  protected readonly label = computed(() => this.submitLabel() || (this.isEdit() ? 'Save changes' : 'Add your business'));
  protected readonly existingImageUrl = computed(() => {
    const business = this.business();
    return this.isEdit() && business ? business.logoUrl || business.coverImageUrl || business.imageUrl || '' : '';
  });

  constructor() {
    this.form.valueChanges.subscribe(() => this.updatePreview());
    this.updatePreview();
  }

  /** Hydrates once; later changes to the input never overwrite the user's edits. */
  ngOnInit(): void {
    const business = this.business();
    if (this.isEdit()) {
      this.form.controls.contact.controls.phone.removeValidators(Validators.required);
      this.form.controls.contact.controls.phone.updateValueAndValidity({ emitEvent: false });
      this.form.controls.location.controls.area.removeValidators(Validators.required);
      this.form.controls.location.controls.area.updateValueAndValidity({ emitEvent: false });
    }
    if (this.isEdit() && business) hydrateBusinessForm(this.form, business);
  }

  markPristine(): void {
    this.form.markAsPristine();
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  protected submit(): void {
    if (this.saveState() === 'saving') return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.showSummary.set(true);
      this.focusFirstInvalid();
      return;
    }
    this.showSummary.set(false);
    this.saved.emit(toCreateBusinessRequest(this.form, this.categories()));
  }

  private focusFirstInvalid(): void {
    const element = this.host.nativeElement;
    const target =
      element.querySelector<HTMLElement>('input.ng-invalid, select.ng-invalid, textarea.ng-invalid') ??
      element.querySelector<HTMLElement>('.summary');
    target?.focus();
  }

  private updatePreview(): void {
    const { basicInfo, contact, location } = this.form.getRawValue();
    const category = this.categories().find((item) => item.slug === basicInfo.category);
    const subcategory = category?.subcategories.find((item) => item.slug === basicInfo.subcategory);
    this.preview.set({
      name: basicInfo.name.trim(),
      category: [category?.name, subcategory?.name].filter(Boolean).join(' · '),
      area: [location.area.trim(), location.address.trim()].filter(Boolean).join(', '),
      phone: contact.phone.trim(),
    });
  }
}
