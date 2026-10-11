import { isClientAbort } from './client-abort';

/** What @angular/ssr rejects with when the request signal aborts. */
const ssrAbort = () =>
  new DOMException('Request for: https://dev.thakurganj.info/my/business/new was aborted.', 'AbortError');

const connected = { aborted: false };
const openResponse = { destroyed: false, writableFinished: false };

describe('isClientAbort', () => {
  it('treats an AbortError after the client disconnected as an expected cancellation', () => {
    expect(isClientAbort(ssrAbort(), { aborted: true }, openResponse)).toBe(true);
  });

  it('treats an AbortError after the response socket closed early as an expected cancellation', () => {
    expect(isClientAbort(ssrAbort(), connected, { destroyed: true, writableFinished: false })).toBe(true);
  });

  it('reports an AbortError while the client is still connected as a genuine failure', () => {
    expect(isClientAbort(ssrAbort(), connected, openResponse)).toBe(false);
  });

  it('reports other errors as genuine failures even when the client is gone', () => {
    expect(isClientAbort(new Error('NG0201: No provider found'), { aborted: true }, openResponse)).toBe(false);
    expect(isClientAbort(new TypeError('fetch failed'), { aborted: true }, openResponse)).toBe(false);
    expect(isClientAbort(undefined, { aborted: true }, openResponse)).toBe(false);
  });
});
