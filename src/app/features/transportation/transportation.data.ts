export type TransportMode = 'rail' | 'road' | 'air' | 'local';

export interface TransportCategory {
  key: TransportMode;
  icon: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  detail: string;
  image: string;
  links: { label: string; url: string }[];
}

export interface TransportPlace {
  name: string;
  category: TransportMode;
  type: string;
  address: string;
  description: string;
  destination: string;
  image: string;
}

export interface TransportRoute {
  destination: string;
  distance: string;
  duration: string;
  query: string;
}

export interface ReachItem {
  icon: string;
  tone: 'red' | 'blue' | 'mint' | 'yellow';
  title: string;
  text: string;
}

export function directionsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&origin=Thakurganj%2C+Bihar&destination=${encodeURIComponent(destination)}`;
}

export function mapSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const FULL_MAP_URL = 'https://www.openstreetmap.org/?mlat=26.426&mlon=88.131#map=10/26.45/88.20';
export const MAP_EMBED_URL =
  'https://www.openstreetmap.org/export/embed.html?bbox=87.90%2C26.00%2C88.50%2C26.80&layer=mapnik&marker=26.426%2C88.131';

export const TRANSPORT_CATEGORIES: TransportCategory[] = [
  {
    key: 'rail',
    icon: '🚆',
    title: 'Railways',
    shortTitle: 'Railways',
    subtitle: 'Stations & Trains',
    description: 'Thakurganj Railway Station (TKG) and nearby rail connectivity.',
    detail:
      'Thakurganj Railway Station (station code TKG) is on the Katihar – Siliguri railway corridor. For current train schedules, platform information and booking, use official railway services.',
    image: '/images/transport/rail.jpg',
    links: [
      { label: 'Indian Railways Enquiry', url: 'https://enquiry.indianrail.gov.in/' },
      { label: 'IRCTC', url: 'https://www.irctc.co.in/' },
    ],
  },
  {
    key: 'road',
    icon: '🚌',
    title: 'Road & Bus',
    shortTitle: 'Bus Station',
    subtitle: 'Bus stops & Routes',
    description: 'Bus stands, routes and road connections to nearby towns and cities.',
    detail:
      'Thakurganj is well connected by road to Kishanganj, Purnea, Siliguri and nearby towns. Confirm bus schedules and operators locally before travel.',
    image: '/images/transport/bus.jpg',
    links: [{ label: 'Directions to Kishanganj', url: directionsUrl('Kishanganj, Bihar') }],
  },
  {
    key: 'air',
    icon: '✈️',
    title: 'Airports',
    shortTitle: 'Airport',
    subtitle: 'Nearby Airports',
    description: 'Nearest commercial airports for air travel to Thakurganj.',
    detail:
      'Bagdogra Airport (IXB) is the nearest major commercial airport. Check airline websites for flights and maps for current road travel time.',
    image: '/images/transport/air.jpg',
    links: [{ label: 'Bagdogra Airport directions', url: directionsUrl('Bagdogra Airport') }],
  },
  {
    key: 'local',
    icon: '🚕',
    title: 'Local Travel',
    shortTitle: 'Local Travel',
    subtitle: 'Auto, Taxi & More',
    description: 'Auto-rickshaws, taxis and other local transportation options.',
    detail:
      'Auto-rickshaws, shared vehicles and taxis are available for local travel within Thakurganj. Confirm operators, availability and fares locally.',
    image: '/images/transport/local.jpg',
    links: [],
  },
];

export const REACH_GUIDE: ReachItem[] = [
  {
    icon: '🚆',
    tone: 'red',
    title: 'By Train',
    text: 'Thakurganj Railway Station (TKG) is on the Katihar – Siliguri railway corridor.',
  },
  {
    icon: '✈️',
    tone: 'blue',
    title: 'By Air',
    text: 'Bagdogra Airport (IXB) is the nearest major airport, approximately 42 km by road.',
  },
  {
    icon: '🚌',
    tone: 'mint',
    title: 'By Road',
    text: 'Well connected by road to Kishanganj, Purnea, Siliguri and nearby towns.',
  },
  {
    icon: '🚕',
    tone: 'yellow',
    title: 'Local Travel',
    text: 'Auto-rickshaws, shared vehicles and taxis are available for local travel within Thakurganj.',
  },
];

export const TRANSPORT_ROUTES: TransportRoute[] = [
  { destination: 'Bagdogra Airport (IXB)', distance: '~ 42 km', duration: '~ 1 to 1.5 hrs', query: 'Bagdogra Airport' },
  { destination: 'Kishanganj', distance: '~ 25 km', duration: '~ 45 mins', query: 'Kishanganj, Bihar' },
  { destination: 'Siliguri', distance: '~ 70 km', duration: '~ 2 to 2.5 hrs', query: 'Siliguri' },
  { destination: 'Purnea', distance: '~ 110 km', duration: '~ 3 to 3.5 hrs', query: 'Purnea, Bihar' },
  { destination: 'Katihar', distance: '~ 120 km', duration: '~ 3 to 3.5 hrs', query: 'Katihar, Bihar' },
];

export const TRANSPORT_PLACES: TransportPlace[] = [
  {
    name: 'Thakurganj Railway Station',
    category: 'rail',
    type: 'Railway Station',
    address: 'Thakurganj, Kishanganj, Bihar',
    description: 'Main railway station serving Thakurganj. On the Katihar – Siliguri railway corridor.',
    destination: 'Thakurganj Railway Station, Bihar',
    image: '/images/transport/rail.jpg',
  },
  {
    name: 'Thakurganj Bus Stand',
    category: 'road',
    type: 'Bus Station',
    address: 'Thakurganj, Kishanganj, Bihar',
    description: 'Main bus stand for local and intercity bus services.',
    destination: 'Thakurganj Bus Stand, Bihar',
    image: '/images/transport/bus.jpg',
  },
  {
    name: 'Bagdogra Airport',
    category: 'air',
    type: 'Airport (Nearby)',
    address: 'Bagdogra, West Bengal',
    description: 'Nearest major commercial airport for travellers to Thakurganj.',
    destination: 'Bagdogra Airport, West Bengal',
    image: '/images/transport/air.jpg',
  },
];
