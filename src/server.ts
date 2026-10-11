import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { apiServerOrigin } from './server/api-origin';
import { API_PROXY_PATHS, createApiProxy } from './server/api-proxy';
import { isClientAbort } from './server/client-abort';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['dev.thakurganj.info', 'localhost', '127.0.0.1'],
  trustProxyHeaders: [
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
  ],
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Same-origin API: `/api/v1` and `/media` are forwarded to the Spring Boot API (see api-proxy.ts).
 */
app.use(API_PROXY_PATHS, createApiProxy(apiServerOrigin()));

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch((error: unknown) => {
      // The client disconnected mid-render (navigation, refresh, cancelled prefetch, tunnel closed the connection).
      // There is no one to respond to, so this is logged briefly instead of reported as a server error.
      if (isClientAbort(error, req, res)) {
        console.info(`SSR request cancelled by the client: ${req.method} ${req.originalUrl}`);
        return;
      }
      next(error);
    });
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
