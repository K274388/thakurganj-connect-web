import { DestroyRef, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

/** Marks the current page as private (noindex, nofollow) and restores the default when it is destroyed. Call from an injection context. */
export function markPageAsPrivate(): void {
  const meta = inject(Meta);
  meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  inject(DestroyRef).onDestroy(() => meta.removeTag('name="robots"'));
}
