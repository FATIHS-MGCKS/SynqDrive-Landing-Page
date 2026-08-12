# Changelog — SynqDrive Landing Page

**Non-normative.** This changelog is historical and informational. It records decisions and implementations but does **not** establish Product Decisions. Binding decisions live exclusively in `docs/DECISIONS.md`.

Meaningful website and product-marketing changes only. Not a Git commit mirror.

Format: newest first. Each entry may link to decisions or audit records for context.

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
