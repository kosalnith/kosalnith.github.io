/**
 * components.js — Shared site components for kosalnith.github.io
 *
 * HOW TO USE ON EACH PAGE:
 *   1. Add <div id="site-header"></div> where your <header> used to be.
 *   2. Add <div id="site-footer"></div> where your <footer> (+ pre-footer) used to be.
 *   3. Remove the old back-to-top <button> and its inline <script> block.
 *   4. Add script tags at the bottom of <body> in this exact order:
 *        <script src="static/js/components.js"></script>   ← MUST be first
 *        <script src="static/js/darkmode.js"></script>
 *        <script src="static/js/search.js"></script>
 *
 * TO UPDATE header/footer/back-to-top across ALL pages:
 *   Edit this file only — every page picks up the change automatically.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     1. CONFIGURATION
     Edit nav items, social links, footer links here.
  ───────────────────────────────────────────── */

  const SITE_URL = 'https://kosalnith.github.io';

  // ═══════════════════════════════════════════════════════════════
  // CASE 1 — Pages WITH their own nav item
  // Add the page here and it appears in the top navigation bar.
  // The nav item is highlighted automatically when on that page.
  //
  // Example: adding 'gallery.html' as a new top-level nav item:
  //   { label: 'Gallery', href: 'gallery.html' },
  // ═══════════════════════════════════════════════════════════════
  const NAV_ITEMS = [
    { label: 'Home',          href: 'index.html' },
    { label: 'Research',      href: 'research.html' },
    { label: 'Activity',      href: 'activity.html' },
    { label: 'Press',         href: 'press.html' },
    { label: 'Teaching',      href: 'teaching.html' },
    { label: 'Miscellaneous', href: 'miscellaneous.html' },
    { label: 'Blog',          href: 'https://kosalnith.substack.com', external: true },
    { label: 'Personal',      href: 'personal.html' },
    { label: 'Gallery',       href: 'gallery.html' },
  ];

  // ═══════════════════════════════════════════════════════════════
  // CASE 2 — Pages WITHOUT their own nav item (sub-pages)
  // Add the page here so its parent nav item gets highlighted.
  //
  // Format:  'your-page.html' : 'parent-nav-item.html',
  //
  // Example: 'vietnam.html' lives under Personal, so:
  //   'vietnam.html': 'personal.html',
  //
  // The value (right side) MUST match an href in NAV_ITEMS above.
  // ═══════════════════════════════════════════════════════════════
  const PAGE_PARENTS = {
    // ── Personal sub-pages ──────────────────────────
    'work.html':      'personal.html',
    'explore.html':   'personal.html',
    'travelmap.html': 'personal.html',
    'friends.html':   'personal.html',
    'foot.html':      'personal.html',
    'trees.html':     'personal.html',
    'food.html':      'personal.html',
    'vietnam.html':   'personal.html',

    // ── Research sub-pages ───────────────────────────
    // 'new-paper.html':  'research.html',

    // ── Activity sub-pages ───────────────────────────
    // 'conference.html': 'activity.html',
  };

  const SOCIAL_LINKS = [
    { title: 'Google Scholar', href: 'https://scholar.google.com/citations?user=LG2mrO4AAAAJ&hl=en', icon: 'fa fa-google' },
    { title: 'GitHub',         href: 'https://github.com/kosalnith',                                  icon: 'fa fa-github' },
    { title: 'Twitter / X',    href: 'https://twitter.com/kosalnith',                                 icon: 'fa-brands fa-x-twitter' },
    { title: 'Instagram',      href: 'https://www.instagram.com/kosalnith',                           icon: 'fa fa-instagram' },
    { title: 'Facebook',       href: 'https://www.facebook.com/kosalnith26',                          icon: 'fa fa-facebook-square' },
    { title: 'LinkedIn',       href: 'https://www.linkedin.com/in/kosalnith',                         icon: 'fa fa-linkedin' },
    { title: 'YouTube',        href: 'https://www.youtube.com/kosalnith',                             icon: 'fa fa-youtube-play' },
  ];

  const FOOTER_LINKS = [
    { label: 'Research',      href: SITE_URL + '/research.html' },
    { label: 'Activity',      href: SITE_URL + '/activity.html' },
    { label: 'Press',         href: SITE_URL + '/press.html' },
    { label: 'Miscellaneous', href: SITE_URL + '/miscellaneous.html' },
    { label: 'Updates',       href: SITE_URL + '/updates.html' },
    { label: 'Travel Map',    href: SITE_URL + '/travelmap.html' },
  ];

  const FOOTER_ORG     = 'Center for Development Economics and Trade, Cambodia Development Resource Institute';
  const FOOTER_ADDRESS = 'No. 56, Street 315, Sangkat Boeng Kak II, Khan Tuol Touk, 120508, Phnom Penh, Cambodia';
  const COPYRIGHT_YEAR_START = 2018;


  /* ─────────────────────────────────────────────
     2. SHARED HEAD ELEMENTS
     Favicons and common meta tags injected into
     every page's <head> automatically.
     Do NOT put page-specific tags here (title,
     og:url, og:title, canonical — those stay
     in each page's own <head>).
  ───────────────────────────────────────────── */

  function injectHead() {
    const tags = `
      <!-- Modernizr: feature detection, same on every page -->
      <script src="/static/js/modernizr.min.js"></script>
      <script src="/static/js/modernizr-additional-tests.js"></script>

      <!-- Google Analytics: same tracking ID on every page -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-FXRBQVKK80"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-FXRBQVKK80');
      </script>
      <link rel="icon" href="static/img/favion/kosal.ico" type="image/vnd.microsoft.icon">
      <link rel="apple-touch-icon" sizes="60x60"  href="static/img/icon/apple-touch-icon-60x60.png">
      <link rel="apple-touch-icon" sizes="72x72"  href="static/img/icon/apple-touch-icon-72x72.png">
      <link rel="apple-touch-icon" sizes="76x76"  href="static/img/icon/apple-touch-icon-76x76.png">
      <link rel="apple-touch-icon" sizes="114x114" href="static/img/icon/apple-touch-icon-114x114.png">
      <link rel="apple-touch-icon" sizes="120x120" href="static/img/icon/apple-touch-icon-120x120.png">
      <link rel="apple-touch-icon" sizes="144x144" href="static/img/icon/apple-touch-icon-144x144.png">
      <link rel="apple-touch-icon" sizes="152x152" href="static/img/icon/apple-touch-icon-152x152.png">
      <link rel="apple-touch-icon" sizes="180x180" href="static/img/icon/apple-touch-icon-180x180.png">
      <link rel="icon" type="image/png" href="static/img/icon/favicon-196x196.png" sizes="196x196">
      <link rel="icon" type="image/png" href="static/img/icon/favicon-192x192.png" sizes="192x192">
      <link rel="icon" type="image/png" href="static/img/icon/favicon-128.png"     sizes="128x128">
      <link rel="icon" type="image/png" href="static/img/icon/favicon-96x96.png"   sizes="96x96">
      <link rel="icon" type="image/png" href="static/img/icon/favicon-32x32.png"   sizes="32x32">
      <link rel="icon" type="image/png" href="static/img/icon/favicon-16x16.png"   sizes="16x16">
      <link rel="mask-icon" href="static/img/icon/safari-pinned-tab.svg" color="#ffffff">
      <meta name="application-name"            content="Kosal Nith">
      <meta name="Generator"                   content="Kosal Nith Personal Site">
      <meta name="MobileOptimized"             content="width">
      <meta name="HandheldFriendly"            content="true">
      <meta name="msapplication-TileColor"     content="#FFFFFF">
      <meta name="msapplication-TileImage"     content="https://www-media.stanford.edu/assets/favicon/mstile-144x144.png">
      <meta name="msapplication-square70x70logo"   content="https://www-media.stanford.edu/assets/favicon/mstile-70x70.png">
      <meta name="msapplication-square150x150logo" content="https://www-media.stanford.edu/assets/favicon/mstile-150x150.png">
      <meta name="msapplication-square310x310logo" content="https://www-media.stanford.edu/assets/favicon/mstile-310x310.png">
      <meta property="og:site_name" content="Kosal Nith">
      <meta property="og:type"      content="website">
      <meta name="twitter:card"     content="summary_large_image">
    `;
    // Avoid duplicating if already injected
    if (document.querySelector('link[href="static/img/favion/kosal.ico"]')) return;
    document.head.insertAdjacentHTML('beforeend', tags);
  }

  /* ─────────────────────────────────────────────
     3. HELPERS
  ───────────────────────────────────────────── */

  /** Detect the current page filename (e.g. "personal.html") */
  function currentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  /** Mark the active nav item based on current URL (supports sub-page mapping) */
  function markActiveNav(navEl) {
    const page = currentPage();
    // If this page is a sub-page, resolve it to its parent nav href
    const activePage = PAGE_PARENTS[page] || page;
    navEl.querySelectorAll('.su-multi-menu__item').forEach(function (li) {
      const a = li.querySelector('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const isActive = href === activePage || (activePage === '' && href === 'index.html');
      if (isActive) {
        li.classList.add('su-multi-menu__item--active-trail', 'su-multi-menu__item--current');
        a.setAttribute('aria-current', 'true');
      } else {
        li.classList.remove('su-multi-menu__item--active-trail', 'su-multi-menu__item--current');
        a.removeAttribute('aria-current');
      }
    });
  }

  /* ─────────────────────────────────────────────
     3. HEADER HTML
  ───────────────────────────────────────────── */

  function buildHeader() {
    const navItems = NAV_ITEMS.map(function (item) {
      return '<li class="su-multi-menu__item">' +
        '<a class="su-multi-menu__link" href="' + item.href + '"' +
        (item.external ? ' rel="noopener noreferrer"' : '') + '>' +
        '<span class="su-multi-menu__link-text-wrapper">' + item.label + '</span>' +
        '</a></li>';
    }).join('\n      ');

    return `
<header class="su-masthead su-masthead--right">
  <a href="#main-content" class="visually-hidden focusable su-skipnav su-skipnav--content">Skip to main content</a>
  <a href="#secondary-navigation" class="visually-hidden focusable su-skipnav su-skipnav--secondary">Skip to secondary navigation</a>

  <div class="su-brand-bar su-brand-bar--default">
    <div class="su-brand-bar__container">
      <a class="su-brand-bar__logo" href="${SITE_URL}">
        <span class="su-brand-bar__link--a11y"> (link is external)</span>
      </a>
    </div>
  </div>

  <section>
    <div id="block-stanford-basic-branding" class="su-lockup su-lockup--option-a">
      <a href="${SITE_URL}">
        <div class="su-lockup__cell1">
          <div class="su-lockup__wordmark-wrapper">
            <span class="su-lockup__wordmark">Kosal</span>
          </div>
        </div>
        <div class="su-lockup__cell2">
          <span class="su-lockup__line1">Nith.</span>
        </div>
        <div class="su-lockup__line5"></div>
      </a>
    </div>

    <div id="block-stanford-basic-main-navigation" class="system-menu-block main">
      <nav class="su-multi-menu su-multi-menu--buttons su-multi-menu--right no-js" aria-label="main menu">
        <button class="su-multi-menu__nav-toggle su-multi-menu__nav-toggle--right" aria-expanded="false">Menu</button>
        <ul class="su-multi-menu__menu su-multi-menu__menu-lv1">
          ${navItems}
          <li class="su-multi-menu__item dm-toggle-li" id="dm-toggle-li"></li>
        </ul>
      </nav>
    </div>
  </section>
</header>`;
  }

  /* ─────────────────────────────────────────────
     4. PRE-FOOTER + FOOTER HTML
  ───────────────────────────────────────────── */

  function buildFooter() {
    const socialItems = SOCIAL_LINKS.map(function (s) {
      return `<li><a title="${s.title}" class="xsu-link" data-ga-label="${s.title}" href="${s.href}">` +
        `<span class="${s.icon}" aria-hidden="true"></span>` +
        `<span class="sr-only-text">${s.title}</span></a></li>`;
    }).join('\n        ');

    const footerNavItems = FOOTER_LINKS.map(function (l) {
      return `<li><a href="${l.href}" rel="nofollow">${l.label}` +
        `<span class="su-global-footer__link-a11y"> (link is external)</span></a></li>`;
    }).join('\n            ');

    const year = new Date().getFullYear();

    return `
<section id="footer__pre-footer" data-ga-action="Pre-footer">
  <div class="social">
    <ul data-ga-action="Social media">
      ${socialItems}
    </ul>
  </div>
</section>

<footer id="footer">
  <div class="su-global-footer">
    <div class="su-global-footer__container">
      <div class="su-global-footer__brand">
        <a id="su-logo" class="su-logo" aria-hidden="true" tabindex="-1" href="">
          <br><span class="su-global-footer__link-a11y"> (link is external)</span>
        </a>
      </div>
      <div class="su-global-footer__content">
        <nav aria-label="global footer menu">
          <ul class="su-global-footer__menu su-global-footer__menu--global">
            ${footerNavItems}
          </ul>
          <ul class="su-global-footer__menu su-global-footer__menu--policy">
            <li><a href="" rel="nofollow">${FOOTER_ORG}<span class="su-global-footer__link-a11y"> (link is external)</span></a></li>
            <br>
            <li><a href="" rel="nofollow">${FOOTER_ADDRESS}<span class="su-global-footer__link-a11y"> (link is external)</span></a></li>
          </ul>
        </nav>
        <div class="su-global-footer__copyright">
          <span> &copy; ${COPYRIGHT_YEAR_START} &ndash; ${year} Kosal Nith. </span>
          <span>All Rights Reserved.</span>
        </div>
      </div>
    </div>
  </div>
</footer>`;
  }

  /* ─────────────────────────────────────────────
     5. BACK TO TOP BUTTON
  ───────────────────────────────────────────── */

  function buildBackToTop() {
    return `<button id="back-to-top" style="display:none;" aria-label="Back to top">
  <span class="fas fa-chevron-up"></span>
  Back to Top
</button>`;
  }

  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    var scrollTimeout;
    window.addEventListener('scroll', function () {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        btn.style.display = window.pageYOffset > 300 ? 'block' : 'none';
      }, 100);
    }, { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (_) {
        window.scrollTo(0, 0);
      }
    });
  }

  /* ─────────────────────────────────────────────
     6. INJECT EVERYTHING
  ───────────────────────────────────────────── */

  /** Injects the common site JS bundle into <body> (only once) */
  function injectBodyScript() {
    var scriptSrc = 'static/js/js_JBbJf6RwtYhWtZ0OWen2_GCykwMhsYkgnDCUtmawjXI.js';
    if (document.querySelector('script[src="' + scriptSrc + '"]')) return;
    var s = document.createElement('script');
    s.src = scriptSrc;
    document.body.appendChild(s);
  }

  function inject() {
    // --- Head tags ---
    injectHead();

    // --- Common body script (Drupal/site JS, same on every page) ---
    injectBodyScript();

    // --- Header ---
    var headerSlot = document.getElementById('site-header');
    if (headerSlot) {
      headerSlot.outerHTML = buildHeader();
      // Mark active nav after injection
      var nav = document.querySelector('.su-multi-menu');
      if (nav) markActiveNav(nav);
    }

    // --- Footer ---
    var footerSlot = document.getElementById('site-footer');
    if (footerSlot) {
      footerSlot.outerHTML = buildFooter();
    }

    // --- Back to Top ---
    // Inject before </body> if not already present
    if (!document.getElementById('back-to-top')) {
      document.body.insertAdjacentHTML('beforeend', buildBackToTop());
    }
    initBackToTop();

    // --- Leaflet map fix ---
    // If this page has a Leaflet map, the header injection shifts the layout.
    // Call invalidateSize() after a short delay so the map recalculates its dimensions.
    fixLeafletMap();
  }

  function fixLeafletMap() {
    // Only run if Leaflet is loaded on this page
    if (typeof L === 'undefined') return;
    setTimeout(function () {
      // Find every element that Leaflet has attached a map instance to
      document.querySelectorAll('.leaflet-container').forEach(function (el) {
        // Leaflet attaches the map object to the container via _leaflet_id
        var id = el._leaflet_id;
        if (!id) return;
        // Walk Leaflet's internal map registry to find the matching instance
        Object.keys(L.Map._instances || {}).forEach(function (key) {
          var m = L.Map._instances[key];
          if (m && m.getContainer && m.getContainer() === el) {
            m.invalidateSize();
          }
        });
      });
    }, 300);
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
