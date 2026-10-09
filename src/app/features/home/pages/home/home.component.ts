import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBedDouble,
  LucideBuilding,
  LucideCamera,
  LucideCarFront,
  LucideDynamicIcon,
  LucideGraduationCap,
  LucideHeart,
  LucideHeartPulse,
  LucideHouse,
  LucideMapPin,
  LucidePlus,
  LucideSearch,
  LucideShoppingCart,
  LucideStore,
  LucideTrainFront,
  LucideUsers,
  LucideUsersRound,
  LucideUtensils,
  LucideWrench,
} from '@lucide/angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    LucideDynamicIcon,
    LucideArrowRight,
    LucideBuilding,
    LucideCamera,
    LucideMapPin,
    LucidePlus,
    LucideSearch,
    LucideUsers,
    LucideUsersRound,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly quickLinks = [
    { label: 'Businesses', text: 'Find local shops<br>and services', icon: LucideStore, color: 'pink', path: '/businesses', query: {} },
    { label: 'Places', text: 'Explore landmarks<br>and attractions', icon: LucideMapPin, color: 'blue', path: '/places', query: {} },
    { label: 'Food & Restaurants', text: 'Discover local food', icon: LucideUtensils, color: 'orange', path: '/businesses', query: { category: 'food-restaurants' } },
   // { label: 'Hotels & Stay', text: 'Find comfortable stay', icon: LucideBedDouble, color: 'green', path: '/businesses', query: { search: 'hotel' } },
    { label: 'Healthcare', text: 'Hospitals & clinics', icon: LucideHeartPulse, color: 'red', path: '/businesses', query: { category: 'health' } },
    { label: 'Education', text: 'Schools & colleges', icon: LucideGraduationCap, color: 'purple', path: '/businesses', query: { category: 'education' } },
    { label: 'Transport', text: 'Rail, bus & more', icon: LucideTrainFront, color: 'sky', path: '/transportation', query: {} },
    { label: 'Community', text: 'People, events & more', icon: LucideUsers, color: 'teal', path: '/events', query: {} },
  ];

  protected readonly gallery = [
    { src: 'images/tea.webp', alt: 'Illustrative green tea garden', caption: 'Tea Gardens' },
    { src: 'images/market.webp', alt: 'Illustrative town market', caption: 'Local Market' },
    { src: 'images/landscape.webp', alt: 'Illustrative local river landscape', caption: 'Local Landscape' },
    { src: 'images/sunset.webp', alt: 'Illustrative countryside sunset', caption: 'Natural Beauty' },
  ];

  protected readonly categories = [
    { label: 'Shops & Retail', icon: LucideShoppingCart, path: '/businesses', query: { category: 'shopping' } },
    { label: 'Food & Restaurants', icon: LucideUtensils, path: '/businesses', query: { category: 'food-restaurants' } },
    //{ label: 'Hotels & Stay', icon: LucideBedDouble, path: '/businesses', query: { search: 'hotel' } },
    { label: 'Healthcare', icon: LucideHeart, path: '/businesses', query: { category: 'health' } },
    { label: 'Education', icon: LucideGraduationCap, path: '/businesses', query: { category: 'education' } },
    { label: 'Automotive', icon: LucideCarFront, path: '/businesses', query: { category: 'automobile' } },
    { label: 'Services', icon: LucideWrench, path: '/businesses', query: { category: 'services' } },
    //{ label: 'Real Estate', icon: LucideHouse, path: '/businesses', query: { category: 'home-services' } },
  ];

  protected readonly places = [
    { name: 'Thakurganj Railway Station', type: 'Transport', src: 'images/station.webp', alt: 'Illustration of railway station', path: '/places/thakurganj-junction', query: {} },
    { name: 'Tea Gardens', type: 'Natural Attraction', src: 'images/tea.webp', alt: 'Illustrative tea garden', path: '/places', query: {} },
    { name: 'Local Market', type: 'Shopping', src: 'images/market.webp', alt: 'Illustrative market', path: '/places', query: { category: 'markets' } },
    { name: 'Rivers & Nature', type: 'Nature', src: 'images/river.webp', alt: 'Illustrative river', path: '/places', query: { category: 'parks' } },
    { name: 'Nearby Attractions', type: 'Tourism', src: 'images/sunset.webp', alt: 'Illustrative countryside', path: '/places', query: {} },
  ];
}
