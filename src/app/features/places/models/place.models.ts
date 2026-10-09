import { PlaceCardData } from '../../../shared/models/place-card-data';

export interface Place extends PlaceCardData {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  shortDescription: string;
  description: string;
  address: string;
  area: string;
  landmark: string;
  pinCode: string;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  images: string[];
  featured: boolean;
  active: boolean;
  displayOrder: number;
}
