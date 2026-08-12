# Phase 2.4 — Platform + Connected Vehicle Intelligence Mobile Composition

**Date:** 2026-08-12  
**Scope:** Platform (#platform) and Vehicle (#vehicle-intelligence) sections only — local only; **not deployed**

---

## Executive Summary

P2.4 makes Platform and Connected Vehicle Intelligence more product-led on mobile/tablet using existing P2.2 primitives. Platform capabilities become compact divider rows on ≤1024px and the Product Visual moves **before** the capability summary in semantic DOM order. Vehicle retains the composed Stage panel with tighter mobile note rhythm and lighter panel chrome.

**Key outcome (390×844 DE):** Platform Product Frame section-relative top **962px → 284px**; section height **1264px → 1017px**; mobile full card surfaces **4 → 0**.

**H-02:** **RESOLVED** · **M-01:** **PARTIAL** (improved)

---

## Starting Baseline

| Field | Value |
|---|---|
| Branch | `main` |
| Starting SHA | `d1c6531` |
| P2.4 branch | `cursor/platform-vehicle-mobile-composition-1eee` |

---

## Findings Owned

| ID | Section | P2.4 scope |
|---|---|---|
| **H-02** | Platform mobile composition | Primary |
| **M-01** | Vehicle notes lengthen section | Primary |
| **G-02** | Excessive mobile vertical length | Hero contribution only — improved here |
| **G-03** | Product visuals deprioritized | Improved in Platform |
| **M-03** | Screenshot readability | Monitor — layout improved; crops unchanged |

---

# Platform

## Before

Mobile order: heading + body → **four full card surfaces** → Product Visual.

| Metric (390×844 DE) | Value |
|---|---|
| Section height | **1264px** |
| Section top → Product Frame top | **962px** |
| Full mobile card surfaces | **4** |
| Product Frame width | **390px** |

## Composition Decision

**Chosen:** Heading / intro → **Product Visual** → compact capability summary.

Alternative (capabilities before product) rejected: product comprehension improves when the fleet plan UI appears immediately after the section promise.

**DOM order (mobile):** `.brief__intro` → `.stack__media` → `.capability-grid`

**Desktop:** CSS grid restores intro + 2×2 capability cards in row 1; product frame full width in row 2 — visual equivalent to pre-P2.4.

## Capability Treatment

- Added `.brief--product-led` and `.capability--compact`
- ≤1024px: divider-separated compact rows (icon + title + body), transparent background, no card radius
- ≥1025px: existing `.capability` card surfaces preserved

**Card-soup reduction:**

| | Before | After (≤1024) |
|---|---|---|
| Full mobile card surfaces | **4** | **0** |
| Compact row surfaces | 0 | **4** |

## Product Visual

- P2.2 `.frame--product` full-bleed retained at ≤760px
- No asset or lazy/eager changes
- Frame width: 320 **320px**, 390 **390px**, 430 **430px**

## Mobile

- Single spacing owner: `.brief--product-led.layout-stack { gap: var(--stack-copy-visual) }`
- `.stack__media { margin-top: 0 }` — no double spacing with grid gap
- Measured intro → media gap at 390: **~32px**

## Tablet

600–1024: compact rows retained; product remains before capabilities; no arbitrary device hacks.

## Desktop Regression

1100–1920: 2×2 capability grid beside intro; full-width frame below; four card surfaces restored.

## Metrics (390×844 DE)

| Metric | Before | After | Δ |
|---|---|---|---|
| Section height | 1264px | **1017px** | **−247px** |
| Section top → frame top | 962px | **284px** | **−678px** |
| Full card surfaces | 4 | **0** | −4 |

---

# Connected Vehicle Intelligence

## Before

Composed stage (image + notes) technically sound; notes used heavy padding and competed visually with the screenshot.

| Metric (390×844 DE) | Value |
|---|---|
| Section height | **1259px** |
| Heading bottom → panel top | **28px** |

## Stage Composition

Stage concept preserved — one composed panel with `.frame--flush` inside `.stage__media`.

## Product Visual

- Flush frame remains panel-contained (P2.2 `.frame--product:not(.frame--flush)` rule untouched)
- Media width at 320: **286px** (panel inset); 430: **392px**
- No misleading CSS crop

## Notes

- Reduced mobile padding and row rhythm
- Hairline dividers retained; no new icons
- Three notes preserved (no content deletion)

## Containment

- `.frame--flush` negative bleed margins: **none**
- QA verifies flush left/right within `.stage__media` at all phone/tablet widths

## Mobile

≤1024: stacked panel; lighter note typography/padding  
≤760: panel radius `--surface-radius`; notes `12px` row padding

## Tablet

600–1024: stacked stage retained; desktop side-by-side deferred to ≥1025

## Desktop Regression

≥1025: two-column stage panel restored; desktop chrome unchanged in structure

## Metrics (390×844 DE)

| Metric | Before | After | Δ |
|---|---|---|---|
| Section height | 1259px | **1173px** | **−86px** |
| Head → panel gap | 28px | **28px** | — |

---

## Product Asset Classification

| Section | Asset | Class | Manual asset needed |
|---|---|---|---|
| Platform | `landing-unified-operations-mobile` | **B** (layout was primary issue) | **NO** — optional tighter plan crop remains non-blocking |
| Vehicle | `landing-connected-vehicle-mobile` | **A** | **NO** |

---

## Accessibility

- Platform: source order intro → media → capabilities matches mobile visual narrative
- Desktop Platform: visual grouping (intro + cards left, media right) differs from source order — intentional tradeoff (same pattern as P2.3 Hero)
- Vehicle: H2 section heading; H3 note headings; no duplicate content
- No CSS `order` used for Platform reorder

---

## DE / EN

Both locales pass P2.4 invariants. German stress-tested for capability title wrapping and note length.

---

## Performance

- Hero eager/high-priority unchanged
- Platform/Vehicle images remain lazy below fold
- Intrinsic dimensions preserved

---

## QA

| Gate | Result |
|---|---|
| `npm run build` | **PASS** |
| Chromium | **58/58** |
| WebKit smoke | **2/2** |
| P2.2 / P2.3 regression | **PASS** |

P2.4 screenshots: `qa/p24-*` (gitignored)

---

## Visual QA

Section screenshots captured DE/EN at 320, 375, 390, 430, 768, 1440 for Platform and Vehicle.

Hero → Platform → Vehicle rhythm reviewed: Platform product arrives earlier; Vehicle stage remains cohesive.

---

## Finding Resolution Matrix

| ID | Status | Evidence |
|---|---|---|
| **H-02** | **RESOLVED** | Product before capabilities; 0 full mobile cards; frame 678px earlier at 390 |
| **M-01** | **PARTIAL** | Notes compact and subordinate; still below screenshot (by design) |
| **G-02** | **PARTIAL** | Platform −247px / Vehicle −86px at 390; page-level open |
| **G-03** | **PARTIAL** | Platform product materially earlier; other sections unchanged |
| **M-03** | **PARTIAL** | Layout/framing improved; crops unchanged |

---

## Files Changed

| File | Change |
|---|---|
| `src/sections.mjs` | Platform DOM reorder + `brief--product-led` |
| `src/styles.css` | Platform compact rows; desktop grid; Vehicle mobile panel/notes |
| `e2e/landing-page-qa.spec.ts` | P2.4 invariants; P2.2 platform spacing selector update |

**Not changed:** Hero, navigation, `content/site.mjs`, `assets/*`, AI/Workflow/Communication/Integrations/closing/footer

---

## Known Limitations

- Platform mobile plan crop remains short/wide — optional manual asset if legibility still insufficient at small display heights
- Vehicle notes remain post-screenshot in DOM — hierarchy improved but not inline
- Desktop Platform source order differs from visual card column grouping

---

## P2.5 Readiness

**Ready:** Platform/Vehicle stable; P2.2 tokens unchanged globally.

**P2.5 should:** Address AI orchestration flow stack (H-03) without altering Platform/Vehicle or Hero.

---

## Commit SHAs

**Starting SHA:** `d1c6531`  
**Implementation commit:** `5f7ae7d`  
**Documentation commit:** `e9639eb`
