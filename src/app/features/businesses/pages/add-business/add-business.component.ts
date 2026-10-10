import { Component, DestroyRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { markPageAsPrivate } from '../../../../core/seo/private-page';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { BusinessFormComponent, BusinessSaveState } from '../../components/business-form/business-form.component';
import { BUSINESS_SUCCESS_MESSAGE } from '../../components/business-form/business-form.config';
import { BusinessRepository } from '../../data/business.repository';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';
import { Business, CreateBusinessRequest } from '../../models/business.models';

@Component({
  selector: 'app-add-business',
  standalone: true,
  imports: [RouterLink, ModalComponent, BusinessFormComponent],
  templateUrl: './add-business.component.html',
  styleUrl: './add-business.component.scss',
})
export class AddBusinessComponent implements HasUnsavedChanges {
  private readonly repository = inject(BusinessRepository);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly form = viewChild(BusinessFormComponent);
  private resolveLeave: ((canLeave: boolean) => void) | null = null;

  protected readonly successMessage = BUSINESS_SUCCESS_MESSAGE;
  readonly saveState = signal<BusinessSaveState>('idle');
  readonly created = signal<Business | null>(null);
  readonly confirmOpen = signal(false);

  constructor() {
    markPageAsPrivate();
  }

  @HostListener('window:beforeunload', ['$event'])
  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.form()?.isDirty()) event.preventDefault();
  }

  canDeactivate(): boolean | Promise<boolean> {
    if (!this.form()?.isDirty()) return true;
    this.confirmOpen.set(true);
    return new Promise<boolean>((resolve) => (this.resolveLeave = resolve));
  }

  protected save(request: CreateBusinessRequest): void {
    if (this.saveState() === 'saving') return;
    this.saveState.set('saving');
    this.repository
      .createBusiness(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (business) => {
          this.created.set(business);
          this.saveState.set('success');
        },
        error: () => this.saveState.set('error'),
      });
  }

  protected cancel(): void {
    void this.router.navigate(['/my/businesses']);
  }

  protected addAnother(): void {
    this.created.set(null);
    this.saveState.set('idle');
  }

  protected keepEditing(): void {
    this.settle(false);
  }

  protected discard(): void {
    this.settle(true);
  }

  private settle(canLeave: boolean): void {
    this.confirmOpen.set(false);
    this.resolveLeave?.(canLeave);
    this.resolveLeave = null;
  }
}
