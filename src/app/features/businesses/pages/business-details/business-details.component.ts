import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { Observable, Subject, catchError, map, merge, of, switchMap } from 'rxjs';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { BusinessCtaComponent } from '../../../home/components/business-cta/business-cta.component';
import { BusinessContactComponent } from '../../components/business-contact/business-contact.component';
import { BusinessHoursComponent } from '../../components/business-hours/business-hours.component';
import { BusinessRepository } from '../../data/business.repository';
import { Business } from '../../models/business.models';
import { directionsLink, phoneDigits, whatsappLink } from '../../utils/business-links';

export type BusinessDetailsState =
  | { status: 'loading' }
  | { status: 'success'; business: Business }
  | { status: 'notFound' }
  | { status: 'inactive' }
  | { status: 'error' };

const FALLBACK_DESCRIPTION =
  'Find contact details, hours and location for local businesses in Thakurganj.';

@Component({
  selector: 'app-business-details',
  standalone: true,
  imports: [
    RouterLink,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingComponent,
    BusinessCtaComponent,
    BusinessContactComponent,
    BusinessHoursComponent,
  ],
  templateUrl: './business-details.component.html',
  styleUrl: './business-details.component.scss',
})
export class BusinessDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly repository = inject(BusinessRepository);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  /** Retries re-request the current id; switchMap cancels a request that is still in flight. */
  private readonly retries = new Subject<string>();

  protected readonly state = signal<BusinessDetailsState>({ status: 'loading' });
  protected readonly reportNotice = signal(false);
  protected readonly business = computed(() => {
    const state = this.state();
    return state.status === 'success' ? state.business : null;
  });

  protected readonly callHref = computed(() => {
    const phone = phoneDigits(this.business()?.phone);
    return phone ? `tel:${phone}` : '';
  });
  protected readonly whatsappHref = computed(() => {
    const business = this.business();
    return business ? whatsappLink(business.whatsapp, business.name) : '';
  });
  protected readonly directionsHref = computed(() => {
    const business = this.business();
    return business ? directionsLink(business) : '';
  });
  protected readonly hasContact = computed(() => {
    const business = this.business();
    return (
      !!business && !!(business.phone || business.whatsapp || business.email || business.website)
    );
  });
  protected readonly hasHours = computed(() => !!this.business()?.hours?.length);
  protected readonly hasLocation = computed(() => {
    const business = this.business();
    return (
      !!business && !!(business.address || business.area || business.landmark || business.pinCode)
    );
  });
  protected readonly locationSummary = computed(() =>
    [this.business()?.area, this.business()?.landmark].filter(Boolean).join(' · '),
  );

  constructor() {
    merge(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), this.retries)
      .pipe(
        switchMap((id) => this.fetch(id)),
        takeUntilDestroyed(),
      )
      .subscribe((result) => this.apply(result));
  }

  private fetch(id: string): Observable<Business | undefined | 'error'> {
    return this.repository.loadBusiness(id).pipe(catchError(() => of('error' as const)));
  }

  private apply(business: Business | undefined | 'error'): void {
    if (business === 'error') {
      this.state.set({ status: 'error' });
    } else if (!business) {
      this.state.set({ status: 'notFound' });
      this.updateSeo('Business not found', '');
    } else if (business.status !== 'ACTIVE') {
      this.state.set({ status: 'inactive' });
      this.updateSeo('Business unavailable', '');
    } else {
      this.state.set({ status: 'success', business });
      this.updateSeo(business.name, business.shortDescription);
    }
  }

  protected retry(): void {
    this.state.set({ status: 'loading' });
    this.retries.next(this.route.snapshot.paramMap.get('id') ?? '');
  }

  protected goToDirectory(): void {
    void this.router.navigate(['/businesses']);
  }

  private updateSeo(name: string, description: string): void {
    this.title.setTitle(`${name} | Thakurganj Connect`);
    this.meta.updateTag({ name: 'description', content: description || FALLBACK_DESCRIPTION });
  }
}
