# Mobile Safari CSS Delivery Incident — E1 Remediation Record

**Date:** 2026-08-13 (UTC)  
**Incident:** E1 — Mobile Safari CSS delivery / asset versioning  
**Production:** `https://synqdrive.eu` (**NOT modified during E1**)  
**Result:** **E1.1 PASS** — release candidate hardened after external review; **NOT DEPLOYED**

---

## Executive Summary

A real iPhone Safari user reported a catastrophically unstyled Phase-2 Production page: browser-default background, underlined links, visible skip link, raw navigation, oversized SVG/icon geometry, and absent responsive section composition while product images still loaded.

Serial Production diagnostics show all three runtime files currently return **200** and **byte-match** the deployed Phase-2 release artefact. The observed failure class is **fully explained** by loss of the main external stylesheet — reproduced locally by aborting the CSS request.

E1 implements **content-addressed CSS/JS filenames**, **transitional stable aliases**, a **minimal inline catastrophic fallback**, and **WebKit/Chromium regression guards**. No Production deploy was performed.

**Severity:** **HIGH PRODUCTION PRESENTATION / DELIVERY DEFECT**

**E2 controlled Production deployment ready:** **YES** (pending external review of this branch)

---

## User-Observed Production Failure

Real-device Safari (iPhone) on deployed Phase-2 Production (`synqdrive.eu`):

| Symptom | Observed |
|---|---|
| Background | Black / browser-default instead of SynqDrive light canvas |
| Links | Browser-default underlined |
| Lists | Browser-default bullets |
| Skip link | Visible in content flow (`Zum Inhalt`) |
| Navigation | Essentially raw document content |
| Icons / SVG | Enormous uncontrolled rendering |
| Product images | Loaded |
| Section composition | Responsive layout effectively absent |

**Classification:** *Full responsive design is not being applied* — consistent with missing/unapplied main stylesheet, **not** a normal mobile design defect.

---

## Expected CSS State (source of truth)

Verified in `src/styles.css` (release CSS):

| Rule area | Expected behaviour |
|---|---|
| `body` | `--canvas` white background, `--ink` foreground, Manrope/system stack, `overflow-x: hidden` |
| `ul, ol` | `list-style: none`, margin/padding reset |
| `a` | `text-decoration: none`, inherited colour |
| `.skip-link` | `position: absolute; top: -64px` until `:focus-visible` |
| `img` | `max-width: 100%`, `height: auto`, `display: block` |
| `svg` | bounded via parent layout (main CSS); fallback adds `max-width:100%` |
| Masthead / navigation | composed `.masthead` sticky layout, mobile modal rules at ≤1024px |
| Mobile responsive | active at phone widths via `@media (max-width: 1024px)` and lower bands |

These rules **do** exist in the deployed Phase-2 CSS. The incident state indicates they were **not applied** in the failing session.

---

## Production Request Diagnostics

Serial requests only (2026-08-13 ~12:33 UTC). **Current snapshot — not proof the historical failure did not occur.**

### Normal curl user agent

| URL | Status | Content-Type | Content-Length | Cache-Control | ETag | Last-Modified | Server |
|---|---|---|---|---|---|---|---|
| `/` | **200** | `text/html` | 35250 | *(none on HTML)* | `89b2-6a7d94c1-5d9e0526c91be16d` | Thu, 13 Aug 2026 09:56:17 GMT | LiteSpeed / Hostinger |
| `/styles.css` | **200** | `text/css` | 50315 | `public, max-age=604800` | `c48b-6a7d94c1-c9ddcb703d07c653` | Thu, 13 Aug 2026 09:56:17 GMT | LiteSpeed / Hostinger |
| `/script.js` | **200** | `application/x-javascript` | 11171 | `public, max-age=604800` | `2ba3-6a7d94c1-63f38b00981933e5` | Thu, 13 Aug 2026 09:56:17 GMT | LiteSpeed / Hostinger |

No `Age` or `Vary` headers observed. No `Content-Encoding` (identity).

### iPhone Safari user agent (once each)

| URL | Status | SHA-256 match vs normal UA |
|---|---|---|
| `/` | **200** | **MATCH** (`9d574add…`) |
| `/styles.css` | **200** | **MATCH** (`71fe15ec…`) |

---

## Production Asset Identity

Compared against P2.8B deployed Phase-2 release evidence:

| Asset | Production SHA-256 | Expected (P2.8B) | Result |
|---|---|---|---|
| `index.html` | `9d574add5086cceff34ee31d89fcd259893a3f5358718836792f051e5a7de5f9` | `9d574add…` | **MATCH** |
| `styles.css` | `71fe15ecaf213a2cd089859c67ae39b36da1789856cbcbf9ee7ba4b39bbfbbe8` | `71fe15ec…` | **MATCH** |
| `script.js` | `6e17f1c027e93aa214c22ef20b18e1f96cc6750f84d7cfe5889a84a367e70db4` | `6e17f1c0…` | **MATCH** |

Live HTML references (stable, non-versioned):

```html
<link rel="stylesheet" href="/styles.css">
<script src="/script.js" defer></script>
```

**Asset-versioning weakness:** stable shared URLs for HTML/CSS/JS allow stale-cache / HTML↔CSS mismatch across releases without filename rotation.

---

## Root Cause Classification

| Cause | Classification | Notes |
|---|---|---|
| **A.** Stylesheet request failed / 429 | **STRONGLY SUPPORTED** | Hostinger rate limiting/throttling observed during P2.8C parallel QA; transient failure class can prevent CSS load |
| **B.** Stale cached `/styles.css` | **POSSIBLE** | CSS served with `Cache-Control: public, max-age=604800` (7 days); not proven as sole cause of fully browser-default presentation |
| **C.** Stale HTML + incompatible new CSS | **POSSIBLE** | Non-versioned URLs increase cross-release cache mismatch risk |
| **D.** New HTML + stale CSS | **POSSIBLE** | Same architecture weakness |
| **E.** Wrong MIME / delivery | **EXCLUDED** | Current responses: `text/css`, `application/x-javascript` |
| **F.** Safari-specific application bug | **POSSIBLE** | Not reproduced on current serial fetch; cannot confirm historical session |
| **G.** Unknown transient delivery failure | **POSSIBLE** | Cannot reconstruct exact failing request |
| **Stable `/styles.css` architecture weakness** | **CONFIRMED ARCHITECTURE WEAKNESS** | Regardless of current 200 responses |

**Incident root cause (summary):** **EXTERNAL STYLESHEET UNAVAILABLE / NOT APPLIED** — most directly consistent with the user screenshot. Historical exact HTTP status remains unproven. Primary remediation now covers **release mismatch** and **transient primary CSS fetch failure** (one-time alias retry).

---

## Existing Release Architecture Weakness

- HTML, CSS, and JS use **stable filenames** (`/styles.css`, `/script.js`).
- CSS cached **7 days** at edge/origin (`max-age=604800`).
- HTML has **no explicit short-lived cache header** in observed responses but can still be cached by browsers/CDN behaviour.
- A failed or stale CSS fetch produces **catastrophic unstyled presentation** with **no inline safety net** in current Production.

---

## Local Failure Reproduction

Playwright WebKit and Chromium at **390×844** (E1.1):

1. **Normal load** — release stylesheet sentinel `--synqdrive-release-css: 1` applied; composed layout present.
2. **Abort fingerprinted CSS only** — one-time alias retry succeeds; sentinel restored; composed layout returns.
3. **Abort fingerprinted CSS + alias retry** — sentinel absent; **safe degraded state** via inline fallback (light canvas, no bullets/underlines, skip link off-screen, inert nav panel hidden, SVG icons bounded ≤32px).
4. **WebKit dark mode (`colorScheme: dark`)** — normal CSS and total CSS failure both preserve intentional light canvas.

This proves structurally that **loss of external CSS can create the reported failure class**, and that E1.1 prevents catastrophic recurrence.

---

## Remediation Architecture

### Fingerprinted CSS

- Build emits `styles.<12-hex-content-hash>.css` from final bytes written to disk.
- E1 candidate: `styles.88323d36c46c.css` (includes `--synqdrive-release-css` sentinel).

### Fingerprinted JS

- Build emits `script.<12-hex-content-hash>.js`.
- E1 candidate: `script.6e17f1c027e9.js` (unchanged content vs Production).

### Compatibility Aliases

- `dist/styles.css` and `dist/script.js` remain as **byte-identical aliases** to current fingerprinted files for old cached HTML.
- Future alias removal requires a separate compatibility decision.

### Catastrophic Inline Fallback

- Minimal `<style id="synqdrive-catastrophic-fallback">` in `<head>` before external stylesheet link.
- Foundational safety rules only — **not** a second responsive design system.
- E1.1 adds: `html{background:#fff;color-scheme:light}`, explicit white `body`, `svg{width:24px;height:24px}`, `.nav-panel[inert]{display:none}`.

### One-Time Stylesheet Recovery (E1.1)

- Primary `<link>` references fingerprinted CSS.
- On **one** `error` event only, inject retry `<link href="/styles.css?v=<cssFingerprint>">`.
- `retried` guard prevents loops; no polling.

### Intrinsic Icon Safety (E1.1)

- Generated Lucide SVG roots include `width="24" height="24"` in addition to `viewBox`.
- External CSS remains authoritative for composed icon sizing when CSS loads.

---

## Cache Strategy

- **No repository-owned `.htaccess` or LiteSpeed rules found.**
- Hostinger currently sets **7-day cache** on CSS/JS; HTML unversioned.
- Repository **cannot safely control** immutable/long-lived headers for fingerprinted assets without verified Hostinger support — **documented limitation**.
- **Primary fix:** content-addressed filenames + HTML references.
- **Production cache purge:** **NOT performed in E1** — deferred to controlled E2 deployment.

---

## WebKit Regression Coverage

| Test | Viewport | Result |
|---|---|---|
| Stylesheet sentinel + composed mobile layout | 390×844 DE | **PASS** |
| Stylesheet sentinel + composed mobile layout | 390×844 EN | **PASS** |
| Primary CSS blocked → alias retry → sentinel restored | 390×844 DE | **PASS** |
| Primary + retry CSS blocked → safe degraded state | 390×844 DE | **PASS** |
| Dark mode + normal CSS → light canvas | 390×844 DE | **PASS** |
| Dark mode + all CSS blocked → safe fallback | 390×844 DE | **PASS** |
| Incident screenshot-signature guard | 390×844 DE dark | **PASS** |
| Existing mobile nav smoke | 390×844 | **PASS** |

**WebKit suite:** **10/10 PASS**

---

## Chromium Regression Coverage

| Test | Result |
|---|---|
| Full existing landing QA | **100/100 PASS** |
| Stylesheet delivery contract + recovery + resilience | **7/7 PASS** |

**Chromium suite total:** **107/107 PASS**

---

## CSS Failure Resilience

Forced abort of fingerprinted CSS at 390×844:

| Check | Result |
|---|---|
| Light body background | **PASS** |
| Readable foreground | **PASS** |
| No horizontal overflow | **PASS** |
| Images bounded to viewport | **PASS** |
| No list bullets | **PASS** |
| No default link underline | **PASS** |
| Skip link off-screen when unfocused | **PASS** |
| Semantically readable content | **PASS** |

---

## Build / Package

| Step | Result |
|---|---|
| `npm ci` | **PASS** |
| `npm run icons` | **PASS** |
| `npm run build` | **PASS** |
| `npm run qa` | **107/107 PASS** |
| `npm run qa:webkit` | **10/10 PASS** |
| `npm run package` | **PASS** |

### Dist contract (E1 candidate)

| Item | Value |
|---|---|
| Fingerprinted CSS | `styles.88323d36c46c.css` |
| Fingerprinted JS | `script.6e17f1c027e9.js` |
| Stable CSS alias | `styles.css` (byte-identical) |
| Stable JS alias | `script.js` (byte-identical) |
| Public files | **31** |

### Release package (NOT DEPLOYED)

**SUPERSEDED by E1.2** — prior non-deterministic legacy `tar -czf` identities must not be used for deploy:

| Field | Value | Status |
|---|---|---|
| Size | **1,033,438 bytes** | **SUPERSEDED** |
| SHA-256 | `8092d9c326110f3d1ed0ca32e5f360fd38bf2f4f5a5d9f4affe1156504160c23` | **SUPERSEDED** |
| PR-body interim SHA (legacy tar) | `a9f8b2771b2a84e4a941baa8af55276dbffca069ddcb66a6419422066122faa3` / 1,033,433 bytes | **SUPERSEDED** |

**Current E2 artefact identity:** see **E1.2 Deterministic Release Packaging** below.

---

## Files Changed

| Path | Change |
|---|---|
| `tools/fingerprint-assets.mjs` | **NEW** — content hash helpers |
| `tools/verify-fingerprinted-assets.mjs` | **NEW** — build contract verification |
| `tools/build-site.mjs` | Fingerprinted assets, aliases, inline fallback |
| `src/styles.css` | `--synqdrive-release-css: 1` sentinel |
| `package.json` | Build invokes fingerprint verifier |
| `tools/build-icons.mjs` | Intrinsic 24×24 SVG root dimensions |
| `src/icons.generated.mjs` | Regenerated icons |
| `e2e/stylesheet-delivery-helpers.ts` | Incident-state helpers, light canvas guards |
| `e2e/stylesheet-delivery.spec.ts` | Chromium recovery/resilience tests |
| `e2e/stylesheet-delivery-webkit.spec.ts` | WebKit failure/dark-mode/incident-signature tests |
| `e2e/playwright.landing-qa.config.ts` | Include delivery spec |
| `e2e/playwright.landing-qa-webkit.config.ts` | Include WebKit delivery spec |

**Not changed:** `content/site.mjs`, product images, section copy, section markup (except build-time head injection).

---

## QA Results

| Suite | Result |
|---|---|
| Chromium | **107/107 PASS** |
| WebKit | **10/10 PASS** |
| Asset fingerprint contract | **PASS** |
| Alias byte-equivalence | **PASS** |
| Package verification | **PASS** |

---

## Known Limitations

- Historical failing Safari session cannot be replayed exactly.
- Current Production serial 200 responses do not disprove transient past failure.
- Hostinger cache headers not repository-controlled; alias files remain mutable-cache compatible by design.
- Inline fallback provides **safe degradation**, not full visual parity without CSS.
- E1 CSS content differs from live Production by the sentinel line only — new fingerprint required on deploy.

---

## Production Deployment Plan (E2 — out of scope for E1)

1. External review of Draft PR.
2. Controlled deploy of E1 package to Hostinger static vhost.
3. Optional Hostinger/LiteSpeed cache purge after deploy.
4. Serial Production smoke (HTTP + WebKit mobile CSS sentinel).
5. Monitor real-device Safari.

**E1 explicitly did NOT deploy.**

---

## Rollback Requirement

Pre-E1 Production rollback archive remains valid:

`rollback/synqdrive.eu-pre-p2.8-20260813_095611.tar.gz`

No rollback executed during E1.

---

## E1.1 Post-Review Hardening (2026-08-13)

External review of Draft PR #9 identified four release blockers. E1.1 addresses all without redesign:

1. WebKit forced CSS failure coverage — **ADDED**
2. Intrinsic SVG icon safety + strengthened fallback bounds — **ADDED**
3. WebKit dark-mode light-canvas guards — **ADDED**
4. One-time alias stylesheet recovery on primary failure — **ADDED**

**E1.1 result:** **PASS** (local; **NOT DEPLOYED**)

---

## E1.2 Deterministic Release Packaging (2026-08-13)

### Prior package SHA contradiction

E1.1 QA recorded legacy-package SHA `8092d9c326110f3d1ed0ca32e5f360fd38bf2f4f5a5d9f4affe1156504160c23` (1,033,438 bytes). Draft PR #9 body later recorded a different legacy-package SHA `a9f8b2771b2a84e4a941baa8af55276dbffca069ddcb66a6419422066122faa3` (1,033,433 bytes). Both were produced from equivalent runtime fingerprints but **different non-deterministic archive bytes** — unacceptable for an exact-artifact E2 deploy gate.

### Root cause (proved)

`package.json` previously used:

```bash
cd dist && tar -czf ../synqdrive-landing-page.tar.gz .
```

GNU `tar -czf` embeds per-file metadata from `dist/` (mtime, uid, gid). Each `npm run build` refreshes filesystem mtimes even when file **content** bytes are unchanged. The gzip stream also carries a modification timestamp unless suppressed. Re-packaging the same dist after `touch index.html` changed legacy archive SHA (`4bdc7e4f…` → `4e7e23cc…`) and size (1,033,433 → 1,033,434 bytes) without changing runtime HTML/CSS/JS content.

### Deterministic packaging implementation

- **NEW:** `tools/package-site.mjs`
- **`npm run package`** now invokes the wrapper
- Archive creation uses sorted paths, fixed mtime (`@0`), root owner/group (`0:0`), numeric owners, and `gzip -n`
- Package contract verification remains: site files at archive root, required runtime assets present, forbidden repo paths absent, HTML references resolve

Runtime landing assets unchanged: `styles.88323d36c46c.css`, `script.6e17f1c027e9.js`.

### Reproducibility proof (unchanged dist/)

| Run | Size (bytes) | SHA-256 |
|---|---|---|
| Package run #1 | **1,027,239** | `75cdd62cf817adc1027d23265044cbeab21a805f1b1c2afe2324b712fcdae55d` |
| Package run #2 (no dist change) | **1,027,239** | `75cdd62cf817adc1027d23265044cbeab21a805f1b1c2afe2324b712fcdae55d` |

**run1 == run2:** **YES**

### Clean rebuild proof

After `npm run build` from the same source HEAD (no source edits), deterministic packaging reproduced the same archive identity:

| Field | Value |
|---|---|
| Size | **1,027,239 bytes** |
| SHA-256 | `75cdd62cf817adc1027d23265044cbeab21a805f1b1c2afe2324b712fcdae55d` |
| Matches reproducibility SHA | **YES** |

### Final E2 artefact identity (NOT DEPLOYED)

| Field | Value |
|---|---|
| Path | `synqdrive-landing-page.tar.gz` |
| Size | **1,027,239 bytes** |
| SHA-256 | `75cdd62cf817adc1027d23265044cbeab21a805f1b1c2afe2324b712fcdae55d` |
| Extract verification | HTML → fingerprinted asset references resolve **PASS** |
| Production touched | **NO** |

**E1.2 result:** **PASS** (local; **NOT DEPLOYED**)

---

## E2 Deployment Readiness

| Gate | Status |
|---|---|
| E1 implementation complete | **YES** |
| E1.1 review blockers resolved | **YES** |
| E1.2 deterministic package identity frozen | **YES** |
| Local QA green (107 Chromium / 10 WebKit) | **YES** |
| Release package verified | **YES** |
| Production touched | **NO** |
| **E2 READY (pending PR #9 review)** | **YES** |

---

## Baseline / Branch

| Item | Value |
|---|---|
| Starting `main` SHA | `e1bbdab2f1a561a2197e97bf8bf11706984f6adf` |
| Production runtime SHA (unchanged) | `92392d23ca9f12c4d18befdcd06c611a593dd3a9` |
| Branch | `cursor/mobile-safari-css-delivery-incident` |

---

## Commit SHAs

| Phase | Commits |
|---|---|
| **E1** | `d9b0bbc` (build fingerprinting), `4abcc20` (QA guards), `941c8b2` (incident documentation) |
| **E1.1** | `0fa29eb` (delivery recovery), `9bfdc12` (WebKit failure tests), `7bb2131` (E1.1 documentation) |
| **E1.2** | *(packaging + artefact freeze — see git/PR history)* |
