# Phase 1.6.1 — Production Hygiene & Rollback Hardening

**Date:** 2026-08-12  
**Domain:** `synqdrive.eu`  
**Result:** **PHASE 1 FINAL ACCEPTANCE: PASS**

Cross-reference: [`landing-page-phase-1.6-production-deployment-2026-08.md`](landing-page-phase-1.6-production-deployment-2026-08.md)

---

## Executive Summary

Post-P1.6 review found `assets/product/README.md` publicly served at `/assets/product/README.md`. Root cause: blind recursive copy of `assets/` in `tools/build-site.mjs`. Fixed with filtered copy + build verification; sanitized package redeployed. Runtime website files unchanged. Rollback governance established.

---

## Leak inventory (Step 2)

Complete scan of `dist/` after P1.6 deploy:

| Path | Type | Public? |
|---|---|---|
| `dist/assets/product/README.md` | Repository product-image policy (Markdown) | **NO — leaked** |

No other forbidden files found (no `AGENTS.md`, `docs/`, audits, `.cursor/`, hidden files, or `.map` files in dist).

---

## Build fix

| Item | Detail |
|---|---|
| Policy module | `tools/public-artefact-policy.mjs` |
| Build change | `copyPublicAssets()` — filtered recursive copy excluding `.md`, `README*`, hidden segments |
| Verification | `tools/verify-dist-artefact.mjs` — runs on every `npm run build` |
| Build commit | **`feacb47`** |

---

## Release manifest

| Manifest | Files | Notes |
|---|---|---|
| P1.6 | 30 | Included leaked README |
| P1.6.1 | 29 | README removed only |

Runtime hashes **unchanged:** `index.html`, `en/index.html`, `script.js`, `styles.css`, all image assets match P1.6 manifest.

New manifest: [`p1.6.1-release-manifest-2026-08-12.txt`](p1.6.1-release-manifest-2026-08-12.txt)

---

## Hostinger rollback capability

Inspected Hostinger MCP tooling available to this workflow:

| Capability | Available for `synqdrive.eu` static vhost? |
|---|---|
| `hosting_deployStaticWebsite` | Yes — deploy only; no version ID returned |
| Deployment version restore | **No** — not exposed for this static site workflow |
| File-level hosting backup/restore API | **No** matching tool for shared static docroot |
| DNS snapshots | Yes — DNS records only, not website files |

**Conclusion:** Rollback relies on repository-maintained archives under `rollback/`, not Hostinger deployment versions.

---

## Pre-P1.6.1 rollback artefact

| Field | Value |
|---|---|
| File | `rollback/synqdrive.eu-pre-p1.6.1-20260812_144442.tar.gz` (gitignored binary) |
| Provenance | P1.6 deploy package verified against live Production before redeploy |
| Verification | Live `script.js` hash matched; README publicly served (200, 4965 bytes) |
| Manifest | [`p1.6-release-manifest-2026-08-12.txt`](p1.6-release-manifest-2026-08-12.txt) |
| Policy doc | [`rollback/README.md`](../../rollback/README.md) |

---

## Redeployment

| Field | Value |
|---|---|
| Timestamp (UTC) | **2026-08-12T14:46:48Z** |
| Mechanism | Hostinger `hosting_deployStaticWebsite` |
| Build commit deployed | **`feacb47`** |
| Runtime content baseline | **`c77dc76`** (unchanged website behaviour) |

---

## Pre / post deploy health

| Check | Pre | Post |
|---|---|---|
| `https://synqdrive.eu/` | 200 | 200 |
| `https://synqdrive.eu/en/` | 200 | 200 |
| `/assets/product/README.md` | **200** (leaked) | **404** |
| `script.js` SHA-256 | `6e17f1c0…` | `6e17f1c0…` (unchanged) |
| `app.synqdrive.eu` health | ok, uptime 1 064 712 | ok, uptime 1 064 839 |

---

## QA results

| Suite | Result |
|---|---|
| Local Chromium | **33/33 pass** |
| Local WebKit smoke | **2/2 pass** |
| Build hygiene (`verify-dist-artefact`) | **PASS** (29 public files) |
| Production Chromium | **33/33 pass** (21 + 12 retry after HTTP 429 cooldown) |
| Production WebKit smoke | **2/2 pass** |

Rate limiting classified as Hostinger infrastructure behaviour — not a site regression (same pattern as P1.6).

---

## Former internal URLs

| URL | Result |
|---|---|
| `https://synqdrive.eu/assets/product/README.md` | **404** |
| Cache-busted request | **404** |

No other leaked paths existed.

---

## Behaviour confirmation

No intended change to navigation, layout, copy, images, or JavaScript behaviour. Diff limited to removal of non-runtime Markdown from public docroot.

---

## Remaining issues

| ID | Severity | Description |
|---|---|---|
| R1 | **LOW** | Hostinger HTTP 429 under rapid Playwright production runs |
| R2 | **LOW** | Phase 2 mobile page composition pending |
| R3 | **LOW** | Physical iPhone Safari not available in execution environment |

---

## Final Result

**PHASE 1 FINAL ACCEPTANCE: PASS**

---

*End of Phase 1.6.1 production hygiene audit.*

**P1.6.1 documentation commit:** `5273925`
