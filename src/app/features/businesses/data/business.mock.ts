import { Business } from '../models/business.models';
import businesses from './businesses.mock.json';

/**
 * Fictional demo listings used when `environment.dataSource` is `mock`. Edit the JSON file to change them.
 * The mock current user (id 1) owns businesses 1, 2 and 21 (21 is INACTIVE); every other listing is owned by user 2.
 */
export const MOCK_BUSINESSES = businesses as Business[];
