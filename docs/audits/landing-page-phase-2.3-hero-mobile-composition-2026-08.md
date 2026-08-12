# Phase 2.3 — Hero Mobile Composition

**Date:** 2026-08-12  
**Scope:** Hero section mobile composition only — local only; **not deployed**

---

## Executive Summary

P2.3 reorders the Hero into a product-led mobile composition: **intro → product visual → proof**. Proof/support moves after the Product Frame in semantic DOM order; desktop preserves the approved left-copy / right-product split via CSS grid placement. Tighter Hero padding and compact proof typography reduce vertical preamble without shrinking below the P2.2 type system.

**Key outcome (390×844 DE):** Hero Product Frame top edge moves from **716px → 508px** (−208px, **−29%**). At 320×700 the frame is now **inside the first viewport** (533px top vs 798px P2.2 baseline).

**H-01:** **RESOLVED**

---

## Starting Baseline

| Field | Value |
|---|---|
| Branch | `main` (post PR #2 merge) |
| Starting SHA | `a4cb32e` |

---

## H-01 Diagnosis

P2.1/P2.2 mobile Hero order was:

1. Eyebrow → headline → body → CTAs  
2. Proof list (~120px hairline-separated block)  
3. Product visual

The proof block sat **between CTAs and the Product Frame**, pushing the screenshot down. At 320×700 the frame top was **798px** (below fold). At 390×844 P2.2 frame top was **716px** — only partial presence in the first viewport.

---

## Composition Decision

**Chosen model:** Intro establishes context → **Product Visual** → compact proof/support.

Compared alternatives:

| Model | Outcome |
|---|---|
| A (copy → CTA → visual → proof) | **Selected** — semantic DOM; proof subordinate after product |
| B (visual immediately after headline) | Rejected — context/CTA should precede product |
| C (minimal copy stack) | Rejected — would sacrifice meaning |

Implementation uses **DOM reorder** (not flex `order`) for mobile and desktop accessibility alignment on phones.

---

## DOM / Reading Order

**Before (P2.2):**

```
.hero__copy → eyebrow, h1, body, actions, proof
.hero__media → product frame
```

**After (P2.3):**

```
.hero__intro → eyebrow, h1, body, actions
.hero__media → product frame
.hero__proof → supporting list
```

**Desktop:** CSS grid places `.hero__intro` (row 1, col 1), `.hero__proof` (row 2, col 1), `.hero__media` (rows 1–2, col 2). Visual equivalence preserved.

**Mobile:** Single-column natural flow — intro → media → proof. Screen-reader sequence matches visual sequence.

---

## Typography

- Hero H1 continues `var(--type-display)` P2.2 fluid scale — no device-specific font hacks
- DE H1 at 390px: **92px** block height (unchanged from P2.2)
- EN H1 at 430px: **63px** (3 lines — language-driven, not over-shrunk)
- Body copy retains `--type-body-large` and `--measure-copy-narrow`

---

## CTA Hierarchy

- Primary CTA remains obvious (`action--primary`)
- Secondary CTA quieter with arrow affordance
- Full-width stacked grid preserved at ≤420px
- Measured primary height: **44px** at phone widths (≥44px target)
- No new destinations; no wrapping regressions observed in QA matrix

---

## Proof / Support Treatment

- Proof relocated **after** Product Visual on mobile
- Compact phone styling: `13.5px` type, `8px` vertical padding per row (was `14px` / `11px`)
- Hairline separators retained — no new icons or card chrome
- Substantive claims unchanged (no copy deletion)

---

## Product Visual

- Uses P2.2 `.frame--product` full-bleed at ≤760px (`width: 390px` at 390 viewport)
- No double gutter; no clipping; no horizontal overflow in QA matrix
- Frame height driven by mobile asset intrinsic ratio (~445px at 390px width) — acceptable for product legibility

---

## Product Asset Classification

**Classification: A — works as-is**

The existing `landing-hero-operations-mobile.webp` crop is adequate. The primary defect was **layout order and preamble height**, not the asset itself.

**Manual Product Asset needed:** **NO**

Optional future polish (not blocking): a slightly shorter mobile crop could reduce scroll depth further without CSS `object-fit` cropping.

---

## Image Loading / LCP

- Hero remains `loading="eager"`, `fetchpriority="high"`, `decoding="sync"` via `productFrame({ priority: true })`
- Mobile `<picture>` source at `max-width: 760px` unchanged
- Intrinsic width/height preserved for zero CLS
- No JS added; below-fold images remain lazy

---

## 320px

| Check | Result |
|---|---|
| Readable | PASS |
| No overflow | PASS |
| CTA usable (44px) | PASS |
| Product meaningful in first viewport | PASS — frame top **533px** (< 700px viewport) |

---

## Phone

Audited: 320, 360, 375, 390, 393, 414, 430, 480 — all pass P2.3 automated invariants (DE + EN).

German headline: 3 lines at 320/375/390; no word collision observed.

---

## Tablet

Audited: 600, 768, 820, 1024 — product-before-proof preserved; intentional stack-to-wider-frame transition. Navigation breakpoint (1024/1025) unchanged.

---

## DE / EN

Both locales pass composition invariants. EN not over-spaced; geometry driven by shared tokens with language-dependent H1 line count only.

---

## Desktop Regression

Verified at 1100, 1280, 1440, 1920:

- Intro + proof remain left column
- Product frame remains right column, vertically centred
- No horizontal overflow
- Hero padding/gap at desktop defaults preserved (`96px 120px`, `56px` gap)

---

## Before / After Metrics

### Product Frame top position (DE, page top = 0)

| Viewport | P2.2 | P2.3 | Δ |
|---|---|---|---|
| 320×700 | 798 | **533** | **−265px** |
| 375×812 | 716 | **507** | **−209px** |
| 390×844 | 716 | **508** | **−208px** |
| 430×844 | 613 | **425** | **−188px** |

### Hero total height (DE)

| Viewport | P2.2 | P2.3 | Δ |
|---|---|---|---|
| 320×700 | 1135 | **1051** | −84px |
| 390×844 | 1148 | **1066** | −82px |
| 430×844 | 1090 | **1010** | −80px |
| 768×844 | — | **1077** | — |

### 390×844 DE detail

| Metric | P2.2 | P2.3 |
|---|---|---|
| Hero height | 1148px | **1066px** |
| H1 height | 92px | **92px** |
| CTA height | 44px | **44px** |
| Frame top | 716px | **508px** |
| Frame width | 390px | **390px** |

### First-viewport product presence (390×844)

| | P2.2 | P2.3 |
|---|---|---|
| Frame top in viewport | Yes (lower edge) | Yes (meaningful — ~336px of frame visible vs ~128px) |

---

## Accessibility

- Single H1 preserved
- Logical source order on mobile: intro → media → proof
- CTA focus order follows DOM
- `:focus-visible` unchanged
- Alt text unchanged
- Proof remains semantic `<ul>/<li>`

---

## QA

| Gate | Result |
|---|---|
| `npm run build` | **PASS** |
| Chromium | **47/47** (41 prior + 6 P2.3 tests) |
| WebKit smoke | **2/2** |
| Phase-1 navigation regression | **PASS** (included in suite) |

P2.3 screenshots: `qa/p23-*` (gitignored)

---

## Finding Status

### H-01 Hero mobile composition

**RESOLVED** — product appears materially earlier; hierarchy improved; vertical burden reduced; readability retained; desktop unaffected.

### G-02 Excessive mobile vertical length

**Global: PARTIAL** — Hero contribution improved (−82px hero height at 390); page-level finding remains open for other sections.

### G-03 Product visuals deprioritized

**Global: PARTIAL** — Hero product now leads before proof; other sections unchanged.

### M-03 Product screenshot readability

**Global: PARTIAL** — Hero frame visible earlier at full bleed width; crop/asset unchanged.

---

## Files Changed

| File | Change |
|---|---|
| `src/sections.mjs` | Hero DOM: `.hero__intro`, media, proof reorder |
| `src/styles.css` | Hero grid placement, mobile stack, compact proof, tighter padding |
| `e2e/landing-page-qa.spec.ts` | P2.3 hero invariants + screenshots |
| `docs/IMPLEMENTATION.md` | P2.3 Hero architecture note |
| `docs/CHANGELOG.md` | P2.3 entry |

**Not changed:** navigation, `src/script.js`, `content/site.mjs`, `assets/*`, other sections.

---

## Manual Asset Recommendation

**None required for P2.3 acceptance.**

Optional (non-blocking): if future polish targets shorter Hero scroll depth, a manually curated mobile crop showing dashboard header + key KPI band could trim ~60–80px frame height without CSS crop.

---

## Known Limitations

- Hero mobile frame remains tall (~445px at 390px width) due to asset aspect ratio — acceptable for product legibility
- Proof on desktop screen-reader order is intro → media → proof (visual: intro + proof left, media right) — acceptable tradeoff for mobile-first semantic order
- Platform and downstream sections still defer G-02/G-03 global resolution

---

## P2.4 Readiness

**Ready:** Hero composition stable; global P2.2 tokens unchanged; QA gate extended.

**P2.4 should:** Apply Platform capability card compression (H-02) without altering Hero or navigation.

---

## Commit SHA

**Branch:** `cursor/hero-mobile-composition-1eee`  
**Starting SHA:** `a4cb32e`  
**Implementation commit:** `984e8e1`  
**Documentation commit:** `bb82d5c`

---

## Post-review desktop spacing correction (P2.3.1)

**Date:** 2026-08-12  
**Scope:** Desktop Hero intro → proof spacing only — mobile composition unchanged

### 1. Desktop double-spacing defect

After P2.3, `.hero` used `gap: 56px` (row + column) while `.hero__proof` retained `margin-top: var(--stack-gap-loose)` (36px desktop). With intro on grid row 1 and proof on row 2, the intro → proof separation became **~92px** (56px row gap + 36px margin) instead of the accepted **~36px**.

### 2. Root cause

Two spacing owners on the same vertical relationship: grid row gap and proof margin-top.

### 3. Final spacing owner

Desktop Hero grid now uses:

```css
column-gap: 56px;
row-gap: 0;
```

`.hero__proof { margin-top: var(--stack-gap-loose); }` remains the sole owner of intro → proof separation. Mobile (≤1024px) retains `gap: var(--stack-gap-loose)` and `.hero__proof { margin-top: 0; }` — unchanged from accepted P2.3.

### 4. Measured desktop Intro → Proof gaps (DE)

| Width | Intro → Proof |
|---|---|
| 1100 | **36px** |
| 1280 | **36px** |
| 1440 | **36px** |
| 1920 | **36px** |

### 5. Mobile regression result

**PASS** — composition order remains intro → media → proof at all phone/tablet widths in the P2.3 matrix. No mobile CSS changed.

### 6. 390px Hero Product Frame position after fix

**508px** top (unchanged from accepted P2.3; QA tolerance 500–525px). Desktop row-gap correction does not affect ≤1024px Hero rules.

### 7. Corrected EN H1 measurement (430×844)

| Field | P2.3 audit (incorrect) | Corrected |
|---|---|---|
| H1 block height | 63px (3 lines) | **63px** |
| Rendered lines | 3 | **2** |
| font-size | — | **28.96px** |
| line-height | — | **31.28px** |

Typography unchanged — audit line count corrected only.

### 8. Accessibility (responsive semantic tradeoff)

**Mobile:** Visual order and source order are identical — intro → media → proof.

**Desktop:** CSS grid visually groups intro + proof in the left column and media in the right column. Source order remains intro → media → proof (intentional mobile-first semantic tradeoff). Desktop visual grouping does not match source sequence; this is documented and accepted.

### 9. Final QA

| Gate | Result |
|---|---|
| Chromium | **50/50** |
| WebKit smoke | **2/2** |

New coverage: desktop intro → proof spacing invariants, 390px mobile frame position regression, EN H1 measurement at 430px, desktop Hero screenshots (1100–1920).

### 10. Scope confirmation

| Item | Changed |
|---|---|
| Navigation | **NO** |
| Product images / assets | **NO** |
| Other sections | **NO** |
| Production | **NO** |

### Finding status (unchanged)

- **H-01:** **RESOLVED**
- **G-02 / G-03 / M-03:** global **PARTIAL** (Hero contribution unchanged)

### P2.3.1 commit SHA

**Implementation commit:** `1455b55`  
**Documentation commit:** *(recorded after commit)*
