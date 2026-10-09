import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes, withComponentInputBinding())],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the home route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', PublicLayoutComponent);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      'Thakurganj',
    );
  });
});

