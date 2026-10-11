export const environment = {
  production: true,
  /**
   * Same-origin path, resolved against the page origin (see API_CONFIG). server.ts forwards it to the API at
   * TKG_API_ORIGIN, and server renders call that origin directly. An absolute URL also works for a separate API host.
   */
  apiBaseUrl: '/api/v1',
  map: {
    tileUrls: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    maxZoom: 19,
    attribution: '� <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    fallbackCenter: { latitude: 26.43, longitude: 88.12 },
    fallbackZoom: 14,
    selectedZoom: 15,
    maxFitZoom: 16,
  },
} as const;
