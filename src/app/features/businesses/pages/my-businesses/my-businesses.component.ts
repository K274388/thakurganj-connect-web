import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockCurrentUserService } from '../../../../core/auth/mock-current-user';
import { markPageAsPrivate } from '../../../../core/seo/private-page';
import { ImagePlaceholderComponent } from '../../../../shared/components/image-placeholder/image-placeholder.component';
import { BusinessRepository } from '../../data/business.repository';

@Component({
  selector: 'app-my-businesses',
  standalone: true,
  imports: [RouterLink, ImagePlaceholderComponent],
  templateUrl: './my-businesses.component.html',
  styleUrl: './my-businesses.component.scss',
})
export class MyBusinessesComponent {
  private readonly repository = inject(BusinessRepository);
  private readonly currentUser = inject(MockCurrentUserService);

  protected readonly businesses = computed(() =>
    this.repository.businesses().filter((business) => business.ownerId === this.currentUser.user().id),
  );

  constructor() {
    markPageAsPrivate();
  }
}
