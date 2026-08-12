# Phase 2.2 — Global Mobile Layout System

**Date:** 2026-08-12  
**Scope:** Systemic mobile layout foundation — **not deployed**  
**Production reference:** unchanged (`https://synqdrive.eu` serves P1.6.1 baseline)

---

## Executive Summary

Phase 2.2 establishes a coherent mobile design system in CSS and minimal markup primitives: typography tokens, fluid gutter, vertical spacing rhythm, layout-split/stack composition helpers, product-frame mobile treatment, and reusable surface variants. Phase-1 navigation and all product image assets remain unchanged.

**OBSERVATION:** Local build at 390×844 shows measurable improvement without section-specific redesign: DE page height **9455px** (P2.1 **9904px**); hero product frame width **390px** (P2.1 **358px**); hero H1 block height **~92px** (P2.1 **~111px**).

**RECOMMENDATION:** Proceed to P2.3 (Hero) using the new layout primitives; do not deploy until P2.8 gate.

---

## Baseline

| Field | Value |
|---|---|
| Branch | `cursor/global-mobile-layout-1eee` |
| Starting SHA | `e7d6508` (P2.1.2 on `main`) |
| Build | `npm run build` — PASS |
| Chromium QA | **37/37** |
| WebKit smoke | **2/2** |
| Navigation | Frozen — no structural changes |

---

## Scope

### In scope

- Mobile typography, spacing, container/gutter tokens
- Section layout primitives (split/stack/measure)
- Product frame mobile system (`.frame--product`)
- Surface/card foundation (`.surface*`)
- Footer touch-target baseline
- P2.2 structural QA tests + diagnostic screenshots

### Out of scope

- Hero composition / proof relocation (P2.3)
- Platform capability compaction (P2.4)
- AI / Workflow / Communication section work (P2.5–P2.6)
- Manual product crops
- Production deployment
- Navigation redesign

---

## P2.1 Findings Addressed

See [Finding Resolution Matrix](#finding-resolution-matrix) for full traceability.

---

## Design-System Changes

### Container / Gutter

**FACT:** `--gutter` at ≤1024px is `clamp(16px, 4.2vw, 22px)`; computed at 390px ≈ **16.4px**.

**FACT:** Shared shell selectors unchanged: `.hero`, `.section`, `.closing__inner`, `.masthead__inner`, `.sitefooter__inner`, `.sitefooter__legal`.

**CHANGE:** Removed stepped `--gutter: 20px` (760px) and `--gutter: 16px` (420px) overrides in favour of fluid token.

### Typography

**Tokens:** `--type-display`, `--type-section`, `--type-body`, `--type-body-large`, `--type-small`, `--type-subheading`, `--type-label`.

**Mobile caps (≤760px):**

| Role | P2.1 (390px) | P2.2 (390px) |
|---|---|---|
| H1 computed | 34.4px / ~111px height | **28.3px / ~92px height** |
| H2 (section) | 27.1px | **~22.4px** (token cap) |

Applied to `.hero__copy h1`, `.section-title`, `.section-body`, capability/notes headings.

### Spacing

**Tokens:** `--space-xs` through `--space-xl`, `--stack-gap*`, `--stack-copy-visual`.

| Token | Desktop | ≤1024px | ≤760px |
|---|---|---|---|
| `--section-y` | 128px → 104px @1180 | **72px** | **56px** |
| `--stack-copy-visual` | 44px | 32px | **28px** |
| `--surface-padding` | 20px | 20px | **16px** |

Hero padding at ≤1024: `clamp(48px, 8vw, 64px) clamp(56px, 10vw, 88px)` (was fixed `64px 88px`).

### Section Primitives

| Class | Applied to | Purpose |
|---|---|---|
| `.layout-split` | Hero, AI, Communication | Grid + optional `.layout-split--mobile-visual-first` reorder (≤1024px) |
| `.layout-split--copy-first` | Hero, splits | Default copy-before-visual |
| `.layout-stack` | Platform brief, Workflow | Shared vertical stack gap |
| `.layout-measure` | (available) | Copy width helper |

**NOTE:** No section uses `--mobile-visual-first` in P2.2 — mechanics only (G-03 foundation).

### Product Frame

**Markup:** `productFrame()` emits `.frame.frame--product`.

**Mobile (≤760px):**

- `--frame-radius: 12px` (was 16px)
- Lighter `--frame-shadow`
- Full-bleed width: `width: calc(100% + 2 * var(--gutter)); margin-inline: calc(-1 * var(--gutter))`
- `.frame--flush` (vehicle stage) excluded from bleed

### Cards / Surfaces

**Systemic padding reduction** on `.capability`, `.hub__tile`, `.chain__link`, `.flow` via `--surface-padding`.

**New primitives (not applied wholesale):**

- `.surface` — full card
- `.surface--compact` — divider row (P2.4 target)
- `.surface--plain` — unwrapped content

### Responsive Images

**FACT:** `<picture>` mobile sources unchanged (760px breakpoint). Frame presentation only.

**FACT:** Intrinsic dimensions and lazy/eager behaviour preserved in `productFrame()`.

### Touch / Accessibility

- Footer column and legal links: **min-height 44px** (was 32px)
- In-page `.action` already 44px — unchanged
- No CSS visual reorder applied — DOM reading order preserved
- `prefers-reduced-motion` block untouched

---

## Breakpoint Strategy

Existing breakpoints retained; P2.2 adds token layers rather than new device-specific queries:

| Breakpoint | Role |
|---|---|
| 1180px | Section padding step-down |
| 1024px | Nav mobile + **mobile layout token block** |
| 760px | Phone refinement + frame bleed + capability 1-col |
| 480px | Masthead demo hide |
| 420px | Full-width CTAs |
| 359px | Hub 1-col |

No 393/414/430-specific queries added.

---

## 320px Validation

**QA:** P2.2 invariants pass at 320×844 — no horizontal overflow; gutter ≈16px; frame within viewport; CTA ≥44px.

---

## Phone Validation

Tested widths: 320, 360, 375, 390, 430, 480 (DE + EN invariants).

---

## Tablet Validation

Tested: 768, 1024 in P2.2 invariants + desktop regression block at 1100+.

**OBSERVATION:** At 768px, `--section-y: 56px` applies (760 block) — intermediate between old 76px phone and 104px tablet; intentional compression.

---

## DE / EN

Both locales pass P2.2 invariant tests. German remains stress case for heading wrap; tighter H1 cap reduces viewport consumption without locale-specific CSS.

| Metric (390×844) | DE P2.1 | DE P2.2 | EN P2.2 |
|---|---|---|---|
| Page height | 9904px | **9455px** | **9150px** |

---

## Desktop Regression

Widths 1100, 1280, 1440, 1920: no overflow; `--section-y` ≥104px; `--gutter` ≥22px.

All Phase-1 navigation tests pass unchanged.

**Classification:** Desktop visually equivalent — token defaults preserve accepted desktop rhythm.

---

## Performance Impact

- No new JS
- CSS growth: systemic tokens + one mobile frame block (~150 lines net in `styles.css`)
- No new image requests
- Full-bleed frames may marginally improve perceived LCP area (hero visual width) — hero composition still P2.3

---

## QA

| Command | Result |
|---|---|
| `npm run build` | PASS |
| `npm run qa` | **37/37** Chromium |
| `npm run qa:webkit` | **2/2** WebKit smoke |

New tests: P2.2 mobile layout invariants (DE/EN), desktop regression widths, P2.2 screenshot capture.

---

## Visual QA

### Section classification (global changes only)

| Section | Status | Notes |
|---|---|---|
| Hero | **IMPROVED** | Tighter type/spacing; frame full-bleed (+32px width) — product still below fold |
| Platform | **IMPROVED** | Reduced section padding; wider product frame |
| Vehicle Intelligence | **NEUTRAL** | Stage panel unchanged structurally |
| AI Orchestration | **NEUTRAL** | Global spacing only |
| Workflow Automation | **NEUTRAL** | Global spacing only |
| Customer Communication | **NEUTRAL** | Global spacing only |
| Integrations | **NEUTRAL** | Hub layout unchanged |
| Final CTA | **IMPROVED** | Reduced closing padding (80→64px @760) |
| Footer | **IMPROVED** | 44px touch targets |

**REGRESSED:** none

Screenshots (gitignored): `qa/p22-*`

---

## Before / After Metrics

| Metric | P2.1 baseline (390 DE) | P2.2 (390 DE) | Delta |
|---|---|---|---|
| Page scroll height | 9904px | **9455px** | **−449px (−4.5%)** |
| `--section-y` | 76px | **56px** | −20px |
| Hero H1 height | ~111px | **~92px** | −19px |
| Hero frame width | 358px | **390px** | **+32px (+8.9%)** |
| Capability padding | 20px | **16px** | −4px |
| Gutter (computed) | 16px | **16.4px** | ≈same |

EN page height: 9630 → **9150px** (−480px).

---

## Finding Resolution Matrix

| ID | Status | Evidence | Next phase |
|---|---|---|---|
| **G-01** | **RESOLVED** | Token system + `.layout-split`/`.layout-stack`/`.surface*` primitives | P2.3+ apply per section |
| **G-02** | **PARTIAL** | Page height −449px DE; spacing tokens reduced; cards/notes still long | P2.3–P2.6 compression |
| **G-03** | **PARTIAL** | `.layout-split--mobile-visual-first` available; not applied | P2.3 Hero, selective P2.4+ |
| **G-04** | **PARTIAL** | `--surface-padding` reduced; `.surface--compact` defined; cards unchanged | P2.4 Platform |
| **G-05** | **RESOLVED** | Mobile type scale tokens with ≤760px caps | Maintain in P2.3+ |
| **G-06** | **RESOLVED** | Spacing token scale + section-y reduction | Maintain in P2.3+ |
| **G-07** | **PARTIAL** | Frame bleed + lighter shadow improve presentation; crops unchanged | P2.5–P2.6 manual assets |
| **G-08** | **DEFERRED** | Informational — overflow still none | N/A |
| **H-01** | **DEFERRED** | Hero below fold persists | **P2.3** |
| **H-02** | **DEFERRED** | Four stacked capability cards unchanged | **P2.4** |
| **H-03** | **DEFERRED** | AI flow stack unchanged | **P2.5** |
| **H-04** | **DEFERRED** | Workflow density unchanged | **P2.5** |
| **H-05** | **DEFERRED** | Communication crop unchanged | **P2.6** |
| **M-01** | **DEFERRED** | Vehicle notes length unchanged | **P2.4** |
| **M-02** | **DEFERRED** | Hub tile grid unchanged | **P2.6** |
| **M-03** | **RESOLVED** | Mobile frame tokens + full-bleed `.frame--product` | Monitor in P2.3+ |
| **L-01** | **PARTIAL** | Closing padding uses global rhythm | **P2.6** polish |
| **L-02** | **PARTIAL** | Footer links 44px min-height | **P2.6** grouping polish |

---

## Files Changed

| File | Change |
|---|---|
| `src/styles.css` | Mobile layout token system, primitives, responsive overrides |
| `src/primitives.mjs` | `.frame--product` class on product frames |
| `src/sections.mjs` | Layout primitive classes on hero/sections |
| `e2e/landing-page-qa.spec.ts` | P2.2 structural tests + screenshots |
| `docs/IMPLEMENTATION.md` | P2.2 architecture section |
| `docs/CHANGELOG.md` | P2.2 entry |

**Not changed:** `src/script.js`, navigation markup, `content/site.mjs`, `assets/*`, navigation CSS blocks.

---

## Known Limitations

- Hero product visual remains below first viewport on 320–375px (H-01)
- Platform capability cards still full surfaces before product (H-02)
- AI/Workflow/Communication screenshot legibility unchanged (manual crops still needed)
- `.surface--compact` not yet applied to capability cards
- Production still serves pre-P2.2 build

---

## P2.3 Readiness

**Ready:** Global tokens, layout-split reorder hook, frame mobile variant, surface compact primitive.

**P2.3 should:** Apply hero-specific composition (proof/CTA/product visibility) using `.layout-split--mobile-visual-first` if source-order review passes; do not reintroduce section-specific magic-number breakpoints.

---

## Branch / Commit SHA

**Branch:** `cursor/global-mobile-layout-1eee`  
**Starting SHA:** `e7d6508`  
**Implementation commit:** *(recorded on commit)*  
**Documentation commit:** *(if separate)*

---

*End of Phase 2.2 global mobile layout system audit.*
