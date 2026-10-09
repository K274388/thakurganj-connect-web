export interface BusinessCardData {
  id: string | number;
  name: string;
  category: string;
  area?: string;
  imageUrl?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  subcategoryName?: string;
  shortDescription?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
