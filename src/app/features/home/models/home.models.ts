import { Category, CategoryColorVariant } from '../../../shared/models/category';
import { EventCardData } from '../../../shared/models/event-card-data';

export type HomeCategory = Category & { colorVariant: CategoryColorVariant };
export type HomeEvent = EventCardData;

export interface HomeStatistics {
  businessCount: number;
  placeCount: number;
}
