import { defineConfig } from '@playwright/test';

const PORT = 4310;

/**
 * Visual regression suite. Runs against the production SSR build, so run `npm run build` first.
 * Uses the locally installed Microsoft Edge to avoid a browser download.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 60_000,
  workers: 4,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]],
  outputDir: 'e2e-results',
  // Baselines were captured with Microsoft Edge on Windows; font rendering differs on other platforms.
  snapshotPathTemplate: '{testDir}/visual-baseline/{testFilePath}/{arg}{ext}',
  expect: {
    // Tall full-page captures at narrow widths need longer than the 5s default to stabilise.
    timeout: 20_000,
    toHaveScreenshot: { maxDiffPixels: 0, animations: 'disabled', caret: 'hide', scale: 'css' },
  },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    channel: 'msedge',
    colorScheme: 'light',
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
  },
  webServer: {
    command: 'node dist/thakurganj-connect-web/server/server.mjs',
    url: `http://127.0.0.1:${PORT}`,
    env: { PORT: String(PORT) },
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
