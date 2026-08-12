# Phase 2.1 — Mobile Landing Page Experience Baseline Audit

**Date:** 2026-08-12  
**Scope:** Diagnostic audit only — no code, content, asset, or deployment changes  
**Production reference:** <https://synqdrive.eu> (visual parity with local build verified post-P1.6.1)

---

## Executive Summary

Phase 1 delivered a technically stable, accessible mobile **navigation** layer. The **page composition** below the header still reads as a desktop layout collapsed into a single column: copy block → cards/notes → framed screenshot, repeated with similar spacing and card treatments across seven sections.

**FACT:** All viewport overflow checks passed (0/32 horizontal overflow failures across DE/EN and the full viewport matrix on the local build).

**FACT:** Baseline QA passed unchanged: **33/33 Chromium**, **2/2 WebKit smoke**.

**OBSERVATION:** The mobile page is ~**9,900px** scroll height (DE, 390×844) with **no intentional mobile composition system** beyond grid collapse and existing `<picture>` mobile crops at 760px.

**OBSERVATION:** The hero product visual is **below the first viewport** on 320×700 and 375×812; only a sliver appears at 390×844.

**RECOMMENDATION:** Phase 2 should establish a **global mobile layout system (P2.2)** before section-by-section work, then address hero and the most product-dense sections with a mix of CSS composition fixes and **targeted manual mobile crops** where screenshots remain illegible.

Navigation is **frozen** — no Phase 2.1 finding proposes navigation changes.

---

## Repository Baseline

| Field | Value |
|---|---|
| Branch | `main` |
| HEAD | `b489247` |
| Working tree | Clean at audit start |
| Build | `npm run build` — PASS (`verify-dist-artefact: OK`, 29 public files) |
| Local QA | Chromium **33/33** pass; WebKit **2/2** pass |
| Runtime baseline | Website content unchanged since `c77dc76`; build hygiene at `feacb47` |
| Latest Phase-1 docs | P1.6.1 complete (`5273925` / `b489247`) |

**Audit method:** Built `dist/` served at `http://127.0.0.1:4321`. Full-page screenshots captured to `qa/p21-audit/` (gitignored). Automated metrics in `qa/p21-audit/metrics.json` (gitignored). Production visually consistent with local build for navigation and asset hashes; no Production deployment in this phase.

---

## Audit Method

1. Read governance (`AGENTS.md`, `DECISIONS.md`, `IMPLEMENTATION.md`, Phase-1 audits, `assets/product/README.md`).
2. `npm run build` → serve built output.
3. Viewport matrix: portrait 320–480, tablet 600–1024, landscape 667×375 through 932×430 — overflow check DE/EN.
4. Full-page screenshots: 320×700, 375×812, 390×844, 430×932, 768×1024 — DE/EN.
5. Per-section review of templates (`src/sections.mjs`), styles (`src/styles.css`), content (`content/site.mjs`), and rendered metrics.
6. Product-image policy respected — **no assets created or modified**.

Design reference: premium B2B SaaS, Stripe-level clarity/hierarchy/spacing (not visual cloning), restrained monochrome editorial language per existing brand.

---

## Global Findings

| ID | Severity | Tag | Finding |
|---|---|---|---|
| G-01 | **HIGH** | SYSTEMIC | Mobile layout is **single-column stack of desktop patterns** — no dedicated mobile section compositions (DEC-007 intent not yet met for page body). |
| G-02 | **HIGH** | SYSTEMIC | **~9.6–9.9k px** page height on phone — excessive scroll from repeated section padding (76px), full-width frames, and duplicated explanatory layers. |
| G-03 | **HIGH** | SYSTEMIC | **Product visuals routinely appear after long copy/card blocks** — user must scroll past headings, body, and auxiliary lists before seeing product UI. |
| G-04 | **MEDIUM** | SYSTEMIC | **Capability/hub/notes cards retain desktop card chrome** on narrow widths — contributes to “card soup” and vertical length. |
| G-05 | **MEDIUM** | SYSTEMIC | Typography uses responsive `clamp()` but **no distinct mobile type scale** — H1 consumes 111–149px height before product on common phones. |
| G-06 | **MEDIUM** | SYSTEMIC | Spacing tokens (`--section-y: 76px`, hero `64px 88px`, 44px inter-block gaps) are **desktop-calibrated reductions**, not a mobile rhythm system. |
| G-07 | **LOW** | SYSTEMIC | `<picture>` mobile crops exist for all product sections (760px breakpoint) — **asset pipeline is present** but composition/layout undermines legibility. |
| G-08 | **LOW** | SYSTEMIC | Horizontal overflow: **none detected** — technical responsiveness passes; visual quality does not. |

---

## Typography

**FACT (390×844, computed):**

| Role | Size | Line height | Notes |
|---|---|---|---|
| H1 (hero) | 34.4px | 37.2px | DE title wraps to **3 lines** (375+); **4 lines at 320** (~149px) |
| H2 (section) | 27.1px | 29.3px | Long DE compounds (e.g. Kundenkommunikation) wrap heavily |
| H3 (capability/notes) | 15.5px | 16.7px | Readable but dense inside cards |
| Eyebrow | 12.5px | 20px | OK |
| Hero body | 17.1px | 27.7px | ~358px measure at 390 (gutter 16px) |
| Section body | 16.1px | 26.6px | Similar measure |
| Muted/card body | 13.75px | 21.3px | Acceptable but at lower bound for product marketing |

**OBSERVATION:** `--gutter` drops to 16px (420px) and 20px (760px) — at 320px content measure ≈288px; acceptable but combined with card padding (20px) inner text measure ≈248px.

**RECOMMENDATION (P2.2):** Define a **mobile type scale** (hero H1 max size, section H2 step, minimum 14px for supporting copy) rather than per-section overrides.

---

## Spacing

**FACT (390×844):** `--section-y: 76px`; hero padding `64px 88px`; hero gap `44px`; capability grid gap `12px`; notes gap `22px`.

**OBSERVATION:** Each major section block measures **~1,120–1,400px** tall on mobile. Seven sections + hero + closing + footer ≈ **10 screens** on iPhone 14.

**OBSERVATION:** Hero **proof list** (3 hairline-separated rows) adds **~120px** after CTAs before the product frame begins.

**RECOMMENDATION (P2.2):** Introduce mobile spacing tokens (e.g. section 48–56px, hero tighter, reduce inter-list gaps) and **compress or relocate hero proof** on narrow viewports.

---

## Containers

**FACT:** Shared shell horizontal padding uses `--gutter` via `.hero`, `.section`, `.closing__inner`, `.masthead__inner`, `.sitefooter__inner`, and `.sitefooter__legal` (`padding-inline: var(--gutter)`; `max-width: var(--shell)`; centred with `margin-inline: auto`).

**OBSERVATION:** `.stage__panel` and `.frame` add **additional borders/shadows** inside already padded containers — not double gutter, but visual inset reduces usable image width to ~356px at 390 viewport.

**FACT:** At `@media (max-width: 760px)`, `.capability-grid` switches to `grid-template-columns: minmax(0, 1fr)` — **one column** at 320, 375, 390, 430, and 480. Above 760px the default is two columns.

**OBSERVATION:** At phone widths, four full-width capability cards stack vertically (~248px inner text measure at 320px with gutter 16px and card padding 20px) before the product visual — substantial vertical length, not a grid-column problem.

**RECOMMENDATION (P2.2):** Consider full-bleed product frames on mobile with gutter on copy only; capability compaction is a P2.4 composition task (see Section 02), not a one-column grid conversion.

---

## Cards

| Component | Mobile behaviour | Issue | Recommendation |
|---|---|---|---|
| `.capability` (×4, Platform) | 1-col stack ≤760px (CSS already single column) | Four full card surfaces before product visual; heavy chrome/padding | **HIGH** — simplify to compact rows/surfaces; reduce padding; reconsider placement vs product (P2.4) |
| `.flow__step` (×4, AI) | Stacked list | Long vertical run before screenshot | Simplify to compact steps (P2.5) |
| `.chain__link` (×3, Workflow) | Stacked with arrow pseudo | Adds band before screenshot | Consider inline summary (P2.5) |
| `.notes` / `.stage__notes` | Divided lists | Repetitive with section body | Reduce duplication (P2.4–P2.6) |
| `.hub__tile` (×6) | 2-col at 360–1024px; 1-col ≤359px | Hub metaphor lost; still six bordered tiles | Retain tiles but lighten chrome (P2.6) |

---

## Product Frames

**FACT:** Shared `.frame` — 1px border, radius, shadow; `.frame--flush` inside vehicle stage panel.

**OBSERVATION:** Frame chrome adds ~2px border + shadow on **every** screenshot — on mobile the chrome competes with already-small UI text inside images.

**OBSERVATION:** All frames render at **~356px width** on 390 viewport — consistent but monotonous.

**RECOMMENDATION (P2.2):** Mobile frame variant — reduced shadow, optional flush full-bleed, tighter radius; consider **shorter max-height** with scroll for dense UIs (workflow) as CSS-only fallback before new crops.

---

## Responsive Ordering

**FACT (390×844, all sections):** Mobile order is **copy → visual** for hero, platform, vehicle (head then panel), AI, workflow, communication, integrations (head then diagram).

| Section | Desktop | Mobile order | Assessment |
|---|---|---|---|
| Hero | Split | copy → visual | **Product below fold** — problematic |
| Platform | Head+grid / wide image | copy+cards → image | Long preamble |
| Vehicle | Panel: image | notes | head → **visual → notes** | Notes after image OK |
| AI | Mirror split | copy+flow+notes → image | **Very long** copy block |
| Workflow | Stack | head+chain → image | Repetitive |
| Communication | Split | copy+notes → image | Same pattern |
| Integrations | Hub | head → tile grid | Acceptable |

**RECOMMENDATION:** Selective **visual-first or interleaved** mobile order for hero and one mid-page section only where it aids comprehension — not global visual-first.

---

## Performance

**FACT:** Mobile WebP variants exist; hero preloaded eager; below-fold lazy. Mobile variant total ~252 KB across six crops (committed assets).

**OBSERVATION:** At 390px, rendered images use **mobile `<picture>` sources** when loaded (verified after scroll: all six sections serve `*-mobile.webp`).

**OBSERVATION:** Hero mobile asset 968×1104 encoded — displayed ~356×406; reasonable. Unified mobile crop displays **223px tall** — wide plan may be hard to read.

**OBSERVATION:** Logo PNG loaded at full intrinsic 1923×423 for hidden mobile-nav dialog markup — minor waste, not P2.1 scope for nav.

**RECOMMENDATION (P2.7):** Audit LCP on real Production throttling; hero image likely LCP — **first-viewport composition** affects perceived performance more than bytes here.

---

## Accessibility (page content)

**FACT:** Heading hierarchy intact; alt text on images; touch targets pass QA at 375px; reduced-motion handled.

**OBSERVATION:** Long vertical pages increase **scroll fatigue** for motor impairments — composition issue, not WCAG failure.

**OBSERVATION:** Decorative flow/chain diagrams are semantic lists — reading order matches DOM after stack.

**RECOMMENDATION:** Preserve semantics during P2 composition changes; re-test focus order if visual-first blocks introduced.

---

## Localization (DE / EN)

**FACT:** DE page ~274px taller than EN at 390×844 (9904 vs 9630 scroll height).

**OBSERVATION:** DE hero H1 **4 lines at 320** vs EN also 4 lines — both consume ~40% of 700px viewport before CTAs complete.

**OBSERVATION:** DE section titles (Kundenkommunikation, Workflow-Automatisierung) wrap to 3–4 lines; EN slightly shorter — layout tolerates both but DE feels denser.

**OBSERVATION:** DE compound nouns in capability card titles/body wrap across multiple lines inside full-width stacked cards at phone widths — section height differs from EN (~274px taller at 390×844).

**RECOMMENDATION:** Layout fixes must **tolerate longer DE strings** without truncation — prefer compaction, spacing, and placement changes over copy edits.

---

## Section 01 — Hero

**Scores:** hierarchy **2** · readability **3** · product clarity **2** · spacing **2** · density **2** · responsiveness **3** · polish **3**

| Type | Finding |
|---|---|
| FACT | First viewport (320×700 DE): masthead + eyebrow + H1 + body + CTAs + proof visible; **product frame top at 927px** — not visible. |
| FACT | 390×844: **~5%** of product frame visible; 430×932: **~45%** visible. |
| OBSERVATION | Reads as **marketing copy block**, then proof list, then product — not product-led mobile hero. |
| OBSERVATION | Mobile crop (`landing-hero-operations-mobile.webp`) is used correctly when loaded. |
| RECOMMENDATION | **HIGH / SYSTEMIC + SECTION:** Reduce hero preamble; move or shorten proof; bring product into first viewport on ≥375px; consider tighter hero padding (P2.3). |

**Screenshot evidence:** `qa/p21-audit/de-320x700-full.png`, `de-390x844-full.png`

---

## Section 02 — Platform (One system for the entire operation)

**Scores:** hierarchy **2** · readability **3** · product clarity **2** · spacing **2** · density **2** · responsiveness **3** · polish **3**

| Type | Finding |
|---|---|
| FACT | Section height ~**1360px** (DE, 390). |
| FACT | `@media (max-width: 760px)` sets `.capability-grid` to a **single column** — verified at 320–480px. |
| OBSERVATION | **Head + 4 stacked capability cards** precede full-width fleet plan screenshot — user reads ~600px of copy/cards before product. |
| OBSERVATION | Four full card surfaces in sequence create **card-soup vertical length and visual repetition** — the issue is stacked card chrome and placement, not a missing one-column breakpoint. |
| OBSERVATION | Unified mobile crop height **223px** — plan detail may be illegible (CSS presentation + crop). |
| RECOMMENDATION | **HIGH / P2.4:** Simplify capabilities into compact mobile rows/surfaces; reduce card chrome and padding; reconsider placement relative to product visual; evaluate **MANUAL PRODUCT ASSET** — tighter plan crop with fewer rows visible. |

**Screenshot evidence:** `qa/p21-audit/de-390x844-full.png` (platform region mid-page)

---

## Section 03 — Connected Vehicle Intelligence

**Scores:** hierarchy **3** · readability **3** · product clarity **3** · spacing **3** · density **2** · responsiveness **3** · polish **3**

| Type | Finding |
|---|---|
| FACT | Stage panel stacks **visual then notes** on mobile; mobile crop used (`landing-connected-vehicle-mobile.webp`). |
| OBSERVATION | Frame height **~487px** — largest mobile product block; vehicle rows readable at 356px width. |
| OBSERVATION | Three note blocks below image add scroll after strong visual — acceptable but lengthens section (~1345px). |
| RECOMMENDATION | **MEDIUM / P2.4:** Consider inline notes or collapsible summary; asset likely **works as-is (A)** with composition tweaks. |

---

## Section 04 — AI Orchestration

**Scores:** hierarchy **2** · readability **2** · product clarity **2** · spacing **2** · density **2** · responsiveness **3** · polish **3**

| Type | Finding |
|---|---|
| FACT | Section ~**1393px**; includes section head, **4 flow steps**, **governance notes list**, then screenshot. |
| OBSERVATION | Flow rail + notes **duplicate** the explanatory role of section body — desktop pattern stacked wholesale. |
| OBSERVATION | Mobile crop exists but chat UI text at 356px width is **marginally readable** — borderline for “communicates product.” |
| RECOMMENDATION | **HIGH / P2.5:** Compress flow representation for mobile; **MANUAL PRODUCT ASSET RECOMMENDED** — crop focusing on one exchange + sources panel. |

**Screenshot evidence:** `qa/p21-audit/de-430x932-full.png`

---

## Section 05 — Workflow Automation

**Scores:** hierarchy **2** · readability **2** · product clarity **2** · spacing **2** · density **2** · responsiveness **3** · polish **3**

| Type | Finding |
|---|---|
| FACT | Chain band (Trigger/Condition/Action) + full-width automation list screenshot (~**1224px** section). |
| OBSERVATION | Third full-width framed screenshot in sequence — **visual repetition fatigue**. |
| OBSERVATION | Automation table text in mobile crop likely **below readable threshold** at phone width. |
| RECOMMENDATION | **HIGH / P2.5:** **MANUAL PRODUCT ASSET RECOMMENDED** — single automation row/detail crop; simplify chain on mobile. |

---

## Section 06 — Connected Customer Communication

**Scores:** hierarchy **2** · readability **3** · product clarity **2** · spacing **2** · density **2** · responsiveness **3** · polish **3**

| Type | Finding |
|---|---|
| FACT | Split → copy + divided notes → conversation screenshot. |
| OBSERVATION | Similar composition to AI/workflow — **does not feel visually distinct** despite different content. |
| OBSERVATION | Thread + context sidebar in one mobile crop — **context panel text likely unreadable**. |
| RECOMMENDATION | **HIGH / P2.6:** **MANUAL PRODUCT ASSET RECOMMENDED** — thread-first vertical crop; reduce notes duplication. |

---

## Section 07 — Integrations & Extension

**Scores:** hierarchy **3** · readability **3** · product clarity **2** · spacing **3** · density **2** · responsiveness **3** · polish **3**

| Type | Finding |
|---|---|
| FACT | Hub diagram loses centre node and connectors at `@media (max-width: 1024px)`; becomes a **2-column tile grid** from 360–1024px and **single column** only at `@media (max-width: 359px)`. |
| OBSERVATION | Hub concept **weakens on phone** — reads as six more capability cards. |
| OBSERVATION | No product screenshot — diagram-only section; less affected by frame issues. |
| RECOMMENDATION | **MEDIUM / P2.6:** Simplify to list or compact icon row; optional single-hub visual for mobile — CSS/layout only unless Product supplies diagram asset. |

---

## Final CTA

**Scores:** hierarchy **3** · readability **3** · product clarity n/a · spacing **3** · density **3** · responsiveness **3** · polish **3**

| Type | Finding |
|---|---|
| OBSERVATION | Clear headline + primary/ghost actions; full-width buttons ≤420px. |
| OBSERVATION | **Third “demo” CTA pattern** after hero and mobile nav — acceptable but repetitive. |
| RECOMMENDATION | **LOW / P2.6:** Minor spacing polish only. |

---

## Footer

**Scores:** hierarchy **3** · readability **3** · spacing **3** · density **2** · responsiveness **3** · polish **3**

| Type | Finding |
|---|---|
| OBSERVATION | Stacks cleanly; anchor links usable; legal row compact. |
| OBSERVATION | Footer columns add **~200px+** after long page — acceptable closure. |
| RECOMMENDATION | **LOW / P2.6:** Touch target and grouping polish per task scope. |

---

## Product Visual Matrix

| Section | Asset (mobile) | Class | Rationale |
|---|---|---|---|
| Hero | `landing-hero-operations-mobile` | **B** | Crop OK; **layout** keeps product below fold |
| Platform | `landing-unified-operations-mobile` | **C** | Crop very wide/short at display size — plan detail hard to read |
| Vehicle | `landing-connected-vehicle-mobile` | **A** | List rows readable at phone width |
| AI | `landing-ai-orchestration-mobile` | **C** | **MANUAL PRODUCT ASSET RECOMMENDED** — focus on one Q&A + sources |
| Workflow | `landing-workflow-automation-mobile` | **C** | **MANUAL PRODUCT ASSET RECOMMENDED** — single automation detail |
| Communication | `landing-communications-mobile` | **C** | **MANUAL PRODUCT ASSET RECOMMENDED** — thread-first, drop sidebar |
| Integrations | (diagram, no screenshot) | n/a | Layout issue not asset |

Legend: **A** works as-is · **B** CSS/frame/sizing · **C** manual mobile crop recommended · **D** different visual (none identified)

---

## Manual Product Asset Request List

| Section | Current asset | Problem | CSS-fixable? | Manual asset needed? | Recommended crop/content |
|---|---|---|---|---|---|
| Hero | `landing-hero-operations-mobile` | Below-fold placement | **Partially** (layout) | **No** (crop OK) | N/A — fix composition first |
| Platform | `landing-unified-operations-mobile` | Plan illegible at 223px display height | Partially | **Maybe** | Tighter crop on active plan rows + larger text band; fewer columns |
| Vehicle | `landing-connected-vehicle-mobile` | None critical | Yes | **No** | — |
| AI | `landing-ai-orchestration-mobile` | Chat text marginal; busy panel | Limited | **Yes** | Single exchange, assistant answer, source chips visible |
| Workflow | `landing-workflow-automation-mobile` | Dense table/list | Limited | **Yes** | One automation with trigger/result visible |
| Communication | `landing-communications-mobile` | Thread + sidebar compressed | Limited | **Yes** | Conversation thread primary; minimal context strip |
| Integrations | n/a | Diagram not product screenshot | Yes (layout) | **No** | — |

**Count of manual product assets recommended: 3** (AI, Workflow, Communication) + **1 optional** (Platform if layout-only fix insufficient).

---

## Mobile Scorecard

| Section | Hier. | Read. | Product | Space | Density | Resp. | Polish | Brief |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Hero | 2 | 3 | 2 | 2 | 2 | 3 | 3 | Product not in first screen |
| Platform | 2 | 3 | 2 | 2 | 2 | 3 | 3 | Four stacked cards before screenshot |
| Vehicle | 3 | 3 | 3 | 3 | 2 | 3 | 3 | Strongest product section |
| AI | 2 | 2 | 2 | 2 | 2 | 3 | 3 | Duplicated explainer layers |
| Workflow | 2 | 2 | 2 | 2 | 2 | 3 | 3 | Third similar frame |
| Communication | 2 | 3 | 2 | 2 | 2 | 3 | 3 | Thread/context unreadable |
| Integrations | 3 | 3 | 2 | 3 | 2 | 3 | 3 | Hub metaphor lost |
| Final CTA | 3 | 3 | — | 3 | 3 | 3 | 3 | Adequate |
| Footer | 3 | 3 | — | 3 | 2 | 3 | 3 | Adequate |

---

## Systemic Findings (summary)

1. No mobile page composition system — only breakpoint collapse (**HIGH**).
2. Excessive vertical length / scroll burden (~10 mobile viewports) (**HIGH**).
3. Product visuals consistently deprioritized below copy and cards (**HIGH**).
4. Card chrome on capability/hub/notes surfaces — desktop padding/borders retained on mobile (**MEDIUM**).
5. Shared product frame treatment not optimized for phone (**MEDIUM**).
6. Spacing and typography tokens not mobile-first (**MEDIUM**).

---

## Section-Specific Findings (summary)

1. **Hero:** product below fold; proof list height (**HIGH**, P2.3).
2. **Platform:** four stacked capability cards before image; short plan crop (**HIGH**, P2.4).
3. **Vehicle:** notes lengthen section (**MEDIUM**, P2.4).
4. **AI:** flow + governance + image stack (**HIGH**, P2.5).
5. **Workflow:** chain + dense screenshot (**HIGH**, P2.5).
6. **Communication:** sidebar in crop (**HIGH**, P2.6).
7. **Integrations:** hub → tile grid (**MEDIUM**, P2.6).

---

## Finding counts

| Severity | Count |
|---|---|
| **CRITICAL** | **0** |
| **HIGH** | **10** |
| **MEDIUM** | **9** |
| **LOW** | **5** |

**Derivation (unique primary findings, deduplicated):** 3 global HIGH (G-01–G-03) + 5 section-tagged HIGH (Hero, Platform, AI, Workflow, Communication) + 1 Cards-table Platform row (same root cause as Platform section — counted once in dedupe, twice in headline total where cross-referenced) + 1 systemic product-deprioritization cross-cut = **10 HIGH** headline; **8** if Cards/Platform merged strictly. **MEDIUM:** G-04–G-06 (3) + Vehicle, Integrations, Product Frames section (3) + responsive-risk token/frame notes (3) = **9**. **LOW:** G-07–G-08 (2) + Final CTA + Footer (2) + responsive-risk picture breakpoint note (1) = **5**. Severity unchanged by P2.1.1 factual corrections — Platform remains **HIGH** with reframed diagnosis.

---

## Responsive Risk Map (desktop regression)

Changes in P2.2+ must isolate mobile rules to avoid affecting accepted desktop (1100–1920):

| Shared surface | Risk | Mitigation |
|---|---|---|
| `.hero`, `.section`, `.split`, `.brief`, `.stack`, `.stage`, `.hub` grid rules | **HIGH** | Mobile overrides inside `max-width` blocks only; do not alter desktop grid templates |
| `.section-title`, `.hero__copy h1` clamp formulae | **MEDIUM** | Add mobile-specific max values, not new global clamps |
| `:root` `--section-y`, `--gutter` | **MEDIUM** | Scope token changes to mobile media queries |
| `.frame` / `.capability` | **MEDIUM** | Introduce `.frame--mobile` / `.capability--compact` variants |
| `<picture>` breakpoints (760px) | **LOW** | Changing breakpoint affects tablet — test 768–1024 |
| `productFrame()` markup | **LOW** | Structural changes need build + QA both locales |

---

## Phase-2 Implementation Recommendation

Provisional map **validated** with one adjustment: **Vehicle** can share P2.4 with Platform (both operational product panels) rather than a separate phase.

| Phase | Scope | Rationale |
|---|---|---|
| **P2.2** | Global mobile layout system — type, spacing, containers, frame variant, card compaction primitives | Addresses G-01, G-05, G-06, frame chrome — **not** redundant capability one-column conversion (already in CSS at ≤760px) |
| **P2.3** | Hero — first-viewport product visibility, proof/CTA stack | Highest-impact single section |
| **P2.4** | Platform + Connected Vehicle — capability card compaction/placement, section order, plan/vehicle panels | Shared “operations” visual language |
| **P2.5** | AI Orchestration + Workflow — flow/chain simplification, manual crops | Dense UIs + manual assets |
| **P2.6** | Communication + Integrations + Final CTA/Footer polish | Remaining sections + footer |
| **P2.7** | Integration QA, accessibility, performance, DE/EN regression | Full matrix + Production smoke |
| **P2.8** | Production deployment | After gate pass |

---

## Open Issues / Blockers

| Item | Status |
|---|---|
| Manual product crops for AI, Workflow, Communication | **Blocked on Product/Fatih** — can proceed with CSS/layout in P2.2–P2.4 while assets prepared |
| Navigation changes | **Out of scope** — frozen |
| Production deployment | **Not in Phase 2.1** |

---

## Conclusion

The landing page is **technically responsive** but **not yet deliberately designed for mobile**. Phase 2 should treat mobile as an independent composition within the same static system (DEC-007), starting with global layout tokens (P2.2), then hero and product-dense sections, with **three manual mobile crops** recommended where CSS alone cannot make product UI legible.

**No website code, content, images, or Production configuration were changed in P2.1.**

---

## Screenshot evidence index (local, gitignored)

| File | Viewport | Locale | Primary use |
|---|---|---|---|
| `qa/p21-audit/de-320x700-full.png` | 320×700 | DE | Hero below-fold, H1 wrap |
| `qa/p21-audit/de-375x812-full.png` | 375×812 | DE | Baseline iPhone |
| `qa/p21-audit/de-390x844-full.png` | 390×844 | DE | Full-page reference |
| `qa/p21-audit/de-430x932-full.png` | 430×932 | DE | Large phone |
| `qa/p21-audit/de-768x1024-full.png` | 768×1024 | DE | Tablet transition |
| `qa/p21-audit/en-320x700-full.png` | 320×700 | EN | Localization |
| `qa/p21-audit/en-375x812-full.png` | 375×812 | EN | Localization |
| `qa/p21-audit/en-390x844-full.png` | 390×844 | EN | Full-page reference |
| `qa/p21-audit/en-430x932-full.png` | 430×932 | EN | Localization |
| `qa/p21-audit/en-768x1024-full.png` | 768×1024 | EN | Tablet |

Metrics: `qa/p21-audit/metrics.json` (gitignored).

---

*End of Phase 2.1 mobile experience baseline audit.*

**P2.1 audit commit:** `2b7753b`

---

## Post-review factual correction (P2.1.1)

**Date:** 2026-08-12  
**Scope:** Audit/documentation correction only — no implementation changes  
**Trigger:** External review of P2.1 factual accuracy

### Corrections applied

| Item | Incorrect in P2.1 | Corrected fact (verified in `src/styles.css`) |
|---|---|---|
| Platform capability grid | Claimed `.capability-grid` stayed **two-column on phones until ~760px** | `@media (max-width: 760px)` already sets `.capability-grid { grid-template-columns: minmax(0, 1fr) }` — **one column** at 320, 375, 390, 430, and 480 |
| Platform diagnosis | Framed as needing a one-column grid conversion | Reframed: **four full card surfaces stack vertically** before the product visual — vertical length, card chrome, and placement relative to product visual are the issues |
| Integration hub breakpoint | Stated “2-col ≤358px, 1-col ≤359px” | **360–1024px:** two-column hub tile layout (`@media (max-width: 1024px)`); **≤359px:** single column (`@media (max-width: 359px)`) |
| Container selector | Paraphrased as `.hero, .section, .closing` | Accurate shared shell: `.hero`, `.section`, `.closing__inner`, `.masthead__inner`, `.sitefooter__inner`, `.sitefooter__legal` |

### Sections updated

Containers, Cards table, Localization, Section 02 — Platform, Section 07 — Integrations, systemic/section summaries, Phase-2 implementation map (P2.2/P2.4), finding-count derivation.

### Severity and product visual impact

| Item | Change |
|---|---|
| Finding severities | **Unchanged** — CRITICAL **0**, HIGH **10**, MEDIUM **9**, LOW **5** |
| Platform severity | Remains **HIGH** with corrected root cause |
| Platform scorecard | Scores unchanged; brief updated to “four stacked cards before screenshot” |
| Product Visual Matrix | **Unchanged** — Platform remains class **C** (manual crop optional); no new manual assets added |
| P2.2–P2.8 map | Structure unchanged; P2.2/P2.4 no longer instruct redundant one-column capability conversion |

### Validation

- `git diff --name-only` — audit Markdown only
- No website build required (documentation-only correction)
- **No website code, content, images, navigation, or Production configuration changed**
- **Production not deployed**

**P2.1.1 correction commit:** *(recorded on commit)*
