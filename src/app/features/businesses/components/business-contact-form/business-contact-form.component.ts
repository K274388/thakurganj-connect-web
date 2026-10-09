import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BusinessFormGroup } from '../business-form/business-form.factory';
import { FieldStateDirective } from '../business-form/field-state.directive';
import { FormFieldComponent } from '../business-form/form-field.component';

@Component({
  selector: 'app-business-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, FieldStateDirective],
  styleUrl: '../business-form/business-form-section.scss',
  template: `
    <fieldset class="section" [formGroup]="group()">
      <legend><span class="num" aria-hidden="true">02</span><span class="title">Contact</span></legend>
      <div class="grid">
        <app-form-field label="Mobile / contact number" controlId="bf-phone" [required]="requiredFields()"
          requiredMessage="Please enter a contact number." [control]="group().controls.phone">
          <input id="bf-phone" class="tk-input" type="tel" formControlName="phone" autocomplete="tel"
            placeholder="10-digit mobile number" [attr.aria-required]="requiredFields()" appFieldState />
        </app-form-field>

        @if (showDetails()) {
          <div>
            <app-form-field label="WhatsApp" controlId="bf-whatsapp" [control]="group().controls.whatsapp">
              <input id="bf-whatsapp" class="tk-input" type="tel" formControlName="whatsapp" placeholder="WhatsApp number"
                [readOnly]="group().controls.whatsappSameAsPhone.value" appFieldState />
            </app-form-field>
            <label class="check" for="bf-whatsapp-same">
              <input id="bf-whatsapp-same" class="tk-check" type="checkbox" formControlName="whatsappSameAsPhone" />
              Same as phone
            </label>
          </div>
          <app-form-field label="Email" controlId="bf-email" [control]="group().controls.email">
            <input id="bf-email" class="tk-input" type="email" formControlName="email" autocomplete="email" placeholder="name@example.com" appFieldState />
          </app-form-field>
          <app-form-field label="Website" controlId="bf-website" [control]="group().controls.website">
            <input id="bf-website" class="tk-input" type="url" formControlName="website" autocomplete="url" placeholder="https://" appFieldState />
          </app-form-field>
        }
      </div>
    </fieldset>
  `,
})
export class BusinessContactFormComponent {
  readonly group = input.required<BusinessFormGroup['controls']['contact']>();
  readonly showDetails = input(false);
  readonly requiredFields = input(true);
}
