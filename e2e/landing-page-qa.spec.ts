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

const MOBILE_BREAKPOINT_EDGE = [1024, 1025, 1040, 1060, 1080, 1099, 1100] as const;

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
    await expect(panel).toHaveAttribute('aria-labelledby', 'mobile-nav-title');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.masthead__inner')).toHaveAttribute('inert', '');

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
      await expect(panel.getByRole('button', { name: mobile.closeMenu })).toBeVisible();
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
      const close = panel.locator('[data-nav-close]');

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
      await expect(page.locator(':focus')).toHaveClass(/mobilenav__link/);

      await page.keyboard.press('Shift+Tab');
      await expect(close).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveClass(/mobilenav__link/);

      const focusables = panel.locator('a[href], button:not([disabled])');
      const focusableCount = await focusables.count();
      for (let index = 1; index < focusableCount; index += 1) {
        await page.keyboard.press('Tab');
        expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-nav-panel]')))).toBe(
          true,
        );
      }

      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveClass(/mobilenav__link|mobilenav__brand/);

      await close.focus();
      await page.keyboard.press('Enter');
      await expect(panel).toBeHidden();
      await expect(panel).toHaveAttribute('inert', '');
      await expect(toggle).toBeFocused();
    });
  }

  for (const locale of ['de', 'en'] as const) {
    const url = locale === 'de' ? '/#vehicle-intelligence' : '/en/#vehicle-intelligence';

    test(`mobile navigation preserves deep-link scroll (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(200);

      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(200);
      await expect(page.locator('[data-nav-panel]')).toBeHidden();
    });
  }

  test('mobile navigation landscape panel reachability', async ({ page }) => {
    for (const [width, height, loginLabel, demoLabel, localeLabel] of [
      [844, 390, 'Anmelden', 'Demo anfragen', 'English'],
      [932, 430, 'Anmelden', 'Demo anfragen', 'English'],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await page.getByRole('button', { name: 'Menü öffnen' }).click();

      const panel = page.locator('[data-nav-panel]');
      await expect(panel).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-nav-scroll-lock', 'true');

      const scrollEl = panel.locator('.mobilenav__scroll');
      await scrollEl.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });
      expect(await scrollEl.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);

      await expect(panel.getByRole('link', { name: loginLabel })).toBeVisible();
      await expect(panel.getByRole('link', { name: demoLabel })).toBeVisible();
      await expect(panel.getByRole('link', { name: localeLabel })).toBeVisible();
      await expect(panel.getByRole('button', { name: 'Menü schließen' })).toBeVisible();
      await expect(panel.getByRole('link', { name: loginLabel })).toBeInViewport();

      const pageScroll = await page.evaluate(() => window.scrollY);
      await page.mouse.wheel(0, 300);
      expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll);

      await panel.getByRole('button', { name: 'Menü schließen' }).click();
      await expect(panel).toBeHidden();
    }
  });

  test('mobile navigation touch targets when open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Menü öffnen' }).click();

    const small = await page.locator('[data-nav-panel]').evaluate((panel) =>
      Array.prototype.slice
        .call(panel.querySelectorAll('a, button'))
        .filter((node) => {
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.height < 44;
        })
        .map(
          (node) =>
            `${node.tagName.toLowerCase()}.${node.className}: ${Math.round(node.getBoundingClientRect().height)}px`,
        ),
    );
    expect(small, small.join('\n')).toEqual([]);
  });

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
    await expect(page.locator('.masthead__inner')).toHaveAttribute('inert', '');

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

  test('mobile navigation breakpoint edge transition', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });

    for (const width of MOBILE_BREAKPOINT_EDGE) {
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
        overflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      }));

      if (width <= 1024) {
        expect(state.toggleVisible, `${width}px toggle`).toBe(true);
        expect(state.mainnavVisible, `${width}px mainnav`).toBe(false);
      } else {
        expect(state.toggleVisible, `${width}px toggle`).toBe(false);
        expect(state.mainnavVisible, `${width}px mainnav`).toBe(true);
      }
      expect(state.overflow, `${width}px overflow`).toBe(true);
    }
  });

  test('mobile navigation closes cleanly on resize to desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(100);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(200);

    await page.locator('[data-nav-toggle]').click();
    await expect(page.locator('[data-nav-panel]')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-nav-scroll-lock', 'true');

    await page.setViewportSize({ width: 1100, height: 900 });
    await expect(page.locator('[data-nav-panel]')).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-nav-scroll-lock');
    await expect(page.locator('#main')).not.toHaveAttribute('inert');
    await expect(page.locator('.masthead__inner')).not.toHaveAttribute('inert');
    await expect(page.getByRole('button', { name: 'Plattform' })).toBeVisible();

    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 })
      .toBeGreaterThan(200);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-nav-toggle]').click();
    await expect(page.locator('[data-nav-panel]')).toBeVisible();
    await page.keyboard.press('Escape');
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

  test('captures P1.5 release candidate screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await shootHeader(page, 'p15-rc-1440-de-closed');
    await page.getByRole('button', { name: 'Plattform' }).click();
    await shootHeader(page, 'p15-rc-1440-de-platform-open');
    await page.keyboard.press('Escape');

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/', { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Plattform' }).click();
    await shootHeader(page, 'p15-rc-1920-de-platform-open');
    await page.keyboard.press('Escape');

    for (const [width, height, suffix] of [
      [390, 844, '390'],
      [430, 932, '430'],
      [320, 700, '320'],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await shootHeader(page, `p15-rc-${suffix}-de-closed`);
      await page.getByRole('button', { name: 'Menü öffnen' }).click();
      await page.locator('[data-nav-panel]').screenshot({
        path: path.join(OUT, `${LABEL}p15-rc-${suffix}-de-open.png`),
        animations: 'disabled',
      });
      await page.keyboard.press('Escape');
    }

    await page.setViewportSize({ width: 1024, height: 1366 });
    await page.goto('/', { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Menü öffnen' }).click();
    await page.locator('[data-nav-panel]').screenshot({
      path: path.join(OUT, `${LABEL}p15-rc-1024-de-open.png`),
      animations: 'disabled',
    });
    await page.keyboard.press('Escape');

    await page.setViewportSize({ width: 1100, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Plattform' }).click();
    await shootHeader(page, 'p15-rc-1100-de-platform-open');
    await page.keyboard.press('Escape');

    for (const [width, height, name] of [
      [844, 390, '844x390'],
      [932, 430, '932x430'],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await page.getByRole('button', { name: 'Menü öffnen' }).click();
      await page.locator('[data-nav-panel]').screenshot({
        path: path.join(OUT, `${LABEL}p15-rc-${name}-landscape-open.png`),
        animations: 'disabled',
      });
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

  const P22_LAYOUT_WIDTHS = [
    320, 360, 375, 390, 393, 414, 430, 480, 600, 768, 820, 1024,
  ] as const;
  const P22_FRAME_WIDTHS = [320, 390, 430, 760] as const;
  const P22_LANDSCAPE_SHOTS = [
    [667, 375],
    [844, 390],
    [932, 430],
  ] as const;
  const P22_DESKTOP_WIDTHS = [1100, 1280, 1440, 1920] as const;
  const P22_SECTION_Y_WIDTHS = [
    [320, 56],
    [390, 56],
    [760, 56],
    [768, 72],
    [820, 72],
    [1024, 72],
    [1100, 104],
    [1180, 104],
    [1280, 128],
    [1440, 128],
  ] as const;

  function expectedSectionY(width: number) {
    if (width <= 760) return 56;
    if (width <= 1024) return 72;
    if (width <= 1180) return 104;
    return 128;
  }

  async function readStackSpacing(page: Page) {
    return page.evaluate(() => {
      const platformIntro = document.querySelector('#platform .brief__intro');
      const platformGrid = document.querySelector('#platform .capability-grid');
      const platformMedia = document.querySelector('#platform .stack__media');
      const workflowHead = document.querySelector('#workflow-automation .section-head');
      const workflowChain = document.querySelector('#workflow-automation .chain');
      const workflowMedia = document.querySelector('#workflow-automation .stack__media');
      const platformMediaStyles = platformMedia ? getComputedStyle(platformMedia) : null;
      const workflowChainStyles = workflowChain ? getComputedStyle(workflowChain) : null;
      const workflowMediaStyles = workflowMedia ? getComputedStyle(workflowMedia) : null;

      const gap = (topEl: Element | null, bottomEl: Element | null) => {
        if (!topEl || !bottomEl) return null;
        const top = topEl.getBoundingClientRect().bottom;
        const bottom = bottomEl.getBoundingClientRect().top;
        return Math.round((bottom - top) * 10) / 10;
      };

      const platformHeadBottom = () => {
        if (!platformIntro || !platformMedia) return null;
        if (window.matchMedia('(min-width: 1025px)').matches && platformGrid) {
          return Math.max(
            platformIntro.getBoundingClientRect().bottom,
            platformGrid.getBoundingClientRect().bottom,
          );
        }
        return platformIntro.getBoundingClientRect().bottom;
      };

      const platformHeadToMedia = (() => {
        const bottom = platformHeadBottom();
        if (bottom === null || !platformMedia) return null;
        return Math.round((platformMedia.getBoundingClientRect().top - bottom) * 10) / 10;
      })();

      return {
        platformHeadToMedia,
        workflowHeadToChain: gap(workflowHead, workflowChain),
        workflowChainToMedia: gap(workflowChain, workflowMedia),
        platformMediaMarginTop: platformMediaStyles
          ? parseFloat(platformMediaStyles.marginTop)
          : null,
        workflowChainMarginTop: workflowChainStyles
          ? parseFloat(workflowChainStyles.marginTop)
          : null,
        workflowMediaMarginTop: workflowMediaStyles
          ? parseFloat(workflowMediaStyles.marginTop)
          : null,
      };
    });
  }

  for (const locale of ['de', 'en'] as const) {
    const url = locale === 'de' ? '/' : '/en/';

    test(`P2.2 mobile layout invariants (${locale})`, async ({ page }) => {
      for (const width of P22_LAYOUT_WIDTHS) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const layout = await page.evaluate(() => {
          const root = document.documentElement;
          const styles = getComputedStyle(root);
          const shell = document.querySelector('.hero');
          const shellStyles = shell ? getComputedStyle(shell) : null;
          const heroFrame = document.querySelector('.hero__media .frame--product');
          const heroFrameRect = heroFrame?.getBoundingClientRect();
          const primary = document.querySelector('.hero .action--primary');
          const primaryRect = primary?.getBoundingClientRect();
          const heroPicture = document.querySelector('.hero picture source[media]');
          return {
            scrollWidth: root.scrollWidth,
            clientWidth: root.clientWidth,
            gutterPx: shellStyles ? parseFloat(shellStyles.paddingInlineStart) : 0,
            sectionY: parseFloat(styles.getPropertyValue('--section-y')),
            typeDisplay: styles.getPropertyValue('--type-display').trim(),
            frameWidth: heroFrameRect?.width ?? 0,
            frameLeft: heroFrameRect?.left ?? 0,
            frameRight: heroFrameRect?.right ?? 0,
            primaryHeight: primaryRect?.height ?? 0,
            hasProductFrameClass: Boolean(document.querySelector('.frame--product')),
            hasLayoutSplit: Boolean(document.querySelector('.layout-split')),
            mobileSourceMedia: heroPicture?.getAttribute('media') ?? null,
          };
        });

        expect(layout.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(layout.clientWidth + 1);
        expect(layout.hasProductFrameClass, `${width}px frame--product`).toBe(true);
        expect(layout.hasLayoutSplit, `${width}px layout-split`).toBe(true);
        expect(layout.gutterPx, `${width}px gutter range`).toBeGreaterThanOrEqual(15);
        expect(layout.gutterPx, `${width}px gutter range`).toBeLessThanOrEqual(25);
        expect(layout.sectionY, `${width}px section-y token`).toBe(expectedSectionY(width));
        expect(layout.typeDisplay, `${width}px type-display token`).toBeTruthy();
        expect(layout.frameWidth, `${width}px product frame width`).toBeGreaterThan(0);
        expect(layout.frameLeft, `${width}px hero frame left`).toBeGreaterThanOrEqual(-1);
        expect(layout.frameRight, `${width}px hero frame right`).toBeLessThanOrEqual(width + 1);
        expect(layout.primaryHeight, `${width}px CTA height`).toBeGreaterThanOrEqual(44);

        if (width <= 760) {
          expect(layout.mobileSourceMedia, `${width}px hero mobile source`).toContain('760px');
          expect(layout.frameLeft, `${width}px hero bleed left`).toBeLessThanOrEqual(1);
          expect(layout.frameRight, `${width}px hero bleed right`).toBeGreaterThanOrEqual(width - 1);
        }
      }
    });
  }

  test('P2.2 product frame geometry', async ({ page }) => {
    for (const width of P22_FRAME_WIDTHS) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const geometry = await page.evaluate(() => {
        const heroFrame = document.querySelector('.hero__media .frame--product:not(.frame--flush)');
        const heroStyles = heroFrame ? getComputedStyle(heroFrame) : null;
        const heroRect = heroFrame?.getBoundingClientRect();
        const flushFrame = document.querySelector('.stage__media .frame--flush');
        const flushStyles = flushFrame ? getComputedStyle(flushFrame) : null;
        const flushRect = flushFrame?.getBoundingClientRect();
        const stageMedia = document.querySelector('.stage__media');
        const stageRect = stageMedia?.getBoundingClientRect();
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hero: {
            marginLeft: heroStyles ? parseFloat(heroStyles.marginLeft) : null,
            marginRight: heroStyles ? parseFloat(heroStyles.marginRight) : null,
            left: heroRect?.left ?? null,
            right: heroRect?.right ?? null,
            width: heroRect?.width ?? null,
          },
          flush: {
            marginLeft: flushStyles ? parseFloat(flushStyles.marginLeft) : null,
            marginRight: flushStyles ? parseFloat(flushStyles.marginRight) : null,
            left: flushRect?.left ?? null,
            right: flushRect?.right ?? null,
            width: flushRect?.width ?? null,
            stageLeft: stageRect?.left ?? null,
            stageRight: stageRect?.right ?? null,
          },
        };
      });

      expect(geometry.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(geometry.clientWidth + 1);
      expect(geometry.hero.marginLeft!, `${width}px hero margin-left`).toBeLessThan(0);
      expect(geometry.hero.marginRight!, `${width}px hero margin-right`).toBeLessThan(0);
      expect(geometry.hero.left!, `${width}px hero left edge`).toBeGreaterThanOrEqual(-1);
      expect(geometry.hero.right!, `${width}px hero right edge`).toBeLessThanOrEqual(width + 1);

      expect(geometry.flush.marginLeft!, `${width}px flush margin-left`).toBe(0);
      expect(geometry.flush.marginRight!, `${width}px flush margin-right`).toBe(0);
      expect(geometry.flush.left!, `${width}px flush left`).toBeGreaterThanOrEqual(
        geometry.flush.stageLeft! - 1,
      );
      expect(geometry.flush.right!, `${width}px flush right`).toBeLessThanOrEqual(
        geometry.flush.stageRight! + 1,
      );
      if (width <= 760) {
        expect(geometry.flush.width!, `${width}px flush width`).toBeLessThan(width);
      }
    }
  });

  test('P2.2 layout-stack spacing ownership', async ({ page }) => {
    for (const [width, height] of [
      [390, 844],
      [768, 1024],
      [1440, 900],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const spacing = await readStackSpacing(page);
      expect(spacing.platformMediaMarginTop, `${width}px platform media margin`).toBe(0);
      expect(spacing.platformHeadToMedia, `${width}px platform gap`).toBeGreaterThan(0);

      if (width <= 760) {
        expect(spacing.platformHeadToMedia!, `${width}px platform gap`).toBeGreaterThanOrEqual(24);
        expect(spacing.platformHeadToMedia!, `${width}px platform gap`).toBeLessThanOrEqual(36);
        expect(spacing.workflowHeadToChain!, `${width}px workflow head-chain`).toBeGreaterThanOrEqual(
          44,
        );
        expect(spacing.workflowHeadToChain!, `${width}px workflow head-chain`).toBeLessThanOrEqual(52);
        expect(
          spacing.workflowChainToMedia!,
          `${width}px workflow chain-media`,
        ).toBeGreaterThanOrEqual(24);
        expect(spacing.workflowChainToMedia!, `${width}px workflow chain-media`).toBeLessThanOrEqual(
          36,
        );
      } else if (width <= 1024) {
        expect(spacing.platformHeadToMedia!, `${width}px platform gap`).toBeGreaterThanOrEqual(28);
        expect(spacing.platformHeadToMedia!, `${width}px platform gap`).toBeLessThanOrEqual(36);
        expect(spacing.workflowHeadToChain!, `${width}px workflow head-chain`).toBeGreaterThanOrEqual(
          44,
        );
        expect(spacing.workflowHeadToChain!, `${width}px workflow head-chain`).toBeLessThanOrEqual(52);
        expect(
          spacing.workflowChainToMedia!,
          `${width}px workflow chain-media`,
        ).toBeGreaterThanOrEqual(28);
        expect(spacing.workflowChainToMedia!, `${width}px workflow chain-media`).toBeLessThanOrEqual(
          36,
        );
      } else {
        expect(spacing.platformHeadToMedia!, `${width}px platform gap`).toBeGreaterThanOrEqual(60);
        expect(spacing.platformHeadToMedia!, `${width}px platform gap`).toBeLessThanOrEqual(68);
        expect(spacing.workflowHeadToChain!, `${width}px workflow head-chain`).toBeGreaterThanOrEqual(
          46,
        );
        expect(spacing.workflowHeadToChain!, `${width}px workflow head-chain`).toBeLessThanOrEqual(50);
        expect(
          spacing.workflowChainToMedia!,
          `${width}px workflow chain-media`,
        ).toBeGreaterThanOrEqual(40);
        expect(spacing.workflowChainToMedia!, `${width}px workflow chain-media`).toBeLessThanOrEqual(
          48,
        );
      }
    }
  });

  test('P2.2 section-y token matrix', async ({ page }) => {
    for (const [width, expected] of P22_SECTION_Y_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      const sectionY = await page.evaluate(() =>
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--section-y')),
      );
      expect(sectionY, `${width}px section-y`).toBe(expected);
    }
  });

  test('P2.2 landscape content sanity', async ({ page }) => {
    for (const [width, height] of P22_LANDSCAPE_SHOTS) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await page.evaluate(() => {
        const heroFrame = document.querySelector('.hero__media .frame--product:not(.frame--flush)');
        const flushFrame = document.querySelector('.stage__media .frame--flush');
        const h1 = document.querySelector('.hero h1');
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          heroFrameWidth: heroFrame?.getBoundingClientRect().width ?? 0,
          flushContained:
            flushFrame && document.querySelector('.stage__media')
              ? flushFrame.getBoundingClientRect().right <=
                  document.querySelector('.stage__media')!.getBoundingClientRect().right + 1 &&
                flushFrame.getBoundingClientRect().left >=
                  document.querySelector('.stage__media')!.getBoundingClientRect().left - 1
              : false,
          h1FontSize: h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0,
        };
      });

      expect(state.scrollWidth, `${width}x${height} overflow`).toBeLessThanOrEqual(
        state.clientWidth + 1,
      );
      expect(state.heroFrameWidth, `${width}x${height} hero frame`).toBeGreaterThan(0);
      expect(state.flushContained, `${width}x${height} flush contained`).toBe(true);
      expect(state.h1FontSize, `${width}x${height} h1 size`).toBeGreaterThanOrEqual(16);

      await page.getByRole('button', { name: 'Menü öffnen' }).click();
      await expect(page.locator('[data-nav-panel]')).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('P2.2 desktop layout regression widths', async ({ page }) => {
    for (const width of P22_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });

      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        sectionY: parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--section-y'),
        ),
        gutter: getComputedStyle(document.documentElement).getPropertyValue('--gutter').trim(),
      }));

      expect(layout.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(layout.clientWidth + 1);
      expect(layout.sectionY, `${width}px desktop section-y`).toBe(expectedSectionY(width));
      expect(parseFloat(layout.gutter), `${width}px desktop gutter`).toBeGreaterThanOrEqual(22);
    }
  });

  test('captures P2.2 mobile layout screenshots', async ({ page }) => {
    const shots = [
      ['de', '/', 320, 700],
      ['de', '/', 375, 812],
      ['de', '/', 390, 844],
      ['de', '/', 430, 932],
      ['de', '/', 768, 1024],
      ['en', '/en/', 320, 700],
      ['en', '/en/', 390, 844],
      ['en', '/en/', 430, 932],
    ] as const;

    for (const [locale, url, width, height] of shots) {
      await page.setViewportSize({ width, height });
      await page.goto(url, { waitUntil: 'load' });
      await settle(page);
      await shoot(page, `p22-${locale}-${width}x${height}-full`);
    }

    for (const [locale, url, label] of [
      ['de', '/', 'de'],
      ['en', '/en/', 'en'],
    ] as const) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(url, { waitUntil: 'load' });
      await settle(page);
      await page.locator('.hero').screenshot({
        path: path.join(OUT, `${LABEL}p22-hero-${label}-390.png`),
        animations: 'disabled',
      });
      await page.locator('.frame--product').first().screenshot({
        path: path.join(OUT, `${LABEL}p22-frame-${label}-390.png`),
        animations: 'disabled',
      });
      await page.locator('#platform .capability-grid').screenshot({
        path: path.join(OUT, `${LABEL}p22-capabilities-${label}-390.png`),
        animations: 'disabled',
      });
      await page.locator('#vehicle-intelligence .stage__panel').screenshot({
        path: path.join(OUT, `${LABEL}p22-vehicle-${label}-390.png`),
        animations: 'disabled',
      });
      await page.locator('#workflow-automation').screenshot({
        path: path.join(OUT, `${LABEL}p22-workflow-${label}-390.png`),
        animations: 'disabled',
      });
    }

    for (const [width, height, suffix] of [
      [320, 700, 'vehicle-de-320'],
      [430, 932, 'vehicle-de-430'],
      [768, 1024, 'vehicle-de-768'],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);
      await page.locator('#vehicle-intelligence .stage__panel').screenshot({
        path: path.join(OUT, `${LABEL}p22-${suffix}.png`),
        animations: 'disabled',
      });
    }

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);
    await shoot(page, 'p22-tablet-de-768x1024');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);
    await shoot(page, 'p22-desktop-de-1440');
  });

  const P23_PHONE_WIDTHS = [320, 360, 375, 390, 393, 414, 430, 480] as const;
  const P23_TABLET_WIDTHS = [600, 768, 820, 1024] as const;
  const P23_DESKTOP_WIDTHS = [1100, 1280, 1440, 1920] as const;
  const P23_LANDSCAPE = [
    [667, 375],
    [844, 390],
    [932, 430],
  ] as const;

  async function readHeroComposition(page: Page) {
    return page.evaluate(() => {
      const hero = document.querySelector('.hero');
      const intro = document.querySelector('.hero__intro');
      const media = document.querySelector('.hero__media');
      const proof = document.querySelector('.hero__proof');
      const h1 = document.querySelector('.hero h1');
      const primary = document.querySelector('.hero .action--primary');
      const frame = document.querySelector('.hero__media .frame--product');
      const heroPicture = document.querySelector('.hero picture source[media]');
      const heroImg = document.querySelector('.hero__media img');

      const rect = (el: Element | null) => el?.getBoundingClientRect() ?? null;
      const heroRect = rect(hero);
      const frameRect = rect(frame);
      const proofRect = rect(proof);
      const mediaRect = rect(media);
      const primaryRect = rect(primary);

      const introBeforeMedia =
        !!intro &&
        !!media &&
        (intro.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      const mediaBeforeProof =
        !!media &&
        !!proof &&
        (media.compareDocumentPosition(proof) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

      const introRect = rect(intro);
      const introProofGap =
        introRect && proofRect
          ? Math.round((proofRect.top - introRect.bottom) * 10) / 10
          : null;

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        heroHeight: heroRect?.height ?? 0,
        h1Height: rect(h1)?.height ?? 0,
        ctaHeight: primaryRect?.height ?? 0,
        frameTop: frameRect?.top ?? 0,
        frameWidth: frameRect?.width ?? 0,
        frameLeft: frameRect?.left ?? 0,
        frameRight: frameRect?.right ?? 0,
        proofTop: proofRect?.top ?? 0,
        introBottom: introRect?.bottom ?? 0,
        introProofGap,
        mediaTop: mediaRect?.top ?? 0,
        frameBeforeProof: frameRect && proofRect ? frameRect.top < proofRect.top : false,
        introBeforeMedia,
        mediaBeforeProof,
        primaryVisible: primaryRect ? primaryRect.height >= 44 && primaryRect.width > 0 : false,
        h1Visible: !!h1 && (rect(h1)?.height ?? 0) > 0,
        mobileSourceMedia: heroPicture?.getAttribute('media') ?? null,
        heroImgLoading: heroImg?.getAttribute('loading') ?? null,
        heroImgFetchPriority: heroImg?.getAttribute('fetchpriority') ?? null,
        desktopMediaColumn:
          !!media &&
          !!intro &&
          !!proof &&
          window.matchMedia('(min-width: 1025px)').matches
            ? media.getBoundingClientRect().left > intro.getBoundingClientRect().right - 8
            : null,
      };
    });
  }

  for (const locale of ['de', 'en'] as const) {
    const url = locale === 'de' ? '/' : '/en/';

    test(`P2.3 hero mobile composition invariants (${locale})`, async ({ page }) => {
      for (const width of P23_PHONE_WIDTHS) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const state = await readHeroComposition(page);

        expect(state.scrollWidth, `${width}px hero overflow`).toBeLessThanOrEqual(
          state.clientWidth + 1,
        );
        expect(state.h1Visible, `${width}px hero h1`).toBe(true);
        expect(state.primaryVisible, `${width}px hero primary CTA`).toBe(true);
        expect(state.frameWidth, `${width}px hero frame width`).toBeGreaterThan(0);
        expect(state.frameBeforeProof, `${width}px product before proof`).toBe(true);
        expect(state.introBeforeMedia, `${width}px intro before media DOM`).toBe(true);
        expect(state.mediaBeforeProof, `${width}px media before proof DOM`).toBe(true);
        expect(state.frameTop, `${width}px frame top`).toBeLessThan(state.proofTop);
        expect(state.mobileSourceMedia, `${width}px hero mobile source`).toContain('760px');
        expect(state.heroImgLoading, `${width}px hero loading`).toBe('eager');
        expect(state.heroImgFetchPriority, `${width}px hero fetchpriority`).toBe('high');
      }
    });
  }

  test('P2.3 hero tablet and desktop regression', async ({ page }) => {
    for (const width of P23_TABLET_WIDTHS) {
      await page.setViewportSize({ width, height: 1024 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readHeroComposition(page);
      expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
      expect(state.frameBeforeProof, `${width}px product before proof`).toBe(true);
      expect(state.frameWidth, `${width}px frame width`).toBeGreaterThan(0);
    }

    for (const width of P23_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readHeroComposition(page);
      expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
      expect(state.desktopMediaColumn, `${width}px desktop media column`).toBe(true);
      expect(state.frameWidth, `${width}px desktop frame width`).toBeGreaterThan(0);
      expect(state.introProofGap, `${width}px intro-proof gap`).not.toBeNull();
      expect(state.introProofGap!, `${width}px intro-proof gap min`).toBeGreaterThanOrEqual(30);
      expect(state.introProofGap!, `${width}px intro-proof gap max`).toBeLessThanOrEqual(44);
    }
  });

  test('P2.3.1 hero desktop intro-proof spacing', async ({ page }) => {
    for (const width of P23_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readHeroComposition(page);
      expect(state.introProofGap, `${width}px intro-proof spacing`).not.toBeNull();
      expect(state.introProofGap!, `${width}px avoids double spacing`).toBeLessThan(60);
      expect(state.introProofGap!, `${width}px canonical stack-gap-loose`).toBeGreaterThanOrEqual(30);
      expect(state.introProofGap!, `${width}px canonical stack-gap-loose`).toBeLessThanOrEqual(44);
    }
  });

  test('P2.3.1 hero mobile frame position regression', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const state = await readHeroComposition(page);
    expect(state.frameTop, '390px frame top').toBeGreaterThanOrEqual(500);
    expect(state.frameTop, '390px frame top').toBeLessThanOrEqual(525);
    expect(state.frameBeforeProof, '390px product before proof').toBe(true);
  });

  test('P2.3.1 EN hero H1 measurement at 430px', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 844 });
    await page.goto('/en/', { waitUntil: 'load' });
    await settle(page);

    const h1 = await page.evaluate(() => {
      const el = document.querySelector('.hero h1');
      if (!el) return null;
      const styles = getComputedStyle(el);
      const lineHeight = parseFloat(styles.lineHeight);
      const height = el.getBoundingClientRect().height;
      return {
        height: Math.round(height),
        lineCount: lineHeight > 0 ? Math.round(height / lineHeight) : 0,
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
      };
    });

    expect(h1).not.toBeNull();
    expect(h1!.height).toBeGreaterThanOrEqual(60);
    expect(h1!.height).toBeLessThanOrEqual(70);
    expect(h1!.lineCount, 'EN H1 rendered lines at 430px').toBe(2);
  });

  test('P2.3 hero landscape sanity', async ({ page }) => {
    for (const [width, height] of P23_LANDSCAPE) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readHeroComposition(page);
      expect(state.scrollWidth, `${width}x${height} overflow`).toBeLessThanOrEqual(
        state.clientWidth + 1,
      );
      expect(state.frameBeforeProof, `${width}x${height} product before proof`).toBe(true);
      expect(state.primaryVisible, `${width}x${height} CTA target`).toBe(true);
    }
  });

  test('P2.3 hero metrics capture (390 DE)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const metrics = await readHeroComposition(page);
    expect(metrics.heroHeight).toBeGreaterThan(0);
    expect(metrics.frameTop).toBeGreaterThan(0);
    expect(metrics.frameTop).toBeLessThan(844);
    expect(metrics.frameBeforeProof).toBe(true);
  });

  test('captures P2.3 hero composition screenshots', async ({ page }) => {
    const fullShots = [
      ['de', '/', 320, 700],
      ['de', '/', 375, 812],
      ['de', '/', 390, 844],
      ['de', '/', 430, 932],
      ['de', '/', 768, 1024],
      ['de', '/', 1440, 1000],
      ['en', '/en/', 320, 700],
      ['en', '/en/', 390, 844],
      ['en', '/en/', 430, 932],
      ['en', '/en/', 1440, 1000],
    ] as const;

    for (const [locale, url, width, height] of fullShots) {
      await page.setViewportSize({ width, height });
      await page.goto(url, { waitUntil: 'load' });
      await settle(page);
      await shoot(page, `p23-${locale}-${width}x${height}-viewport`);
      await page.locator('.hero').screenshot({
        path: path.join(OUT, `${LABEL}p23-hero-${locale}-${width}.png`),
        animations: 'disabled',
      });
    }

    for (const width of P23_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);
      await page.locator('.hero').screenshot({
        path: path.join(OUT, `${LABEL}p23-hero-de-desktop-${width}.png`),
        animations: 'disabled',
      });
    }
  });

  const P24_PHONE_WIDTHS = [320, 360, 375, 390, 393, 414, 430, 480] as const;
  const P24_TABLET_WIDTHS = [600, 768, 820, 1024] as const;
  const P24_DESKTOP_WIDTHS = [1100, 1280, 1440, 1920] as const;
  const P24_LANDSCAPE = [
    [667, 375],
    [844, 390],
    [932, 430],
  ] as const;

  async function readPlatformComposition(page: Page) {
    return page.evaluate(() => {
      const section = document.getElementById('platform');
      const intro = section?.querySelector('.brief__intro');
      const media = section?.querySelector('.stack__media');
      const grid = section?.querySelector('.capability-grid');
      const frame = section?.querySelector('.stack__media .frame--product');
      const capabilities = section?.querySelectorAll('.capability');
      const sectionRect = section?.getBoundingClientRect();
      const frameRect = frame?.getBoundingClientRect();
      const introRect = intro?.getBoundingClientRect();
      const mediaRect = media?.getBoundingClientRect();
      const gridRect = grid?.getBoundingClientRect();

      const fullCardCount = Array.from(capabilities ?? []).filter((el) => {
        const styles = getComputedStyle(el);
        return (
          parseFloat(styles.borderTopWidth) > 0 &&
          styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          styles.backgroundColor !== 'transparent'
        );
      }).length;

      const compactSurfaceCount = Array.from(capabilities ?? []).filter((el) =>
        el.classList.contains('surface--compact'),
      ).length;

      const compactSurfaceActive =
        compactSurfaceCount === 4 &&
        Array.from(capabilities ?? []).every((el) => {
          if (!el.classList.contains('surface--compact')) return false;
          const styles = getComputedStyle(el);
          const paddingTop = parseFloat(styles.paddingTop);
          const borderTop = parseFloat(styles.borderTopWidth);
          const bg = styles.backgroundColor;
          return (
            paddingTop >= 13 &&
            paddingTop <= 15 &&
            borderTop === 0 &&
            (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')
          );
        });

      const introBeforeMedia =
        !!intro &&
        !!media &&
        (intro.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      const mediaBeforeGrid =
        !!media &&
        !!grid &&
        (media.compareDocumentPosition(grid) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

      const introToMedia =
        introRect && mediaRect
          ? Math.round((mediaRect.top - introRect.bottom) * 10) / 10
          : null;
      const mediaToGrid =
        mediaRect && gridRect ? Math.round((gridRect.top - mediaRect.bottom) * 10) / 10 : null;

      const desktopLayout =
        window.matchMedia('(min-width: 1025px)').matches && intro && grid && media
          ? {
              introLeft: intro.getBoundingClientRect().left,
              introRight: intro.getBoundingClientRect().right,
              gridLeft: grid.getBoundingClientRect().left,
              gridTop: grid.getBoundingClientRect().top,
              introTop: intro.getBoundingClientRect().top,
              mediaTop: media.getBoundingClientRect().top,
              mediaBottom: media.getBoundingClientRect().bottom,
              rowOneBottom: Math.max(
                intro.getBoundingClientRect().bottom,
                grid.getBoundingClientRect().bottom,
              ),
            }
          : null;

      const capabilitySurfaces = Array.from(capabilities ?? []).map((el) => {
        const styles = getComputedStyle(el);
        return {
          borderTopWidth: parseFloat(styles.borderTopWidth),
          borderRightWidth: parseFloat(styles.borderRightWidth),
          borderBottomWidth: parseFloat(styles.borderBottomWidth),
          borderLeftWidth: parseFloat(styles.borderLeftWidth),
          background: styles.backgroundColor,
          borderRadius: parseFloat(styles.borderTopLeftRadius),
        };
      });

      const lastCompactBottomBorder =
        capabilities && capabilities.length > 0
          ? parseFloat(getComputedStyle(capabilities[capabilities.length - 1]!).borderBottomWidth)
          : null;

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        sectionHeight: sectionRect?.height ?? 0,
        frameTopRel: sectionRect && frameRect ? frameRect.top - sectionRect.top : null,
        frameWidth: frameRect?.width ?? 0,
        capabilityCount: capabilities?.length ?? 0,
        fullCardCount,
        compactSurfaceCount,
        compactSurfaceActive,
        introBeforeMedia,
        mediaBeforeGrid,
        introToMedia,
        mediaToGrid,
        mediaMarginTop: media ? parseFloat(getComputedStyle(media).marginTop) : null,
        desktopTwoColCards:
          window.matchMedia('(min-width: 1025px)').matches && grid
            ? getComputedStyle(grid).gridTemplateColumns.includes(' ')
            : null,
        desktopLayout,
        capabilitySurfaces,
        lastCompactBottomBorder,
      };
    });
  }

  async function readVehicleComposition(page: Page) {
    return page.evaluate(() => {
      const section = document.getElementById('vehicle-intelligence');
      const panel = section?.querySelector('.stage__panel');
      const media = section?.querySelector('.stage__media');
      const flush = section?.querySelector('.frame--flush');
      const notes = section?.querySelectorAll('.stage__notes li');
      const head = section?.querySelector('.section-head');
      const panelRect = panel?.getBoundingClientRect();
      const flushRect = flush?.getBoundingClientRect();
      const mediaRect = media?.getBoundingClientRect();
      const flushStyles = flush ? getComputedStyle(flush) : null;

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        sectionHeight: section?.getBoundingClientRect().height ?? 0,
        headToPanel:
          head && panel
            ? Math.round((panel.getBoundingClientRect().top - head.getBoundingClientRect().bottom) * 10) /
              10
            : null,
        noteCount: notes?.length ?? 0,
        mediaWidth: mediaRect?.width ?? 0,
        flushContained:
          flushRect && mediaRect
            ? flushRect.left >= mediaRect.left - 1 && flushRect.right <= mediaRect.right + 1
            : false,
        flushMarginLeft: flushStyles ? parseFloat(flushStyles.marginLeft) : null,
        desktopTwoCol:
          window.matchMedia('(min-width: 1025px)').matches && panel
            ? getComputedStyle(panel).gridTemplateColumns.includes(' ')
            : null,
      };
    });
  }

  for (const locale of ['de', 'en'] as const) {
    const url = locale === 'de' ? '/' : '/en/';

    test(`P2.4 platform mobile composition invariants (${locale})`, async ({ page }) => {
      for (const width of P24_PHONE_WIDTHS) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const state = await readPlatformComposition(page);
        expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
        expect(state.capabilityCount, `${width}px capability count`).toBe(4);
        expect(state.introBeforeMedia, `${width}px intro before media`).toBe(true);
        expect(state.mediaBeforeGrid, `${width}px media before capabilities`).toBe(true);
        expect(state.frameWidth, `${width}px platform frame width`).toBeGreaterThan(0);
        expect(state.fullCardCount, `${width}px compact mobile cards`).toBe(0);
        expect(state.compactSurfaceCount, `${width}px compact surface class`).toBe(4);
        expect(state.compactSurfaceActive, `${width}px compact surface active`).toBe(true);
        expect(state.lastCompactBottomBorder, `${width}px last compact bottom border`).toBe(0);
        expect(state.mediaMarginTop, `${width}px media margin-top`).toBe(0);
        expect(state.introToMedia, `${width}px intro-media gap`).toBeGreaterThanOrEqual(24);
        expect(state.introToMedia!, `${width}px intro-media gap`).toBeLessThanOrEqual(36);
      }
    });
  }

  const P24_PLATFORM_TABLET_WIDTHS = [768, 1024] as const;
  const P24_DESKTOP_GEOMETRY_WIDTHS = [1100, 1440, 1920] as const;

  test('P2.4 platform tablet regression (DE + EN)', async ({ page }) => {
    for (const locale of ['de', 'en'] as const) {
      const url = locale === 'de' ? '/' : '/en/';
      for (const width of P24_PLATFORM_TABLET_WIDTHS) {
        await page.setViewportSize({ width, height: 1024 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const state = await readPlatformComposition(page);
        expect(state.scrollWidth, `${locale} ${width}px overflow`).toBeLessThanOrEqual(
          state.clientWidth + 1,
        );
        expect(state.mediaBeforeGrid, `${locale} ${width}px media before grid`).toBe(true);
        expect(state.compactSurfaceActive, `${locale} ${width}px compact surface`).toBe(true);
        expect(state.fullCardCount, `${locale} ${width}px full cards`).toBe(0);
        expect(state.frameTopRel!, `${locale} ${width}px earlier product`).toBeLessThan(800);
      }
    }
  });

  test('P2.4 platform desktop regression', async ({ page }) => {
    for (const width of P24_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readPlatformComposition(page);
      expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
      expect(state.desktopTwoColCards, `${width}px desktop 2-col cards`).toBe(true);
      expect(state.fullCardCount, `${width}px desktop card surfaces`).toBe(4);
      expect(state.compactSurfaceActive, `${width}px desktop compact override`).toBe(false);
    }
  });

  test('P2.4.2 platform desktop all-four-card borders', async ({ page }) => {
    for (const width of P24_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readPlatformComposition(page);
      expect(state.capabilitySurfaces, `${width}px capability surfaces`).toHaveLength(4);

      for (const [index, surface] of state.capabilitySurfaces.entries()) {
        expect(surface.borderTopWidth, `${width}px card ${index + 1} top border`).toBeGreaterThan(0);
        expect(surface.borderRightWidth, `${width}px card ${index + 1} right border`).toBeGreaterThan(
          0,
        );
        expect(surface.borderBottomWidth, `${width}px card ${index + 1} bottom border`).toBeGreaterThan(
          0,
        );
        expect(surface.borderLeftWidth, `${width}px card ${index + 1} left border`).toBeGreaterThan(0);
        expect(surface.background, `${width}px card ${index + 1} background`).not.toBe('rgba(0, 0, 0, 0)');
        expect(surface.background, `${width}px card ${index + 1} background`).not.toBe('transparent');
        expect(surface.borderRadius, `${width}px card ${index + 1} radius`).toBeGreaterThan(0);
      }
    }
  });

  test('P2.4.1 platform desktop layout geometry', async ({ page }) => {
    for (const width of P24_DESKTOP_GEOMETRY_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readPlatformComposition(page);
      const layout = state.desktopLayout;
      expect(layout, `${width}px desktop layout`).not.toBeNull();
      expect(layout!.introRight, `${width}px intro left of grid`).toBeLessThan(layout!.gridLeft + 8);
      expect(Math.abs(layout!.gridTop - layout!.introTop), `${width}px row-one alignment`).toBeLessThan(
        8,
      );
      expect(layout!.mediaTop, `${width}px media below row one`).toBeGreaterThanOrEqual(
        layout!.rowOneBottom - 4,
      );
      expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
    }
  });

  for (const locale of ['de', 'en'] as const) {
    const url = locale === 'de' ? '/' : '/en/';

    test(`P2.4 vehicle mobile composition invariants (${locale})`, async ({ page }) => {
      for (const width of [...P24_PHONE_WIDTHS, ...P24_TABLET_WIDTHS]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const state = await readVehicleComposition(page);
        expect(state.scrollWidth, `${locale} ${width}px overflow`).toBeLessThanOrEqual(
          state.clientWidth + 1,
        );
        expect(state.noteCount, `${locale} ${width}px vehicle notes`).toBe(3);
        expect(state.flushContained, `${locale} ${width}px flush contained`).toBe(true);
        expect(state.flushMarginLeft ?? 0, `${locale} ${width}px flush bleed margin`).toBeGreaterThanOrEqual(
          0,
        );
        expect(state.mediaWidth, `${locale} ${width}px stage media width`).toBeGreaterThan(0);
      }
    });
  }

  test('P2.4 vehicle desktop stage regression', async ({ page }) => {
    for (const locale of ['de', 'en'] as const) {
      const url = locale === 'de' ? '/' : '/en/';
      for (const width of P24_DESKTOP_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const state = await readVehicleComposition(page);
        expect(state.desktopTwoCol, `${locale} ${width}px desktop stage columns`).toBe(true);
        expect(state.flushContained, `${locale} ${width}px desktop flush contained`).toBe(true);
      }
    }
  });

  test('P2.4 platform product distance regression (390 DE)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const state = await readPlatformComposition(page);
    expect(state.frameTopRel!, '390px platform frame distance').toBeLessThan(500);
    expect(state.frameTopRel!, '390px improved from baseline').toBeLessThan(962);
  });

  test('P2.4 landscape sanity', async ({ page }) => {
    for (const [width, height] of P24_LANDSCAPE) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const platform = await readPlatformComposition(page);
      const vehicle = await readVehicleComposition(page);
      expect(platform.scrollWidth, `${width}x${height} platform overflow`).toBeLessThanOrEqual(
        platform.clientWidth + 1,
      );
      expect(vehicle.scrollWidth, `${width}x${height} vehicle overflow`).toBeLessThanOrEqual(
        vehicle.clientWidth + 1,
      );
    }
  });

  test('captures P2.4 platform vehicle screenshots', async ({ page }) => {
    const shots = [
      ['de', '/', 320, 700],
      ['de', '/', 375, 812],
      ['de', '/', 390, 844],
      ['de', '/', 430, 932],
      ['de', '/', 768, 1024],
      ['de', '/', 1440, 1000],
      ['en', '/en/', 320, 700],
      ['en', '/en/', 390, 844],
      ['en', '/en/', 430, 932],
      ['en', '/en/', 1440, 1000],
    ] as const;

    for (const [locale, url, width, height] of shots) {
      await page.setViewportSize({ width, height });
      await page.goto(url, { waitUntil: 'load' });
      await settle(page);
      await page.locator('#platform').screenshot({
        path: path.join(OUT, `${LABEL}p24-platform-${locale}-${width}.png`),
        animations: 'disabled',
      });
      await page.locator('#vehicle-intelligence').screenshot({
        path: path.join(OUT, `${LABEL}p24-vehicle-${locale}-${width}.png`),
        animations: 'disabled',
      });
    }
  });

  const P25_PHONE_WIDTHS = P24_PHONE_WIDTHS;
  const P25_TABLET_WIDTHS = P24_TABLET_WIDTHS;
  const P25_DESKTOP_WIDTHS = P24_DESKTOP_WIDTHS;
  const P25_LOCALE_WIDTHS = [390, 768, 1440] as const;
  const P25_LANDSCAPE = P24_LANDSCAPE;

  async function readAiComposition(page: Page) {
    return page.evaluate(() => {
      const section = document.getElementById('ai-orchestration');
      const intro = section?.querySelector('.split__intro');
      const media = section?.querySelector('.split__media');
      const support = section?.querySelector('.split__support');
      const flow = section?.querySelector('.flow');
      const flowList = section?.querySelector('.flow__list');
      const steps = section?.querySelectorAll('.flow__step');
      const governance = section?.querySelectorAll('.notes__item');
      const frame = section?.querySelector('.split__media .frame--product');
      const sectionRect = section?.getBoundingClientRect();
      const frameRect = frame?.getBoundingClientRect();
      const introRect = intro?.getBoundingClientRect();
      const mediaRect = media?.getBoundingClientRect();
      const supportRect = support?.getBoundingClientRect();
      const flowStyles = flow ? getComputedStyle(flow) : null;

      const introBeforeMedia =
        !!intro &&
        !!media &&
        (intro.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      const mediaBeforeSupport =
        !!media &&
        !!support &&
        (media.compareDocumentPosition(support) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

      const compactFlowActive =
        window.matchMedia('(max-width: 1024px)').matches &&
        !!flow &&
        parseFloat(getComputedStyle(flow).borderTopWidth) === 0 &&
        (getComputedStyle(flow).backgroundColor === 'rgba(0, 0, 0, 0)' ||
          getComputedStyle(flow).backgroundColor === 'transparent');

      const compactStepCount = Array.from(steps ?? []).filter((el) =>
        el.classList.contains('surface--compact'),
      ).length;

      const desktopLayout =
        window.matchMedia('(min-width: 1025px)').matches && intro && media && support
          ? {
              mediaLeft: media.getBoundingClientRect().left,
              introLeft: intro.getBoundingClientRect().left,
              supportLeft: support.getBoundingClientRect().left,
              mediaRight: media.getBoundingClientRect().right,
              introRight: intro.getBoundingClientRect().right,
              introTop: intro.getBoundingClientRect().top,
              supportTop: support.getBoundingClientRect().top,
              flowRailBorder: flow ? parseFloat(getComputedStyle(flow).borderTopWidth) : 0,
            }
          : null;

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        sectionHeight: sectionRect?.height ?? 0,
        frameTopRel: sectionRect && frameRect ? frameRect.top - sectionRect.top : null,
        frameWidth: frameRect?.width ?? 0,
        frameHeight: frameRect?.height ?? 0,
        flowStepCount: steps?.length ?? 0,
        governanceCount: governance?.length ?? 0,
        flowListIsOl: flowList?.tagName === 'OL',
        introBeforeMedia,
        mediaBeforeSupport,
        compactFlowActive,
        compactStepCount,
        flowMarginTop: flowStyles ? parseFloat(flowStyles.marginTop) : null,
        introToMedia:
          introRect && mediaRect
            ? Math.round((mediaRect.top - introRect.bottom) * 10) / 10
            : null,
        mediaToSupport:
          mediaRect && supportRect
            ? Math.round((supportRect.top - mediaRect.bottom) * 10) / 10
            : null,
        desktopLayout,
      };
    });
  }

  async function readWorkflowComposition(page: Page) {
    return page.evaluate(() => {
      const section = document.getElementById('workflow-automation');
      const head = section?.querySelector('.section-head');
      const chain = section?.querySelector('.chain');
      const chainList = section?.querySelector('.chain__list');
      const links = section?.querySelectorAll('.chain__link');
      const media = section?.querySelector('.stack__media');
      const frame = section?.querySelector('.stack__media .frame--product');
      const sectionRect = section?.getBoundingClientRect();
      const frameRect = frame?.getBoundingClientRect();
      const chainStyles = chain ? getComputedStyle(chain) : null;
      const mediaStyles = media ? getComputedStyle(media) : null;

      const headBeforeChain =
        !!head &&
        !!chain &&
        (head.compareDocumentPosition(chain) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      const chainBeforeMedia =
        !!chain &&
        !!media &&
        (chain.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

      const compactChainActive =
        window.matchMedia('(max-width: 1024px)').matches &&
        Array.from(links ?? []).every((el) => {
          if (!el.classList.contains('surface--compact')) return false;
          const styles = getComputedStyle(el);
          return (
            parseFloat(styles.borderTopWidth) === 0 &&
            (styles.backgroundColor === 'rgba(0, 0, 0, 0)' ||
              styles.backgroundColor === 'transparent')
          );
        });

      const fullCardCount = Array.from(links ?? []).filter((el) => {
        const styles = getComputedStyle(el);
        return (
          parseFloat(styles.borderTopWidth) > 0 &&
          styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          styles.backgroundColor !== 'transparent'
        );
      }).length;

      const chainLinkSurfaces = Array.from(links ?? []).map((el) => {
        const styles = getComputedStyle(el);
        return {
          hasCompactClass: el.classList.contains('surface--compact'),
          paddingTop: parseFloat(styles.paddingTop),
          paddingBottom: parseFloat(styles.paddingBottom),
          borderTopWidth: parseFloat(styles.borderTopWidth),
          borderRightWidth: parseFloat(styles.borderRightWidth),
          borderBottomWidth: parseFloat(styles.borderBottomWidth),
          borderLeftWidth: parseFloat(styles.borderLeftWidth),
          background: styles.backgroundColor,
          borderRadius: parseFloat(styles.borderTopLeftRadius),
        };
      });

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        sectionHeight: sectionRect?.height ?? 0,
        frameTopRel: sectionRect && frameRect ? frameRect.top - sectionRect.top : null,
        frameWidth: frameRect?.width ?? 0,
        frameHeight: frameRect?.height ?? 0,
        chainLinkCount: links?.length ?? 0,
        chainListIsOl: chainList?.tagName === 'OL',
        headBeforeChain,
        chainBeforeMedia,
        compactChainActive,
        fullCardCount,
        chainMarginTop: chainStyles ? parseFloat(chainStyles.marginTop) : null,
        mediaMarginTop: mediaStyles ? parseFloat(mediaStyles.marginTop) : null,
        desktopThreeCol:
          window.matchMedia('(min-width: 1025px)').matches && chainList
            ? getComputedStyle(chainList).gridTemplateColumns.split(' ').length === 3
            : null,
        chainLinkSurfaces,
      };
    });
  }

  for (const locale of ['de', 'en'] as const) {
    const url = locale === 'de' ? '/' : '/en/';

    test(`P2.5 AI mobile composition invariants (${locale})`, async ({ page }) => {
      for (const width of P25_PHONE_WIDTHS) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const state = await readAiComposition(page);
        expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
        expect(state.flowStepCount, `${width}px flow steps`).toBe(4);
        expect(state.governanceCount, `${width}px governance items`).toBe(2);
        expect(state.flowListIsOl, `${width}px flow ol`).toBe(true);
        expect(state.introBeforeMedia, `${width}px intro before media`).toBe(true);
        expect(state.mediaBeforeSupport, `${width}px media before support`).toBe(true);
        expect(state.compactFlowActive, `${width}px compact flow rail`).toBe(true);
        expect(state.compactStepCount, `${width}px compact steps`).toBe(4);
        expect(state.frameWidth, `${width}px frame width`).toBeGreaterThan(0);
        expect(state.flowMarginTop, `${width}px flow margin-top`).toBe(0);
        expect(state.introToMedia!, `${width}px intro-media gap`).toBeGreaterThanOrEqual(24);
        expect(state.introToMedia!, `${width}px intro-media gap`).toBeLessThanOrEqual(36);
      }
    });
  }

  for (const locale of ['de', 'en'] as const) {
    const url = locale === 'de' ? '/' : '/en/';

    test(`P2.5 workflow mobile composition invariants (${locale})`, async ({ page }) => {
      for (const width of P25_PHONE_WIDTHS) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const state = await readWorkflowComposition(page);
        expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
        expect(state.chainLinkCount, `${width}px chain links`).toBe(3);
        expect(state.chainListIsOl, `${width}px chain ol`).toBe(true);
        expect(state.headBeforeChain, `${width}px head before chain`).toBe(true);
        expect(state.chainBeforeMedia, `${width}px chain before media`).toBe(true);
        expect(state.compactChainActive, `${width}px compact chain`).toBe(true);
        expect(state.fullCardCount, `${width}px full chain cards`).toBe(0);
        expect(state.frameWidth, `${width}px frame width`).toBeGreaterThan(0);
      }
    });
  }

  test('P2.5 AI tablet regression (DE + EN)', async ({ page }) => {
    for (const locale of ['de', 'en'] as const) {
      const url = locale === 'de' ? '/' : '/en/';
      for (const width of [768, 1024] as const) {
        await page.setViewportSize({ width, height: 1024 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const state = await readAiComposition(page);
        expect(state.scrollWidth, `${locale} ${width}px overflow`).toBeLessThanOrEqual(
          state.clientWidth + 1,
        );
        expect(state.mediaBeforeSupport, `${locale} ${width}px media before support`).toBe(true);
        expect(state.compactFlowActive, `${locale} ${width}px compact flow`).toBe(true);
        expect(state.frameTopRel!, `${locale} ${width}px earlier product`).toBeLessThan(700);
      }
    }
  });

  test('P2.5 AI desktop mirrored geometry', async ({ page }) => {
    for (const width of P25_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readAiComposition(page);
      const layout = state.desktopLayout;
      expect(layout, `${width}px desktop layout`).not.toBeNull();
      expect(layout!.mediaRight, `${width}px product left of copy`).toBeLessThan(
        layout!.introLeft + 8,
      );
      expect(Math.abs(layout!.introLeft - layout!.supportLeft), `${width}px copy column`).toBeLessThan(
        8,
      );
      expect(layout!.supportTop, `${width}px support below intro`).toBeGreaterThanOrEqual(
        layout!.introTop,
      );
      expect(layout!.flowRailBorder, `${width}px flow rail restored`).toBeGreaterThan(0);
      expect(state.compactFlowActive, `${width}px desktop compact override`).toBe(false);
      expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
    }
  });

  test('P2.5 workflow desktop chain regression', async ({ page }) => {
    for (const locale of ['de', 'en'] as const) {
      const url = locale === 'de' ? '/' : '/en/';
      for (const width of P25_DESKTOP_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const state = await readWorkflowComposition(page);
        expect(state.desktopThreeCol, `${locale} ${width}px desktop 3-col chain`).toBe(true);
        expect(state.fullCardCount, `${locale} ${width}px desktop chain cards`).toBe(3);
        expect(state.compactChainActive, `${locale} ${width}px desktop compact override`).toBe(
          false,
        );
        expect(state.scrollWidth, `${locale} ${width}px overflow`).toBeLessThanOrEqual(
          state.clientWidth + 1,
        );
      }
    }
  });

  test('P2.5.1 workflow mobile compact surface ownership', async ({ page }) => {
    for (const width of [...P25_PHONE_WIDTHS, ...P25_TABLET_WIDTHS.filter((w) => w <= 1024)] as const) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readWorkflowComposition(page);
      expect(state.chainLinkSurfaces, `${width}px chain surfaces`).toHaveLength(3);

      for (const [index, surface] of state.chainLinkSurfaces.entries()) {
        expect(surface.hasCompactClass, `${width}px link ${index + 1} compact class`).toBe(true);
        expect(surface.paddingTop, `${width}px link ${index + 1} padding-top`).toBeGreaterThanOrEqual(
          13,
        );
        expect(surface.paddingTop, `${width}px link ${index + 1} padding-top`).toBeLessThanOrEqual(15);
        expect(surface.paddingBottom, `${width}px link ${index + 1} padding-bottom`).toBeGreaterThanOrEqual(
          13,
        );
        expect(surface.paddingBottom, `${width}px link ${index + 1} padding-bottom`).toBeLessThanOrEqual(
          15,
        );
        expect(surface.borderTopWidth, `${width}px link ${index + 1} border-top`).toBe(0);
        expect(surface.borderLeftWidth, `${width}px link ${index + 1} border-left`).toBe(0);
        expect(surface.borderRightWidth, `${width}px link ${index + 1} border-right`).toBe(0);
        expect(surface.borderRadius, `${width}px link ${index + 1} radius`).toBe(0);
        expect(
          surface.background === 'rgba(0, 0, 0, 0)' || surface.background === 'transparent',
          `${width}px link ${index + 1} background`,
        ).toBe(true);

        if (index < 2) {
          expect(surface.borderBottomWidth, `${width}px link ${index + 1} bottom divider`).toBeGreaterThan(
            0,
          );
        } else {
          expect(surface.borderBottomWidth, `${width}px link ${index + 1} bottom divider`).toBe(0);
        }
      }
    }
  });

  test('P2.5.3 workflow CSS source ownership', async () => {
    const cssPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      '..',
      'src',
      'styles.css',
    );
    const css = await fs.readFile(cssPath, 'utf8');

    const sectionStart = css.indexOf('/* P2.5 — Workflow compact chain */');
    expect(sectionStart, 'workflow compact chain section').toBeGreaterThan(-1);
    const sectionEnd = css.indexOf('/* Gap before workflow product visual', sectionStart);
    const workflowSection = css.slice(sectionStart, sectionEnd);

    const mobileStart = workflowSection.indexOf('@media (max-width: 1024px)');
    const mobileEnd = workflowSection.indexOf('@media (min-width: 1025px)', mobileStart);
    const mobileBlock = workflowSection.slice(mobileStart, mobileEnd);

    const forbiddenMobilePatterns = [
      /padding:\s*14px\s+0/,
      /border-radius:\s*0/,
      /background:\s*transparent/,
      /border-bottom:\s*1px\s+solid\s+var\(--hairline\)/,
    ] as const;

    for (const pattern of forbiddenMobilePatterns) {
      expect(
        mobileBlock,
        `mobile workflow rules must not duplicate compact surface chrome (${pattern})`,
      ).not.toMatch(pattern);
    }

    expect(mobileBlock, 'no workflow surface--compact:last-child rule').not.toMatch(
      /\.surface--compact:last-child/,
    );

    const desktopStart = workflowSection.indexOf('@media (min-width: 1025px)');
    const desktopBlock = workflowSection.slice(desktopStart);
    const desktopOwnerMatches = [
      ...desktopBlock.matchAll(/\.workflow--compact\s+\.chain__link\s*\{([^}]+)\}/g),
    ];
    expect(desktopOwnerMatches, 'exactly one desktop workflow card-chrome owner').toHaveLength(1);

    const ownerBody = desktopOwnerMatches[0]![1]!;
    expect(ownerBody).toContain('padding: var(--surface-padding)');
    expect(ownerBody).toContain('border: 1px solid var(--hairline)');
    expect(ownerBody).toContain('border-radius: var(--surface-radius)');
    expect(ownerBody).toContain('background: var(--canvas-alt)');

    const duplicateCompactOwners = [
      ...desktopBlock.matchAll(/\.workflow--compact\s+\.chain__link--compact\s*\{[^}]+\}/g),
    ];
    expect(duplicateCompactOwners, 'no duplicate chain__link--compact desktop owner').toHaveLength(
      0,
    );

    const baseChainMatch = css.match(/^\.chain__link\s*\{([^}]+)\}/m);
    expect(baseChainMatch, 'base .chain__link rule').toBeTruthy();
    const baseBody = baseChainMatch![1]!;
    expect(baseBody).toContain('position: relative');
    expect(baseBody).not.toMatch(/padding:/);
    expect(baseBody).not.toMatch(/border:/);
    expect(baseBody).not.toMatch(/border-radius:/);
    expect(baseBody).not.toMatch(/background:/);
  });

  test('P2.5.1 workflow desktop all-three-card borders', async ({ page }) => {
    for (const width of P25_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readWorkflowComposition(page);
      expect(state.desktopThreeCol, `${width}px desktop 3-col chain`).toBe(true);
      expect(state.chainLinkSurfaces, `${width}px chain surfaces`).toHaveLength(3);

      for (const [index, surface] of state.chainLinkSurfaces.entries()) {
        expect(surface.borderTopWidth, `${width}px card ${index + 1} top border`).toBeGreaterThan(0);
        expect(surface.borderRightWidth, `${width}px card ${index + 1} right border`).toBeGreaterThan(
          0,
        );
        expect(surface.borderBottomWidth, `${width}px card ${index + 1} bottom border`).toBeGreaterThan(
          0,
        );
        expect(surface.borderLeftWidth, `${width}px card ${index + 1} left border`).toBeGreaterThan(0);
        expect(surface.background, `${width}px card ${index + 1} background`).not.toBe(
          'rgba(0, 0, 0, 0)',
        );
        expect(surface.background, `${width}px card ${index + 1} background`).not.toBe('transparent');
        expect(surface.borderRadius, `${width}px card ${index + 1} radius`).toBeGreaterThan(0);
      }
    }
  });

  test('P2.5 AI workflow spacing ownership', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const ai = await readAiComposition(page);
    expect(ai.flowMarginTop, 'AI flow margin-top').toBe(0);
    expect(ai.introToMedia!, 'AI intro-media gap').toBeGreaterThanOrEqual(24);
    expect(ai.mediaToSupport!, 'AI media-support gap').toBeGreaterThanOrEqual(16);

    const workflow = await readWorkflowComposition(page);
    const spacing = await readStackSpacing(page);
    expect(spacing.workflowHeadToChain!, 'workflow head-chain gap').toBeGreaterThanOrEqual(44);
    expect(spacing.workflowHeadToChain!, 'workflow head-chain gap').toBeLessThanOrEqual(52);
    expect(spacing.workflowChainToMedia!, 'workflow chain-media gap').toBeGreaterThanOrEqual(24);
    expect(spacing.workflowChainToMedia!, 'workflow chain-media gap').toBeLessThanOrEqual(36);
    expect(workflow.chainMarginTop, 'workflow chain margin-top').toBeGreaterThan(0);
    expect(workflow.mediaMarginTop, 'workflow media margin-top').toBeGreaterThan(0);
  });

  test('P2.5 AI product distance regression (390 DE)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const state = await readAiComposition(page);
    expect(state.frameTopRel!, '390px AI frame distance').toBeLessThan(500);
    expect(state.frameTopRel!, '390px improved from P2.4 main baseline').toBeLessThan(948);
  });

  test('P2.5 workflow product distance regression (390 DE)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const state = await readWorkflowComposition(page);
    expect(state.frameTopRel!, '390px workflow frame distance').toBeLessThan(750);
    expect(state.frameTopRel!, '390px improved from P2.4 main baseline').toBeLessThan(716);
  });

  test('P2.5 locale structural coverage (390 / 768 / 1440)', async ({ page }) => {
    for (const locale of ['de', 'en'] as const) {
      const url = locale === 'de' ? '/' : '/en/';
      for (const width of P25_LOCALE_WIDTHS) {
        await page.setViewportSize({ width, height: width <= 768 ? 844 : 900 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const ai = await readAiComposition(page);
        const workflow = await readWorkflowComposition(page);
        expect(ai.flowStepCount, `${locale} ${width}px AI steps`).toBe(4);
        expect(workflow.chainLinkCount, `${locale} ${width}px workflow links`).toBe(3);
        expect(ai.scrollWidth, `${locale} ${width}px AI overflow`).toBeLessThanOrEqual(
          ai.clientWidth + 1,
        );
        expect(workflow.scrollWidth, `${locale} ${width}px workflow overflow`).toBeLessThanOrEqual(
          workflow.clientWidth + 1,
        );
      }
    }
  });

  test('P2.5 landscape sanity', async ({ page }) => {
    for (const [width, height] of P25_LANDSCAPE) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const ai = await readAiComposition(page);
      const workflow = await readWorkflowComposition(page);
      expect(ai.scrollWidth, `${width}x${height} AI overflow`).toBeLessThanOrEqual(
        ai.clientWidth + 1,
      );
      expect(workflow.scrollWidth, `${width}x${height} workflow overflow`).toBeLessThanOrEqual(
        workflow.clientWidth + 1,
      );
    }
  });

  test('captures P2.5 AI workflow screenshots', async ({ page }) => {
    const shots = [
      ['de', '/', 320, 700],
      ['de', '/', 375, 812],
      ['de', '/', 390, 844],
      ['de', '/', 430, 932],
      ['de', '/', 768, 1024],
      ['de', '/', 1440, 1000],
      ['en', '/en/', 320, 700],
      ['en', '/en/', 390, 844],
      ['en', '/en/', 430, 932],
      ['en', '/en/', 1440, 1000],
    ] as const;

    for (const [locale, url, width, height] of shots) {
      await page.setViewportSize({ width, height });
      await page.goto(url, { waitUntil: 'load' });
      await settle(page);
      await page.locator('#ai-orchestration').screenshot({
        path: path.join(OUT, `${LABEL}p25-ai-${locale}-${width}.png`),
        animations: 'disabled',
      });
      await page.locator('#workflow-automation').screenshot({
        path: path.join(OUT, `${LABEL}p25-workflow-${locale}-${width}.png`),
        animations: 'disabled',
      });
    }
  });

  const P26_PHONE_WIDTHS = P25_PHONE_WIDTHS;
  const P26_TABLET_WIDTHS = P25_TABLET_WIDTHS;
  const P26_DESKTOP_WIDTHS = P25_DESKTOP_WIDTHS;
  const P26_LOCALE_WIDTHS = [390, 768, 1440] as const;
  const P26_LANDSCAPE = P25_LANDSCAPE;

  async function readCommunicationComposition(page: Page) {
    return page.evaluate(() => {
      const section = document.getElementById('communication');
      const intro = section?.querySelector('.split__intro');
      const media = section?.querySelector('.split__media');
      const support = section?.querySelector('.split__support');
      const notes = section?.querySelectorAll('.notes__item');
      const frame = section?.querySelector('.split__media .frame--product');
      const sectionRect = section?.getBoundingClientRect();
      const frameRect = frame?.getBoundingClientRect();
      const introRect = intro?.getBoundingClientRect();
      const mediaRect = media?.getBoundingClientRect();
      const supportRect = support?.getBoundingClientRect();

      const noteSurfaces = Array.from(notes ?? []).map((el) => {
        const styles = getComputedStyle(el);
        return {
          hasCompactClass: el.classList.contains('surface--compact'),
          paddingTop: parseFloat(styles.paddingTop),
          borderTopWidth: parseFloat(styles.borderTopWidth),
          borderBottomWidth: parseFloat(styles.borderBottomWidth),
          borderRadius: parseFloat(styles.borderRadius),
          background: styles.backgroundColor,
        };
      });

      const compactNotesActive =
        window.matchMedia('(max-width: 1024px)').matches &&
        noteSurfaces.every(
          (s) =>
            s.hasCompactClass &&
            s.borderTopWidth === 0 &&
            (s.background === 'rgba(0, 0, 0, 0)' || s.background === 'transparent'),
        );

      const desktopSplitActive =
        window.matchMedia('(min-width: 1025px)').matches &&
        !!intro &&
        !!media &&
        !!support &&
        media.getBoundingClientRect().left < intro.getBoundingClientRect().left;

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        sectionHeight: sectionRect?.height ?? 0,
        frameTopRel: sectionRect && frameRect ? frameRect.top - sectionRect.top : null,
        frameWidth: frameRect?.width ?? 0,
        frameHeight: frameRect?.height ?? 0,
        noteCount: notes?.length ?? 0,
        introBeforeMedia:
          !!intro &&
          !!media &&
          (intro.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
        mediaBeforeSupport:
          !!media &&
          !!support &&
          (media.compareDocumentPosition(support) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
        compactNotesActive,
        desktopSplitActive,
        introToMedia:
          introRect && mediaRect
            ? Math.round((mediaRect.top - introRect.bottom) * 10) / 10
            : null,
        mediaToSupport:
          mediaRect && supportRect
            ? Math.round((supportRect.top - mediaRect.bottom) * 10) / 10
            : null,
        noteSurfaces,
      };
    });
  }

  async function readIntegrationsComposition(page: Page) {
    return page.evaluate(() => {
      const section = document.getElementById('integrations');
      const core = section?.querySelector('.hub__core');
      const tiles = section?.querySelectorAll('.hub__tile');
      const diagram = section?.querySelector('.hub__diagram');
      const sectionRect = section?.getBoundingClientRect();
      const coreRect = core?.getBoundingClientRect();
      const coreStyles = core ? getComputedStyle(core) : null;
      const diagramStyles = diagram ? getComputedStyle(diagram) : null;

      const fullCardCount = Array.from(tiles ?? []).filter((el) => {
        const styles = getComputedStyle(el);
        return (
          parseFloat(styles.borderTopWidth) > 0 &&
          styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          styles.backgroundColor !== 'transparent'
        );
      }).length;

      const coreVisible =
        !!coreStyles &&
        coreStyles.display !== 'none' &&
        parseFloat(coreStyles.width) > 0 &&
        parseFloat(coreStyles.height) > 0;

      const coreTopRel =
        sectionRect && coreRect ? Math.round((coreRect.top - sectionRect.top) * 10) / 10 : null;

      const desktopHubActive =
        window.matchMedia('(min-width: 1025px)').matches &&
        !!diagramStyles &&
        diagramStyles.gridTemplateColumns.split(' ').length === 3 &&
        fullCardCount === 6;

      const mobileSingleColumn =
        window.matchMedia('(max-width: 1024px)').matches &&
        !!diagramStyles &&
        !diagramStyles.gridTemplateColumns.includes('auto');

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        sectionHeight: sectionRect?.height ?? 0,
        tileCount: tiles?.length ?? 0,
        fullCardCount,
        coreVisible,
        coreTopRel,
        desktopHubActive,
        mobileSingleColumn,
      };
    });
  }

  async function readClosingFooterMetrics(page: Page) {
    return page.evaluate(() => {
      const closing = document.querySelector('.closing');
      const footer = document.querySelector('.sitefooter');
      const primary = document.querySelector('.closing .action--primary');
      const primaryStyles = primary ? getComputedStyle(primary) : null;
      return {
        closingHeight: closing ? Math.round(closing.getBoundingClientRect().height) : null,
        footerHeight: footer ? Math.round(footer.getBoundingClientRect().height) : null,
        pageHeight: Math.round(document.documentElement.scrollHeight),
        primaryMinHeight: primaryStyles ? parseFloat(primaryStyles.minHeight) : null,
      };
    });
  }

  for (const locale of ['de', 'en'] as const) {
    const url = locale === 'de' ? '/' : '/en/';

    test(`P2.6 communication mobile composition invariants (${locale})`, async ({ page }) => {
      for (const width of P26_PHONE_WIDTHS) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const state = await readCommunicationComposition(page);
        expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
        expect(state.noteCount, `${width}px note count`).toBe(3);
        expect(state.introBeforeMedia, `${width}px intro before media`).toBe(true);
        expect(state.mediaBeforeSupport, `${width}px media before notes`).toBe(true);
        expect(state.compactNotesActive, `${width}px compact notes`).toBe(true);
        expect(state.frameWidth, `${width}px frame width`).toBeGreaterThan(0);
      }
    });
  }

  test('P2.6 communication mobile compact surface ownership', async ({ page }) => {
    for (const width of [...P26_PHONE_WIDTHS, ...P26_TABLET_WIDTHS.filter((w) => w <= 1024)] as const) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readCommunicationComposition(page);
      expect(state.noteSurfaces, `${width}px note surfaces`).toHaveLength(3);

      for (const [index, surface] of state.noteSurfaces.entries()) {
        expect(surface.hasCompactClass, `${width}px note ${index + 1} compact class`).toBe(true);
        expect(surface.paddingTop, `${width}px note ${index + 1} padding-top`).toBeGreaterThanOrEqual(
          13,
        );
        expect(surface.paddingTop, `${width}px note ${index + 1} padding-top`).toBeLessThanOrEqual(15);
        expect(surface.borderTopWidth, `${width}px note ${index + 1} border-top`).toBe(0);
        expect(surface.borderRadius, `${width}px note ${index + 1} radius`).toBe(0);
        expect(
          surface.background === 'rgba(0, 0, 0, 0)' || surface.background === 'transparent',
          `${width}px note ${index + 1} background`,
        ).toBe(true);

        if (index < 2) {
          expect(surface.borderBottomWidth, `${width}px note ${index + 1} bottom divider`).toBeGreaterThan(
            0,
          );
        } else {
          expect(surface.borderBottomWidth, `${width}px note ${index + 1} bottom divider`).toBe(0);
        }
      }
    }
  });

  test('P2.6 communication desktop split geometry', async ({ page }) => {
    for (const width of P26_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readCommunicationComposition(page);
      expect(state.desktopSplitActive, `${width}px desktop mirrored split`).toBe(true);
      expect(state.noteCount, `${width}px note count`).toBe(3);
    }
  });

  test('P2.6 communication CSS source ownership', async () => {
    const cssPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      '..',
      'src',
      'styles.css',
    );
    const css = await fs.readFile(cssPath, 'utf8');
    const sectionStart = css.indexOf('/* P2.6 — Communication mobile product-led composition */');
    expect(sectionStart, 'communication section').toBeGreaterThan(-1);
    const sectionEnd = css.indexOf('/* ── Integration hub', sectionStart);
    const mobileBlock = css.slice(
      sectionStart,
      css.indexOf('@media (min-width: 1025px)', sectionStart),
    );

    for (const pattern of [
      /padding:\s*14px\s+0/,
      /border-radius:\s*0/,
      /background:\s*transparent/,
      /border-bottom:\s*1px\s+solid\s+var\(--hairline\)/,
    ]) {
      expect(
        mobileBlock,
        `communication mobile must not duplicate compact surface chrome (${pattern})`,
      ).not.toMatch(pattern);
    }
  });

  test('P2.6 integrations mobile hub invariants', async ({ page }) => {
    for (const width of P26_PHONE_WIDTHS) {
      await page.setViewportSize({ width, height: width <= 480 ? 700 : 844 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readIntegrationsComposition(page);
      expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
      expect(state.tileCount, `${width}px tile count`).toBe(6);
      expect(state.coreVisible, `${width}px core visible`).toBe(true);
      expect(state.fullCardCount, `${width}px full-card surfaces`).toBe(0);
      expect(state.mobileSingleColumn, `${width}px single-column hub`).toBe(true);
    }
  });

  test('P2.6 integrations tablet progression', async ({ page }) => {
    for (const width of P26_TABLET_WIDTHS) {
      await page.setViewportSize({ width, height: 1024 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readIntegrationsComposition(page);
      expect(state.tileCount, `${width}px tile count`).toBe(6);
      expect(state.coreVisible, `${width}px core visible`).toBe(true);
      if (width <= 1024) {
        expect(state.fullCardCount, `${width}px full-card surfaces`).toBe(0);
      }
    }
  });

  test('P2.6 integrations desktop hub restored', async ({ page }) => {
    for (const width of P26_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readIntegrationsComposition(page);
      expect(state.desktopHubActive, `${width}px desktop hub`).toBe(true);
      expect(state.coreVisible, `${width}px core visible`).toBe(true);
    }
  });

  test('P2.6 integrations CSS source ownership', async () => {
    const cssPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      '..',
      'src',
      'styles.css',
    );
    const css = await fs.readFile(cssPath, 'utf8');
    const sectionStart = css.indexOf('/* P2.6 — Integrations hub mobile composition');
    expect(sectionStart, 'integrations P2.6 section').toBeGreaterThan(-1);
    const mobileEnd = css.indexOf('@media (min-width: 1025px)', sectionStart);
    const mobileBlock = css.slice(sectionStart, mobileEnd);

    for (const pattern of [
      /padding:\s*14px\s+0/,
      /border-radius:\s*0/,
      /background:\s*transparent/,
      /border-bottom:\s*1px\s+solid\s+var\(--hairline\)/,
    ]) {
      expect(
        mobileBlock,
        `integrations mobile must not duplicate compact surface chrome (${pattern})`,
      ).not.toMatch(pattern);
    }

    const desktopBlock = css.slice(mobileEnd);
    const desktopOwners = [
      ...desktopBlock.matchAll(/\.hub--compact\s+\.hub__tile\s*\{([^}]+)\}/g),
    ];
    expect(desktopOwners, 'exactly one desktop hub tile card owner').toHaveLength(1);
    const ownerBody = desktopOwners[0]![1]!;
    expect(ownerBody).toContain('padding: var(--surface-padding)');
    expect(ownerBody).toContain('border: 1px solid var(--hairline)');
  });

  test('P2.6 closing and footer mobile polish', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const metrics = await readClosingFooterMetrics(page);
    expect(metrics.primaryMinHeight, '390px CTA primary min-height').toBeGreaterThanOrEqual(44);
    expect(metrics.closingHeight, '390px closing height').toBeGreaterThan(0);
    expect(metrics.footerHeight, '390px footer height').toBeGreaterThan(0);
    expect(metrics.pageHeight, '390px page height').toBeGreaterThan(8000);
  });

  test('P2.6 locale structural coverage (390 / 768 / 1440)', async ({ page }) => {
    for (const locale of ['de', 'en'] as const) {
      const url = locale === 'de' ? '/' : '/en/';
      for (const width of P26_LOCALE_WIDTHS) {
        await page.setViewportSize({ width, height: width <= 768 ? 844 : 900 });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const comm = await readCommunicationComposition(page);
        const hub = await readIntegrationsComposition(page);
        expect(comm.noteCount, `${locale} ${width}px comm notes`).toBe(3);
        expect(hub.tileCount, `${locale} ${width}px hub tiles`).toBe(6);
        expect(comm.scrollWidth, `${locale} ${width}px comm overflow`).toBeLessThanOrEqual(
          comm.clientWidth + 1,
        );
        expect(hub.scrollWidth, `${locale} ${width}px hub overflow`).toBeLessThanOrEqual(
          hub.clientWidth + 1,
        );
      }
    }
  });

  test('P2.6 landscape sanity', async ({ page }) => {
    for (const [width, height] of P26_LANDSCAPE) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const comm = await readCommunicationComposition(page);
      const hub = await readIntegrationsComposition(page);
      expect(comm.scrollWidth, `${width}x${height} comm overflow`).toBeLessThanOrEqual(
        comm.clientWidth + 1,
      );
      expect(hub.scrollWidth, `${width}x${height} hub overflow`).toBeLessThanOrEqual(
        hub.clientWidth + 1,
      );
    }
  });

  test('P2.6 communication product distance regression (390 DE)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const state = await readCommunicationComposition(page);
    expect(state.frameTopRel!, '390px communication frame distance').toBeLessThan(400);
    expect(state.frameTopRel!, '390px improved from P2.5 baseline').toBeLessThan(682);
  });

  test('captures P2.6 communication integrations closure screenshots', async ({ page }) => {
    const shots = [
      ['de', '/', 320, 700],
      ['de', '/', 375, 812],
      ['de', '/', 390, 844],
      ['de', '/', 430, 932],
      ['de', '/', 768, 1024],
      ['de', '/', 1440, 1000],
      ['en', '/en/', 320, 700],
      ['en', '/en/', 390, 844],
      ['en', '/en/', 430, 932],
      ['en', '/en/', 1440, 1000],
    ] as const;

    for (const [locale, url, width, height] of shots) {
      await page.setViewportSize({ width, height });
      await page.goto(url, { waitUntil: 'load' });
      await settle(page);
      await page.locator('#communication').screenshot({
        path: path.join(OUT, `${LABEL}p26-communication-${locale}-${width}.png`),
        animations: 'disabled',
      });
      await page.locator('#integrations').screenshot({
        path: path.join(OUT, `${LABEL}p26-integrations-${locale}-${width}.png`),
        animations: 'disabled',
      });
      await page.locator('.closing').screenshot({
        path: path.join(OUT, `${LABEL}p26-closing-${locale}-${width}.png`),
        animations: 'disabled',
      });
      await page.locator('.sitefooter').screenshot({
        path: path.join(OUT, `${LABEL}p26-footer-${locale}-${width}.png`),
        animations: 'disabled',
      });
    }
  });
});
