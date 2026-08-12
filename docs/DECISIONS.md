# SynqDrive Landing Page — Product Decisions

Binding website and information-architecture decisions. If implementation or documentation conflicts with a decision here, the decision wins unless explicitly superseded by a newer entry in this file and `docs/CHANGELOG.md`.

---

## DEC-001 — Standalone website repository

| Field | Value |
|---|---|
| **ID** | DEC-001 |
| **Date** | 2026-08-12 |
| **Status** | Accepted |
| **Decision** | The public SynqDrive website remains in its standalone repository (`SynqDrive-Landing-Page`), separate from the product application repository. |
| **Context** | The marketing site is static HTML with no tenant data access and a distinct Hostinger deploy path. |
| **Reason** | Isolates public marketing from product release, security boundary, and deployment risk. |
| **Consequences** | Website changes ship through this repo's build and QA gates. Product repo changes do not automatically update the website. |
| **Owner** | Product / Fatih |

---

## DEC-002 — Stripe as quality reference

| Field | Value |
|---|---|
| **ID** | DEC-002 |
| **Date** | 2026-08-12 |
| **Status** | Accepted |
| **Decision** | Stripe is a reference for information architecture, hierarchy, and interaction quality. It is not a design template to copy. |
| **Context** | Phase 1 navigation overhaul targets fewer top-level items, clear categories, and high-quality dropdown interaction. |
| **Reason** | Stripe represents best-in-class B2B SaaS clarity without prescribing SynqDrive brand expression. |
| **Consequences** | Agents may emulate IA patterns and interaction quality; they must not clone Stripe layout, typography, or visual identity. |
| **Owner** | Product / Fatih |

---

## DEC-003 — Target top-level navigation

| Field | Value |
|---|---|
| **ID** | DEC-003 |
| **Date** | 2026-08-12 |
| **Status** | Accepted |
| **Decision** | Long-term target top-level navigation: **Platform**, **Solutions**, **Resources**, **Pricing**. |
| **Context** | Approved future information architecture for the public website. |
| **Reason** | Aligns marketing structure with how buyers explore platform capabilities, vertical fit, trust material, and commercial intent. |
| **Consequences** | All future navigation work moves toward this structure. Individual capabilities are not promoted to ambiguous top-level labels such as “Modules”. |
| **Owner** | Product / Fatih |

---

## DEC-004 — Staged navigation activation

| Field | Value |
|---|---|
| **ID** | DEC-004 |
| **Date** | 2026-08-12 |
| **Status** | Accepted |
| **Decision** | Only navigation categories with real, usable destinations are exposed publicly. **Active now:** Platform (six homepage anchors). **Deferred until destination pages exist:** Solutions, Resources, Pricing. No placeholder URLs, fake routes, or empty dropdowns. |
| **Context** | Phase 1.1 audit found seven planned destinations without routes. Dead links are forbidden. |
| **Reason** | Preserves trust and QA integrity while the site remains a single-page marketing surface with limited secondary pages. |
| **Consequences** | P1.3 implements an expanded Platform dropdown only. Solutions, Resources, and Pricing top-level items stay hidden until P1.5+ preconditions are met. Contact is removed from permanent primary top-level navigation in P1.3; it remains via CTA, footer, and future Resources. |
| **Owner** | Product / Fatih |

### Platform anchors active now (locale-correct)

| Label (EN) | Label (DE) | Anchor |
|---|---|---|
| Platform Overview | Plattform-Überblick | `#platform` |
| Connected Vehicle Intelligence | Vernetzte Fahrzeugintelligenz | `#vehicle-intelligence` |
| AI Orchestration | KI-Orchestrierung | `#ai-orchestration` |
| Workflow Automation | Workflow-Automatisierung | `#workflow-automation` |
| Customer Communication | Kundenkommunikation | `#communication` |
| Integrations & Extension | Integrationen & Erweiterung | `#integrations` |

---

## DEC-005 — No Modules top-level item

| Field | Value |
|---|---|
| **ID** | DEC-005 |
| **Date** | 2026-08-12 |
| **Status** | Accepted |
| **Decision** | “Modules” is intentionally not a top-level navigation category. Individual capabilities live within Platform or future product pages. |
| **Context** | Product surface is modular internally; marketing IA must stay buyer-oriented. |
| **Reason** | Avoids engineering-centric navigation that reads as a feature dump. |
| **Consequences** | Do not add a Modules top-level item in any phase without a new decision record. |
| **Owner** | Product / Fatih |

---

## DEC-006 — Manually curated product images

| Field | Value |
|---|---|
| **ID** | DEC-006 |
| **Date** | 2026-08-12 |
| **Status** | Accepted |
| **Decision** | Product images on the landing page are manually selected, prepared, and maintained in this repository. No automatic synchronization with the SynqDrive Product Repository. |
| **Context** | Previous documentation described a product-repo capture pipeline as the current workflow. That workflow is deprecated as the source of truth. |
| **Reason** | The standalone website must not depend on product-repo automation, demo tenants, or agent-initiated screenshot regeneration. |
| **Consequences** | Committed files in `assets/` are authoritative. Agents modify imagery only after explicit user instruction. Optional `npm run assets` may re-encode hand-prepared sources locally; it is not an auto-sync mechanism. See `assets/product/README.md`. |
| **Owner** | Product / Fatih |

---

## DEC-007 — Mobile as independent UX

| Field | Value |
|---|---|
| **ID** | DEC-007 |
| **Date** | 2026-08-12 |
| **Status** | Accepted |
| **Decision** | Mobile is designed as an independent UX composition within the same static implementation system — not merely collapsed desktop layout. |
| **Context** | Product visuals already use dedicated mobile crops via `<picture>` at 760px. Navigation mobile work is scheduled for P1.4. |
| **Reason** | Phone readability and interaction patterns require intentional design, especially for navigation and product imagery. |
| **Consequences** | P1.4 may introduce modal drawer semantics, grouping, and layout distinct from desktop disclosure navigation. |
| **Owner** | Product / Fatih |

---

## DEC-008 — No dead links

| Field | Value |
|---|---|
| **ID** | DEC-008 |
| **Date** | 2026-08-12 |
| **Status** | Accepted |
| **Decision** | Navigation must never expose unavailable destinations. |
| **Context** | Playwright QA validates internal anchors resolve. External links are allowlisted in tests. |
| **Reason** | Broken or placeholder navigation damages credibility on a premium B2B marketing site. |
| **Consequences** | New nav items require verified routes before exposure. Deferred IA categories remain undocumented in the public header until ready. |
| **Owner** | Product / Fatih |

---

## DEC-009 — Taxi & Mobility positioning

| Field | Value |
|---|---|
| **ID** | DEC-009 |
| **Date** | 2026-08-12 |
| **Status** | Accepted |
| **Decision** | Taxi & Mobility may exist as a future **Solutions** category page. It does **not** imply generally available Taxi Dispatch or any unreleased dispatch product. Future copy may describe relevant **released** SynqDrive platform capabilities for taxi and mobility businesses only. |
| **Context** | Phase 1.1 flagged Taxi & Mobility as a blocker because Taxi Dispatch is not generally available on the product. That conflated future marketing IA with current product SKU availability. |
| **Reason** | Vertical solution pages can market fit without claiming unavailable products, provided copy follows the Documentation Suite and shipped capabilities. |
| **Consequences** | Taxi & Mobility is **not** a navigation blocker. It becomes a content guardrail for a future Solutions page. Do not claim dispatch capabilities not released or contradicted by authoritative documentation. |
| **Owner** | Product / Fatih |

---

## DEC-010 — Navigation accessibility pattern

| Field | Value |
|---|---|
| **ID** | DEC-010 |
| **Date** | 2026-08-12 |
| **Status** | Accepted |
| **Decision** | Desktop navigation uses semantic **disclosure navigation with standard links** unless a stronger accessibility or UX reason requires another pattern. Do not adopt ARIA `menu` / `menuitem` semantics without justification. Arrow-key menu navigation is not mandatory for disclosure dropdowns. |
| **Context** | Phase 1.1 recommended arrow-key navigation as an enhancement. Stripe-like quality does not require application-menu semantics. |
| **Reason** | Disclosure + links preserve expected browser keyboard behaviour and simpler maintenance. |
| **Consequences** | P1.3 implements buttons with `aria-expanded`, `aria-controls`, Escape, and outside-click close. Mobile modal semantics in P1.4 only if the drawer is truly modal. |
| **Owner** | Product / Fatih |

---

## Related documents

- `AGENTS.md` — agent operational instructions
- `docs/CHANGELOG.md` — change history
- `docs/audits/landing-page-phase-1.1-baseline-audit-2026-08.md` — baseline findings
- `docs/audits/landing-page-phase-1.2-governance-and-asset-policy-2026-08.md` — this phase record
