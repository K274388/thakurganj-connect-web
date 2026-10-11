/** The parts of Node's IncomingMessage and ServerResponse that tell whether the client is still connected. */
interface ClientRequestState {
  readonly aborted: boolean;
}
interface ClientResponseState {
  readonly destroyed: boolean;
  readonly writableFinished: boolean;
}

/**
 * True when rendering failed only because the client went away: the browser navigated or refreshed, a prefetch was
 * cancelled, or the Cloudflare tunnel closed the connection. `@angular/ssr` then rejects with an `AbortError`
 * ("Request for: … was aborted"). Nobody is left to receive a response, so this is not an application failure.
 *
 * An `AbortError` while the client is still connected (e.g. a timed-out fetch inside the app) is a genuine failure.
 */
export function isClientAbort(
  error: unknown,
  req: ClientRequestState,
  res: ClientResponseState,
): boolean {
  // `aborted` is the signal @angular/ssr itself listens to; a destroyed, unfinished response means the socket closed.
  const clientGone = req.aborted || (res.destroyed && !res.writableFinished);
  return isAbortError(error) && clientGone;
}

function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError';
}
