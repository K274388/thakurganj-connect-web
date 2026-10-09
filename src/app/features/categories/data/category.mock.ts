import { BusinessCategory, BusinessSubcategory, CategoryVisualVariant } from '../models/category.models';

/** Builds subcategories for mock data; ids are unique across categories (categoryId * 100 + order). */
function subcategories(categoryId: number, items: [slug: string, name: string][]): BusinessSubcategory[] {
  return items.map(([slug, name], index) => ({
    id: categoryId * 100 + index + 1,
    slug,
    categoryId,
    name,
    displayOrder: index + 1,
    active: true,
  }));
}

function category(
  id: number,
  slug: string,
  name: string,
  description: string,
  icon: string,
  visualVariant: CategoryVisualVariant,
  items: [string, string][],
): BusinessCategory {
  return {
    id,
    slug,
    name,
    description,
    icon,
    visualVariant,
    displayOrder: id,
    active: true,
    subcategories: subcategories(id, items),
  };
}

/** Single mock source of truth for categories. Replace with a CategoryService when the API exists. */
export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  category(1, 'food-restaurants', 'Food & Restaurants', 'Restaurants, food shops and local places to eat.', 'utensils', 'dark', [
    ['restaurant', 'Restaurant'],
    ['dhaba', 'Dhaba'],
    ['bakery', 'Bakery'],
    ['sweets', 'Sweets'],
    ['tea-shop', 'Tea Shop'],
    ['fast-food', 'Fast Food'],
  ]),
  category(2, 'shopping', 'Shopping', 'Clothing, groceries, electronics and everyday shops.', 'shopping', 'cream', [
    ['clothing', 'Clothing'],
    ['grocery', 'Grocery'],
    ['electronics', 'Electronics'],
    ['mobile', 'Mobile'],
    ['furniture', 'Furniture'],
    ['shoes', 'Shoes'],
  ]),
  category(3, 'health', 'Health', 'Pharmacies, doctors, clinics and diagnostic services.', 'health', 'magenta', [
    ['pharmacy', 'Pharmacy'],
    ['doctor', 'Doctor'],
    ['clinic', 'Clinic'],
    ['diagnostic', 'Diagnostic'],
    ['dental', 'Dental'],
  ]),
  category(4, 'services', 'Services', 'Electricians, plumbers, mechanics and other local services.', 'services', 'light', [
    ['electrician', 'Electrician'],
    ['plumber', 'Plumber'],
    ['mechanic', 'Mechanic'],
    ['tailor', 'Tailor'],
    ['carpenter', 'Carpenter'],
    ['computer-service', 'Computer Service'],
  ]),
  category(5, 'education', 'Education', 'Schools, coaching, colleges and computer institutes.', 'education', 'yellow', [
    ['school', 'School'],
    ['coaching', 'Coaching'],
    ['college', 'College'],
    ['computer-institute', 'Computer Institute'],
  ]),
  category(6, 'automobile', 'Automobile', 'Car and bike repair, tyres and spare parts.', 'automobile', 'dark', [
    ['car-repair', 'Car Repair'],
    ['bike-repair', 'Bike Repair'],
    ['tyre', 'Tyre'],
    ['spare-parts', 'Spare Parts'],
  ]),
  category(7, 'home-services', 'Home Services', 'Cleaning, painting, pest control and appliance repair.', 'home', 'cream', [
    ['cleaning', 'Cleaning'],
    ['painting', 'Painting'],
    ['pest-control', 'Pest Control'],
    ['appliance-repair', 'Appliance Repair'],
  ]),
  category(8, 'finance', 'Finance', 'Banks, insurance, tax and financial services.', 'finance', 'magenta', [
    ['bank', 'Bank'],
    ['insurance', 'Insurance'],
    ['tax-service', 'Tax Service'],
    ['financial-service', 'Financial Service'],
  ]),
];
