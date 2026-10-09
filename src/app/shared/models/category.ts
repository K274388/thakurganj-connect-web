export type CategoryColorVariant = 'black' | 'yellow' | 'light-yellow' | 'magenta' | 'light-gray';

export interface Category {
  id: string | number;
  slug?: string;
  name: string;
  description?: string;
  icon?: string;
  colorVariant?: CategoryColorVariant;
  businessCount?: number;
}
