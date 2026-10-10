import { HttpClient } from '@angular/common/http';
import { Signal, signal } from '@angular/core';
import { catchError, map, of } from 'rxjs';

export interface ApiListResource<T> {
  /** The loaded items; empty while loading and after a failed request. */
  readonly items: Signal<T[]>;
  /** Re-fetches the list, e.g. after a successful create or update. */
  reload(): void;
}

/**
 * Loads a list from the API into a signal, starting immediately.
 * A failed request leaves an empty list, so pages fall back to their existing empty states.
 * HttpClient requests keep server rendering waiting until they settle, and GET responses rendered on the
 * server are reused during hydration (HTTP transfer cache), so the browser does not repeat them.
 * Uses HttpClient rather than `httpResource`, which would add Angular's resource runtime to the initial bundle.
 */
export function apiListResource<T>(
  http: HttpClient,
  url: string,
  parse: (response: unknown) => T[],
): ApiListResource<T> {
  const items = signal<T[]>([]);
  const load = () =>
    http
      .get<unknown>(url)
      .pipe(
        map(parse),
        catchError(() => of<T[]>([])),
      )
      .subscribe((value) => items.set(value));
  load();
  return { items: items.asReadonly(), reload: load };
}
