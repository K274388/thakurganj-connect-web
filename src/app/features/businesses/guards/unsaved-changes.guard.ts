import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  /** Resolves to true when navigation may proceed. */
  canDeactivate(): boolean | Promise<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => component.canDeactivate();
