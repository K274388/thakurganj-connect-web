import { Injectable, signal } from '@angular/core';

/** Temporary development identity. Replace with AuthStore.currentUser once authentication exists. */
export const MOCK_CURRENT_USER = { id: 1, name: 'Demo Owner' } as const;

@Injectable({ providedIn: 'root' })
export class MockCurrentUserService {
  readonly user = signal<{ id: number; name: string }>(MOCK_CURRENT_USER);
}
