# Phase 2.6 — Communication + Integrations + Closing CTA/Footer Mobile Composition

**Date:** 2026-08-13  
**Scope:** Communication (#communication), Integrations (#integrations), closing CTA (#contact), and footer — implemented in Draft PR; **not deployed**

---

## Executive Summary

P2.6 completes the lower-page mobile composition pass using established P2.2 surface and layout primitives. Communication becomes product-led with the conversation visual immediately after the section intro and three compact operational-context notes below. Integrations restores a visible SynqDrive hub core on phone/tablet with six compact integration rows instead of six full-card tiles. Closing CTA and footer receive spacing and touch-target polish only.

**Key outcome (390×844 DE, post-settle QA probe):**

| Area | Before → after (390 DE) |
|---|---|
| Communication frame top | **681.9px → 233.7px** |
| Communication section height | **1148px → 1042px** |
| Integrations full-card surfaces (mobile) | **6 → 0** |
| Integrations hub core visible (mobile) | **NO → YES** |
| Integrations section height | **1007px → 983px** |
| Closing CTA height | **433px → 405px** |
| Footer height | **550px → 547px** |
| Page height | **8804px → 8643px** |

**H-05:** **PARTIAL** (conversation earlier; compact context notes; asset still class C)  
**M-02:** **RESOLVED** (hub core visible; six-card mobile feeling removed; desktop hub preserved)  
**L-01:** **RESOLVED** (spacing polish; primary CTA ≥44px)  
**L-02:** **RESOLVED** (grouping/spacing polish; touch targets retained)

---

## Starting Baseline

| Field | Value |
|---|---|
| Branch | `main` @ `fe96a49` |
| P2.6 branch | `cursor/communication-integrations-mobile-composition` |
| Pre-P2.6 QA | Chromium **78/78**; WebKit **2/2** |
| Pre-P2.6 page height (390 DE) | **8804px** |

---

## Findings Owned

| ID | Section | P2.6 scope |
|---|---|---|
| **H-05** | Customer Communication mobile composition | Primary |
| **M-02** | Integrations hub mobile narrative | Primary |
| **L-01** | Final CTA spacing polish | Secondary |
| **L-02** | Footer grouping/spacing polish | Secondary |
| **G-02** | Excessive mobile vertical length | Improved via Communication/Integrations compaction |
| **G-03** | Product visual priority | Improved in Communication |
| **G-04** | Excessive card chrome | Reduced via compact surfaces and hub rows |
| **M-03** | Product frame readability | Communication layout improved; asset still class C |

---

# Customer Communication

## Before

Mobile order: heading + body → three divided note blocks → conversation screenshot.

| Metric (390×844 DE) | Value |
|---|---|
| Section height | **1148px** |
| Section top → Product Frame top | **681.9px** |
| Product Frame size | **390×410px** |
| Context notes | **3** (divided blocks above product) |

## Composition Decision

**Chosen:** Option A — Intro → Product Visual → compact context notes.

Moving the conversation product before the three operational-context notes delivers the largest comprehension gain (−448.2px frame distance at 390 DE) without removing meaning. Options B/C rejected: a single context statement would drop explanatory content; notes-before-product preserves the old late-product problem.

## DOM / Reading Order

Semantic DOM (mobile): `.split__intro` → `.split__media` → `.split__support` (compact notes).

Desktop CSS grid restores mirrored split: product left; intro + divided notes right column.

**Tradeoff:** Desktop visual grouping (intro above notes on the right) differs from mobile source sequence — same deliberate pattern as P2.5 AI.

## Notes Treatment

- Markup: `notes__item notes__item--compact surface surface--compact`
- ≤1024px: canonical `.surface--compact` owns row chrome; Communication CSS owns typography/spacing only
- ≥1025px: `.communication--product-led` restores divided note blocks with sufficient specificity

## Product Visual

- P2.2 `.frame--product` full-bleed retained at ≤760px
- No asset or lazy/eager changes
- Frame width: **390px**; frame height: **410px** (unchanged)

## Mobile

- Single spacing owner: `.communication--product-led { gap: var(--stack-copy-visual) }` for intro→media; grid gap for media→support block

## Tablet

600–1024: compact notes retained; product before context notes

## Desktop Regression

1100–1920: mirrored split restored — product left of copy column; divided notes below intro; geometry verified by QA

## Metrics (390×844 DE, post-settle)

| Metric | Before | After | Δ |
|---|---|---|---|
| Section height | 1148px | **1042px** | **−106px** |
| Section top → frame top | 681.9px | **233.7px** | **−448.2px** |
| Product Frame | 390×410 | 390×410 | — |

## Product Asset Classification

**C — manual tighter crop recommended**

The conversation thread remains marginally readable at 320–430px widths after layout improvement. Layout is no longer the primary blocker.

**MANUAL PRODUCT ASSET RECOMMENDED** — target crop should show:

- Conversation thread as primary focus
- One representative exchange
- Minimal useful operational context
- Wide context sidebar removed or heavily reduced
- Enough context to prove SynqDrive linkage
- No personal/customer data

---

# Integrations

## Before

Mobile/tablet ≤1024: centre SynqDrive node hidden; six integration tiles in a two-column full-card grid (single column ≤359px).

| Metric (390×844 DE) | Value |
|---|---|
| Section height | **1007px** |
| Hub core visible | **NO** |
| Full-card tile surfaces | **6** |

## Mobile Hub Decision

**Chosen:** Section intro → compact SynqDrive hub core (logo + hub label) → six compact integration rows in source order (left column, then right column).

Preserves “systems connect through SynqDrive” without fake connectors, JS, or decorative network graphics.

## Core

- `.hub__core` remains in markup with SynqDrive logo and factual `hubLabel` text
- ≤1024px: compact centred core panel visible above integration rows
- ≥1025px: centre node restored in three-column hub diagram with dashed connectors

## Integration Item Treatment

- Markup: `hub__tile hub__tile--compact surface surface--compact`
- ≤1024px: canonical `.surface--compact` owns row chrome; icon + title/body grid layout only in section CSS
- ≥1025px: single owner `.hub--compact .hub__tile` restores full card chrome
- Base `.hub__tile` owns positioning/transition only (no card chrome at all widths)

## Mobile

- Single-column diagram; core first; zero full-card surfaces at ≤1024px
- 320×700: all six items readable; no horizontal overflow

## Tablet

600–1024: same compact hub narrative; avoids floating two-column card grid in excessive whitespace

## Desktop Regression

1100–1920: three-column hub with visible core and six full-card tiles; connectors restored from base hub CSS

## Metrics (390×844 DE, post-settle)

| Metric | Before | After | Δ |
|---|---|---|---|
| Section height | 1007px | **983px** | **−24px** |
| Hub core visible | NO | **YES** | — |
| Full-card surfaces | 6 | **0** | **−6** |

---

# Closing CTA

Spacing polish only — no redesign, no new claims or actions.

| Metric (390×844 DE) | Before | After | Δ |
|---|---|---|---|
| Section height | 433px | **405px** | **−28px** |

Primary action min-height ≥44px retained; secondary action subordinate; full-width grid at ≤420px unchanged.

---

# Footer

Grouping and spacing rhythm polish — no new categories; DEC-004 staged IA unchanged.

| Metric (390×844 DE) | Before | After | Δ |
|---|---|---|---|
| Footer height | 550px | **547px** | **−3px** |

Nav link min-height 44px retained.

---

# Section Distinctness

| Section | Mobile identity |
|---|---|
| **AI** | Product-first split; four-step reasoning + governance control |
| **Workflow** | Tiered stack; three-stage chain then automation product |
| **Communication** | Product-first split; conversation then operational context notes |
| **Integrations** | Visible SynqDrive hub core then compact integration rows |

None of the four collapse into an identical heading → screenshot → three-rows template.

---

# Accessibility

- Section headings remain H2 via `sectionHead()`
- Communication notes and integration tiles retain H3 titles
- DOM reading order matches mobile visual narrative
- No duplicate responsive content blocks
- Product alt text unchanged
- CTA focus order logical; footer nav labelled; touch targets ≥44px

---

# DE / EN

Communication and Integrations structural coverage at **390 / 768 / 1440** for both locales.

German stress cases: Vernetzte Kundenkommunikation, Identitätsprüfung, Fahrzeugtelemetrie, Nachrichten und Sprache, API und Webhooks.

---

# Performance

- Communication image remains lazy below fold
- Integrations uses existing logo only — no new heavy assets
- No new JavaScript

---

# Page Height Impact

| Metric (390×844 DE) | Before (post-P2.5 main) | After P2.6 | Δ |
|---|---|---|---|
| Total page height | **8804px** | **8643px** | **−161px** |

---

# QA

| Gate | Result |
|---|---|
| `npm run build` | **PASS** |
| Chromium | **92/92** |
| WebKit smoke | **2/2** |
| P2.2–P2.5 regression | **PASS** |

P2.6 screenshots: `qa/p26-*` (gitignored)

---

# Visual QA

Section screenshots captured DE/EN at 320, 375, 390, 430, 768, 1440 for Communication, Integrations, closing CTA, and footer.

Workflow → Communication → Integrations → CTA → Footer sequence reviewed: Communication conversation arrives substantially earlier; Integrations reads as hub + rows rather than six floating cards.

---

# Finding Resolution Matrix

| ID | Status | Evidence |
|---|---|---|
| **H-05** | **PARTIAL** | Product 448px earlier at 390; compact context notes; desktop preserved; asset still class C |
| **M-02** | **RESOLVED** | Hub core visible on phone; 0 full-card surfaces ≤1024; desktop hub restored |
| **L-01** | **RESOLVED** | CTA spacing reduced; primary ≥44px; no redesign |
| **L-02** | **RESOLVED** | Footer grouping/spacing polish; touch targets retained |
| **G-02** | **PARTIAL** | Page −161px at 390; global length still open |
| **G-03** | **PARTIAL** | Communication product materially earlier |
| **G-04** | **PARTIAL** | Compact surfaces replace mobile card stacks in Communication/Integrations |
| **M-03** | **PARTIAL** | Communication framing improved; manual crop still recommended |

---

# Manual Asset Recommendation

| Section | Manual asset needed | Classification |
|---|---|---|
| Communication | **YES** | C |
| Integrations | **NO** | — |

Product image files unchanged in this phase.

---

# Files Changed

| File | Change |
|---|---|
| `src/sections.mjs` | Communication product-led DOM; compact notes; Integrations hub--compact markup with hub label |
| `src/styles.css` | P2.6 Communication/Integrations mobile composition; hub tile surface ownership; CTA/footer polish |
| `e2e/landing-page-qa.spec.ts` | P2.6 structural, spacing, surface-ownership, and screenshot tests |
| `docs/IMPLEMENTATION.md` | P2.5 merged truth correction; P2.6 section |
| `docs/CHANGELOG.md` | P2.5 authoritative metrics; P2.6 entry |

**Not changed:** Hero, navigation, Platform, Vehicle, AI, Workflow, `content/site.mjs`, `assets/*`

---

# Known Limitations

- Communication mobile crop remains the readability limiting factor (class C)
- Desktop Communication source order differs from visual column grouping (intentional)
- Integrations mobile hub uses compact core statement rather than animated connector diagram

---

# P2.7 Readiness

**Ready:** Communication/Integrations/CTA/Footer mobile composition stable; P2.2–P2.5 work frozen.

**P2.7:** Reserved — no scope defined in this phase.

---

# Commit SHAs

**Starting SHA:** `fe96a49`  
**Implementation commit:** `94d1acd`  
**Documentation commit:** `571169d`  
**SHA finalizer:** `42bbf76`

---

## Post-review mobile integration-row continuity correction (P2.6.1)

**Date:** 2026-08-13  
**Scope:** Integrations mobile list seam only — no Communication, CTA, footer, or asset changes

### Two-list mobile seam discovered

External review found that P2.6 mobile Integrations visually split into two groups of three rows:

1. **Diagram stack gap:** `.hub__diagram { gap: var(--stack-gap) }` inserted an 18px break between the left and right `<ul>` columns
2. **Independent `:last-child` behaviour:** `.surface--compact:last-child` removed item 3's bottom divider inside the left list

### Continuity fix

| Rule | Mobile ≤1024 | Desktop ≥1025 |
|---|---|---|
| `.hub--compact .hub__diagram` | `gap: 0` | unchanged three-column gap |
| `.hub--compact .hub__core` | `margin-bottom: var(--stack-gap)` | `margin-bottom: 0` |
| `.hub--compact .hub__column--right` | `border-top: 1px solid var(--hairline)` (layout seam) | `border-top: 0` |

Canonical `.surface--compact` remains sole owner of row padding/divider chrome — the column seam is section layout bridging only.

### Rendered spacing (390×844 DE, post-settle)

| Metric | P2.6 | P2.6.1 |
|---|---|---|
| Core → item 1 gap | — | **18px** |
| Item 3 → item 4 gap | ~18px (broken) | **1px** (hairline seam only) |
| Item 3/4 separator | **FAIL** (missing divider + large gap) | **PASS** |
| Integrations section height | 983px | **966px** |
| Page height | 8643px | **8626px** |

Communication authoritative values unchanged: section **1042px**, frame top **233.7px**.

### Regression tests

| Test | Result |
|---|---|
| P2.6.1 integrations mobile row continuity (320–1024) | **PASS** |
| P2.6 integrations desktop hub restored | **PASS** (seam/margin reset verified) |
| P2.6 integrations CSS source ownership | **PASS** |

### Final QA

| Gate | Result |
|---|---|
| Chromium | **93/93** |
| WebKit smoke | **2/2** |

### Finding status

- **H-05:** **PARTIAL**
- **M-02:** **RESOLVED** (six-item mobile collection visually continuous; desktop hub intact)
- **L-01:** **RESOLVED**
- **L-02:** **RESOLVED**
- Product Images changed: **NO**
- Production deployed: **NO**

### P2.6.1 commit SHA

**Implementation commit:** `2156752`  
**Documentation commit:** *(after push)*
