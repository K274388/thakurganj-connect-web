import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BUSINESS_DAYS, BusinessFormGroup } from '../business-form/business-form.factory';
import { businessErrorMessage } from '../business-form/business-form.validators';
import { FieldStateDirective } from '../business-form/field-state.directive';

@Component({
  selector: 'app-business-hours-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  styleUrl: '../business-form/business-form-section.scss',
  template: `
    <fieldset class="section">
      <legend><span class="num" aria-hidden="true">05</span><span class="title">Business hours</span></legend>
      <p class="note">Hours are optional. Leave a day empty if you prefer not to share it.</p>
      <ul class="hours-list">
        @for (row of hours().controls; track row.controls.day.value; let index = $index) {
          <li class="hours-row" [formGroup]="row">
            <span class="day">{{ labels[index] }}</span>
            <input class="tk-input" type="time" formControlName="openTime" [attr.aria-label]="labels[index] + ' opening time'" />
            <span class="to" aria-hidden="true">to</span>
            <input class="tk-input" type="time" formControlName="closeTime" [attr.aria-label]="labels[index] + ' closing time'" />
            <label class="check">
              <input class="tk-check" type="checkbox" formControlName="closed" />
              Closed<span class="visually-hidden"> on {{ labels[index] }}</span>
            </label>
            @if (row.invalid && row.touched) {
              <p class="hours-error" role="alert">{{ errorFor(row.errors) }}</p>
            }
          </li>
        }
      </ul>
      <div class="hours-actions">
        <button type="button" class="tk-button tk-button-outline" (click)="applyMondayToWeekdays()">
          Apply Monday hours to all weekdays
        </button>
      </div>
    </fieldset>
  `,
  styles: `.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }`,
})
export class BusinessHoursFormComponent {
  readonly hours = input.required<BusinessFormGroup['controls']['hours']>();
  protected readonly labels = BUSINESS_DAYS.map((item) => item.label);

  protected errorFor(errors: Parameters<typeof businessErrorMessage>[1]): string {
    return businessErrorMessage('Hours', errors);
  }

  protected applyMondayToWeekdays(): void {
    const monday = this.hours().at(0).getRawValue();
    for (let index = 1; index <= 4; index++) {
      const row = this.hours().at(index);
      row.controls.closed.setValue(monday.closed);
      row.controls.openTime.setValue(monday.openTime);
      row.controls.closeTime.setValue(monday.closeTime);
      row.markAsDirty();
    }
  }
}
