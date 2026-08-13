import fs from 'node:fs/promises';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');

export async function readDistRuntimeAssets() {
  const entries = await fs.readdir(DIST);
  const css = entries.find((name) => /^styles\.[a-f0-9]{12}\.css$/.test(name));
  const js = entries.find((name) => /^script\.[a-f0-9]{12}\.js$/.test(name));
  if (!css || !js) {
    throw new Error('Fingerprinted runtime assets missing from dist/ — run npm run build');
  }
  return { css, js, cssHref: `/${css}`, jsHref: `/${js}` };
}

export async function readStylesheetApplication(page: Page) {
  return page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const body = getComputedStyle(document.body);
    const skip = document.querySelector('.skip-link');
    const skipRect = skip?.getBoundingClientRect();
    const list = document.querySelector('ul');
    const link = document.querySelector('main a');
    const h1 = document.querySelector('h1');
    const masthead = document.querySelector('.masthead');
    const mastheadStyles = masthead ? getComputedStyle(masthead) : null;
    const icon = document.querySelector('.icon-mark');
    const iconRect = icon?.getBoundingClientRect();
    const hubCore = document.querySelector('#integrations .hub__core');
    const hubCoreRect = hubCore?.getBoundingClientRect();
    const frame = document.querySelector('.frame--product');
    const frameRect = frame?.getBoundingClientRect();

    return {
      sentinel: root.getPropertyValue('--synqdrive-release-css').trim(),
      bodyBackground: body.backgroundColor,
      bodyColor: body.color,
      listStyle: list ? getComputedStyle(list).listStyleType : null,
      linkDecoration: link ? getComputedStyle(link).textDecorationLine : null,
      skipTop: skipRect?.top ?? null,
      h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
      h1FontWeight: h1 ? getComputedStyle(h1).fontWeight : null,
      mastheadPosition: mastheadStyles?.position ?? null,
      iconWidth: iconRect?.width ?? null,
      iconHeight: iconRect?.height ?? null,
      hubCoreWidth: hubCoreRect?.width ?? null,
      frameWidth: frameRect?.width ?? null,
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      pageHeight: document.documentElement.scrollHeight,
    };
  });
}

export function expectLightTheme(state: Awaited<ReturnType<typeof readStylesheetApplication>>) {
  expect(state.bodyBackground).toMatch(/rgb\(255,\s*255,\s*255\)|rgba\(0,\s*0,\s*0,\s*0\)/);
  expect(['rgb(17, 24, 39)', 'rgb(17,24,39)']).toContain(state.bodyColor.replace(/\s/g, ''));
}

export function expectSafeDegradedState(state: Awaited<ReturnType<typeof readStylesheetApplication>>) {
  expect(state.bodyBackground).toMatch(/rgb\(255,\s*255,\s*255\)/);
  expect(state.bodyColor).toMatch(/rgb\(17,\s*24,\s*39\)/);
  expect(state.listStyle).toBe('none');
  expect(state.linkDecoration).toBe('none');
  expect(state.skipTop ?? 0).toBeLessThan(0);
  expect(state.scrollWidth).toBeLessThanOrEqual(state.viewportWidth + 1);
}

export function expectReleaseStylesheetApplied(state: Awaited<ReturnType<typeof readStylesheetApplication>>) {
  expect(state.sentinel).toBe('1');
  expectLightTheme(state);
  expect(state.listStyle).toBe('none');
  expect(state.linkDecoration).toBe('none');
  expect(state.skipTop ?? 0).toBeLessThan(0);
  expect(Number.parseFloat(state.h1FontSize ?? '0')).toBeGreaterThan(20);
  expect(Number(state.h1FontWeight ?? '0')).toBeGreaterThanOrEqual(700);
  expect(state.mastheadPosition).toBe('sticky');
  expect(state.iconWidth ?? 0).toBeLessThanOrEqual(48);
  expect(state.iconHeight ?? 0).toBeLessThanOrEqual(48);
  expect(state.scrollWidth).toBeLessThanOrEqual(state.viewportWidth + 1);
}
