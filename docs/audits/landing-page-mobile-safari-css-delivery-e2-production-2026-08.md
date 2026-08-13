# E2 — Mobile Safari CSS Delivery Incident: Controlled Production Deployment

**Date:** 2026-08-13 (UTC)  
**Domain:** `synqdrive.eu`  
**Result:** **E2 TECHNICAL DEPLOYMENT PASS** — real iPhone Safari acceptance **PENDING OWNER TEST**

---

## Executive Summary

The exact frozen E1/E1.1/E1.2 incident-remediation artefact was deployed to Hostinger static hosting via `hosting_deployStaticWebsite`. Pre-deploy rollback verification, serial Production smoke, fingerprinted HTML/CSS/JS delivery, one Chromium sentinel check, one WebKit sentinel check, and `app.synqdrive.eu` isolation all **PASS**. No cache purge required. No rollback executed.

**Incident remediation is live on Production from a controlled technical perspective.** Final incident closure requires the owner to confirm the site on a real iPhone Safari device.

---

## Release Identity

| Field | Value |
|---|---|
| **Merged PR** | #9 |
| **Merge commit (`main`)** | `0aeb278954be9f242dd9beb3eb67bf2486babf65` |
| **Approved branch head (in merge)** | `7299adf01ec33f749603f3e66f1efcd38d8a9d76` |
| **E1 chain** | `d9b0bbc`, `4abcc20`, `941c8b2`, `0fa29eb`, `9bfdc12`, `7bb2131`, `7cc4c3e`, `7299adf` |
| **Artefact** | `synqdrive-landing-page.tar.gz` |
| **Artefact size** | **1,027,239 bytes** |
| **Artefact SHA-256** | `75cdd62cf817adc1027d23265044cbeab21a805f1b1c2afe2324b712fcdae55d` |
| **Expected CSS fingerprint** | `styles.88323d36c46c.css` |
| **Expected JS fingerprint** | `script.6e17f1c027e9.js` |
| **Approved local QA** | Chromium **107/107**, WebKit **10/10** |

No rebuild or repackage was performed before deploy. The frozen E2 package SHA was verified locally before mutation.

---

## Rollback Identity (verified; not executed)

| Field | Value |
|---|---|
| **Filename** | `rollback/synqdrive.eu-pre-p2.8-20260813_095611.tar.gz` |
| **SHA-256** | `a767d61ce374af42e8219deee7ae55e7366843853dab533c5cc3ece842c2d8bc` |
| **Size** | **1,016,041 bytes** |
| **Archive integrity** | **PASS** |
| **Rollback executed** | **NO** |

---

## Pre-Deploy Production Check (serial)

| Check | Result |
|---|---|
| `https://synqdrive.eu/` | **200** |
| `https://synqdrive.eu/en/` | **200** |
| `https://app.synqdrive.eu/` | **200** |
| `https://app.synqdrive.eu/api/v1/health` | **200** — `status: ok` |

---

## Deployment

| Field | Value |
|---|---|
| **Target domain** | `synqdrive.eu` |
| **Document root** | `/home/u700268787/domains/synqdrive.eu/public_html` |
| **Mechanism** | Hostinger MCP `hosting_deployStaticWebsite` |
| **Archive deployed** | `/workspace/synqdrive-landing-page.tar.gz` |
| **Archive SHA-256** | `75cdd62cf817adc1027d23265044cbeab21a805f1b1c2afe2324b712fcdae55d` |
| **Deploy UTC** | **2026-08-13T19:43:07Z** |
| **Upload result** | `success` — `synqdrive-landing-page.tar.gz` |
| **Deploy result** | `success` — `Request accepted` |
| **Second deploy** | **NO** |

---

## Cache Action

| Field | Value |
|---|---|
| **Cache purge** | **NO** |
| **Reason** | Cache-busted Production requests served new HTML with fingerprinted asset references immediately after deploy; no stale HTML observed |

No Hostinger/LiteSpeed cache configuration was changed. No Cloudflare changes.

---

## Live HTML Identity (cache-busted)

| Locale | Primary CSS reference | Primary JS reference | Result |
|---|---|---|---|
| DE (`/`) | `/styles.88323d36c46c.css` | `/script.6e17f1c027e9.js` | **PASS** |
| EN (`/en/`) | `/styles.88323d36c46c.css` | `/script.6e17f1c027e9.js` | **PASS** |

Stable compatibility aliases remain present in the deployed artefact (`styles.css`, `script.js`).

---

## Live Asset Delivery

| Asset | HTTP | Content-Type | Result |
|---|---|---|---|
| `/styles.88323d36c46c.css` | **200** | `text/css` | **PASS** |
| `/script.6e17f1c027e9.js` | **200** | `application/x-javascript` | **PASS** |
| `/styles.css` (alias) | **200** | `text/css` | **PASS** |
| `/script.js` (alias) | **200** | `application/x-javascript` | **PASS** |

---

## Controlled Browser Sentinel Checks (Production)

One serial check per engine at **390×844**, DE homepage, cache-busted.

### Chromium

| Check | Result |
|---|---|
| `--synqdrive-release-css` sentinel | **`1`** |
| White/light canvas (`html`/`body`) | **PASS** |
| List bullets absent | **PASS** |
| Navigation links not default-underlined | **PASS** |
| Skip link off-screen while unfocused | **PASS** |
| Inline SVG bounded (max **22px**) | **PASS** |
| Horizontal overflow absent | **PASS** |
| Masthead sticky + H1 styled | **PASS** |

**Chromium CSS sentinel:** **PASS**

### WebKit

| Check | Result |
|---|---|
| `--synqdrive-release-css` sentinel | **`1`** |
| White/light canvas | **PASS** |
| Masthead composed | **PASS** |
| H1 styled | **PASS** |
| List bullets absent | **PASS** |
| Navigation links not default-underlined | **PASS** |
| Skip link off-screen | **PASS** |
| Inline SVG bounded (max **22px**) | **PASS** |
| Horizontal overflow absent | **PASS** |

**WebKit CSS sentinel:** **PASS**

**Catastrophic unstyled incident signature absent:** **PASS**

Full WebKit/Chromium Production QA matrices were intentionally **not** run (rate-limit / hammering avoidance).

---

## App Isolation After Deploy

| Check | Result |
|---|---|
| `https://app.synqdrive.eu/` | **200** |
| `https://app.synqdrive.eu/api/v1/health` | **200** — `status: ok` |
| Product app mutated | **NO** |

---

## Rollback Decision

| Field | Value |
|---|---|
| **Rollback required** | **NO** |
| **Rollback executed** | **NO** |

No catastrophic deployment failure observed.

---

## Real-Device Acceptance

| Gate | Status |
|---|---|
| **E2 technical deployment** | **PASS** |
| **Incident remediation live (technical)** | **YES** |
| **Real iPhone Safari acceptance** | **PENDING OWNER TEST** |

The owner must open `https://synqdrive.eu` on their real iPhone Safari before the incident can be marked fully **CLOSED**.

---

## Scope Confirmation

| Constraint | Status |
|---|---|
| Landing design changed in E2 | **NO** |
| Product Images changed | **NO** |
| `app.synqdrive.eu` touched | **NO** |
| Large Production Playwright matrix run | **NO** |
