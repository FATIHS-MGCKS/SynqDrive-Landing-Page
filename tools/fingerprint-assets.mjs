/**
 * Content-addressed fingerprints for public CSS/JS runtime assets.
 */
import { createHash } from 'node:crypto';

/** Lowercase hex characters used in emitted filenames. */
export const FINGERPRINT_HEX_LENGTH = 12;

/**
 * @param {string | Buffer} content
 * @returns {string}
 */
export function contentFingerprint(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, FINGERPRINT_HEX_LENGTH);
}

/**
 * @param {string} hash
 */
export function fingerprintedCssName(hash) {
  return `styles.${hash}.css`;
}

/**
 * @param {string} hash
 */
export function fingerprintedJsName(hash) {
  return `script.${hash}.js`;
}

/**
 * @param {string} filename basename only
 * @param {string | Buffer} content
 */
export function verifyFingerprintedFilename(filename, content) {
  const cssMatch = filename.match(/^styles\.([a-f0-9]{12})\.css$/);
  if (cssMatch) {
    const expected = contentFingerprint(content);
    if (cssMatch[1] !== expected) {
      throw new Error(
        `CSS fingerprint mismatch: filename ${cssMatch[1]} vs content ${expected}`,
      );
    }
    return;
  }

  const jsMatch = filename.match(/^script\.([a-f0-9]{12})\.js$/);
  if (jsMatch) {
    const expected = contentFingerprint(content);
    if (jsMatch[1] !== expected) {
      throw new Error(
        `JS fingerprint mismatch: filename ${jsMatch[1]} vs content ${expected}`,
      );
    }
    return;
  }

  throw new Error(`Not a fingerprinted runtime asset filename: ${filename}`);
}

/**
 * @param {string} filename
 * @returns {boolean}
 */
export function isFingerprintedCss(filename) {
  return /^styles\.[a-f0-9]{12}\.css$/.test(filename);
}

/**
 * @param {string} filename
 * @returns {boolean}
 */
export function isFingerprintedJs(filename) {
  return /^script\.[a-f0-9]{12}\.js$/.test(filename);
}
