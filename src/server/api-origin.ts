/**
 * Where the Node server (SSR renders and the `/api/v1` proxy in server.ts) reaches the Spring Boot API.
 * Override with `TKG_API_ORIGIN`, e.g. `http://tkg-backend:8080`. Keep the default in sync with proxy.conf.mjs.
 */
export function apiServerOrigin(): string {
  return new URL(process.env['TKG_API_ORIGIN'] || 'http://localhost:8080').origin;
}
