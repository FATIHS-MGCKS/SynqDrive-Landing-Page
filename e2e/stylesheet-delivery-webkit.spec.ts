/**
 * WebKit stylesheet delivery, recovery, dark-mode, and incident-signature guards (E1.1).
 */
import { test, expect } from '@playwright/test';
import path from 'node:path';

import {
  expectIncidentSignatureAbsent,
  expectNormalIconGeometry,
  expectReleaseStylesheetApplied,
  expectSafeDegradedState,
  readDistRuntimeAssets,
  readIncidentState,
} from './stylesheet-delivery-helpers';

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'qa');

test.describe('stylesheet delivery — WebKit mobile application', () => {
  test('390 DE applies release stylesheet and composed mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    const state = await readIncidentState(page);
    expectReleaseStylesheetApplied(state);
    expectNormalIconGeometry(state);
    expect(state.frameWidth ?? 0).toBeGreaterThan(300);
    expect(state.hubCoreWidth ?? 0).toBeGreaterThan(120);
  });

  test('390 EN applies release stylesheet and composed mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en/', { waitUntil: 'load' });
    const state = await readIncidentState(page);
    expectReleaseStylesheetApplied(state);
    expectNormalIconGeometry(state);
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

test.describe('stylesheet delivery — WebKit primary failure recovery', () => {
  test('390 DE blocks fingerprinted CSS, retries alias once, restores composed layout', async ({ page }) => {
    const assets = await readDistRuntimeAssets();
    let aliasRequests = 0;

    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === `/${assets.css}`) {
        return route.abort();
      }
      if (url.pathname === '/styles.css') {
        aliasRequests += 1;
      }
      return route.continue();
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await expect
      .poll(async () => (await readIncidentState(page)).sentinel, { timeout: 5000 })
      .toBe('1');

    expect(aliasRequests).toBe(1);
    const state = await readIncidentState(page);
    expectReleaseStylesheetApplied(state);
    expectNormalIconGeometry(state);
  });
});

test.describe('stylesheet delivery — WebKit total CSS failure', () => {
  test('390 DE blocks primary and retry CSS, reaches safe degraded state', async ({ page }) => {
    const assets = await readDistRuntimeAssets();
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === `/${assets.css}` || url.pathname === '/styles.css') {
        return route.abort();
      }
      return route.continue();
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    const state = await readIncidentState(page);
    expectSafeDegradedState(state);
    expectIncidentSignatureAbsent(state);
  });
});

test.describe('stylesheet delivery — WebKit dark mode guard', () => {
  test.use({ colorScheme: 'dark' });

  test('390 DE keeps light canvas with normal CSS loaded', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    const state = await readIncidentState(page);
    expectReleaseStylesheetApplied(state);
    expectNormalIconGeometry(state);
  });

  test('390 DE keeps safe light fallback when all CSS is blocked', async ({ page }) => {
    const assets = await readDistRuntimeAssets();
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === `/${assets.css}` || url.pathname === '/styles.css') {
        return route.abort();
      }
      return route.continue();
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    const state = await readIncidentState(page);
    expectSafeDegradedState(state);
    expectIncidentSignatureAbsent(state);
  });

  test('real-device unstyled incident signature cannot recur catastrophically', async ({ page }) => {
    const assets = await readDistRuntimeAssets();
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === `/${assets.css}` || url.pathname === '/styles.css') {
        return route.abort();
      }
      return route.continue();
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    const state = await readIncidentState(page);
    expectIncidentSignatureAbsent(state);
    expectSafeDegradedState(state);
  });
});
