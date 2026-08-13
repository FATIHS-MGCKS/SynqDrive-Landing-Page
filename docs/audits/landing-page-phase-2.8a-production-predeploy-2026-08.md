# Phase 2.8A — Production Pre-Deployment Freeze, Exact Rollback & Release Artefact

**Date:** 2026-08-13 (UTC)  
**Scope:** Pre-deployment preparation only — **no Production mutation**, **no deployment**

---

## Executive Summary

Phase-2 release candidate **`92392d2`** was frozen on exact `main`, rebuilt cleanly, and verified (build, dist hygiene, security scan, package ↔ dist equivalence). A **new** timestamped rollback archive of the **current live** `synqdrive.eu` docroot was captured, checksum-verified, and test-extracted. Production and `app.synqdrive.eu` baselines were recorded read-only.

**P2.8B GO:** **YES**

---

## Release Candidate

| Field | Value |
|---|---|
| **Release SHA (full)** | `92392d23ca9f12c4d18befdcd06c611a593dd3a9` |
| **Short SHA** | `92392d2` |
| **Branch at freeze** | `main` |
| **Merge** | PR #7 — Phase 2.7 integration QA |
| **Commit date (UTC)** | 2026-08-13 09:42:16 +0000 |
| **Working tree** | Clean after `npm ci` / build |
| **package-lock.json** | Present (3125 bytes); unchanged |
| **Node** | v22.14.0 |
| **npm** | 10.9.7 |

---

## Production Before State

Captured **read-only** at ~2026-08-13T09:55Z UTC.

| URL | Status | Final URL | Notes |
|---|---|---|---|
| `https://synqdrive.eu/` | **200** | same | Title: *SynqDrive \| Das Betriebssystem…* |
| `https://synqdrive.eu/en/` | **200** | same | Title: *SynqDrive \| The operating system…* |
| `https://synqdrive.eu/assets/product/README.md` | **404** | — | Confirms P1.6.1 hygiene (no leaked README) |

**Response headers (representative):** LiteSpeed; `platform: hostinger`; `panel: hpanel`; `last-modified: Wed, 12 Aug 2026 14:44:31 GMT` on HTML (P1.6.1 redeploy window).

**Live structure:** Phase-1 navigation (desktop Platform disclosure + mobile modal). Runtime matches P1.6.1 manifest — **not** Phase-2 mobile composition.

**Key live fingerprints (SHA-256):**

| File | SHA-256 |
|---|---|
| `index.html` | `04788e855f3b4e4dab42c565c11f3d1f266f591c1062d62729dbf4c684cef1f7` |
| `en/index.html` | `3bdb020a9a72151580c02fbeff3e7af89c392646fade5f51b046fa9a18fd0955` |
| `script.js` | `6e17f1c027e93aa214c22ef20b18e1f96cc6750f84d7cfe5889a84a367e70db4` |
| `styles.css` | `2ebb3e245fbea443eaeb7aa491f0e0a84318e766625d3f48b30d08d94950d9e4` |

**Baseline screenshots (local, gitignored):** `qa/p28a-production-baseline/prod-{de|en}-{390x844|1440x1000}.png`

---

## App Isolation Baseline

| Check | Result |
|---|---|
| `https://app.synqdrive.eu/` | **200** — SPA shell (*Rental Operations – SynqDrive*) |
| `https://app.synqdrive.eu/api/v1/health` | **200** — `{"status":"ok","uptime":1133749,…}` |
| Host | nginx/Ubuntu VPS (**separate** from Hostinger static vhost) |
| Mutations performed | **None** |

---

## Current Production Document Root

| Field | Value |
|---|---|
| **Hosting** | Hostinger shared static (LiteSpeed / hPanel) |
| **Domain** | `synqdrive.eu` (main vhost) |
| **Document root** | `/home/u700268787/domains/synqdrive.eu/public_html` |
| **Username** | `u700268787` |
| **Deployment method (established)** | Build `dist/` → `npm run package` → Hostinger MCP `hosting_deployStaticWebsite` (archive root = site files) |

**Live inventory (mirrored read-only):**

| Metric | Value |
|---|---|
| Public file count | **29** |
| Total uncompressed size | **1,130,554 bytes** (~1.08 MiB) |
| Top-level | `index.html`, `script.js`, `styles.css`, `robots.txt`, `sitemap.xml`, `assets/`, `en/` |

---

## Rollback Artefact

| Field | Value |
|---|---|
| **Filename** | `rollback/synqdrive.eu-pre-p2.8-20260813_095611.tar.gz` |
| **Created (UTC)** | 2026-08-13 09:56:11 |
| **Size (bytes)** | **1,016,832** (993 KiB) |
| **SHA-256** | `a767d61ce374af42e8219deee7ae55e7366843853dab533c5cc3ece842c2d8bc` |
| **File count (regular files)** | **29** |
| **Source** | HTTPS mirror of live docroot (verified against P1.6.1 manifest paths + hashes) |

**Note:** Archive stored locally under `rollback/` per [`rollback/README.md`](../../rollback/README.md). Binary is **gitignored** (`*.tar.gz`).

---

## Rollback Verification

| Check | Result |
|---|---|
| `tar -tzf` listing | **PASS** — 29 files; site layout at archive root |
| Test extraction | **PASS** — extracted to `/tmp/p28a-rollback-test` |
| Forbidden content | **PASS** — no `.git`, `node_modules`, credentials, README leaks, nested rollback archives |
| **ROLLBACK RESTORE STRUCTURE** | **PASS** — extracted file list identical to live mirror |

---

## Restore Procedure

Emergency rollback for P2.8B (conceptual — **not executed in P2.8A**):

1. **Stop** further deployment mutation; confirm errant deploy scope.
2. **Do not** touch `app.synqdrive.eu`, Product VPS, DNS, or Cloudflare.
3. Deploy **`rollback/synqdrive.eu-pre-p2.8-20260813_095611.tar.gz`** to `synqdrive.eu` via established Hostinger **`hosting_deployStaticWebsite`** (files at archive root — same contract as P1.6/P1.6.1).
4. Verify **`https://synqdrive.eu/`** and **`https://synqdrive.eu/en/`** return **200** with P1.6.1 fingerprints (`script.js` SHA `6e17f1c0…`, `assets/product/README.md` → **404**).
5. Verify product assets load (hero + section screenshots return **200**).
6. Re-check **`https://app.synqdrive.eu/api/v1/health`** → `status: ok` (isolation).
7. Purge LiteSpeed / Hostinger cache **only if** post-deploy verification shows stale HTML (same optional step as P1.6 acceptance).

---

## Clean Install

```bash
npm ci
```

| Check | Result |
|---|---|
| Lockfile modified | **NO** |
| `git status` after install | Clean |

---

## Release Build

```bash
npm run build
```

| Metric | Value |
|---|---|
| **Build** | **PASS** |
| `verify-dist-artefact` | **PASS** |
| Public file count | **29** |
| Total `dist/` size | **1,148,999 bytes** |
| HTML files | **2** (`index.html`, `en/index.html`) |
| CSS files | **1** (`styles.css` — 50,315 bytes Phase-2) |
| JS files | **1** (`script.js`) |
| Product/asset files under `assets/` | **23** |

---

## Dist Hygiene

Policy: [`tools/public-artefact-policy.mjs`](../../tools/public-artefact-policy.mjs) + [`tools/verify-dist-artefact.mjs`](../../tools/verify-dist-artefact.mjs)

| Check | Result |
|---|---|
| No `docs/`, `audits/`, `e2e/`, README, `.cursor/`, `.git/`, `node_modules/` | **PASS** |
| No `assets/product/README.md` | **PASS** |
| No source maps | **PASS** |

**DIST HYGIENE:** **PASS**

---

## Security / Privacy Scan

Automated scan of shipped `dist/` HTML/CSS/JS for obvious secrets, localhost, private IPs, tenant data.

| Finding | Result |
|---|---|
| API keys / passwords / tokens | **None** (CSS comment references “design tokens” only) |
| localhost / 127.0.0.1 | **None** |
| Credentials in artefact | **None** |

**SECURITY SCAN:** **PASS**

---

## QA

Executed from release checkout **`92392d2`** after clean install + build.

| Suite | Required | Result |
|---|---|---|
| Chromium (`npm run qa`) | **100/100** | **PASS** (17.1m) |
| WebKit (`npm run qa:webkit`) | **2/2** | **PASS** (1.5s) |

Executed 2026-08-13 on branch `cursor/phase-2-production-release` at release SHA **`92392d2`** after `npm ci` + `npm run build`.

---

## Package Verification

```bash
npm run package
```

| Check | Result |
|---|---|
| Files at archive root | **PASS** |
| No nested `dist/` | **PASS** |
| No internal docs / rollback / `.git` | **PASS** |
| Package size | **996,352 bytes** (~996 KiB) |

**PACKAGE VERIFICATION:** **PASS**

---

## Release Artefact

| Field | Value |
|---|---|
| **Filename** | `synqdrive-landing-page.tar.gz` (repo root; gitignored) |
| **Size (bytes)** | **996,352** |
| **SHA-256** | `37abe53e1564542854b68ea57f1893c914645eb54ebc21f872680efc61326e09` |
| **Release SHA** | `92392d23ca9f12c4d18befdcd06c611a593dd3a9` |

**P2.8B must deploy this exact checksum** — no last-minute rebuild.

---

## Package / Dist Equivalence

Extracted package to temp dir; file inventory compared to `dist/`.

**PACKAGE ↔ DIST:** **PASS**

---

## Product Asset Integrity

All `/assets/` references in packaged DE/EN HTML resolve within the artefact (**21** distinct asset paths checked; **0 missing**).

**Product Images changed in P2.8A:** **NO**

Known **non-blocking** manual Class-C crop improvements (AI, Workflow, Communication) remain documented from P2.7.

---

## Production Mutation Status

| Target | Mutated in P2.8A? |
|---|---|
| Production docroot | **NO** |
| Hostinger configuration | **NO** |
| DNS | **NO** |
| Cloudflare | **NO** |
| `app.synqdrive.eu` | **NO** |
| Product VPS | **NO** |

---

## P2.8B GO / NO-GO

| Gate | Status |
|---|---|
| Exact main SHA `92392d2` | **YES** |
| Clean working tree | **YES** |
| Production baseline captured | **YES** |
| Exact current rollback created + SHA-256 | **YES** |
| Rollback test extraction | **PASS** |
| Rollback restore structure | **PASS** |
| Build + dist hygiene + security | **PASS** |
| Package + package ↔ dist | **PASS** |
| QA 100/100 + WebKit 2/2 | **PASS** |
| App isolation baseline | **PASS** |
| No Production mutation | **YES** |

**P2.8B GO:** **YES**

P2.8B owns: deploy **`37abe53e…`** package built from **`92392d2`**, post-deploy live acceptance, optional cache purge per established procedure.

---

## Known Non-Blocking Limitations

- Manual Class-C product screenshot crops (AI, Workflow, Communication) — tracked; not deploy blockers
- Hostinger HTTP 429 possible under rapid production Playwright runs (P1.6 pattern)
- Physical iPhone Safari not in agent environment; WebKit smoke remains acceptance proxy

---

## Commit SHAs

| Item | SHA |
|---|---|
| Release candidate (deploy source) | `92392d2` |
| P2.8A documentation | *(this commit on `cursor/phase-2-production-release`)* |
