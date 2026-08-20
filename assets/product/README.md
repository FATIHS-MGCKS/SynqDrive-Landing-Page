# Product images — SynqDrive Landing Page

Binding policy for product visuals shipped from this repository. Authoritative decision: **DEC-006** in `docs/DECISIONS.md`.

## Policy summary

Landing-page product images are **manually selected, prepared, and maintained** in this repository. They are **not** automatically captured, synchronized, replaced, or regenerated from the SynqDrive Product Repository unless a human explicitly instructs an agent to do so.

## Ownership

| Role | Responsibility |
|---|---|
| Product / Fatih | Approves imagery, alt text intent, and privacy suitability |
| Agents | May edit assets only after explicit user instruction |
| Committed `assets/` | Source of truth for production URLs |

## Current asset locations

Production product visuals currently live at the **`assets/` root** (not in this subdirectory) to preserve stable URLs referenced by `content/site.mjs` and the build:

```
assets/landing-hero-operations.webp
assets/landing-hero-operations-sm.webp
assets/landing-hero-operations-mobile.webp
… (five additional product visuals with -sm and -mobile variants)
assets/landing-social-card.jpg
assets/synqdrive-logo-v2-blau.png
assets/favicon.png
assets/fonts/
```

This `assets/product/` directory holds **policy documentation only**. A future intentional migration may move product files here; do not move them without an approved migration that updates all references and runs QA.

## Accepted formats

| Use | Format | Notes |
|---|---|---|
| Product screenshots | WebP | Primary shipped format |
| Responsive half-width | WebP (`*-sm.webp`) | Referenced via `srcset` in `src/primitives.mjs` |
| Mobile art direction | WebP (`*-mobile.webp`) | Switched at `max-width: 760px` via `<picture>` |
| Social sharing | JPEG (`landing-social-card.jpg`) | Fixed 1200×630 |
| Brand | PNG | Logo and favicon |
| Fonts | WOFF2 | Self-hosted Manrope subsets |

## Naming convention

```
landing-{section-topic}.webp           # desktop / default
landing-{section-topic}-sm.webp        # ~50% width variant for srcset
landing-{section-topic}-mobile.webp    # phone crop for art direction
```

Base names must match `MEDIA.*.file` entries in `content/site.mjs`. Width and height metadata in the content model must match encoded dimensions to preserve zero CLS.

## Recommended dimensions

Dimensions are defined per asset in `content/site.mjs` → `MEDIA` (width, height, optional `mobile` object). When preparing new imagery:

- Encode at the **declared pixel width** (typically 2× rendered CSS width for retina)
- Provide intrinsic `width` and `height` on both `<img>` and mobile `<source>`
- Keep phone crops readable in ~356px columns — do not rely on scaling desktop panels down

Crop intent for existing assets is documented in `tools/build-assets.mjs` → `TARGETS[]` (maintenance reference only).

## Optimization

- Prefer WebP quality 88–90 for product panels (see existing `TARGETS` qualities)
- Run `npm run build` and `npm run qa` after any asset change
- Hero image is preloaded; keep file size reasonable without sacrificing legibility

## Privacy and authenticity

Product images must:

- Show **real SynqDrive product UI** or deliberate brand composition — never fabricated dashboards
- Contain **no personal data, customer data, secrets, or production tenant identifiers**
- Use **non-identifying demo or curated content** only

Product images must **not**:

- Be pulled from production environments without explicit approval
- Be auto-synced from the Product Repository
- Include pixel-censored real customer data (use curated/demo content instead)

## Agent restrictions

Unless explicitly instructed by the user, agents must **not**:

- Capture screenshots from the SynqDrive Product Repository
- Run or assume `landing:capture`, capture harnesses, or demo-tenant automation
- Replace, regenerate, or bulk-update committed product assets
- Fetch live production screenshots

## Optional maintenance tool (not auto-sync)

`npm run assets` (`tools/build-assets.mjs`) can crop and encode **hand-prepared** source files placed locally in `assets-raw/`. This is an optional maintenance utility for humans preparing new PNG sources — **not** an automatic Product Repository pipeline. Requires `ffmpeg`. Output writes to `assets/`.

## Related documents

- `AGENTS.md` — agent rules
- `docs/DECISIONS.md` — DEC-006, DEC-007
- `content/site.mjs` — `MEDIA` references and alt text
- `src/primitives.mjs` — `productFrame()` responsive markup
- `docs/IMPLEMENTATION.md` — technical implementation notes

## Historical note (deprecated workflow)

The initial standalone import documentation described a product-repository capture pipeline (`landing:capture`, synthetic demo tenant, PNG handover to `assets-raw/`). That workflow is **deprecated as the current source of truth**. Historical context remains in git history and Phase 1.1 audit findings. Current workflow: **manual curation in this repository**.
