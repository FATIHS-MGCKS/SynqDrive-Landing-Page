/**
 * Stylesheet delivery, fingerprint contract, and catastrophic-fallback QA (E1).
 */
import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  expectReleaseStylesheetApplied,
  expectSafeDegradedState,
  readDistRuntimeAssets,
  readStylesheetApplication,
} from './stylesheet-delivery-helpers';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');

async function sha256File(relativePath: string) {
  const content = await fs.readFile(path.join(DIST, relativePath));
  return createHash('sha256').update(content).digest('hex');
}

test.describe('stylesheet delivery — build contract', () => {
  test('fingerprinted assets, HTML references, and compatibility aliases', async () => {
    const { css, js, cssHref, jsHref } = await readDistRuntimeAssets();
    const deHtml = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
    const enHtml = await fs.readFile(path.join(DIST, 'en/index.html'), 'utf8');

    expect(deHtml).toContain(`href="${cssHref}"`);
    expect(enHtml).toContain(`href="${cssHref}"`);
    expect(deHtml).toContain(`src="${jsHref}"`);
    expect(enHtml).toContain(`src="${jsHref}"`);
    expect(deHtml).not.toMatch(/href="\/styles\.css"/);
    expect(enHtml).not.toMatch(/href="\/styles\.css"/);
    expect(deHtml).not.toMatch(/src="\/script\.js"/);
    expect(enHtml).not.toMatch(/src="\/script\.js"/);

    const aliasCss = await fs.readFile(path.join(DIST, 'styles.css'));
    const aliasJs = await fs.readFile(path.join(DIST, 'script.js'));
    const fpCss = await fs.readFile(path.join(DIST, css));
    const fpJs = await fs.readFile(path.join(DIST, js));

    expect(aliasCss.equals(fpCss)).toBe(true);
    expect(aliasJs.equals(fpJs)).toBe(true);
    expect(await sha256File('styles.css')).toBe(await sha256File(css));
    expect(await sha256File('script.js')).toBe(await sha256File(js));
  });
});

test.describe('stylesheet delivery — Chromium mobile application', () => {
  test('390 DE applies release stylesheet sentinel and composed layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    const state = await readStylesheetApplication(page);
    expectReleaseStylesheetApplied(state);
    expect(state.frameWidth ?? 0).toBeGreaterThan(300);
    expect(state.hubCoreWidth ?? 0).toBeGreaterThan(120);
    expect(state.pageHeight).toBeGreaterThanOrEqual(8610);
    expect(state.pageHeight).toBeLessThanOrEqual(8645);
  });
});

test.describe('stylesheet delivery — local failure reproduction', () => {
  test('blocking stylesheet reproduces unstyled incident markers', async ({ page }) => {
    const { cssHref } = await readDistRuntimeAssets();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route(`**${cssHref}`, (route) => route.abort());
    await page.goto('/', { waitUntil: 'load' });

    const blocked = await readStylesheetApplication(page);
    expect(blocked.sentinel).not.toBe('1');
    expect(blocked.mastheadPosition).not.toBe('sticky');
  });

  test('blocking stylesheet still reaches safe degraded state via inline fallback', async ({ page }) => {
    const { cssHref } = await readDistRuntimeAssets();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route(`**${cssHref}`, (route) => route.abort());
    await page.goto('/', { waitUntil: 'load' });

    const state = await readStylesheetApplication(page);
    expectSafeDegradedState(state);
    expect(state.iconWidth ?? 0).toBeLessThanOrEqual(state.viewportWidth);
  });
});

test.describe('stylesheet delivery — normal render tolerance', () => {
  test('inline catastrophic fallback does not break P2.7 390 DE geometry', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    const state = await readStylesheetApplication(page);
    expectReleaseStylesheetApplied(state);
    expect(state.pageHeight).toBeGreaterThanOrEqual(8610);
    expect(state.pageHeight).toBeLessThanOrEqual(8645);
  });
});
