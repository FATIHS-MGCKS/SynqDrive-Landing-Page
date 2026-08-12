/**
 * Shared rules for what may appear in the public dist/ artefact.
 * Repository documentation stays in-repo only — never in Production docroot.
 */
import path from 'node:path';

/** Basenames that must never ship in dist/, regardless of directory. */
export const FORBIDDEN_BASENAMES = [
  /^README(\..*)?$/i,
  /^AGENTS(\..*)?$/i,
  /^CHANGELOG(\..*)?$/i,
];

/** Extensions that indicate repository documentation or dev metadata, not public site files. */
export const FORBIDDEN_EXTENSIONS = new Set(['.md', '.map']);

/**
 * Whether a file under assets/ (or dist/) is intended for the public static site.
 * @param {string} relativePath path relative to assets/ or dist/
 */
export function isPublicStaticFile(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);
  const basename = path.basename(normalized);

  if (basename.startsWith('.')) return false;
  if (FORBIDDEN_EXTENSIONS.has(path.extname(basename).toLowerCase())) return false;
  if (FORBIDDEN_BASENAMES.some((pattern) => pattern.test(basename))) return false;

  const blockedPrefixes = ['docs/', 'audits/', '.cursor/', '.git/'];
  if (blockedPrefixes.some((prefix) => normalized.startsWith(prefix))) return false;
  if (segments.some((segment) => segment.startsWith('.'))) return false;

  return true;
}

/**
 * Returns a human-readable reason when a dist path violates the public artefact policy.
 * @param {string} relativePath path relative to dist/
 */
export function forbiddenReason(relativePath) {
  if (isPublicStaticFile(relativePath)) return null;

  const basename = path.basename(relativePath);
  if (basename.startsWith('.')) return 'hidden file';
  if (FORBIDDEN_EXTENSIONS.has(path.extname(basename).toLowerCase())) return 'forbidden extension';
  if (FORBIDDEN_BASENAMES.some((pattern) => pattern.test(basename))) return 'repository documentation basename';
  return 'non-public path';
}
