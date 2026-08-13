# Phase 2.8C — Production Acceptance (Infrastructure-Limited)

**Date:** 2026-08-13 (UTC)  
**Domain:** `synqdrive.eu`  
**Result:** **P2.8C PASS WITH INFRASTRUCTURE-LIMITED PRODUCTION TESTING**  
**Phase 2 Production Accepted:** **YES**

---

## Executive Summary

Full Production Chromium replay of the pre-deployment 100-test suite was **intentionally stopped** after Hostinger shared-hosting rate limiting distorted parallel QA. The exact deploy artefact had already passed **Chromium 100/100** and **WebKit 2/2** against localhost before deployment (P2.7.1), and P2.8A/B cryptographically verified and deployed that same artefact.

Targeted **serial** Production checks (HTTP, Phase-2 identity, minimal mobile/desktop smoke, representative assets, app isolation, rollback checksum) all **PASS**. No deterministic runtime defect was found.

**Do not report:** Production Chromium 100/100.  
**Do report:** Pre-deployment exact artefact Chromium 100/100; Production exhaustive replay **NOT COMPLETED** due to Hostinger rate limiting; Production critical acceptance smoke **PASS**.

---

## Release Identity (unchanged from P2.8B)

| Field | Value |
|---|---|
| **Production runtime source SHA** | `92392d23ca9f12c4d18befdcd06c611a593dd3a9` |
| **Release artefact** | `synqdrive-landing-page.tar.gz` |
| **Artefact SHA-256** | `37abe53e1564542854b68ea57f1893c914645eb54ebc21f872680efc61326e09` |
| **Pre-deploy QA (exact artefact, localhost)** | Chromium **100/100**; WebKit **2/2** (P2.7.1) |

---

## Rollback Identity (local verification only — not deployed)

| Field | Value |
|---|---|
| **Filename** | `rollback/synqdrive.eu-pre-p2.8-20260813_095611.tar.gz` |
| **Expected SHA-256** | `a767d61ce374af42e8219deee7ae55e7366843853dab533c5cc3ece842c2d8bc` |
| **Verified locally** | **PASS** |
| **Rollback executed** | **No** |

---

## 1. Rate-Limit Condition

### Full Production Chromium replay

**ABORTED DUE TO HOSTINGER RATE LIMITING**

A parallel Production run of the full Chromium suite (`npm run qa:prod`, 100 tests) was started after P2.8B deployment. The first observed run reached **56/100 passed** before/with rate-limit interference (429 / throttled resource requests / cascading timeouts). A retry loop was started and **subsequently stopped** per P2.8C revised scope — no further exhaustive Production replay was attempted.

### Classification

| Classification | Applies |
|---|---|
| **INFRASTRUCTURE-LIMITED TEST EXECUTION** | **YES** |
| **LANDING PAGE FAILURE** | **NO** |

Remaining failures from the aborted run are **not** classified as product regressions unless an individual case demonstrated a deterministic runtime defect independent of 429 / rate limiting / failed throttled requests. None were identified.

### Actions explicitly not taken

- No redeploy, rebuild, or rollback
- No runtime code changes
- No pursuit of Production 100/100
- No re-run of full mobile/tablet/desktop/landscape/CLS/anchor/JS-off matrices against Production (pre-deploy exact-artefact QA remains authoritative)

---

## 2. Critical HTTP Check (serial, once)

**PASS**

| URL | Required | Result |
|---|---|---|
| `https://synqdrive.eu/` | 200 | **200** |
| `https://synqdrive.eu/en/` | 200 | **200** |
| `https://synqdrive.eu/assets/product/README.md` | 404 | **404** |

---

## 3. Phase-2 Live Identity

**PASS** — verified once (2026-08-13 ~11:51 UTC)

| Fingerprint | Value / state |
|---|---|
| `styles.css` SHA-256 | `71fe15ecaf213a2cd089859c67ae39b36da1789856cbcbf9ee7ba4b39bbfbbe8` |
| `index.html` SHA-256 | `9d574add5086cceff34ee31d89fcd259893a3f5358718836792f051e5a7de5f9` |
| `script.js` SHA-256 | `6e17f1c027e93aa214c22ef20b18e1f96cc6750f84d7cfe5889a84a367e70db4` (unchanged in release artefact) |
| Platform composition | **`brief--product-led`** present |
| AI mobile DOM order | intro → Product Visual → support |
| Communication mobile DOM order | intro → Product Visual → notes |
| Integrations mobile | `.hub__core` visible |

Phase-2 token fingerprint confirmed in live CSS (`--stack-copy-visual`, `.brief--product-led` rules).

---

## 4. Minimal Mobile Live Check — DE (390×844)

**PASS** — one serial Chromium check; browser closed after verification.

| Check | Result |
|---|---|
| Page loads | **200** |
| No horizontal overflow | **PASS** |
| Hero visible | **PASS** |
| One H1 | **PASS** |
| All major sections present | **PASS** |
| 6 Product Frames (`.frame--product`) | **PASS** |
| Product images loaded | **PASS** (8 images complete) |
| Mobile navigation open/close | **PASS** (`[data-nav-toggle]` / `[data-nav-close]`) |
| AI Product Visual before support | **PASS** |
| Integrations core visible | **PASS** |
| Integrations item 3 → item 4 seam | **1px** (not broken) |
| CTA visible | **PASS** |
| Footer visible | **PASS** |
| Deterministic page errors | **0** |

---

## 5. Minimal Mobile Live Check — EN (390×844)

**PASS** — one serial Chromium check; browser closed after verification.

| Check | Result |
|---|---|
| Page loads | **200** |
| One H1 | **PASS** |
| All sections present | **PASS** |
| Product Frames load | **PASS** (6 frames) |
| No horizontal overflow | **PASS** |
| Navigation usable | **PASS** |
| Footer present | **PASS** |
| Deterministic page errors | **0** |

---

## 6. Minimal Desktop Live Check — DE (1440×1000)

**PASS** — one serial Chromium check; browser closed after verification.

| Check | Result |
|---|---|
| Desktop Platform disclosure | **PASS** (hover → `#platform-menu`) |
| Hero desktop composition | **PASS** |
| Platform `brief--product-led` | **PASS** |
| Vehicle stage present | **PASS** |
| AI desktop mirror split | **PASS** (`split--mirror`) |
| Workflow 3-stage layout | **PASS** (3 full-card chain links) |
| Communication product-left layout | **PASS** (`split--mirror`) |
| Integrations 3-column hub | **PASS** (`.hub__diagram` 3 columns) |
| CTA / Footer | **PASS** |
| No horizontal overflow | **PASS** |
| Deterministic page errors | **0** |

---

## 7. Representative Product Assets

**PASS** — HEAD requests once each (browser network evidence also sufficient where images rendered in smoke checks).

All returned **200**:

| Section | Desktop asset | Mobile asset |
|---|---|---|
| Hero | `landing-hero-operations.webp` | `landing-hero-operations-mobile.webp` |
| Platform | `landing-unified-operations.webp` | `landing-unified-operations-mobile.webp` |
| AI | `landing-ai-orchestration.webp` | `landing-ai-orchestration-mobile.webp` |
| Workflow | `landing-workflow-automation.webp` | `landing-workflow-automation-mobile.webp` |
| Communication | `landing-communications.webp` | `landing-communications-mobile.webp` |
| Vehicle | `landing-connected-vehicle.webp` | `landing-connected-vehicle-mobile.webp` |

Paths served from `/assets/` (public docroot).

---

## 8. App Isolation (read-only, once)

**PASS**

| Check | Result |
|---|---|
| `https://app.synqdrive.eu/` | **200** — SPA reachable |
| `https://app.synqdrive.eu/api/v1/health` | **200** — `status: ok`, uptime **1,140,715** |

Landing-page deploy did not affect the product VPS host.

---

## 9. Runtime Findings

| Severity | Count |
|---|---|
| **CRITICAL** deterministic runtime defects | **0** |
| **HIGH** deterministic runtime defects | **0** |

---

## 10. QA Truth Summary

| Gate | Result |
|---|---|
| Pre-deployment exact artefact Chromium | **100/100 PASS** |
| Pre-deployment exact artefact WebKit | **2/2 PASS** |
| P2.8A artefact verification | **PASS** |
| P2.8B deployment identity | **PASS** |
| Production exhaustive Chromium replay | **NOT COMPLETED — HOSTINGER RATE LIMITING** |
| Production critical acceptance smoke | **PASS** |

---

## 11. Phase Gate Status

| Gate | Status |
|---|---|
| **P2.8A** | **PASS** |
| **P2.8B** | **PASS** |
| **P2.8C** | **PASS WITH INFRASTRUCTURE-LIMITED PRODUCTION TESTING** |
| **Phase 2 Production Accepted** | **YES** |
| **Phase 2 live on Production** | **YES** |

### Known non-blocking manual assets (unchanged)

- AI Class C
- Workflow Class C
- Communication Class C

---

## 12. Explicit Non-Requirements (P2.8C scope)

The following were **not** re-run against Production and remain covered by pre-deploy exact-artefact QA:

- Full 100-test Chromium suite
- Full mobile / tablet / desktop / landscape matrices
- Six-entry CLS matrix
- Full anchor matrix
- Full JavaScript-off regression matrix
- Every breakpoint boundary band

---

## Commit SHAs

| Item | SHA |
|---|---|
| Deployable release source (`main`) | `92392d23ca9f12c4d18befdcd06c611a593dd3a9` |
| P2.8B documentation | `076d4bd79700004195fa0a82825ac27e8bd9c795` |
| P2.8C documentation | *(this commit on `cursor/phase-2-production-release`)* |

---

## Related Audits

- [`landing-page-phase-2.8a-production-predeploy-2026-08.md`](landing-page-phase-2.8a-production-predeploy-2026-08.md)
- [`landing-page-phase-2.8b-production-deployment-2026-08.md`](landing-page-phase-2.8b-production-deployment-2026-08.md)
- [`landing-page-phase-2.7-integration-qa-2026-08.md`](landing-page-phase-2.7-integration-qa-2026-08.md) (pre-deploy 100/100 evidence)
