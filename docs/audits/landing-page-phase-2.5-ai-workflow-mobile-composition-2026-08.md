# Phase 2.5 — AI Orchestration + Workflow Automation Mobile Composition

**Date:** 2026-08-13  
**Scope:** AI (#ai-orchestration) and Workflow (#workflow-automation) sections only — implemented in Draft PR #5; **not deployed**

---

## Executive Summary

P2.5 makes AI Orchestration and Workflow Automation more product-led on mobile/tablet using P2.2 surface primitives and composition patterns from P2.3/P2.4. AI moves the Product Visual immediately after the section intro with compact flow and governance rows below. Workflow retains intro → compact chain → Product Visual order with divider-style chain links on ≤1024px.

**Key outcome (390×844 DE, post-settle QA probe — authoritative, commit-pinned):**

| Section | Frame top before → after | Section height before → after |
|---|---|---|
| AI | **948px → 307.9px** | **1328px → 1248px** |
| Workflow | **715.7px → 624.3px** | **1120px → 1029px** |
| Page | — | **8975px → 8804px** |

**Corresponding improvements (390×844 DE):**

| Metric | Δ |
|---|---|
| Workflow frame top | **−91.4px** |
| Workflow section height | **−91px** |
| Total page height | **−171px** |

**H-03:** **PARTIAL** (composition materially improved; manual mobile crop still recommended)  
**H-04:** **PARTIAL** (compact chain + earlier product; manual mobile crop still recommended)

---

## Starting Baseline

| Field | Value |
|---|---|
| Branch | `main` |
| Starting SHA | `d35bca70d1c8bd07aa703c813bedf64886242a0b` (PR #4 merge) |
| P2.5 branch | `cursor/ai-workflow-mobile-composition-1eee` |

---

## Findings Owned

| ID | Section | P2.5 scope |
|---|---|---|
| **H-03** | AI Orchestration mobile composition | Primary |
| **H-04** | Workflow Automation mobile composition | Primary |
| **G-02** | Excessive mobile vertical length | AI/Workflow contribution improved; global status remains **PARTIAL** |
| **G-03** | Product visuals deprioritized | Improved in AI/Workflow |
| **G-04** | Excessive card chrome | Reduced via compact surfaces |
| **M-03** | Screenshot presentation/readability | Monitor — layout improved; crops unchanged |

---

# AI Orchestration

## Before

Mobile order: heading + body → **four-step flow rail (full card)** → **governance notes** → Product Visual.

| Metric (390×844 DE) | Value |
|---|---|
| Section height | **1328px** |
| Section top → Product Frame top | **948px** |
| Product Frame size | **390×324px** |
| Flow steps | **4** (vertical rail in bordered container) |
| Governance items | **2** |

## Composition Decision

**Chosen:** Option A — Intro → Product Visual → compact flow → compact governance.

Alternatives B/C rejected after measurement: moving product before the long explanatory stack delivers the largest frame-distance improvement without sacrificing governance completeness.

## DOM / Reading Order

Semantic DOM (mobile): `.split__intro` → `.split__media` → `.split__support` (flow + governance).

Desktop CSS grid restores mirrored split: product left; intro + supporting explanation right column.

**Tradeoff:** Desktop visual grouping (intro above flow on the right) differs from mobile source sequence — documented explicitly, same pattern as P2.3 Hero and P2.4 Platform.

## Product Visual

- P2.2 `.frame--product` full-bleed retained at ≤760px
- No asset or lazy/eager changes
- Frame width: 320 **320px**, 390 **390px**, 430 **430px**

## Flow Treatment

- Markup: `flow__step flow__step--compact surface surface--compact` inside `flow flow--compact`
- ≤1024px: canonical `.surface--compact` owns row chrome; timeline connectors hidden
- ≥1025px: `.split--product-led .flow--compact` restores bordered flow rail and dot/line sequence
- Semantic `<ol>` preserved; all four concepts retained

## Governance Treatment

- Markup: `notes__item notes__item--compact surface surface--compact` inside `notes notes--compact`
- ≤1024px: low-chrome divided rows; subordinate to product and flow
- ≥1025px: restored `.notes` spacing and typography
- No copy deletion; layout-only subordination

## Mobile

- Single spacing owner: `.split--product-led { gap: var(--stack-copy-visual) }` for intro→media and media→support
- `.split__support { gap: var(--stack-gap) }` owns flow→governance
- `.flow--compact { margin-top: 0 }` on mobile — no double spacing with grid gap

## Tablet

600–1024: compact rows retained; product before supporting explanation; no device hacks.

## Desktop Regression

1100–1920: mirrored split restored — product left of copy column; flow rail border and timeline markers active; geometry verified by QA.

## Metrics (390×844 DE, post-settle)

| Metric | Before | After | Δ |
|---|---|---|---|
| Section height | 1328px | **1248px** | **−80px** |
| Section top → frame top | 948px | **307.9px** | **−640.1px** |
| Product Frame | 390×324 | 390×324 | — |

## Product Asset Classification

**C — manual tighter crop recommended**

After layout improvement the chat UI remains marginally readable at 320–430px widths. Layout is no longer the primary blocker.

**MANUAL PRODUCT ASSET RECOMMENDED** — target crop should show:

- One representative user question
- Assistant answer with visible evidence/sources panel
- Minimal surrounding application chrome
- No tenant-sensitive content

---

# Workflow Automation

## Before

Mobile order: heading + body → **three full chain cards with chevron connectors** → Product Visual.

| Metric (390×844 DE) | Value |
|---|---|
| Section height | **1120px** |
| Section top → frame top | **715.7px** |
| Product Frame size | **390×349px** |
| Chain stages | **3** (stacked full cards) |

## Composition Decision

**Chosen:** Retain semantic order Intro → compact chain → Product Visual.

Compact divider rows alone proved sufficient (+55px frame improvement, −55px section height) without reordering. Preserves desktop source order and distinct identity from AI.

## Chain Treatment

- Markup: `chain__link chain__link--compact surface surface--compact`
- ≤1024px: canonical `.surface--compact` rows; chevron pseudo-connectors hidden
- ≥1025px: three-column chain cards restored via `.workflow--compact .chain__link--compact`
- Semantic `<ol>` preserved; Trigger / Conditions / Action retained

## Product Visual

- Wide automation screenshot; responsive `<picture>` unchanged
- Frame height at 390: **349px** — acceptable without distortion or misleading clip
- P2.2 tier spacing tokens unchanged (`--stack-gap-head-chain`, `--stack-gap-chain-media`)

## Mobile

- `.layout-stack--tiered` continues to own head→chain and chain→media gaps
- No additional margin-top on compact chain links

## Tablet

600–1024: single-column compact chain; product follows chain

## Desktop Regression

1100–1920: 3-column chain band restored; full card chrome on chain links; tier spacing unchanged

## Metrics (390×844 DE, post-settle)

*Initial P2.5 measurement — later corrected by commit-pinned P2.5.2 reconciliation. Authoritative after values: frame top **624.3px**, section height **1029px**.*

| Metric | Before | After (initial P2.5) | Δ (initial P2.5) |
|---|---|---|---|
| Section height | 1120px | **1065px** | **−55px** |
| Section top → frame top | 715.7px | **660.3px** | **−55.4px** |
| Product Frame | 390×349 | 390×349 | — |

## Product Asset Classification

**C — manual tighter crop recommended**

Automation table text in the current mobile crop remains below comfortable readability at phone widths.

**MANUAL PRODUCT ASSET RECOMMENDED** — target crop should emphasize:

- One automation definition
- Trigger, condition, and action/result visible
- Status/risk indicator if useful
- Not the entire dense automation table

---

# AI vs Workflow Distinctness

| Section | Mobile identity |
|---|---|
| **AI** | Product-first split; four-step reasoning sequence + governance control notes |
| **Workflow** | Stacked tier; three-stage process chain then automation product evidence |

Neither section uses an identical heading → screenshot → three-rows template.

---

# Accessibility

- Section headings remain H2 via `sectionHead()`
- Flow and chain remain semantic `<ol>` with H3 step titles
- Governance remains supporting list items with H3 titles
- DOM reading order matches mobile visual narrative (no CSS `order` reorder on AI)
- Product alt text unchanged
- No duplicate responsive content blocks

---

# DE / EN

**AI phone (≤480):** DE and EN — widths 320–480.

**AI tablet:** DE and EN — 768, 1024.

**AI desktop:** DE — 1100–1920 geometry.

**Workflow phone/tablet:** DE and EN — 320–480 and 600–1024.

**Workflow desktop:** DE and EN — 1100–1920.

Structural coverage at **390 / 768 / 1440** for both locales.

German remains primary stress case (KI-Orchestrierung, Workflow-Automatisierung, Freigegebene Aktion, Bedingungen).

---

# Performance

- AI and Workflow images remain lazy below fold
- Hero eager/high-priority unchanged
- Intrinsic dimensions and responsive `<picture>` preserved
- No new JavaScript

---

# Page Height Impact

**Authoritative outcome (390×844 DE, commit-pinned settle probe):**

| Metric (390×844 DE) | Before | After | Δ |
|---|---|---|---|
| Total page height | **8975px** | **8804px** | **−171px** |

*Superseded initial P2.5 measurement recorded **8840px** (−135px) — later corrected by commit-pinned P2.5.2 reconciliation.*

Page-level length improved without sacrificing section comprehension.

---

# QA

| Gate | Result |
|---|---|
| `npm run build` | **PASS** |
| Chromium | **75/75** |
| WebKit smoke | **2/2** |
| P2.2 / P2.3 / P2.4 regression | **PASS** |

P2.5 screenshots: `qa/p25-*` (gitignored)

---

# Visual QA

Section screenshots captured DE/EN at 320, 375, 390, 430, 768, 1440 for AI and Workflow.

Mid-page sequence Vehicle → AI → Workflow → Communication reviewed: AI product arrives substantially earlier; Workflow chain is visually lighter before its product frame.

---

# Finding Resolution Matrix

| ID | Status | Evidence |
|---|---|---|
| **H-03** | **PARTIAL** | Product 640px earlier at 390; compact flow/governance; desktop preserved; asset still class C |
| **H-04** | **PARTIAL** | Compact chain; product 55px earlier; desktop preserved; asset still class C |
| **G-02** | **PARTIAL** | AI −80px / Workflow −55px / page −135px at 390; page-level open |
| **G-03** | **PARTIAL** | AI product materially earlier; Workflow product modestly earlier |
| **G-04** | **PARTIAL** | Compact surfaces replace full mobile card stacks |
| **M-03** | **PARTIAL** | Layout/framing improved; manual crops still recommended |

*G-02 / H-04 deltas above reflect initial P2.5 measurements (Workflow −55px / page −135px). Authoritative reconciled deltas: Workflow frame top **−91.4px**, section height **−91px**, page height **−171px** — see P2.5.2 reconciliation.*

---

# Manual Product Asset Recommendations

| Section | Manual asset needed | Classification |
|---|---|---|
| AI Orchestration | **YES** | C |
| Workflow Automation | **YES** | C |

Product image files unchanged in this phase.

---

# Files Changed

| File | Change |
|---|---|
| `src/sections.mjs` | AI DOM restructure (`split--product-led`); compact flow/governance markup; compact workflow chain markup |
| `src/styles.css` | P2.5 AI product-led grid; compact flow/governance; compact workflow chain; desktop restoration |
| `e2e/landing-page-qa.spec.ts` | P2.5 AI/Workflow invariants, spacing, geometry, screenshots |
| `docs/IMPLEMENTATION.md` | P2.4 merge status correction; P2.5 section |
| `docs/CHANGELOG.md` | P2.4 merge note; P2.5 entry |

**Not changed:** Hero, navigation, Platform, Vehicle, Communication, Integrations, `content/site.mjs`, `assets/*`, closing/footer

---

# Known Limitations

- AI and Workflow mobile crops remain the readability limiting factor (class C)
- Desktop AI source order differs from visual column grouping (intentional)
- Workflow wide screenshot remains tall at full mobile width — acceptable without distortion

---

# P2.6 Readiness

**Ready:** AI/Workflow mobile composition stable; P2.2–P2.4 work frozen.

**P2.6 should:** Address Communication composition (H-05) without altering accepted AI/Workflow/Platform/Vehicle/Hero work.

---

# Commit SHAs

**Starting SHA:** `d35bca70d1c8bd07aa703c813bedf64886242a0b`  
**Implementation commit:** `ffe7417`  
**Documentation commit:** `004c8d0`

---

## Post-review compact-surface ownership correction (P2.5.1)

**Date:** 2026-08-13  
**Scope:** Workflow compact-surface cascade only — composition unchanged

### Duplicate Workflow compact-surface ownership

P2.5 duplicated `.surface--compact` chrome inside `.workflow--compact .chain__link.chain__link--compact.surface--compact` (padding, border reset, transparent background, bottom hairline, and `:last-child` divider removal).

### Cascade fix

- **Mobile (≤1024):** canonical `.surface--compact` owns compact chrome; `.workflow--compact` owns layout/typography only (list gap, chevron removal, heading/body spacing)
- **Desktop (≥1025):** `.chain__link` card chrome scoped to `@media (min-width: 1025px)`; `.workflow--compact .chain__link--compact` restores full cards with sufficient specificity to beat `.surface--compact:last-child`
- **`position: static` removed** — not required once chevron pseudo-elements are disabled on mobile; `position: relative` retained from base `.chain__link` without layout change

### Mobile Workflow divider regression

**PASS** — P2.5.1 test verifies all three links at ≤1024: `surface--compact` class, ~14px padding, zero side/top borders, transparent background, links 1–2 bottom divider > 0, link 3 bottom divider = 0

### Desktop Workflow all-three-card chrome

**PASS** — P2.5.1 test verifies non-zero borders, non-transparent background, and radius on all three chain cards at **1100**, **1280**, **1440**, **1920**; 3-column layout retained

### Composition freeze verification (390×844 DE, post-settle)

| Metric | P2.5 | P2.5.1 | Δ |
|---|---|---|---|
| AI frame top | 307.9px | **307.9px** | — |
| AI section height | 1248px | **1248px** | — |
| Workflow frame top | 624.3px | **624.3px** | — |
| Workflow section height | 1029px | **1029px** | — |
| Page height | 8804px | **8804px** | — |

(AI/Workflow mobile order unchanged.)

### Final QA

| Gate | Result |
|---|---|
| Chromium | **77/77** |
| WebKit smoke | **2/2** |

### Finding status

- **H-03:** **PARTIAL**
- **H-04:** **PARTIAL**

### Asset classification

- AI: **C** — manual asset still recommended
- Workflow: **C** — manual asset still recommended
- Product Images changed: **NO**
- Production deployed: **NO**

### P2.5.1 commit SHA

**Implementation commit:** `33b5501`  
**Documentation commit:** `0e2ec79`

---

## Post-review desktop ownership and metric reconciliation (P2.5.2)

**Date:** 2026-08-13  
**Scope:** Workflow desktop card-chrome consolidation + authoritative 390 metric reconciliation — no composition change

### Duplicate desktop Workflow card-chrome ownership

P2.5.1 scoped `.chain__link` card chrome to `@media (min-width: 1025px)` and duplicated the same properties on `.workflow--compact .chain__link--compact`.

### Final single desktop owner

```css
@media (min-width: 1025px) {
  .workflow--compact .chain__link {
    padding: var(--surface-padding);
    border: 1px solid var(--hairline);
    border-radius: var(--surface-radius);
    background: var(--canvas-alt);
  }
}
```

Mobile canonical `.surface--compact` ownership retained unchanged from P2.5.1.

### Regression tests

| Test | Result |
|---|---|
| P2.5.1 mobile compact surface ownership | **PASS** |
| P2.5.1 desktop all-three-card borders (1100 / 1280 / 1440 / 1920) | **PASS** |

### Commit-pinned measurement method

Chromium · viewport **390×844** · `deviceScaleFactor: 2` · locale **DE /** · built dist at `http://127.0.0.1:4321/` · canonical QA `settle()` scroll pass + **1100ms** wait · `#platform` / `#ai-orchestration` / `#workflow-automation` `getBoundingClientRect()` (same probe as P2.4+ QA).

### Measured values

| Metric | Original P2.5 audit prose (`004c8d0` doc) | Commit-pinned `004c8d0` CSS (settle probe) | P2.5.2 current (settle probe) |
|---|---|---|---|
| AI frame top | 307.9px | **307.9px** | **307.9px** |
| AI section height | 1248px | **1248px** | **1248px** |
| Workflow frame top | **660.3px** | **624.3px** | **624.3px** |
| Workflow section height | **1065px** | **1029px** | **1029px** |
| Page height | **8840px** | **8804px** | **8804px** |
| Workflow head → chain gap | — | **48px** | **48px** |
| Workflow chain → media gap | — | **28px** | **28px** |
| Chain `margin-top` | — | **48px** | **48px** |
| Media `margin-top` | — | **28px** | **28px** |

### Explanation of the 36px discrepancy

**Conclusion: A — the original P2.5 audit measurements were inaccurate.**

Re-measurement of commit-pinned **`004c8d0`** CSS with the canonical settle probe yields **624.3px / 1029px / 8804px** — identical to **P2.5.1** and **P2.5.2**. The Workflow/Page delta is exactly **36px** in frame top, section height, and page height.

**P2.5.1 did not change layout by 36px** (C ruled out). Spacing tokens (`margin-top: 48px` / `28px`) are unchanged across all pinned commits.

The original P2.5 audit prose (**660.3px / 1065px / 8840px**) was recorded before the canonical settle measurement method was enforced on this branch. Historical tables above retain those figures as written evidence; **authoritative current metrics** use the settle probe values in this section.

### Final authoritative 390×844 DE metrics

| Section | Frame top (rel.) | Section height |
|---|---|---|
| AI | **307.9px** | **1248px** |
| Workflow | **624.3px** | **1029px** |
| Page | — | **8804px** |

### Final QA

| Gate | Result |
|---|---|
| Chromium | **77/77** |
| WebKit smoke | **2/2** |

### Finding status

- **H-03:** **PARTIAL**
- **H-04:** **PARTIAL**
- AI asset class: **C**
- Workflow asset class: **C**
- Product Images changed: **NO**
- Production deployed: **NO**
- P2.6 started: **NO**

### P2.5.2 commit SHA

**Implementation commit:** `86d141d`  
**Documentation commit:** `e910454`

---

## Post-review ownership regression correction (P2.5.3)

**Date:** 2026-08-13  
**Scope:** Restore canonical Workflow surface ownership after P2.5.2 regression — no composition, content, or asset change

### What P2.5.2 (`86d141d`) accidentally reintroduced

External review found that commit **`86d141d`** attempted desktop card-chrome consolidation but also:

1. Restored generic card chrome on base **`.chain__link`** at all widths (padding, border, radius, background)
2. Reintroduced a duplicate mobile compact-surface block on **`.workflow--compact .chain__link.chain__link--compact.surface--compact`** (padding `14px 0`, border reset, transparent background, bottom divider, and `:last-child` divider removal)
3. Left a second desktop owner on **`.workflow--compact .chain__link--compact`** instead of the intended single selector

Therefore the P2.5.2 audit statement that mobile canonical ownership was unchanged and that a single desktop owner was already in place was **inaccurate** for the shipped CSS.

### P2.5.3 correction

P2.5.3 restores the intended P2.5.1 architecture:

| Breakpoint | Sole surface/card owner | Workflow-specific rules own |
|---|---|---|
| Mobile ≤1024 | **`.surface--compact`** — padding, border reset, radius reset, transparent background, bottom divider, last-child divider removal | `.chain__list` gap/margin; connector/chevron suppression; heading/body spacing/type only |
| Desktop ≥1025 | **`.workflow--compact .chain__link`** — padding, border, radius, background | — |

Base **`.chain__link`** owns **`position: relative` only** (no card chrome at any width).

### Source-level regression guard

Added **`P2.5.3 workflow CSS source ownership`** — reads `src/styles.css` and asserts:

- Workflow mobile rules do not duplicate canonical `.surface--compact` chrome (`padding: 14px 0`, `border-radius: 0`, `background: transparent`, `border-bottom: 1px solid var(--hairline)`)
- No Workflow-specific `.surface--compact:last-child` rule
- Exactly one desktop Workflow card-chrome selector: `.workflow--compact .chain__link`
- Base `.chain__link` contains only positioning, not card chrome

Existing P2.5.1 computed-style mobile and desktop rendered tests retained unchanged.

### Composition freeze verification (390×844 DE, post-settle)

Re-measured after CSS cleanup — values remain effectively identical to P2.5.2 authoritative metrics (sub-pixel rounding acceptable):

| Metric | P2.5.2 authoritative | P2.5.3 post-correction |
|---|---|---|
| AI frame top | **307.9px** | **307.9px** |
| AI section height | **1248px** | **1248px** |
| Workflow frame top | **624.3px** | **624.3px** |
| Workflow section height | **1029px** | **1029px** |
| Page height | **8804px** | **8804px** |
| Workflow head → chain gap | **48px** | **48px** |
| Workflow chain → media gap | **28px** | **28px** |

### Final QA

| Gate | Result |
|---|---|
| Chromium | **78/78** |
| WebKit smoke | **2/2** |

### Finding status

- **H-03:** **PARTIAL**
- **H-04:** **PARTIAL**
- AI asset class: **C**
- Workflow asset class: **C**
- Product Images changed: **NO**
- Production deployed: **NO**
- P2.6 started: **NO**

### P2.5.3 commit SHA

**Implementation commit:** `9c1d016`  
**Documentation commit:** `6ed59e8`  
**SHA finalizer:** `f9ba06a`

---

## Documentation truth closure (P2.5.4)

**Date:** 2026-08-13  
**Scope:** Audit documentation only — no runtime, test, template, content, or asset changes

External review confirmed P2.5 / P2.5.1 / P2.5.2 / P2.5.3 **technical PASS**. This phase closes documentation truth gaps:

- Scope status corrected: Draft PR #5 (not merged to main)
- Executive Summary Key Outcome updated to commit-pinned authoritative metrics
- Historical tables retaining **660.3px / 1065px / 8840px** explicitly labeled as initial P2.5 measurements superseded by P2.5.2 reconciliation
- Page Height Impact active outcome corrected to **8804px / −171px**

---

# P2.5 FINAL TECHNICAL STATE

- AI composition: **PASS**
- Workflow composition: **PASS**
- canonical Workflow mobile surface ownership: **PASS**
- single Workflow desktop card owner: **PASS**
- source-level ownership regression guard: **PASS**
- Chromium: **78/78**
- WebKit: **2/2**
- AI frame top at 390: **307.9px**
- Workflow frame top at 390: **624.3px**
- Workflow section height: **1029px**
- Page height: **8804px**
- H-03: **PARTIAL**
- H-04: **PARTIAL**
- AI asset class: **C**
- Workflow asset class: **C**
- Product Images changed: **NO**
- Production deployed: **NO**
- PR #5 merged: **NO**
- P2.6 started: **NO**

### Approved commit references

| Phase | Implementation | Documentation |
|---|---|---|
| P2.5 | `ffe7417` | `004c8d0` |
| P2.5.1 | `33b5501` | `0e2ec79` |
| P2.5.2 | `86d141d` | `e910454` |
| P2.5.3 | `9c1d016` | `6ed59e8` |

**P2.5.3 SHA finalizer:** `f9ba06a`
