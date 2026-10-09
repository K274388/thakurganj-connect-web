import { Component, HostListener, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { MockCurrentUserService } from '../../../../core/auth/mock-current-user';
import { markPageAsPrivate } from '../../../../core/seo/private-page';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { BusinessFormComponent, BusinessSaveState } from '../../components/business-form/business-form.component';
import { BUSINESS_UPDATE_SUCCESS_MESSAGE } from '../../components/business-form/business-form.config';
import { BusinessRepository } from '../../data/business.repository';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';
import { UpdateBusinessRequest } from '../../models/business.models';

/** Container: routing, ownership check and persistence. The form itself is the shared BusinessForm. */
@Component({
  selector: 'app-edit-business',
  standalone: true,
  imports: [RouterLink, ModalComponent, BusinessFormComponent],
  templateUrl: './edit-business.component.html',
  styleUrl: './edit-business.component.scss',
})
export class EditBusinessComponent implements HasUnsavedChanges {
  private readonly repository = inject(BusinessRepository);
  private readonly currentUser = inject(MockCurrentUserService);
  private readonly router = inject(Router);
  private readonly form = viewChild(BusinessFormComponent);
  private resolveLeave: ((canLeave: boolean) => void) | null = null;

  private readonly id = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  });

  protected readonly successMessage = BUSINESS_UPDATE_SUCCESS_MESSAGE;
  readonly saveState = signal<BusinessSaveState>('idle');
  readonly confirmOpen = signal(false);

  readonly business = computed(() => this.repository.businesses().find((item) => String(item.id) === this.id()));
  /** The edit form is only ever rendered in the 'ready' state. */
  readonly access = computed<'not-found' | 'forbidden' | 'ready'>(() => {
    const business = this.business();
    if (!business) return 'not-found';
    return business.ownerId === this.currentUser.user().id ? 'ready' : 'forbidden';
  });

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

  protected save(request: UpdateBusinessRequest): void {
    const business = this.business();
    if (this.saveState() === 'saving' || !business || this.access() !== 'ready') return;
    this.saveState.set('saving');
    try {
      this.repository.updateBusiness(business.id, this.currentUser.user().id, request);
      this.form()?.markPristine();
      this.saveState.set('success');
    } catch {
      this.saveState.set('error');
    }
  }

  protected cancel(): void {
    void this.router.navigate(['/my/businesses']);
  }

  protected continueEditing(): void {
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
