# Changelog — SynqDrive Landing Page

**Non-normative.** This changelog is historical and informational. It records decisions and implementations but does **not** establish Product Decisions. Binding decisions live exclusively in `docs/DECISIONS.md`.

Meaningful website and product-marketing changes only. Not a Git commit mirror.

Format: newest first. Each entry may link to decisions or audit records for context.

---

## Einsatzwelten and hero hierarchy — Production deployment — 2026-08-14

**Scope:** Five fleet use cases plus German and English hero hierarchy refinement on `https://synqdrive.eu` (PR #14)

- Added the image-led Einsatzwelten section after the hero with five local WebP industry assets
- Added synchronized German and English use-case copy and four clearly scoped work-in-progress badges
- Split the hero H1 and subline into semantic spans with responsive typographic differentiation
- Preserved navigation, CTA targets, product visuals, runtime architecture, and reduced-motion behavior
- Exact artefact deployed via Hostinger static deploy; package SHA-256 `843dc410718e5abf7b28384a8b8cb30598e0a2b1cac6ae79998352d90c431791` (1,897,483 bytes)
- Runtime fingerprints: `styles.884ce095fb73.css`, `script.f02f7dcbd4a4.js`
- Pre-deploy exact-artefact QA: Chromium **119/119**, WebKit **11/11**
- Live German and English HTML, CSS, JavaScript, and all five industry images are byte-identical to the release artefact
- Broader Production replay was infrastructure-limited by transient empty provider responses; direct content checks, cross-breakpoint overflow checks, exact-byte verification, and `app.synqdrive.eu` isolation **PASS**
- Rollback artefact: `rollback/synqdrive.eu-pre-einsatzwelten-20260814_105923.tar.gz`, SHA-256 `b22e87737f2e7855d9135bcdf0251d93418ab8b8b366f2c3d52c45fd92d819a5`

---

## Hero typography refinement — Production deployment — 2026-08-14

**Scope:** German hero copy and typography refresh on `https://synqdrive.eu` (PR #13)

- Updated DE hero title and body; simplified hero eyebrow to plain text styling
- Hero H1 font-weight 600; mobile subheadline reduced at ≤760px
- EN hero copy, meta, navigation, product frame, and CTAs unchanged
- Exact artefact deployed via Hostinger static deploy; package SHA-256 `b22e87737f2e7855d9135bcdf0251d93418ab8b8b366f2c3d52c45fd92d819a5` (1,030,440 bytes)
- Runtime fingerprints: `styles.d9399b98f95d.css`, `script.f02f7dcbd4a4.js`
- Pre-deploy exact-artefact QA: Chromium **114/114**, WebKit **11/11**
- `app.synqdrive.eu` isolation **PASS**

---

## Hero copy simplification — Production deployment — 2026-08-14

**Scope:** German hero copy refresh and removal of hero proof list on `https://synqdrive.eu` (PR #12)

- Updated DE hero eyebrow, title, and body; removed three-item hero proof list
- EN hero copy, product frame, CTAs, alt text, and links unchanged
- Exact artefact deployed via Hostinger static deploy; package SHA-256 `bb7eb5ed6421a0051c9a75d91d061486bfb22e6f11ac36d6e562892c2dc47a19` (1,030,309 bytes)
- Runtime fingerprints: `styles.ae22ca0824d4.css`, `script.f02f7dcbd4a4.js`
- Pre-deploy exact-artefact QA: Chromium **114/114**, WebKit **11/11**
- `app.synqdrive.eu` isolation **PASS**

---

## Mobile navigation Products + iOS fixes Production deployment — 2026-08-14

**Scope:** Deploy PR #11 Products correction plus merged iOS scroll/full-screen mobile menu fixes to `https://synqdrive.eu`  
**Audit:** [`docs/audits/landing-page-mobile-navigation-hierarchy-hotfix-2026-08.md`](audits/landing-page-mobile-navigation-hierarchy-hotfix-2026-08.md)

- Combined release: PR #11 squash (`da72c6f`) + iOS interaction merge (`34cb029`)
- Exact artefact deployed via Hostinger static deploy; package SHA-256 `fa8751cc9bf892a8aa96b9f35b2bc12a013f5891b9c38767963424fa8a1426f5` (1,030,724 bytes)
- Runtime fingerprints: `styles.a434037ccad4.css`, `script.f02f7dcbd4a4.js`
- Pre-deploy exact-artefact QA: Chromium **114/114**, WebKit **11/11**
- Serial Production smoke **PASS** (DE/EN HTML, fingerprinted CSS/JS, `app.synqdrive.eu` health)
- Real-iPhone acceptance **pending owner test**

---

## Mobile navigation Products correction — 2026-08-14

**Scope:** Mobile navigation only — merged via PR #11; **deployed 2026-08-14**

- Renamed mobile root **Lösungen / Solutions** → **Produkte / Products**
- Replaced Solutions submenu with Products submenu (four product rows)
- Rental Operations links to `https://app.synqdrive.eu`; Fleet, Delivery, and Mobility Operations remain non-link **In Arbeit / In progress**

---

## Mobile navigation Production deployment — 2026-08-14

**Scope:** Deploy approved mobile navigation hotfix (PR #10 squash) to `https://synqdrive.eu`  
**Audit:** [`docs/audits/landing-page-mobile-navigation-hierarchy-hotfix-2026-08.md`](audits/landing-page-mobile-navigation-hierarchy-hotfix-2026-08.md)

- Exact artefact deployed via Hostinger static deploy; package SHA-256 `606ca121ab261765017a4923c2c933fd5769e659f6a686b66f0d4adbc4f1c2f4`
- No cache purge required; serial Production smoke **PASS**
- `app.synqdrive.eu` isolation **PASS**
- Real-iPhone acceptance **pending owner test**

---

## Mobile navigation hierarchy hotfix — 2026-08-13

**Scope:** Mobile navigation composition and IA only — merged via PR #10; **deployed 2026-08-14**

### Changed

- Replaced the permanently expanded Platform list with a compact seven-row root menu
- Added nested Platform, Solutions, Industries, and Resources views with internal Back navigation
- Exposed only real anchors/actions as links; unavailable destinations are non-link **In progress / In Arbeit** rows
- Replaced oversized Account/Language sections with a normal Login row, two-button bottom action area, and compact locale control
- Preserved modal focus trap, focus return, Escape, scroll lock, background `inert`, safe-area padding, and desktop Platform navigation
- Added DEC-011 to govern mobile IA previews without dead routes

### Scope boundaries

- Desktop navigation unchanged
- Landing sections and Product Images unchanged
- Safari fingerprinting, stylesheet recovery, catastrophic fallback, CSS sentinel, and intrinsic SVG protections retained
- Production untouched during hotfix development (Production deployment performed separately 2026-08-14)

### QA

- Build + deterministic package **PASS**
- Chromium **110/110 PASS**
- WebKit **11/11 PASS**

---

---

---

---

---

---

---

---

## E1.2 deterministic release packaging — 2026-08-13

**Scope:** Exact-artifact deploy gate — **NOT DEPLOYED**

### Changed

- **`tools/package-site.mjs`** — deterministic `synqdrive-landing-page.tar.gz` packaging (`tar --sort=name --mtime=@0 … | gzip -n`) plus archive contract verification
- **`package.json`** — `npm run package` invokes the wrapper

### Result

- Legacy non-deterministic archive SHAs **SUPERSEDED**
- Single frozen E2 artefact: **1,027,239 bytes**, SHA-256 `75cdd62cf817adc1027d23265044cbeab21a805f1b1c2afe2324b712fcdae55d`
- Runtime fingerprints unchanged: `styles.88323d36c46c.css`, `script.6e17f1c027e9.js`
- Chromium **107/107 PASS**, WebKit **10/10 PASS**

---

## E1.1 post-review delivery hardening — 2026-08-13

**Scope:** External review corrections on Draft PR #9 — **NOT DEPLOYED**

### Added

- Intrinsic `width="24" height="24"` on generated Lucide SVG roots
- Strengthened catastrophic fallback (`html`/`body` white canvas, `color-scheme: light`, bounded SVG, `.nav-panel[inert]{display:none}`)
- One-time primary CSS failure recovery via `/styles.css?v=<cssFingerprint>` (exactly once, no loop)
- WebKit forced-failure, dark-mode, and incident-signature regression guards
- Chromium primary-failure recovery and total-failure guards

### QA (local)

- Chromium **107/107 PASS**
- WebKit **10/10 PASS**

---

## Mobile Safari CSS delivery incident (E1) — 2026-08-13

**Incident:** Real iPhone Safari unstyled / partially styled Production presentation  
**Audit:** [`docs/audits/landing-page-mobile-safari-css-delivery-incident-2026-08.md`](audits/landing-page-mobile-safari-css-delivery-incident-2026-08.md)

### Result

- **E1:** PASS (local release candidate; **NOT DEPLOYED**)
- Root cause class: stylesheet delivery / cache-versioning failure (stable `/styles.css` architecture weakness)
- Remediation: fingerprinted CSS/JS, transitional aliases, catastrophic inline fallback, WebKit/Chromium guards

### Production status

- Production runtime unchanged (`92392d2` artefact still live)
- E2 controlled deploy pending external review

---

## Phase 2 production acceptance (P2.8C) — 2026-08-13

**Phase:** P2.8C — Production acceptance (infrastructure-limited)  
**Audit:** [`docs/audits/landing-page-phase-2.8c-production-acceptance-2026-08.md`](audits/landing-page-phase-2.8c-production-acceptance-2026-08.md)

### Result

- **P2.8C:** PASS WITH INFRASTRUCTURE-LIMITED PRODUCTION TESTING
- **Phase 2 Production Accepted:** YES
- Full Production Chromium replay: **ABORTED** (Hostinger rate limiting; first run 56/100 before stop)
- Critical serial Production smoke: **PASS**
- CRITICAL / HIGH runtime findings: **0**

### QA truth

- Pre-deploy exact artefact Chromium: **100/100**
- Pre-deploy exact artefact WebKit: **2/2**
- Production exhaustive replay: **NOT COMPLETED** (Hostinger rate limiting)
- Production critical acceptance: **PASS**

---

## Phase 2 production deployment (P2.8B) — 2026-08-13

**Phase:** P2.8B — Exact Phase-2 Production deployment  
**Audit:** [`docs/audits/landing-page-phase-2.8b-production-deployment-2026-08.md`](audits/landing-page-phase-2.8b-production-deployment-2026-08.md)

### Deployed

- Exact P2.8A artefact to `https://synqdrive.eu` via Hostinger static deploy
- Runtime source SHA: `92392d23ca9f12c4d18befdcd06c611a593dd3a9`
- Rollback not required

---

## Phase 2 pre-deployment freeze (P2.8A) — 2026-08-13

**Phase:** P2.8A — Pre-deployment freeze, rollback capture, release artefact verification  
**Audit:** [`docs/audits/landing-page-phase-2.8a-production-predeploy-2026-08.md`](audits/landing-page-phase-2.8a-production-predeploy-2026-08.md)

### Verified

- Release artefact SHA-256: `37abe53e1564542854b68ea57f1893c914645eb54ebc21f872680efc61326e09`
- Rollback archive SHA-256: `a767d61ce374af42e8219deee7ae55e7366843853dab533c5cc3ece842c2d8bc`
- P2.8B GO: **YES** (no deploy in P2.8A)

---

## Phase-2 integration QA (P2.7) — 2026-08-13

**Phase:** P2.7 — Full Phase-2 integration QA & release-candidate hardening (Draft PR; **not deployed**)  
**Audit:** [`docs/audits/landing-page-phase-2.7-integration-qa-2026-08.md`](audits/landing-page-phase-2.7-integration-qa-2026-08.md)

### Added

- P2.7 breakpoint boundary band tests (759–1181)
- Consolidated Phase-2 source ownership guard
- Full-page key metrics regression (390 DE)
- Full-page screenshot matrix (`qa/p27-full-*`)

### Result

- Release candidate decision: **PASS WITH NON-BLOCKING LIMITATIONS**
- P2.8 deployment readiness: **YES**
- No runtime/CSS changes required

### Verified

- Chromium **97/97**; WebKit **2/2**
- Build, dist hygiene, package verification — **PASS**
- 390 DE page height: **8626px**

### P2.7.1 release-gate evidence (2026-08-13)

- `--section-y` 1179/1180/1181 boundary assertions hardened
- CLS release matrix (DE/EN × 390/768/1440) — all **< 0.1**
- JavaScript-off DE/EN sanity test
- Platform anchor offset release guard (390 mobile + 1440 desktop)
- Chromium **100/100**; WebKit **2/2**; P2.8 ready **YES**

---

## Communication + Integrations + closing/footer (P2.6) — merged to main — 2026-08-13

**Phase:** P2.6 — Communication, Integrations hub, closing CTA, and footer mobile composition (**merged to main** via PR #6; **not deployed**)  
**Audit:** [`docs/audits/landing-page-phase-2.6-communication-integrations-closure-2026-08.md`](audits/landing-page-phase-2.6-communication-integrations-closure-2026-08.md)

### Changed

- Communication mobile order: intro → conversation product → compact context notes
- Communication notes: `.surface--compact` divider rows instead of divided note blocks
- Integrations mobile: visible SynqDrive hub core + six compact integration rows (not six full cards)
- Integrations desktop: three-column hub diagram preserved via grid placement
- Closing CTA and footer: spacing/touch-target polish

### Not changed

- Hero, navigation, Platform, Vehicle, AI, Workflow, product assets
- Production (`synqdrive.eu`)

### Verified (local)

- `npm run build` — pass
- Chromium QA **92/92**; WebKit smoke **2/2**
- H-05 **PARTIAL**; M-02 **RESOLVED**; L-01 **RESOLVED**; L-02 **RESOLVED**
- Communication frame top at 390 DE: **233.7px** (was **681.9px**)
- Page height at 390 DE: **8643px** (post-P2.5 **8804px**)

---

## AI + Workflow mobile composition (P2.5) — merged to main — 2026-08-13

**Phase:** P2.5 — AI Orchestration + Workflow Automation mobile composition (**merged to main** via PR #5; **not deployed**)  
**Audit:** [`docs/audits/landing-page-phase-2.5-ai-workflow-mobile-composition-2026-08.md`](audits/landing-page-phase-2.5-ai-workflow-mobile-composition-2026-08.md)

### Changed

- AI mobile order: intro → product visual → compact four-step flow → compact governance notes
- AI mobile flow/governance: `.surface--compact` divider rows instead of bordered rail + note blocks
- Workflow mobile chain: compact divider rows instead of three full cards; chevrons hidden ≤1024px

### Not changed

- Hero, navigation, Platform, Vehicle, Communication, Integrations, product assets, closing/footer
- Production (`synqdrive.eu`)

### Verified (local)

- `npm run build` — pass
- Chromium QA **78/78**; WebKit smoke **2/2**
- H-03 **PARTIAL**; H-04 **PARTIAL**
- AI frame top at 390 DE: **307.9px** (was **948px**)
- Workflow frame top at 390 DE: **624.3px** (was **715.7px**)
- Page height at 390 DE: **8804px** (was **8975px**)

---

## Platform + Vehicle mobile composition (P2.4) — merged to main — 2026-08-12

**Phase:** P2.4 — Platform + Connected Vehicle Intelligence mobile composition (**merged to main** via PR #4; **not deployed**)  
**Audit:** [`docs/audits/landing-page-phase-2.4-platform-vehicle-mobile-composition-2026-08.md`](audits/landing-page-phase-2.4-platform-vehicle-mobile-composition-2026-08.md)

### Changed

- Platform mobile order: intro → product visual → compact capability rows
- Platform mobile capabilities: divider rows instead of four full cards (≤1024px)
- Vehicle mobile: tighter stage notes and lighter panel chrome

### Not changed

- Hero, navigation, product assets, AI/Workflow/Communication/Integrations/closing/footer
- Production (`synqdrive.eu`)

### Verified (local)

- `npm run build` — pass
- Chromium QA **58/58**; WebKit smoke **2/2**
- H-02 **RESOLVED**; M-01 **PARTIAL**
- Platform section height at 390 DE: **1017px** (was **1264px**)

---

## Hero desktop spacing correction (P2.3.1) — 2026-08-12

**Phase:** P2.3.1 — Desktop Hero intro → proof spacing correction (Draft PR #3; **not deployed**)

### Fixed

- Desktop Hero double spacing (~92px) between intro and proof — restored single owner via `column-gap: 56px; row-gap: 0;` with proof `margin-top: var(--stack-gap-loose)`

### Not changed

- P2.3 mobile Hero composition, navigation, assets, other sections, Production

### Verified (local)

- Chromium **50/50**; WebKit **2/2**
- Desktop intro → proof: **36px** at 1100–1920

---

## Hero mobile composition (P2.3) — 2026-08-12

**Phase:** P2.3 — Hero mobile composition (local only; **not deployed**)  
**Audit:** [`docs/audits/landing-page-phase-2.3-hero-mobile-composition-2026-08.md`](audits/landing-page-phase-2.3-hero-mobile-composition-2026-08.md)

### Changed

- Hero mobile source order: intro → product visual → proof (semantic DOM reorder)
- Desktop Hero grid preserves left-copy / right-product layout
- Tighter Hero padding and compact proof typography on phone

### Not changed

- Phase-1 navigation, product image assets, copy text, other sections
- Production (`synqdrive.eu`)

### Verified (local)

- `npm run build` — pass
- Chromium QA **50/50**; WebKit smoke **2/2**
- H-01 **RESOLVED**; G-02/G-03/M-03 improved in Hero only (global **PARTIAL**)
- 390×844 DE Hero frame top: **508px** (P2.2 **716px**)

---

## Global mobile layout system (P2.2) — 2026-08-12

**Phase:** P2.2 — Global mobile layout system (local only; **not deployed**)  
**Audit:** [`docs/audits/landing-page-phase-2.2-global-mobile-layout-system-2026-08.md`](audits/landing-page-phase-2.2-global-mobile-layout-system-2026-08.md)

### Added

- Shared mobile typography, spacing, measure, frame, and surface tokens in `src/styles.css`
- Layout primitives: `.layout-split`, `.layout-stack`, `.layout-measure`
- Surface variants: `.surface`, `.surface--compact`, `.surface--plain`
- Product frame class `.frame--product` with mobile full-bleed presentation (≤760px)
- P2.2 structural QA tests (overflow, gutter range, frame width, CTA height, desktop regression)

### Changed

- Section vertical padding reduced on phone/tablet (`--section-y`: 76→56px at ≤760px)
- Fluid gutter replaces stepped 16/20px overrides
- Hero/section typography uses tokenized scale with tighter mobile caps
- Card/surface padding reduced systemically on phone (`--surface-padding`: 20→16px)
- Footer interactive targets increased to 44px min-height

### Not changed

- Phase-1 navigation (desktop + mobile modal)
- Product image files and crops
- Section-specific composition (hero proof, capability placement, AI flow) — deferred P2.3–P2.6
- Production (`synqdrive.eu`)

### Verified (local)

- `npm run build` — pass
- Chromium QA **37/37**; WebKit smoke **2/2**
- DE page height at 390×844: **9455px** (P2.1 baseline **9904px**)
- Hero product frame width at 390px: **390px** (P2.1 **358px**)

---

## Production artefact hygiene (P1.6.1) — 2026-08-12

**Phase:** P1.6.1 — Production hygiene & rollback hardening  
**Audit:** [`docs/audits/landing-page-phase-1.6.1-production-hygiene-2026-08.md`](audits/landing-page-phase-1.6.1-production-hygiene-2026-08.md)

### Fixed

- Build no longer copies repository Markdown (`assets/product/README.md`) into public `dist/`
- Filtered asset copy + post-build `verify-dist-artefact` guard
- Rollback governance documented (`rollback/README.md` + pre-P1.6.1 archive)

### Deployed

- Sanitized static package redeployed to `https://synqdrive.eu` (build commit **`feacb47`**)
- No intended visual, navigation, or runtime behaviour change

### Verified

- `https://synqdrive.eu/assets/product/README.md` → **404**
- Production QA: 33 Chromium + 2 WebKit smoke — pass (rate-limit retry as in P1.6)
- `app.synqdrive.eu` health unaffected

---

## Phase 1 production deployment (P1.6) — 2026-08-12

**Phase:** P1.6 — Production deployment & live acceptance  
**Audit:** [`docs/audits/landing-page-phase-1.6-production-deployment-2026-08.md`](audits/landing-page-phase-1.6-production-deployment-2026-08.md)

### Deployed

- Phase-1 desktop Platform disclosure navigation (P1.3 / P1.3.1)
- Phase-1 mobile modal navigation (P1.4 / P1.4.1)
- Runtime release candidate **`c77dc76`** to `https://synqdrive.eu` (build from repository HEAD **`ff235ea`**)

### Production acceptance

- Local QA: 33 Chromium + 2 WebKit — pass
- Production QA: 33 Chromium + 2 WebKit smoke — pass (6 Chromium tests retried after Hostinger rate-limit cooldown)
- Product application isolation verified — no VPS/product impact

### Not changed (explicit)

- Product application / `app.synqdrive.eu`
- DNS (except incidental `www` redirect behaviour noted in audit)
- Landing-page sections, product images, deferred IA categories

---

## Release documentation consistency (P1.5.1) — 2026-08-12

**Phase:** P1.5.1 — Post-review documentation alignment  
**Scope:** Documentation only — no runtime, CSS, JS, test, or deployment changes.

### Corrected

- README script size (~11 kB), JavaScript/no-JS wording, QA command descriptions (removed hardcoded "11 checks")
- README phase status (P1.3/P1.4 implemented; Platform only active category)
- `docs/IMPLEMENTATION.md` current-state marker (`c77dc76`, P1.5 ready, P1.6 not deployed)
- Historical pre-Phase-1 production baseline clearly labelled (commit `1415ea74`, original 11-test QA)
- Known remaining points updated (P1.4 complete; P1.6 and Phase 2 pending)

### Unchanged

- Technical P1.5 PASS result
- Shipped behaviour and release candidate `c77dc76`
- No Production deployment

---

## Production readiness gate (P1.5) — 2026-08-12

**Phase:** P1.5 — Integration audit & production readiness  
**Audit:** [`docs/audits/landing-page-phase-1.5-production-readiness-2026-08.md`](audits/landing-page-phase-1.5-production-readiness-2026-08.md)

### Result

**PASS** — Ready for P1.6 production deployment (deployment not performed in P1.5).

### Minor corrections during gate

- Scroll-lock drift safeguard when `pendingScrollY` stale after pointer interaction
- Documentation accuracy (AGENTS.md QA commands, IMPLEMENTATION.md script size)
- P1.5 release-candidate screenshot test (33 Chromium tests total)

---

## Mobile modal semantics fix (P1.4.1) — 2026-08-12

**Phase:** P1.4.1 — Mobile modal focus boundary & Safari hardening  
**Audit addendum:** [`docs/audits/landing-page-phase-1.4-mobile-navigation-2026-08.md`](audits/landing-page-phase-1.4-mobile-navigation-2026-08.md) (Post-review section)

### Fixed

- Modal top bar (brand + Close) moved inside `#mobile-nav` dialog boundary
- Close control included in focus trap; Shift+Tab from first link reaches Close
- `.masthead__inner` inert while modal open (header controls blocked)
- Idempotent scroll-lock lifecycle (`scrollLockActive`; no spurious init scroll restore)

### Added

- Deep-link, landscape reachability, breakpoint-edge, resize, touch-target, WebKit smoke tests

### Not changed (explicit)

- P1.4 IA, visual design, 1024px breakpoint
- Desktop P1.3 navigation
- Production deployment

---

## Mobile navigation rebuild (P1.4) — 2026-08-12

**Phase:** P1.4 — Mobile navigation  
**Audit:** [`docs/audits/landing-page-phase-1.4-mobile-navigation-2026-08.md`](audits/landing-page-phase-1.4-mobile-navigation-2026-08.md)

### Implemented

- Deliberate mobile navigation layer replacing the pre-P1.4 flat drawer
- Modal dialog semantics (`role="dialog"`, `aria-modal="true"`) with background `inert`, scroll lock, focus trap, Escape close
- Platform category expanded inline (Option B — single active category, no unnecessary accordion)
- Shared data: `nav.platformMenu` + `flattenPlatformMenu()`; `nav.mobileNav` labels only
- Account actions and locale switch inside navigation; Demo CTA in header hidden ≤480px
- P1.4 mobile QA tests and screenshot matrix (portrait + landscape)

### Not changed (explicit)

- Desktop P1.3 navigation (regression tested)
- Landing-page sections, product images
- Solutions, Resources, Pricing (deferred)
- Production deployment

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
