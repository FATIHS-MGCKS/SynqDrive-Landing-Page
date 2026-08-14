/**
 * Builds the static public site into landingpage/dist.
 *
 * The shipped artefact stays plain HTML, CSS and JavaScript with no runtime
 * framework. This script exists only so the German and English pages can be
 * rendered from one set of templates and one content model instead of being
 * maintained as two hand-written documents.
 *
 * Output:
 *   dist/index.html      German, root locale (matches the current public site)
 *   dist/en/index.html   English
 *   dist/styles.<hash>.css, dist/script.<hash>.js   fingerprinted runtime assets
 *   dist/styles.css, dist/script.js                 transitional compatibility aliases
 *   dist/assets/**
 *   dist/robots.txt, dist/sitemap.xml
 *
 * Usage: node landingpage/tools/build-site.mjs
 */
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  contentFingerprint,
  fingerprintedCssName,
  fingerprintedJsName,
  verifyFingerprintedFilename,
} from './fingerprint-assets.mjs';
import { isPublicStaticFile } from './public-artefact-policy.mjs';

import { SITE, locales } from '../content/site.mjs';
import {
  HERO_SIZES,
  ai,
  communication,
  finalCta,
  footer,
  header,
  hero,
  integrations,
  unified,
  useCases,
  vehicle,
  workflow,
} from '../src/sections.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

/** Preloaded because it is the largest contentful paint on every page. */
const HERO = locales[0].hero.media;

/** Fixed 1200x630 JPEG, see the social card target in build-assets.mjs. */
const SOCIAL_CARD = { url: `${SITE.origin}/assets/landing-social-card.jpg`, width: 1200, height: 630 };

/**
 * Minimal inline safety net when the external stylesheet fails to load.
 * Not a substitute for the real design system — foundational degradation only.
 */
const CATASTROPHIC_FALLBACK_STYLE = [
  '*,*::before,*::after{box-sizing:border-box}',
  'html{background:#fff;color-scheme:light;-webkit-text-size-adjust:100%}',
  'body{margin:0;background:#fff;color:#111827;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.6;overflow-x:hidden}',
  'img,video{max-width:100%;height:auto;display:block}',
  'svg{width:24px;height:24px;max-width:100%;display:block}',
  'ul,ol{margin:0;padding:0;list-style:none}',
  'a{color:inherit;text-decoration:none}',
  '.skip-link{position:absolute;left:16px;top:-64px;z-index:60;padding:10px 16px;background:#111827;color:#fff;font-size:14px;font-weight:600}',
  '.skip-link:focus-visible{top:14px}',
  '.nav-panel[inert]{display:none}',
].join('');

function stylesheetRecoveryScript(assets) {
  return `(function(){var primary=${JSON.stringify(assets.cssHref)};var fingerprint=${JSON.stringify(assets.cssFingerprint)};var link=document.querySelector('link[data-synqdrive-primary-stylesheet]');if(!link||link.getAttribute('href')!==primary)return;var retried=false;link.addEventListener('error',function(){if(retried)return;retried=true;var retry=document.createElement('link');retry.rel='stylesheet';retry.href='/styles.css?v='+encodeURIComponent(fingerprint);retry.setAttribute('data-synqdrive-stylesheet-retry','');link.after(retry);});})();`;
}

/** Both locales plus x-default, emitted identically on every page. */
function hreflangTags() {
  return [
    ...locales.map(
      (locale) =>
        `<link rel="alternate" hreflang="${locale.htmlLang}" href="${SITE.origin}${locale.dir}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${SITE.origin}/" />`,
  ];
}

/**
 * Organization data only. No aggregate ratings, offers or review markup, since
 * there is no verifiable public source for any of them.
 */
function structuredData(locale) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.brand,
    url: `${SITE.origin}${locale.dir}`,
    logo: `${SITE.origin}/assets/synqdrive-logo.png`,
    email: SITE.links.email,
    description: locale.meta.description,
  });
}

/**
 * @param {{ cssHref: string; jsHref: string }} assets
 */
function document(locale, assets) {
  const other = locales.find((candidate) => candidate.locale !== locale.locale);
  const canonical = `${SITE.origin}${locale.dir}`;

  const body = [
    header(locale, other, SITE),
    `<main id="main">`,
    hero(locale),
    useCases(locale),
    unified(locale),
    vehicle(locale),
    ai(locale),
    workflow(locale),
    communication(locale),
    integrations(locale),
    finalCta(locale),
    `</main>`,
    footer(locale, SITE),
  ].join('\n    ');

  return `<!doctype html>
<html lang="${locale.htmlLang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${locale.meta.title}</title>
    <meta name="description" content="${locale.meta.description}" />
    <meta name="theme-color" content="#ffffff" />
    <link rel="canonical" href="${canonical}" />
    ${hreflangTags().join('\n    ')}
    <link rel="icon" type="image/png" href="/assets/favicon.png" />
    <link rel="apple-touch-icon" href="/assets/favicon.png" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE.brand}" />
    <meta property="og:locale" content="${locale.ogLocale}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${locale.meta.ogTitle}" />
    <meta property="og:description" content="${locale.meta.ogDescription}" />
    <meta property="og:image" content="${SOCIAL_CARD.url}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="${SOCIAL_CARD.width}" />
    <meta property="og:image:height" content="${SOCIAL_CARD.height}" />
    <meta property="og:image:alt" content="${locale.hero.mediaAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${locale.meta.ogTitle}" />
    <meta name="twitter:description" content="${locale.meta.ogDescription}" />
    <meta name="twitter:image" content="${SOCIAL_CARD.url}" />
    <meta name="twitter:image:alt" content="${locale.hero.mediaAlt}" />

    <link rel="preload" href="/assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link
      rel="preload"
      as="image"
      href="/assets/${HERO.file}.webp"
      imagesrcset="/assets/${HERO.file}-sm.webp ${Math.round(HERO.width / 2)}w, /assets/${HERO.file}.webp ${HERO.width}w"
      imagesizes="${HERO_SIZES}"
      fetchpriority="high"
    />
    <style id="synqdrive-catastrophic-fallback">${CATASTROPHIC_FALLBACK_STYLE}</style>
    <link rel="stylesheet" href="${assets.cssHref}" data-synqdrive-primary-stylesheet />
    <script>${stylesheetRecoveryScript(assets)}</script>
    <script>
      /* Reveal styles apply only when scripting is available, so the page never
         stays blank without JavaScript. Setting the class here rather than in
         script.js avoids a flash of already-revealed content. The timer is the
         safety net for the one remaining case, script.js failing to arrive. */
      document.documentElement.classList.add('js');
      setTimeout(function () {
        if (document.documentElement.dataset.reveal === 'ready') return;
        document.documentElement.classList.remove('js');
      }, 2500);
    </script>
    <script type="application/ld+json">
      ${structuredData(locale)}
    </script>
  </head>
  <body>
    <a class="skip-link" href="#main">${locale.meta.skipLink}</a>
    ${body}
    <script src="${assets.jsHref}" defer></script>
  </body>
</html>
`;
}

async function writeRuntimeAsset(distDir, filename, content) {
  const target = path.join(distDir, filename);
  await writeFile(target, content);
  verifyFingerprintedFilename(filename, content);
}

async function writeCompatibilityAlias(distDir, filename, content) {
  await writeFile(path.join(distDir, filename), content);
}

function robots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE.origin}/sitemap.xml
`;
}

function sitemap() {
  const urls = locales
    .map(
      (locale) => `  <url>
    <loc>${SITE.origin}${locale.dir}</loc>
    ${locales
      .map(
        (alt) =>
          `<xhtml:link rel="alternate" hreflang="${alt.htmlLang}" href="${SITE.origin}${alt.dir}" />`,
      )
      .join('\n    ')}
    <changefreq>monthly</changefreq>
    <priority>${locale.dir === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

async function copyPublicAssets(srcDir, destDir, relativeBase = '') {
  await mkdir(destDir, { recursive: true });
  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
    if (!isPublicStaticFile(relativePath)) continue;

    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyPublicAssets(src, dest, relativePath);
    } else if (entry.isFile()) {
      await cp(src, dest);
    }
  }
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  const cssContent = await readFile(path.join(SRC, 'styles.css'));
  const jsContent = await readFile(path.join(SRC, 'script.js'));
  const cssFingerprint = contentFingerprint(cssContent);
  const jsFingerprint = contentFingerprint(jsContent);
  const cssName = fingerprintedCssName(cssFingerprint);
  const jsName = fingerprintedJsName(jsFingerprint);
  const assets = {
    cssHref: `/${cssName}`,
    jsHref: `/${jsName}`,
    cssFingerprint,
  };

  for (const locale of locales) {
    const target = path.join(DIST, locale.dir, 'index.html');
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, document(locale, assets), 'utf8');
  }

  await writeRuntimeAsset(DIST, cssName, cssContent);
  await writeRuntimeAsset(DIST, jsName, jsContent);
  await writeCompatibilityAlias(DIST, 'styles.css', cssContent);
  await writeCompatibilityAlias(DIST, 'script.js', jsContent);
  await copyPublicAssets(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
  await writeFile(path.join(DIST, 'robots.txt'), robots(), 'utf8');
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap(), 'utf8');

  for (const locale of locales) {
    const html = await readFile(path.join(DIST, locale.dir, 'index.html'), 'utf8');
    const forbidden = html.match(/[\u2014\u2013]/g);
    if (forbidden) {
      throw new Error(`${locale.locale}: em dash or en dash found in output (${forbidden.length})`);
    }
    console.log(`${locale.locale.padEnd(3)} ${(html.length / 1024).toFixed(1)} kB html`);
  }

  console.log(`css ${cssName}`);
  console.log(`js  ${jsName}`);
  console.log('aliases styles.css, script.js');
}

await main();
