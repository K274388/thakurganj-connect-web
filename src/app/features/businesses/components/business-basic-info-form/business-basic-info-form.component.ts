import { Component, inject, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoryRepository } from '../../../categories/data/category.repository';
import { BusinessCategory } from '../../../categories/models/category.models';
import { findCategoryBySlug, getActiveCategories, getActiveSubcategories } from '../../../categories/utils/category.utils';
import { BUSINESS_FIELD_RULES } from '../business-form/business-form.config';
import { BusinessFormGroup } from '../business-form/business-form.factory';
import { FieldStateDirective } from '../business-form/field-state.directive';
import { FormFieldComponent } from '../business-form/form-field.component';

@Component({
  selector: 'app-business-basic-info-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, FieldStateDirective],
  styleUrl: '../business-form/business-form-section.scss',
  template: `
    <fieldset class="section" [formGroup]="group()">
      <legend><span class="num" aria-hidden="true">01</span><span class="title">Basic information</span></legend>
      <div class="grid">
        <app-form-field class="wide" label="Business name" controlId="bf-name" [required]="true"
          requiredMessage="Please enter a business name." [control]="group().controls.name">
          <input id="bf-name" class="tk-input" type="text" formControlName="name" placeholder="Your business name"
            autocomplete="organization" aria-required="true" appFieldState />
        </app-form-field>

        <app-form-field label="Category" controlId="bf-category" [required]="true"
          requiredMessage="Please choose a category." [control]="group().controls.category">
          <select id="bf-category" class="tk-select" formControlName="category" aria-required="true" appFieldState>
            <option value="">Select category</option>
            @for (category of activeCategories(); track category.id) {
              <option [value]="category.slug">{{ category.name }}</option>
            }
          </select>
        </app-form-field>

        <app-form-field label="Subcategory" controlId="bf-subcategory" [control]="group().controls.subcategory">
          <select id="bf-subcategory" class="tk-select" formControlName="subcategory" appFieldState>
            @if (subcategories().length === 0) {
              <option value="">Select a category first</option>
            } @else {
              <option value="">Select subcategory</option>
              @for (subcategory of subcategories(); track subcategory.id) {
                <option [value]="subcategory.slug">{{ subcategory.name }}</option>
              }
            }
          </select>
        </app-form-field>

        @if (showDetails()) {
          <app-form-field class="wide" label="Brief description" controlId="bf-description"
            [control]="group().controls.description">
            <textarea id="bf-description" class="tk-textarea" formControlName="description" rows="4"
              placeholder="Tell people what your business offers..." appFieldState></textarea>
          </app-form-field>
        }
      </div>
    </fieldset>
  `,
})
export class BusinessBasicInfoFormComponent {
  readonly group = input.required<BusinessFormGroup['controls']['basicInfo']>();
  /** Defaults to the shared category catalog. */
  readonly categories = input<BusinessCategory[] | undefined>(undefined);
  private readonly catalog = inject(CategoryRepository).categories;
  readonly showDetails = input(false);

  protected readonly maxName = BUSINESS_FIELD_RULES.name.maxLength;

  protected activeCategories(): BusinessCategory[] {
    return getActiveCategories(this.categories() ?? this.catalog());
  }

  protected subcategories() {
    const slug = this.group().controls.category.value;
    return getActiveSubcategories(findCategoryBySlug(this.activeCategories(), slug));
  }
}
