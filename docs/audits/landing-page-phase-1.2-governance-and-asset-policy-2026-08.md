# SynqDrive Landing Page — Phase 1.2 Report

**Phase:** P1.2 — Agent Governance, IA Decisions & Product Image Policy  
**Repository:** https://github.com/FATIHS-MGCKS/SynqDrive-Landing-Page  
**Baseline:** `docs/audits/landing-page-phase-1.1-baseline-audit-2026-08.md` @ `9b1bf37`  
**Date:** 2026-08-12

---

## 1. Files changed

| File | Action |
|---|---|
| `AGENTS.md` | Created |
| `.cursor/rules/landing-page.mdc` | Created |
| `docs/DECISIONS.md` | Created |
| `docs/CHANGELOG.md` | Created |
| `assets/product/README.md` | Created |
| `docs/audits/landing-page-phase-1.2-governance-and-asset-policy-2026-08.md` | Created (this report) |
| `README.md` | Updated — governance, staged IA, manual image policy |
| `docs/IMPLEMENTATION.md` | Updated — governance, navigation, images, known points |
| `docs/audits/landing-page-phase-1.1-baseline-audit-2026-08.md` | Updated — post-review clarification only |
| `content/site.mjs` | Updated — `MEDIA` comment block (policy reference) |
| `tools/build-assets.mjs` | Updated — header comment (deprecated auto-sync framing) |
| `.gitignore` | Updated — `assets-raw/` comment |

**Not changed (explicit):** `src/sections.mjs`, `src/script.js`, `src/styles.css`, navigation markup, landing sections, `assets/*.webp`, deploy configuration.

---

## 2. Governance created

| Artefact | Purpose |
|---|---|
| `AGENTS.md` | Central agent operating instructions — source-of-truth priority, content rules, navigation policy, accessibility pattern, testing/deploy rules |
| `.cursor/rules/landing-page.mdc` | Compact Cursor rule referencing `AGENTS.md` and `docs/DECISIONS.md` without duplication |
| `docs/DECISIONS.md` | Binding decisions DEC-001 through DEC-010 with full decision record format |
| `docs/CHANGELOG.md` | Meaningful website change log; first entry „Navigation & Website Governance v2" |

---

## 3. Decisions ratified

All recorded in `docs/DECISIONS.md` (Owner: Product / Fatih):

| ID | Title |
|---|---|
| DEC-001 | Standalone website repository |
| DEC-002 | Stripe as quality reference (not template) |
| DEC-003 | Target top-level navigation |
| DEC-004 | Staged navigation activation |
| DEC-005 | No Modules top-level item |
| DEC-006 | Manually curated product images |
| DEC-007 | Mobile as independent UX |
| DEC-008 | No dead links |
| DEC-009 | Taxi & Mobility positioning |
| DEC-010 | Navigation accessibility pattern (disclosure + links) |

---

## 4. Route policy

**Binding staged-navigation policy (DEC-004, DEC-008):**

### Active now (P1.3 will implement in desktop nav)

Platform dropdown — six homepage anchors, locale-correct:

| EN | DE | Anchor |
|---|---|---|
| Platform Overview | Plattform-Überblick | `#platform` |
| Connected Vehicle Intelligence | Vernetzte Fahrzeugintelligenz | `#vehicle-intelligence` |
| AI Orchestration | KI-Orchestrierung | `#ai-orchestration` |
| Workflow Automation | Workflow-Automatisierung | `#workflow-automation` |
| Customer Communication | Kundenkommunikation | `#communication` |
| Integrations & Extension | Integrationen & Erweiterung | `#integrations` |

### Deferred until real destinations exist

Do **not** expose as top-level navigation yet:

- Solutions (incl. Autovermietungen, Flottenbetreiber, Taxi & Mobilität)
- Resources (incl. Dokumentation, Help Center, Trust & Security)
- Pricing

No placeholder pages, fake routes, or empty dropdowns.

### Contact

Not a permanent primary top-level category. Remains via closing CTA (`#contact`), footer (`mailto:info@synqdrive.eu`), and future Resources navigation. P1.3 removes Contact from primary desktop top-level nav.

---

## 5. Old screenshot rules removed / deprecated

Repository-wide updates replaced active product-repository capture workflow with manual curation policy.

| Location | Change |
|---|---|
| `README.md` | Removed § „Product screenshots come from the product repository"; replaced with manual policy |
| `docs/IMPLEMENTATION.md` | Replaced „Screenshot sources and privacy" with „Product images and privacy"; added historical deprecation note |
| `content/site.mjs` | Removed synthetic demo tenant / product-repo references from `MEDIA` comments |
| `tools/build-assets.mjs` | Header reframed as optional maintenance tool, not auto-sync pipeline |
| `.gitignore` | `assets-raw/` comment no longer references Product Repository |

**Retained as historical context only:**

- Phase 1.1 audit findings (unchanged historical record + post-review clarification)
- `docs/IMPLEMENTATION.md` § Historical note under product images
- `assets/product/README.md` § Historical note (deprecated workflow)

**Verification search terms checked post-edit:** `landing:capture`, `Product Repository capture`, `synthetic demo tenant`, `screenshot sync`, `automatic screenshot` — no remaining active source-of-truth claims outside historical/clarification sections.

---

## 6. New product image policy

**Authoritative document:** `assets/product/README.md` (DEC-006)

Key rules:

- Manually selected, prepared, maintained in this repository
- Committed `assets/` files are production source of truth
- Agents must not capture, sync, replace, or regenerate from Product Repository without explicit user instruction
- No personal/customer data, secrets, or fabricated UI
- Formats, naming (`landing-*-sm.webp`, `landing-*-mobile.webp`), dimensions tied to `content/site.mjs` → `MEDIA`
- `npm run assets` = optional local re-encode from hand-prepared `assets-raw/` only
- Existing product visuals remain at `assets/` root — URLs unchanged

---

## 7. P1.1 clarifications

Added **Post-review clarification** section to `docs/audits/landing-page-phase-1.1-baseline-audit-2026-08.md`:

1. Approved phase numbering (P1.1–P1.6) supersedes audit §15 implementation map
2. Taxi & Mobility ≠ generally available Taxi Dispatch; not a blocker (DEC-009)
3. Disclosure navigation — ARIA menu / arrow keys not required (DEC-010)
4. Route policy resolved via staged navigation (DEC-004)

Historical P1.1 findings were **not rewritten**.

---

## 8. Taste / UI guidance status

**Fact:** Taste/UI skill files (e.g. `make-interfaces-feel-better`, `design-taste-frontend`, `minimalist-ui`) are **not present** in this standalone repository.

**Established in P1.2:**

- Canonical design direction in `AGENTS.md` (premium B2B SaaS, Stripe IA reference not visual copy, minimalist, real product focal point)
- Historical skill names and dials documented for P1.3/P1.4 reference
- `.cursor/rules/landing-page.mdc` points agents to `AGENTS.md` — no redundant design-system rules
- `docs/IMPLEMENTATION.md` skills section updated to reference product workspace paths as supplementary

**Recommendation for P1.3/P1.4:** User may supply skill files from the SynqDrive product workspace; they must not override `docs/DECISIONS.md`.

**P1.2 action:** No visual implementation. No skill files copied (avoid conflicting duplicates without user instruction).

---

## 9. Validation performed

| Check | Result |
|---|---|
| `git diff` | Documentation and comment-only changes; no nav/section implementation |
| Stale screenshot workflow search | No active source-of-truth references outside historical/clarification sections |
| Contradictory navigation policy search | README, DECISIONS, IMPLEMENTATION, AGENTS aligned on staged IA |
| `npm run build` | **Pass** — after `content/site.mjs` comment change (comments do not affect output; build confirms no breakage) |
| Navigation implementation | **None** (correct) |
| Deployment | **None** (correct) |

Markdown links verified within created docs (`docs/DECISIONS.md`, `docs/CHANGELOG.md`, `assets/product/README.md`, audit cross-references).

---

## 10. Remaining blockers for P1.3

| ID | Blocker | Notes |
|---|---|---|
| — | Route policy for deferred categories | **Resolved** — defer Solutions, Resources, Pricing |
| — | Taxi & Mobility blocker | **Resolved** — content guardrail only (DEC-009) |
| P1.3-1 | **Implement desktop Platform dropdown** with six anchors in `content/site.mjs` + `src/sections.mjs` | Scope of P1.3 |
| P1.3-2 | **Remove Contact** from primary desktop top-level nav | Scope of P1.3 |
| P1.3-3 | Fix `<nav aria-label>` to locale-appropriate main navigation label | Scope of P1.3 |
| P1.3-4 | Replace hardcoded login/mailto URLs with `SITE.links` in header template | Scope of P1.3 |
| P1.3-5 | Update Playwright tests for six-item Platform dropdown (DE + EN) | Likely P1.5; may start in P1.3 |
| P1.3-6 | Stripe-quality dropdown visual hierarchy (descriptions, spacing) | P1.3 design scope |

**Not blockers:** Solutions/Resources/Pricing pages, Taxi Dispatch product availability, Taste skill file presence.

---

## 11. Branch

`main`

---

## 12. Commit SHA

`f1f71fe2e5abb2f832cea1dc8603cd47772f3ea7` — `docs(governance): establish website IA and asset policy`

---

## Explicit non-actions (confirmed)

- Desktop navigation **not** implemented
- Mobile navigation **not** rebuilt
- Landing-page sections **not** redesigned
- Production **not** deployed

---

## Post-review governance authority clarification (P1.2.1)

**Date:** 2026-08-12  
**Trigger:** External review of accepted P1.2 commit `f1f71fe2e5abb2f832cea1dc8603cd47772f3ea7`

### Ambiguity found

`AGENTS.md` grouped `docs/DECISIONS.md`, `docs/CHANGELOG.md`, and `docs/audits/*` together under the highest-priority „Website product decisions" authority. That implied changelog and audit reports could independently establish or override Product Decisions.

### Correction

Authority hierarchy updated:

1. Website Product Decisions — `docs/DECISIONS.md` (normative)
2. SynqDrive Documentation Suite
3. Current repository implementation
4. Production configuration

Changelog and audit reports are explicitly **non-normative supporting records**.

`docs/DECISIONS.md` now states that only Accepted DEC entries are normative; supersession requires a new DEC-ID; changelog and audits cannot supersede decisions.

### Scope

Documentation and governance text only. **No** product/runtime/navigation behaviour changed. **No** rendered website code changed.

---

*End of Phase 1.2 report.*
