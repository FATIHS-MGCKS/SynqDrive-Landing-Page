/**
 * Progressive enhancement for the public SynqDrive landing page.
 *
 * No framework and no dependencies. All landing-page sections, anchors, CTAs,
 * and footer links remain readable without JavaScript. This file adds optional
 * interaction: the Platform disclosure (pointer hover, click, keyboard), the
 * mobile navigation modal, the sticky masthead hairline, and one reveal pass.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Sticky masthead hairline ─────────────────────────────────────────── */

  var masthead = document.querySelector('[data-masthead]');

  if (masthead) {
    var setStuck = function () {
      masthead.dataset.stuck = window.scrollY > 8 ? 'true' : 'false';
    };
    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });
  }

  /* ── Platform dropdown ────────────────────────────────────────────────── */

  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('[data-dropdown]'));

  function closeDropdown(group) {
    group.dataset.open = 'false';
    var trigger = group.querySelector('[data-dropdown-trigger]');
    var menu = group.querySelector('[data-dropdown-menu]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (menu) menu.setAttribute('inert', '');
  }

  function openDropdown(group) {
    dropdowns.forEach(function (other) {
      if (other !== group) closeDropdown(other);
    });
    group.dataset.open = 'true';
    var trigger = group.querySelector('[data-dropdown-trigger]');
    var menu = group.querySelector('[data-dropdown-menu]');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (menu) menu.removeAttribute('inert');
  }

  dropdowns.forEach(function (group) {
    var trigger = group.querySelector('[data-dropdown-trigger]');
    var menu = group.querySelector('[data-dropdown-menu]');
    if (!trigger || !menu) return;

    var closeTimer = null;
    var openTimer = null;

    function cancelScheduledClose() {
      if (closeTimer !== null) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    }

    function cancelScheduledOpen() {
      if (openTimer !== null) {
        clearTimeout(openTimer);
        openTimer = null;
      }
    }

    function scheduleClose() {
      cancelScheduledClose();
      closeTimer = setTimeout(function () {
        closeDropdown(group);
      }, 120);
    }

    closeDropdown(group);

    trigger.addEventListener('click', function (event) {
      event.stopPropagation();
      cancelScheduledOpen();
      cancelScheduledClose();
      if (group.dataset.open === 'true') closeDropdown(group);
      else openDropdown(group);
    });

    // Desktop pointer: delayed hover open avoids fighting click toggles in tests and AT.
    group.addEventListener('mouseenter', function () {
      if (window.innerWidth <= 1024) return;
      cancelScheduledClose();
      cancelScheduledOpen();
      openTimer = setTimeout(function () {
        openTimer = null;
        openDropdown(group);
      }, 160);
    });

    group.addEventListener('mouseleave', function () {
      if (window.innerWidth <= 1024) return;
      cancelScheduledOpen();
      scheduleClose();
    });

    group.addEventListener('focusout', function (event) {
      if (!group.contains(event.relatedTarget)) closeDropdown(group);
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeDropdown(group);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    dropdowns.forEach(function (group) {
      if (group.dataset.open !== 'true') return;
      closeDropdown(group);
      var trigger = group.querySelector('[data-dropdown-trigger]');
      if (trigger) trigger.focus();
    });
    if (masthead && masthead.dataset.navOpen === 'true') closeDrawer(true);
  });

  document.addEventListener('click', function (event) {
    dropdowns.forEach(function (group) {
      if (!group.contains(event.target)) closeDropdown(group);
    });
  });

  /* ── Mobile navigation (modal layer) ──────────────────────────────────── */

  var navToggle = document.querySelector('[data-nav-toggle]');
  var navClose = document.querySelector('[data-nav-close]');
  var navPanel = document.querySelector('[data-nav-panel]');
  var mastheadInner = document.querySelector('.masthead__inner');
  var mainContent = document.getElementById('main');
  var siteFooter = document.querySelector('.sitefooter');
  var skipLink = document.querySelector('.skip-link');
  var navViews = navPanel
    ? Array.prototype.slice.call(navPanel.querySelectorAll('[data-nav-view]'))
    : [];
  var navRootView = navPanel ? navPanel.querySelector('[data-nav-view="root"]') : null;
  var navSubmenuTriggers = navPanel
    ? Array.prototype.slice.call(navPanel.querySelectorAll('[data-nav-submenu]'))
    : [];
  var activeSubmenuTrigger = null;
  var pendingScrollY = null;
  var savedScrollY = 0;
  var scrollLockActive = false;
  var mobileBreakpoint = 1024;

  var backgroundLayers = [mastheadInner, mainContent, siteFooter, skipLink].filter(Boolean);

  function focusableNodes(root) {
    if (!root) return [];
    return Array.prototype.slice.call(
      root.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(function (node) {
      return (
        !node.closest('[hidden]') &&
        node.getAttribute('aria-hidden') !== 'true' &&
        node.getAttribute('tabindex') !== '-1'
      );
    });
  }

  function readScrollY() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function lockPageScroll() {
    if (scrollLockActive) return;
    savedScrollY = pendingScrollY !== null ? pendingScrollY : readScrollY();
    if (pendingScrollY !== null && Math.abs(savedScrollY - readScrollY()) > 48) {
      savedScrollY = readScrollY();
    }
    pendingScrollY = null;
    scrollLockActive = true;
    document.documentElement.dataset.navScrollLock = 'true';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + savedScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }

  function unlockPageScroll() {
    if (!scrollLockActive) return;
    var restoreY = savedScrollY;
    scrollLockActive = false;
    savedScrollY = 0;
    pendingScrollY = null;
    document.documentElement.removeAttribute('data-nav-scroll-lock');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, restoreY);
    document.documentElement.scrollTop = restoreY;
    document.body.scrollTop = restoreY;
    requestAnimationFrame(function () {
      if (Math.abs(readScrollY() - restoreY) > 2) window.scrollTo(0, restoreY);
    });
  }

  function setBackgroundInert(state) {
    backgroundLayers.forEach(function (layer) {
      if (state) layer.setAttribute('inert', '');
      else layer.removeAttribute('inert');
    });
  }

  function showRootView(returnFocus) {
    navViews.forEach(function (view) {
      var isRoot = view === navRootView;
      view.hidden = !isRoot;
      if (isRoot) view.removeAttribute('inert');
      else view.setAttribute('inert', '');
    });
    navSubmenuTriggers.forEach(function (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
    });
    if (returnFocus && activeSubmenuTrigger) activeSubmenuTrigger.focus();
    activeSubmenuTrigger = null;
  }

  function showSubmenu(trigger) {
    if (!navPanel) return;
    var name = trigger.dataset.navSubmenu;
    var target = navPanel.querySelector('[data-nav-view="' + name + '"]');
    if (!target) return;

    navViews.forEach(function (view) {
      var isTarget = view === target;
      view.hidden = !isTarget;
      if (isTarget) view.removeAttribute('inert');
      else view.setAttribute('inert', '');
    });
    navSubmenuTriggers.forEach(function (item) {
      item.setAttribute('aria-expanded', item === trigger ? 'true' : 'false');
    });
    activeSubmenuTrigger = trigger;
    var back = target.querySelector('[data-nav-back]');
    if (back) back.focus();
  }

  function closeDrawer(returnFocus) {
    if (!masthead || !navToggle || !navPanel) return;
    showRootView(false);
    masthead.dataset.navOpen = 'false';
    navPanel.hidden = true;
    navPanel.setAttribute('inert', '');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', navToggle.dataset.labelOpen);
    setBackgroundInert(false);
    unlockPageScroll();
    navPanel.removeEventListener('keydown', trapDrawerFocus);
    if (returnFocus) navToggle.focus();
  }

  function openDrawer() {
    if (!masthead || !navToggle || !navPanel) return;
    masthead.dataset.navOpen = 'true';
    navPanel.hidden = false;
    navPanel.removeAttribute('inert');
    navToggle.setAttribute('aria-expanded', 'true');
    lockPageScroll();
    setBackgroundInert(true);
    showRootView(false);
    var firstTarget = navPanel.querySelector('[data-nav-submenu]') || navClose || navPanel;
    if (firstTarget) firstTarget.focus();
    navPanel.addEventListener('keydown', trapDrawerFocus);
  }

  function trapDrawerFocus(event) {
    if (event.key !== 'Tab' || !navPanel || navPanel.hidden) return;
    var nodes = focusableNodes(navPanel);
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function initMobileNav() {
    if (!masthead || !navToggle || !navPanel) return;
    masthead.dataset.navOpen = 'false';
    navPanel.hidden = true;
    navPanel.setAttribute('inert', '');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', navToggle.dataset.labelOpen);
    showRootView(false);
  }

  if (masthead && navToggle && navPanel) {
    initMobileNav();

    navToggle.addEventListener('pointerdown', function () {
      if (masthead.dataset.navOpen !== 'true') pendingScrollY = readScrollY();
    });

    navToggle.addEventListener('click', function () {
      var open = masthead.dataset.navOpen === 'true';
      if (open) closeDrawer(true);
      else openDrawer();
    });

    if (navClose) {
      navClose.addEventListener('click', function () {
        closeDrawer(true);
      });
    }

    navSubmenuTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        showSubmenu(trigger);
      });
    });

    navPanel.addEventListener('click', function (event) {
      if (event.target.closest('[data-nav-back]')) {
        showRootView(true);
      }
    });

    navPanel.addEventListener('click', function (event) {
      if (event.target.closest('[data-nav-close]')) return;
      if (event.target.closest('a')) closeDrawer(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > mobileBreakpoint && masthead.dataset.navOpen === 'true') closeDrawer(false);
    });
  }

  /* ── Reveal pass ──────────────────────────────────────────────────────── */

  // Tells the inline safety net in <head> that the reveal pass is running, so it
  // leaves the initial hidden state in place.
  document.documentElement.dataset.reveal = 'ready';

  var revealables = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if (!revealables.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (node) {
      node.classList.add('is-revealed');
    });
    return;
  }

  // Siblings enter in sequence rather than as one block.
  var seen = new Map();
  revealables.forEach(function (node) {
    var parent = node.parentElement;
    var index = seen.get(parent) || 0;
    seen.set(parent, index + 1);
    if (index > 0) node.style.transitionDelay = Math.min(index * 80, 240) + 'ms';
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  revealables.forEach(function (node) {
    observer.observe(node);
  });
})();
