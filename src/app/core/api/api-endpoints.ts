/**
 * Every backend path used by the app, relative to `API_CONFIG.baseUrl`.
 * Paths follow docs/api/openapi.yaml; keep the two in sync.
 */
export const API_ENDPOINTS = {
  categories: {
    list: '/categories',
    bySlug: (slug: string) => `/categories/${encodeURIComponent(slug)}`,
  },
  businesses: {
    list: '/businesses',
    byId: (id: string | number) => `/businesses/${encodeURIComponent(String(id))}`,
  },
  myBusinesses: {
    list: '/my/businesses',
    create: '/my/businesses',
    byId: (id: string | number) => `/my/businesses/${encodeURIComponent(String(id))}`,
    update: (id: string | number) => `/my/businesses/${encodeURIComponent(String(id))}`,
  },
  placeCategories: {
    list: '/place-categories',
  },
  places: {
    list: '/places',
    bySlug: (slug: string) => `/places/${encodeURIComponent(slug)}`,
  },
  map: {
    items: '/map/items',
  },
  announcements: {
    list: '/announcements',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
  },
} as const;

/**
 * The UI currently filters, sorts and paginates directories in memory, so list calls request the
 * contract's maximum page size. Move to server-side paging when the directory UI is wired to it.
 */
export const API_MAX_PAGE_SIZE = 100;
