# SynqDrive Landing Page — Agent Instructions

Operational instructions for every agent working on the public SynqDrive website (`synqdrive.eu`).

## Project purpose

Public marketing website for SynqDrive. Static HTML, CSS, and progressive-enhancement JavaScript. Not the product application.

## Source of truth (priority order)

1. **Website Product Decisions** — `docs/DECISIONS.md`
2. **SynqDrive Documentation Suite** — authority for product principles, facts, and availability
3. **Current repository implementation** — `content/`, `src/`, `tools/`, committed `assets/`
4. **Production configuration** — live site at `https://synqdrive.eu`

If sources conflict, higher authority wins.

## Supporting records — non-normative

- `docs/CHANGELOG.md`
- `docs/audits/*`

These records document history, evidence, validation, and implementation context.

They do **not** independently establish or supersede Product Decisions.

If an audit conflicts with an accepted DEC entry, the DEC entry wins.

If an audit discovers a problem with an accepted decision, it must recommend a new decision rather than silently overriding it.

## Approved phase plan

| Phase | Scope |
|---|---|
| P1.1 | Baseline audit |
| P1.2 | Governance, IA decisions, product image policy |
| P1.3 | Desktop navigation |
| P1.4 | Mobile navigation |
| P1.5 | Integration audit and quality gate |
| P1.6 | Production deployment and live acceptance |

Do not advance phases without explicit approval. Earlier audit implementation-map numbering is non-normative.

## Design direction

- Premium B2B SaaS
- **Stripe** as reference for information architecture, clarity, and interaction quality — never copy Stripe visually
- Minimalist, high-quality typography, generous whitespace
- Real SynqDrive product as the focal point
- No generic AI-SaaS visual language

### UI / Taste guidance (P1.3+)

Visual skills are not stored in this repository. Before navigation or layout work in P1.3/P1.4, read the canonical design constraints here and in `.cursor/rules/landing-page.mdc`. If the user provides Taste/UI skill files from the SynqDrive product workspace, treat them as supplementary — not overriding `docs/DECISIONS.md` or this file.

Reference skill names from the original build (product workspace): `design-taste-frontend`, `minimalist-ui`, `make-interfaces-feel-better`, `image-to-code`. Dials used historically: design variance 4, motion intensity 3, visual density 3.

## Content rules

Never invent:

- KPIs, customers, testimonials, logos
- capabilities, availability, or compliance claims

Provider infrastructure must not be presented as the SynqDrive product itself.

Every capability on the page must be backed by shipped, documented product behaviour.

## Product image policy

Product imagery is **manually curated** in this repository. See `assets/product/README.md`.

Agents must **not** automatically capture, sync, replace, regenerate, or fetch screenshots from the SynqDrive Product Repository unless the user explicitly instructs it.

Committed files in `assets/` are the shipped source of truth. Do not break existing image URLs without an intentional migration.

## Mobile rule

Mobile is an independently designed UX composition within the same static system — not merely collapsed desktop layout. See DEC-007 in `docs/DECISIONS.md`.

## Architecture rule

Respect the existing static architecture (`content/site.mjs` → templates → `dist/`). No framework migration or unnecessary dependency changes without explicit instruction.

## Navigation rule

**No dead links.** Navigation items become public only when their destination exists.

### Staged navigation (binding)

**Active now:** Platform dropdown only — six homepage anchors (`#platform`, `#vehicle-intelligence`, `#ai-orchestration`, `#workflow-automation`, `#communication`, `#integrations`).

**Deferred until real destinations exist:** Solutions, Resources, Pricing as top-level categories.

Contact is not a permanent primary top-level item. It remains via CTA, footer, and future Resources navigation.

Full IA: `docs/DECISIONS.md` (DEC-003, DEC-004, DEC-008, DEC-009).

## Accessibility — desktop navigation

Use **disclosure navigation with normal links**, not ARIA application menus.

Required: semantic `<nav>`, locale-appropriate `aria-label`, disclosure buttons with `aria-expanded` and `aria-controls`, Tab navigation, `:focus-visible`, Escape closes open disclosure, outside click closes, reliable pointer interaction.

`aria-haspopup` only if semantically justified. Arrow-key menu navigation is **not** mandatory unless intentionally adopting an ARIA menu pattern. Do not use `role="menu"` / `menuitem` to imitate Stripe.

Mobile modal drawer semantics apply only in P1.4 if implemented as a modal overlay.

## Testing rule

Before merge or deployment:

```bash
npm ci
npm run build
npm run serve    # separate terminal
npm run qa       # Chromium Playwright suite (navigation + structure)
npm run qa:webkit  # WebKit mobile-navigation smoke
```

Use `npm run qa:prod` only after explicit deploy approval (P1.6).

## Deployment rule

Production deployment only after explicit phase approval and successful quality gates. Never deploy from governance or documentation-only phases.

Deploy target: Hostinger vhost for `synqdrive.eu` only. Never touch `app.synqdrive.eu` routing or VPS release paths.

## Never do

- Create a second design-system truth
- Introduce dead links, placeholder pages, or empty dropdowns
- Expose production personal or customer data in imagery or copy
- Auto-sync product imagery from the Product Repository
- Invent product features or imply unavailable products (e.g. generally available Taxi Dispatch)
- Make opportunistic large refactors outside scope
- Change unrelated landing-page sections without scope
- Implement P1.3/P1.4 navigation during governance-only phases

## Key documents

| Document | Purpose |
|---|---|
| `docs/DECISIONS.md` | **Normative** — binding Product Decisions (DEC-*) |
| `docs/CHANGELOG.md` | Non-normative change history |
| `docs/IMPLEMENTATION.md` | Technical implementation report |
| `docs/audits/` | Non-normative phase audit records |
| `assets/product/README.md` | Product image policy (implements DEC-006) |
