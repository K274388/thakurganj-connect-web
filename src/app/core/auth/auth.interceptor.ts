import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../api/api.config';
import { AuthService } from './auth.service';

/** Attaches the bearer token to API requests only, and drops a token the API no longer accepts. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const base = inject(API_CONFIG).baseUrl;
  const token = auth.token();
  if (!token || !base || !req.url.startsWith(base)) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) auth.clearSession();
      return throwError(() => error);
    }),
  );
};
