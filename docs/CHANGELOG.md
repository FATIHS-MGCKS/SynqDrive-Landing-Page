# Changelog — SynqDrive Landing Page

**Non-normative.** This changelog is historical and informational. It records decisions and implementations but does **not** establish Product Decisions. Binding decisions live exclusively in `docs/DECISIONS.md`.

Meaningful website and product-marketing changes only. Not a Git commit mirror.

Format: newest first. Each entry may link to decisions or audit records for context.

---

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
