import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BUSINESS_FIELD_RULES } from '../business-form/business-form.config';
import { BusinessFormGroup } from '../business-form/business-form.factory';
import { FieldStateDirective } from '../business-form/field-state.directive';
import { FormFieldComponent } from '../business-form/form-field.component';

@Component({
  selector: 'app-business-services-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, FieldStateDirective],
  styleUrl: '../business-form/business-form-section.scss',
  template: `
    <fieldset class="section" [formGroup]="group()">
      <legend><span class="num" aria-hidden="true">04</span><span class="title">Products &amp; services</span></legend>
      <div class="add-row">
        <app-form-field label="Add a product or service" controlId="bf-service" [control]="group().controls.draft">
          <input id="bf-service" class="tk-input" type="text" formControlName="draft" placeholder="e.g. Tea"
            (keydown.enter)="onEnter($event)" appFieldState />
        </app-form-field>
        <button type="button" class="tk-button tk-button-dark" (click)="add()">Add</button>
      </div>
      @if (message()) {
        <p class="error-text" role="status">{{ message() }}</p>
      }
      @if (group().controls.items.length) {
        <ul class="chips" aria-label="Added products and services">
          @for (item of group().controls.items.controls; track item; let index = $index) {
            <li class="chip">
              {{ item.value }}
              <button type="button" [attr.aria-label]="'Remove ' + item.value" (click)="remove(index)"><span aria-hidden="true">×</span></button>
            </li>
          }
        </ul>
      }
    </fieldset>
  `,
})
export class BusinessServicesFormComponent {
  readonly group = input.required<BusinessFormGroup['controls']['services']>();
  protected readonly message = signal('');

  protected onEnter(event: Event): void {
    event.preventDefault();
    this.add();
  }

  protected add(): void {
    const { draft, items } = this.group().controls;
    const value = draft.value.trim();
    this.message.set('');
    if (!value) {
      draft.setValue('');
      return;
    }
    if (draft.invalid) return;
    if (items.value.includes(value)) {
      this.message.set(`"${value}" has already been added.`);
      return;
    }
    if (items.length >= BUSINESS_FIELD_RULES.service.maxItems) {
      this.message.set(`You can add up to ${BUSINESS_FIELD_RULES.service.maxItems} items.`);
      return;
    }
    items.push(new FormControl(value, { nonNullable: true }));
    items.markAsDirty();
    draft.setValue('');
  }

  protected remove(index: number): void {
    const { items } = this.group().controls;
    items.removeAt(index);
    items.markAsDirty();
    this.message.set('');
  }
}
