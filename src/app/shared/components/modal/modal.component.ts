import { Component, input, output } from '@angular/core';

@Component({
  selector: 'tk-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="backdrop" (click)="onBackdrop($event)">
        <section
          class="dialog"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId()"
          (keydown)="onKeydown($event)"
        >
          <header>
            <h2 [id]="titleId()">{{ title() }}</h2>
            <button type="button" class="close" aria-label="Close dialog" (click)="closed.emit()">×</button>
          </header>
          <div class="content"><ng-content /></div>
          <footer>
            <button class="tk-button tk-button-outline" type="button" autofocus (click)="closed.emit()">{{ cancelLabel() }}</button>
            <button class="tk-button tk-button-danger" type="button" (click)="confirmed.emit()">{{ confirmLabel() }}</button>
          </footer>
        </section>
      </div>
    }
  `,
  styles: `
    :host { display: contents; }
    .backdrop { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 1rem; background: var(--tk-backdrop); }
    .dialog { width: min(100%, 32rem); max-height: min(90vh, 50rem); overflow: auto; border: 2px solid var(--tk-border); border-radius: var(--tk-radius-lg); background: var(--tk-white); box-shadow: 6px 6px 0 var(--tk-black); }
    header, footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.25rem; }
    header { border-bottom: 2px solid var(--tk-border); }
    h2 { margin: 0; font-size: 1.35rem; }
    .close { border: 0; background: transparent; color: var(--tk-black); cursor: pointer; font-size: 1.6rem; }
    .content { padding: 1.25rem; }
    footer { justify-content: flex-end; border-top: 1px solid var(--tk-gray-200); }
    @media (max-width: 420px) { footer { align-items: stretch; flex-direction: column-reverse; } }
  `,
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly titleId = input('tk-modal-title');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly closed = output<void>();
  readonly confirmed = output<void>();

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closed.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closed.emit();
      return;
    }
    if (event.key !== 'Tab' || !(event.currentTarget instanceof HTMLElement)) return;

    const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable.item(0);
    const last = focusable.item(focusable.length - 1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
