import { PlaceCategory } from '../models/place-category.models';

export const PLACE_CATEGORIES: PlaceCategory[] = [
  { id: 'place-category-landmarks', slug: 'landmarks', name: 'Landmarks', icon: '★', displayOrder: 1, active: true },
  { id: 'place-category-religious', slug: 'religious', name: 'Religious Places', icon: '✦', displayOrder: 2, active: true },
  { id: 'place-category-markets', slug: 'markets', name: 'Markets', icon: '▤', displayOrder: 3, active: true },
  { id: 'place-category-transportation', slug: 'transportation', name: 'Transportation', icon: '↗', displayOrder: 4, active: true },
  { id: 'place-category-hospitals', slug: 'hospitals', name: 'Hospitals', icon: '+', displayOrder: 5, active: true },
  { id: 'place-category-schools', slug: 'schools', name: 'Schools', icon: '✎', displayOrder: 6, active: true },
  { id: 'place-category-parks', slug: 'parks', name: 'Parks', icon: '❋', displayOrder: 7, active: true },
  { id: 'place-category-sports', slug: 'sports', name: 'Sports', icon: '◉', displayOrder: 8, active: true },
  { id: 'place-category-other', slug: 'other', name: 'Other', icon: '•', displayOrder: 9, active: true },
];
