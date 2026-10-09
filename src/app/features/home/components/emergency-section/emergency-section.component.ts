import { Component, input } from '@angular/core';
import { EmergencyCardComponent, EmergencyContact } from '../../../../shared/components/emergency-card/emergency-card.component';

@Component({
  selector: 'app-home-emergency-section',
  standalone: true,
  imports: [EmergencyCardComponent],
  template: '<tk-emergency-card variant="dark" [title]="title()" [contacts]="contacts()" viewAllLink="/emergency" />',
  styles: `:host { display: block; }`,
})
export class EmergencySectionComponent {
  readonly title = input('Emergency');
  readonly contacts = input.required<EmergencyContact[]>();
}
