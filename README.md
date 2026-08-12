# SynqDrive Landing Page

The public marketing site for SynqDrive, live at **<https://synqdrive.eu>** (German) and
**<https://synqdrive.eu/en/>** (English).

Static HTML, CSS and one 6 kB progressive-enhancement script. No framework runtime, no API calls,
no tracking. The site cannot reach tenant data, which is why it is kept out of the product
repository and away from the product's deployment path.

## Quick start

```bash
npm install
npx playwright install chromium   # once, for the QA suite
npm run build      # renders dist/
npm run serve      # serves dist/ on http://127.0.0.1:4321
npm run qa         # 11 QA checks against the local build (needs serve running)
```

`npm run assets` additionally needs `ffmpeg` on the PATH. A plain build does not.

## Layout

```
AGENTS.md               Agent operating instructions (read first)
content/site.mjs        One content model per locale. All copy, links and media references.
src/sections.mjs        One template function per section.
src/primitives.mjs      productFrame, sectionHead, action, icon, HTML escaping.
src/styles.css          Design language, responsive rules, motion.
src/script.js           Progressive enhancement only. The page is complete without it.
src/icons.generated.mjs Lucide paths, generated. Do not edit by hand.
tools/build-site.mjs    Renders dist/, robots.txt and sitemap.xml for both locales.
tools/build-assets.mjs  Optional local re-encode from assets-raw/ (manual maintenance only).
tools/build-icons.mjs   Regenerates src/icons.generated.mjs from lucide-react.
assets/                 Shipped imagery, fonts, favicon, logo.
assets/product/         Product image policy (documentation).
docs/DECISIONS.md       Binding website and IA decisions.
docs/CHANGELOG.md       Meaningful website change log.
docs/IMPLEMENTATION.md  Full implementation report.
docs/audits/            Phase audit records.
rollback/               Snapshot of the previous live site.
e2e/                    Playwright QA suite for the built output.
```

Both locales render from the same templates and the same content model, so they cannot drift.
German is canonical at `/`, English at `/en/`, with `hreflang` alternates and `x-default` on
German.

## Governance

Read `AGENTS.md` before making changes. Binding decisions live in `docs/DECISIONS.md`.
Meaningful website changes are recorded in `docs/CHANGELOG.md`.

### Approved phase plan

| Phase | Scope |
|---|---|
| P1.1 | Baseline audit |
| P1.2 | Governance, IA decisions, product image policy |
| P1.3 | Desktop navigation |
| P1.4 | Mobile navigation |
| P1.5 | Integration audit and quality gate |
| P1.6 | Production deployment and live acceptance |

### Navigation (staged IA)

Long-term target top-level: **Platform · Solutions · Resources · Pricing**.

**Active now (P1.3 will implement):** Platform dropdown with six homepage anchors only.

**Deferred until real destination pages exist:** Solutions, Resources, Pricing. No placeholder URLs, fake routes, or empty dropdowns.

Contact is not a permanent primary top-level item. It remains accessible through the closing CTA, footer, and future Resources navigation.

Full policy: `docs/DECISIONS.md` (DEC-003, DEC-004, DEC-008).

## Product images (manually curated)

Product visuals are **manually selected, prepared, and maintained** in this repository.
Committed files under `assets/` are the production source of truth.

Agents must **not** automatically capture, sync, replace, or regenerate images from the
SynqDrive Product Repository unless explicitly instructed by the user.

See **`assets/product/README.md`** for formats, naming, dimensions, privacy rules, and agent restrictions.

`npm run assets` is an optional maintenance tool for re-encoding hand-prepared PNGs from
`assets-raw/` (gitignored). It is not an automatic screenshot pipeline. A normal build
requires only the committed `assets/` files.

### Phone crops

A phone renders product visuals in a narrow column, so each desktop visual also has a
`-mobile.webp` variant switched at 760px via `<picture>`. Without it, scaled desktop panels
become illegible on phones. Crop intent is documented in `content/site.mjs` (`MEDIA`) and
`tools/build-assets.mjs` (`TARGETS[]`, maintenance reference).

## Deploy

`synqdrive.eu` is a Hostinger shared-hosting vhost. It is **not** the VPS, and it has nothing to
do with the product release. Deploying this site must never touch the `app.synqdrive.eu` DNS
records, the VPS release or application routing.

```bash
npm run build
npm run package    # writes synqdrive-landing-page.tar.gz from dist/
```

Then deploy that archive to the vhost whose domain is exactly `synqdrive.eu`, using the Hostinger
static website deployment API (`hosting_deployStaticWebsite`).

The archive must hold the files at **top level**, not nested inside a `dist/` folder, because the
deploy extracts it straight into the docroot. `npm run package` already does this correctly.

### After deploying

```bash
npm run qa:prod
```

Runs the same 11 checks against the live site. Also confirm the product surface was untouched:
`https://app.synqdrive.eu/api/v1/health` should still report `{"status":"ok"}` with an uptime that
predates the deploy.

## Rollback

`rollback/coming-soon-2026-08-11/` holds the complete previous site. Restoring it is the same
operation as deploying: archive that directory with its files at top level and push it to the
same vhost. Nothing else changes, so no DNS, certificate or proxy state has to be reverted.

## What the QA suite covers

Per locale: metadata and canonical tags, heading order, alt text and intrinsic dimensions on every
image, internal anchors and external hosts, lazy images resolving rather than 404ing, no element
left at its pre-reveal opacity, console errors, failed requests, horizontal overflow at nine widths
from 320 to 1920px, and touch target sizes. Plus the dropdown by pointer and keyboard, the mobile
drawer, the locale switch and cumulative layout shift.

Set `LANDING_QA_BASE_URL` to point the suite at any origin, and `LANDING_QA_LABEL` to keep its
screenshots separate from a local run.

## Conventions

Content changes belong in `content/site.mjs`, never in the templates. Every capability claim on
the page must be backed by shipped product code; `docs/IMPLEMENTATION.md` carries the claim matrix
and records what is deliberately left off the page. No invented metric, customer name, logo or
testimonial.
