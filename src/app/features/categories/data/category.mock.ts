import { BusinessCategory } from '../models/category.models';
import categories from './categories.mock.json';

/** Demo category catalog used when `environment.dataSource` is `mock`. Edit the JSON file to change it. */
export const BUSINESS_CATEGORIES = categories as BusinessCategory[];
