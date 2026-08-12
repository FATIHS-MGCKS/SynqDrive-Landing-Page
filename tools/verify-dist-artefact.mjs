/**
 * Fails the build/QA path if dist/ contains repository-internal files.
 *
 * Usage: node tools/verify-dist-artefact.mjs
 */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { forbiddenReason } from './public-artefact-policy.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

async function walk(dir, base = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relative = base ? `${base}/${entry.name}` : entry.name;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolute, relative)));
    } else if (entry.isFile()) {
      files.push(relative.replace(/\\/g, '/'));
    }
  }

  return files;
}

async function main() {
  let distStat;
  try {
    distStat = await stat(DIST);
  } catch {
    console.error('verify-dist-artefact: dist/ does not exist — run npm run build first');
    process.exit(1);
  }

  if (!distStat.isDirectory()) {
    console.error('verify-dist-artefact: dist/ is not a directory');
    process.exit(1);
  }

  const files = await walk(DIST);
  const violations = files
    .map((relativePath) => ({ relativePath, reason: forbiddenReason(relativePath) }))
    .filter((entry) => entry.reason);

  if (violations.length) {
    console.error('verify-dist-artefact: forbidden files in dist/:');
    for (const { relativePath, reason } of violations) {
      console.error(`  - ${relativePath} (${reason})`);
    }
    process.exit(1);
  }

  console.log(`verify-dist-artefact: OK (${files.length} public files)`);
}

await main();
