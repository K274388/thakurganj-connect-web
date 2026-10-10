import { Component, input } from '@angular/core';
import { AnnouncementBarItem } from '../../shared/models/announcement-bar-item';

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  template: `
    @if (items().length) {
      <aside class="announcement" aria-label="Community announcements">
        <span class="label">NOTICE</span>
        <div class="items">
          @for (item of items(); track item.id; let last = $last) {
            <span class="item">
              @if (item.link) {
                <a [href]="item.link">
                  <span>{{ item.title }}</span>
                  @if (item.hindiTitle) { <span lang="hi">{{ item.hindiTitle }}</span> }
                  @if (item.date) { <span>— {{ item.date }}</span> }
                </a>
              } @else {
                <span class="item-content">
                  <span>{{ item.title }}</span>
                  @if (item.hindiTitle) { <span lang="hi">{{ item.hindiTitle }}</span> }
                  @if (item.date) { <span>— {{ item.date }}</span> }
                </span>
              }
            </span>
            @if (!last) { <span class="separator" aria-hidden="true">/</span> }
          }
        </div>
      </aside>
    }
  `,
  styles: `
    :host { display: block; }
    .announcement { display: flex; min-height: 2.5rem; align-items: center; gap: 1rem; padding: 0.5rem max(1rem, calc((100% - var(--tk-container-width)) / 2)); background: var(--tk-black); color: var(--tk-white); font-size: 0.85rem; }
    .label { flex: 0 0 auto; color: var(--tk-yellow); font-size: 0.7rem; font-weight: 850; letter-spacing: 0.12em; }
    .items { display: flex; min-width: 0; align-items: center; gap: 0.8rem; overflow-x: auto; white-space: nowrap; scrollbar-width: thin; }
    .item { flex: 0 0 auto; }
    .item > a, .item-content { display: inline-flex; align-items: baseline; gap: 0.6rem; }
    a { color: inherit; text-decoration-thickness: 1px; text-underline-offset: 0.2em; }
    .separator { color: var(--tk-yellow); }
    @media (max-width: 767px) { .announcement { gap: 0.65rem; font-size: 0.78rem; } }
  `,
})
export class AnnouncementBarComponent {
  readonly items = input<AnnouncementBarItem[]>([
    { id: 'welcome', title: 'Welcome to Thakurganj Connect', hindiTitle: 'अपने शहर की अपनी जानकारी' },
  ]);
}
