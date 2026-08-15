/**
 * Section templates for the public SynqDrive landing page.
 *
 * Eight content sections plus a closing call to action, in the order the page
 * renders them. Each section deliberately uses a different composition so the
 * page does not read as six repeated text-beside-screenshot rows:
 *
 *   hero            text column beside an upright product frame
 *   use cases       one lead industry beside a four-cell image grid
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

/** Exported so hero background preloads cannot drift from the picture art direction. */
export const HERO_BACKGROUND_MOBILE_MEDIA = '(max-width: 760px)';
export const HERO_BACKGROUND_DESKTOP_MEDIA = '(min-width: 761px)';

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
  const mobile = c.nav.mobileNav;
  const platformItems = [
    { label: c.nav.platformMenu.overview.label, href: c.nav.platformMenu.overview.href },
    { label: c.nav.platformMenu.overview.description, href: c.nav.platformMenu.overview.href },
    ...flattenPlatformMenu(c.nav.platformMenu).slice(1),
  ];

  const submenuItem = (item) => {
    if (item.href) {
      return `<li>
              <a class="mobilenav__subrow" href="${item.href}">
                <span>${esc(item.label)}</span>
                <span class="mobilenav__row-arrow">${icon('arrow-right')}</span>
              </a>
            </li>`;
    }

    const status = item.status === 'available' ? mobile.available : mobile.inProgress;
    return `<li>
              <div class="mobilenav__subrow mobilenav__subrow--static" aria-disabled="true">
                <span>${esc(item.label)}</span>
                <span class="mobilenav__badge">${esc(status)}</span>
              </div>
            </li>`;
  };

  const submenu = (id, title, items) => `<section
          class="mobilenav__view mobilenav__view--submenu"
          id="mobile-nav-${id}"
          data-nav-view="${id}"
          aria-labelledby="mobile-nav-${id}-title"
          hidden
          inert
        >
          <div class="mobilenav__subhead">
            <button
              type="button"
              class="mobilenav__back"
              data-nav-back
              aria-label="${esc(mobile.back)}"
            >
              <span class="mobilenav__back-icon">${icon('arrow-right')}</span>
            </button>
            <p class="mobilenav__subhead-title" id="mobile-nav-${id}-title">${esc(title)}</p>
          </div>
          <ul class="mobilenav__sublist">${items.map(submenuItem).join('')}</ul>
        </section>`;

  const rootSubmenuRow = (id, label) => `<li>
            <button
              type="button"
              class="mobilenav__row"
              data-nav-submenu="${id}"
              aria-expanded="false"
              aria-controls="mobile-nav-${id}"
            >
              <span>${esc(label)}</span>
              <span class="mobilenav__row-chevron">${icon('arrow-right')}</span>
            </button>
          </li>`;

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
          <a class="brand mobilenav__brand" href="${c.dir}" tabindex="-1" aria-label="${esc(c.nav.home)}">
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
          <section
            class="mobilenav__view mobilenav__view--root"
            data-nav-view="root"
            aria-labelledby="mobile-nav-title"
          >
            <p class="sr-only" id="mobile-nav-title">${esc(mobile.rootTitle)}</p>
            <ul class="mobilenav__root-list">
              ${rootSubmenuRow('platform', c.nav.platform)}
              ${rootSubmenuRow('products', mobile.categories.products)}
              ${rootSubmenuRow('industries', mobile.categories.industries)}
              <li>
                <a class="mobilenav__row" href="#${site.sectionIds.integrations}">
                  <span>${esc(mobile.categories.integrations)}</span>
                </a>
              </li>
              ${rootSubmenuRow('resources', mobile.categories.resources)}
              <li>
                <button type="button" class="mobilenav__row mobilenav__row--unavailable" aria-disabled="true">
                  <span>${esc(mobile.categories.pricing)}</span>
                  <span class="mobilenav__badge">${esc(mobile.inProgress)}</span>
                </button>
              </li>
              <li>
                <a class="mobilenav__row" href="${site.links.app}" rel="noopener">
                  <span>${esc(c.nav.login)}</span>
                </a>
              </li>
            </ul>

            <div class="mobilenav__bottom">
              <div class="mobilenav__actions">
                ${action({ href: site.links.demo, label: c.nav.demo, variant: 'primary', className: 'mobilenav__demo' })}
                <a class="action action--secondary mobilenav__sales" href="${site.links.contact}">${esc(mobile.sales)}</a>
              </div>
              <div class="mobilenav__locale" role="group" aria-label="${esc(mobile.languageLabel)}">
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
          </section>
          ${submenu('platform', c.nav.platform, platformItems)}
          ${submenu('products', mobile.categories.products, mobile.products)}
          ${submenu('industries', mobile.categories.industries, mobile.industries)}
          ${submenu('resources', mobile.categories.resources, mobile.resources)}
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
    </header>
    ${mobileNav}`;
}

export function hero(c) {
  const h = c.hero;
  const bg = h.background;

  return `<section class="hero hero--fleet-background" aria-labelledby="hero-title">
      <picture class="hero__background" aria-hidden="true">
        <source
          media="${HERO_BACKGROUND_MOBILE_MEDIA}"
          srcset="/assets/${esc(bg.mobile.file)}.webp"
          width="${bg.mobile.width}"
          height="${bg.mobile.height}"
        />
        <source
          media="${HERO_BACKGROUND_DESKTOP_MEDIA}"
          srcset="/assets/${esc(bg.file)}.webp"
          width="${bg.width}"
          height="${bg.height}"
        />
        <img
          src="/assets/${esc(bg.mobile.file)}.webp"
          width="${bg.mobile.width}"
          height="${bg.mobile.height}"
          alt=""
          loading="eager"
          decoding="sync"
          fetchpriority="high"
        />
      </picture>
      <div class="hero__shell">
        <div class="hero__intro">
          <p class="eyebrow" data-reveal>${esc(h.eyebrow)}</p>
          <h1 id="hero-title" data-reveal>
            <span class="hero__title-main">${esc(h.title.main)}</span>
            <span class="hero__title-emphasis">${esc(h.title.emphasis)}</span>
          </h1>
          <p class="hero__body" data-reveal>${esc(h.body)}</p>
          <div class="hero__actions" data-reveal>
            ${action({ href: 'mailto:info@synqdrive.eu?subject=SynqDrive%20demo%20request', label: h.primary, variant: 'primary' })}
            ${action({ href: `#${c.unified.id}`, label: h.secondary, variant: 'secondary' })}
          </div>
        </div>
      </div>
    </section>`;
}

function useCaseFeatures(features) {
  if (!features || !features.length) return '';

  const items = features
    .map(
      (feature) => `<li class="use-case-card__feature">
            <h4>${esc(feature.title)}</h4>
            <p>${esc(feature.body)}</p>
          </li>`,
    )
    .join('');

  return `<ul class="use-case-card__features">${items}</ul>`;
}

export function useCases(c) {
  const s = c.useCases;
  const items = s.items
    .map((item, index) => {
      const media = item.media;
      const cardId = `${s.id}-${item.key}`;
      const status = item.status
        ? `<span class="use-case-card__status">${esc(item.status)}</span>`
        : '';
      const leadClass = index === 0 ? ' use-case-card--lead' : '';
      const features = useCaseFeatures(item.features);

      return `<li
          class="use-case-card use-case-card--${esc(item.key)}${leadClass}"
          data-use-case-card="${esc(item.key)}"
          data-reveal
        >
          <button
            type="button"
            class="use-case-card__trigger"
            id="${esc(cardId)}-trigger"
            aria-expanded="false"
            aria-controls="${esc(cardId)}-panel"
          >
            <div class="use-case-card__media">
              <img
                src="/assets/${esc(media.file)}.webp"
                width="${media.width}"
                height="${media.height}"
                alt="${esc(item.mediaAlt)}"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="use-case-card__content">
              <div class="use-case-card__heading">
                <h3 id="${esc(cardId)}-title">${esc(item.title)}</h3>
                ${status}
                <span class="use-case-card__chevron" aria-hidden="true">${icon('chevron-down')}</span>
              </div>
              <p class="use-case-card__intro">${esc(item.body)}</p>
            </div>
          </button>
          <div
            class="use-case-card__panel"
            id="${esc(cardId)}-panel"
            role="region"
            aria-labelledby="${esc(cardId)}-title"
            hidden
            inert
          >
            <div class="use-case-card__panel-inner">${features}</div>
          </div>
        </li>`;
    })
    .join('');

  return `<section class="section use-cases" id="${s.id}" aria-labelledby="${s.id}-title">
      ${sectionHead({ eyebrow: null, title: s.title, body: s.body, id: s.id })}
      <ul class="use-cases__grid">${items}</ul>
    </section>`;
}

export function unified(c) {
  const s = c.unified;
  const cards = s.cards
    .map(
      (card) => `<li class="capability capability--compact surface surface--compact" data-reveal>
            ${iconMark(card.icon)}
            <h3>${esc(card.title)}</h3>
            <p>${esc(card.body)}</p>
          </li>`,
    )
    .join('');

  /* Mobile source order: intro → product → capabilities. Desktop grid restores
     head beside capability cards with the product frame full width below. */
  return `<section class="section brief layout-stack brief--product-led" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="brief__intro">
        ${sectionHead({ eyebrow: s.eyebrow, title: s.title, body: s.body, id: s.id })}
      </div>
      <div class="stack__media" data-reveal>
        ${productFrame({ media: s.media, alt: s.mediaAlt, sizes: '(max-width: 900px) 92vw, 88vw' })}
      </div>
      <ul class="capability-grid">${cards}</ul>
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
      (step) => `<li class="flow__step flow__step--compact surface surface--compact">
            <h3>${esc(step.title)}</h3>
            <p>${esc(step.body)}</p>
          </li>`,
    )
    .join('');
  const governance = s.governance
    .map(
      (item) => `<li class="notes__item notes__item--compact surface surface--compact">
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.body)}</p>
          </li>`,
    )
    .join('');

  /* Mobile source order: intro → product → supporting explanation. Desktop grid
     restores mirrored split with product left and copy/process right. */
  return `<section class="section split split--mirror layout-split split--product-led" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="split__intro">
        ${sectionHead({ eyebrow: s.eyebrow, title: s.title, body: s.body, id: s.id })}
      </div>
      <div class="split__media" data-reveal>
        ${productFrame({ media: s.media, alt: s.mediaAlt, sizes: '(max-width: 900px) 92vw, 48vw' })}
      </div>
      <div class="split__support" data-reveal>
        <div class="flow flow--compact">
          <p class="flow__label">${esc(s.flowLabel)}</p>
          <ol class="flow__list">${steps}</ol>
        </div>
        <ul class="notes notes--compact">${governance}</ul>
      </div>
    </section>`;
}

export function workflow(c) {
  const s = c.workflow;
  const chain = s.chain
    .map(
      (link) => `<li class="chain__link chain__link--compact surface surface--compact" data-reveal>
            <h3>${esc(link.title)}</h3>
            <p>${esc(link.body)}</p>
          </li>`,
    )
    .join('');

  return `<section class="section stack layout-stack layout-stack--tiered workflow--compact" id="${s.id}" aria-labelledby="${s.id}-title">
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
      (point) => `<li class="notes__item notes__item--compact surface surface--compact">
            <h3>${esc(point.title)}</h3>
            <p>${esc(point.body)}</p>
          </li>`,
    )
    .join('');

  /* Mobile source order: intro → conversation product → operational context notes.
     Desktop grid restores mirrored split with product left and intro + notes right. */
  return `<section class="section split split--mirror layout-split communication--product-led" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="split__intro">
        ${sectionHead({ eyebrow: s.eyebrow, title: s.title, body: s.body, id: s.id })}
      </div>
      <div class="split__media" data-reveal>
        ${productFrame({ media: s.media, alt: s.mediaAlt, sizes: '(max-width: 900px) 92vw, 48vw' })}
      </div>
      <div class="split__support" data-reveal>
        <ul class="notes notes--compact">${points}</ul>
      </div>
    </section>`;
}

export function integrations(c) {
  const s = c.integrations;
  const tile = (item) => `<li class="hub__tile hub__tile--compact surface surface--compact" data-reveal>
            ${iconMark(item.icon)}
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.body)}</p>
          </li>`;

  const half = Math.ceil(s.tiles.length / 2);
  const left = s.tiles.slice(0, half).map(tile).join('');
  const right = s.tiles.slice(half).map(tile).join('');

  return `<section class="section hub hub--compact" id="${s.id}" aria-labelledby="${s.id}-title">
      ${sectionHead({
        eyebrow: s.eyebrow,
        title: s.title,
        body: s.body,
        id: s.id,
        className: 'section-head--centered',
      })}
      <div class="hub__diagram">
        <div class="hub__core">
          <img src="/assets/synqdrive-logo.png" width="1024" height="216" alt="SynqDrive" />
          <p class="hub__core-label">${esc(s.hubLabel)}</p>
        </div>
        <ul class="hub__column hub__column--left">${left}</ul>
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
