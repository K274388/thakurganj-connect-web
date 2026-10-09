import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BusinessFormGroup } from '../business-form/business-form.factory';
import { FieldStateDirective } from '../business-form/field-state.directive';
import { FormFieldComponent } from '../business-form/form-field.component';

@Component({
  selector: 'app-business-location-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, FieldStateDirective],
  styleUrl: '../business-form/business-form-section.scss',
  template: `
    <fieldset class="section" [formGroup]="group()">
      <legend><span class="num" aria-hidden="true">03</span><span class="title">Location</span></legend>
      <div class="grid">
        <app-form-field label="Area / locality" controlId="bf-area" [required]="requiredFields()"
          requiredMessage="Please enter an area or locality." [control]="group().controls.area">
          <input id="bf-area" class="tk-input" type="text" formControlName="area" placeholder="e.g. Main Market"
            [attr.aria-required]="requiredFields()" appFieldState />
        </app-form-field>
        @if (showDetails()) {
          <app-form-field class="wide" label="Nearby landmark or short address" controlId="bf-address" [control]="group().controls.address">
            <input id="bf-address" class="tk-input" type="text" formControlName="address" autocomplete="street-address" placeholder="e.g. Near railway station, main road" appFieldState />
          </app-form-field>
          <app-form-field label="Landmark" controlId="bf-landmark" [control]="group().controls.landmark">
            <input id="bf-landmark" class="tk-input" type="text" formControlName="landmark" placeholder="Nearby landmark" appFieldState />
          </app-form-field>
          <app-form-field label="PIN code" controlId="bf-pin" [control]="group().controls.pinCode">
            <input id="bf-pin" class="tk-input" type="text" inputmode="numeric" formControlName="pinCode" autocomplete="postal-code" placeholder="PIN code" appFieldState />
          </app-form-field>
        }
      </div>

      @if (showDetails()) {
        <details [attr.open]="hasCoordinateError() ? '' : null">
          <summary>Exact map location (optional)</summary>
          <p class="note">Pin your exact location. Map location selection will be available later; for now you can enter coordinates.</p>
          <div class="grid">
            <app-form-field label="Latitude" controlId="bf-latitude" [control]="group().controls.latitude">
              <input id="bf-latitude" class="tk-input" type="number" step="any" formControlName="latitude" placeholder="e.g. 26.1" appFieldState />
            </app-form-field>
            <app-form-field label="Longitude" controlId="bf-longitude" [control]="group().controls.longitude">
              <input id="bf-longitude" class="tk-input" type="number" step="any" formControlName="longitude" placeholder="e.g. 87.9" appFieldState />
            </app-form-field>
          </div>
        </details>
      }
    </fieldset>
  `,
})
export class BusinessLocationFormComponent {
  readonly group = input.required<BusinessFormGroup['controls']['location']>();
  readonly showDetails = input(false);
  readonly requiredFields = input(true);

  protected hasCoordinateError(): boolean {
    const { latitude, longitude } = this.group().controls;
    return (latitude.invalid && latitude.touched) || (longitude.invalid && longitude.touched);
  }
}
