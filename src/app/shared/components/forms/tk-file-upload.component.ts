import { Component, input, output } from '@angular/core';

@Component({
  selector: 'tk-file-upload',
  standalone: true,
  template: `
    <label class="tk-field">
      <span class="tk-field-label">{{ label() }}</span>
      <input class="tk-input file-input" type="file" [accept]="accept()" [multiple]="multiple()" [disabled]="disabled()" (change)="onChange($event)" />
      @if (selectedFiles.length) {
        <ul aria-live="polite">
          @for (file of selectedFiles; track file.name + file.lastModified) { <li>{{ file.name }}</li> }
        </ul>
      }
    </label>
  `,
  styles: `
    .file-input { padding: 0.45rem; }
    .file-input::file-selector-button { margin-right: 0.75rem; padding: 0.45rem 0.75rem; border: 0; border-radius: var(--tk-radius-pill); background: var(--tk-yellow); color: var(--tk-black); cursor: pointer; font-weight: 750; }
    ul { margin: 0; padding-left: 1.25rem; color: var(--tk-gray-600); font-size: 0.85rem; }
  `,
})
export class TkFileUploadComponent {
  readonly label = input.required<string>();
  readonly accept = input('image/*');
  readonly multiple = input(false);
  readonly disabled = input(false);
  readonly filesChange = output<File[]>();
  protected selectedFiles: File[] = [];

  protected onChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.selectedFiles = Array.from(target.files ?? []);
    this.filesChange.emit(this.selectedFiles);
  }
}
