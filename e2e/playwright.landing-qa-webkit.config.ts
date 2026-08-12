import { defineConfig } from '@playwright/test';

/** Targeted WebKit smoke tests for mobile navigation (P1.4.1). */
export default defineConfig({
  testDir: '.',
  testMatch: /mobile-nav-webkit\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 240_000,
  reporter: [['list']],
  use: {
    baseURL: process.env.LANDING_QA_BASE_URL ?? 'http://127.0.0.1:4321',
    browserName: 'webkit',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
    screenshot: 'off',
    video: 'off',
    trace: 'off',
  },
});
