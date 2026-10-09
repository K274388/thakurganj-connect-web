import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/** Exposes validation state to assistive technology (aria-invalid + link to the inline error). */
@Directive({
  selector: '[appFieldState]',
  standalone: true,
  host: {
    '[attr.aria-invalid]': 'invalid ? "true" : null',
    '[attr.aria-describedby]': 'invalid ? id + "-error" : null',
  },
})
export class FieldStateDirective {
  private readonly ngControl = inject(NgControl, { self: true });
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  protected get invalid(): boolean {
    const control = this.ngControl.control;
    return !!control && control.touched && control.invalid;
  }

  protected get id(): string {
    return this.element.nativeElement.id;
  }
}
