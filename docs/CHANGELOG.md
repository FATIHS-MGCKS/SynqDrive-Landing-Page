# Changelog — SynqDrive Landing Page

**Non-normative.** This changelog is historical and informational. It records decisions and implementations but does **not** establish Product Decisions. Binding decisions live exclusively in `docs/DECISIONS.md`.

Meaningful website and product-marketing changes only. Not a Git commit mirror.

Format: newest first. Each entry may link to decisions or audit records for context.

---

---

---

## Production artefact hygiene (P1.6.1) — 2026-08-12

**Phase:** P1.6.1 — Production hygiene & rollback hardening  
**Audit:** [`docs/audits/landing-page-phase-1.6.1-production-hygiene-2026-08.md`](audits/landing-page-phase-1.6.1-production-hygiene-2026-08.md)

### Fixed

- Build no longer copies repository Markdown (`assets/product/README.md`) into public `dist/`
- Filtered asset copy + post-build `verify-dist-artefact` guard
- Rollback governance documented (`rollback/README.md` + pre-P1.6.1 archive)

### Deployed

- Sanitized static package redeployed to `https://synqdrive.eu` (build commit **`feacb47`**)
- No intended visual, navigation, or runtime behaviour change

### Verified

- `https://synqdrive.eu/assets/product/README.md` → **404**
- Production QA: 33 Chromium + 2 WebKit smoke — pass (rate-limit retry as in P1.6)
- `app.synqdrive.eu` health unaffected

---

## Phase 1 production deployment (P1.6) — 2026-08-12

**Phase:** P1.6 — Production deployment & live acceptance  
**Audit:** [`docs/audits/landing-page-phase-1.6-production-deployment-2026-08.md`](audits/landing-page-phase-1.6-production-deployment-2026-08.md)

### Deployed

- Phase-1 desktop Platform disclosure navigation (P1.3 / P1.3.1)
- Phase-1 mobile modal navigation (P1.4 / P1.4.1)
- Runtime release candidate **`c77dc76`** to `https://synqdrive.eu` (build from repository HEAD **`ff235ea`**)

### Production acceptance

- Local QA: 33 Chromium + 2 WebKit — pass
- Production QA: 33 Chromium + 2 WebKit smoke — pass (6 Chromium tests retried after Hostinger rate-limit cooldown)
- Product application isolation verified — no VPS/product impact

### Not changed (explicit)

- Product application / `app.synqdrive.eu`
- DNS (except incidental `www` redirect behaviour noted in audit)
- Landing-page sections, product images, deferred IA categories

---

## Release documentation consistency (P1.5.1) — 2026-08-12

**Phase:** P1.5.1 — Post-review documentation alignment  
**Scope:** Documentation only — no runtime, CSS, JS, test, or deployment changes.

### Corrected

- README script size (~11 kB), JavaScript/no-JS wording, QA command descriptions (removed hardcoded "11 checks")
- README phase status (P1.3/P1.4 implemented; Platform only active category)
- `docs/IMPLEMENTATION.md` current-state marker (`c77dc76`, P1.5 ready, P1.6 not deployed)
- Historical pre-Phase-1 production baseline clearly labelled (commit `1415ea74`, original 11-test QA)
- Known remaining points updated (P1.4 complete; P1.6 and Phase 2 pending)

### Unchanged

- Technical P1.5 PASS result
- Shipped behaviour and release candidate `c77dc76`
- No Production deployment

---

## Production readiness gate (P1.5) — 2026-08-12

**Phase:** P1.5 — Integration audit & production readiness  
**Audit:** [`docs/audits/landing-page-phase-1.5-production-readiness-2026-08.md`](audits/landing-page-phase-1.5-production-readiness-2026-08.md)

### Result

**PASS** — Ready for P1.6 production deployment (deployment not performed in P1.5).

### Minor corrections during gate

- Scroll-lock drift safeguard when `pendingScrollY` stale after pointer interaction
- Documentation accuracy (AGENTS.md QA commands, IMPLEMENTATION.md script size)
- P1.5 release-candidate screenshot test (33 Chromium tests total)

---

## Mobile modal semantics fix (P1.4.1) — 2026-08-12

**Phase:** P1.4.1 — Mobile modal focus boundary & Safari hardening  
**Audit addendum:** [`docs/audits/landing-page-phase-1.4-mobile-navigation-2026-08.md`](audits/landing-page-phase-1.4-mobile-navigation-2026-08.md) (Post-review section)

### Fixed

- Modal top bar (brand + Close) moved inside `#mobile-nav` dialog boundary
- Close control included in focus trap; Shift+Tab from first link reaches Close
- `.masthead__inner` inert while modal open (header controls blocked)
- Idempotent scroll-lock lifecycle (`scrollLockActive`; no spurious init scroll restore)

### Added

- Deep-link, landscape reachability, breakpoint-edge, resize, touch-target, WebKit smoke tests

### Not changed (explicit)

- P1.4 IA, visual design, 1024px breakpoint
- Desktop P1.3 navigation
- Production deployment

---

## Mobile navigation rebuild (P1.4) — 2026-08-12

**Phase:** P1.4 — Mobile navigation  
**Audit:** [`docs/audits/landing-page-phase-1.4-mobile-navigation-2026-08.md`](audits/landing-page-phase-1.4-mobile-navigation-2026-08.md)

### Implemented

- Deliberate mobile navigation layer replacing the pre-P1.4 flat drawer
- Modal dialog semantics (`role="dialog"`, `aria-modal="true"`) with background `inert`, scroll lock, focus trap, Escape close
- Platform category expanded inline (Option B — single active category, no unnecessary accordion)
- Shared data: `nav.platformMenu` + `flattenPlatformMenu()`; `nav.mobileNav` labels only
- Account actions and locale switch inside navigation; Demo CTA in header hidden ≤480px
- P1.4 mobile QA tests and screenshot matrix (portrait + landscape)

### Not changed (explicit)

- Desktop P1.3 navigation (regression tested)
- Landing-page sections, product images
- Solutions, Resources, Pricing (deferred)
- Production deployment

---

## Post-review accessibility correction (P1.3.1) — 2026-08-12

**Phase:** P1.3.1 — Desktop navigation keyboard accessibility  
**Audit addendum:** [`docs/audits/landing-page-phase-1.3-desktop-navigation-2026-08.md`](audits/landing-page-phase-1.3-desktop-navigation-2026-08.md) (Post-review section)

### Fixed

- Closed Platform dropdown panel no longer exposes links to keyboard focus or assistive technology (`inert` while closed)
- Escape-to-trigger focus behaviour retained; open Tab order unchanged
- Progressive-enhancement documentation corrected: page content readable without JS; Platform disclosure and mobile drawer require JS

### Added

- E2E keyboard tab-order tests (DE and EN)

### Not changed (explicit)

- P1.3 IA, labels, panel layout, header spacing, hover timings (except accessibility fix)
- Mobile navigation (P1.4)
- Landing sections, product images
- Production deployment

---

## Desktop Platform navigation (P1.3) — 2026-08-12

**Phase:** P1.3 — Desktop navigation  
**Audit:** [`docs/audits/landing-page-phase-1.3-desktop-navigation-2026-08.md`](audits/landing-page-phase-1.3-desktop-navigation-2026-08.md)

### Implemented

- Desktop header exposes **Plattform / Platform** as the sole active product top-level category
- Platform dropdown with six grouped homepage anchors, descriptions, and overview row (DEC-004)
- **Contact removed** from primary desktop navigation (remains in CTA and footer)
- Solutions, Resources, and Pricing **not exposed** (deferred)
- Central navigation data model in `content/site.mjs` (`nav.platformMenu`, `flattenPlatformMenu()`)
- Disclosure navigation semantics (DEC-010): locale-correct `aria-label`, `aria-expanded`, `aria-controls`
- Header login/demo URLs from `SITE.links`
- Desktop pointer interaction: delayed hover open, click toggle, bridge gap, outside click and Escape close

### Not changed (explicit)

- Mobile drawer layout (P1.4)
- Landing-page sections, footer structure, product images
- Production deployment

---

## Navigation & Website Governance v2 — 2026-08-12

**Phase:** P1.2 — Governance, IA decisions, and product image policy  
**Audit:** [`docs/audits/landing-page-phase-1.2-governance-and-asset-policy-2026-08.md`](audits/landing-page-phase-1.2-governance-and-asset-policy-2026-08.md)

### Added

- `AGENTS.md` — central agent operating instructions
- `.cursor/rules/landing-page.mdc` — compact Cursor execution constraints
- `docs/DECISIONS.md` — binding decisions DEC-001 through DEC-010
- `assets/product/README.md` — manually curated product image policy
- Phase 1.2 governance audit report

### Ratified

- Long-term target IA: Platform, Solutions, Resources, Pricing (`DEC-003`)
- **Staged navigation:** Platform homepage anchors active now; Solutions, Resources, and Pricing deferred until real destinations exist (`DEC-004`, `DEC-008`)
- Contact is not a permanent primary top-level category; removal from primary desktop nav planned in P1.3
- Manually curated product images; no automatic Product Repository synchronization (`DEC-006`)
- Taxi & Mobility as future Solutions content guardrail, not equivalent to generally available Taxi Dispatch (`DEC-009`)
- Desktop disclosure-navigation accessibility pattern (`DEC-010`)

### Changed

- README and `docs/IMPLEMENTATION.md` updated for governance, staged IA, and manual image policy
- Deprecated product-repository screenshot capture as the current source-of-truth workflow (retained only as historical context where noted)
- Phase 1.1 audit annotated with post-review clarifications (phase numbering, Taxi & Mobility, ARIA pattern)

### Not changed (explicit)

- Desktop navigation markup and behaviour (P1.3)
- Mobile navigation / drawer (P1.4)
- Landing-page section design or content
- Production deployment

---

## Initial standalone import — 2026-08-12

**Phase:** Repository import (pre–P1.1)

- Standalone landing page imported from `SYNQDRIVE-alpha` with full history
- Live site at `https://synqdrive.eu` and `https://synqdrive.eu/en/`
- Baseline audit: [`docs/audits/landing-page-phase-1.1-baseline-audit-2026-08.md`](audits/landing-page-phase-1.1-baseline-audit-2026-08.md)
