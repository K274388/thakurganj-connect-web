import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_SECTIONS,
  LegalSection,
  REPORT_GUIDELINES,
  REPORT_ISSUE_TYPES,
} from '../../legal.data';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalComponent {
  /** Bound from the `:section` route parameter. */
  readonly section = input<string>();

  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly sections = LEGAL_SECTIONS;
  protected readonly email = LEGAL_CONTACT_EMAIL;
  protected readonly effectiveDate = LEGAL_EFFECTIVE_DATE;
  protected readonly guidelines = REPORT_GUIDELINES;
  protected readonly issueTypes = REPORT_ISSUE_TYPES;

  protected readonly active = computed<LegalSection>(
    () => this.sections.find((item) => item.id === this.section()) ?? this.sections[0],
  );

  private readonly openClauses = signal<ReadonlySet<string>>(new Set());
  protected readonly allOpen = computed(() => {
    const clauses = this.active().clauses;
    return clauses.length > 0 && clauses.every((clause) => this.openClauses().has(clause.id));
  });

  protected readonly issueType = signal(REPORT_ISSUE_TYPES[0]);
  protected readonly pageUrl = signal('');
  protected readonly details = signal('');
  protected readonly reportHref = computed(() => {
    const subject = `Thakurganj Connect - ${this.issueType()}`;
    const body = [
      `Issue: ${this.issueType()}`,
      `Page or listing: ${this.pageUrl().trim() || '(not provided)'}`,
      '',
      this.details().trim() || '(Please describe the issue here)',
    ].join('\n');
    return `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  constructor() {
    effect(() => {
      const active = this.active();
      this.openClauses.set(new Set());
      this.title.setTitle(`${active.title} | Thakurganj Connect`);
      this.meta.updateTag({ name: 'description', content: active.summary });
    });
  }

  protected isOpen(id: string): boolean {
    return this.openClauses().has(id);
  }

  protected onToggle(id: string, event: Event): void {
    const open = (event.target as HTMLDetailsElement).open;
    this.openClauses.update((current) => {
      if (current.has(id) === open) return current;
      const next = new Set(current);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  protected toggleAll(): void {
    this.openClauses.set(
      this.allOpen() ? new Set() : new Set(this.active().clauses.map((clause) => clause.id)),
    );
  }

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
  }
}
