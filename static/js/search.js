/**
 * search.js  —  Global site search for kosalnith.github.io
 *
 * Coverage:
 *  ① Static HTML pages  — fetched and parsed (headings, paragraphs, lists, tables)
 *  ② research_data.js   — publications[] : title, authors, abstract, journal,
 *                          keywords, sdgs, year, type  →  deep-links to ?pub=<id>
 *  ③ activity-data.js   — activities[]  : title, date, location, role, description
 *  ④ updates-data.js    — updatesData[] : news items (HTML stripped)
 *  ⑤ travel/explore     — if mapData / placesData / tripsData arrays exist on the
 *                          page these are indexed too (location names, countries,
 *                          descriptions) so the travel-map section is searchable
 *  ⑥ Sub-page aware     — pages that use URL params (?pub=, ?trip=, ?country=…)
 *                          get proper deep-link URLs in results
 *
 * Drop-in replacement: no changes needed to any HTML or data files.
 */
(function () {

  /* =========================================================================
     1.  PAGE MANIFEST
     All fetchable static pages. Dynamic data (research, activities, updates,
     travel) is indexed separately via indexDynamicData().
  ========================================================================= */
  var PAGES = [
    { url: 'index.html',         label: 'Home' },
    { url: 'bio.html',           label: 'Bio' },
    { url: 'research.html',      label: 'Research' },
    { url: 'press.html',         label: 'Press' },
    { url: 'teaching.html',      label: 'Teaching' },
    { url: 'miscellaneous.html', label: 'Miscellaneous' },
    { url: 'personal.html',      label: 'Personal' },
    { url: 'events.html',        label: 'Events' },
    { url: 'explore.html',       label: 'Explore' },
    { url: 'food.html',          label: 'Food' },
    { url: 'foot.html',          label: 'Foot' },
    { url: 'friends.html',       label: 'Friends' },
    { url: 'pastevents.html',    label: 'Past Events' },
    { url: 'trees.html',         label: 'Trees' },
    { url: 'updates.html',       label: 'Updates' },
    { url: 'work.html',          label: 'Work' },
    { url: 'activity.html',      label: 'Activities' },
    { url: 'cv.html',            label: 'CV' },
    { url: 'contact.html',       label: 'Contact' },
    { url: 'travelmap.html',     label: 'Travel Map' },
  ];

  var INDEX = [], loaded = false, loading = false, activeIdx = -1;

  /* =========================================================================
     2.  CSS  (all !important to survive site cascade)
  ========================================================================= */
  var styleEl = document.createElement('style');
  styleEl.textContent = [
    '#site-search-btn{display:inline-flex!important;align-items:center!important;gap:6px!important;background:transparent!important;border:none!important;border-radius:0!important;padding:0 0 0.8em 0!important;cursor:pointer!important;color:#b1040e!important;font-size:1.9rem!important;font-weight:600!important;line-height:1!important;white-space:nowrap!important;transition:color .3s ease-out!important;font-family:inherit!important;text-decoration:none!important;box-shadow:none!important;letter-spacing:0!important;position:relative!important}',
    '#site-search-btn:hover{background:transparent!important;border:none!important;color:#2e2d29!important;text-decoration:underline!important}',
    '#site-search-btn span{font-size:1.9rem!important;color:inherit!important;font-weight:600!important}',
    '#site-search-btn svg{width:16px!important;height:16px!important;color:inherit!important;opacity:0.75!important;flex-shrink:0!important}',
    '@media(min-width:992px){.su-multi-menu__menu-lv1>li:has(#site-search-btn){display:flex!important;align-items:center!important;align-self:center!important}#site-search-btn{padding:0!important;align-self:center!important}}',
    'html.dark-mode #site-search-btn{color:#fff!important}html.dark-mode #site-search-btn:hover{color:#fff!important;background:transparent!important}html.dark-mode #site-search-btn svg{color:#fff!important}',
    '@media(max-width:991px){#site-search-btn{display:flex!important;align-items:center!important;gap:8px!important;width:100%!important;margin:0!important;padding:1.6rem 0 1.6rem 2.4rem!important;background:transparent!important;border:none!important;border-bottom:1px solid #53565a!important;border-radius:0!important;color:#fff!important;font-size:1.8rem!important;font-weight:600!important;font-family:inherit!important;text-align:left!important;justify-content:flex-start!important;box-shadow:none!important;cursor:pointer!important;white-space:nowrap!important;letter-spacing:0!important;line-height:1.4!important;transition:none!important;text-decoration:none!important}#site-search-btn:hover,#site-search-btn:focus{background:transparent!important;text-decoration:none!important;outline:none!important}#site-search-btn span{color:#fff!important;font-size:1.8rem!important;font-weight:600!important}#site-search-btn svg{color:#fff!important;opacity:1!important;width:18px!important;height:18px!important;flex-shrink:0!important}}',
    /* OVERLAY */
    '#ss-overlay{display:none!important;position:fixed!important;inset:0!important;background:rgba(0,0,0,0.42)!important;backdrop-filter:blur(7px)!important;-webkit-backdrop-filter:blur(7px)!important;z-index:99998!important}',
    '#ss-overlay.open{display:block!important;animation:ssOvIn .15s ease!important}',
    '@keyframes ssOvIn{from{opacity:0}to{opacity:1}}',
    /* MODAL */
    '#ss-modal{display:none!important;position:fixed!important;top:clamp(50px,7vh,100px)!important;left:50%!important;transform:translateX(-50%)!important;width:min(860px,94vw)!important;background:#ffffff!important;border-radius:24px!important;box-shadow:0 48px 120px rgba(0,0,0,.28),0 4px 24px rgba(0,0,0,.1)!important;z-index:99999!important;overflow:hidden!important;padding:0!important;margin:0!important}',
    '#ss-modal.open{display:block!important;animation:ssMdIn .22s cubic-bezier(.34,1.3,.64,1)!important}',
    '@keyframes ssMdIn{from{opacity:0;transform:translateX(-50%) translateY(-22px) scale(.95)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}',
    /* Dark mode */
    'html.dark-mode #ss-overlay{background:rgba(0,0,0,0.65)!important}',
    'html.dark-mode #ss-modal{background:#1e1e1c!important;box-shadow:0 48px 120px rgba(0,0,0,.6),0 4px 24px rgba(0,0,0,.4)!important}',
    'html.dark-mode #ss-input-row{background:#1e1e1c!important;border-bottom-color:#3a3836!important}',
    'html.dark-mode #ss-search-icon{color:#c0392b!important}',
    'html.dark-mode #ss-input{color:#f7f6f3!important;background:transparent!important;caret-color:#c0392b!important}',
    'html.dark-mode #ss-input::placeholder{color:#666!important}',
    'html.dark-mode #ss-clear-btn{background:#333!important;color:#aaa!important}',
    'html.dark-mode #ss-clear-btn:hover{background:#444!important;color:#f7f6f3!important}',
    'html.dark-mode #ss-esc-hint{color:#c0392b!important;border-color:rgba(192,57,43,0.4)!important;background:rgba(192,57,43,0.08)!important}',
    'html.dark-mode #ss-results{background:#1e1e1c!important}',
    'html.dark-mode #ss-results::-webkit-scrollbar-thumb{background:#444!important}',
    'html.dark-mode .ss-status{color:#666!important}html.dark-mode .ss-status strong{color:#aaa!important}',
    'html.dark-mode .ss-page-label{color:#c0392b!important}html.dark-mode .ss-page-label::after{background:#3a3836!important}',
    'html.dark-mode .ss-item{color:#f7f6f3!important}html.dark-mode .ss-item:hover,html.dark-mode .ss-item.ss-active{background:#2a2a28!important}',
    'html.dark-mode .ss-item-icon{background:#2a2a28!important}html.dark-mode .ss-item-title{color:#f7f6f3!important}html.dark-mode .ss-item-snippet{color:#888!important}',
    'html.dark-mode mark.ss-hl{background:#5a3a1a!important;color:#f7c59f!important}',
    'html.dark-mode #ss-footer{background:#1e1e1c!important;border-top-color:#3a3836!important}',
    'html.dark-mode .ss-hints{background:transparent!important}html.dark-mode .ss-hint{color:#666!important}',
    'html.dark-mode kbd{background:rgba(192,57,43,0.1)!important;color:#c0392b!important;border-color:rgba(192,57,43,0.3)!important}',

    /* Category badges */
    '.ss-badge{display:inline-block!important;font-size:10px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:.06em!important;padding:2px 7px!important;border-radius:20px!important;margin-left:8px!important;vertical-align:middle!important;flex-shrink:0!important}',
    '.ss-badge--research{background:#fff0f0!important;color:#8c1515!important}',
    '.ss-badge--activity{background:#f0f4ff!important;color:#1a3a8c!important}',
    '.ss-badge--update{background:#f0fff4!important;color:#1a6b3a!important}',
    '.ss-badge--travel{background:#fff8f0!important;color:#8c5a00!important}',
    'html.dark-mode .ss-badge--research{background:rgba(140,21,21,0.2)!important;color:#e07070!important}',
    'html.dark-mode .ss-badge--activity{background:rgba(26,58,140,0.2)!important;color:#7090e0!important}',
    'html.dark-mode .ss-badge--update{background:rgba(26,107,58,0.2)!important;color:#70c090!important}',
    'html.dark-mode .ss-badge--travel{background:rgba(140,90,0,0.2)!important;color:#e0b060!important}',
    /* Input row */
    '#ss-input-row{display:flex!important;align-items:center!important;gap:16px!important;padding:22px 26px!important;border-bottom:2px solid #f0f0f0!important;background:#fff!important}',
    '#ss-search-icon{flex-shrink:0!important;color:#8c1515!important;opacity:0.6!important;display:flex!important;align-items:center!important}',
    '#ss-input{flex:1!important;border:none!important;outline:none!important;font-size:22px!important;font-weight:400!important;color:#111!important;background:transparent!important;caret-color:#8c1515!important;font-family:inherit!important;box-shadow:none!important;padding:0!important;margin:0!important;border-radius:0!important;line-height:1.3!important;width:auto!important;height:auto!important}',
    '#ss-input::placeholder{color:#ccc!important;font-size:22px!important}',
    '#ss-input::-webkit-search-cancel-button{display:none!important}',
    '#ss-clear-btn{background:#eee!important;border:none!important;border-radius:8px!important;width:36px!important;height:36px!important;min-width:36px!important;cursor:pointer!important;color:#888!important;font-size:16px!important;display:none!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;transition:background .12s!important;padding:0!important;line-height:1!important}',
    '#ss-clear-btn:hover{background:#ddd!important;color:#333!important}#ss-clear-btn.visible{display:flex!important}',
    '#ss-esc-hint{font-size:13px!important;color:#b1040e!important;border:1.5px solid rgba(177,4,14,0.35)!important;border-radius:8px!important;padding:6px 14px!important;flex-shrink:0!important;background:rgba(177,4,14,0.05)!important;font-family:inherit!important;font-weight:600!important;white-space:nowrap!important;line-height:1!important;letter-spacing:.04em!important;text-transform:uppercase!important;cursor:pointer!important}',
    /* Results */
    '#ss-results{max-height:460px!important;overflow-y:auto!important;padding:10px 0 14px!important;background:#fff!important}',
    '#ss-results::-webkit-scrollbar{width:5px!important}#ss-results::-webkit-scrollbar-thumb{background:#e5e5e5!important;border-radius:4px!important}',
    '.ss-status{padding:44px 30px!important;text-align:center!important;color:#ccc!important;font-size:18px!important;line-height:1.7!important;font-family:inherit!important}',
    '.ss-status strong{color:#888!important;font-size:20px!important;font-weight:600!important}',
    '.ss-no-icon{display:block!important;margin:0 auto 18px!important;color:#ddd!important}',
    '.ss-page-group{margin-top:10px!important}',
    '.ss-page-label{display:flex!important;align-items:center!important;gap:10px!important;padding:10px 26px 6px!important;font-size:13px!important;font-weight:700!important;text-transform:uppercase!important;letter-spacing:.1em!important;color:#a03030!important;font-family:inherit!important}',
    '.ss-page-label::after{content:""!important;flex:1!important;height:1px!important;background:#f5eaea!important}',
    '.ss-item{display:flex!important;align-items:center!important;gap:16px!important;padding:16px 20px!important;margin:3px 10px!important;border-radius:14px!important;text-decoration:none!important;color:#1a1a1a!important;transition:background .1s!important;cursor:pointer!important;border:none!important;box-shadow:none!important}',
    '.ss-item:hover,.ss-item.ss-active{background:#fdf3f3!important}',
    '.ss-item-icon{flex-shrink:0!important;width:46px!important;height:46px!important;min-width:46px!important;background:#f9eeee!important;border-radius:12px!important;display:flex!important;align-items:center!important;justify-content:center!important}',
    '.ss-item-icon svg{color:#8c1515!important;opacity:0.55!important}',
    '.ss-item-body{flex:1!important;min-width:0!important}',
    '.ss-item-title{font-size:18px!important;font-weight:600!important;color:#1a1a1a!important;line-height:1.35!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;display:block!important;font-family:inherit!important}',
    '.ss-item-snippet{font-size:15px!important;color:#888!important;margin-top:5px!important;line-height:1.55!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;display:block!important;font-family:inherit!important}',
    '.ss-chevron{color:#ddd!important;flex-shrink:0!important;transition:color .1s!important}',
    '.ss-item:hover .ss-chevron,.ss-item.ss-active .ss-chevron{color:#b04040!important}',
    'mark.ss-hl{background:#fff176!important;color:inherit!important;padding:0 2px!important;border-radius:3px!important;font-weight:700!important}',
    '#ss-footer{display:flex!important;align-items:center!important;justify-content:space-between!important;padding:13px 26px 15px!important;border-top:2px solid #f5f5f5!important;background:#fafafa!important}',
    '#ss-count{font-size:17px!important;color:#bbb!important;font-style:italic!important;font-family:inherit!important}',
    '.ss-hints{display:flex!important;gap:22px!important}',
    '.ss-hint{font-size:18px!important;color:#aaa!important;display:flex!important;align-items:center!important;gap:5px!important;font-family:inherit!important}',
    '.ss-hint kbd{display:inline-flex!important;align-items:center!important;justify-content:center!important;background:rgba(177,4,14,0.05)!important;border:1.5px solid rgba(177,4,14,0.2)!important;border-radius:6px!important;min-width:30px!important;height:30px!important;padding:0 10px!important;font-size:15px!important;font-family:inherit!important;color:#b1040e!important;font-weight:600!important}'
  ].join('\n');
  document.head.appendChild(styleEl);

  /* =========================================================================
     3.  SVG ICONS
  ========================================================================= */
  function ico(d, extra) {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '>' + d + '</svg>';
  }
  function icoSearch(sz, sw) {
    return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  }
  function icoResearch() { return ico('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'); }
  function icoActivity() { return ico('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'); }
  function icoUpdate()   { return ico('<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>'); }
  function icoTravel()   { return ico('<polygon points="3 11 22 2 13 21 11 13 3 11"/>'); }
  function icoFile()     { return ico('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'); }
  function icoChevron()  { return '<svg class="ss-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'; }
  function icoEmpty()    { return '<svg class="ss-no-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>'; }

  /* =========================================================================
     4.  WIDGET  (nav button + modal)
  ========================================================================= */
  function buildWidget() {
    var ul = document.querySelector('.su-multi-menu__menu-lv1');
    if (!ul) return;

    var li = document.createElement('li');
    li.className = 'su-multi-menu__item';
    li.style.cssText = 'display:flex!important;align-items:center!important;margin-left:4px!important;';
    li.innerHTML = '<button id="site-search-btn" title="Search (Ctrl+K)" aria-label="Search">' + icoSearch(17, 2.5) + '<span>Search</span></button>';
    var dmLi = document.getElementById('dm-toggle-li');
    if (dmLi) ul.insertBefore(li, dmLi); else ul.appendChild(li);

    var overlay = document.createElement('div');
    overlay.id = 'ss-overlay';
    document.body.appendChild(overlay);

    var modal = document.createElement('div');
    modal.id = 'ss-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML =
      '<div id="ss-input-row">' +
        '<span id="ss-search-icon">' + icoSearch(28, 2.2) + '</span>' +
        '<input id="ss-input" type="search" placeholder="Search publications, places, activities…" autocomplete="off" spellcheck="false" />' +
        '<button id="ss-clear-btn" title="Clear">&#10005;</button>' +
        '<span id="ss-esc-hint">esc</span>' +
      '</div>' +
      '<div id="ss-results"><div class="ss-status">Start typing to search&#8230;</div></div>' +
      '<div id="ss-footer">' +
        '<span id="ss-count"></span>' +
        '<div class="ss-hints"><span class="ss-hint"><kbd>&#8593;</kbd><kbd>&#8595;</kbd> navigate</span><span class="ss-hint"><kbd>&#8629;</kbd> open</span></div>' +
      '</div>';
    document.body.appendChild(modal);

    var btn      = document.getElementById('site-search-btn');
    var input    = document.getElementById('ss-input');
    var clearBtn = document.getElementById('ss-clear-btn');
    var resultsEl = document.getElementById('ss-results');
    var countEl  = document.getElementById('ss-count');

    function openSearch() {
      overlay.classList.add('open');
      modal.classList.add('open');
      setTimeout(function () { input.focus(); }, 50);
      if (!loaded && !loading) buildIndex();
    }
    function closeSearch() {
      overlay.classList.remove('open');
      modal.classList.remove('open');
      input.value = '';
      clearBtn.classList.remove('visible');
      resultsEl.innerHTML = '<div class="ss-status">Start typing to search&#8230;</div>';
      countEl.textContent = '';
      activeIdx = -1;
    }

    btn.addEventListener('click', openSearch);
    overlay.addEventListener('click', closeSearch);
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
      if (e.key === 'Escape' && modal.classList.contains('open')) closeSearch();
      if (modal.classList.contains('open')) handleArrows(e);
    });

    input.addEventListener('input', function () {
      var q = input.value.trim();
      clearBtn.classList.toggle('visible', q.length > 0);
      activeIdx = -1;
      if (q.length < 2) { resultsEl.innerHTML = '<div class="ss-status">Start typing to search&#8230;</div>'; countEl.textContent = ''; return; }
      if (!loaded) { resultsEl.innerHTML = '<div class="ss-status">Indexing&#8230; please wait</div>'; return; }
      renderResults(q);
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      clearBtn.classList.remove('visible');
      resultsEl.innerHTML = '<div class="ss-status">Start typing to search&#8230;</div>';
      countEl.textContent = ''; activeIdx = -1; input.focus();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var a = resultsEl.querySelector('.ss-active');
        if (a && a.href) window.location.href = a.href;
      }
    });

  }

  function handleArrows(e) {
    var items = document.querySelectorAll('#ss-results .ss-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, items.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); }
    else return;
    items.forEach(function (el, i) { el.classList.toggle('ss-active', i === activeIdx); });
    items[activeIdx].scrollIntoView({ block: 'nearest' });
  }

  /* =========================================================================
     5.  HELPERS
  ========================================================================= */
  function stripHtml(html) {
    if (!html) return '';
    var d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || d.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function push(entry) {
    if (!entry.text || entry.text.length < 4) return;
    INDEX.push(entry);
  }

  function deepLink(base, param, value) {
    if (!param || !value) return base;
    return base + (base.includes('?') ? '&' : '?') + param + '=' + encodeURIComponent(value);
  }

  /* =========================================================================
     6.  STATIC PAGE INDEXER
  ========================================================================= */
  function buildIndex() {
    loading = true;
    // Index any data already on the current page first
    indexDynamicData();

    var rem = PAGES.length;
    PAGES.forEach(function (page) {
      fetch(page.url)
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (html) { if (html) parsePageIntoIndex(html, page); })
        .catch(function () {})
        .finally(function () {
          if (--rem === 0) {
            loaded = true; loading = false;
            var q = (document.getElementById('ss-input') || {}).value;
            q = q ? q.trim() : '';
            if (q.length >= 2) {
              renderResults(q);
            } else {
              var r = document.getElementById('ss-results');
              if (r) r.innerHTML = '<div class="ss-status">Ready &#8212; ' + INDEX.length + ' entries across all pages</div>';
            }
          }
        });
    });
  }

  function parsePageIntoIndex(html, page) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    // Remove chrome that should never be in results
    ['nav', 'header', 'footer', 'script', 'style', 'noscript',
     '#site-header', '#site-footer', '.su-masthead', '.su-global-footer',
     '.su-local-footer', '#dm-toggle-li'].forEach(function (sel) {
      doc.querySelectorAll(sel).forEach(function (el) { el.remove(); });
    });
    var main = doc.querySelector('main') || doc.querySelector('.page-content') || doc.body;
    var curH = page.label;

    var SELECTORS = [
      'h1','h2','h3','h4',
      'p','li','td','.cv-row',
      // Research
      '.pub-title','.pub-authors','.pub-meta','.pub-abstract','.pub-keywords',
      // Activity
      '.activity-title','.activity-meta','.activity-desc','.su-event-list-item h2',
      // Updates / news
      '.update-item','.news-item','.whats-new-item',
      // Travel / map
      '.place-name','.place-desc','.place-card h3','.place-card p',
      '.trip-name','.trip-desc','.country-name','.location-title',
      '.map-popup','.map-label','.travel-entry',
      // Food
      '.food-name','.food-desc','.restaurant-name',
      // Bio / general
      '.kn-bio-inner p','.su-wysiwyg-text p'
    ].join(',');

    main.querySelectorAll(SELECTORS).forEach(function (node) {
      var tag  = node.tagName.toLowerCase();
      var text = node.textContent.replace(/\s+/g, ' ').trim();
      if (!text || text.length < 4) return;

      if (/^h[1-4]$/.test(tag)) {
        curH = text;
        push({ url: page.url, pageLabel: page.label, heading: text, text: text, isHeading: true, category: 'page' });
      } else if (
        node.children.length === 0 || tag === 'p' || tag === 'li' ||
        node.classList.contains('cv-row') || node.tagName === 'TD'
      ) {
        push({ url: page.url, pageLabel: page.label, heading: curH, text: text, isHeading: false, category: 'page' });
      }
    });
  }

  /* =========================================================================
     7.  DYNAMIC DATA INDEXERS
     Called immediately when modal opens (data on this page) and again after
     all static fetches complete. Deduplication in renderResults handles overlaps.
  ========================================================================= */
  function indexDynamicData() {
    indexResearchData();
    indexActivitiesData();
    indexUpdatesData();
    indexTravelData();
  }

  /* ── 7a. Research publications (research_data.js → publications[]) ───── */
  function indexResearchData() {
    if (typeof publications === 'undefined' || !Array.isArray(publications)) return;
    publications.forEach(function (pub) {
      var id    = pub.id || pub.key || '';
      var title = (pub.title || '').trim();
      var url   = id ? deepLink('research.html', 'pub', id) : 'research.html';

      if (title) push({ url: url, pageLabel: 'Research', heading: title, text: title, isHeading: true, category: 'research' });

      // Authors (array or string)
      var authors = Array.isArray(pub.authors) ? pub.authors.join(', ') : (pub.authors || '');
      if (authors) push({ url: url, pageLabel: 'Research', heading: title || 'Research', text: authors, isHeading: false, category: 'research' });

      // Abstract / description
      var abstract = stripHtml(pub.abstract || pub.description || '');
      if (abstract) push({ url: url, pageLabel: 'Research', heading: title || 'Research', text: abstract, isHeading: false, category: 'research' });

      // Venue: journal / publisher / booktitle / series / conference
      var venue = [pub.journal, pub.venue, pub.publisher, pub.booktitle, pub.series, pub.conference]
        .filter(Boolean).join(' · ');
      if (venue) push({ url: url, pageLabel: 'Research', heading: title || 'Research', text: venue + (pub.year ? ' (' + pub.year + ')' : ''), isHeading: false, category: 'research' });

      // Type / category
      if (pub.type) push({ url: url, pageLabel: 'Research', heading: title || 'Research', text: pub.type, isHeading: false, category: 'research' });

      // Keywords
      var kws = Array.isArray(pub.keywords) ? pub.keywords.join(', ') : (pub.keywords || '');
      if (kws) push({ url: url, pageLabel: 'Research', heading: title || 'Research', text: kws, isHeading: false, category: 'research' });

      // SDGs
      var sdgs = Array.isArray(pub.sdgs) ? pub.sdgs.join(', ') : (pub.sdgs || '');
      if (sdgs) push({ url: url, pageLabel: 'Research', heading: title || 'Research', text: 'SDG ' + sdgs, isHeading: false, category: 'research' });

      // Co-authors (sometimes a separate field)
      var coauthors = Array.isArray(pub.coauthors) ? pub.coauthors.join(', ') : (pub.coauthors || '');
      if (coauthors) push({ url: url, pageLabel: 'Research', heading: title || 'Research', text: coauthors, isHeading: false, category: 'research' });

      // Notes / extra text
      var notes = stripHtml(pub.note || pub.notes || pub.comment || '');
      if (notes) push({ url: url, pageLabel: 'Research', heading: title || 'Research', text: notes, isHeading: false, category: 'research' });

      // Language
      if (pub.language) push({ url: url, pageLabel: 'Research', heading: title || 'Research', text: pub.language, isHeading: false, category: 'research' });
    });
  }

  /* ── 7b. Activities (activity-data.js → activities[]) ────────────────── */
  function indexActivitiesData() {
    if (typeof activities === 'undefined' || !Array.isArray(activities)) return;
    activities.forEach(function (act) {
      var dest  = act.titleUrl || 'activity.html';
      var title = (act.title || '').trim();

      if (title) push({ url: dest, pageLabel: 'Activities', heading: title, text: title, isHeading: true, category: 'activity' });

      // Date · location · city · country · role · type
      var meta = [act.date, act.location, act.city, act.country, act.role, act.type, act.format]
        .filter(Boolean).join(' · ');
      if (meta) push({ url: dest, pageLabel: 'Activities', heading: title || 'Activity', text: meta, isHeading: false, category: 'activity' });

      // Description / notes / html
      var desc = stripHtml(act.description || act.notes || act.html || act.summary || act.abstract || '');
      if (desc) push({ url: dest, pageLabel: 'Activities', heading: title || 'Activity', text: desc, isHeading: false, category: 'activity' });

      // Organiser / institution / affiliation / host
      var org = [act.organizer, act.organiser, act.institution, act.affiliation, act.host, act.sponsor]
        .filter(Boolean).join(', ');
      if (org) push({ url: dest, pageLabel: 'Activities', heading: title || 'Activity', text: org, isHeading: false, category: 'activity' });

      // Co-presenters / co-authors
      var coauth = Array.isArray(act.coauthors) ? act.coauthors.join(', ') : (act.coauthors || '');
      if (coauth) push({ url: dest, pageLabel: 'Activities', heading: title || 'Activity', text: coauth, isHeading: false, category: 'activity' });
    });
  }

  /* ── 7c. Updates / News (updates-data.js → updatesData[]) ───────────── */
  function indexUpdatesData() {
    if (typeof updatesData === 'undefined' || !Array.isArray(updatesData)) return;
    updatesData.forEach(function (entry) {
      var raw   = typeof entry === 'object' ? (entry.html || entry.text || '') : String(entry || '');
      if (!raw) return;
      var plain = stripHtml(raw);
      if (!plain || plain.length < 4) return;

      // Resolve deep-link from first anchor in entry
      var tmp    = document.createElement('div');
      tmp.innerHTML = raw;
      var anchor = tmp.querySelector('a[href]');
      var dest   = 'updates.html';
      if (anchor) {
        var href = anchor.getAttribute('href') || '';
        if (href.includes('kosalnith.github.io')) {
          dest = href.replace(/^https?:\/\/kosalnith\.github\.io/, '') || 'updates.html';
        } else if (href && !href.startsWith('http')) {
          dest = href;
        } else if (href.startsWith('http')) {
          dest = href;
        }
      }

      var heading = (entry.date ? '[' + entry.date + '] ' : '') + plain.slice(0, 80);
      push({ url: dest, pageLabel: 'Updates', heading: heading, text: plain, isHeading: false, category: 'update' });
    });
  }

  /* ── 7d. Travel / Map / Explore / Travelmap data ─────────────────────── */
  /**
   * Three-layer strategy:
   *
   *  Layer 1 — Bridge protocol:  travelmap-search-bridge.js (loaded in
   *    travelmap.html) normalises all data into window.__siteSearchData.travelmap.
   *    search.js reads that standard key. Also listens for 'siteSearchDataReady'.
   *
   *  Layer 2 — Named variable scan: checks 30+ known variable names that
   *    travelmap / explore / food / foot / trees pages might use.
   *
   *  Layer 3 — Heuristic scan: walks all window globals and indexes any array
   *    of objects that has a name + geo fields (lat/lng, country, city, iso…).
   *
   *  Layer 4 — Fetch-eval: fetches the known travelmap data JS files directly
   *    and evals them in a sandboxed scope to extract data, without needing
   *    travelmap.html to be open.
   */
  function indexTravelData() {
    var SOURCES = [
      // ── Travelmap page (most likely names) ────────────────────────────────
      { v: 'travelData',        url: 'travelmap.html', label: 'Travel Map' },
      { v: 'travelMapData',     url: 'travelmap.html', label: 'Travel Map' },
      { v: 'travelmapData',     url: 'travelmap.html', label: 'Travel Map' },
      { v: 'stampData',         url: 'travelmap.html', label: 'Travel Map' },
      { v: 'stamps',            url: 'travelmap.html', label: 'Travel Map' },
      { v: 'destinations',      url: 'travelmap.html', label: 'Travel Map' },
      { v: 'visitedCountries',  url: 'travelmap.html', label: 'Travel Map' },
      { v: 'visitedCities',     url: 'travelmap.html', label: 'Travel Map' },
      { v: 'travelEntries',     url: 'travelmap.html', label: 'Travel Map' },
      { v: 'travelLog',         url: 'travelmap.html', label: 'Travel Map' },
      { v: 'journeys',          url: 'travelmap.html', label: 'Travel Map' },
      { v: 'trips',             url: 'travelmap.html', label: 'Travel Map' },
      { v: 'waypoints',         url: 'travelmap.html', label: 'Travel Map' },
      { v: 'geojsonData',       url: 'travelmap.html', label: 'Travel Map' },
      { v: 'travelActivities',  url: 'travelmap.html', label: 'Travel Map' },
      // ── Explore ───────────────────────────────────────────────────────────
      { v: 'mapData',           url: 'explore.html',   label: 'Explore' },
      { v: 'placesData',        url: 'explore.html',   label: 'Explore' },
      { v: 'exploreData',       url: 'explore.html',   label: 'Explore' },
      { v: 'countriesData',     url: 'explore.html',   label: 'Explore' },
      { v: 'citiesData',        url: 'explore.html',   label: 'Explore' },
      { v: 'visitedData',       url: 'explore.html',   label: 'Explore' },
      { v: 'locationsData',     url: 'explore.html',   label: 'Explore' },
      { v: 'markersData',       url: 'explore.html',   label: 'Explore' },
      // ── Food ──────────────────────────────────────────────────────────────
      { v: 'foodData',          url: 'food.html',      label: 'Food' },
      { v: 'foodPlaces',        url: 'food.html',      label: 'Food' },
      { v: 'restaurantData',    url: 'food.html',      label: 'Food' },
      { v: 'restaurants',       url: 'food.html',      label: 'Food' },
      { v: 'cafes',             url: 'food.html',      label: 'Food' },
      // ── Other pages ───────────────────────────────────────────────────────
      { v: 'footData',          url: 'foot.html',      label: 'Foot' },
      { v: 'treesData',         url: 'trees.html',     label: 'Trees' },
      { v: 'friendsData',       url: 'friends.html',   label: 'Friends' },
    ];

    var indexed = new Set();

    // ── Core place-array indexer ─────────────────────────────────────────────
    function indexPlaceArray(arr, defaultUrl, pageLabel) {
      if (!Array.isArray(arr) || !arr.length) return;
      arr.forEach(function (item) {
        if (!item || typeof item !== 'object') return;
        var id   = item.id || item.key || item.iso || item.iso2 || item.iso3 || '';
        var name = item.name || item.title || item.place || item.city ||
                   item.country || item.destination || item.label || item.stamp || '';
        var url  = item.url || item.href || item.link ||
                   (id ? deepLink(defaultUrl, 'country', id) : defaultUrl);

        if (name) push({ url: url, pageLabel: pageLabel, heading: name, text: name, isHeading: true, category: 'travel' });

        // All geographic fields
        var geo = [item.country, item.nation, item.continent, item.region,
                   item.province, item.state, item.district, item.area,
                   item.city, item.town]
          .filter(function (v) { return v && v !== name; }).join(', ');
        if (geo) push({ url: url, pageLabel: pageLabel, heading: name || pageLabel, text: geo, isHeading: false, category: 'travel' });

        // ISO code — searchable (e.g. "KH", "FR")
        var iso = item.iso || item.iso2 || item.iso3 || item.countryCode || item.code || '';
        if (iso && iso !== name) push({ url: url, pageLabel: pageLabel, heading: name || pageLabel, text: iso, isHeading: false, category: 'travel' });

        // Description / notes
        var desc = stripHtml(item.description || item.desc || item.notes ||
                              item.caption || item.summary || item.info ||
                              item.details || item.text || '');
        if (desc) push({ url: url, pageLabel: pageLabel, heading: name || pageLabel, text: desc, isHeading: false, category: 'travel' });

        // Date / year visited
        var date = [item.date, item.year, item.visited, item.when,
                    item.period, item.month, item.from, item.to]
          .filter(Boolean).join(' ');
        if (date) push({ url: url, pageLabel: pageLabel, heading: name || pageLabel, text: date, isHeading: false, category: 'travel' });

        // Type / activity / category / tags
        var tags = [
          Array.isArray(item.tags) ? item.tags.join(', ') : item.tags,
          item.type, item.category, item.kind, item.activityType,
          item.purpose, item.reason
        ].filter(function (v) { return v && v !== name; }).join(', ');
        if (tags) push({ url: url, pageLabel: pageLabel, heading: name || pageLabel, text: tags, isHeading: false, category: 'travel' });

        // Food / cuisine
        var cuisine = [item.cuisine, item.food, item.dish, item.specialty, item.menu]
          .filter(Boolean).join(', ');
        if (cuisine) push({ url: url, pageLabel: pageLabel, heading: name || pageLabel, text: cuisine, isHeading: false, category: 'travel' });

        // Address
        if (item.address) push({ url: url, pageLabel: pageLabel, heading: name || pageLabel, text: item.address, isHeading: false, category: 'travel' });

        // Activities sub-array (travelmap has nested activities per country)
        if (Array.isArray(item.activities) && item.activities.length) {
          item.activities.forEach(function (act) {
            var actName = act.name || act.title || act.activity || '';
            var actText = [actName, act.type, act.date, act.location, act.city,
                           stripHtml(act.description || act.desc || '')]
              .filter(Boolean).join(' · ');
            if (actText) push({ url: url, pageLabel: pageLabel, heading: name || pageLabel, text: actText, isHeading: false, category: 'travel' });
          });
        }
      });
    }

    // ── Layer 1: Bridge protocol ─────────────────────────────────────────────
    function indexFromBridge() {
      var sd = window.__siteSearchData;
      if (!sd) return;
      if (Array.isArray(sd.travelmap) && sd.travelmap.length) {
        indexPlaceArray(sd.travelmap, 'travelmap.html', 'Travel Map');
        indexed.add('__bridge_travelmap');
      }
    }
    indexFromBridge();

    // Also listen for the bridge event (fires if bridge loads after search.js)
    window.addEventListener('siteSearchDataReady', function (e) {
      if (e.detail && e.detail.source === 'travelmap') {
        indexFromBridge();
        // Re-render if a search is active
        var inp = document.getElementById('ss-input');
        if (inp && inp.value.trim().length >= 2) renderResults(inp.value.trim());
      }
    });

    // ── Layer 2: Named variable scan ─────────────────────────────────────────
    SOURCES.forEach(function (src) {
      try {
        var arr = window[src.v];
        if (arr && !indexed.has(src.v)) {
          indexed.add(src.v);
          indexPlaceArray(arr, src.url, src.label);
        }
      } catch (e) {}
    });

    // ── Layer 3: Heuristic global scan ──────────────────────────────────────
    var SKIP_KEYS = new Set(['publications', 'activities', 'updatesData', 'INDEX',
                             'PAGES', 'history', 'location', 'navigator', 'document',
                             'window', 'self', 'top', 'frames', 'screen']);
    SOURCES.forEach(function (s) { SKIP_KEYS.add(s.v); });

    try {
      Object.keys(window).forEach(function (key) {
        if (SKIP_KEYS.has(key) || indexed.has(key)) return;
        if (key.startsWith('_') || key.startsWith('webkit') || key.startsWith('on')) return;
        try {
          var val = window[key];
          if (!Array.isArray(val) || val.length < 1) return;
          var first = val[0];
          if (typeof first !== 'object' || !first) return;
          var hasGeo  = ('lat' in first || 'lng' in first || 'latitude' in first ||
                         'longitude' in first || 'country' in first || 'city' in first ||
                         'iso' in first || 'iso2' in first || 'countryCode' in first);
          var hasName = ('name' in first || 'title' in first || 'place' in first ||
                         'destination' in first || 'stamp' in first);
          if (hasGeo && hasName) {
            indexed.add(key);
            // Guess the best URL based on key name
            var guessUrl = key.toLowerCase().includes('travel') || key.toLowerCase().includes('country') ||
                           key.toLowerCase().includes('stamp') || key.toLowerCase().includes('visit')
              ? 'travelmap.html' : 'explore.html';
            var guessLabel = key.toLowerCase().includes('food') || key.toLowerCase().includes('restaurant')
              ? 'Food' : 'Travel Map';
            indexPlaceArray(val, guessUrl, guessLabel);
          }
        } catch (e2) {}
      });
    } catch (e) {}

    // ── Layer 4: Fetch-eval travelmap data files directly ───────────────────
    // This runs at index-build time and fetches the JS data file used by
    // travelmap.html so we get the data even when that page isn't open.
    // We try several likely file names.
    var DATA_FILE_CANDIDATES = [
      'static/js/travelmap_data.js',
      'static/js/travelmap-data.js',
      'static/js/travel-data.js',
      'static/js/travelData.js',
      'static/js/stamp-data.js',
      'static/js/stamps.js',
      'static/js/destinations.js',
      'static/js/travel_data.js',
      'static/js/map-data.js',
    ];

    // Sandboxed eval: run the JS in an isolated scope and return all arrays
    // of place-like objects it defines.
    function evalDataFile(code) {
      var results = [];
      try {
        // Create a proxy object that captures any property assignment
        var captured = {};
        var sandbox = new Proxy(captured, {
          set: function (target, key, value) {
            target[key] = value;
            return true;
          }
        });
        // Wrap code so top-level var/let/const assignments go to sandbox
        // (This works for patterns like: var travelData = [...])
        var wrapped = '(function(window,self,globalThis){' + code + '})(sandbox,sandbox,sandbox)';
        // eslint-disable-next-line no-new-func
        new Function('sandbox', wrapped)(sandbox);
        Object.keys(captured).forEach(function (k) {
          var val = captured[k];
          if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
            results.push({ key: k, data: val });
          }
        });
      } catch (e) {
        // Proxy approach failed — try plain eval as fallback
        try {
          var before = Object.keys(window).slice();
          // eslint-disable-next-line no-eval
          eval(code);
          Object.keys(window).forEach(function (k) {
            if (before.indexOf(k) === -1 && !indexed.has(k)) {
              var val = window[k];
              if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
                results.push({ key: k, data: val });
              }
            }
          });
        } catch (e2) {}
      }
      return results;
    }

    var attempted = new Set();
    DATA_FILE_CANDIDATES.forEach(function (filePath) {
      if (attempted.has(filePath)) return;
      attempted.add(filePath);
      fetch(filePath)
        .then(function (r) { return r.ok ? r.text() : null; })
        .then(function (code) {
          if (!code) return;
          var arrays = evalDataFile(code);
          arrays.forEach(function (arr) {
            if (!indexed.has('__fetch__' + arr.key)) {
              indexed.add('__fetch__' + arr.key);
              indexPlaceArray(arr.data, 'travelmap.html', 'Travel Map');
            }
          });
          // Re-run render if a search is active
          if (loaded) {
            var inp = document.getElementById('ss-input');
            if (inp && inp.value.trim().length >= 2) renderResults(inp.value.trim());
          }
        })
        .catch(function () {});
    });
  }

  /* =========================================================================
     8.  RENDER RESULTS
  ========================================================================= */
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function hl(text, q) {
    return text.replace(new RegExp(escRe(q), 'gi'), function (m) {
      return '<mark class="ss-hl">' + m + '</mark>';
    });
  }

  var BADGE = {
    research: '<span class="ss-badge ss-badge--research">Research</span>',
    activity: '<span class="ss-badge ss-badge--activity">Activity</span>',
    update:   '<span class="ss-badge ss-badge--update">Update</span>',
    travel:   '<span class="ss-badge ss-badge--travel">Travel</span>',
    page:     '',
  };
  var ICO_FN = { research: icoResearch, activity: icoActivity, update: icoUpdate, travel: icoTravel };

  function renderResults(q) {
    var resultsEl = document.getElementById('ss-results');
    var countEl   = document.getElementById('ss-count');
    if (!resultsEl) return;
    var re        = new RegExp(escRe(q), 'i');

    var hits = INDEX.filter(function (item) {
      return re.test(item.text);
    });

    if (!hits.length) {
      countEl.textContent = '';
      resultsEl.innerHTML = '<div class="ss-status">' + icoEmpty() + 'No results for <strong>"' + q + '"</strong><br><span style="font-size:16px;color:#ccc;">Try a different keyword or remove a filter</span></div>';
      return;
    }

    // Deduplicate by url+text snippet
    var seen = new Set();
    hits = hits.filter(function (item) {
      var k = (item.url || '') + '|' + item.text.slice(0, 100);
      if (seen.has(k)) return false; seen.add(k); return true;
    });

    // Sort: headings first within each group
    hits.sort(function (a, b) {
      var la = a.pageLabel || '', lb = b.pageLabel || '';
      if (la !== lb) return la.localeCompare(lb);
      if (a.isHeading !== b.isHeading) return a.isHeading ? -1 : 1;
      return 0;
    });

    // Group by pageLabel
    var groups = {}, order = [];
    hits.forEach(function (item) {
      var lbl = item.pageLabel || 'Other';
      if (!groups[lbl]) { groups[lbl] = []; order.push(lbl); }
      groups[lbl].push(item);
    });

    var html = '', shown = 0;
    order.forEach(function (label) {
      var items = groups[label].slice(0, 8); shown += items.length;
      html += '<div class="ss-page-group"><div class="ss-page-label">' + label + '</div>';
      items.forEach(function (item) {
        var cat   = item.category || 'page';
        var dest  = item.url.includes('?')
          ? item.url + '&ss='  + encodeURIComponent(q)
          : item.url + '?ss='  + encodeURIComponent(q);
        var icoFn = ICO_FN[cat] || icoFile;
        var badge = BADGE[cat] || '';
        var title   = hl(item.heading, q) + badge;
        var snippet = item.isHeading ? '' : '<div class="ss-item-snippet">' + hl(item.text.slice(0, 160), q) + '</div>';
        html += '<a class="ss-item" href="' + dest + '">' +
                  '<div class="ss-item-icon">' + icoFn() + '</div>' +
                  '<div class="ss-item-body"><div class="ss-item-title">' + title + '</div>' + snippet + '</div>' +
                  icoChevron() +
                '</a>';
      });
      html += '</div>';
    });

    var extra = hits.length - shown;
    if (extra > 0) html += '<div class="ss-status" style="padding:14px 26px!important;font-size:15px!important;text-align:left!important;color:#bbb!important;">+' + extra + ' more result' + (extra > 1 ? 's' : '') + ' &#8212; refine your query or use a filter</div>';

    countEl.textContent = hits.length + ' result' + (hits.length !== 1 ? 's' : '');
    resultsEl.innerHTML = html;
  }

  /* =========================================================================
     9.  SCROLL-TO / HIGHLIGHT ON ARRIVAL  (?ss=query in URL)
  ========================================================================= */
  function handleArrival() {
    var q = new URLSearchParams(window.location.search).get('ss');
    if (!q) return;
    var re   = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    var main = document.querySelector('main') || document.body;
    var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null, false);
    var firstEl = null, node;

    while ((node = walker.nextNode())) {
      var el = node.parentElement;
      if (!el || ['SCRIPT', 'STYLE', 'NAV', 'HEADER'].includes(el.tagName)) continue;
      re.lastIndex = 0;
      if (!re.test(node.textContent)) continue;
      re.lastIndex = 0;
      if (!firstEl) firstEl = el;
      var frag = document.createDocumentFragment();
      var txt = node.textContent, last = 0, m;
      while ((m = re.exec(txt)) !== null) {
        frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        var mark = document.createElement('mark');
        mark.style.cssText = 'background:#fff176;padding:0 2px;border-radius:3px;font-weight:700;';
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
      }
      frag.appendChild(document.createTextNode(txt.slice(last)));
      node.parentNode.replaceChild(frag, node);
      re.lastIndex = 0;
    }

    if (firstEl) {
      setTimeout(function () {
        firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstEl.style.outline = '2px solid rgba(140,21,21,0.4)';
        firstEl.style.outlineOffset = '5px';
        firstEl.style.borderRadius = '4px';
        setTimeout(function () { firstEl.style.outline = ''; firstEl.style.outlineOffset = ''; }, 3000);
      }, 300);
    }
  }

  /* =========================================================================
     10.  INIT
  ========================================================================= */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { buildWidget(); handleArrival(); });
  } else {
    buildWidget(); handleArrival();
  }

})();
