/* work_pager.js — builds the work.html photo grid from static/js/work_photos.js (window.WORK_PHOTOS)
   and shows it in pages of N rows (default 5).

     <div id="work-grid" data-rows="5" data-ratio="3 / 2"></div>      (data-ratio = shape of every photo frame)
     <script src="static/js/work_photos.js"></script>      (must come before this file)

   • Titles and order come from the JSON file (top of the file = top of the page). Edit titles there.
   • New photos are added to the JSON (at the top) by generate_thumbs.py.
   • "5 rows" is measured from the real layout, so it stays 5 rows on phone, tablet and desktop. */
(function () {
  'use strict';
  var grid = document.getElementById('work-grid');
  if (!grid) return;

  var ROWS = parseInt(grid.getAttribute('data-rows'), 10) || 5;
  var RATIO = grid.getAttribute('data-ratio') || '3 / 2';            /* every photo is shown in the same-size frame */
  var SRC  = grid.getAttribute('data-src') || 'static/js/work_photos.json';   /* old fallback, only used if work_photos.js is missing */
  var items = [];

  /* ── styles (injected so no CSS file needs editing) ── */
  var st = document.createElement('style');
  st.textContent =
    '.wp-nav{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin:2.4rem auto 1rem;font-family:inherit}' +
    '.wp-btn{min-width:42px;height:42px;padding:0 14px;border-radius:999px;border:1px solid rgba(128,128,128,.35);background:transparent;color:inherit;' +
      'font:600 15px/1 inherit;cursor:pointer;transition:background .15s,color .15s,border-color .15s}' +
    '.wp-btn:hover:not(:disabled):not(.wp-active){background:rgba(140,21,21,.08);border-color:#8c1515;color:#8c1515}' +
    '.wp-btn:disabled{opacity:.35;cursor:default}' +
    '.wp-btn.wp-active{background:#8c1515;border-color:#8c1515;color:#fff;cursor:default}' +
    '.wp-gap{opacity:.5;padding:0 4px}' +
    '.wp-info{width:100%;text-align:center;font-size:14px;opacity:.65;margin-top:2px}' +
    '.wp-msg{text-align:center;opacity:.7;padding:2rem 0}' +
    /* uniform photo frames: every photo gets the same width x height; extra edges are cropped (centered a little high so heads stay in) */
    '#work-grid .highlight picture,#work-grid .highlight picture a{display:block;width:100%}' +
    '#work-grid .highlight img{display:block;width:100%!important;max-width:100%!important;height:auto!important;' +
      'aspect-ratio:' + RATIO + '!important;object-fit:cover!important;object-position:50% 35%}' +
    'html.dark-mode .wp-btn:hover:not(:disabled):not(.wp-active){background:rgba(255,255,255,.1);border-color:#fff;color:#fff}' +
    'html.dark-mode .wp-btn.wp-active{background:#fff;border-color:#fff;color:#111}' +
    '@media(max-width:480px){.wp-btn{min-width:38px;height:38px;padding:0 10px;font-size:14px}}';
  document.head.appendChild(st);

  var nav = document.createElement('nav');
  nav.className = 'wp-nav';
  nav.setAttribute('aria-label', 'Photo pages');
  grid.parentNode.insertBefore(nav, grid.nextSibling);

  var page = 1, pageSize = 0, firstIdx = 0, relayoutT;

  /* ── build one card (same markup the page always used) ── */
  function makeCard(e) {
    var sec = document.createElement('section'); sec.className = 'highlight';
    var fig = document.createElement('figure'); fig.className = 'landscape';
    var pic = document.createElement('picture');
    var a = document.createElement('a'); a.href = e.image; a.target = '_blank'; a.rel = 'noopener';
    var img = document.createElement('img');
    img.alt = e.title || ''; img.loading = 'lazy'; img.decoding = 'async';
    if (e.focus) img.style.objectPosition = e.focus;                 // optional per-photo crop focus, e.g. "50% 15%"
    img.src = e.thumb || e.image;
    img.addEventListener('error', function () {
      if (e.thumb && e.thumb !== e.image && !img.dataset.fb) { img.dataset.fb = '1'; img.src = e.image; return; }  // thumbnail missing → use full photo
      var i = items.indexOf(sec);                     // photo missing → drop the card
      if (i > -1) { items.splice(i, 1); sec.remove(); clearTimeout(relayoutT); relayoutT = setTimeout(function () { go(page, false); }, 50); }
    });
    a.appendChild(img); pic.appendChild(a); fig.appendChild(pic);
    var p = document.createElement('p'), sp = document.createElement('span');
    sp.style.fontWeight = '400'; sp.textContent = e.title || '';
    p.appendChild(sp); sec.appendChild(fig); sec.appendChild(p);
    return sec;
  }

  /* columns = how many cards sit on the first visual row (measured with every card visible) */
  function measureCols() {
    items.forEach(function (it) { it.style.display = ''; });
    if (!items.length) return 1;
    var top = items[0].offsetTop, n = 0;
    for (var i = 0; i < items.length; i++) { if (items[i].offsetTop === top) n++; else break; }
    return Math.max(1, n);
  }

  function pageFromHash() {
    var m = /^#p(?:age)?=?(\d+)$/.exec(location.hash);
    return m ? parseInt(m[1], 10) : 1;
  }

  function btn(label, p, opts) {
    opts = opts || {};
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'wp-btn'; b.innerHTML = label;
    if (opts.aria) b.setAttribute('aria-label', opts.aria);
    if (opts.active) { b.className += ' wp-active'; b.setAttribute('aria-current', 'page'); }
    if (opts.disabled) b.disabled = true;
    else if (!opts.active) b.addEventListener('click', function () { go(p, true); });
    return b;
  }

  function render(total) {
    nav.innerHTML = '';
    if (total <= 1) return;
    nav.appendChild(btn('&lsaquo;', page - 1, { aria: 'Previous page', disabled: page === 1 }));
    var shown = [], last = 0;
    for (var p = 1; p <= total; p++) if (p === 1 || p === total || Math.abs(p - page) <= 1) shown.push(p);
    shown.forEach(function (p) {
      if (last && p - last > 1) { var g = document.createElement('span'); g.className = 'wp-gap'; g.textContent = '…'; nav.appendChild(g); }
      nav.appendChild(btn(String(p), p, { active: p === page, aria: 'Page ' + p }));
      last = p;
    });
    nav.appendChild(btn('&rsaquo;', page + 1, { aria: 'Next page', disabled: page === total }));
    var info = document.createElement('div');
    info.className = 'wp-info';
    info.textContent = 'Photos ' + ((page - 1) * pageSize + 1) + '–' + Math.min(page * pageSize, items.length) + ' of ' + items.length;
    nav.appendChild(info);
  }

  function go(p, scroll) {
    pageSize = measureCols() * ROWS;
    var total = Math.max(1, Math.ceil(items.length / pageSize));
    page = Math.min(Math.max(1, p), total);
    firstIdx = (page - 1) * pageSize;
    items.forEach(function (it, i) { it.style.display = (i >= firstIdx && i < firstIdx + pageSize) ? '' : 'none'; });
    render(total);
    try { history.replaceState(null, '', page === 1 ? location.href.split('#')[0] : '#page=' + page); } catch (e) {}
    if (scroll) window.scrollTo({ top: grid.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'smooth' });
  }

  function start(list) {
    grid.innerHTML = '';
    list.forEach(function (e) {
      if (!e || !e.image || e.hidden) return;                 // "hidden": true in the JSON hides a photo
      var c = makeCard(e); grid.appendChild(c); items.push(c);
    });
    if (!items.length) { grid.innerHTML = '<p class="wp-msg">No photos yet.</p>'; return; }
    var resizeT;
    window.addEventListener('resize', function () {            // columns change → keep the same first photo visible
      clearTimeout(resizeT);
      resizeT = setTimeout(function () { go(Math.floor(firstIdx / (measureCols() * ROWS)) + 1, false); }, 150);
    });
    window.addEventListener('hashchange', function () { go(pageFromHash(), false); });
    go(pageFromHash(), false);
  }

  /* ── load the photo list (tries the main path first, then the old one) ── */
  var tried = [];
  function load(urls) {
    var url = urls[0];
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).catch(function (err) {
      tried.push(url + ' (' + (err && err.message || err) + ')');
      if (urls.length > 1) return load(urls.slice(1));
      throw err;
    });
  }

  function fail(why) {
    var hint = 'Check that <code>static/js/work_photos.js</code> exists and that <code>work.html</code> loads it before <code>work_pager.js</code> '
             + '(run <code>python3 generate_thumbs.py</code> to rebuild it).';
    grid.innerHTML = '<p class="wp-msg">Photos could not be loaded.<br><small>' + hint + (why ? '<br>' + why : '') + '</small></p>';
    if (window.console) console.error('work_pager:', why || tried);
  }

  if (Array.isArray(window.WORK_PHOTOS)) {                      // normal case — also works when the page is opened offline (file://)
    try { start(window.WORK_PHOTOS); } catch (e) { fail('Error while building the page: ' + e.message); }
  } else {                                                      // fallback for an old work_photos.json
    load([SRC, 'static/data/work_photos.json']).then(function (list) {
      if (!Array.isArray(list)) { fail('work_photos.json must be a list'); return; }
      try { start(list); } catch (e) { fail('Error while building the page: ' + e.message); }
    }, function () { fail('Could not read ' + tried.join(', ')); });
  }
})();
