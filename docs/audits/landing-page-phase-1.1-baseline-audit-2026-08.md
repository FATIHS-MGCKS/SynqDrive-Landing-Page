# SynqDrive Landing Page — Phase 1.1 Baseline Audit

**Audit type:** Preflight / baseline (read-only)  
**Scope:** Navigation architecture and governance groundwork for Phase 1.2–1.6  
**Repository:** https://github.com/FATIHS-MGCKS/SynqDrive-Landing-Page  
**Production:** https://synqdrive.eu (DE), https://synqdrive.eu/en/ (EN)  
**Audit date:** 2026-08-12  
**Auditor context:** Cloud Agent baseline pass after repository import; no code or deploy changes during audit.

---

## 1. Executive Summary

The SynqDrive landing page is a **static, single-page-per-locale marketing site** (German at `/`, English at `/en/`). Navigation is rendered at build time from `content/site.mjs` through `src/sections.mjs` → `header()`, styled in `src/styles.css`, and progressively enhanced in `src/script.js`.

**Facts — current navigation (production-equivalent build):**

- Desktop: one dropdown (**Plattform**, 4 anchor links) plus a top-level **Kontakt** link; right cluster with locale switch, login, and demo CTA.
- Mobile (≤1024px): desktop nav hidden; hamburger opens an inline drawer with a flat link list.
- Seven on-page sections have stable IDs; two sections (`#workflow-automation`, `#communication`) exist on the page but are **not linked from the header**.
- Playwright QA covers dropdown, drawer, locale switch, and anchor resolution (11 tests total when local server is running).

**Facts — gap vs. target IA (Phase 1.2+):**

Target desktop top-level: **Plattform · Lösungen · Ressourcen · Preise** (right: DE/EN · Anmelden · Demo anfragen). Of **17 planned nav destinations**, **7 have no existing route, anchor, or documented external URL** in this repository today. Implementing the full target IA without new pages, sections, or verified external URLs would violate the project's documented dead-link policy.

**Recommendation (not yet decided):** Phase 1.2 must resolve a route policy (defer, build, or external-link) for Lösungen (3), Ressourcen except Kontakt (3), and Preise (1) before markup/CSS work begins.

**This audit did not:** implement navigation, change product code, deploy, or install Taste/UI skills.

---

## 2. Current State

### Site architecture

| Property | Value | Source |
|---|---|---|
| Rendering | Static HTML/CSS/JS, no framework runtime | `tools/build-site.mjs`, `README.md` |
| Locales | `de` (canonical `/`), `en` (`/en/`) | `content/site.mjs` → `locales`, `defaultLocale` |
| Build output | `dist/index.html`, `dist/en/index.html`, copied assets | `tools/build-site.mjs` |
| JS role | Optional enhancement: dropdown, drawer, sticky hairline, scroll reveal | `src/script.js` (header comment) |
| Live parity | Prior import verified byte-identical HTML vs. production | Import PR validation (outside this audit file) |

### Page sections (DOM order)

| # | Section ID | DE title (representative) | In header nav today |
|---|---|---|---|
| — | (hero, no id) | Hero | No |
| 1 | `platform` | Ein System für den gesamten Betrieb | Yes (`Überblick`) |
| 2 | `vehicle-intelligence` | Vernetzte Fahrzeugintelligenz | Yes |
| 3 | `ai-orchestration` | KI, die mit Ihren operativen Daten arbeitet | Yes (as „KI und Automatisierung") |
| 4 | `workflow-automation` | Workflow-Automatisierung | **No** |
| 5 | `communication` | Vernetzte Kundenkommunikation | **No** |
| 6 | `integrations` | Offen, wo Ihr Betrieb es braucht | Yes |
| 7 | `contact` | Closing CTA | Yes (top-level „Kontakt") |

Section IDs are defined in `content/site.mjs` → `SECTION_IDS` and referenced by section templates in `src/sections.mjs`.

### Target IA (Phase 1.2+ specification — not implemented)

Desktop top-level:

- Plattform (dropdown, 6 items)
- Lösungen (dropdown, 3 items)
- Ressourcen (dropdown, 4 items)
- Preise (direct link, no dropdown)

Right cluster:

- DE / EN
- Anmelden
- Demo anfragen

Explicitly excluded from top-level in the brief: Module, Kontakt, Features, Integrationen, Unternehmen.

**Note:** „Integrationen" as a **top-level** item is excluded, but „Integrationen & Erweiterung" under **Plattform** is in the target spec.

---

## 3. Relevant Files, Components, and Functions

### Control map

| Layer | File | Functions / selectors / exports | Role |
|---|---|---|---|
| Content / i18n | `content/site.mjs` | `LINKS`, `SECTION_IDS`, `MEDIA`, `de`, `en`, `SITE`, `locales`, `defaultLocale` | All nav labels, hrefs, section IDs, locale metadata |
| Markup | `src/sections.mjs` | `header(c, other)` | Desktop nav, dropdown, drawer, action cluster |
| Markup | `src/sections.mjs` | `footer(c, site)` | Footer columns (separate link model) |
| Primitives | `src/primitives.mjs` | `esc()`, `action()`, `productFrame()`, `sectionHead()` | Escaping, CTAs, images |
| Icons | `src/icons.generated.mjs` | `icon(name)` | Nav icons: `chevron-down`, `menu`, `x`, `globe` |
| Styles | `src/styles.css` | `.masthead`, `.mainnav`, `.mainnav__group`, `.mainnav__menu`, `.drawer`, `.masthead__toggle`, `.locale-switch` | Layout, breakpoints, dropdown visibility |
| JS | `src/script.js` | IIFE blocks: sticky `[data-masthead]`, `[data-dropdown]`, `[data-nav-toggle]` / `[data-nav-panel]`, `[data-reveal]` | Interaction |
| Build | `tools/build-site.mjs` | `document(locale)`, `header(locale, other)` assembly | Writes `dist/**` |
| QA | `e2e/landing-page-qa.spec.ts` | `SECTION_IDS`, dropdown/drawer/locale tests | Regression gate |
| QA config | `e2e/playwright.landing-qa.config.ts` | `baseURL` default `http://127.0.0.1:4321` | Requires `npm run serve` |
| Docs | `README.md` | Quick start, layout, screenshot pipeline, deploy | Operator docs |
| Docs | `docs/IMPLEMENTATION.md` | Nav rationale, deferred items, capability matrix | Implementation report |
| Assets | `assets/` | 19 committed files (WebP, fonts, logo, favicon, social card) | Shipped imagery |
| Assets pipeline | `tools/build-assets.mjs` | `TARGETS[]` crop definitions | Raw → WebP (needs `assets-raw/`) |
| Rollback | `rollback/coming-soon-2026-08-11/` | Previous live site snapshot | Rollback only |

### Generated artefacts (not source of truth)

- `dist/` — build output (gitignored)
- `qa/` — Playwright screenshots (gitignored)
- `node_modules/` — dependencies (gitignored)
- `assets-raw/` — raw PNG captures (gitignored)

---

## 4. Current Desktop Navigation

### Visual structure (DE, viewport >1024px)

```
[Logo → /]  |  [Plattform ▾]  [Kontakt → #contact]  |  [🌐 EN]  [Anmelden]  [Demo anfragen]
```

Markup source: `src/sections.mjs` → `header()`, lines 31–54 (nav) and 56–81 (actions).

### Plattform dropdown items

Rendered from `c.nav.platformItems` (`content/site.mjs`):

| Label (DE) | Label (EN) | href | Target section |
|---|---|---|---|
| Überblick | Overview | `#platform` | `unified` section (`id="platform"`) |
| Vernetzte Fahrzeugintelligenz | Connected vehicle intelligence | `#vehicle-intelligence` | `vehicle` |
| KI und Automatisierung | AI and automation | `#ai-orchestration` | `ai` only |
| Integrationen | Integrations | `#integrations` | `integrations` |

### Dropdown implementation (facts)

| Aspect | Implementation | Location |
|---|---|---|
| Trigger | `<button type="button" class="mainnav__trigger" data-dropdown-trigger>` | `src/sections.mjs` |
| Menu container | `<ul class="mainnav__menu" id="platform-menu" data-dropdown-menu>` | `src/sections.mjs` |
| Open state | `data-open="true"` on `.mainnav__group[data-dropdown]` | `src/script.js` → `openDropdown()` |
| ARIA | `aria-expanded`, `aria-controls="platform-menu"` on trigger | `src/sections.mjs` |
| Open interaction | Click toggle only; outside click closes | `src/script.js` lines 53–56, 79–83 |
| Close on navigate | Click on menu `<a>` closes dropdown | `src/script.js` lines 63–65 |
| Escape | Closes open dropdown; refocuses trigger | `src/script.js` lines 68–75 |
| Hover | **Not used** (explicit design comment in JS) | `src/script.js` lines 51–52 |
| Panel styling | Absolute panel, `min-width: 272px`, opacity/transform transition | `src/styles.css` `.mainnav__menu` |

### Right cluster (facts)

| Element | Selector / class | href | Content source |
|---|---|---|---|
| Locale switch | `.locale-switch` | `other.dir` (`/en/` or `/`) | `c.meta.localeSwitchLabel`, shows `other.htmlLang.toUpperCase()` |
| Login | `.masthead__login` | `https://app.synqdrive.eu` | Hardcoded in template (not `SITE.links.app`) |
| Demo CTA | `.action--primary` via `action()` | `mailto:info@synqdrive.eu?subject=SynqDrive%20demo%20request` | Hardcoded in template |
| Hamburger | `.masthead__toggle` `[data-nav-toggle]` | hidden above 1024px | `display: none` until mobile breakpoint |

### Sticky masthead

- `position: sticky; top: 0; z-index: 50` — `.masthead` in `src/styles.css`
- Scroll hairline: `masthead.dataset.stuck = window.scrollY > 8` — `src/script.js` lines 17–22
- Anchor offset: `scroll-padding-top: calc(var(--masthead-h) + 20px)` — `src/styles.css` on `html`

---

## 5. Current Mobile Navigation

### Breakpoint (fact)

At `@media (max-width: 1024px)` (`src/styles.css` lines 1185–1206):

- `.mainnav { display: none; }`
- `.masthead__login, .locale-switch { display: none; }`
- `.masthead__toggle { display: inline-flex; }`
- `.masthead[data-nav-open='true'] .drawer { display: block; }`

### Header at mobile (typical 390px)

```
[Logo]                                    [Demo anfragen*]  [☰]
```

\*Demo CTA hidden from masthead at `@media (max-width: 480px)` — `.masthead__actions .action--primary { display: none; }` (`src/styles.css` lines 1315–1320). Demo remains in drawer, hero, and closing section (CSS comment).

### Drawer structure

Container: `<div class="drawer" id="mobile-nav" data-nav-panel hidden>` — `src/sections.mjs` lines 84–96.

| Block | Content |
|---|---|
| `.drawer__list` | Same `platformItems` links as desktop dropdown (flat `<ul>`) + `<li><a href="${c.nav.contactHref}">` (Kontakt) |
| `.drawer__actions` | Login (ghost action), Demo (primary), Locale link with full locale name |

### Drawer JS behaviour (facts)

| Behaviour | Implementation |
|---|---|
| Initial state | `navPanel.hidden = true`, `aria-expanded="false"` | `src/script.js` → `closeDrawer(false)` |
| Toggle | Sets `masthead.dataset.navOpen`, toggles `hidden`, updates `aria-expanded` and `aria-label` from `data-label-open` / `data-label-close` | `src/script.js` lines 102–112 |
| Close on link click | Any `<a>` inside drawer | `src/script.js` lines 114–116 |
| Escape | Closes drawer when open | `src/script.js` line 76 |
| Resize >1024px | Auto-close if open | `src/script.js` lines 119–121 |
| Overlay / scroll lock | **None** | No CSS or JS for backdrop or `overflow: hidden` on `body` |
| Focus trap | **None** | No focus-management beyond Escape on dropdown |

Drawer is **inline** below `.masthead__inner` (not a fixed overlay panel).

---

## 6. Desktop Problems (Observed)

All items below are **audit findings** from code/template review unless marked as recommendation.

| # | Finding | Evidence | Severity |
|---|---|---|---|
| D1 | **Incomplete Plattform coverage** — workflow and communication sections not in nav | Sections `#workflow-automation`, `#communication` in `src/sections.mjs`; absent from `nav.platformItems` in `content/site.mjs` | Medium |
| D2 | **Misleading combined link** — „KI und Automatisierung" points only to `#ai-orchestration` | DE label in `content/site.mjs` line 331; href `#ai-orchestration`; workflow section separate | Medium |
| D3 | **IA mismatch** — Kontakt is top-level; target places Kontakt under Ressourcen | `src/sections.mjs` line 53: `<a class="mainnav__link" href="${c.nav.contactHref}">` | Low (by design delta) |
| D4 | **Hardcoded external URLs in template** — drift risk vs. `SITE.links` | Login and mailto literals in `src/sections.mjs` lines 66–67, 90–91; `LINKS` exists in `content/site.mjs` | Low |
| D5 | **Incorrect nav `aria-label`** — labelled „Plattform" instead of main navigation | `<nav class="mainnav" aria-label="${esc(c.nav.platform)}">` — `src/sections.mjs` line 37; rendered in `dist/index.html` as `aria-label="Plattform"` | Medium (a11y) |
| D6 | **Dropdown UX below Stripe target** — plain link list, no descriptions or secondary hierarchy | `.mainnav__menu a` block links only — `src/styles.css` lines 274–287 | Low (design gap) |
| D7 | **Footer nav diverges from header** — separate column model | `footer()` uses `c.footer.links.platform` / `.company` — `content/site.mjs` lines 290–301 | Medium (future sync) |
| D8 | **Future width pressure** — four top-level items + three actions at `--shell: 1240px` not yet tested | `--shell: 1240px` in `src/styles.css`; only two nav elements today | Medium (risk for P1.4) |

---

## 7. Mobile Problems (Observed)

| # | Finding | Evidence | Severity |
|---|---|---|---|
| M1 | **Flat drawer list** — no grouping for future Plattform / Lösungen / Ressourcen | `.drawer__list` reuses flat `platformItems` — `src/sections.mjs` lines 85–88 | Medium |
| M2 | **No overlay or scroll lock** — page scrolls behind open drawer | Drawer is `display: block` expansion only — `src/styles.css` `.drawer` | Medium |
| M3 | **No focus trap** — keyboard users can tab outside drawer | No trap logic in `src/script.js` drawer block | Medium (a11y) |
| M4 | **Locale/login hidden from header bar** — only reachable via drawer below 1024px | CSS hides `.locale-switch`, `.masthead__login` at ≤1024px | Low (intentional, verify UX) |
| M5 | **Demo CTA disappears from masthead at ≤480px** | `src/styles.css` lines 1318–1319 | Low (mitigated by drawer/hero/closing) |
| M6 | **No accordion/sub-nav for multiple dropdowns** — future 13+ links in one list | Current drawer mirrors single dropdown list | Medium (future) |

---

## 8. Accessibility Findings

### Passing / implemented (facts, verified in code and QA)

| Check | Detail | Source |
|---|---|---|
| Skip link | `<a class="skip-link" href="#main">` | `tools/build-site.mjs` line 148 |
| Single h1 | QA asserts count = 1 | `e2e/landing-page-qa.spec.ts` line 122 |
| Heading order | No skipped levels — QA loop | `e2e/landing-page-qa.spec.ts` lines 127–135 |
| Focus visible | `:focus-visible { outline: 2px solid var(--brand); }` | `src/styles.css` lines 129–133 |
| Dropdown disclosure | `aria-expanded` toggled; Escape closes + refocuses trigger | `src/script.js` |
| Drawer disclosure | `aria-expanded`, `hidden` attribute, `aria-controls="mobile-nav"` | `src/sections.mjs`, `src/script.js` |
| Touch targets | QA: no interactive `<32px` height at 375px | `e2e/landing-page-qa.spec.ts` lines 243–258 |
| Reduced motion | Reveal disabled under `prefers-reduced-motion: reduce` | `src/styles.css` lines 1355–1378; `src/script.js` lines 11, 134–138 |
| No-JS fallback | Dropdown links in DOM; reveal safety net in `<head>` | `tools/build-site.mjs` inline script; `src/script.js` header comment |
| Image alt + dimensions | QA per-image checks | `e2e/landing-page-qa.spec.ts` lines 137–155 |

### Issues / gaps (findings)

| # | Issue | Evidence | WCAG / pattern |
|---|---|---|---|
| A1 | Nav landmark mislabelled | `aria-label="Plattform"` on main `<nav>` | Landmark naming |
| A2 | No `aria-haspopup` on dropdown trigger | Button lacks attribute | Disclosure pattern (recommended) |
| A3 | No arrow-key menu navigation | Only click, Tab, Escape | Keyboard (enhancement) |
| A4 | Drawer not modal | No `aria-modal="true"`, no focus trap | Mobile menu pattern |
| A5 | QA dropdown test DE-only | `getByRole('button', { name: /Plattform/ })` — line 266 | Test coverage gap |
| A6 | External link allowlist in QA | Only `https://app.synqdrive.eu` permitted for `http` links — lines 164–165 | Will fail if docs/trust URLs added without test update |

---

## 9. DE/EN and Content Model

### Architecture (facts)

- Single file: `content/site.mjs`
- Export: `locales = [de, en]`, `defaultLocale = de`
- German canonical at `/`; English at `/en/` with `hreflang` alternates emitted by `tools/build-site.mjs` → `hreflangTags()`
- Both locales rendered through identical templates in `src/sections.mjs` — structural drift prevented by shared functions

### Nav-related content keys (per locale object)

```text
nav.home
nav.openMenu / nav.closeMenu
nav.platform
nav.platformItems[]   → { label, href }
nav.contact
nav.contactHref
nav.login
nav.demo
meta.localeSwitchLabel
meta.localeName / meta.otherLocaleName
```

### LINKS constant (`content/site.mjs`)

| Key | Value | Used in nav? |
|---|---|---|
| `app` | `https://app.synqdrive.eu` | Login (hardcoded in template, not via `LINKS`) |
| `demo` | `mailto:info@synqdrive.eu?subject=SynqDrive%20demo%20request` | Demo (hardcoded in template) |
| `contact` | `mailto:info@synqdrive.eu` | Footer only |
| `email` | `info@synqdrive.eu` | Footer legal line |

**Fact:** No entries for documentation, help center, trust/security, or pricing.

### i18n inconsistency (finding)

| Location | Kontakt target |
|---|---|
| Header nav | `#contact` via `nav.contactHref` |
| Footer „Kontakt" | `mailto:info@synqdrive.eu` via `LINKS.contact` |

Both are valid reachable destinations; behaviour differs between header and footer.

---

## 10. Product-Image Rules and Locations

### Pipeline (facts)

| Step | Where | What |
|---|---|---|
| 1. Capture | **Product repository** (not this repo) | `npm run landing:capture` in product `frontend/` against demo tenant |
| 2. Handover | Manual copy | PNGs → `assets-raw/` in this repo |
| 3. Crop/encode | This repo | `npm run assets` → `node tools/build-assets.mjs` |
| 4. Ship | Committed | `assets/*.webp`, fonts, logo, favicon |

Documented in: `README.md` § „Product screenshots come from the product repository".

### Rules (facts)

| Rule | Location |
|---|---|
| All visuals are real product UI against synthetic demo tenant — no production data | `content/site.mjs` header comment; `README.md`; `docs/IMPLEMENTATION.md` § Screenshot sources |
| `assets/` committed; normal build needs neither product repo nor `assets-raw/` | `README.md`, `.gitignore` |
| `assets-raw/` gitignored | `.gitignore` |
| Mobile art direction at **760px** via `<picture>` | `src/primitives.mjs` → `productFrame()`, `media="(max-width: 760px)"` |
| Intrinsic dimensions on `<img>` and `<source>` for zero CLS | `src/primitives.mjs`; QA checks width/height attributes |
| Crop coordinates and rationale per asset | `tools/build-assets.mjs` → `TARGETS[]` |
| Media metadata (file names, dimensions, mobile variants) | `content/site.mjs` → `MEDIA` |
| Phone breakpoint legibility fix | Commit message `a0869c9` in imported history |

### Committed assets (fact — 19 files under `assets/`)

- `synqdrive-logo.png`, `favicon.png`, `landing-social-card.jpg`
- `fonts/manrope-latin.woff2`, `fonts/manrope-latin-ext.woff2`
- Six product visuals × (`*.webp`, `*-sm.webp`, `*-mobile.webp`)

**Audit note:** Navigation changes in Phase 1.2+ do not require asset pipeline changes unless new sections with new screenshots are added.

---

## 11. Agent / Cursor Rules (Present in Repository)

| Artefact | Status | Notes |
|---|---|---|
| `.cursor/rules/` | **Not present** | Glob search returned 0 files |
| `AGENTS.md` | **Not present** | |
| `.cursor/scripts/` | **Not present** in this repo | Referenced historically in `docs/IMPLEMENTATION.md` for product VPS deploy |
| De facto governance | **`docs/IMPLEMENTATION.md`**, **`README.md`** | Dead-link policy, capability claims, deploy boundary |

### Documented governance rules (facts from docs)

- No dead links in navigation (`docs/IMPLEMENTATION.md` lines 84–86, 276)
- Every capability claim must map to shipped product code
- No invented metrics, customer names, logos, or testimonials
- Deploy only to `synqdrive.eu` Hostinger vhost — never VPS / `app.synqdrive.eu` routing
- Pricing, Solutions, Resources were **explicitly deferred** at initial implementation

---

## 12. Taste / UI Skills (Present in Repository)

| Skill path (requested) | Status in **this** repository |
|---|---|
| `.agents/skills/make-interfaces-feel-better` | **Not present** |
| `.agents/skills/design-taste-frontend` | **Not present** (referenced only in `docs/IMPLEMENTATION.md`) |
| `.agents/skills/minimalist-ui` | **Not present** (referenced only in `docs/IMPLEMENTATION.md`) |
| `.agents/skills/image-to-code` | **Not present** (referenced only in `docs/IMPLEMENTATION.md`) |

**Fact:** `docs/IMPLEMENTATION.md` lines 37–42 records that these skills were used during **original build in the product repository**, with dials: design variance 4, motion intensity 3, visual density 3. They were **not imported** into `SynqDrive-Landing-Page`.

**Recommendation:** Before Phase 1.4 (visual dropdown work), copy or reference applicable skill files from the product repo, or add `.cursor/rules` documenting motion, density, and interaction standards for this repo.

**Audit action taken:** No skills installed or modified (per Phase 1.1 constraints).

---

## 13. Route / Anchor Matrix — Planned Navigation

Legend: ✅ exists today · ⚠️ section exists, nav entry missing · ❌ no route/anchor/URL in repo

### Plattform (target: 6 items)

| Target label (DE) | EN equivalent (existing or inferred) | Route / anchor | Status | Evidence |
|---|---|---|---|---|
| Plattform-Überblick | Overview | `#platform` | ✅ | `SECTION_IDS.platform`, nav item exists |
| Connected Vehicle Intelligence | Connected vehicle intelligence | `#vehicle-intelligence` | ✅ | Nav item exists |
| AI Orchestration | AI orchestration (split from current combined label) | `#ai-orchestration` | ✅ | Section exists; nav label currently combined |
| Workflow Automation | Workflow automation | `#workflow-automation` | ⚠️ | Section in `src/sections.mjs` → `workflow()`; not in `platformItems` |
| Kundenkommunikation | Connected customer communication | `#communication` | ⚠️ | Section in `src/sections.mjs` → `communication()`; not in nav |
| Integrationen & Erweiterung | Integrations (and extension) | `#integrations` | ✅ | Nav item „Integrationen" exists |

### Lösungen (target: 3 items)

| Target label (DE) | Route / anchor | Status | Evidence |
|---|---|---|---|
| Autovermietungen | — | ❌ | No section, page, or URL |
| Flottenbetreiber | — | ❌ | No section, page, or URL |
| Taxi & Mobilität | — | ❌ | Taxi Dispatch explicitly left off page — `docs/IMPLEMENTATION.md` line 111 |

### Ressourcen (target: 4 items)

| Target label (DE) | Route / anchor | Status | Evidence |
|---|---|---|---|
| Dokumentation | — | ❌ | Not in `LINKS`; no external URL in codebase |
| Help Center | — | ❌ | Not in `LINKS` |
| Trust & Security | — | ❌ | Not in `LINKS` |
| Kontakt | `#contact` and/or `mailto:info@synqdrive.eu` | ✅ | `nav.contactHref` → `#contact`; `LINKS.contact` → mailto |

### Preise + actions

| Target | Route | Status | Evidence |
|---|---|---|---|
| Preise | — | ❌ | Deferred — `docs/IMPLEMENTATION.md` lines 84–86, 276 |
| Anmelden | `https://app.synqdrive.eu` | ✅ | Login link in header |
| Demo anfragen | `mailto:info@synqdrive.eu?subject=SynqDrive%20demo%20request` | ✅ | Demo CTA |
| DE / EN | `/` ↔ `/en/` | ✅ | Locale switch |

### Summary counts (facts)

| Category | Total targets | ✅ | ⚠️ | ❌ |
|---|---|---|---|---|
| All planned nav destinations | 17 | 8 | 2 | 7 |

**Recommendation:** Do not ship nav hrefs for ❌ items until routes exist. Partial IA (Plattform-only expansion + Preise/Ressourcen/Lösungen deferred) is compatible with current dead-link policy.

---

## 14. Risks and Technical Dependencies

| ID | Risk | Type | Severity | Dependencies |
|---|---|---|---|---|
| R1 | Dead links if full target IA implemented naively | Policy / UX | **High** | Route decisions in P1.2; `docs/IMPLEMENTATION.md` policy |
| R2 | Taxi & Mobilität nav item contradicts product scope | Content | **High** | Product availability per `docs/IMPLEMENTATION.md` |
| R3 | Header horizontal overflow at 1025–1240px with 4 top-level + actions | CSS layout | Medium | `src/styles.css` `--shell`, `.masthead__inner` flex |
| R4 | QA regression when nav expands | Test | Medium | `e2e/landing-page-qa.spec.ts` — DE-only dropdown test, strict external URL check |
| R5 | Footer/header link drift | Content | Medium | Separate models: `nav.*` vs `footer.links.*` |
| R6 | Multi-dropdown JS — low refactor risk | JS | Low | `[data-dropdown]` already iterates all groups — `src/script.js` line 27 |
| R7 | Stripe-quality dropdowns need design spec | Design | Medium | Taste skills not in repo; no `.cursor/rules` |
| R8 | Single-page architecture limits Lösungen/Preise | Architecture | **High** | May require new HTML pages or new on-page sections |
| R9 | Deploy conflation with product | Ops | Medium | README deploy rules; separate Hostinger vhost |
| R10 | i18n manual sync for hierarchical nav | Process | Medium | `content/site.mjs` parallel `de`/`en` objects |

### Technical dependencies (facts)

| Dependency | Version / note | File |
|---|---|---|
| Node | `>=20` | `package.json` engines |
| Playwright | `^1.52.0` | `package.json` |
| Lucide icons | `^0.577.0` (generated into `src/icons.generated.mjs`) | `package.json`, `tools/build-icons.mjs` |
| Local QA server | Python `http.server` on port 4321 | `package.json` script `serve` |
| Build | No CSS bundler — plain CSS copy | `tools/build-site.mjs` |

---

## 15. Implementation Map — Phase 1.2 to 1.6

### Phase 1.2 — IA decisions and content model

**Goal:** Hierarchical nav data; resolved route policy for all ❌ targets.

| Task | File(s) | Output |
|---|---|---|
| Define route policy per ❌ item (defer / new section / new page / external URL) | `docs/IMPLEMENTATION.md` or new governance doc | Decision table signed off |
| Restructure `nav` from flat `platformItems[]` to `{ platform[], solutions[], resources[], pricing, actions }` | `content/site.mjs` | Typed nav model DE + EN |
| Add top-level labels: Lösungen, Ressourcen, Preise | `content/site.mjs` | i18n strings |
| Extend `LINKS` only with verified URLs | `content/site.mjs` | No placeholder hrefs |
| Align or document footer divergence | `content/site.mjs` | Footer sync plan |
| Split „KI und Automatisierung" into separate AI + Workflow entries | `content/site.mjs` | Points to `#ai-orchestration`, `#workflow-automation` |
| Add communication to Plattform dropdown | `content/site.mjs` | Points to `#communication` |

**Blocker gate:** No P1.3 until ❌ routes are decided or explicitly marked deferred/disabled in UI.

---

### Phase 1.3 — Header markup and template

**Goal:** Render target top-level structure without dead links.

| Task | File(s) |
|---|---|
| Refactor `header()` to render multiple `[data-dropdown]` groups from nav model | `src/sections.mjs` |
| Add Preise as direct link (only if route exists) or omit/disabled state | `src/sections.mjs` |
| Fix `<nav aria-label>` to locale-appropriate „Main navigation" / „Hauptnavigation" | `src/sections.mjs` |
| Replace hardcoded app/mailto URLs with `SITE.links` | `src/sections.mjs` |
| Unique menu IDs: `platform-menu`, `solutions-menu`, `resources-menu` | `src/sections.mjs` |
| Mobile drawer: grouped sections with headings per top-level category | `src/sections.mjs` |
| Optional: `aria-haspopup="true"` on dropdown triggers | `src/sections.mjs` |

---

### Phase 1.4 — CSS and Stripe-oriented dropdown quality

**Goal:** Few top-level items, clear hierarchy, no mega-menus.

| Task | File(s) |
|---|---|
| Layout for 4 top-level items + right action cluster within `--shell: 1240px` | `src/styles.css` |
| Dropdown panel hierarchy (title + optional description rows) | `src/styles.css`, possibly `src/sections.mjs` |
| Intermediate breakpoint tuning (1025–1180px) before mobile cutover | `src/styles.css` |
| Mobile drawer grouping styles; optional full-height panel | `src/styles.css` |
| Verify touch targets remain ≥32px after density changes | `src/styles.css`, QA |

**Design reference (recommendation):** Stripe-like clarity — not a visual copy. Apply motion/density guidance from product-repo Taste skills when available.

---

### Phase 1.5 — JS and accessibility hardening

**Goal:** Multi-dropdown, keyboard support, mobile a11y.

| Task | File(s) |
|---|---|
| Validate multi-instance `[data-dropdown]` (one open at a time already implemented) | `src/script.js` |
| Arrow-key navigation inside open disclosure menu | `src/script.js` |
| Drawer: `aria-modal="true"`, focus trap, body scroll lock | `src/script.js`, `src/sections.mjs` |
| Escape priority: drawer vs. dropdown | `src/script.js` |
| Preserve no-JS baseline (links remain in DOM) | `src/script.js` |

---

### Phase 1.6 — QA, documentation, build verification

**Goal:** Green QA; no dead links; updated governance.

| Task | File(s) |
|---|---|
| Dropdown tests for each menu; DE and EN | `e2e/landing-page-qa.spec.ts` |
| Mobile drawer grouped navigation tests | `e2e/landing-page-qa.spec.ts` |
| Anchor resolution for all nav hrefs | `e2e/landing-page-qa.spec.ts` |
| Extend external URL allowlist if docs/trust URLs added | `e2e/landing-page-qa.spec.ts` lines 164–165 |
| Update navigation section in implementation report | `docs/IMPLEMENTATION.md` |
| Optional: add `.cursor/rules/nav-governance.mdc` or `AGENTS.md` | new files |
| Run `npm run build` + `npm run serve` + `npm run qa` | CI/local gate |

---

## 16. Open Issues / Blockers

| ID | Issue | Type | Owner action needed |
|---|---|---|---|
| B1 | **7 of 17 planned nav targets have no route** | Blocker | Product/content decision before implementation |
| B2 | **Preise** — no pricing page or section | Blocker | Create page/section or defer nav item |
| B3 | **Lösungen (3)** — no industry-specific content | Blocker | New pages/sections or defer |
| B4 | **Ressourcen (3 of 4)** — no docs/help/trust URLs | Blocker | Confirm real URLs or defer |
| B5 | **Taxi & Mobilität** — product explicitly excluded from page | Blocker | Do not link without new content; contradicts `docs/IMPLEMENTATION.md` |
| B6 | **Taste/UI skills not in repo** | Open | Import or document interaction standards before P1.4 |
| B7 | **No `.cursor/rules` or `AGENTS.md`** | Open | Optional governance for future agents |
| B8 | **Footer vs. header link models diverge** | Open | Decide sync in P1.2 |
| B9 | **QA assumes single dropdown, DE labels** | Open | Update in P1.6 |
| B10 | **Kontakt: `#contact` vs. `mailto:` inconsistency** | Open | Pick canonical behaviour or document both intentionally |

---

## 17. Git Baseline at Audit Time

Captured immediately before this audit document was written (Phase 1.1 read-only pass):

```text
Branch:  main
Commit:  bfcb90ccb2d4834a1403910ae0ca5ce6d88ecdd5
Subject: Merge pull request #1: Import standalone SynqDrive landing page
Status:  clean working tree (nothing to commit)
```

Recent history at audit time:

```text
bfcb90c Merge pull request #1: Import standalone SynqDrive landing page
f19f496 Import standalone SynqDrive landing page (#1)
b877b00 Import standalone SynqDrive landing page history
8e9ee3c Initial commit
a0869c9 fix: make the phone breakpoint legible
```

---

## Appendix A — Breakpoints Reference

| Breakpoint | Nav-relevant effect | Source |
|---|---|---|
| `1180px` | Section spacing (`--section-y: 104px`) | `src/styles.css` line 1170 |
| **`1024px`** | **Desktop nav hidden; mobile drawer enabled** | `src/styles.css` line 1185 |
| `760px` | Product image art direction (`<picture>`) | `src/primitives.mjs` |
| `480px` | Demo CTA removed from masthead | `src/styles.css` line 1315 |
| `420px` | Reduced gutter; full-width actions in hero/closing | `src/styles.css` line 1332 |
| `359px` | Hub diagram single column | `src/styles.css` line 1323 |

## Appendix B — QA Test Inventory (11 tests)

| # | Test | Locale / viewport |
|---|---|---|
| 1–2 | Structure, links, metadata | de, en |
| 3–4 | No horizontal overflow (9 widths) | de, en |
| 5–6 | Touch targets ≥32px at 375px | de, en |
| 7 | Platform dropdown pointer + keyboard | de only (`/Plattform/`) |
| 8 | Mobile drawer open/navigate/close | 390px, de |
| 9 | Language switch | 1440px |
| 10 | CLS < 0.1 while images load | 1440px |
| 11 | Reference screenshots → `qa/` | de + en |

**Fact:** `npm run qa` requires `npm run serve` running separately (`README.md` quick start).

## Appendix C — Stripe IA Principle (target quality bar)

From Phase 1.1 brief — **recommendation for P1.4**, not current state:

- Few top-level items
- Clear categories
- High-quality dropdown interaction
- Strong visual hierarchy
- No overloaded mega-menus
- Not a visual copy of Stripe

Current implementation: single simple dropdown panel (`min-width: 272px`, link-only rows) — below this bar.

---

*End of Phase 1.1 baseline audit document.*
