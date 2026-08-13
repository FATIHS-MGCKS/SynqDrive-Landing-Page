# Phase 2.8B — Exact Phase-2 Production Deployment + Immediate Safety Gate

**Date:** 2026-08-13 (UTC)  
**Domain:** `synqdrive.eu`  
**Result:** **P2.8B PASS** — Phase 2 live; rollback not required

---

## Executive Summary

The exact P2.8A release artefact (`37abe53e…`) was deployed to Hostinger static hosting via `hosting_deployStaticWebsite`. Pre-deploy P1.6.1 fingerprints matched P2.8A baseline. Post-deploy HTTP smoke, Phase-2 structural fingerprints, product assets, targeted mobile/desktop Playwright smoke, and `app.synqdrive.eu` isolation all **PASS**. No cache purge required. No rollback executed.

---

## Release Identity

| Field | Value |
|---|---|
| **Source SHA** | `92392d23ca9f12c4d18befdcd06c611a593dd3a9` |
| **Artefact** | `synqdrive-landing-page.tar.gz` |
| **Artefact SHA-256** | `37abe53e1564542854b68ea57f1893c914645eb54ebc21f872680efc61326e09` |
| **origin/main at deploy** | `92392d2` (verified; no drift) |

---

## Rollback Identity

| Field | Value |
|---|---|
| **Filename** | `rollback/synqdrive.eu-pre-p2.8-20260813_095611.tar.gz` |
| **SHA-256** | `a767d61ce374af42e8219deee7ae55e7366843853dab533c5cc3ece842c2d8bc` |
| **Status** | Verified before deploy; not used |

---

## Pre-Deploy Drift Check

**PASS** — Production matched P2.8A P1.6.1 baseline (~2026-08-13T10:23:57Z UTC)

| Check | Result |
|---|---|
| `https://synqdrive.eu/` | **200** |
| `https://synqdrive.eu/en/` | **200** |
| `index.html` SHA-256 | `04788e855f3b4e4dab42c565c11f3d1f266f591c1062d62729dbf4c684cef1f7` |
| `en/index.html` SHA-256 | `3bdb020a9a72151580c02fbeff3e7af89c392646fade5f51b046fa9a18fd0955` |
| `script.js` SHA-256 | `6e17f1c027e93aa214c22ef20b18e1f96cc6750f84d7cfe5889a84a367e70db4` |
| `styles.css` SHA-256 | `2ebb3e245fbea443eaeb7aa491f0e0a84318e766625d3f48b30d08d94950d9e4` |
| `/assets/product/README.md` | **404** |

---

## App Isolation Before

| Check | Result |
|---|---|
| `https://app.synqdrive.eu/` | **200** |
| `https://app.synqdrive.eu/api/v1/health` | **200** — `status: ok`, uptime **1,135,461** |

---

## Deployment

| Field | Value |
|---|---|
| **Target domain** | `synqdrive.eu` |
| **Document root** | `/home/u700268787/domains/synqdrive.eu/public_html` |
| **Mechanism** | Hostinger MCP `hosting_deployStaticWebsite` |
| **Archive deployed** | `/workspace/synqdrive-landing-page.tar.gz` |
| **Deploy start (UTC)** | ~2026-08-13T10:24:09Z |
| **Deploy completion (UTC)** | ~2026-08-13T10:24:25Z (first verified live Phase-2 fingerprints) |
| **Upload result** | `success` — `synqdrive-landing-page.tar.gz` |
| **Deploy result** | `success` — `Request accepted` |
| **Second deploy** | **No** |

---

## Cache Action

**None** — cache-busted requests (`?cb=…`) served Phase-2 content immediately; no LiteSpeed/Hostinger purge required.

---

## Immediate HTTP Smoke

**PASS**

| URL | Status |
|---|---|
| `https://synqdrive.eu/` | **200** — DE title correct |
| `https://synqdrive.eu/en/` | **200** — EN title correct |
| `https://synqdrive.eu/assets/product/README.md` | **404** |

---

## Phase-2 Fingerprint

**PASS**

| Fingerprint | Pre (P1.6.1) | Post (Phase 2) |
|---|---|---|
| `styles.css` SHA-256 | `2ebb3e24…` | **`71fe15ec…`** (matches package) |
| `index.html` SHA-256 | `04788e85…` | **`9d574add…`** (matches package) |
| `script.js` SHA-256 | `6e17f1c0…` | **`6e17f1c0…`** (unchanged in release artefact) |
| Platform mobile composition | — | **`brief--product-led`** — intro → media → capabilities |
| AI mobile order | — | Product visual before support block |
| Integrations hub | — | `.hub__core` visible on mobile |

---

## Product Asset Smoke

**PASS** — representative hero/platform/vehicle/AI/workflow/communication desktop + mobile assets return **200**.

---

## Mobile Smoke (Playwright → Production)

| Locale | Viewport | Result |
|---|---|---|
| DE | 390×844 | **PASS** — no overflow; hero/platform/hub/footer; 6 product frames; nav open/close; no console errors |
| EN | 390×844 | **PASS** — same |

---

## Desktop Smoke (Playwright → Production)

| Locale | Viewport | Result |
|---|---|---|
| DE | 1440×1000 | **PASS** — Platform disclosure; hero; platform grid; vehicle `stage__panel`; AI mirror; workflow chain; communication split; 6 hub tiles; CTA/footer; no overflow |
| EN | 1440×1000 | **PASS** — same |

---

## App Isolation After

**PASS**

| Check | Result |
|---|---|
| `https://app.synqdrive.eu/` | **200** |
| `https://app.synqdrive.eu/api/v1/health` | **200** — `status: ok`, uptime **1,135,482** (increased; unaffected) |

---

## Rollback Decision

**NOT REQUIRED** — no catastrophic failure observed.

---

## Production State

**Phase 2 is live** on `https://synqdrive.eu` and `https://synqdrive.eu/en/`.

Pre-P2.8 rollback remains available locally: `rollback/synqdrive.eu-pre-p2.8-20260813_095611.tar.gz`.

---

## P2.8C Readiness

**P2.8C READY:** **YES**

Full Production Acceptance suite (100-test Chromium + production WebKit + extended live checks) deferred to P2.8C per gate scope.

---

## Commit SHAs

| Item | SHA |
|---|---|
| Deployable release source | `92392d2` |
| P2.8B documentation | `076d4bd79700004195fa0a82825ac27e8bd9c795` |
