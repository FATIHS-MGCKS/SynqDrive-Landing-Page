# Phase 1.6 — Production Deployment & Live Acceptance

**Date:** 2026-08-12  
**Domain:** `synqdrive.eu`  
**Result:** **PHASE 1 PRODUCTION ACCEPTANCE: PASS**

---

## Executive Summary

Phase-1 navigation (P1.3 desktop Platform disclosure, P1.4/P1.4.1 mobile modal) was deployed to Production via Hostinger static-site deployment. Live acceptance passed: HTTP routes, navigation markup, asset hashes, local and production QA suites, and product-application isolation. Physical iPhone Safari validation was not available in the execution environment; Playwright WebKit Production smoke passed.

---

## Deployment

| Field | Value |
|---|---|
| Deployment timestamp (UTC) | **2026-08-12T12:58:22Z** |
| Domain | `synqdrive.eu` (Hostinger shared static hosting — **not** VPS / **not** `app.synqdrive.eu`) |
| Repository HEAD (build) | **`ff235ea`** |
| Runtime release-candidate baseline | **`c77dc76`** (no runtime delta in commits after RC through build HEAD) |
| Package | `synqdrive-landing-page.tar.gz` — `dist/` contents at archive root |
| Deployment mechanism | Hostinger MCP `hosting_deployStaticWebsite` |
| Hostinger response | Upload success; deploy request accepted |

### Release manifest (SHA-256)

Full sorted manifest: [`p1.6-release-manifest-2026-08-12.txt`](p1.6-release-manifest-2026-08-12.txt)

Key artefacts:

| File | SHA-256 |
|---|---|
| `index.html` | `04788e855f3b4e4dab42c565c11f3d1f266f591c1062d62729dbf4c684cef1f7` |
| `en/index.html` | `3bdb020a9a72151580c02fbeff3e7af89c392646fade5f51b046fa9a18fd0955` |
| `script.js` | `6e17f1c027e93aa214c22ef20b18e1f96cc6750f84d7cfe5889a84a367e70db4` |
| `styles.css` | `2ebb3e245fbea443eaeb7aa491f0e0a84318e766625d3f48b30d08d94950d9e4` |

Production decoded response bodies for `index.html`, `script.js`, and `styles.css` matched the release manifest after deployment.

---

## Previous Production State (verified before deploy)

| Check | Pre-P1.6 live state |
|---|---|
| Date/time recorded | 2026-08-12T12:56:22Z |
| German `/` | HTTP 200 |
| English `/en/` | HTTP 200 |
| `/en` | 301 → `/en/` |
| HTTP → HTTPS | 301 |
| `www.synqdrive.eu` | HTTP 200 (same docroot; no apex redirect) |
| Navigation | Legacy flat drawer mobile nav; pre-P1.4 script (~5987 B) |
| `script.js` fingerprint | `dfa59aebbb0517b7bb7b7f84ceb3dedb8ea90a34a2f730a7964ff95d342f5120` |
| Historical baseline reference | Commit `1415ea74` (original pre–Phase-1 production deploy — not assumed identical to immediate pre-P1.6 files) |

### Rollback targets

| Target | Use |
|---|---|
| `rollback/coming-soon-2026-08-11/` | Historical coming-soon snapshot (verified faithful) |
| Pre-P1.6 fingerprint above | Redeploy prior static artefact if Phase-1 rollback required (drawer nav + ~6 kB script) |

No separate timestamped Hostinger file backup was created (not required; rollback paths documented).

---

## Build — **PASS**

```bash
npm ci
npm run build
```

Output verified: `dist/index.html`, `dist/en/index.html`, `dist/script.js`, `dist/styles.css`, `assets/`, `robots.txt`, `sitemap.xml`.

---

## Local QA — **PASS**

| Suite | Result |
|---|---|
| Chromium (`npm run qa`) | **33/33 pass** |
| WebKit smoke (`npm run qa:webkit`) | **2/2 pass** |

---

## Live HTTP — **PASS**

| URL | Result |
|---|---|
| `https://synqdrive.eu/` | 200 |
| `https://synqdrive.eu/en/` | 200 |
| `https://synqdrive.eu/en` | 301 → `/en/` |
| `http://synqdrive.eu/` | 301 → HTTPS |
| `https://www.synqdrive.eu/` | **301** post-deploy (was 200 pre-deploy; canonical tag handles content; not changed in this phase) |

---

## Navigation verification — **PASS**

Post-deploy HTML confirmed Phase-1 navigation:

- **Desktop:** `Plattform` / `Platform` disclosure; Contact absent from primary nav; Solutions/Resources/Pricing absent; six Platform anchor destinations in panel
- **Mobile:** `[data-nav-toggle]` menu trigger; full-viewport `.mobilenav` modal; Platform link list; Login; Demo; language controls

Live `script.js` size **11 171 bytes** (matches RC; pre-deploy was 5987 bytes).

---

## Production Chromium QA — **PASS**

Command: `npm run qa:prod` against `https://synqdrive.eu`

| Run | Result |
|---|---|
| Initial full suite | 27/33 pass; 6 failures from Hostinger **HTTP 429** rate limiting on rapid headless requests |
| Retry of 6 failed tests (after cooldown) | **6/6 pass** |
| **Total** | **33/33 pass** |

No tests weakened or removed.

---

## Production WebKit — **PASS**

Command: `LANDING_QA_BASE_URL=https://synqdrive.eu LANDING_QA_LABEL=prod npm run qa:webkit`

**Playwright WebKit Production smoke: 2/2 pass**

This validates WebKit engine behaviour only — **not** physical iPhone Safari.

---

## Physical iPhone Safari — **NOT AVAILABLE**

No real-device or device-farm capability in this execution environment. Recorded explicitly; not treated as deployment failure.

---

## Product Application Isolation — **PASS**

| Check | Pre-deploy | Post-deploy |
|---|---|---|
| URL | `https://app.synqdrive.eu/api/v1/health` | same |
| HTTP status | 200 | 200 |
| Body | `{"status":"ok",...}` | `{"status":"ok",...}` |
| Uptime | 1 058 206 s | 1 059 712 s |

Uptime increase consistent with elapsed wall time (~25 min); **no evidence of application restart** caused by landing-page deploy. VPS/product routing untouched.

---

## Cache — **No purge required**

Hostinger cache-clear API returned route-not-found for this account configuration. Fresh deployment content was served immediately (verified via `script.js` hash and `Last-Modified: Wed, 12 Aug 2026 12:56:35 GMT`). No CDN stale-cache issue observed.

---

## Acceptance gates (manual / QA-covered)

| Gate | Result |
|---|---|
| Desktop acceptance (1100–1920) | **PASS** (QA + screenshots) |
| Mobile acceptance (320–1024) | **PASS** (QA + screenshots) |
| Landscape (844×390, 932×430) | **PASS** (QA + screenshots) |
| Breakpoint (1024 mobile / 1025+ desktop) | **PASS** (QA resize tests) |
| DE / EN locales | **PASS** |
| Routes / anchors | **PASS** |
| Accessibility (keyboard, inert, focus) | **PASS** (QA) |
| Console / network | **PASS** (structure tests; 429 only under test-suite flood) |
| SEO files / metadata | **PASS** (`robots.txt`, `sitemap.xml`, canonical, hreflang) |

---

## Production screenshots

Captured from `https://synqdrive.eu` (stored under `qa/p16-live/` in repository workspace during acceptance):

| File | Viewport / state |
|---|---|
| `1440-de-closed.png` | Desktop closed |
| `1440-de-platform-open.png` | Desktop Platform open |
| `1920-de-platform-open.png` | Desktop Platform open |
| `320-de-open.png` | Mobile modal open |
| `390-de-closed.png` | Mobile header closed |
| `390-de-open.png` | Mobile modal open |
| `430-de-open.png` | Mobile modal open |
| `1024-de-open.png` | Tablet mobile modal |
| `1100-de-platform-open.png` | Desktop at breakpoint |
| `844x390-landscape-open.png` | Landscape modal |
| `932x430-landscape-open.png` | Landscape modal |

---

## Remaining Issues

| ID | Severity | Description | Recommendation |
|---|---|---|---|
| R1 | **LOW** | Hostinger LiteSpeed returns HTTP 429 to rapid Playwright production requests | Allow cooldown between full-suite runs; retry failed tests |
| R2 | **LOW** | `www.synqdrive.eu` now 301 (was 200 pre-deploy) | Monitor; apex canonical unchanged; redirect change not in scope |
| R3 | **LOW** | Phase 2 mobile page composition still pending | Schedule post-P1.6 |
| R4 | **LOW** | Physical iPhone Safari not validated in this environment | Optional device-farm check outside automated gate |

No **BLOCKER** or **HIGH** items.

---

## Final Result

**PHASE 1 PRODUCTION ACCEPTANCE: PASS**

Phase-1 complete. Phase 2 not started.

---

*End of Phase 1.6 production deployment audit.*
