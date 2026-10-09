import { CategoryInfo } from '../models/category-info.models';

// Content is intentionally limited to verifiable facts. Distances, timings and phone
// numbers are omitted until confirmed; add them with a `lastVerified` date.
export const CATEGORY_INFO: CategoryInfo[] = [
  {
    slug: 'transportation',
    title: 'Getting to and around Thakurganj',
    subtitle: 'Rail, road, air and local travel',
    description:
      'Thakurganj is reachable by rail and road, with larger airports and railway junctions in nearby cities. Use the official links below to confirm schedules before you travel.',
    cards: [
      { id: 'railway', title: 'Railway', description: 'Thakurganj Railway Station (TKG) and connecting trains.', icon: '🚆' },
      { id: 'road-bus', title: 'Road & Bus', description: 'State and private bus services along regional roads.', icon: '🚌' },
      { id: 'airports', title: 'Airports', description: 'Bagdogra Airport (IXB) is the nearest major airport used by travellers.', icon: '✈️' },
      { id: 'local', title: 'Local Transportation', description: 'Auto-rickshaws, e-rickshaws and taxis for local trips.', icon: '🛺' },
    ],
    sections: [
      {
        id: 'railway',
        title: 'Railway',
        description: 'Thakurganj Railway Station is the local railhead. Check train timings and live status before travelling.',
        details: [{ label: 'Station', value: 'Thakurganj (TKG)' }],
        links: [
          { label: 'IRCTC ticket booking', url: 'https://www.irctc.co.in/' },
          { label: 'National Train Enquiry System', url: 'https://enquiry.indianrail.gov.in/' },
        ],
        directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Thakurganj+Railway+Station',
      },
      {
        id: 'road-bus',
        title: 'Road & Bus',
        description: 'Bus services connect Thakurganj with nearby towns. Confirm routes and timings with the operator or at the local bus stand.',
        links: [{ label: 'Bihar State Road Transport Corporation', url: 'https://www.bsrtc.co.in/' }],
      },
      {
        id: 'airports',
        title: 'Airports',
        description: 'Bagdogra Airport near Siliguri is the commonly used airport for the region. Arrange onward road or rail travel in advance.',
        details: [{ label: 'Airport', value: 'Bagdogra Airport (IXB)' }],
        links: [{ label: 'Airports Authority of India', url: 'https://www.aai.aero/' }],
        directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Bagdogra+Airport',
      },
      {
        id: 'local',
        title: 'Local Transportation',
        description: 'Auto-rickshaws, e-rickshaws and taxis are available for local travel. Agree on the fare before starting your trip.',
      },
    ],
  },
  {
    slug: 'hospitals',
    title: 'Healthcare in Thakurganj',
    subtitle: 'Hospitals, clinics and emergency help',
    description: 'Find hospitals and health services listed below. In an emergency, call the national emergency number 112.',
    cards: [
      { id: 'hospitals', title: 'Hospitals', description: 'Government and private hospitals.', icon: '🏥' },
      { id: 'emergency', title: 'Emergency', description: 'Dial 112 for emergency assistance.', icon: '🚑' },
    ],
    sections: [
      {
        id: 'emergency',
        title: 'Emergency help',
        description: 'India\'s unified emergency number is 112. Ambulance service is available on 108 in most states.',
        details: [{ label: 'Emergency', value: '112' }],
      },
    ],
  },
  {
    slug: 'schools',
    title: 'Education in Thakurganj',
    subtitle: 'Schools and learning',
    description: 'Browse schools and educational institutions around Thakurganj.',
    cards: [
      { id: 'schools', title: 'Schools', description: 'Primary and secondary schools.', icon: '🏫' },
      { id: 'admissions', title: 'Admissions', description: 'Contact institutions directly for admission details.', icon: '📝' },
    ],
    sections: [],
  },
  {
    slug: 'religious',
    title: 'Religious places',
    subtitle: 'Temples, mosques and other places of worship',
    description: 'Places of worship and spiritual significance in and around Thakurganj.',
    cards: [
      { id: 'worship', title: 'Places of worship', description: 'Temples, mosques and other sites.', icon: '🛕' },
      { id: 'etiquette', title: 'Visiting respectfully', description: 'Dress modestly and follow local customs.', icon: '🙏' },
    ],
    sections: [],
  },
  {
    slug: 'markets',
    title: 'Markets in Thakurganj',
    subtitle: 'Local shopping and trade',
    description: 'Local markets for everyday shopping, produce and goods.',
    cards: [
      { id: 'markets', title: 'Local markets', description: 'Daily and weekly markets.', icon: '🛒' },
      { id: 'produce', title: 'Fresh produce', description: 'Seasonal vegetables, fruits and local goods.', icon: '🥬' },
    ],
    sections: [],
  },
  {
    slug: 'landmarks',
    title: 'Landmarks',
    subtitle: 'Notable places to see',
    description: 'Notable landmarks and points of interest around Thakurganj.',
    cards: [
      { id: 'landmarks', title: 'Points of interest', description: 'Well-known sites around town.', icon: '📍' },
    ],
    sections: [],
  },
];
