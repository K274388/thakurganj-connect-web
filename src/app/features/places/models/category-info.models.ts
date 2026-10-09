export interface CategoryInfoCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface CategoryInfoLink {
  label: string;
  url: string;
}

export interface CategoryInfoDetail {
  label: string;
  value: string;
}

export interface CategoryInfoSection {
  id: string;
  title: string;
  description: string;
  image?: string;
  details?: CategoryInfoDetail[];
  links?: CategoryInfoLink[];
  directionsUrl?: string;
  lastVerified?: string;
}

export interface CategoryInfo {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage?: string;
  cards: CategoryInfoCard[];
  sections: CategoryInfoSection[];
}
