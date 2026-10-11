import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import { mergeApplicationConfig, ApplicationConfig, inject } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { apiServerOrigin } from '../server/api-origin';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_CONFIG } from './core/api/api.config';
import { API_SERVER_ORIGIN, transferCacheOriginMap } from './core/api/server-api.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: API_SERVER_ORIGIN, useFactory: apiServerOrigin },
    {
      provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
      useFactory: () => transferCacheOriginMap(inject(API_SERVER_ORIGIN), inject(API_CONFIG).baseUrl),
    },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
