import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { LegalComponent } from './legal.component';

describe('LegalComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(section?: string) {
    const fixture = TestBed.createComponent(LegalComponent);
    if (section) fixture.componentRef.setInput('section', section);
    fixture.detectChanges();
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  it('shows the terms by default and links every policy section', () => {
    const { page } = render();

    expect(page.querySelector('h2')?.textContent).toContain('Terms & Conditions');
    expect(page.querySelectorAll('.section-nav a')).toHaveLength(4);
    expect(page.querySelector('.section-nav a.active')?.getAttribute('href')).toBe('/legal/terms');
    expect(TestBed.inject(Title).getTitle()).toBe('Terms & Conditions | Thakurganj Connect');
  });

  it('expands and collapses all clauses', () => {
    const { fixture, page } = render('privacy');
    const button = page.querySelector<HTMLButtonElement>('.toggle-all')!;

    button.click();
    fixture.detectChanges();
    expect(page.querySelectorAll('details[open]').length).toBe(page.querySelectorAll('details').length);
    expect(button.textContent).toContain('Collapse all');

    button.click();
    fixture.detectChanges();
    expect(page.querySelectorAll('details[open]')).toHaveLength(0);
  });

  it('builds a prefilled email for reports', () => {
    const { fixture, page } = render('report');
    const textarea = page.querySelector('textarea')!;
    textarea.value = 'Phone number is wrong';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const href = page.querySelector('.report-form a.button')!.getAttribute('href')!;
    expect(href).toMatch(/^mailto:hello@thakurganj\.connect\?subject=/);
    expect(decodeURIComponent(href)).toContain('Phone number is wrong');
  });
});
