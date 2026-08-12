/**
 * Section templates for the public SynqDrive landing page.
 *
 * Seven content sections plus a closing call to action, in the order the page
 * renders them. Each section deliberately uses a different composition so the
 * page does not read as six repeated text-beside-screenshot rows:
 *
 *   hero            text column beside an upright product frame
 *   unified         header beside a 2x2 capability grid, full width frame below
 *   vehicle         one composed panel holding the product frame and its notes
 *   ai              mirrored split, product frame first, flow rail under text
 *   workflow        stacked, full width chain band above a full width frame
 *   communication   text column with notes beside a product frame
 *   integrations    centred capability hub
 *
 * Screenshot aspect drives the choice: the fleet plan and the workflow list are
 * wide artefacts that stay readable only at full width, while the dashboard, the
 * vehicle list, the assistant and the inbox are upright enough to sit in a split.
 */
import { icon } from './icons.generated.mjs';
import { flattenPlatformMenu } from '../content/site.mjs';
import { action, esc, iconMark, productFrame, sectionHead } from './primitives.mjs';

/** Exported so the <link rel="preload"> in the document head cannot drift. */
export const HERO_SIZES = '(max-width: 900px) 92vw, 50vw';

function renderPlatformPanel(c) {
  const menu = c.nav.platformMenu;
  const groups = menu.groups
    .map(
      (group) => `<div class="nav-panel__group">
            <p class="nav-panel__group-title">${esc(group.title)}</p>
            <ul class="nav-panel__list">
              ${group.items
                .map(
                  (item) => `<li>
                    <a class="nav-panel__link" href="${item.href}">
                      <span class="nav-panel__link-label">${esc(item.label)}</span>
                      <span class="nav-panel__link-desc">${esc(item.description)}</span>
                    </a>
                  </li>`,
                )
                .join('')}
            </ul>
          </div>`,
    )
    .join('');

  const footer = menu.footerLink
    ? `<div class="nav-panel__footer">
          <a class="nav-panel__footer-link" href="${menu.footerLink.href}">
            ${esc(menu.footerLink.label)}<span class="nav-panel__footer-arrow">${icon('arrow-right')}</span>
          </a>
        </div>`
    : '';

  return `<div class="nav-panel" id="platform-menu" data-dropdown-menu inert>
          <a class="nav-panel__overview" href="${menu.overview.href}">
            <span class="nav-panel__overview-label">${esc(menu.overview.label)}</span>
            <span class="nav-panel__overview-desc">${esc(menu.overview.description)}</span>
          </a>
          <div class="nav-panel__groups">${groups}</div>
          ${footer}
        </div>`;
}

function renderMobileNav(c, other, site) {
  const platformLinks = flattenPlatformMenu(c.nav.platformMenu)
    .map(
      (item) => `<li>
            <a class="mobilenav__link" href="${item.href}">
              <span class="mobilenav__link-label">${esc(item.label)}</span>
            </a>
          </li>`,
    )
    .join('');

  return `<div
        class="mobilenav"
        id="mobile-nav"
        data-nav-panel
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-nav-title"
        hidden
        inert
      >
        <div class="mobilenav__topbar">
          <a class="brand mobilenav__brand" href="${c.dir}" aria-label="${esc(c.nav.home)}">
            <img src="/assets/synqdrive-logo.png" width="1024" height="216" alt="SynqDrive" />
          </a>
          <button
            type="button"
            class="mobilenav__close"
            data-nav-close
            aria-label="${esc(c.nav.closeMenu)}"
          >
            ${icon('x')}
          </button>
        </div>
        <div class="mobilenav__scroll">
          <div class="mobilenav__section">
            <p class="mobilenav__category" id="mobile-nav-title">${esc(c.nav.platform)}</p>
            <ul class="mobilenav__list">${platformLinks}</ul>
          </div>

          <div class="mobilenav__section mobilenav__section--account">
            <p class="mobilenav__section-label">${esc(c.nav.mobileNav.accountLabel)}</p>
            <div class="mobilenav__actions">
              <a class="action action--ghost mobilenav__login" href="${site.links.app}" rel="noopener">${esc(c.nav.login)}</a>
              ${action({ href: site.links.demo, label: c.nav.demo, variant: 'primary', className: 'mobilenav__demo' })}
            </div>
          </div>

          <div class="mobilenav__section mobilenav__section--locale" role="group" aria-label="${esc(c.nav.mobileNav.languageLabel)}">
            <p class="mobilenav__section-label">${esc(c.nav.mobileNav.languageLabel)}</p>
            <div class="mobilenav__locale">
              <span class="mobilenav__locale-current" aria-current="true">${esc(c.meta.localeName)}</span>
              <a
                class="mobilenav__locale-link"
                href="${other.dir}"
                hreflang="${other.htmlLang}"
                lang="${other.htmlLang}"
                aria-label="${esc(c.meta.localeSwitchLabel)}: ${esc(other.meta.localeName)}"
              >${esc(other.meta.localeName)}</a>
            </div>
          </div>
        </div>
      </div>`;
}

export function header(c, other, site) {
  const platformPanel = renderPlatformPanel(c);
  const mobileNav = renderMobileNav(c, other, site);

  return `<header class="masthead" data-masthead>
      <div class="masthead__inner">
        <a class="brand" href="${c.dir}" aria-label="${esc(c.nav.home)}">
          <img src="/assets/synqdrive-logo.png" width="1024" height="216" alt="SynqDrive" />
        </a>

        <nav class="mainnav mainnav--platform" aria-label="${esc(c.nav.mainLabel)}">
          <div class="mainnav__group" data-dropdown>
            <button
              type="button"
              class="mainnav__trigger"
              aria-expanded="false"
              aria-controls="platform-menu"
              data-dropdown-trigger
            >
              ${esc(c.nav.platform)}
              <span class="mainnav__chevron">${icon('chevron-down')}</span>
            </button>
            ${platformPanel}
          </div>
        </nav>

        <div class="masthead__actions">
          <a
            class="locale-switch"
            href="${other.dir}"
            hreflang="${other.htmlLang}"
            lang="${other.htmlLang}"
            aria-label="${esc(c.meta.localeSwitchLabel)}: ${esc(other.meta.localeName)}"
          >
            ${icon('globe')}<span>${esc(other.htmlLang.toUpperCase())}</span>
          </a>
          <a class="masthead__login" href="${site.links.app}" rel="noopener">${esc(c.nav.login)}</a>
          ${action({ href: site.links.demo, label: c.nav.demo, variant: 'primary' })}
          <button
            type="button"
            class="masthead__toggle"
            aria-expanded="false"
            aria-controls="mobile-nav"
            data-nav-toggle
            data-label-open="${esc(c.nav.openMenu)}"
            data-label-close="${esc(c.nav.closeMenu)}"
            aria-label="${esc(c.nav.openMenu)}"
          >
            <span class="masthead__toggle-open" aria-hidden="true">${icon('menu')}</span>
            <span class="masthead__toggle-close" aria-hidden="true">${icon('x')}</span>
          </button>
        </div>
      </div>

      ${mobileNav}
    </header>`;
}

export function hero(c) {
  const h = c.hero;
  const proof = h.proof.map((line) => `<li>${esc(line)}</li>`).join('');

  /* Mobile source order: intro → product → proof. Desktop grid keeps intro + proof
     in the copy column and the product frame in the right column. */
  return `<section class="hero layout-split" aria-labelledby="hero-title">
      <div class="hero__intro">
        <p class="eyebrow" data-reveal>${esc(h.eyebrow)}</p>
        <h1 id="hero-title" data-reveal>${esc(h.title)}</h1>
        <p class="hero__body" data-reveal>${esc(h.body)}</p>
        <div class="hero__actions" data-reveal>
          ${action({ href: 'mailto:info@synqdrive.eu?subject=SynqDrive%20demo%20request', label: h.primary, variant: 'primary' })}
          ${action({ href: `#${c.unified.id}`, label: h.secondary, variant: 'secondary' })}
        </div>
      </div>
      <div class="hero__media" data-reveal>
        ${productFrame({
          media: h.media,
          alt: h.mediaAlt,
          priority: true,
          sizes: HERO_SIZES,
        })}
      </div>
      <ul class="hero__proof" data-reveal>${proof}</ul>
    </section>`;
}

export function unified(c) {
  const s = c.unified;
  const cards = s.cards
    .map(
      (card) => `<li class="capability" data-reveal>
            ${iconMark(card.icon)}
            <h3>${esc(card.title)}</h3>
            <p>${esc(card.body)}</p>
          </li>`,
    )
    .join('');

  return `<section class="section brief layout-stack" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="brief__head">
        ${sectionHead({ eyebrow: s.eyebrow, title: s.title, body: s.body, id: s.id })}
        <ul class="capability-grid">${cards}</ul>
      </div>
      <div class="stack__media" data-reveal>
        ${productFrame({ media: s.media, alt: s.mediaAlt, sizes: '(max-width: 900px) 92vw, 88vw' })}
      </div>
    </section>`;
}

export function vehicle(c) {
  const s = c.vehicle;
  const notes = s.points
    .map(
      (point) => `<li>
            <h3>${esc(point.title)}</h3>
            <p>${esc(point.body)}</p>
          </li>`,
    )
    .join('');

  return `<section class="section stage" id="${s.id}" aria-labelledby="${s.id}-title">
      ${sectionHead({
        eyebrow: s.eyebrow,
        title: s.title,
        body: s.body,
        id: s.id,
        className: 'section-head--centered',
      })}
      <div class="stage__panel" data-reveal>
        <div class="stage__media">
          ${productFrame({
            media: s.media,
            alt: s.mediaAlt,
            sizes: '(max-width: 900px) 88vw, 38vw',
            frameClass: 'frame--flush',
          })}
        </div>
        <ul class="stage__notes">${notes}</ul>
      </div>
    </section>`;
}

export function ai(c) {
  const s = c.ai;
  const steps = s.flow
    .map(
      (step) => `<li class="flow__step">
            <h3>${esc(step.title)}</h3>
            <p>${esc(step.body)}</p>
          </li>`,
    )
    .join('');
  const governance = s.governance
    .map(
      (item) => `<li>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.body)}</p>
          </li>`,
    )
    .join('');

  // Copy first in the DOM even though this section renders mirrored: stacked on
  // a phone the reader must meet the heading before the screenshot. The mirror
  // is a desktop-only column swap, done in CSS.
  return `<section class="section split split--mirror layout-split layout-split--copy-first" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="split__copy">
        ${sectionHead({ eyebrow: s.eyebrow, title: s.title, body: s.body, id: s.id })}
        <div class="flow" data-reveal>
          <p class="flow__label">${esc(s.flowLabel)}</p>
          <ol class="flow__list">${steps}</ol>
        </div>
        <ul class="notes" data-reveal>${governance}</ul>
      </div>
      <div class="split__media" data-reveal>
        ${productFrame({ media: s.media, alt: s.mediaAlt, sizes: '(max-width: 900px) 92vw, 48vw' })}
      </div>
    </section>`;
}

export function workflow(c) {
  const s = c.workflow;
  const chain = s.chain
    .map(
      (link) => `<li class="chain__link" data-reveal>
            <h3>${esc(link.title)}</h3>
            <p>${esc(link.body)}</p>
          </li>`,
    )
    .join('');

  return `<section class="section stack layout-stack layout-stack--tiered" id="${s.id}" aria-labelledby="${s.id}-title">
      ${sectionHead({ eyebrow: s.eyebrow, title: s.title, body: s.body, id: s.id })}
      <div class="chain">
        <p class="chain__label">${esc(s.chainLabel)}</p>
        <ol class="chain__list">${chain}</ol>
      </div>
      <div class="stack__media" data-reveal>
        ${productFrame({ media: s.media, alt: s.mediaAlt, sizes: '(max-width: 900px) 92vw, 88vw' })}
      </div>
    </section>`;
}

export function communication(c) {
  const s = c.communication;
  const points = s.points
    .map(
      (point) => `<li>
            <h3>${esc(point.title)}</h3>
            <p>${esc(point.body)}</p>
          </li>`,
    )
    .join('');

  return `<section class="section split layout-split layout-split--copy-first" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="split__copy">
        ${sectionHead({ eyebrow: s.eyebrow, title: s.title, body: s.body, id: s.id })}
        <ul class="notes notes--divided" data-reveal>${points}</ul>
      </div>
      <div class="split__media" data-reveal>
        ${productFrame({ media: s.media, alt: s.mediaAlt, sizes: '(max-width: 900px) 92vw, 48vw' })}
      </div>
    </section>`;
}

export function integrations(c) {
  const s = c.integrations;
  const tile = (item) => `<li class="hub__tile" data-reveal>
            ${iconMark(item.icon)}
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.body)}</p>
          </li>`;

  // Two flanking columns around a centre node. The list order stays meaningful
  // when the diagram collapses to a single column below the desktop breakpoint.
  const half = Math.ceil(s.tiles.length / 2);
  const left = s.tiles.slice(0, half).map(tile).join('');
  const right = s.tiles.slice(half).map(tile).join('');

  return `<section class="section hub" id="${s.id}" aria-labelledby="${s.id}-title">
      ${sectionHead({
        eyebrow: s.eyebrow,
        title: s.title,
        body: s.body,
        id: s.id,
        className: 'section-head--centered',
      })}
      <div class="hub__diagram">
        <ul class="hub__column hub__column--left">${left}</ul>
        <p class="hub__core">
          <img src="/assets/synqdrive-logo.png" width="1024" height="216" alt="SynqDrive" />
        </p>
        <ul class="hub__column hub__column--right">${right}</ul>
      </div>
      <p class="hub__note">${esc(s.note)}</p>
    </section>`;
}

export function finalCta(c) {
  const s = c.cta;
  return `<section class="closing" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="closing__inner" data-reveal>
        <h2 id="${s.id}-title">${esc(s.title)}</h2>
        <p>${esc(s.body)}</p>
        <div class="closing__actions">
          ${action({ href: 'mailto:info@synqdrive.eu?subject=SynqDrive%20demo%20request', label: s.primary, variant: 'primary' })}
          <a class="action action--ghost" href="https://app.synqdrive.eu" rel="noopener">${esc(s.secondary)}</a>
        </div>
      </div>
    </section>`;
}

export function footer(c, site) {
  const column = (title, links) => `<div>
          <h2>${esc(title)}</h2>
          <ul>
            ${links.map((link) => `<li><a href="${link.href}">${esc(link.label)}</a></li>`).join('')}
          </ul>
        </div>`;

  return `<footer class="sitefooter">
      <div class="sitefooter__inner">
        <div class="sitefooter__brand">
          <img src="/assets/synqdrive-logo.png" width="1024" height="216" alt="SynqDrive" />
          <p>${esc(c.footer.tagline)}</p>
        </div>
        <nav class="sitefooter__columns" aria-label="${esc(c.footer.columnsLabel)}">
          ${column(c.footer.platform, c.footer.links.platform)}
          ${column(c.footer.company, c.footer.links.company)}
        </nav>
      </div>
      <div class="sitefooter__legal">
        <p>&copy; ${site.year} ${esc(site.brand)}. ${esc(c.footer.rights)}</p>
        <a href="mailto:${site.links.email}">${esc(site.links.email)}</a>
      </div>
    </footer>`;
}
