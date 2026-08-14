# Public landing page — production implementation

**Date:** 2026-08-11 (original report); Phase-1 navigation updates through P1.5  
**Production URL:** <https://synqdrive.eu> (German), <https://synqdrive.eu/en/> (English)

> **Current Production:** Hero fleet background deployed **2026-08-14T12:44:46Z** (source `ff01212`, PR #15)
> **Prior deploy:** Einsatzwelten and hero hierarchy **2026-08-14T11:00:15Z** (source `f529f45`, PR #14)
> **Production runtime source SHA:** `ff01212b28ba417dfdae458ba12b4e95973cfcc8`
> **Release artefact SHA-256:** `8b0862336e592aaf7c5dd019a56a5e29bbb2fe2d7d3d7126a745fb112daee36d` (2,065,922 bytes)
> **Runtime fingerprints:** `styles.d065d81b865a.css`, `script.f02f7dcbd4a4.js`
> **Acceptance:** Pre-deploy Chromium **119/119** and WebKit **11/11**; live hero background assets and markup **PASS**
> **Mobile navigation:** PR #10, PR #11, and iOS interaction fixes **MERGED** and **DEPLOYED** — see [`docs/audits/landing-page-mobile-navigation-hierarchy-hotfix-2026-08.md`](audits/landing-page-mobile-navigation-hierarchy-hotfix-2026-08.md). **Real-iPhone acceptance remains owner-controlled.**
> **Post-release incident (E1–E2):** Real-device Mobile Safari unstyled presentation reported 2026-08-13 — see the [incident audit](audits/landing-page-mobile-safari-css-delivery-incident-2026-08.md) and [E2 deployment audit](audits/landing-page-mobile-safari-css-delivery-e2-production-2026-08.md). **Technical remediation deployed; real-iPhone acceptance remains owner-controlled.**
> **Rollback (local; not used):** prior Einsatzwelten release SHA-256 `843dc410718e5abf7b28384a8b8cb30598e0a2b1cac6ae79998352d90c431791`
> **Previous P1.6.1 deploy:** **2026-08-12T14:46:48Z** — see [`docs/audits/landing-page-phase-1.6.1-production-hygiene-2026-08.md`](audits/landing-page-phase-1.6.1-production-hygiene-2026-08.md)

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

**Mobile (hierarchy hotfix / DEC-011):** Full-viewport modal navigation layer (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="mobile-nav-title"`). The root view is a compact seven-row IA: Platform, Products, Industries, Integrations, Resources, Pricing, Login. Platform, Products, Industries, and Resources open second-level in-modal views; Platform children are hidden until selected. Integrations is the real `#integrations` anchor. Pricing and unreleased child destinations are non-link rows marked **In progress / In Arbeit**. Demo + sales/contact actions and the locale switch form a compact bottom area. Normal `.masthead__inner` sits underneath and is `inert` while open. Modal behaviour remains: `inert` on `.masthead__inner`, `#main`, footer, skip link; explicit scroll-lock state (`scrollLockActive`); focus trap includes Close; Escape or Close returns focus to the menu trigger; Back returns focus to the category trigger.

**Ratified target IA (DEC-003):** Platform · Solutions · Resources · Pricing.

**Staged activation (DEC-004 + mobile-only DEC-011 exception):**

| Category | Status |
|---|---|
| Platform — six homepage anchors | **Active** on desktop; seven-row Platform mobile subview includes the overview description as a second link to the same real section |
| Products | **Mobile IA visible**; Rental Operations links to `https://app.synqdrive.eu`; Fleet, Delivery, and Mobility Operations are non-link **In Arbeit** rows |
| Industries | **Mobile IA visible**; Car Rental marked available, other verticals marked **In Arbeit**; no fake routes |
| Integrations | **Mobile direct link** to real `#integrations`; unchanged inside desktop Platform |
| Resources | **Mobile IA visible** with real Product Overview, Contact, and Demo destinations |
| Pricing | **Mobile IA visible** as a non-link **In Arbeit** row; deferred on desktop |
| Contact as primary top-level | **Removed** — CTA, footer, future Resources |

Platform anchors: `#platform`, `#vehicle-intelligence`, `#ai-orchestration`, `#workflow-automation`, `#communication`, `#integrations`.

Data model: `content/site.mjs` → `nav.platformMenu` (overview, groups[], footerLink), `nav.mobileNav` (localized root categories, nested view items, status labels, sales action), `nav.deferred` (desktop labels only), `flattenPlatformMenu()` for the shared Platform capability source.

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
- **P2.3:** Hero mobile composition — **merged to main** (PR #3, 2026-08-12); included in Phase-2 Production release — see [`docs/audits/landing-page-phase-2.3-hero-mobile-composition-2026-08.md`](audits/landing-page-phase-2.3-hero-mobile-composition-2026-08.md).
- **P2.4:** Platform + Vehicle mobile composition — **merged to main** (PR #4, 2026-08-13); included in Phase-2 Production release — see [`docs/audits/landing-page-phase-2.4-platform-vehicle-mobile-composition-2026-08.md`](audits/landing-page-phase-2.4-platform-vehicle-mobile-composition-2026-08.md).
- **P2.5:** AI + Workflow mobile composition — **merged to main** (PR #5, 2026-08-13); included in Phase-2 Production release — see [`docs/audits/landing-page-phase-2.5-ai-workflow-mobile-composition-2026-08.md`](audits/landing-page-phase-2.5-ai-workflow-mobile-composition-2026-08.md).
- **P2.6:** Communication + Integrations + closing/footer mobile composition — **merged to main** (PR #6, 2026-08-13); included in Phase-2 Production release — see [`docs/audits/landing-page-phase-2.6-communication-integrations-closure-2026-08.md`](audits/landing-page-phase-2.6-communication-integrations-closure-2026-08.md).
- **P2.7 / P2.7.1:** Phase-2 integration QA & release-gate evidence — **complete** (2026-08-13); Chromium **100/100**, WebKit **2/2** on exact artefact.
- **P2.8A:** Pre-deployment freeze, rollback capture, release artefact verification — **PASS** (2026-08-13).
- **P2.8B:** Phase-2 Production deployment — **PASS** (2026-08-13); Phase 2 **live** on `synqdrive.eu`.
- **P2.8C:** Production acceptance — **PASS WITH INFRASTRUCTURE-LIMITED PRODUCTION TESTING** (2026-08-13); exhaustive Production replay stopped due Hostinger rate limiting; critical serial smoke **PASS**.
- **Phase 2 Production Accepted:** **YES** (P2.8C; pre-E1)
- **E1 / E1.1 / E1.2 / E2 (Mobile Safari CSS delivery):** Fingerprinting, recovery, fallback, WebKit guards, and deterministic packaging deployed in E2; technical Production gate **PASS**. Real-iPhone acceptance remains owner-controlled.
- **Mobile navigation hierarchy hotfix (PR #10 / DEC-011):** **merged to main** and **deployed to Production** (2026-08-14) — see [`docs/audits/landing-page-mobile-navigation-hierarchy-hotfix-2026-08.md`](audits/landing-page-mobile-navigation-hierarchy-hotfix-2026-08.md). Real-iPhone acceptance **pending owner test**.
- **Mobile navigation Products correction (PR #11) + iOS scroll/full-screen fixes:** **merged to main** and **deployed to Production** (2026-08-14T06:36:56Z, main `34cb029`) — Products submenu live; scroll-lock, phantom-close shield, and full-viewport menu retained.
- Desktop Solutions, Resources, and Pricing remain deferred (DEC-004). Mobile may preview planned IA as non-link **In Arbeit** rows under DEC-011; no dead routes.
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

## Hero mobile composition (P2.3 — merged to main; included in Phase-2 Production release)

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
- Included in Phase-2 Production release (P2.8B)
- 390×844 DE frame top: **508px** (P2.2 **716px**)

## Platform + Vehicle mobile composition (P2.4 — merged to main; included in Phase-2 Production release)

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

- Chromium: **62/62** (post-P2.4.2)
- WebKit smoke: **2/2**
- 390×844 DE Platform frame distance: **284px** (was **962px**)

## AI + Workflow mobile composition (P2.5 — merged to main; included in Phase-2 Production release)

**Audit:** [`docs/audits/landing-page-phase-2.5-ai-workflow-mobile-composition-2026-08.md`](audits/landing-page-phase-2.5-ai-workflow-mobile-composition-2026-08.md)

### AI Orchestration

| Viewport | Order |
|---|---|
| Mobile/tablet (≤1024) | `.split__intro` → `.split__media` → compact flow + governance (`.split__support`) |
| Desktop (≥1025) | Mirrored split: product left; intro + flow/governance right |

Mobile flow/governance use `.surface--compact` rows; desktop restores bordered flow rail.

### Workflow Automation

| Viewport | Order |
|---|---|
| Mobile/tablet (≤1024) | `.section-head` → compact chain → `.stack__media` |
| Desktop (≥1025) | Tiered stack with 3-column chain band (unchanged hierarchy) |

Mobile chain links use `.surface--compact` divider rows; desktop restores full chain cards.

### QA

- Chromium: **78/78**
- WebKit smoke: **2/2**
- H-03: **PARTIAL**; H-04: **PARTIAL**
- 390×844 DE AI frame top: **307.9px** (was **948px**)
- 390×844 DE Workflow frame top: **624.3px** (was **715.7px**)
- 390×844 DE page height: **8804px** (was **8975px**)

## Communication + Integrations + closing/footer (P2.6 — merged to main; included in Phase-2 Production release)

**Audit:** [`docs/audits/landing-page-phase-2.6-communication-integrations-closure-2026-08.md`](audits/landing-page-phase-2.6-communication-integrations-closure-2026-08.md)

### Customer Communication

| Viewport | Order |
|---|---|
| Mobile/tablet (≤1024) | `.split__intro` → `.split__media` → compact context notes (`.split__support`) |
| Desktop (≥1025) | Mirrored split: product left; intro + divided notes right |

### Integrations

| Viewport | Layout |
|---|---|
| Mobile/tablet (≤1024) | Visible `.hub__core` → six compact integration rows (0 full-card surfaces) |
| Desktop (≥1025) | Three-column hub diagram with centre SynqDrive node restored |

### Closing CTA / Footer

- Spacing and touch-target polish only — no redesign

### QA

- Chromium: **93/93**
- WebKit smoke: **2/2**
- H-05: **PARTIAL**; M-02: **RESOLVED**; L-01/L-02: **RESOLVED**
- 390×844 DE Communication frame top: **233.7px** (was **681.9px**)
- 390×844 DE page height: **8626px** (post-P2.5 **8804px**)

## Phase-2 integration QA (P2.7 — complete)

**Audit:** [`docs/audits/landing-page-phase-2.7-integration-qa-2026-08.md`](audits/landing-page-phase-2.7-integration-qa-2026-08.md)

### QA

- Chromium: **97/97**
- WebKit smoke: **2/2**
- Release candidate: **PASS WITH NON-BLOCKING LIMITATIONS**
- P2.8 ready: **YES** (confirmed after P2.7.1 release-gate evidence)
- 390 DE page height: **8626px**

### P2.7.1 release-gate evidence (2026-08-13)

- Chromium: **100/100** (+3 tests: CLS matrix, JavaScript-off DE/EN, anchor offset guard)
- `--section-y` 1179/1180/1181 boundary explicitly asserted
- CLS release matrix PASS (DE/EN × 390/768/1440)
- JavaScript-off DE/EN PASS; anchor offset PASS

---

## Phase 2 production release (P2.8 — deployed 2026-08-13)

**Audits:**

- [`docs/audits/landing-page-phase-2.8a-production-predeploy-2026-08.md`](audits/landing-page-phase-2.8a-production-predeploy-2026-08.md)
- [`docs/audits/landing-page-phase-2.8b-production-deployment-2026-08.md`](audits/landing-page-phase-2.8b-production-deployment-2026-08.md)
- [`docs/audits/landing-page-phase-2.8c-production-acceptance-2026-08.md`](audits/landing-page-phase-2.8c-production-acceptance-2026-08.md)

| Gate | Result |
|---|---|
| P2.8A pre-deploy freeze | **PASS** |
| P2.8B deployment | **PASS** |
| P2.8C acceptance | **PASS WITH INFRASTRUCTURE-LIMITED PRODUCTION TESTING** |
| Phase 2 Production Accepted (P2.8C historical gate) | **YES** |
| E1 / E1.1 remediation | **DEPLOYED IN E2** — technical gate PASS; real-iPhone acceptance owner-controlled |

Pre-deployment exact-artefact QA: Chromium **100/100**, WebKit **2/2**. Production exhaustive replay **not completed** (Hostinger rate limiting during parallel QA). Targeted serial Production smoke **PASS**.

**Post-release note (E1–E2):** A real-device Mobile Safari unstyled presentation incident was reported after P2.8 acceptance. The exact E1.2 artefact was deployed in E2 and controlled Chromium/WebKit Production checks passed. Final real-iPhone acceptance remains an owner test.

**Known non-blocking manual assets:** AI Class C, Workflow Class C, Communication Class C.
