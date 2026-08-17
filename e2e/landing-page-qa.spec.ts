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
  'use-cases',
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
    languageLabel: 'Sprache',
    localeName: 'Deutsch',
    otherLocaleName: 'English',
    otherDir: '/en/',
    sales: 'Vertrieb kontaktieren',
    topLevel: ['Plattform', 'Produkte', 'Branchen', 'Integrationen', 'Ressourcen', 'Preise', 'Anmelden'],
    back: 'Zurück',
  },
  en: {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    platformCategory: 'Platform',
    languageLabel: 'Language',
    localeName: 'English',
    otherLocaleName: 'Deutsch',
    otherDir: '/',
    sales: 'Contact sales',
    topLevel: ['Platform', 'Products', 'Industries', 'Integrations', 'Resources', 'Pricing', 'Log in'],
    back: 'Back',
  },
} as const;

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
          decorative:
            node.closest('[aria-hidden="true"]') !== null ||
            node.closest('.hero__background') !== null,
          width: node.getAttribute('width'),
          height: node.getAttribute('height'),
          lazy: node.getAttribute('loading') === 'lazy',
          loaded: (node as HTMLImageElement).naturalWidth > 0,
          src: node.getAttribute('src'),
        })),
      );
      expect(images.length).toBeGreaterThan(0);
      for (const image of images) {
        if (image.decorative) {
          expect(image.alt, `decorative alt for ${image.src}`).toBe('');
        } else {
          expect(image.alt, `alt for ${image.src}`).toBeTruthy();
        }
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
    const url = locale === 'de' ? '/' : '/en/';
    const expected =
      locale === 'de'
        ? {
            title: 'Eine Plattform für jede Art von Flotte.',
            cards: [
              'Autovermietungen',
              'Flottenbetriebe',
              'Taxiflotten',
              'Schüler- & Personenbeförderung',
              'Lieferung & Logistik',
            ],
            status: 'In Arbeit',
          }
        : {
            title: 'One platform for every kind of fleet.',
            cards: [
              'Car rental companies',
              'Fleet operators',
              'Taxi fleets',
              'School & passenger transport',
              'Delivery & logistics',
            ],
            status: 'In progress',
          };

    test(`use cases content and imagery (${locale})`, async ({ page }) => {
      const { consoleErrors, failedRequests } = await collectProblems(page);
      await page.goto(url, { waitUntil: 'load' });
      await settle(page);

      const section = page.locator('#use-cases');
      await expect(section.getByRole('heading', { level: 2 })).toHaveText(expected.title);

      const cards = section.locator('.use-case-card');
      await expect(cards).toHaveCount(5);
      await expect(cards.locator('h3')).toHaveText(expected.cards);
      await expect(cards.locator('.use-case-card__status')).toHaveCount(4);
      await expect(cards.locator('.use-case-card__status')).toHaveText(Array(4).fill(expected.status));
      await expect(cards.first().locator('.use-case-card__status')).toHaveCount(0);

      const images = await cards.locator('img').evaluateAll((nodes) =>
        nodes.map((node) => {
          const image = node as HTMLImageElement;
          return {
            alt: image.alt,
            width: image.getAttribute('width'),
            height: image.getAttribute('height'),
            loading: image.loading,
            decoding: image.decoding,
            loaded: image.naturalWidth > 0,
          };
        }),
      );
      expect(images).toHaveLength(5);
      for (const image of images) {
        expect(image.alt).toBeTruthy();
        expect(image.width).toBe('1672');
        expect(image.height).toBe('941');
        expect(image.loading).toBe('lazy');
        expect(image.decoding).toBe('async');
        expect(image.loaded).toBe(true);
      }

      expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
      expect(failedRequests, failedRequests.join('\n')).toEqual([]);
    });
  }

  test('use cases mobile header is centered', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const head = page.locator('#use-cases .section-head');
    await expect(head).toHaveCSS('text-align', 'center');

    const alignment = await head.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const viewport = document.documentElement.clientWidth;
      const centerDelta = Math.abs(rect.left + rect.width / 2 - viewport / 2);
      return { centerDelta, textAlign: window.getComputedStyle(node).textAlign };
    });
    expect(alignment.textAlign).toBe('center');
    expect(alignment.centerDelta).toBeLessThanOrEqual(2);
  });

  test('use cases mobile cards expand and collapse', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const section = page.locator('#use-cases');
    const rental = section.locator('.use-case-card--rental');
    const fleet = section.locator('.use-case-card--fleet');
    const rentalTrigger = rental.locator('.use-case-card__trigger');

    await expect(rentalTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(rental.locator('.use-case-card__panel')).toBeHidden();

    await rentalTrigger.click();
    await expect(rentalTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(rental).toHaveAttribute('data-expanded', 'true');
    await expect(rental.locator('.use-case-card__features li')).toHaveCount(4);

    const expandedHeight = await rental.evaluate((node) => node.getBoundingClientRect().height);
    expect(expandedHeight).toBeGreaterThan(560);

    await fleet.locator('.use-case-card__trigger').click();
    await expect(rentalTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(fleet.locator('.use-case-card__trigger')).toHaveAttribute('aria-expanded', 'true');

    await fleet.locator('.use-case-card__trigger').click();
    await expect(fleet.locator('.use-case-card__trigger')).toHaveAttribute('aria-expanded', 'false');
  });

  test('use cases desktop keeps static cards without mobile expand chrome', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const rental = page.locator('#use-cases .use-case-card--rental');
    await expect(rental.locator('.use-case-card__chevron')).toBeHidden();
    await expect(rental.locator('.use-case-card__panel')).toBeHidden();

    await rental.evaluate((node) => {
      const trigger = node.querySelector('.use-case-card__trigger');
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(rental).not.toHaveAttribute('data-expanded', 'true');
    await expect(rental.locator('.use-case-card__trigger')).toHaveAttribute('aria-expanded', 'false');
  });

  test('use cases mobile expanded content shows four features per card', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/en/', { waitUntil: 'load' });
    await settle(page);

    const cards = page.locator('#use-cases .use-case-card');
    await expect(cards).toHaveCount(5);

    for (let index = 0; index < 5; index += 1) {
      const card = cards.nth(index);
      const trigger = card.locator('.use-case-card__trigger');
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(card.locator('.use-case-card__features li')).toHaveCount(4);
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('use cases desktop never exposes expanded feature panels', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    for (const url of ['/', '/en/'] as const) {
      await page.goto(url, { waitUntil: 'load' });
      await settle(page);

      const cards = page.locator('#use-cases .use-case-card');
      await expect(cards).toHaveCount(5);

      for (let index = 0; index < 5; index += 1) {
        const card = cards.nth(index);
        await expect(card.locator('.use-case-card__panel')).toBeHidden();
        await expect(card.locator('.use-case-card__features')).toBeHidden();
      }

      const forbiddenClaims = await page.locator('#use-cases').evaluate((section) => {
        const text = section.textContent ?? '';
        return [
          /Dispatching/i.test(text),
          /plan and dispatch recurring journeys/i.test(text),
          /Coordinate vehicles, routes and dispatch/i.test(text),
          /planen und disponieren/i.test(text),
          /Touren und Dispatching/i.test(text),
        ].some(Boolean);
      });
      expect(forbiddenClaims).toBe(false);
    }
  });

  test('use cases responsive composition', async ({ page }) => {
    const widths = [320, 390, 430, 760, 768, 1024, 1280, 1440] as const;

    for (const width of widths) {
      await page.setViewportSize({ width, height: width <= 760 ? 932 : 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const geometry = await page.locator('#use-cases').evaluate((section) => {
        const cards = Array.from(section.querySelectorAll('.use-case-card'));
        const rects = cards.map((card) => {
          const rect = card.getBoundingClientRect();
          return {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            right: Math.round(rect.right),
            bottom: Math.round(rect.bottom),
            width: Math.round(rect.width),
          };
        });
        return {
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          rects,
        };
      });

      expect(geometry.rects).toHaveLength(5);
      expect(geometry.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(
        geometry.clientWidth + 1,
      );

      if (width <= 760) {
        for (let index = 1; index < geometry.rects.length; index += 1) {
          expect(
            geometry.rects[index].top,
            `${width}px card ${index + 1} order`,
          ).toBeGreaterThan(geometry.rects[index - 1].bottom);
          expect(
            Math.abs(geometry.rects[index].left - geometry.rects[0].left),
            `${width}px single column left edge`,
          ).toBeLessThanOrEqual(1);
          expect(
            Math.abs(geometry.rects[index].width - geometry.rects[0].width),
            `${width}px single column width`,
          ).toBeLessThanOrEqual(1);
        }
      } else if (width <= 1024) {
        expect(geometry.rects[0].width, `${width}px lead full width`).toBeGreaterThan(
          geometry.rects[1].width * 1.8,
        );
        expect(Math.abs(geometry.rects[1].top - geometry.rects[2].top)).toBeLessThanOrEqual(1);
        expect(Math.abs(geometry.rects[3].top - geometry.rects[4].top)).toBeLessThanOrEqual(1);
      } else {
        expect(geometry.rects[0].left).toBeLessThan(geometry.rects[1].left);
        expect(Math.abs(geometry.rects[0].top - geometry.rects[1].top)).toBeLessThanOrEqual(1);
        expect(Math.abs(geometry.rects[1].top - geometry.rects[2].top)).toBeLessThanOrEqual(1);
        expect(Math.abs(geometry.rects[3].top - geometry.rects[4].top)).toBeLessThanOrEqual(1);
        expect(Math.abs(geometry.rects[0].bottom - geometry.rects[4].bottom)).toBeLessThanOrEqual(2);
      }
    }
  });

  for (const locale of ['de', 'en'] as const) {
    const url = locale === 'de' ? '/' : '/en/';
    const expected =
      locale === 'de'
        ? {
            eyebrow: 'VOLLSTÄNDIG VERNETZTE MOBILITY OPERATIONS',
            title: 'Alles, was Ihr Betrieb braucht. Vollständig vernetzt.',
            cards: [
              'Eine Plattform für den gesamten Betrieb',
              'Fahrzeuge verstehen. Früher handeln.',
              'Abläufe automatisch ausführen',
              'KI, die im Betrieb mitarbeitet',
            ],
            removed: [
              'Gemeinsame Datenbasis',
              'Ein operativer Kontext',
              'Weniger Systembrüche',
              'Abgegrenzter Zugriff',
            ],
          }
        : {
            eyebrow: 'FULLY CONNECTED MOBILITY OPERATIONS',
            title: 'Everything your operation needs. Fully connected.',
            cards: [
              'One platform for the entire operation',
              'Understand vehicles. Act earlier.',
              'Run workflows automatically',
              'AI that works inside your operation',
            ],
            removed: ['Shared data model', 'One operational context', 'Fewer system breaks', 'Scoped access'],
          };

    test(`unified platform copy and capability grid (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(url, { waitUntil: 'load' });
      await settle(page);

      const section = page.locator('#platform');
      await expect(section.locator('.eyebrow')).toHaveText(expected.eyebrow);
      await expect(section.getByRole('heading', { level: 2 })).toHaveText(expected.title);
      await expect(section.locator('.capability')).toHaveCount(4);
      await expect(section.locator('.capability h3')).toHaveText(expected.cards);

      const sectionText = await section.innerText();
      for (const title of expected.removed) {
        expect(sectionText).not.toContain(title);
      }
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

    await panel.getByRole('button', { name: 'Plattform' }).click();
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
      await expect(panel.locator('.mobilenav__brand img')).toBeVisible();
      await expect(panel.getByRole('button', { name: mobile.closeMenu })).toBeVisible();
      await expect(panel.locator('.mobilenav__root-list > li')).toHaveCount(7);
      for (const item of mobile.topLevel) {
        await expect(
          panel.getByRole(item === spec.login || item === mobile.topLevel[3] ? 'link' : 'button', {
            name: item === mobile.topLevel[5] ? new RegExp(`^${item}`) : item,
          }),
        ).toBeVisible();
      }
      await expect(panel.getByRole('link', { name: spec.login })).toHaveAttribute(
        'href',
        'https://app.synqdrive.eu',
      );
      await expect(panel.getByRole('link', { name: spec.demo })).toHaveAttribute(
        'href',
        /^mailto:info@synqdrive\.eu/,
      );
      await expect(panel.getByRole('link', { name: mobile.sales })).toHaveAttribute(
        'href',
        'mailto:info@synqdrive.eu',
      );
      await expect(panel.getByText(mobile.localeName)).toHaveAttribute('aria-current', 'true');
      await expect(panel.getByRole('link', { name: mobile.otherLocaleName })).toHaveAttribute(
        'href',
        mobile.otherDir,
      );

      for (const link of spec.links) {
        await expect(panel.getByRole('link', { name: link.label })).toHaveCount(0);
      }
      await expect(panel.getByText(/^(Konto|Account)$/)).toHaveCount(0);
      await expect(panel.locator('.mobilenav__section-label')).toHaveCount(0);

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
      await expect(close).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(panel.locator('[data-nav-submenu="platform"]')).toBeFocused();

      const focusables = panel.locator('a[href]:visible, button:not([disabled]):visible');
      const focusableCount = await focusables.count();
      for (let index = 1; index < focusableCount; index += 1) {
        await page.keyboard.press('Tab');
        expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[data-nav-panel]')))).toBe(
          true,
        );
      }

      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveClass(/mobilenav__row|mobilenav__brand/);

      await close.focus();
      await page.keyboard.press('Enter');
      await expect(panel).toBeHidden();
      await expect(panel).toHaveAttribute('inert', '');
      await expect(toggle).toBeFocused();
    });

    test(`mobile navigation hierarchy and subviews (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(url, { waitUntil: 'load' });

      const panel = page.locator('[data-nav-panel]');
      const toggle = page.getByRole('button', { name: mobile.openMenu });
      await toggle.click();

      await expect(panel.locator('.mobilenav__root-list > li')).toHaveCount(7);
      if (locale === 'de') {
        await expect(panel.getByText(/^Lösungen$/)).toHaveCount(0);
        await expect(panel.getByRole('button', { name: 'Produkte' })).toHaveCount(1);
      } else {
        await expect(panel.getByText(/^Solutions$/)).toHaveCount(0);
        await expect(panel.getByRole('button', { name: 'Products' })).toHaveCount(1);
      }

      const platformTrigger = panel.locator('[data-nav-submenu="platform"]');
      await platformTrigger.click();
      await expect(platformTrigger).toHaveAttribute('aria-expanded', 'true');
      await expect(panel.locator('[data-nav-view="root"]')).toBeHidden();
      await expect(panel.locator('[data-nav-view="platform"]')).toBeVisible();
      await expect(panel.getByRole('button', { name: mobile.back })).toBeFocused();
      for (const link of spec.links) {
        await expect(panel.getByRole('link', { name: link.label })).toHaveCount(1);
      }

      await panel.getByRole('button', { name: mobile.back }).click();
      await expect(panel.locator('[data-nav-view="root"]')).toBeVisible();
      await expect(platformTrigger).toBeFocused();

      const productsLabel = mobile.topLevel[1];
      const productsTrigger = panel.locator('[data-nav-submenu="products"]');
      await productsTrigger.click();
      await expect(panel.locator('[data-nav-view="products"]')).toBeVisible();
      await expect(panel.locator('[data-nav-view="root"]')).toBeHidden();
      await expect(panel.getByRole('button', { name: mobile.back })).toBeFocused();
      const productLabels =
        locale === 'de'
          ? [
              'Rental Operations',
              'Fleet Operations',
              'Delivery Operations',
              'Mobility Operations',
            ]
          : [
              'Rental Operations',
              'Fleet Operations',
              'Delivery Operations',
              'Mobility Operations',
            ];
      for (const label of productLabels) {
        await expect(panel.locator('[data-nav-view="products"]').getByText(label, { exact: true })).toHaveCount(1);
      }
      await expect(panel.locator('[data-nav-view="products"] li')).toHaveCount(4);
      await expect(panel.getByRole('link', { name: 'Rental Operations' })).toHaveAttribute(
        'href',
        'https://app.synqdrive.eu',
      );
      await expect(panel.locator('[data-nav-view="products"] a[href]')).toHaveCount(1);
      await expect(panel.locator('[data-nav-view="products"] [aria-disabled="true"]')).toHaveCount(3);
      await expect(panel.locator('[data-nav-view="products"] a[href="#"]')).toHaveCount(0);
      if (locale === 'de') {
        await expect(panel.getByRole('link', { name: 'Fleet Operations' })).toHaveCount(0);
        await expect(
          panel.locator('[data-nav-view="products"] .mobilenav__badge', { hasText: 'In Arbeit' }),
        ).toHaveCount(3);
      } else {
        await expect(
          panel.locator('[data-nav-view="products"] .mobilenav__badge', { hasText: 'In progress' }),
        ).toHaveCount(3);
      }
      await expect(panel.getByText('Buchung & Disposition')).toHaveCount(0);
      await expect(panel.getByText('Booking & Dispatch')).toHaveCount(0);
      await expect(panel.getByText('Kunden- & Fahrerkommunikation')).toHaveCount(0);
      await expect(panel.getByText('Customer & Driver Communication')).toHaveCount(0);
      await panel.getByRole('button', { name: mobile.back }).click();
      await expect(productsTrigger).toBeFocused();

      const industriesLabel = mobile.topLevel[2];
      await panel.getByRole('button', { name: industriesLabel }).click();
      await expect(panel.locator('[data-nav-view="industries"]')).toBeVisible();
      await expect(panel.locator('[data-nav-view="industries"] [aria-disabled="true"]')).toHaveCount(5);
      await expect(panel.locator('[data-nav-view="industries"] a')).toHaveCount(0);
      await panel.getByRole('button', { name: mobile.back }).click();

      const resourcesLabel = mobile.topLevel[4];
      const resourcesTrigger = panel.locator('[data-nav-submenu="resources"]');
      await resourcesTrigger.click();
      await expect(panel.locator('[data-nav-view="root"]')).toBeHidden();
      await expect(panel.locator('[data-nav-view="resources"]')).toBeVisible();
      await expect(panel.getByRole('button', { name: mobile.back })).toBeFocused();
      const resourcesLinks =
        locale === 'de'
          ? [
              { label: 'Produktüberblick', href: '#platform' },
              { label: 'Kontakt', href: 'mailto:info@synqdrive.eu' },
              { label: 'Demo', href: /^mailto:info@synqdrive\.eu/ },
            ]
          : [
              { label: 'Product Overview', href: '#platform' },
              { label: 'Contact', href: 'mailto:info@synqdrive.eu' },
              { label: 'Demo', href: /^mailto:info@synqdrive\.eu/ },
            ];
      for (const link of resourcesLinks) {
        await expect(panel.getByRole('link', { name: link.label })).toHaveCount(1);
        await expect(panel.getByRole('link', { name: link.label })).toHaveAttribute('href', link.href);
      }
      await expect(panel.locator('[data-nav-view="resources"] a[href="#"]')).toHaveCount(0);
      await expect(panel.locator('[data-nav-view="resources"] [aria-disabled="true"]')).toHaveCount(0);

      await panel.getByRole('button', { name: mobile.back }).click();
      await expect(panel.locator('[data-nav-view="root"]')).toBeVisible();
      await expect(resourcesTrigger).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(panel).toBeHidden();
      await expect(toggle).toBeFocused();
    });
  }

  test('mobile navigation responsive matrix and bottom actions', async ({ page }) => {
    for (const [width, height] of [
      [320, 700],
      [360, 800],
      [375, 812],
      [390, 844],
      [393, 852],
      [414, 896],
      [430, 932],
      [480, 900],
      [667, 375],
      [844, 390],
      [932, 430],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await page.getByRole('button', { name: 'Menü öffnen' }).click();

      const panel = page.locator('[data-nav-panel]');
      const scroll = panel.locator('.mobilenav__scroll');
      await scroll.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });

      for (const label of ['Demo anfragen', 'Vertrieb kontaktieren', 'English']) {
        const control = panel.getByRole('link', { name: label });
        await expect(control).toBeVisible();
        const box = await control.boundingBox();
        expect(box?.height ?? 0, `${width}px ${label}`).toBeGreaterThanOrEqual(44);
      }

      const overflow = await panel.evaluate(
        (node) => node.scrollWidth - node.clientWidth,
      );
      expect(overflow, `${width}x${height}`).toBeLessThanOrEqual(1);
      await page.keyboard.press('Escape');
    }

    for (const [localeUrl, openLabel] of [
      ['/', 'Menü öffnen'],
      ['/en/', 'Open menu'],
    ] as const) {
      for (const width of [320, 390, 430]) {
        await page.setViewportSize({ width, height: width === 320 ? 700 : 844 });
        await page.goto(localeUrl, { waitUntil: 'load' });
        await page.getByRole('button', { name: openLabel }).click();
        await expect(page.locator('.mobilenav__root-list > li')).toHaveCount(7);
        expect(
          await page.locator('[data-nav-panel]').evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
          `${localeUrl} ${width}px`,
        ).toBe(true);
        await page.keyboard.press('Escape');
      }
    }
  });

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

  test('mobile navigation restores page scroll after close from submenu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(100);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(400);

    await page.evaluate(() => {
      document.querySelector('[data-nav-toggle]')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      document.querySelector('[data-nav-toggle]')?.click();
    });

    const panel = page.locator('[data-nav-panel]');
    await expect(panel).toBeVisible();
    await page.evaluate(() => {
      document.querySelector('[data-nav-submenu="platform"]')?.click();
      document.querySelector('[data-nav-close]')?.click();
    });
    await expect(panel).toBeHidden();
    await expect(page.locator('html')).not.toHaveAttribute('data-nav-scroll-lock');

    await expect
      .poll(() => page.evaluate((expected) => Math.abs(window.scrollY - expected), scrollBefore), {
        timeout: 3000,
      })
      .toBeLessThanOrEqual(48);

    const scrollAfterClose = await page.evaluate(() => window.scrollY);
    await page.evaluate((y) => window.scrollTo({ top: y + 240, behavior: 'instant' }), scrollAfterClose);
    await expect
      .poll(() => page.evaluate((start) => window.scrollY - start, scrollAfterClose), { timeout: 3000 })
      .toBeGreaterThan(120);
  });

  test('mobile navigation restores page scroll after in-menu anchor selection', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, 2200));
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      document.querySelector('[data-nav-toggle]')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      document.querySelector('[data-nav-toggle]')?.click();
    });

    const panel = page.locator('[data-nav-panel]');
    await expect(panel).toBeVisible();
    await page.evaluate(() => {
      document.querySelector('[data-nav-submenu="platform"]')?.click();
      document.querySelector('.mobilenav__subrow[href="#communication"]')?.click();
    });
    await expect(panel).toBeHidden();
    await expect(page).toHaveURL(/#communication$/);
    await expect(page.locator('html')).not.toHaveAttribute('data-nav-scroll-lock');

    const scrollAfterNav = await page.evaluate(() => window.scrollY);
    await page.evaluate((y) => window.scrollTo({ top: y + 240, behavior: 'instant' }), scrollAfterNav);
    await expect
      .poll(() => page.evaluate((start) => window.scrollY - start, scrollAfterNav), { timeout: 3000 })
      .toBeGreaterThan(120);
  });

  test('mobile navigation covers full viewport when opened while scrolled', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, 2200));
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      document.querySelector('[data-nav-toggle]')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      document.querySelector('[data-nav-toggle]')?.click();
    });

    const panel = page.locator('[data-nav-panel]');
    await expect(panel).toBeVisible();

    const geometry = await page.evaluate(() => {
      const panelEl = document.querySelector('[data-nav-panel]');
      const rect = panelEl?.getBoundingClientRect();
      return {
        insideMasthead: Boolean(panelEl?.closest('.masthead')),
        panelHeight: rect?.height ?? 0,
        viewportHeight: window.innerHeight,
      };
    });

    expect(geometry.insideMasthead).toBe(false);
    expect(geometry.panelHeight).toBeGreaterThanOrEqual(geometry.viewportHeight * 0.95);
  });

  test('mobile navigation shields close control from phantom open tap when scrolled', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => window.scrollTo(0, 1800));
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      document.querySelector('[data-nav-toggle]')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      document.querySelector('[data-nav-toggle]')?.click();
    });

    const panel = page.locator('[data-nav-panel]');
    const close = panel.locator('[data-nav-close]');
    await expect(panel).toBeVisible();
    await expect
      .poll(async () => close.evaluate((node) => getComputedStyle(node).pointerEvents))
      .toBe('none');

    await page.waitForTimeout(500);
    await expect
      .poll(async () => close.evaluate((node) => getComputedStyle(node).pointerEvents))
      .toBe('auto');

    await page.evaluate(() => document.querySelector('[data-nav-close]')?.click());
    await expect(panel).toBeHidden();
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

  test('captures mobile navigation hierarchy screenshots', async ({ page }) => {
    for (const [locale, url, openLabel, platform, products, industries, resources, width, height] of [
      ['de', '/', 'Menü öffnen', 'Plattform', 'Produkte', 'Branchen', 'Ressourcen', 320, 700],
      ['de', '/', 'Menü öffnen', 'Plattform', 'Produkte', 'Branchen', 'Ressourcen', 390, 844],
      ['de', '/', 'Menü öffnen', 'Plattform', 'Produkte', 'Branchen', 'Ressourcen', 430, 932],
      ['en', '/en/', 'Open menu', 'Platform', 'Products', 'Industries', 'Resources', 390, 844],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.goto(url, { waitUntil: 'load' });
      await shootHeader(page, `nav-hotfix-${locale}-${width}-closed`);

      await page.getByRole('button', { name: openLabel }).click();
      const panel = page.locator('[data-nav-panel]');
      await expect(panel).toBeVisible();
      await panel.screenshot({
        path: path.join(OUT, `${LABEL}nav-hotfix-${locale}-${width}-root.png`),
        animations: 'disabled',
      });

      for (const [label, state] of [
        [platform, 'platform'],
        [products, 'products'],
        [industries, 'industries'],
        [resources, 'resources'],
      ] as const) {
        await panel.getByRole('button', { name: label }).click();
        await panel.screenshot({
          path: path.join(OUT, `${LABEL}nav-hotfix-${locale}-${width}-${state}.png`),
          animations: 'disabled',
        });
        await panel.locator('[data-nav-view]:not([hidden]) [data-nav-back]').click();
      }
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
    const cls = await measurePageCls(page, '/');
    expect(cls).toBeLessThan(0.1);
  });

  async function measurePageCls(page: Page, url: string, waitMs = 3500) {
    await page.goto(url, { waitUntil: 'commit' });
    return page.evaluate(
      (timeoutMs) =>
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
          setTimeout(() => resolve(total), timeoutMs);
        }),
      waitMs,
    );
  }

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
          const hero = document.querySelector('.hero');
          const heroStyles = hero ? getComputedStyle(hero) : null;
          const heroBackground = document.querySelector('.hero__background img');
          const heroBackgroundRect = heroBackground?.getBoundingClientRect();
          const primary = document.querySelector('.hero .action--primary');
          const primaryRect = primary?.getBoundingClientRect();
          const heroPicture = document.querySelector('.hero__background source[media]');
          return {
            scrollWidth: root.scrollWidth,
            clientWidth: root.clientWidth,
            gutterPx: heroStyles ? parseFloat(heroStyles.paddingInlineStart) : 0,
            sectionY: parseFloat(styles.getPropertyValue('--section-y')),
            typeDisplay: styles.getPropertyValue('--type-display').trim(),
            backgroundWidth: heroBackgroundRect?.width ?? 0,
            backgroundLeft: heroBackgroundRect?.left ?? 0,
            backgroundRight: heroBackgroundRect?.right ?? 0,
            primaryHeight: primaryRect?.height ?? 0,
            hasHeroBackground: Boolean(document.querySelector('.hero__background')),
            hasHeroProductFrame: Boolean(document.querySelector('.hero__media .frame--product')),
            hasLayoutSplit: Boolean(document.querySelector('.split.layout-split, .brief.layout-split')),
            mobileSourceMedia: heroPicture?.getAttribute('media') ?? null,
          };
        });

        expect(layout.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(layout.clientWidth + 1);
        expect(layout.hasHeroBackground, `${width}px hero background`).toBe(true);
        expect(layout.hasHeroProductFrame, `${width}px hero product frame`).toBe(false);
        expect(layout.hasLayoutSplit, `${width}px layout-split sections`).toBe(true);
        expect(layout.sectionY, `${width}px section-y token`).toBe(expectedSectionY(width));
        expect(layout.typeDisplay, `${width}px type-display token`).toBeTruthy();
        expect(layout.backgroundWidth, `${width}px hero background width`).toBeGreaterThan(0);
        expect(layout.backgroundLeft, `${width}px hero background left`).toBeGreaterThanOrEqual(-1);
        expect(layout.backgroundRight, `${width}px hero background right`).toBeLessThanOrEqual(width + 1);
        expect(layout.primaryHeight, `${width}px CTA height`).toBeGreaterThanOrEqual(44);

        if (width <= 760) {
          expect(layout.mobileSourceMedia, `${width}px hero mobile source`).toContain('760px');
          expect(layout.backgroundLeft, `${width}px hero bleed left`).toBeLessThanOrEqual(1);
          expect(layout.backgroundRight, `${width}px hero bleed right`).toBeGreaterThanOrEqual(width - 1);
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
        const heroBackground = document.querySelector('.hero__background img');
        const heroBgStyles = heroBackground ? getComputedStyle(heroBackground) : null;
        const heroBgRect = heroBackground?.getBoundingClientRect();
        const flushFrame = document.querySelector('.stage__media .frame--flush');
        const flushStyles = flushFrame ? getComputedStyle(flushFrame) : null;
        const flushRect = flushFrame?.getBoundingClientRect();
        const stageMedia = document.querySelector('.stage__media');
        const stageRect = stageMedia?.getBoundingClientRect();
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hero: {
            objectFit: heroBgStyles?.objectFit ?? null,
            left: heroBgRect?.left ?? null,
            right: heroBgRect?.right ?? null,
            width: heroBgRect?.width ?? null,
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
      expect(geometry.hero.objectFit, `${width}px hero object-fit`).toBe('cover');
      expect(geometry.hero.left!, `${width}px hero left edge`).toBeGreaterThanOrEqual(-1);
      expect(geometry.hero.right!, `${width}px hero right edge`).toBeLessThanOrEqual(width + 1);
      expect(geometry.hero.width!, `${width}px hero background width`).toBeGreaterThanOrEqual(
        geometry.clientWidth - 1,
      );

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
        const heroBackground = document.querySelector('.hero__background img');
        const flushFrame = document.querySelector('.stage__media .frame--flush');
        const h1 = document.querySelector('.hero h1');
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          heroBackgroundWidth: heroBackground?.getBoundingClientRect().width ?? 0,
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
      expect(state.heroBackgroundWidth, `${width}x${height} hero background`).toBeGreaterThan(0);
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
      const background = document.querySelector('.hero__background img');
      const h1 = document.querySelector('.hero h1');
      const primary = document.querySelector('.hero .action--primary');
      const heroPicture = document.querySelector('.hero__background source[media]');

      const rect = (el: Element | null) => el?.getBoundingClientRect() ?? null;
      const heroRect = rect(hero);
      const backgroundRect = rect(background);
      const primaryRect = rect(primary);
      const introRect = rect(intro);
      const isMobile = window.matchMedia('(max-width: 760px)').matches;
      const isDesktop = window.matchMedia('(min-width: 1025px)').matches;

      const heroHeight = heroRect?.height ?? 0;
      const heroTop = heroRect?.top ?? 0;
      const introBottomRel =
        introRect && heroRect
          ? Math.round((introRect.bottom - heroRect.top) * 10) / 10
          : null;

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        heroHeight,
        h1Height: rect(h1)?.height ?? 0,
        ctaHeight: primaryRect?.height ?? 0,
        backgroundWidth: backgroundRect?.width ?? 0,
        backgroundHeight: backgroundRect?.height ?? 0,
        backgroundTop: backgroundRect?.top ?? 0,
        introBottom: introRect?.bottom ?? 0,
        introBottomRel,
        introRight: introRect?.right ?? 0,
        heroWidth: heroRect?.width ?? 0,
        heroTop,
        primaryVisible: primaryRect ? primaryRect.height >= 44 && primaryRect.width > 0 : false,
        h1Visible: !!h1 && (rect(h1)?.height ?? 0) > 0,
        mobileSourceMedia: heroPicture?.getAttribute('media') ?? null,
        heroImgLoading: background?.getAttribute('loading') ?? null,
        heroImgFetchPriority: background?.getAttribute('fetchpriority') ?? null,
        hasHeroBackground: Boolean(document.querySelector('.hero__background')),
        hasHeroProductFrame: Boolean(document.querySelector('.hero__media .frame--product')),
        contentInUpperHero:
          introRect && heroHeight > 0
            ? introRect.bottom <= heroTop + heroHeight * 0.78
            : null,
        contentOnLeft:
          introRect && heroRect && isDesktop
            ? introRect.right <= heroRect.left + heroRect.width * 0.58
            : null,
        isMobile,
        isDesktop,
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
        expect(state.hasHeroBackground, `${width}px hero background`).toBe(true);
        expect(state.hasHeroProductFrame, `${width}px hero product frame`).toBe(false);
        expect(state.backgroundWidth, `${width}px hero background width`).toBeGreaterThanOrEqual(
          state.clientWidth - 1,
        );
        expect(state.contentInUpperHero, `${width}px hero content upper`).toBe(true);
        expect(state.mobileSourceMedia, `${width}px hero mobile source`).toContain('760px');
        expect(state.heroImgLoading, `${width}px hero loading`).toBe('eager');
        expect(state.heroImgFetchPriority, `${width}px hero fetchpriority`).toBe('high');
      }
    });
  }

  for (const locale of ['de', 'en'] as const) {
    const url = locale === 'de' ? '/' : '/en/';
    const expected =
      locale === 'de'
        ? {
            eyebrow: 'Connected Vehicle Intelligence Plattform',
            title: 'Alles, was Ihre Flotte braucht. In Echtzeit.',
            body:
              'SynqDrive verbindet Fahrzeuge, Prozesse und KI in einer Plattform für automatisierte Abläufe, Effizienzsteigerung, bessere Auslastung und weniger Aufwand im Tagesgeschäft.',
          }
        : {
            eyebrow: 'Connected Vehicle Intelligence Platform',
            title: 'Everything your fleet needs. In real time.',
            body:
              'SynqDrive connects vehicles, processes and AI in one platform for automated workflows, greater efficiency, better utilisation and less effort in day-to-day operations.',
          };

    test(`hero differentiated copy structure (${locale})`, async ({ page }) => {
      for (const [width, height] of [
        [1440, 900],
        [1024, 900],
        [760, 900],
        [430, 932],
        [390, 844],
      ] as const) {
        await page.setViewportSize({ width, height });
        await page.goto(url, { waitUntil: 'load' });
        await settle(page);

        const state = await page.locator('.hero').evaluate((hero) => {
          const h1 = hero.querySelector('h1');
          const main = hero.querySelector('.hero__title-main');
          const emphasis = hero.querySelector('.hero__title-emphasis');
          const body = hero.querySelector('.hero__body');
          const actions = hero.querySelector('.hero__actions');
          const rect = (element: Element | null) => element?.getBoundingClientRect() ?? null;
          const bodyRect = rect(body);
          const actionsRect = rect(actions);

          return {
            eyebrow: hero.querySelector('.eyebrow')?.textContent?.trim() ?? '',
            title: h1?.textContent?.trim().replace(/\s+/g, ' ') ?? '',
            body: body?.textContent?.trim().replace(/\s+/g, ' ') ?? '',
            h1Children: h1?.children.length ?? 0,
            mainWeight: Number(main ? getComputedStyle(main).fontWeight : 0),
            emphasisWeight: Number(emphasis ? getComputedStyle(emphasis).fontWeight : 0),
            mainColor: main ? getComputedStyle(main).color : '',
            emphasisColor: emphasis ? getComputedStyle(emphasis).color : '',
            bodyTag: body?.tagName ?? '',
            bodyChildren: body?.children.length ?? 0,
            bodyWidth: bodyRect?.width ?? 0,
            actionsGap: actionsRect && bodyRect ? actionsRect.top - bodyRect.bottom : 0,
            overflow:
              document.documentElement.scrollWidth - document.documentElement.clientWidth,
          };
        });

        expect(state.eyebrow, `${width}px eyebrow`).toBe(expected.eyebrow);
        expect(state.title, `${width}px h1`).toBe(expected.title);
        expect(state.body, `${width}px body copy`).toBe(expected.body);
        expect(state.h1Children, `${width}px h1 span count`).toBe(2);
        expect(state.emphasisWeight, `${width}px emphasis weight`).toBeGreaterThan(
          state.mainWeight,
        );
        expect(state.emphasisColor, `${width}px emphasis color`).not.toBe(state.mainColor);
        expect(state.bodyTag, `${width}px semantic body`).toBe('P');
        expect(state.bodyChildren, `${width}px unified body children`).toBe(0);
        expect(state.bodyWidth, `${width}px body width`).toBeGreaterThan(0);
        expect(state.actionsGap, `${width}px body-actions gap`).toBeGreaterThanOrEqual(16);
        expect(state.overflow, `${width}px overflow`).toBeLessThanOrEqual(1);
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
      expect(state.hasHeroBackground, `${width}px hero background`).toBe(true);
      expect(state.backgroundWidth, `${width}px background width`).toBeGreaterThanOrEqual(
        state.clientWidth - 1,
      );
    }

    for (const width of P23_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readHeroComposition(page);
      expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
      expect(state.contentOnLeft, `${width}px desktop content left`).toBe(true);
      expect(state.backgroundWidth, `${width}px desktop background width`).toBeGreaterThanOrEqual(
        state.clientWidth - 1,
      );
    }
  });

  test('P2.3.1 hero desktop content-left composition', async ({ page }) => {
    for (const width of P23_DESKTOP_WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readHeroComposition(page);
      expect(state.contentOnLeft, `${width}px desktop content left`).toBe(true);
      expect(state.hasHeroProductFrame, `${width}px hero product frame`).toBe(false);
      await expect(page.locator('.hero__proof')).toHaveCount(0);
    }
  });

  test('P2.3.1 hero mobile content-above-fleet regression', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const state = await readHeroComposition(page);
    expect(state.contentInUpperHero, '390px content in upper hero').toBe(true);
    expect(state.introBottomRel, '390px intro bottom rel').not.toBeNull();
    expect(state.introBottomRel!, '390px intro bottom rel min').toBeGreaterThanOrEqual(280);
    expect(state.introBottomRel!, '390px intro bottom rel max').toBeLessThanOrEqual(520);
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
      expect(state.backgroundWidth, `${width}x${height} background width`).toBeGreaterThan(0);
      expect(state.contentInUpperHero, `${width}x${height} content upper`).toBe(true);
      expect(state.primaryVisible, `${width}x${height} CTA target`).toBe(true);
    }
  });

  test('P2.3 hero metrics capture (390 DE)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const metrics = await readHeroComposition(page);
    expect(metrics.heroHeight).toBeGreaterThan(0);
    expect(metrics.backgroundHeight).toBeGreaterThan(0);
    expect(metrics.backgroundWidth).toBeGreaterThanOrEqual(metrics.clientWidth - 1);
    expect(metrics.contentInUpperHero).toBe(true);
    expect(metrics.hasHeroProductFrame).toBe(false);
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
      const leftColumn = section?.querySelector('.hub__column--left');
      const rightColumn = section?.querySelector('.hub__column--right');
      const tiles = section?.querySelectorAll('.hub__tile');
      const diagram = section?.querySelector('.hub__diagram');
      const sectionRect = section?.getBoundingClientRect();
      const coreRect = core?.getBoundingClientRect();
      const leftColumnRect = leftColumn?.getBoundingClientRect();
      const rightColumnRect = rightColumn?.getBoundingClientRect();
      const coreStyles = core ? getComputedStyle(core) : null;
      const rightColumnStyles = rightColumn ? getComputedStyle(rightColumn) : null;
      const diagramStyles = diagram ? getComputedStyle(diagram) : null;

      const tileMetrics = Array.from(tiles ?? []).map((el) => {
        const rect = el.getBoundingClientRect();
        const styles = getComputedStyle(el);
        return {
          top: Math.round(rect.top * 10) / 10,
          bottom: Math.round(rect.bottom * 10) / 10,
          borderBottomWidth: parseFloat(styles.borderBottomWidth),
        };
      });

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

      const coreToItem1Gap =
        coreRect && tileMetrics[0]
          ? Math.round((tileMetrics[0].top - coreRect.bottom) * 10) / 10
          : null;

      const item3ToItem4Gap =
        tileMetrics[2] && tileMetrics[3]
          ? Math.round((tileMetrics[3].top - tileMetrics[2].bottom) * 10) / 10
          : null;

      const rightColumnSeamBorder = rightColumnStyles
        ? parseFloat(rightColumnStyles.borderTopWidth)
        : null;

      const coreMarginBottom = coreStyles ? parseFloat(coreStyles.marginBottom) : null;

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
        coreToItem1Gap,
        item3ToItem4Gap,
        rightColumnSeamBorder,
        coreMarginBottom,
        desktopHubActive,
        mobileSingleColumn,
        tileMetrics,
        coreRect: coreRect
          ? {
              top: Math.round(coreRect.top * 10) / 10,
              bottom: Math.round(coreRect.bottom * 10) / 10,
            }
          : null,
        leftColumnRect: leftColumnRect
          ? {
              top: Math.round(leftColumnRect.top * 10) / 10,
              bottom: Math.round(leftColumnRect.bottom * 10) / 10,
            }
          : null,
        rightColumnRect: rightColumnRect
          ? {
              top: Math.round(rightColumnRect.top * 10) / 10,
              bottom: Math.round(rightColumnRect.bottom * 10) / 10,
            }
          : null,
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

  test('P2.6.1 integrations mobile row continuity', async ({ page }) => {
    const widths = [...P26_PHONE_WIDTHS, ...P26_TABLET_WIDTHS.filter((w) => w <= 1024)] as const;

    for (const width of widths) {
      await page.setViewportSize({ width, height: width <= 480 ? 700 : 844 });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await readIntegrationsComposition(page);
      expect(state.scrollWidth, `${width}px overflow`).toBeLessThanOrEqual(state.clientWidth + 1);
      expect(state.tileCount, `${width}px tile count`).toBe(6);
      expect(state.tileMetrics, `${width}px tile metrics`).toHaveLength(6);
      expect(state.coreVisible, `${width}px core visible`).toBe(true);
      expect(state.fullCardCount, `${width}px full-card surfaces`).toBe(0);
      expect(state.mobileSingleColumn, `${width}px single-column hub`).toBe(true);

      expect(state.coreToItem1Gap!, `${width}px core→item1 gap`).toBeGreaterThanOrEqual(14);
      expect(state.coreToItem1Gap!, `${width}px core→item1 gap`).toBeLessThanOrEqual(22);

      expect(state.item3ToItem4Gap!, `${width}px item3→item4 gap`).toBeGreaterThanOrEqual(0);
      expect(state.item3ToItem4Gap!, `${width}px item3→item4 gap`).toBeLessThanOrEqual(1);

      expect(state.rightColumnSeamBorder, `${width}px column seam`).toBeGreaterThan(0);

      for (const [index, tile] of state.tileMetrics.entries()) {
        if (index === 2) {
          expect(tile.borderBottomWidth, `${width}px tile 3 bottom (list boundary)`).toBe(0);
        } else if (index < 5) {
          expect(tile.borderBottomWidth, `${width}px tile ${index + 1} divider`).toBeGreaterThan(0);
        } else {
          expect(tile.borderBottomWidth, `${width}px tile 6 bottom`).toBe(0);
        }
      }
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
      expect(state.rightColumnSeamBorder, `${width}px mobile seam reset`).toBe(0);
      expect(state.coreMarginBottom, `${width}px core margin reset`).toBe(0);
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

  async function readPhase2KeyMetrics(page: Page) {
    return page.evaluate(() => {
      const rel = (sectionId: string, sel: string) => {
        const section = document.getElementById(sectionId);
        const el = section?.querySelector(sel);
        const sr = section?.getBoundingClientRect();
        const er = el?.getBoundingClientRect();
        return {
          sectionHeight: sr ? Math.round(sr.height) : null,
          frameTopRel: sr && er ? Math.round((er.top - sr.top) * 10) / 10 : null,
        };
      };
      const hero = document.querySelector('.hero');
      const heroIntro = hero?.querySelector('.hero__intro');
      const heroRect = hero?.getBoundingClientRect();
      const heroIntroRect = heroIntro?.getBoundingClientRect();
      const integ = document.getElementById('integrations');
      const core = integ?.querySelector('.hub__core');
      const tiles = integ?.querySelectorAll('.hub__tile');
      const integRect = integ?.getBoundingClientRect();
      const coreRect = core?.getBoundingClientRect();
      const tileRects = Array.from(tiles ?? []).map((el) => el.getBoundingClientRect());
      const closing = document.querySelector('.closing');
      const footer = document.querySelector('.sitefooter');
      return {
        pageHeight: Math.round(document.documentElement.scrollHeight),
        heroContentBottomRel:
          heroRect && heroIntroRect
            ? Math.round((heroIntroRect.bottom - heroRect.top) * 10) / 10
            : null,
        platform: rel('platform', '.stack__media .frame--product'),
        ai: rel('ai-orchestration', '.split__media .frame--product'),
        workflow: rel('workflow-automation', '.stack__media .frame--product'),
        communication: rel('communication', '.split__media .frame--product'),
        integrations: {
          sectionHeight: integRect ? Math.round(integRect.height) : null,
          coreToItem1:
            coreRect && tileRects[0]
              ? Math.round((tileRects[0].top - coreRect.bottom) * 10) / 10
              : null,
          item3ToItem4:
            tileRects[2] && tileRects[3]
              ? Math.round((tileRects[3].top - tileRects[2].bottom) * 10) / 10
              : null,
        },
        closingHeight: closing ? Math.round(closing.getBoundingClientRect().height) : null,
        footerHeight: footer ? Math.round(footer.getBoundingClientRect().height) : null,
      };
    });
  }

  test('P2.7 breakpoint boundary band transitions', async ({ page }) => {
    const bands = [
      [759, 900],
      [760, 900],
      [761, 900],
      [1023, 900],
      [1024, 900],
      [1025, 900],
      [1179, 900],
      [1180, 900],
      [1181, 900],
    ] as const;

    for (const [width, height] of bands) {
      await page.setViewportSize({ width, height });
      await page.goto('/', { waitUntil: 'load' });
      await settle(page);

      const state = await page.evaluate(() => {
        const sectionY = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--section-y'),
        );
        const aiStep = document.querySelector('#ai-orchestration .flow__step--compact');
        const aiBorderTop = aiStep ? parseFloat(getComputedStyle(aiStep).borderTopWidth) : null;
        const hubFullCards = Array.from(document.querySelectorAll('#integrations .hub__tile')).filter(
          (el) => {
            const styles = getComputedStyle(el);
            return (
              parseFloat(styles.borderTopWidth) > 0 &&
              styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
              styles.backgroundColor !== 'transparent'
            );
          },
        ).length;
        const mobileBand = window.matchMedia('(max-width: 1024px)').matches;
        return {
          sectionY,
          aiBorderTop,
          hubFullCards,
          mobileBand,
          overflowOk:
            document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
        };
      });

      expect(state.overflowOk, `${width}px overflow`).toBe(true);

      const expectedY = expectedSectionY(width);
      expect(state.sectionY, `${width}px section-y`).toBeGreaterThanOrEqual(expectedY - 0.5);
      expect(state.sectionY, `${width}px section-y`).toBeLessThanOrEqual(expectedY + 0.5);

      if (width <= 1024) {
        expect(state.mobileBand, `${width}px mobile band`).toBe(true);
        expect(state.aiBorderTop, `${width}px AI compact border`).toBe(0);
        expect(state.hubFullCards, `${width}px hub compact tiles`).toBe(0);
      } else {
        expect(state.mobileBand, `${width}px desktop band`).toBe(false);
        expect(state.hubFullCards, `${width}px hub desktop cards`).toBe(6);
      }
    }
  });

  test('P2.7 phase-2 source ownership guard', async () => {
    const cssPath = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      '..',
      'src',
      'styles.css',
    );
    const css = await fs.readFile(cssPath, 'utf8');
    const forbidden = [
      /padding:\s*14px\s+0/,
      /border-radius:\s*0/,
      /background:\s*transparent/,
      /border-bottom:\s*1px\s+solid\s+var\(--hairline\)/,
    ] as const;

    const mobileBlocks = [
      {
        name: 'workflow',
        start: css.indexOf('/* P2.5 — Workflow compact chain */'),
        endMarker: '/* Gap before workflow product visual',
      },
      {
        name: 'communication',
        start: css.indexOf('/* P2.6 — Communication mobile product-led composition */'),
        endMarker: '/* ── Integration hub',
      },
      {
        name: 'integrations',
        start: css.indexOf('/* P2.6 — Integrations hub mobile composition'),
        endMarker: '/* ── Reduced motion',
      },
    ];

    for (const block of mobileBlocks) {
      expect(block.start, `${block.name} block`).toBeGreaterThan(-1);
      const end = css.indexOf(block.endMarker, block.start);
      const mobileStart = css.indexOf('@media (max-width: 1024px)', block.start);
      const mobileEnd = css.indexOf('@media (min-width: 1025px)', mobileStart);
      const mobileBlock = css.slice(mobileStart, mobileEnd > mobileStart ? mobileEnd : end);
      for (const pattern of forbidden) {
        expect(
          mobileBlock,
          `${block.name} mobile must not duplicate .surface--compact chrome (${pattern})`,
        ).not.toMatch(pattern);
      }
    }
  });

  test('P2.7 full page key metrics regression (390 DE)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });
    await settle(page);

    const metrics = await readPhase2KeyMetrics(page);
    expect(metrics.pageHeight, '390px page height').toBeGreaterThanOrEqual(10000);
    expect(metrics.pageHeight, '390px page height').toBeLessThanOrEqual(10550);
    expect(metrics.heroContentBottomRel!, '390px hero content bottom').toBeGreaterThan(280);
    expect(metrics.heroContentBottomRel!, '390px hero content bottom').toBeLessThanOrEqual(520);
    expect(metrics.platform.frameTopRel!, '390px platform frame top').toBeGreaterThan(250);
    expect(metrics.ai.frameTopRel!, '390px AI frame top').toBeGreaterThan(300);
    expect(metrics.ai.frameTopRel!, '390px AI frame top').toBeLessThanOrEqual(310);
    expect(metrics.workflow.frameTopRel!, '390px workflow frame top').toBeGreaterThan(620);
    expect(metrics.workflow.frameTopRel!, '390px workflow frame top').toBeLessThanOrEqual(630);
    expect(metrics.communication.frameTopRel!, '390px communication frame top').toBeGreaterThan(220);
    expect(metrics.communication.frameTopRel!, '390px communication frame top').toBeLessThanOrEqual(
      240,
    );
    expect(metrics.integrations.sectionHeight!, '390px integrations height').toBeGreaterThanOrEqual(
      960,
    );
    expect(metrics.integrations.coreToItem1!, '390px core→item1').toBeGreaterThanOrEqual(16);
    expect(metrics.integrations.coreToItem1!, '390px core→item1').toBeLessThanOrEqual(20);
    expect(metrics.integrations.item3ToItem4!, '390px item3→item4').toBeLessThanOrEqual(1);
  });

  test('captures P2.7 full page screenshots', async ({ page }) => {
    const shots = [
      ['de', '/', 320, 700],
      ['de', '/', 375, 812],
      ['de', '/', 390, 844],
      ['de', '/', 430, 932],
      ['de', '/', 768, 1024],
      ['de', '/', 1024, 1366],
      ['de', '/', 1440, 1000],
      ['en', '/en/', 320, 700],
      ['en', '/en/', 390, 844],
      ['en', '/en/', 430, 932],
      ['en', '/en/', 768, 1024],
      ['en', '/en/', 1440, 1000],
    ] as const;

    for (const [locale, url, width, height] of shots) {
      await page.setViewportSize({ width, height });
      await page.goto(url, { waitUntil: 'load' });
      await settle(page);
      await page.screenshot({
        path: path.join(OUT, `${LABEL}p27-full-${locale}-${width}.png`),
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('P2.7.1 CLS release matrix', async ({ page }) => {
    const matrix = [
      ['de', '/', 390, 844],
      ['de', '/', 768, 1024],
      ['de', '/', 1440, 1000],
      ['en', '/en/', 390, 844],
      ['en', '/en/', 768, 1024],
      ['en', '/en/', 1440, 1000],
    ] as const;

    const results: Record<string, number> = {};

    for (const [locale, url, width, height] of matrix) {
      await page.setViewportSize({ width, height });
      const cls = await measurePageCls(page, url);
      const key = `${locale}-${width}`;
      results[key] = cls;
      expect(cls, `${locale} ${width}×${height} CLS`).toBeLessThan(0.1);
    }

    await fs.mkdir(OUT, { recursive: true });
    await fs.writeFile(
      path.join(OUT, `${LABEL}p271-cls-matrix.json`),
      `${JSON.stringify(results, null, 2)}\n`,
    );
  });

  test('P2.7.1 marketing page readable without JavaScript', async ({ browser }) => {
    for (const [locale, url] of [
      ['de', '/'],
      ['en', '/en/'],
    ] as const) {
      const context = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 844 },
      });
      const page = await context.newPage();

      await page.goto(url, { waitUntil: 'load' });

      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('html')).not.toHaveClass(/js/);
      await expect(page.locator('h1')).toHaveCount(1);

      for (const id of SECTION_IDS) {
        await expect(page.locator(`#${id}`)).toHaveCount(1);
      }

      for (const id of SECTION_IDS) {
        const heading = page.locator(`#${id} h2, #${id} .section-title`).first();
        await expect(heading, `${id} heading`).toBeVisible();
      }

      await expect(page.locator('.frame--product')).toHaveCount(5);
      await expect(page.locator('.frame--product img')).toHaveCount(5);

      await expect(page.locator('.hero__actions a[href^="mailto:"]')).toHaveCount(1);
      await expect(page.locator('.closing a[href^="mailto:"]')).toHaveCount(1);
      await expect(page.locator('.sitefooter')).toHaveCount(1);
      await expect(page.locator('.sitefooter__legal a[href^="mailto:"]')).toHaveCount(1);

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

      const hiddenReveal = await page.$$eval('[data-reveal]', (nodes) =>
        nodes
          .filter((node) => {
            const styles = window.getComputedStyle(node);
            return (
              parseFloat(styles.opacity) < 0.99 ||
              styles.visibility === 'hidden' ||
              styles.display === 'none'
            );
          })
          .map(
            (node) =>
              `${node.closest('section')?.id ?? 'hero'} ${node.tagName.toLowerCase()}.${node.className}`,
          ),
      );
      expect(hiddenReveal, hiddenReveal.join('\n')).toEqual([]);

      await context.close();
    }
  });

  async function assertPlatformAnchorOffset(page: Page, hash: string) {
    const sectionId = hash.slice(1);
    await expect(page).toHaveURL(new RegExp(`${hash.replace('#', '\\#')}$`));

    const heading = page
      .locator(`#${sectionId}-title, #${sectionId} h2.section-title, #${sectionId} h2`)
      .first();
    await expect(heading, `${hash} heading`).toBeAttached();

    await page.waitForFunction(
      (id) => {
        const title =
          document.querySelector(`#${id}-title`) ??
          document.querySelector(`#${id} h2.section-title`) ??
          document.querySelector(`#${id} h2`);
        const masthead = document.querySelector('.masthead');
        if (!title || !masthead) return false;
        const styles = window.getComputedStyle(title);
        if (parseFloat(styles.opacity) < 0.99) return false;
        const top = title.getBoundingClientRect().top;
        const mastheadBottom = masthead.getBoundingClientRect().bottom;
        return (
          top >= mastheadBottom - 2 &&
          top < window.innerHeight &&
          document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
        );
      },
      sectionId,
      { timeout: 8000, message: `${hash} anchor offset settle` },
    );

    // The first valid geometry can occur while smooth anchor scrolling is still
    // moving through the viewport. Wait for two consecutive samples at the same
    // scroll position so the next hash navigation cannot interrupt this one.
    await page.waitForFunction(
      () => {
        const root = document.documentElement;
        const current = window.scrollY;
        const previous = Number(root.dataset.qaAnchorScrollY);
        root.dataset.qaAnchorScrollY = String(current);
        return Number.isFinite(previous) && Math.abs(previous - current) < 1;
      },
      undefined,
      { polling: 100, timeout: 8000, message: `${hash} anchor scroll stability` },
    );
    await page.evaluate(() => delete document.documentElement.dataset.qaAnchorScrollY);

    const geometry = await page.evaluate((id) => {
      const masthead = document.querySelector('.masthead');
      const title =
        document.querySelector(`#${id}-title`) ??
        document.querySelector(`#${id} h2.section-title`) ??
        document.querySelector(`#${id} h2`);
      if (!masthead || !title) return null;
      const mastheadRect = masthead.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      return {
        mastheadBottom: Math.round(mastheadRect.bottom * 10) / 10,
        headingTop: Math.round(titleRect.top * 10) / 10,
        overflowOk:
          document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      };
    }, sectionId);

    expect(geometry, `${hash} geometry`).not.toBeNull();
    expect(geometry!.headingTop, `${hash} masthead offset`).toBeGreaterThanOrEqual(
      geometry!.mastheadBottom - 2,
    );
    expect(geometry!.overflowOk, `${hash} overflow`).toBe(true);
  }

  test('P2.7.1 platform anchor offset release guard', async ({ page }) => {
    const anchors = PLATFORM_NAV.de.links.map((link) => link.href);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'load' });

    for (const hash of anchors) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.getByRole('button', { name: 'Menü öffnen' }).click();
      const panel = page.locator('[data-nav-panel]');
      await expect(panel).toBeVisible();

      const label = PLATFORM_NAV.de.links.find((link) => link.href === hash)!.label;
      await panel.getByRole('button', { name: 'Plattform' }).click();
      await panel.getByRole('link', { name: label }).click();
      await expect(panel).toBeHidden();

      await assertPlatformAnchorOffset(page, hash);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    for (const hash of anchors) {
      // A direct deep link starts from the document origin. Resetting here also
      // avoids carrying the final mobile anchor's long smooth-scroll trajectory
      // across the responsive viewport transition.
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.goto(`/${hash}`, { waitUntil: 'load' });
      await assertPlatformAnchorOffset(page, hash);
    }
  });
});
