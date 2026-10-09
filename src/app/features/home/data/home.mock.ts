import { EmergencyContact } from '../../../shared/components/emergency-card/emergency-card.component';
import { HomeEvent, HomeStatistics } from '../models/home.models';

export const HOME_STATISTICS: HomeStatistics = {
  businessCount: 245,
  placeCount: 54,
};

export const HOME_HERO_IMAGE_URL: string | undefined = undefined;

export const HOME_EVENTS: HomeEvent[] = [
  {
    id: 1,
    title: 'Community event',
    date: '2026-10-15',
    venue: 'Club Field',
  },
  {
    id: 2,
    title: 'Cultural program',
    date: '2026-10-20',
    venue: 'Venue placeholder',
  },
];

export const HOME_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: 'Police', phone: 'Coming soon' },
  { name: 'Ambulance', phone: 'Coming soon' },
  { name: 'Fire', phone: 'Coming soon' },
];
