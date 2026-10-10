import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  /** The current owner's listings, including inactive ones. */
  protected readonly businesses = inject(BusinessRepository).ownerBusinesses();

  constructor() {
    markPageAsPrivate();
  }
}
