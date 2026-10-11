import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { GlobalErrorHandler } from './core/error-handling/global-error-handler';
import { authInterceptor } from './core/auth/auth.interceptor';
import { serverApiInterceptor } from './core/api/server-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, serverApiInterceptor])),
    provideClientHydration(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ]
};

