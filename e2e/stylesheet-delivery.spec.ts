/**
 * Stylesheet delivery, fingerprint contract, recovery, and catastrophic-fallback QA (E1/E1.1).
 */
import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  expectIncidentSignatureAbsent,
  expectNormalIconGeometry,
  expectReleaseStylesheetApplied,
  expectSafeDegradedState,
  readDistRuntimeAssets,
  readIncidentState,
} from './stylesheet-delivery-helpers';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
const ICONS = path.join(ROOT, 'src', 'icons.generated.mjs');

async function sha256File(relativePath: string) {
  const content = await fs.readFile(path.join(DIST, relativePath));
  return createHash('sha256').update(content).digest('hex');
}

test.describe('stylesheet delivery — build contract', () => {
  test('fingerprinted assets, HTML references, compatibility aliases, and retry contract', async () => {
    const { css, js, cssHref, jsHref, cssFingerprint } = await readDistRuntimeAssets();
    const deHtml = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
    const enHtml = await fs.readFile(path.join(DIST, 'en/index.html'), 'utf8');

    expect(deHtml).toContain(`href="${cssHref}"`);
    expect(enHtml).toContain(`href="${cssHref}"`);
    expect(deHtml).toContain(`src="${jsHref}"`);
    expect(enHtml).toContain(`src="${jsHref}"`);
    expect(deHtml).not.toMatch(/href="\/styles\.css"/);
    expect(enHtml).not.toMatch(/href="\/styles\.css"/);
    expect(deHtml).toContain("retry.href='/styles.css?v='+encodeURIComponent(fingerprint)");
    expect(deHtml).toContain(`fingerprint="${cssFingerprint}"`);

    const aliasCss = await fs.readFile(path.join(DIST, 'styles.css'));
    const aliasJs = await fs.readFile(path.join(DIST, 'script.js'));
    const fpCss = await fs.readFile(path.join(DIST, css));
    const fpJs = await fs.readFile(path.join(DIST, js));

    expect(aliasCss.equals(fpCss)).toBe(true);
    expect(aliasJs.equals(fpJs)).toBe(true);
    expect(await sha256File('styles.css')).toBe(await sha256File(css));
    expect(await sha256File('script.js')).toBe(await sha256File(js));
  });

  test('generated icons include intrinsic 24x24 root dimensions', async () => {
    const icons = await fs.readFile(ICONS, 'utf8');
    expect(icons).toContain('width=\\"24\\"');
    expect(icons).toContain('height=\\"24\\"');
    const tags = icons.match(/<svg[^>]+>/g) ?? [];
    expect(tags.length).toBeGreaterThan(0);
    for (const tag of tags) {
      expect(tag).toMatch(/width=\\"24\\"/);
      expect(tag).toMatch(/height=\\"24\\"/);
    }
  });
});

test.describe('stylesheet delivery — Chromium mobile application', () => {
  test('390 DE applies release stylesheet sentinel and composed layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    const state = await readIncidentState(page);
    expectReleaseStylesheetApplied(state);
    expectNormalIconGeometry(state);
    expect(state.frameWidth ?? 0).toBeGreaterThan(300);
    expect(state.hubCoreWidth ?? 0).toBeGreaterThan(120);
    expect(state.pageHeight).toBeGreaterThanOrEqual(8480);
    expect(state.pageHeight).toBeLessThanOrEqual(8520);
  });

  test('1440 DE retains accepted icon geometry with CSS applied', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/', { waitUntil: 'load' });
    const state = await readIncidentState(page);
    expectReleaseStylesheetApplied(state);
    expectNormalIconGeometry(state);
  });
});

test.describe('stylesheet delivery — primary failure recovery', () => {
  test('blocks fingerprinted CSS once, retries alias exactly once, restores sentinel', async ({ page }) => {
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

test.describe('stylesheet delivery — total CSS failure', () => {
  test('blocks fingerprinted CSS and alias retry, reaches safe degraded state', async ({ page }) => {
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

test.describe('stylesheet delivery — normal render tolerance', () => {
  test('inline catastrophic fallback does not break P2.7 390 DE geometry', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    const state = await readIncidentState(page);
    expectReleaseStylesheetApplied(state);
    expect(state.pageHeight).toBeGreaterThanOrEqual(8480);
    expect(state.pageHeight).toBeLessThanOrEqual(8520);
  });
});
