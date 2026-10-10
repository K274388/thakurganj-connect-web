import { Observable } from 'rxjs';

/**
 * Test helper: returns the value a synchronous observable (such as a mock repository call) emits,
 * or rethrows its error. Fails if nothing is emitted synchronously.
 */
export function emitted<T>(source: Observable<T>): T {
  let result: { value: T } | undefined;
  let failure: { error: unknown } | undefined;
  source.subscribe({ next: (value) => (result ??= { value }), error: (error) => (failure = { error }) }).unsubscribe();
  if (failure) throw failure.error;
  if (!result) throw new Error('Observable did not emit synchronously.');
  return result.value;
}
