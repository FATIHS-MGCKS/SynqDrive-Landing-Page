/**
 * WebKit stylesheet application and mobile layout guards (E1).
 */
import { test, expect } from '@playwright/test';
import path from 'node:path';

import {
  expectReleaseStylesheetApplied,
  readStylesheetApplication,
} from './stylesheet-delivery-helpers';

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'qa');

test.describe('stylesheet delivery — WebKit mobile application', () => {
  test('390 DE applies release stylesheet and composed mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    const state = await readStylesheetApplication(page);
    expectReleaseStylesheetApplied(state);
    expect(state.frameWidth ?? 0).toBeGreaterThan(300);
    expect(state.hubCoreWidth ?? 0).toBeGreaterThan(120);
  });

  test('390 EN applies release stylesheet and composed mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en/', { waitUntil: 'load' });
    const state = await readStylesheetApplication(page);
    expectReleaseStylesheetApplied(state);
    expect(state.frameWidth ?? 0).toBeGreaterThan(300);
  });

  test('captures WebKit 390 full-page CSS application review shots', async ({ page }) => {
    for (const [locale, url] of [
      ['de', '/'],
      ['en', '/en/'],
    ] as const) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(url, { waitUntil: 'load' });
      await page.screenshot({
        path: path.join(OUT, `e1-webkit-${locale}-390-css-applied.png`),
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
});
