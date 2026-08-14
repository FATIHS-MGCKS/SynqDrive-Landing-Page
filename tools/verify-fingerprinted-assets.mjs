/**
 * Verifies fingerprinted CSS/JS output, HTML references, and compatibility aliases.
 *
 * Usage: node tools/verify-fingerprinted-assets.mjs
 */
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  contentFingerprint,
  fingerprintedCssName,
  fingerprintedJsName,
  isFingerprintedCss,
  isFingerprintedJs,
  verifyFingerprintedFilename,
} from './fingerprint-assets.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SRC_CSS = path.join(ROOT, 'src', 'styles.css');
const SRC_JS = path.join(ROOT, 'src', 'script.js');

async function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function readDistHtml(relativePath) {
  return readFile(path.join(DIST, relativePath), 'utf8');
}

async function main() {
  const distStat = await stat(DIST).catch(() => null);
  if (!distStat?.isDirectory()) {
    console.error('verify-fingerprinted-assets: dist/ missing — run npm run build first');
    process.exit(1);
  }

  const entries = await readdir(DIST);
  const cssFingerprinted = entries.filter(isFingerprintedCss);
  const jsFingerprinted = entries.filter(isFingerprintedJs);

  if (cssFingerprinted.length !== 1) {
    console.error(`verify-fingerprinted-assets: expected 1 fingerprinted CSS file, found ${cssFingerprinted.length}`);
    process.exit(1);
  }
  if (jsFingerprinted.length !== 1) {
    console.error(`verify-fingerprinted-assets: expected 1 fingerprinted JS file, found ${jsFingerprinted.length}`);
    process.exit(1);
  }

  const cssName = cssFingerprinted[0];
  const jsName = jsFingerprinted[0];
  const cssContent = await readFile(path.join(DIST, cssName));
  const jsContent = await readFile(path.join(DIST, jsName));
  const aliasCss = await readFile(path.join(DIST, 'styles.css'));
  const aliasJs = await readFile(path.join(DIST, 'script.js'));

  verifyFingerprintedFilename(cssName, cssContent);
  verifyFingerprintedFilename(jsName, jsContent);

  const srcCss = await readFile(SRC_CSS);
  const srcJs = await readFile(SRC_JS);
  const expectedCssFp = contentFingerprint(srcCss);
  const expectedJsFp = contentFingerprint(srcJs);

  if (cssName !== fingerprintedCssName(expectedCssFp)) {
    console.error('verify-fingerprinted-assets: dist CSS fingerprint does not match src/styles.css');
    process.exit(1);
  }
  if (jsName !== fingerprintedJsName(expectedJsFp)) {
    console.error('verify-fingerprinted-assets: dist JS fingerprint does not match src/script.js');
    process.exit(1);
  }

  if (!cssContent.equals(aliasCss)) {
    console.error('verify-fingerprinted-assets: styles.css alias does not byte-match fingerprinted CSS');
    process.exit(1);
  }
  if (!jsContent.equals(aliasJs)) {
    console.error('verify-fingerprinted-assets: script.js alias does not byte-match fingerprinted JS');
    process.exit(1);
  }

  const deHtml = await readDistHtml('index.html');
  const enHtml = await readDistHtml('en/index.html');
  const cssHref = `/${cssName}`;
  const jsHref = `/${jsName}`;

  for (const [label, html] of [
    ['DE', deHtml],
    ['EN', enHtml],
  ]) {
    if (!html.includes(`href="${cssHref}"`)) {
      console.error(`verify-fingerprinted-assets: ${label} HTML missing CSS fingerprint reference ${cssHref}`);
      process.exit(1);
    }
    if (!html.includes(`src="${jsHref}"`)) {
      console.error(`verify-fingerprinted-assets: ${label} HTML missing JS fingerprint reference ${jsHref}`);
      process.exit(1);
    }
    if (html.match(/href="\/styles\.css"/)) {
      console.error(`verify-fingerprinted-assets: ${label} HTML still primary-references bare /styles.css`);
      process.exit(1);
    }
    if (html.match(/src="\/script\.js"/)) {
      console.error(`verify-fingerprinted-assets: ${label} HTML still primary-references bare /script.js`);
      process.exit(1);
    }
  }

  if (deHtml.match(/href="\/styles\.css"/) || enHtml.match(/href="\/styles\.css"/)) {
    process.exit(1);
  }

  const mutatedCssFp = contentFingerprint(Buffer.concat([srcCss, Buffer.from(' ')]));
  if (mutatedCssFp === expectedCssFp) {
    console.error('verify-fingerprinted-assets: CSS fingerprint did not change when content changed');
    process.exit(1);
  }
  const mutatedJsFp = contentFingerprint(Buffer.concat([srcJs, Buffer.from(' ')]));
  if (mutatedJsFp === expectedJsFp) {
    console.error('verify-fingerprinted-assets: JS fingerprint did not change when content changed');
    process.exit(1);
  }

  const retryNeedle = "retry.href='/styles.css?v='+encodeURIComponent(fingerprint)";
  for (const [label, html] of [
    ['DE', deHtml],
    ['EN', enHtml],
  ]) {
    if (!html.includes(retryNeedle)) {
      console.error(`verify-fingerprinted-assets: ${label} HTML missing one-time stylesheet retry handler`);
      process.exit(1);
    }
    if (!html.includes(`fingerprint="${expectedCssFp}"`)) {
      console.error(`verify-fingerprinted-assets: ${label} HTML retry missing current CSS fingerprint`);
      process.exit(1);
    }
    if (!html.includes('data-synqdrive-primary-stylesheet')) {
      console.error(`verify-fingerprinted-assets: ${label} HTML missing primary stylesheet marker`);
      process.exit(1);
    }
    if ((html.match(/if\(retried\)return;retried=true;/g) ?? []).length !== 1) {
      console.error(`verify-fingerprinted-assets: ${label} HTML retry guard must be singular`);
      process.exit(1);
    }
  }

  console.log(`verify-fingerprinted-assets: OK`);
  console.log(`  css: ${cssName} sha256=${await sha256(cssContent)}`);
  console.log(`  js:  ${jsName} sha256=${await sha256(jsContent)}`);
  console.log(`  aliases: styles.css, script.js (byte-identical)`);
}

await main();
