import { HttpInterceptorFn } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { API_CONFIG } from './api.config';

/**
 * Origin the Node server reaches the API on, e.g. `http://localhost:8080`. Provided only by the server config, so its
 * presence means "rendering on the server".
 */
export const API_SERVER_ORIGIN = new InjectionToken<string>('API_SERVER_ORIGIN');

/**
 * Longest a server render waits for one API call. A slow or unreachable API then yields the page's empty or error
 * state instead of holding the response open until the browser or Cloudflare gives up (an aborted request).
 * Failed calls are not put in the transfer cache, so the browser repeats them after hydration.
 */
export const SSR_API_TIMEOUT_MS = 5_000;

/**
 * Server only: sends API calls straight to the API origin instead of back out through the public hostname (a round
 * trip through the Cloudflare tunnel, where bot protection can answer 403), and bounds how long they may delay
 * rendering. `HTTP_TRANSFER_CACHE_ORIGIN_MAP` maps the origin back so the browser still reuses the responses.
 */
export const serverApiInterceptor: HttpInterceptorFn = (req, next) => {
  const serverOrigin = inject(API_SERVER_ORIGIN, { optional: true });
  const base = inject(API_CONFIG).baseUrl;
  if (!serverOrigin || !URL.canParse(base) || !req.url.startsWith(base)) return next(req);

  const publicOrigin = new URL(base).origin;
  const url = serverOrigin.replace(/\/+$/, '') + req.url.slice(publicOrigin.length);
  return next(req.clone({ url, timeout: SSR_API_TIMEOUT_MS }));
};

/** Value for `HTTP_TRANSFER_CACHE_ORIGIN_MAP`: stores server responses under the URL the browser will request. */
export function transferCacheOriginMap(serverOrigin: string, baseUrl: string): Record<string, string> {
  if (!URL.canParse(serverOrigin) || !URL.canParse(baseUrl)) return {};
  return { [new URL(serverOrigin).origin]: new URL(baseUrl).origin };
}
