export const environment = {
  production: true,
  /** Must be absolute: pages are server-rendered and HttpClient on the Node server cannot resolve relative URLs. */
  apiBaseUrl: '',
  map: {
    tileUrls: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    maxZoom: 19,
    attribution: '� <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    fallbackCenter: { latitude: 26.43, longitude: 88.12 },
    fallbackZoom: 12,
    selectedZoom: 15,
    maxFitZoom: 16,
  },
} as const;
