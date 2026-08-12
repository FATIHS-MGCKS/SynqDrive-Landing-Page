# Phase 1.4 — Mobile Navigation Rebuild

**Date:** 2026-08-12  
**Repository:** SynqDrive-Landing-Page  
**Branch:** `main`  
**Status:** Complete (local QA; not deployed)

Non-normative audit record. Binding decisions remain in `docs/DECISIONS.md`.

---

## 1. Previous mobile navigation state

Pre-P1.4 mobile navigation was a simple in-header drop-down block (`.drawer`): flat unordered link list, actions stacked below, no modal semantics, no scroll lock, no focus trap, no `inert` on background content, and visual treatment that read as collapsed desktop navigation rather than a deliberate mobile layer (DEC-007).

---

## 2. Selected navigation presentation model

**Full-viewport modal navigation layer** fixed below the sticky masthead. White calm surface, internal scroll container (`.mobilenav__scroll`), generous row spacing, section separators for Platform / Account / Language. Not a floating card or desktop-style dropdown.

---

## 3. Modal / non-modal decision

**Modal.** The layer overlays the page, blocks pointer and keyboard access to underlying content, and locks body scroll while open. Implemented with:

- `role="dialog"` + `aria-modal="true"` on `#mobile-nav`
- `hidden` + `inert` while closed
- `inert` on `#main`, `.sitefooter`, and `.skip-link` while open
- Body `position: fixed` scroll lock with scroll-position preservation (pointerdown capture before toggle click)

Non-modal semantics were rejected because the interaction replaces the page experience and must prevent background scroll and focus escape (DEC-010).

---

## 4. Platform expanded / accordion decision

**Option B — Platform expanded inline.**

Only Platform is publicly active (DEC-004). An accordion would add an extra tap with no IA benefit today. The category label (`Plattform` / `Platform`) heads a flat list of six homepage anchors derived from `flattenPlatformMenu()`. Future multi-category accordions remain possible without markup duplication because links still come from `nav.platformMenu`.

---

## 5. Final mobile structure

```
[ Logo ]                                    [ Menu ]

── open layer ──
PLATFORM (category label)
  Platform Overview / Plattform-Überblick
  …five capability anchors…
────────
ACCOUNT / KONTO
  Log in (secondary)
  Book a demo / Demo anfragen (primary)
────────
LANGUAGE / SPRACHE
  [Current locale · aria-current]   [Alternate locale link]
```

Header Demo CTA: visible 481px–1024px when space allows; hidden ≤480px (Demo remains in navigation layer).

---

## 6. Shared desktop / mobile data architecture

| Concern | Source |
|---|---|
| Platform links | `content/site.mjs` → `nav.platformMenu` |
| Mobile flat list | `flattenPlatformMenu(platformMenu)` |
| Mobile section labels | `nav.mobileNav.accountLabel`, `nav.mobileNav.languageLabel` |
| Login / Demo URLs | `SITE.links` via `header(c, other, site)` |
| Locale switch target | `other.dir`, `other.meta.localeName` |

No second link array. Desktop grouped panel and mobile flat list are renderings of the same model.

---

## 7. Breakpoint decision

**1024px** retained (`@media (max-width: 1024px)` mobile, desktop from 1100px verified).

Audited widths: 320, 360, 375, 390, 393, 414, 430, 480, 600, 768, 820, 900, 960, 1024, 1100.

At ≤1024px: menu toggle visible, `.mainnav` hidden. At ≥1100px: desktop Platform disclosure visible, toggle hidden. No width shows both or neither.

---

## 8. Scroll-lock implementation

- Capture scroll Y on menu `pointerdown` (before click-induced scroll adjustment) and fallback in `openDrawer()`
- `html[data-nav-scroll-lock="true"]` + `body { position: fixed; top: -{y}px }`
- Unlock removes fixed positioning, restores via `window.scrollTo` + `requestAnimationFrame` correction
- Tested in Playwright: background wheel does not scroll while open; position restored within 24px after Escape

---

## 9. Focus / inert implementation

| State | Panel | Background |
|---|---|---|
| Closed | `hidden`, `inert` | normal |
| Open | visible, focusable | `#main`, footer, skip link `inert` |

Open: focus moves to first Platform link. Tab cycles within dialog (focus trap). Escape closes and refocuses menu trigger. Link activation closes without return focus (anchor navigation proceeds).

---

## 10. Accessibility

- Menu trigger: `aria-expanded`, `aria-controls`, accessible name toggles open/close (DE/EN)
- Dialog: locale-correct `aria-label` from `nav.mainLabel`
- Current locale: `aria-current="true"`
- Touch targets: 44px menu trigger, 48px navigation rows, full-width CTAs
- Keyboard tests: closed Tab skips hidden panel; open Tab order, trap wrap, Escape refocus (DE/EN)

---

## 11. Reduced motion

No open/close animation dependency. Panel toggles via `hidden` (instant). Functional with `prefers-reduced-motion: reduce` (Playwright test).

---

## 12. Portrait QA

Screenshots in `qa/` (local):

| Viewport | Closed (header) | Open (panel) |
|---|---|---|
| 320×700 | `p14-nav-320-closed.png` | `p14-nav-320-open-panel.png` |
| 375×812 | `p14-nav-375-closed.png` | `p14-nav-375-open-panel.png` |
| 390×844 | `p14-nav-390-closed.png` | `p14-nav-390-open-panel.png` |
| 430×932 | `p14-nav-430-closed.png` | `p14-nav-430-open-panel.png` |
| 768×1024 | `p14-nav-768-closed.png` | `p14-nav-768-open-panel.png` |
| 1024×1366 | `p14-nav-1024-closed.png` | `p14-nav-1024-open-panel.png` |

Manual review: logo legible, calm spacing, no card clutter, CTA and locale reachable, no lower-viewport clipping at 320px.

---

## 13. Landscape QA

| Viewport | Open panel |
|---|---|
| 844×390 | `p14-nav-844x390-landscape-open.png` |
| 932×430 | `p14-nav-932x430-landscape-open.png` |

Internal scroll container keeps links, CTAs, and locale controls reachable at limited height.

---

## 14. Desktop regression

All P1.3 / P1.3.1 tests retained and passing at 1100, 1280, 1440, 1920:

- Platform disclosure hover, click, outside click, Escape
- Keyboard tab order + `inert` while closed
- DE/EN policy, login/demo URLs, deferred categories absent

---

## 15. Tests and results

```
npm run build  — pass
npm run qa     — 26/26 pass
```

New P1.4 cases: mobile policy (DE/EN), keyboard (DE/EN), scroll lock, reduced motion, breakpoint matrix, screenshots, updated drawer smoke test.

---

## 16. Files changed

| File | Change |
|---|---|
| `content/site.mjs` | `nav.mobileNav` labels; `flattenPlatformMenu` comment |
| `src/sections.mjs` | `renderMobileNav()`; modal markup |
| `src/primitives.mjs` | Optional `className` on `action()` |
| `src/styles.css` | `.mobilenav*`, compact toggle, remove `.drawer*` |
| `src/script.js` | Modal open/close, scroll lock, inert, focus trap |
| `e2e/landing-page-qa.spec.ts` | P1.4 tests + screenshots |
| `docs/IMPLEMENTATION.md` | Mobile architecture |
| `docs/CHANGELOG.md` | P1.4 entry |
| `docs/audits/landing-page-phase-1.4-mobile-navigation-2026-08.md` | This report |

---

## 17. Known limitations

- Scroll restore may differ by ≤24px after close (browser rounding / sticky header interaction); acceptable for marketing page
- Mobile navigation requires JavaScript (same progressive-enhancement scope as P1.3.1)
- Locale switch in mobile nav navigates to alternate locale root (full page load), consistent with desktop

---

## 18. Phase-2 mobile page issues observed (NOT fixed)

Per scope boundary, the following remain for a future mobile page composition phase:

- Hero mobile layout and product frame cropping rhythm
- Section vertical spacing below header
- Card grid density on narrow viewports
- Footer mobile column layout
- USP / proof row wrapping

No landing-section CSS was modified except shared header/mobilenav rules decoupled from section layout.

---

## 19. Branch

`main`

---

## 20. Commit SHA

`0383f83` — `feat(navigation): rebuild mobile navigation experience`

---

## Explicit non-actions

- Production **not** deployed
- P1.5 / P1.6 **not** started
- Solutions, Resources, Pricing **not** exposed
- Product images **not** changed
- Landing sections **not** redesigned

---

---

## Post-review modal semantics correction (P1.4.1) — 2026-08-12

External review accepted P1.4 design and IA. Corrective patch for modal boundary semantics, focus trap completeness, scroll-lock lifecycle, and QA hardening.

### Modal-boundary issue

P1.4 placed `role="dialog"` on `#mobile-nav` while the visible header (logo, menu/close toggle, optional Demo CTA) remained outside the dialog. The Close control was not inside the focus trap; keyboard users could not reach it via Tab.

### Fix — complete modal shell

`#mobile-nav` now covers the full viewport and includes:

```
.mobilenav__topbar   → brand + [data-nav-close] Close
.mobilenav__scroll  → Platform / Account / Language (unchanged IA)
```

Normal `.masthead__inner` remains underneath, visually matched by the modal top bar, and is **`inert`** while open.

### Background inert

While open: `inert` on `.masthead__inner`, `#main`, `.sitefooter`, `.skip-link`. Dialog panel not inert. Restored on close.

### Scroll-lock lifecycle

Replaced init-time `closeDrawer(false)` → spurious `unlockPageScroll()` with idempotent `initMobileNav()` and explicit `scrollLockActive` boolean. `unlockPageScroll()` no-ops unless a lock was active. Scroll Y captured on menu `pointerdown` before open.

### New / expanded tests (Chromium)

| Test | Purpose |
|---|---|
| Deep-link scroll preservation (DE/EN) | `/#vehicle-intelligence` not reset on init |
| Landscape panel reachability | 844×390, 932×430 — scroll `.mobilenav__scroll`, verify Login/Demo/locale/Close |
| Touch targets when open | All modal controls ≥44px |
| Breakpoint edge 1024–1100 | Exactly one nav model, no overflow |
| Resize 1024→1100 with modal open | Closes, clears lock/inert, desktop nav usable |
| Keyboard Shift+Tab → Close | Close inside focus loop; Enter on Close closes |

**Chromium QA:** 32/32 pass (`npm run qa`)

### WebKit smoke

Added `npm run qa:webkit` with `e2e/mobile-nav-webkit.spec.ts` (Playwright WebKit). After installing WebKit system libraries: **2/2 pass** — scroll lock, Escape close, scroll restore, anchor navigation, landscape internal scroll. Playwright WebKit reports fixed-modal controls as outside viewport after body scroll-lock; smoke test documents programmatic/keyboard close where needed (real Safari tap targets remain in modal layer).

### Breakpoint

1024px retained; edge matrix 1024–1100 confirms clean transition.

### Commit SHA

`b430899` — `fix(navigation): correct mobile modal focus boundary`

---

*End of Phase 1.4 report.*
