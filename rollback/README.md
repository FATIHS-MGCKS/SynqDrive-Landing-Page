# Rollback artefact — pre-P1.6.1 Production snapshot

**Created:** 2026-08-12T14:44:42Z  
**Purpose:** Exact rollback to Production state immediately before P1.6.1 sanitized redeploy.

## Artefact

| Field | Value |
|---|---|
| File | `rollback/synqdrive.eu-pre-p1.6.1-20260812_144442.tar.gz` |
| Source | P1.6 deploy package verified against live Production (`script.js` hash `6e17f1c0…`, `assets/product/README.md` publicly served) |
| Associated runtime baseline | `c77dc76` |
| Associated docs HEAD at capture | `7376120` |
| Manifest | [`docs/audits/p1.6-release-manifest-2026-08-12.txt`](../docs/audits/p1.6-release-manifest-2026-08-12.txt) (30 files incl. leaked README) |

## Restore procedure

1. Deploy this archive to `synqdrive.eu` via Hostinger `hosting_deployStaticWebsite` (files at archive root).
2. Verify `https://synqdrive.eu/assets/product/README.md` returns 200 (confirms pre-P1.6.1 state).
3. Run `npm run qa:prod` with rate-limit-aware retry if needed.

## Future deployment rule

Before every Production deploy, ensure **one** of:

1. Timestamped docroot archive under `rollback/` (naming: `synqdrive.eu-pre-<phase>-YYYYMMDD_HHMMSS.tar.gz`), **or**
2. Verified deployable package + SHA-256 manifest, **or**
3. Hosting-provider deployment version with tested restore (not available for this static vhost — see P1.6.1 audit).

Associate each artefact with Git SHA, manifest path, and retention note in the phase audit.

**Do not** place rollback archives in the public web root.
