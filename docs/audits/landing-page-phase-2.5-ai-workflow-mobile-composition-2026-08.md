# Phase 2.5 — AI Orchestration + Workflow Automation Mobile Composition

**Date:** 2026-08-13  
**Scope:** AI (#ai-orchestration) and Workflow (#workflow-automation) sections only — merged to main locally; **not deployed**

---

## Executive Summary

P2.5 makes AI Orchestration and Workflow Automation more product-led on mobile/tablet using P2.2 surface primitives and composition patterns from P2.3/P2.4. AI moves the Product Visual immediately after the section intro with compact flow and governance rows below. Workflow retains intro → compact chain → Product Visual order with divider-style chain links on ≤1024px.

**Key outcome (390×844 DE, post-settle QA probe):**

| Section | Frame top before → after | Section height before → after |
|---|---|---|
| AI | **948px → 307.9px** | **1328px → 1248px** |
| Workflow | **715.7px → 660.3px** | **1120px → 1065px** |
| Page | — | **8975px → 8840px** |

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

| Metric | Before | After | Δ |
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

| Metric (390×844 DE) | Before | After | Δ |
|---|---|---|---|
| Total page height | **8975px** | **8840px** | **−135px** |

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
**Implementation commit:** *(recorded after commit)*  
**Documentation commit:** *(recorded after commit)*
