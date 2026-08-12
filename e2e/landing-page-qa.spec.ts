/**
 * Visual and behavioural QA for the public marketing site (landingpage/).
 *
 * Runs against the built static output served on 127.0.0.1:4321:
 *   node landingpage/tools/build-site.mjs
 *   (cd landingpage/dist && python3 -m http.server 4321 --bind 127.0.0.1)
 *
 * Run: npx playwright test --config playwright.landing-qa.config.ts
 */
import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'qa');

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];

/** Every section the brief requires, in page order. */
const SECTION_IDS = [
  'platform',
  'vehicle-intelligence',
  'ai-orchestration',
  'workflow-automation',
  'communication',
  'integrations',
  'contact',
];

const PLATFORM_NAV = {
  de: {
    trigger: 'Plattform',
    mainLabel: 'Hauptnavigation',
    overview: 'Plattform-Überblick',
    links: [
      { label: 'Plattform-Überblick', href: '#platform' },
      { label: 'Vernetzte Fahrzeugintelligenz', href: '#vehicle-intelligence' },
      { label: 'KI-Orchestrierung', href: '#ai-orchestration' },
      { label: 'Workflow-Automatisierung', href: '#workflow-automation' },
      { label: 'Kundenkommunikation', href: '#communication' },
      { label: 'Integrationen & Erweiterung', href: '#integrations' },
    ],
    deferred: ['Lösungen', 'Ressourcen', 'Preise'],
    login: 'Anmelden',
    demo: 'Demo anfragen',
  },
  en: {
    trigger: 'Platform',
    mainLabel: 'Main navigation',
    overview: 'Platform Overview',
    links: [
      { label: 'Platform Overview', href: '#platform' },
      { label: 'Connected Vehicle Intelligence', href: '#vehicle-intelligence' },
      { label: 'AI Orchestration', href: '#ai-orchestration' },
      { label: 'Workflow Automation', href: '#workflow-automation' },
      { label: 'Customer Communication', href: '#communication' },
      { label: 'Integrations & Extension', href: '#integrations' },
    ],
    deferred: ['Solutions', 'Resources', 'Pricing'],
    login: 'Log in',
    demo: 'Book a demo',
  },
} as const;

const DESKTOP_HEADER_WIDTHS = [1100, 1280, 1366, 1440, 1920];

const NAV_SCREENSHOT_WIDTHS = [1100, 1280, 1440, 1920] as const;

const MOBILE_NAV = {
  de: {
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    platformCategory: 'Plattform',
    accountLabel: 'Konto',
    languageLabel: 'Sprache',
    localeName: 'Deutsch',
    otherLocaleName: 'English',
    otherDir: '/en/',
  },
  en: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    platformCategory: 'Platform',
    accountLabel: 'Account',
    languageLabel: 'Language',
    localeName: 'English',
    otherLocaleName: 'Deutsch',
    otherDir: '/',
  },
} as const;

const MOBILE_PORTRAIT_SHOTS = [
  [320, 700],
  [375, 812],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 1366],
] as const;

const MOBILE_LANDSCAPE_SHOTS = [
  [844, 390],
  [932, 430],
] as const;

const MOBILE_BREAKPOINT_WIDTHS = [320, 360, 375, 390, 393, 414, 430, 480, 600, 768, 820, 900, 960, 1024, 1100];

async function collectProblems(page: Page) {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) =>
    failedRequests.push(`${request.url()} ${request.failure()?.errorText ?? ''}`),
  );
  page.on('response', (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
  });

  return { consoleErrors, failedRequests };
}

/**
 * Scrolls the whole page so every reveal observer and every lazy image fires,
 * then returns to the top. The scroll must be instant: the page sets
 * `scroll-behavior: smooth`, and animated jumps would lag far behind the loop,
 * leaving the lower sections at their pre-reveal opacity.
 */
async function settle(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  // Reveal transitions run 620ms plus up to 240ms of stagger delay.
  await page.waitForTimeout(1100);
}

/** Set LANDING_QA_LABEL so an acceptance run does not overwrite the local set. */
const LABEL = process.env.LANDING_QA_LABEL ? `${process.env.LANDING_QA_LABEL}-` : '';

/**
 * Every image has to be decoded before the shutter, not merely requested. A fixed
 * settle delay is enough on localhost but not against a deployed origin, where a
 * lazy image can still be in flight and would be captured as an empty frame,
 * making the screenshot look like a broken page when the page is fine.
 */
async function waitForImagery(page: Page) {
  await expect
    .poll(
      () =>
        page.$$eval('img', (imgs) =>
          imgs.filter((i) => !i.complete || i.naturalWidth === 0).length,
        ),
      { timeout: 20_000, message: 'images still decoding at screenshot time' },
    )
    .toBe(0);
}

async function shootHeader(page: Page, name: string) {
  await fs.mkdir(OUT, { recursive: true });
  const header = page.locator('.masthead');
  await expect(header).toBeVisible();
  await header.screenshot({
    path: path.join(OUT, `${LABEL}${name}.png`),
    animations: 'disabled',
  });
}

async function shoot(page: Page, name: string) {
  await fs.mkdir(OUT, { recursive: true });
  await waitForImagery(page);
  await page.screenshot({
    path: path.join(OUT, `${LABEL}${name}.png`),
    fullPage: true,
    animations: 'disabled',
  });
}

test.describe('public landing page', () => {
  for (const locale of ['de', 'en'] as const) {
    const url = locale === 'de' ? '/' : '/en/';

    test(`${locale}: structure, links and metadata`, async ({ page }) => {
      const { consoleErrors, failedRequests } = await collectProblems(page);
      await page.goto(url, { waitUntil: 'load' });

      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://synqdrive.eu${url}`,
      );
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        /SynqDrive/,
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        'content',
        'summary_large_image',
      );
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);

      // Exactly one h1, and every required section present.
      await expect(page.locator('h1')).toHaveCount(1);
      for (const id of SECTION_IDS) {
        await expect(page.locator(`#${id}`)).toHaveCount(1);
      }

      // No heading level is skipped.
      const levels = await page.$$eval('h1, h2, h3', (nodes) =>
        nodes.map((node) => Number(node.tagName.slice(1))),
      );
      let previous = 0;
      for (const level of levels) {
        expect(level - previous).toBeLessThanOrEqual(1);
        previous = Math.max(previous, level);
      }

      // Every image has non-empty alt text and intrinsic dimensions, and every
      // eager image (the hero, the logos) has already decoded at load.
      const images = await page.$$eval('img', (nodes) =>
        nodes.map((node) => ({
          alt: node.getAttribute('alt'),
          width: node.getAttribute('width'),
          height: node.getAttribute('height'),
          lazy: node.getAttribute('loading') === 'lazy',
          loaded: (node as HTMLImageElement).naturalWidth > 0,
          src: node.getAttribute('src'),
        })),
      );
      expect(images.length).toBeGreaterThan(0);
      for (const image of images) {
        expect(image.alt, `alt for ${image.src}`).toBeTruthy();
        expect(image.width, `width for ${image.src}`).toBeTruthy();
        expect(image.height, `height for ${image.src}`).toBeTruthy();
        if (!image.lazy) expect(image.loaded, `eager image loaded: ${image.src}`).toBe(true);
      }

      // Internal anchors must resolve, external targets must be the known hosts.
      const hrefs = await page.$$eval('a[href]', (nodes) =>
        nodes.map((node) => node.getAttribute('href') as string),
      );
      for (const href of hrefs) {
        if (href.startsWith('#')) {
          await expect(page.locator(href), `anchor ${href}`).toHaveCount(1);
        } else if (href.startsWith('http')) {
          expect(href, `external ${href}`).toMatch(/^https:\/\/app\.synqdrive\.eu/);
        } else if (!href.startsWith('mailto:')) {
          expect(['/', '/en/'], `relative ${href}`).toContain(href);
        }
      }

      // Demo call to action reaches a real contact channel.
      const demo = page.locator('a[href^="mailto:info@synqdrive.eu"]').first();
      await expect(demo).toHaveCount(1);

      // No em dash or en dash anywhere in rendered text.
      const dashes = await page.evaluate(() => {
        const text = document.body.innerText;
        return (text.match(/[\u2014\u2013]/g) ?? []).length;
      });
      expect(dashes).toBe(0);

      await settle(page);

      // Scrolling the whole page has triggered every lazy image, so all of them
      // resolve to a real file rather than a 404.
      await expect
        .poll(
          () =>
            page.$$eval('img', (nodes) =>
              nodes
                .filter((node) => (node as HTMLImageElement).naturalWidth === 0)
                .map((node) => node.getAttribute('src') as string),
            ),
          { timeout: 10_000 },
        )
        .toEqual([]);

      // Nothing may still be sitting at its pre-reveal opacity once the page has
      // been scrolled end to end, otherwise a section renders blank.
      const unrevealed = await page.$$eval('[data-reveal]', (nodes) =>
        nodes
          .filter((node) => Number(window.getComputedStyle(node).opacity) < 0.99)
          .map(
            (node) =>
              `${node.closest('section')?.id ?? 'hero'} ${node.tagName.toLowerCase()}.${node.className}`,
          ),
      );
      expect(unrevealed, unrevealed.join('\n')).toEqual([]);

      expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
      expect(failedRequests, failedRequests.join('\n')).toEqual([]);
    });

    test(`${locale}: no horizontal overflow across breakpoints`, async ({ page }) => {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          offenders: Array.prototype.slice
            .call(document.querySelectorAll('body *'))
            .filter((node) => {
              const rect = (node as HTMLElement).getBoundingClientRect();
              return rect.right > document.documentElement.clientWidth + 1 && rect.width > 0;
            })
            .slice(0, 5)
            .map((node) => {
              const el = node as HTMLElement;
              return `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 90);
            }),
        }));

        expect(
          overflow.scrollWidth,
          `${width}px overflow, offenders: ${overflow.offenders.join(' | ')}`,
        ).toBeLessThanOrEqual(overflow.clientWidth + 1);
      }
    });

    test(`${locale}: touch targets are large enough on mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(url, { waitUntil: 'load' });
      await settle(page);

      const small = await page.$$eval('a, button', (nodes) =>
        nodes
          .filter((node) => {
            const rect = node.getBoundingClientRect();
            const style = window.getComputedStyle(node);
            if (style.display === 'none' || style.visibility === 'hidden') return false;
            return rect.width > 0 && rect.height > 0 && rect.height < 32;
          })
          .map((node) => `${node.tagName.toLowerCase()}.${node.className}: ${Math.round(node.getBoundingClientRect().height)}px`),
      );
      expect(small, small.join('\n')).toEqual([]);
    });
  }

  for (const locale of ['de', 'en'] as const) {
    const spec = PLATFORM_NAV[locale];
    const url = locale === 'de' ? '/' : '/en/';

    test(`platform dropdown keyboard tab order (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url, { waitUntil: 'load' });

      const trigger = page.getByRole('button', { name: spec.trigger });
      const menu = page.locator('#platform-menu');

      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(menu).toHaveAttribute('inert', '');

      await trigger.focus();
      await page.keyboard.press('Tab');

      const afterClosedTab = await page.evaluate(() => {
        const active = document.activeElement as HTMLElement | null;
        return {
          inPanel: Boolean(active?.closest('#platform-menu')),
          className: active?.className ?? '',
        };
      });
      expect(afterClosedTab.inPanel).toBe(false);
      expect(afterClosedTab.className).toMatch(/locale-switch/);

      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(menu).not.toHaveAttribute('inert');

      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveClass(/nav-panel__overview/);

      const panelLinkCount = await menu.locator('a').count();
      for (let index = 1; index < panelLinkCount; index += 1) {
        await page.keyboard.press('Tab');
        await expect(page.locator(':focus')).toHaveAttribute('href', /.+/);
        expect(await page.evaluate(() => Boolean(document.activeElement?.closest('#platform-menu')))).toBe(
          true,
        );
      }

      await page.keyboard.press('Tab');
      const afterPanelTab = await page.evaluate(() => {
        const active = document.activeElement as HTMLElement | null;
        return {
          inPanel: Boolean(active?.closest('#platform-menu')),
          className: active?.className ?? '',
        };
      });
      expect(afterPanelTab.inPanel).toBe(false);
      expect(afterPanelTab.className).toMatch(/locale-switch/);

      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(menu).toHaveAttribute('inert', '');
      await expect(trigger).toBeFocused();
    });
  }

  test('platform dropdown works by pointer and keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    const trigger = page.getByRole('button', { name: 'Plattform' });
    const menu = page.locator('#platform-menu');
    const menuItem = page.getByRole('link', { name: 'Vernetzte Fahrzeugintelligenz' }).first();

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();
    await expect(menuItem).toBeVisible();

    const triggerBox = await trigger.boundingBox();
    const itemBox = await menuItem.boundingBox();
    expect(triggerBox).toBeTruthy();
    expect(itemBox).toBeTruthy();
    await page.mouse.move(triggerBox!.x + triggerBox!.width / 2, triggerBox!.y + triggerBox!.height / 2);
    await page.mouse.move(itemBox!.x + 8, itemBox!.y + 8, { steps: 12 });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(menuItem).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await menuItem.click();
    await expect(page).toHaveURL(/#vehicle-intelligence$/);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  for (const locale of ['de', 'en'] as const) {
    const spec = PLATFORM_NAV[locale];
    const url = locale === 'de' ? '/' : '/en/';

    test(`desktop navigation policy (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url, { waitUntil: 'load' });

      const mainnav = page.locator('.mainnav');
      await expect(mainnav).toHaveAttribute('aria-label', spec.mainLabel);
      await expect(page.getByRole('button', { name: spec.trigger })).toBeVisible();
      await expect(mainnav.getByRole('link', { name: /Kontakt|Contact/i })).toHaveCount(0);

      for (const deferred of spec.deferred) {
        await expect(mainnav.getByRole('link', { name: deferred })).toHaveCount(0);
        await expect(mainnav.getByRole('button', { name: deferred })).toHaveCount(0);
      }

      const trigger = page.getByRole('button', { name: spec.trigger });
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await expect(page.locator('.nav-panel__overview[href="#platform"]')).toHaveCount(1);
      await expect(page.locator('.nav-panel__footer-link[href="#platform"]')).toHaveCount(1);

      for (const link of spec.links.filter((entry) => entry.href !== '#platform')) {
        const anchor = page.locator(`.nav-panel__link[href="${link.href}"]`);
        await expect(anchor, link.label).toHaveCount(1);
        await expect(page.locator(link.href)).toHaveCount(1);
      }

      await page.mouse.click(8, 8);
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await expect(page.locator('.masthead__login')).toHaveAttribute('href', 'https://app.synqdrive.eu');
      await expect(page.locator('.masthead__actions .action--primary')).toHaveAttribute(
        'href',
        /^mailto:info@synqdrive\.eu/,
      );
      await expect(page.getByRole('link', { name: spec.demo }).first()).toHaveAttribute(
        'href',
        /^mailto:info@synqdrive\.eu/,
      );
    });

    test(`desktop header has no overflow (${locale})`, async ({ page }) => {
      for (const width of DESKTOP_HEADER_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(url, { waitUntil: 'load' });

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        expect(overflow.scrollWidth, `${width}px`).toBeLessThanOrEqual(overflow.clientWidth + 1);
      }
    });
  }

  test('mobile drawer opens, navigates and closes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });

    const toggle = page.locator('[data-nav-toggle]');
    const panel = page.locator('[data-nav-panel]');
    await expect(toggle).toBeVisible();
    await expect(panel).toBeHidden();
    await expect(panel).toHaveAttribute('inert', '');

    await toggle.click();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute('role', 'dialog');
    await expect(panel).toHaveAttribute('aria-modal', 'true');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-label', 'Menü schließen');

    await panel.getByRole('link', { name: 'Integrationen & Erweiterung' }).click();
    await expect(panel).toBeHidden();
    await expect(page).toHaveURL(/#integrations$/);
  });

  for (const locale of ['de', 'en'] as const) {
    const spec = PLATFORM_NAV[locale];
    const mobile = MOBILE_NAV[locale];
    const url = locale === 'de' ? '/' : '/en/';

    test(`mobile navigation policy (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(url, { waitUntil: 'load' });

      const panel = page.locator('[data-nav-panel]');
      const toggle = page.getByRole('button', { name: mobile.openMenu });

      await expect(page.locator('.mainnav')).toBeHidden();
      await expect(toggle).toBeVisible();
      await expect(panel).toBeHidden();

      await toggle.click();
      await expect(panel.getByText(mobile.platformCategory, { exact: true })).toBeVisible();
      await expect(panel.getByRole('link', { name: spec.login })).toHaveAttribute(
        'href',
        'https://app.synqdrive.eu',
      );
      await expect(panel.getByRole('link', { name: spec.demo })).toHaveAttribute(
        'href',
        /^mailto:info@synqdrive\.eu/,
      );
      await expect(panel.getByText(mobile.localeName)).toHaveAttribute('aria-current', 'true');
      await expect(panel.getByRole('link', { name: mobile.otherLocaleName })).toHaveAttribute(
        'href',
        mobile.otherDir,
      );

      for (const deferred of spec.deferred) {
        await expect(panel.getByRole('link', { name: deferred })).toHaveCount(0);
        await expect(panel.getByRole('button', { name: deferred })).toHaveCount(0);
      }

      for (const link of spec.links) {
        await expect(panel.getByRole('link', { name: link.label })).toHaveCount(1);
      }

      await page.keyboard.press('Escape');
      await expect(toggle).toBeFocused();
      await expect(panel).toBeHidden();
    });

    test(`mobile navigation keyboard (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(url, { waitUntil: 'load' });

      const toggle = page.locator('[data-nav-toggle]');
      const panel = page.locator('[data-nav-panel]');

      await toggle.focus();
      await page.keyboard.press('Tab');
      const closedTab = await page.evaluate(() => ({
        inPanel: Boolean(document.activeElement?.closest('[data-nav-panel]')),
      }));
      expect(closedTab.inPanel).toBe(false);

      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(panel).toBeVisible();
      await expect(panel).not.toHaveAttribute('inert');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(toggle).toHaveAttribute('aria-label', mobile.closeMenu);
      await expect(page.locator(':focus')).toHaveClass(/mobilenav__link/);

      const focusables = panel.locator('a[href]');
      const focusableCount = await focusables.count();
      for (let index = 1; index < focusableCount; index += 1) {
        await page.keyboard.press('Tab');
        expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-nav-panel]')))).toBe(
          true,
        );
      }

      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveClass(/mobilenav__link/);

      await page.keyboard.press('Escape');
      await expect(panel).toBeHidden();
      await expect(panel).toHaveAttribute('inert', '');
      await expect(toggle).toBeFocused();
    });
  }

  test('mobile navigation locks background scroll and preserves position', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(100);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(400);

    const toggle = page.locator('[data-nav-toggle]');
    await toggle.click();
    await expect(page.locator('[data-nav-panel]')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-nav-scroll-lock', 'true');
    await expect(page.locator('#main')).toHaveAttribute('inert', '');

    const lockedScroll = await page.evaluate(() => {
      const top = document.body.style.top;
      return top ? Math.abs(parseInt(top, 10)) : window.scrollY;
    });
    expect(lockedScroll).toBeGreaterThan(400);

    const locked = await page.evaluate(() => ({
      scrollY: window.scrollY,
      bodyTop: document.body.style.top,
    }));
    expect(locked.scrollY).toBe(0);
    expect(locked.bodyTop).toMatch(/^-/);

    await page.mouse.wheel(0, 500);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-nav-panel]')).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-nav-scroll-lock');
    await expect
      .poll(() => page.evaluate((expected) => Math.abs(window.scrollY - expected), lockedScroll), {
        timeout: 3000,
      })
      .toBeLessThanOrEqual(24);
  });

  test('mobile navigation works with reduced motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });

    const toggle = page.getByRole('button', { name: 'Menü öffnen' });
    await toggle.click();
    await expect(page.locator('[data-nav-panel]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(page.locator('[data-nav-panel]')).toBeHidden();
  });

  test('mobile/desktop navigation breakpoint transition', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('[data-nav-toggle]')).toBeVisible();
    await expect(page.locator('.mainnav')).toBeHidden();

    await page.setViewportSize({ width: 1100, height: 900 });
    await expect(page.locator('[data-nav-toggle]')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Plattform' })).toBeVisible();

    for (const width of MOBILE_BREAKPOINT_WIDTHS) {
      await page.setViewportSize({ width, height: 844 });
      const state = await page.evaluate(() => ({
        toggleVisible: Boolean(
          document.querySelector('[data-nav-toggle]') &&
            window.getComputedStyle(document.querySelector('[data-nav-toggle]') as Element).display !== 'none',
        ),
        mainnavVisible: Boolean(
          document.querySelector('.mainnav') &&
            window.getComputedStyle(document.querySelector('.mainnav') as Element).display !== 'none',
        ),
      }));
      if (width <= 1024) {
        expect(state.toggleVisible, `${width}px`).toBe(true);
        expect(state.mainnavVisible, `${width}px`).toBe(false);
      } else {
        expect(state.toggleVisible, `${width}px`).toBe(false);
        expect(state.mainnavVisible, `${width}px`).toBe(true);
      }
    }
  });

  test('captures P1.4 mobile navigation screenshots', async ({ page }) => {
    for (const [width, height] of MOBILE_PORTRAIT_SHOTS) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await shootHeader(page, `p14-nav-${width}-closed`);

      await page.getByRole('button', { name: 'Menü öffnen' }).click();
      await expect(page.locator('[data-nav-panel]')).toBeVisible();
      await page.locator('[data-nav-panel]').screenshot({
        path: path.join(OUT, `${LABEL}p14-nav-${width}-open-panel.png`),
        animations: 'disabled',
      });
      await page.keyboard.press('Escape');
    }

    for (const [width, height] of MOBILE_LANDSCAPE_SHOTS) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await page.getByRole('button', { name: 'Menü öffnen' }).click();
      await expect(page.locator('[data-nav-panel]')).toBeVisible();
      await page.locator('[data-nav-panel]').screenshot({
        path: path.join(OUT, `${LABEL}p14-nav-${width}x${height}-landscape-open.png`),
        animations: 'disabled',
      });
      await page.keyboard.press('Escape');
    }
  });

  test('language switch moves between locales', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.locator('.locale-switch').click();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.locator('.locale-switch').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });

  test('layout stays stable while images load', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'commit' });

    const shift = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as unknown as Array<{
              value: number;
              hadRecentInput: boolean;
            }>) {
              if (!entry.hadRecentInput) total += entry.value;
            }
          }).observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => resolve(total), 3500);
        }),
    );

    expect(shift).toBeLessThan(0.1);
  });

  test('captures P1.3 desktop navigation screenshots', async ({ page }) => {
    for (const width of NAV_SCREENSHOT_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await shootHeader(page, `p13-nav-${width}-de-closed`);

      await page.getByRole('button', { name: 'Plattform' }).click();
      await expect(page.locator('#platform-menu')).toBeVisible();
      await shootHeader(page, `p13-nav-${width}-de-open`);
      await page.keyboard.press('Escape');
    }
  });

  test('captures reference screenshots', async ({ page }) => {
    for (const [name, width, height] of [
      ['desktop-1440-de', 1440, 900],
      ['mobile-390-de', 390, 844],
    ] as Array<[string, number, number]>) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);
      await shoot(page, name);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/en/', { waitUntil: 'load' });
    await settle(page);
    await shoot(page, 'desktop-1440-en');
  });
});
