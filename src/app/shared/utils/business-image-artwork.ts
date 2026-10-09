export interface BusinessImageArtwork {
  icon: string;
  label: string;
}

const SUBCATEGORY_ARTWORK: Record<string, string> = {
  restaurant: '🍽️',
  dhaba: '🍛',
  bakery: '🧁',
  sweets: '🍬',
  teashop: '☕',
  fastfood: '🍔',
  clothing: '👕',
  grocery: '🛒',
  electronics: '🔌',
  mobile: '📱',
  furniture: '🪑',
  shoes: '👟',
  pharmacy: '💊',
  doctor: '🩺',
  clinic: '🩺',
  diagnostic: '🧪',
  dental: '🦷',
  electrician: '⚡',
  plumber: '🔧',
  mechanic: '🛠️',
  tailor: '🧵',
  carpenter: '🪚',
  computerservice: '💻',
  school: '🏫',
  coaching: '📚',
  college: '🎓',
  computerinstitute: '💻',
  carrepair: '🚗',
  bikerepair: '🏍️',
  tyre: '🛞',
  spareparts: '⚙️',
  cleaning: '🧹',
  painting: '🖌️',
  pestcontrol: '🐜',
  appliancerepair: '🔌',
  bank: '🏦',
  insurance: '🛡️',
  taxservice: '🧾',
  financialservice: '💹',
};

const CATEGORY_ARTWORK: Record<string, string> = {
  foodrestaurants: '🍽️',
  shopping: '🛍️',
  health: '🩺',
  services: '🛠️',
  education: '📚',
  automobile: '🚗',
  homeservices: '🏠',
  finance: '🏦',
};

function normalize(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getBusinessImageArtwork(
  category: string,
  subcategory = '',
): BusinessImageArtwork | null {
  const normalizedCategory = normalize(category);
  const normalizedSubcategory = normalize(subcategory);
  const icon = SUBCATEGORY_ARTWORK[normalizedSubcategory] ?? CATEGORY_ARTWORK[normalizedCategory];

  if (!icon) return null;
  return { icon, label: subcategory || category };
}
