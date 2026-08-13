# Public landing page — production implementation

**Date:** 2026-08-11 (original report); Phase-1 navigation updates through P1.5  
**Production URL:** <https://synqdrive.eu> (German), <https://synqdrive.eu/en/> (English)

> **Current Production (P1.6.1):** Sanitized static artefact — runtime unchanged from `c77dc76`; deployed **2026-08-12T14:46:48Z**  
> **Build commit deployed:** `feacb47` (filtered asset copy + dist verification)  
> **Previous P1.6 deploy:** **2026-08-12T12:58:22Z** — see [`docs/audits/landing-page-phase-1.6-production-deployment-2026-08.md`](audits/landing-page-phase-1.6-production-deployment-2026-08.md)  
> **Rollback:** `rollback/synqdrive.eu-pre-p1.6.1-20260812_144442.tar.gz` (local; gitignored) + [`rollback/README.md`](../rollback/README.md)

> **Note on paths.** This report was written while the site still lived inside the SynqDrive
> product repository, before it was extracted into this standalone repository. Paths such as
> `landingpage/tools/build-site.mjs` and `frontend/e2e/landing-page-qa.spec.ts` therefore refer to
> that repository. Here they are `tools/build-site.mjs` and `e2e/landing-page-qa.spec.ts`.
>
> **Historical:** An earlier product-repository screenshot capture harness
> (`landing-assets.capture.spec.ts`, `landing-demo-tenant.ts`) existed during initial build.
> That pipeline is **deprecated** as the current source-of-truth workflow. See DEC-006 and
> `assets/product/README.md`.

## Governance (P1.2)

**Normative:** `docs/DECISIONS.md` (Product Decisions)  
Agent instructions: `AGENTS.md`  
**Non-normative supporting records:** `docs/CHANGELOG.md`, `docs/audits/`

Approved phase plan: P1.1 audit → P1.2 governance → P1.3 desktop nav → P1.4 mobile nav → P1.5 integration QA → P1.6 deploy.

## Starting point

`synqdrive.eu` served a single-page German "coming soon" placeholder from Hostinger shared
hosting: `index.html`, `styles.css`, `script.js` and two images, 88 kB in total, with no source
in this repository. `app.synqdrive.eu` is a separate host (the VPS) and was not touched.

The product frontend (`frontend/`) is an authenticated Vite + React SPA served from
`backend/public`. It has no public marketing route, so the marketing surface was built as its
own artefact rather than bolted onto the product app.

## References and skills

- Seven reference images supplied with the brief, used for structure, information hierarchy,
  copy-to-visual ratio and section rhythm. Their placeholder dashboards were not used as assets.
- The brief names a Documentation Suite (Books I to IV) as the factual authority. **Those files do
  not exist in this repository** under any name, in any branch, or in git history; the only
  reference to them is the external "Synqdrive Code" workspace noted in
  `architecture/CLOUD_AGENTS_2026-06-30.md`. The available authority chain was used instead:
  the 222 records in `architecture/`, the Master Admin `SynqDrive Code` views
  (`ArchitekturView`, `HealthTrackingView`, `ChangesView`), the readiness audits and runbooks in
  `docs/`, and the shipped modules in `backend/src/modules` and `frontend/src/rental`.
- Every capability claim on the page is traceable to shipped code, and anything the audits mark
  as gated, shadow-mode or coming soon is either omitted or explicitly qualified. See
  "Capability claims" below.
- `.agents/skills/design-taste-frontend`, `.agents/skills/image-to-code`,
  `.agents/skills/minimalist-ui`, `.agents/skills/make-interfaces-feel-better` (product workspace).
  Dials: design variance 4, motion intensity 3, visual density 3.
  Canonical guidance for this repo: `AGENTS.md`, `.cursor/rules/landing-page.mdc`.
- Where `minimalist-ui` conflicted with the brand and the reference images (editorial serif,
  warm monochrome palette) the brand won. Its structural rules were kept: hairline 1px borders,
  near-zero shadows, black primary action, macro whitespace, reveal on scroll.

## Architecture

```
landingpage/
  content/site.mjs        one content model per locale, all copy and media references
  src/sections.mjs        section templates, one function per section
  src/primitives.mjs      productFrame, sectionHead, action, escaping
  src/styles.css          design language, responsive rules, motion
  src/script.js           progressive enhancement only
  src/icons.generated.mjs Lucide paths inlined by tools/build-icons.mjs
  tools/build-site.mjs    renders dist/index.html and dist/en/index.html
  tools/build-assets.mjs  crops and encodes the product screenshots
  assets/                 shipped WebP, fonts, favicon, logo
  rollback/               snapshot of the previous live site
```

The shipped artefact is static HTML, CSS and one ~11 kB script (mobile modal + desktop disclosure). Both locales render from the same
templates and the same content model, so they cannot drift. The page carries no framework
runtime, which is why the product's React components could not be reused directly; the visual
language, the brand tokens and the icon set are shared instead, and the icons are extracted from
the `lucide-react` dependency the product already uses.

### Sections

| # | Section | Composition | Product visual |
|---|---------|-------------|----------------|
| 01 | Hero | Text column beside an upright frame | Operations dashboard |
| 02 | One system for the entire operation | Header beside a 2x2 capability grid, full width frame below | Booking plan across the fleet |
| 03 | Connected vehicle intelligence | One composed panel holding frame and notes | Fleet list with condition and telemetry freshness |
| 04 | AI orchestration | Mirrored split, flow rail under the text | Assistant answers with named sources |
| 05 | Workflow automation | Stacked, chain band above a full width frame | Active automations with trigger, risk class, last run |
| 06 | Connected customer communication | Text column with notes beside a frame | Conversation beside its operational context |
| 07 | Integration and extension | Centred capability hub diagram | Hub diagram, no provider wall |

A closing call to action and a compact footer follow. Every composition differs on purpose, so
the page does not read as six repeated text-beside-screenshot rows.

### Navigation

**Desktop (P1.3, current):** Single top-level **Platform** disclosure with a grouped panel (~560px): overview row, three capability groups (Intelligence, Automation, Platform), six anchor links with descriptions, optional footer discover link. Right cluster: locale switch, Log in, Demo CTA. **Contact removed** from primary desktop nav.

**Mobile (P1.4 / P1.4.1):** Full-viewport modal navigation layer (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="mobile-nav-title"`). Structure: `.mobilenav__topbar` (brand + Close control) + `.mobilenav__scroll` (Platform links, Account, Language). Normal `.masthead__inner` sits underneath and is `inert` while open. Platform category expanded inline (six anchors from `flattenPlatformMenu()`). Modal behaviour: `inert` on `.masthead__inner`, `#main`, footer, skip link; explicit scroll-lock state (`scrollLockActive`); focus trap includes Close; Escape or Close returns focus to menu trigger.

**Ratified target IA (DEC-003):** Platform · Solutions · Resources · Pricing.

**Staged activation (DEC-004):**

| Category | Status |
|---|---|
| Platform — six homepage anchors | **Active** (desktop P1.3) |
| Solutions | **Deferred** until destination pages exist |
| Resources | **Deferred** until destination pages exist |
| Pricing | **Deferred** until destination page exists |
| Contact as primary top-level | **Removed** — CTA, footer, future Resources |

Platform anchors: `#platform`, `#vehicle-intelligence`, `#ai-orchestration`, `#workflow-automation`, `#communication`, `#integrations`.

Data model: `content/site.mjs` → `nav.platformMenu` (overview, groups[], footerLink), `nav.mobileNav` (account/language section labels), `nav.deferred` (labels only, not rendered), `flattenPlatformMenu()` for mobile link list.

Markup: `src/sections.mjs` → `header()`, `renderPlatformPanel()`, `renderMobileNav()`. Styles: `.nav-panel*` (desktop), `.mobilenav*` (mobile) in `src/styles.css`. Behaviour: `src/script.js` — desktop disclosure + mobile modal layer.

Breakpoint: desktop nav at `min-width: 1025px` (CSS `max-width: 1024px` for mobile). Verified 320–1024 mobile-only, 1100–1920 desktop-only, no collision at transition widths.

**Accessibility (DEC-010):** Disclosure buttons with normal links — no ARIA menu roles. Arrow-key menu navigation not required.

### Public static artefact policy (P1.6.1)

`dist/` must contain only files required by the public website. Repository governance and documentation stay in-repo only.

- **Build:** `tools/build-site.mjs` copies `assets/` via filtered recursive copy (`tools/public-artefact-policy.mjs`) — excludes `.md`, `README*`, hidden paths, and repository metadata.
- **Verification:** `npm run build` runs `tools/verify-dist-artefact.mjs` after generation; fails if forbidden files appear in `dist/`.
- **Rollback rule:** Before each Production deploy, keep a timestamped archive under `rollback/` (see `rollback/README.md`) or a verified package + manifest. Hostinger static deploy API exposes no file-level deployment-version restore for this vhost.

P1.6.1 removed `assets/product/README.md` from the public docroot (was leaked by blind recursive copy). Website runtime files (`index.html`, `script.js`, `styles.css`, images) unchanged from P1.6.

### Language

The product ships German and English, and the previous public site was German only, so German
stays at `/` as the canonical root and English is served from `/en/`, with `hreflang` alternates
and `x-default` pointing at German. No hardcoded second implementation: both pages are rendered
from `content/site.mjs`.

## Capability claims

Each claim on the page against the code that backs it, and what was deliberately left out.

| Claim on the page | Backed by | Note |
|---|---|---|
| One data model across rental, fleet, bookings, customers, billing | `backend/src/modules/{rental,fleet,booking,customer,billing}`, rental SPA | Rental module is Active |
| Connected vehicle data, trips, condition, warnings | DIMO integration, snapshot polling worker, trip detection V3, health modules | Shipped |
| Health systems: brakes, tires, battery, error codes, service, oil | `backend/src/modules` health services, `HealthTrackingView` | Shipped as distinct modules |
| Assistant answers grounded in operational data, with named sources | AI fleet chat orchestrator, structured JSON responses, audit logging | Shipped with guardrails |
| Automation runs with human approval | Workflow runtime, maker-checker, approval gates | Runtime is shadow-mode gated, so the copy claims approval rather than autonomous execution |
| Extraction is never applied before someone confirms | Document Intake V2 confirm-before-apply, plausibility blockers | Shipped |
| WhatsApp, email and in-app notifications share the customer record | Meta Cloud API, Resend, notification engine | Shipped |
| Voice assistant "being rolled out per organisation" | Six `voice-*` backend modules, control plane, ADRs, release runbook | **Qualified on purpose**: live PSTN is per-tenant flag-gated and staging-first |
| Open API, webhooks, per-organisation capabilities | Public API, webhook ingestion, org feature flags | Shipped |

Left off the page entirely: the Fleet Solution as a separate licensed product and Taxi Dispatch
(both not generally available), WooCommerce and Shopify (early context document only), and any
unified analytics or KPI product surface (contracts exist, product surface is partial). No metric,
percentage, uptime figure, customer name, logo or testimonial appears anywhere, because there is
no verifiable public source for any of them.

## Product images and privacy

**Current policy (DEC-006):** Product images are manually curated and committed under `assets/`.
See `assets/product/README.md`. Agents must not auto-sync from the Product Repository.

Images must show real SynqDrive product UI with no personal or customer data, no secrets, and
no fabricated dashboards.

`tools/build-assets.mjs` is an optional maintenance tool for re-encoding hand-prepared PNGs from
`assets-raw/` (gitignored). Crop coordinates document how existing assets were produced:

| Asset | Crop intent |
|-------|-------------|
| `landing-hero-operations` | Sidebar plus station summary, upright for the hero split |
| `landing-unified-operations` | The plan card only, without the empty filter row |
| `landing-connected-vehicle` | Vehicle list ending on a row boundary, all four condition states |
| `landing-ai-orchestration` | Two exchanges without the assistant sidebar |
| `landing-workflow-automation` | Workflow overview with counts and run results |
| `landing-communications` | Thread plus operational context, without the inbox list |
| `landing-social-card` | Fixed 1200x630 JPEG for sharing platforms |

Below 760px, product visuals switch through `<picture>` to `*-mobile.webp`. Width and height are
emitted on `<source>` and `<img>` for zero CLS.

### Historical note (deprecated workflow)

During initial build, visuals were captured via a product-repository harness against a synthetic
demo tenant, then cropped with `tools/build-assets.mjs`. That pipeline is no longer the
source-of-truth workflow. It is retained in git history and Phase 1.1 audit findings only.

## Responsive

Verified at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px in both locales: no horizontal
overflow, no clipped panels, headlines wrap cleanly, and every product visual stays readable.

Notable adjustments: the section 02 fleet plan runs full width rather than in a split; the
vehicle panel is never CSS-clipped because the asset already ends on a row boundary; the primary
action leaves the masthead below 480px, where it is still reachable in the drawer, the hero and
the closing section; section titles use a `clamp` low bound that fits German compound words such
as "Kundenkommunikation" at 320px.

## Accessibility

Semantic sectioning with one `h1` and no skipped heading level, skip link, visible focus states,
`aria-expanded` on the dropdown and drawer triggers, alt text on every image, touch targets at
32px or larger at 375px, and `prefers-reduced-motion` handled with a specificity that outweighs
the reveal state so the enter transform never applies at all. All landing-page sections, in-page
anchors, CTAs, and footer links remain readable without JavaScript. The reveal styles are scoped
to a `.js` class set inline in the head, with a timer that removes it again if `script.js` never
arrives. **Platform disclosure** (desktop dropdown) and the **mobile navigation modal** require
JavaScript;
without it, use in-page anchors, footer links, or the skip link. Closed dropdown panels use the
`inert` attribute so hidden links are removed from the tab order (P1.3.1).

## Performance

The shipped directory is 984 kB, but that counts every responsive variant. What a visitor
actually downloads, measured against production with the whole page scrolled so no lazy image is
missed:

| Viewport | Images | CSS | HTML | Fonts | JS | Total |
|----------|--------|-----|------|-------|-----|-------|
| Desktop 1440 | 337 kB | 35 kB | 33 kB | 24 kB | 11 kB | 440 kB |
| Mobile 390 | 230 kB | 35 kB | 33 kB | 24 kB | 11 kB | 333 kB |

No framework, no animation library, one ~11 kB script. The hero image is preloaded and eagerly
decoded, everything below the fold is lazy, and `srcset` means the narrow viewport pulls the
half-width variants rather than the desktop ones. Fonts are two self-hosted Manrope subsets,
preloaded. Cumulative layout shift measured under 0.1 because every image carries intrinsic
dimensions, including the `<source>` elements of the art-directed pair.

## SEO

Title, description, canonical, `hreflang` for both locales plus `x-default`, OpenGraph and
Twitter card with a fixed 1200x630 JPEG, favicon and apple touch icon, `robots.txt`,
`sitemap.xml` with locale alternates, and `Organization` structured data. No aggregate rating,
offer or review markup, because there is no verifiable public source for any of it. No invented
metric, customer name, logo or testimonial appears anywhere on the page.

## Tests

> **Historical (original product-repository import gate).** The table and narrative below record
> integration checks from when this site lived inside the SynqDrive product repository. They are
> **not** the current Phase-1 QA gate. Current QA in this repository: `npm run qa` (Chromium
> Playwright suite) and `npm run qa:webkit` (WebKit mobile-navigation smoke).

| Gate | Result |
|------|--------|
| `npx tsc -b` (frontend) | pass |
| `eslint` on the landing files | pass |
| `npm run lint` (frontend) | 16 pre-existing errors, all in `legal-documents` and `document-upload` files this branch does not touch |
| `npm test` (frontend) | 2235 pass, 7 pre-existing failures in `fleet-health-service`, unchanged by this branch |
| `npm run build` (frontend) | pass |
| `npm run landing:qa` | 11 pass, locally and against production |

The pre-existing failures are in files that are byte-identical to `main` on this branch
(`git diff --name-only origin/main...HEAD -- frontend/src` is empty), so they are not caused by
this work and are not masked by it.

`frontend/e2e/landing-page-qa.spec.ts` covers, per locale: metadata and canonical tags, heading
order, alt text and intrinsic dimensions on every image, internal anchors and external hosts,
lazy images resolving rather than 404ing, no element left at its pre-reveal opacity, console
errors, failed requests, horizontal overflow at nine widths, and touch target sizes. Plus the
dropdown by pointer and keyboard, the mobile navigation modal, the locale switch and cumulative layout
shift.

The screenshot step waits for every image to report `complete` with a non-zero `naturalWidth`
before the shutter. Without that it passed while emitting a misleading artefact: against a
deployed origin a lazy image could still be in flight and got captured as an empty frame, so a
correct page looked broken in the screenshot. A fixed settle delay was enough on localhost and
not over the network.

## Historical pre-Phase-1 production baseline

> **This section records the earlier Production deployment before current Phase-1 navigation work.**
> It is **NOT** the current release candidate. The current Phase-1 release candidate is **`c77dc76`**
> (P1.5 PASS — ready for P1.6). **P1.6 has not yet deployed that release candidate.** Live
> production at the time of writing still serves the pre–Phase-1 navigation baseline.

## Deployment (historical)

`synqdrive.eu` is a main vhost on Hostinger shared hosting (LiteSpeed, hPanel), docroot
`/home/u700268787/domains/synqdrive.eu/public_html`. It is not on the VPS, so the VPS release
script in `.cursor/scripts/cloud-agent-deploy.sh` does not apply and was not used.

```bash
node tools/build-assets.mjs   # optional: re-encode hand-prepared PNGs from assets-raw/
node tools/build-site.mjs     # writes dist/

# The archive must hold the files at top level, not nested inside a dist/ folder,
# because the deploy extracts it straight into the docroot.
cd landingpage/dist && tar -czf "/tmp/dist_$(date +%Y%m%d_%H%M%S).tar.gz" .
# then Hostinger hosting_deployStaticWebsite with domain synqdrive.eu and that path
```

DNS, nameservers, the HTTP to HTTPS redirect and the Let's Encrypt certificate were left
untouched. The deploy replaces the docroot: the two placeholder images now return 404, which
confirms it is a replacement rather than a merge.

The boundary held. After the deploy `https://app.synqdrive.eu/api/v1/health` returns
`{"status":"ok"}` with an uptime of roughly eleven days, which spans well before the deploy, so
the product process was never restarted and the VPS was never involved.

`www.synqdrive.eu` still answers 200 from the same docroot rather than redirecting to the apex.
That behaviour predates this work; duplicate content is handled by the canonical tag. Adding a
redirect would mean changing working hosting configuration and was left alone.

## Rollback (historical)

`landingpage/rollback/coming-soon-2026-08-11/` holds the complete previous site, captured from
production immediately before the deploy. Restoring it is the same operation as deploying:
archive that directory and push it to the `synqdrive.eu` vhost. Nothing else changed, so no DNS,
certificate or proxy state has to be reverted.

The snapshot is verifiably faithful, not just a scrape: `index.html`, `styles.css` and `script.js`
are byte-identical to the source of the coming-soon page on the unmerged branch
`cursor/professional-coming-soon-c50c`, which is where that page came from. The two brand assets
it references are included. See `architecture/PUBLIC_LANDING_PAGE_2026-08-11.md` for the merge
hazard between that branch and this one.

Commit deployed: `1415ea74`, the voice assistant copy correction. Later commits on this branch
touch only the QA suite and documentation and do not change the shipped artefact.

## Acceptance (historical — 11-test QA at commit `1415ea74`)

Checked live on <https://synqdrive.eu>: 200 on the apex and on `/en/`, `/en` redirecting 301 to
`/en/`, HTTP redirecting 301 to HTTPS, a Let's Encrypt certificate for `CN=synqdrive.eu` valid to
2026-10-30, `robots.txt` and `sitemap.xml` served with the right content types, and every asset
returning 200 with the correct MIME type including WebP, WOFF2 and JPEG.

The QA suite was then run against `https://synqdrive.eu` and passed all 11 tests, so the live
site has no console errors, no failed requests, no image 404s, no horizontal overflow at any of
the nine widths and cumulative layout shift under 0.1. The production desktop and mobile
screenshots are byte-identical to the locally approved build.

## Known remaining points

- **P1.6 / P1.6.1:** Production deployment, live acceptance, and artefact hygiene — **complete** (2026-08-12).
- **P2.1:** Mobile experience baseline audit — **complete** (2026-08-12).
- **P2.2:** Global mobile layout system — **merged to main** (PR #2, 2026-08-12).
- **P2.3:** Hero mobile composition — **merged to main** (PR #3, 2026-08-12).
- **P2.4:** Platform + Vehicle mobile composition — **implemented locally** (not deployed); see [`docs/audits/landing-page-phase-2.4-platform-vehicle-mobile-composition-2026-08.md`](audits/landing-page-phase-2.4-platform-vehicle-mobile-composition-2026-08.md).
- **Phase 2.5–2.8:** Remaining section-specific mobile composition — **pending**.
- Solutions, Resources, and Pricing top-level navigation remain deferred until real destination pages exist (DEC-004).
- Taxi & Mobility may become a future Solutions page; it does not imply generally available Taxi Dispatch (DEC-009).
- The product visuals are English on both locales. German screenshot variants deferred.
- Both calls to action open a prefilled mail draft to `info@synqdrive.eu`.
- `www.synqdrive.eu` redirects to apex (301 since P1.6 deploy); canonical tag handles duplicate content.

## Mobile layout system (P2.2 — merged to main)

**Audit:** [`docs/audits/landing-page-phase-2.2-global-mobile-layout-system-2026-08.md`](audits/landing-page-phase-2.2-global-mobile-layout-system-2026-08.md)

Phase 2.2 introduces a shared responsive foundation in `src/styles.css` without changing Phase-1 navigation or product image assets.

### Design tokens (`:root` + mobile breakpoints)

| Token group | Examples | Purpose |
|---|---|---|
| Typography | `--type-display`, `--type-section`, `--type-body`, `--type-small` | Coherent fluid scale; tighter caps ≤1024 / ≤760 |
| Measure | `--measure-copy`, `--measure-copy-narrow`, `--measure-section-head` | Body/headline line length |
| Spacing | `--space-xs` … `--space-xl`, `--stack-gap*`, `--stack-copy-visual` | Vertical rhythm between copy blocks |
| Frame | `--frame-radius`, `--frame-shadow`, `--frame-border` | Product frame mobile variant |
| Surface | `--surface-padding`, `--surface-radius` | Shared card/surface chrome |

### Breakpoint model (behaviour changes only)

| Range | Primary token shifts |
|---|---|
| ≤1180px | `--section-y: 104px` (existing) |
| ≤1024px | Fluid `--gutter`, `--section-y: 72px`, mobile type caps, layout stack gaps |
| ≤760px | `--section-y: 56px`, reduced surface padding, product frame full-bleed (`.frame--product`) |
| ≤420px | Full-width CTA grid (existing) |
| ≤359px | Hub single column (existing) |
| ≥1025px | Desktop defaults preserved |

### Layout primitives (markup)

- `.layout-split` + `.layout-split--copy-first` / `.layout-split--mobile-visual-first` — enables intentional mobile reorder without global visual-first (Hero, AI, Communication).
- `.layout-stack` — shared vertical stack gap (Platform brief, Workflow).
- `.layout-measure` / `.layout-measure--narrow` — copy width helpers.

### Surface primitives (CSS only in P2.2)

- `.surface` — full card
- `.surface--compact` — row-style divider surface (for P2.4+ capability conversion)
- `.surface--plain` — unwrapped stack content

### Product frame

- All `productFrame()` output includes `.frame--product`.
- At ≤760px, non-flush frames expand to viewport width via negative margin (copy retains gutter).
- Vehicle stage `.frame--flush` unchanged.

### QA

- Chromium: **41/41** (33 Phase-1 + 8 P2.2 structural tests)
- WebKit smoke: **2/2**
- P2.2 screenshots: `qa/p22-*` (gitignored)

## Hero mobile composition (P2.3 — merged to main, not deployed)

**Audit:** [`docs/audits/landing-page-phase-2.3-hero-mobile-composition-2026-08.md`](audits/landing-page-phase-2.3-hero-mobile-composition-2026-08.md)

P2.3 restructures Hero markup and CSS only — no navigation, asset, or downstream section changes.

### Composition

| Viewport | Order |
|---|---|
| Mobile (≤1024) | `.hero__intro` → `.hero__media` → `.hero__proof` (semantic DOM) |
| Desktop (≥1025) | Grid: intro + proof left column; product frame right column (visual equivalent to pre-P2.3) |

### Key CSS

- `.hero__intro` / `.hero__proof` / `.hero__media` grid placement preserves desktop split
- Tighter Hero padding at ≤1024 / ≤760 using P2.2 spacing tokens
- Compact proof list on phone (`13.5px`, reduced row padding)

### QA

- Chromium: **50/50**
- WebKit smoke: **2/2**
- H-01: **RESOLVED**
- Production: **NOT DEPLOYED**
- 390×844 DE frame top: **508px** (P2.2 **716px**)

## Platform + Vehicle mobile composition (P2.4 — local, not deployed)

**Audit:** [`docs/audits/landing-page-phase-2.4-platform-vehicle-mobile-composition-2026-08.md`](audits/landing-page-phase-2.4-platform-vehicle-mobile-composition-2026-08.md)

### Platform

| Viewport | Order |
|---|---|
| Mobile/tablet (≤1024) | `.brief__intro` → `.stack__media` → compact `.capability-grid` |
| Desktop (≥1025) | Grid: intro + 2×2 cards row 1; product frame row 2 |

Mobile capabilities use `.capability--compact` divider rows (0 full card surfaces at ≤1024).

### Vehicle

- Stage panel preserved; `.frame--flush` containment unchanged
- Mobile: tighter note padding/rhythm; lighter panel radius at ≤760px

### QA

- Chromium: **61/61**
- WebKit smoke: **2/2**
- 390×844 DE Platform frame distance: **284px** (was **962px**)
