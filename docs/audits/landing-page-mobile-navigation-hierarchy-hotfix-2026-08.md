# Mobile Navigation Hierarchy Hotfix

**Date:** 2026-08-13  
**Scope:** Mobile navigation only  
**Status:** Local release candidate; **NOT DEPLOYED**

## Executive Summary

Real-iPhone review rejected the previous menu composition even though its modal mechanics were technically sound. This hotfix replaces the permanently expanded Platform list and oversized Account/Language blocks with a compact seven-row first level, nested category views, a restrained bottom action area, and a compact locale control.

The result follows Stripe as an information-architecture and density reference only (DEC-002). It remains a SynqDrive interface: existing logo, Manrope typography, navy palette, hairlines, radii, actions, and content authority are retained.

## Real-Device Finding

The accepted P1.4 mobile modal read more like an account/settings surface than premium SaaS navigation:

- all Platform children appeared immediately;
- Account and Language became large content sections;
- Login had excessive visual weight;
- the vertical rhythm was loose;
- primary IA, secondary actions, and locale controls lacked hierarchy.

This was a composition failure, not a modal accessibility or delivery failure.

## Previous Mobile Menu

The previous root contained:

1. an expanded six-link Platform section;
2. a labeled Account section with Login and Demo;
3. a labeled Language section.

Its focus trap, Escape close, focus return, body lock, safe-area handling, background `inert`, and internal landscape scrolling were retained.

## Target Navigation Model

The new modal uses:

1. brand + compact Close top bar;
2. compact first-level navigation rows;
3. separate second-level views opened without page navigation;
4. flexible breathing space;
5. two bottom actions;
6. a compact locale switch.

Subview transitions are state changes inside the modal, not browser-history changes.

## Final Mobile IA

Root order (DE / EN):

1. Plattform / Platform
2. Lösungen / Solutions
3. Branchen / Industries
4. Integrationen / Integrations
5. Ressourcen / Resources
6. Preise / Pricing
7. Anmelden / Log in

Platform, Solutions, Industries, and Resources open nested views. Integrations and Login are direct real destinations. Pricing is a non-link **In Arbeit / In progress** row.

DEC-011 is a scoped mobile exception to **both DEC-003 and DEC-004**. It does not globally supersede DEC-003; desktop remains Platform-only under staged activation until a separate accepted decision authorizes desktop IA expansion. DEC-008 dead-link authority is preserved.

## Destination Availability Matrix

| Mobile entry | Destination | State |
|---|---|---|
| Platform children | Existing locale-correct landing anchors | Active |
| Customer & Driver Communication | `#communication` | Active |
| Automation & AI | `#ai-orchestration` | Active |
| Other Solutions children | None | Non-link **In Arbeit** |
| Car Rental | No dedicated page | Non-link **Available / Verfügbar** |
| Other Industries children | None | Non-link **In Arbeit** |
| Integrations | `#integrations` | Active |
| Product Overview | `#platform` | Active |
| Contact | `mailto:info@synqdrive.eu` | Active |
| Demo | Existing demo mail action | Active |
| Pricing | None | Non-link **In Arbeit** |
| Login | `https://app.synqdrive.eu` | Active |

No `#` placeholder, fabricated page route, documentation route, blog, case study, guide, pricing route, or vendor integration was added.

## Root Menu

The root has exactly seven rows, 60px minimum row height, subtle hairline separators, left-aligned labels, and right chevrons only for nested views. Platform children are absent from the initial visible/accessibility tree. Login is a normal row rather than a large outlined account button.

## Platform Subview

Selecting Platform opens a separate view with Back and the localized title. It contains:

- Platform Overview / Plattform-Überblick
- One system for the entire operation / Ein System für den gesamten Betrieb
- Connected Vehicle Intelligence
- AI Orchestration
- Workflow Automation
- Customer Communication
- Integrations & Extension

All destinations are existing anchors. Activation closes the modal; the existing document `scroll-padding-top` keeps target headings below the sticky masthead.

## Solutions Subview

The approved labels are present. Customer Communication and Automation & AI use matching real sections. Items without dedicated real destinations are static rows marked **In Arbeit / In progress** and are not announced as links.

## Industries Subview

Car Rental is marked **Available / Verfügbar** but remains non-link because no dedicated industry destination exists. Fleet Management, Taxi, School & Passenger Transport, and Delivery & Logistics are marked **In Arbeit / In progress**. This preserves DEC-009’s taxi-availability guard.

## Integrations

The root row links directly to the existing localized landing section `#integrations`. No submenu, vendor names, or partner logos were invented.

## Resources

The nested Resources view contains only currently real destinations: Product Overview, Contact, and Demo. Blog, case studies, documentation, and guides remain absent.

## Pricing

No pricing page exists. Pricing is a focusable, `aria-disabled="true"` non-link row with a subtle **In Arbeit / In progress** badge.

## Login

Login remains the existing `https://app.synqdrive.eu` destination and is visually equal to other root rows. It is not promoted to a full-width account action.

## Bottom Actions

Demo remains the existing prefilled mail flow. No distinct sales system exists, so **Contact sales / Vertrieb kontaktieren** uses the existing real `mailto:info@synqdrive.eu` contact action.

At normal phone widths the actions share one row. At ≤340px they stack to preserve readable labels and ≥44px touch targets.

## Language

The labeled Language content block was removed. The current locale and alternate locale now appear as compact 44px controls below the actions. Locale routes remain `/` and `/en/`.

## Accessibility

Retained:

- `role="dialog"`, `aria-modal="true"`, and localized labelling;
- focus trap including the modal Close control;
- Escape close and focus return to the masthead trigger;
- body scroll lock with scroll-position restoration;
- background `inert`;
- closed modal `hidden` + `inert`;
- internal scrolling at short heights;
- ≥44px interactive targets.

Added:

- submenu triggers with `aria-expanded` and `aria-controls`;
- hidden/inert inactive views;
- localized Back labels (`Zurück` / `Back`);
- Back focus on view entry and category-trigger focus restoration;
- non-link unavailable rows with `aria-disabled="true"`.

Hidden submenu content is removed from focus order.

## WebKit

The targeted local WebKit navigation suite now includes a real 390×844 hierarchy smoke: open, Platform, Back, Close, and focus restoration. Existing scroll-lock, anchor navigation, landscape reachability, and all Safari stylesheet-delivery scenarios remain in the suite.

## Responsive Matrix

Root-menu interaction, touch targets, bottom actions, and overflow were exercised at:

- Portrait/mobile: 320×700, 360×800, 375×812, 390×844, 393×852, 414×896, 430×932, 480×900
- Landscape: 667×375, 844×390, 932×430
- Locale coverage: DE and EN at 320, 390, and 430

Visual captures were produced for DE 320/390/430 and EN 390 in closed, root, Platform, Solutions, and Industries states.

## Desktop Regression

Desktop markup, Platform disclosure, link set, locale switch, Login, Demo, breakpoint, styles, and interaction code remain unchanged. The mobile-only IA is rendered inside `#mobile-nav`; desktop continues to expose only Platform under DEC-004.

## Safari Delivery Regression

The hotfix retains:

- content-addressed CSS and JavaScript;
- stable byte-identical aliases;
- one-time CSS alias recovery;
- catastrophic inline fallback;
- intrinsic 24×24 generated SVG dimensions;
- CSS sentinel;
- Chromium and WebKit forced-delivery-failure tests;
- deterministic packaging.

## Files Changed

| File | Change |
|---|---|
| `content/site.mjs` | Localized mobile IA, real destinations, statuses, action labels |
| `src/sections.mjs` | Root rows, nested views, Back controls, bottom actions |
| `src/styles.css` | Mobile row hierarchy, nested views, badges, compact actions/locale |
| `src/script.js` | Internal view state, focus entry/return, ARIA state |
| `e2e/landing-page-qa.spec.ts` | Root/subview/accessibility/responsive/visual QA |
| `e2e/mobile-nav-webkit.spec.ts` | WebKit hierarchy smoke |
| `docs/DECISIONS.md` | DEC-011 mobile IA governance |
| `docs/IMPLEMENTATION.md` | Current navigation architecture |
| `docs/CHANGELOG.md` | Hotfix record |
| This audit | Evidence and scope record |

## QA

| Gate | Result |
|---|---|
| `npm run build` | **PASS** |
| Chromium (`npm run qa`) | **110/110 PASS** |
| WebKit (`npm run qa:webkit`) | **11/11 PASS** |
| Deterministic package (`npm run package`) | **PASS** |
| Fingerprint / alias contract | **PASS** |
| CSS | `styles.478b7a069726.css` |
| JavaScript | `script.0501a8359cb4.js` |

The package contains 36 archive entries at the site root, verified by `tools/package-site.mjs`. Its local QA identity is 1,030,289 bytes, SHA-256 `606ca121ab261765017a4923c2c933fd5769e659f6a686b66f0d4adbc4f1c2f4`; it is **not deployed**.

## Production Deployment Status

**Production touched:** **NO**  
**Hostinger cache purged:** **NO**  
**`app.synqdrive.eu` touched:** **NO**

This hotfix is a local/Draft-PR release candidate only.

## P10.1 Closure (2026-08-13)

External review identified three interaction/governance gaps and one visual alignment item. Scope remained mobile navigation only.

| Item | Change |
|---|---|
| Governance | DEC-011 consequences clarified as a scoped mobile exception to **both DEC-003 and DEC-004**; DEC-003 remains long-term/default IA outside mobile |
| Initial focus | `openDrawer()` now focuses `[data-nav-close]` first; first Tab reaches Platform |
| Resources QA | DE/EN hierarchy tests verify Resources subview, three real destinations, Back focus restoration |
| Close control | Default soft neutral surface on `.mobilenav__close`; hover/focus slightly stronger |
| Production | Still untouched |

## Known Limitations

- Planned mobile IA appears before dedicated Solutions, Industries, and Pricing pages; unavailable rows are intentionally non-navigating and visibly labeled.
- Car Rental is available as a product fit but has no dedicated public destination, so it is not a link.
- Sales contact reuses the existing real email contact because no distinct sales route exists.
- Mobile and desktop top-level IA intentionally differ temporarily under DEC-011; desktop expansion requires separate approval.
