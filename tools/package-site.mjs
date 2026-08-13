/**
 * Deterministic release packaging for synqdrive.eu static deploy.
 *
 * GNU tar metadata (mtime, uid, gid) and gzip header timestamps make the
 * legacy `tar -czf` command non-reproducible across builds and packaging runs.
 * This wrapper normalizes archive metadata so equivalent dist/ bytes always
 * produce the same synqdrive-landing-page.tar.gz identity.
 *
 * Usage: node tools/package-site.mjs
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { forbiddenReason } from './public-artefact-policy.mjs';
import { isFingerprintedCss, isFingerprintedJs } from './fingerprint-assets.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUTPUT = path.join(ROOT, 'synqdrive-landing-page.tar.gz');

const FORBIDDEN_ARCHIVE_PREFIXES = [
  'dist/',
  'docs/',
  'audits/',
  'e2e/',
  '.git/',
  'node_modules/',
  'rollback/',
  'tools/',
  'src/',
  'content/',
];

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    ...options,
  });

  if (result.error) {
    console.error(`package-site: failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.stdout) process.stdout.write(result.stdout);
    console.error(`package-site: ${command} exited with status ${result.status}`);
    process.exit(result.status ?? 1);
  }

  return result;
}

async function sha256File(filePath) {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

async function createDeterministicPackage() {
  const distStat = await stat(DIST).catch(() => null);
  if (!distStat?.isDirectory()) {
    console.error('package-site: dist/ missing — run npm run build first');
    process.exit(1);
  }

  const command = [
    'tar --sort=name --mtime=@0 --owner=0 --group=0 --numeric-owner',
    `-cf - -C ${JSON.stringify(DIST)} .`,
    `| gzip -n > ${JSON.stringify(OUTPUT)}`,
  ].join(' ');

  run('bash', ['-lc', command], { stdio: 'inherit' });
}

async function verifyPackage() {
  const listResult = run('tar', ['-tzf', OUTPUT]);
  const entries = listResult.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\.\//, ''));

  if (entries.some((entry) => entry === 'dist' || entry.startsWith('dist/'))) {
    console.error('package-site: archive must not contain nested dist/');
    process.exit(1);
  }

  for (const entry of entries) {
    for (const prefix of FORBIDDEN_ARCHIVE_PREFIXES) {
      if (entry === prefix.slice(0, -1) || entry.startsWith(prefix)) {
        console.error(`package-site: forbidden archive path ${entry}`);
        process.exit(1);
      }
    }

    const reason = forbiddenReason(entry);
    if (reason) {
      console.error(`package-site: forbidden public-artefact path ${entry} (${reason})`);
      process.exit(1);
    }
  }

  const entrySet = new Set(entries);
  const required = [
    'index.html',
    'en/index.html',
    'robots.txt',
    'sitemap.xml',
    'styles.css',
    'script.js',
  ];

  for (const relativePath of required) {
    if (!entrySet.has(relativePath)) {
      console.error(`package-site: missing required archive path ${relativePath}`);
      process.exit(1);
    }
  }

  const cssFingerprinted = entries.filter(isFingerprintedCss);
  const jsFingerprinted = entries.filter(isFingerprintedJs);

  if (cssFingerprinted.length !== 1 || jsFingerprinted.length !== 1) {
    console.error('package-site: archive must contain exactly one fingerprinted CSS and JS file');
    process.exit(1);
  }

  if (!entries.some((entry) => entry === 'assets' || entry.startsWith('assets/'))) {
    console.error('package-site: missing assets/ directory in archive');
    process.exit(1);
  }

  const htmlPaths = ['index.html', 'en/index.html'];
  for (const htmlPath of htmlPaths) {
    const html = await readFile(path.join(DIST, htmlPath), 'utf8');
    const refs = [...html.matchAll(/(?:href|src)="(\/[^"?#]+(?:\?[^"#]*)?)"/g)].map((match) => match[1]);
    for (const ref of refs) {
      const archivePath = ref.replace(/^\//, '').split('?')[0];
      if (!entrySet.has(archivePath)) {
        console.error(`package-site: ${htmlPath} references missing archive asset ${ref}`);
        process.exit(1);
      }
    }
  }

  console.log('package-site: verification OK');
  console.log(`  files: ${entries.length}`);
  console.log(`  css: ${cssFingerprinted[0]}`);
  console.log(`  js:  ${jsFingerprinted[0]}`);
}

async function main() {
  await createDeterministicPackage();
  await verifyPackage();

  const packageStat = await stat(OUTPUT);
  const digest = await sha256File(OUTPUT);

  console.log('package-site: OK');
  console.log(`  file: synqdrive-landing-page.tar.gz`);
  console.log(`  size: ${packageStat.size} bytes`);
  console.log(`  sha256: ${digest}`);
}

await main();
