import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');

export const ICON_SAFETY_MAX_PX = 32;
export const NORMAL_ICON_MARK_MAX_PX = 40;

export async function readDistRuntimeAssets() {
  const entries = await fs.readdir(DIST);
  const css = entries.find((name) => /^styles\.[a-f0-9]{12}\.css$/.test(name));
  const js = entries.find((name) => /^script\.[a-f0-9]{12}\.js$/.test(name));
  if (!css || !js) {
    throw new Error('Fingerprinted runtime assets missing from dist/ — run npm run build');
  }
  const cssFingerprint = css.match(/^styles\.([a-f0-9]{12})\.css$/)?.[1];
  if (!cssFingerprint) {
    throw new Error(`Could not parse CSS fingerprint from ${css}`);
  }
  return { css, js, cssHref: `/${css}`, jsHref: `/${js}`, cssFingerprint };
}

function isEffectiveWhite(color: string) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return false;
  return Number(match[1]) >= 250 && Number(match[2]) >= 250 && Number(match[3]) >= 250;
}

function isDarkReadable(color: string) {
  return color.replace(/\s/g, '') === 'rgb(17,24,39)';
}

export async function readIncidentState(page: Page) {
  return page.evaluate(() => {
    const htmlStyle = getComputedStyle(document.documentElement);
    const bodyStyle = getComputedStyle(document.body);
    const skip = document.querySelector('.skip-link');
    const skipRect = skip?.getBoundingClientRect();
    const inertPanel = document.querySelector('.nav-panel[inert]');
    const inertPanelStyle = inertPanel ? getComputedStyle(inertPanel) : null;
    const inertPanelRect = inertPanel?.getBoundingClientRect();
    const h1 = document.querySelector('h1');
    const link = document.querySelector('main a');
    const list = document.querySelector('ul');
    const masthead = document.querySelector('.masthead');

    const inlineSvgs = Array.from(document.querySelectorAll('svg')).map((svg) => {
      let category = 'other';
      if (svg.closest('.locale-switch')) category = 'locale-globe';
      else if (svg.closest('.action__arrow')) category = 'action-arrow';
      else if (svg.closest('.masthead__toggle, .masthead')) category = 'masthead';
      else if (svg.closest('.icon-mark')) category = 'capability-icon';
      else if (svg.closest('.hub__tile')) category = 'hub-icon';
      const rect = svg.getBoundingClientRect();
      return {
        category,
        width: rect.width,
        height: rect.height,
      };
    });

    return {
      sentinel: htmlStyle.getPropertyValue('--synqdrive-release-css').trim(),
      htmlBackground: htmlStyle.backgroundColor,
      bodyBackground: bodyStyle.backgroundColor,
      bodyColor: bodyStyle.color,
      listStyle: list ? getComputedStyle(list).listStyleType : null,
      linkDecoration: link ? getComputedStyle(link).textDecorationLine : null,
      skipTop: skipRect?.top ?? null,
      h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
      h1FontWeight: h1 ? getComputedStyle(h1).fontWeight : null,
      mastheadPosition: masthead ? getComputedStyle(masthead).position : null,
      inertPanelDisplay: inertPanelStyle?.display ?? null,
      inertPanelVisible:
        !!inertPanelRect && inertPanelRect.height > 0 && inertPanelStyle?.display !== 'none',
      inlineSvgs,
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      frameWidth: document.querySelector('.frame--product')?.getBoundingClientRect().width ?? null,
      hubCoreWidth: document.querySelector('#integrations .hub__core')?.getBoundingClientRect().width ?? null,
      pageHeight: document.documentElement.scrollHeight,
    };
  });
}

export function expectEffectiveWhiteCanvas(state: Awaited<ReturnType<typeof readIncidentState>>) {
  expect(isEffectiveWhite(state.htmlBackground), `html canvas ${state.htmlBackground}`).toBe(true);
  expect(isEffectiveWhite(state.bodyBackground), `body canvas ${state.bodyBackground}`).toBe(true);
}

export function expectReadableDarkForeground(state: Awaited<ReturnType<typeof readIncidentState>>) {
  expect(isDarkReadable(state.bodyColor), `body color ${state.bodyColor}`).toBe(true);
}

export function expectInlineSvgsBounded(
  state: Awaited<ReturnType<typeof readIncidentState>>,
  maxPx = ICON_SAFETY_MAX_PX,
) {
  for (const svg of state.inlineSvgs) {
    expect(svg.width, `${svg.category} width`).toBeLessThanOrEqual(maxPx + 1);
    expect(svg.height, `${svg.category} height`).toBeLessThanOrEqual(maxPx + 1);
  }
}

export function expectSafeDegradedState(state: Awaited<ReturnType<typeof readIncidentState>>) {
  expect(state.sentinel).not.toBe('1');
  expectEffectiveWhiteCanvas(state);
  expectReadableDarkForeground(state);
  expect(state.listStyle).toBe('none');
  expect(state.linkDecoration).toBe('none');
  expect(state.skipTop ?? 0).toBeLessThan(0);
  expect(state.scrollWidth).toBeLessThanOrEqual(state.viewportWidth + 1);
  expect(state.inertPanelVisible).toBe(false);
  expectInlineSvgsBounded(state);
}

export function expectReleaseStylesheetApplied(state: Awaited<ReturnType<typeof readIncidentState>>) {
  expect(state.sentinel).toBe('1');
  expectEffectiveWhiteCanvas(state);
  expectReadableDarkForeground(state);
  expect(state.listStyle).toBe('none');
  expect(state.linkDecoration).toBe('none');
  expect(state.skipTop ?? 0).toBeLessThan(0);
  expect(Number.parseFloat(state.h1FontSize ?? '0')).toBeGreaterThan(20);
  expect(Number(state.h1FontWeight ?? '0')).toBeGreaterThanOrEqual(700);
  expect(state.mastheadPosition).toBe('sticky');
  expect(state.scrollWidth).toBeLessThanOrEqual(state.viewportWidth + 1);
}

export function expectNormalIconGeometry(state: Awaited<ReturnType<typeof readIncidentState>>) {
  const capabilityIcons = state.inlineSvgs.filter((svg) => svg.category === 'capability-icon');
  expect(capabilityIcons.length).toBeGreaterThan(0);
  for (const icon of capabilityIcons) {
    expect(icon.width, `${icon.category} width`).toBeGreaterThan(10);
    expect(icon.width, `${icon.category} width`).toBeLessThanOrEqual(NORMAL_ICON_MARK_MAX_PX);
  }

  const mastheadIcons = state.inlineSvgs.filter((svg) => svg.category === 'masthead');
  expect(mastheadIcons.some((icon) => icon.width > 10)).toBe(true);
  for (const icon of mastheadIcons) {
    expect(icon.width, `${icon.category} width`).toBeLessThanOrEqual(NORMAL_ICON_MARK_MAX_PX);
  }

  const arrow = state.inlineSvgs.find((svg) => svg.category === 'action-arrow');
  if (arrow) {
    expect(arrow.width).toBeGreaterThan(10);
    expect(arrow.width).toBeLessThanOrEqual(NORMAL_ICON_MARK_MAX_PX);
  }
}

export function expectIncidentSignatureAbsent(state: Awaited<ReturnType<typeof readIncidentState>>) {
  expect(isEffectiveWhite(state.htmlBackground)).toBe(true);
  expect(isEffectiveWhite(state.bodyBackground)).toBe(true);
  expect(state.linkDecoration).toBe('none');
  expect(state.listStyle).toBe('none');
  expect(state.skipTop ?? 0).toBeLessThan(0);
  expect(state.inertPanelVisible).toBe(false);
  expect(state.scrollWidth).toBeLessThanOrEqual(state.viewportWidth + 1);

  const globe = state.inlineSvgs.find((svg) => svg.category === 'locale-globe');
  const arrow = state.inlineSvgs.find((svg) => svg.category === 'action-arrow');
  const capability = state.inlineSvgs.find((svg) => svg.category === 'capability-icon');
  if (globe) {
    expect(globe.width).toBeLessThanOrEqual(ICON_SAFETY_MAX_PX + 1);
  }
  if (arrow) {
    expect(arrow.width).toBeLessThanOrEqual(ICON_SAFETY_MAX_PX + 1);
  }
  if (capability) {
    expect(capability.width).toBeLessThanOrEqual(ICON_SAFETY_MAX_PX + 1);
  }
  expectInlineSvgsBounded(state);
}

export async function blockStylesheetDelivery(
  page: Page,
  assets: Awaited<ReturnType<typeof readDistRuntimeAssets>>,
  mode: 'primary-only' | 'all',
) {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === assets.css.replace(/^\//, '') || url.pathname === assets.cssHref.slice(1)) {
      return route.abort();
    }
    if (mode === 'all' && url.pathname === 'styles.css') {
      return route.abort();
    }
    return route.continue();
  });
}

/** @deprecated use readIncidentState */
export async function readStylesheetApplication(page: Page) {
  return readIncidentState(page);
}

/** @deprecated use expectReleaseStylesheetApplied(state) */
export function expectLightTheme(state: Awaited<ReturnType<typeof readIncidentState>>) {
  expectEffectiveWhiteCanvas(state);
  expectReadableDarkForeground(state);
}
