export const environment = {
  production: false,
  /** 'mock' serves the bundled JSON demo data; 'http' calls the Spring Boot API at apiBaseUrl. */
  dataSource: 'mock' as 'mock' | 'http',
  apiBaseUrl: 'http://localhost:8080/api/v1',
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
