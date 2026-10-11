import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { API_ENDPOINTS } from '../api/api-endpoints';
import { API_CONFIG, apiUrl } from '../api/api.config';

/** The signed-in user (`GET /auth/me`). `id` is the same identifier as `Business.ownerId`. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthUser;
}

const TOKEN_KEY = 'tkg.accessToken';

/**
 * Bearer-token session. The token lives only in the browser (localStorage), so private pages render on the client
 * (see app.routes.server.ts) and server-rendered requests are always anonymous.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly accessToken = signal<string | null>(this.readToken());
  private readonly currentUser = signal<AuthUser | null>(null);

  readonly token = this.accessToken.asReadonly();
  readonly user = this.currentUser.asReadonly();

  constructor() {
    // Deferred: the auth interceptor injects this service, so requesting during construction would be circular.
    if (this.accessToken()) queueMicrotask(() => this.loadCurrentUser().subscribe({ error: () => this.clearSession() }));
  }

  login(request: LoginRequest): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(apiUrl(this.config, API_ENDPOINTS.auth.login), request)
      .pipe(map((response) => this.startSession(response)));
  }

  register(request: RegisterRequest): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(apiUrl(this.config, API_ENDPOINTS.auth.register), request)
      .pipe(map((response) => this.startSession(response)));
  }

  /** Revokes the token on the server; the local session is cleared even if that call fails. */
  logout(): void {
    if (!this.accessToken()) return;
    this.http.post<void>(apiUrl(this.config, API_ENDPOINTS.auth.logout), null).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  /** Forgets the token and user, e.g. after the API answers 401. */
  clearSession(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.writeToken(null);
  }

  private loadCurrentUser(): Observable<AuthUser> {
    return this.http
      .get<AuthUser>(apiUrl(this.config, API_ENDPOINTS.auth.me))
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  private startSession(response: AuthResponse): AuthUser {
    this.accessToken.set(response.accessToken);
    this.currentUser.set(response.user);
    this.writeToken(response.accessToken);
    return response.user;
  }

  private readToken(): string | null {
    if (!this.browser) return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private writeToken(token: string | null): void {
    if (!this.browser) return;
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Storage unavailable (private mode, blocked site data): the session lasts until reload.
    }
  }
}
