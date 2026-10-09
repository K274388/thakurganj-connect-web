import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CategoryInfo } from '../../models/category-info.models';

@Component({
  selector: 'app-category-overview',
  standalone: true,
  templateUrl: './category-overview.component.html',
  styleUrl: './category-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryOverviewComponent {
  readonly info = input.required<CategoryInfo>();
}
