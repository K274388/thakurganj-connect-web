import type { Request, RequestHandler } from 'express';
import type { IncomingHttpHeaders } from 'node:http';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';

/** Paths the browser calls on the site's own origin and the API serves. */
export const API_PROXY_PATHS = ['/api/v1', '/media'];

/**
 * Forwards same-origin `/api/v1` and `/media` requests to the API. The browser then never calls the API cross-origin,
 * so the app works the same on localhost, through the dev.thakurganj.info Cloudflare tunnel and in production, both
 * under `ng serve` (which hands these requests to server.ts) and the built server. A reverse proxy that routes these
 * paths itself simply never reaches this handler.
 */
export function createApiProxy(origin: string): RequestHandler {
  return (req, res) => {
    const target = new URL(req.originalUrl, origin);
    const send = target.protocol === 'https:' ? httpsRequest : httpRequest;
    const upstream = send(target, { method: req.method, headers: forwardedHeaders(req, target) }, (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(res);
    });
    upstream.on('error', () => {
      if (res.headersSent || res.destroyed) {
        res.destroy();
        return;
      }
      res
        .status(502)
        .type('application/problem+json')
        .send(
          JSON.stringify({
            type: 'about:blank',
            title: 'Bad Gateway',
            status: 502,
            detail: 'The API is not reachable.',
            code: 'API_UNAVAILABLE',
          }),
        );
    });
    // The browser went away (navigation, refresh, cancelled fetch): stop the API call too.
    res.on('close', () => {
      if (!res.writableFinished) upstream.destroy();
    });
    req.pipe(upstream);
  };
}

function forwardedHeaders(req: Request, target: URL): IncomingHttpHeaders {
  const headers: IncomingHttpHeaders = { ...req.headers, host: target.host };
  // The browser made a same-origin request, so there is nothing for CORS to check. Forwarding Origin would make the API
  // answer 403 ("Invalid CORS request") for any hostname missing from its allow-list, e.g. the tunnel hostname.
  delete headers.origin;
  headers['x-forwarded-host'] ??= req.headers.host;
  headers['x-forwarded-proto'] ??= req.protocol;
  return headers;
}
