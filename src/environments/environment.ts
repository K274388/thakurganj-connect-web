export const environment = {
  production: true,
  /** 'mock' serves the bundled JSON demo data; 'http' calls the Spring Boot API at apiBaseUrl. */
  dataSource: 'mock' as 'mock' | 'http',
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
