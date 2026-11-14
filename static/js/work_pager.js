/* work_pager.js — shows the work.html photo grid in pages of N rows (default 5).
   Works on the existing cards:  <div id="work-grid" data-rows="5"> <section class="highlight">…</section> … </div>
   Add / remove cards in the HTML and the page count updates by itself.
   The number of columns is measured from the real layout, so "5 rows" stays 5 rows on phone, tablet and desktop. */
(function () {
  'use strict';
  var grid = document.getElementById('work-grid');
  if (!grid) return;

  var ROWS  = parseInt(grid.getAttribute('data-rows'), 10) || 5;
  var items = Array.prototype.slice.call(grid.children).filter(function (el) {
    return el.classList && el.classList.contains('highlight');
  });
  if (!items.length) return;

  items.forEach(function (it) {                       // don't download hidden pages' images until needed
    var img = it.querySelector('img');
    if (img && !img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
  });

  /* ── styles (injected so no CSS file needs editing) ── */
  var st = document.createElement('style');
  st.textContent =
    '.wp-nav{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin:2.4rem auto 1rem;font-family:inherit}' +
    '.wp-btn{min-width:42px;height:42px;padding:0 14px;border-radius:999px;border:1px solid rgba(128,128,128,.35);background:transparent;color:inherit;' +
      'font:600 15px/1 inherit;cursor:pointer;transition:background .15s,color .15s,border-color .15s,transform .15s}' +
    '.wp-btn:hover:not(:disabled):not(.wp-active){background:rgba(140,21,21,.08);border-color:#8c1515;color:#8c1515}' +
    '.wp-btn:disabled{opacity:.35;cursor:default}' +
    '.wp-btn.wp-active{background:#8c1515;border-color:#8c1515;color:#fff;cursor:default}' +
    '.wp-gap{opacity:.5;padding:0 4px}' +
    '.wp-info{width:100%;text-align:center;font-size:14px;opacity:.65;margin-top:2px}' +
    'html.dark-mode .wp-btn:hover:not(:disabled):not(.wp-active){background:rgba(255,255,255,.1);border-color:#fff;color:#fff}' +
    'html.dark-mode .wp-btn.wp-active{background:#fff;border-color:#fff;color:#111}' +
    '@media(max-width:480px){.wp-btn{min-width:38px;height:38px;padding:0 10px;font-size:14px}}';
  document.head.appendChild(st);

  var nav = document.createElement('nav');
  nav.className = 'wp-nav';
  nav.setAttribute('aria-label', 'Photo pages');
  grid.parentNode.insertBefore(nav, grid.nextSibling);

  var page = 1, pageSize = 0, firstIdx = 0;

  /* columns = how many cards sit on the first visual row (measured with every card visible) */
  function measureCols() {
    items.forEach(function (it) { it.style.display = ''; });
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
    for (var p = 1; p <= total; p++) {
      if (p === 1 || p === total || Math.abs(p - page) <= 1) shown.push(p);
    }
    shown.forEach(function (p) {
      if (last && p - last > 1) { var g = document.createElement('span'); g.className = 'wp-gap'; g.textContent = '…'; nav.appendChild(g); }
      nav.appendChild(btn(String(p), p, { active: p === page, aria: 'Page ' + p }));
      last = p;
    });
    nav.appendChild(btn('&rsaquo;', page + 1, { aria: 'Next page', disabled: page === total }));
    var info = document.createElement('div');
    info.className = 'wp-info';
    var from = (page - 1) * pageSize + 1, to = Math.min(page * pageSize, items.length);
    info.textContent = 'Photos ' + from + '–' + to + ' of ' + items.length;
    nav.appendChild(info);
  }

  function go(p, scroll) {
    var cols = measureCols();
    pageSize = cols * ROWS;
    var total = Math.max(1, Math.ceil(items.length / pageSize));
    page = Math.min(Math.max(1, p), total);
    firstIdx = (page - 1) * pageSize;
    items.forEach(function (it, i) {
      it.style.display = (i >= firstIdx && i < firstIdx + pageSize) ? '' : 'none';
    });
    render(total);
    try { history.replaceState(null, '', page === 1 ? location.pathname + location.search : '#page=' + page); } catch (e) {}
    if (scroll) {
      var y = grid.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  var resizeT;
  window.addEventListener('resize', function () {          // columns change → keep the same first photo visible
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      var cols = measureCols(), size = cols * ROWS;
      go(Math.floor(firstIdx / size) + 1, false);
    }, 150);
  });
  window.addEventListener('hashchange', function () { go(pageFromHash(), false); });

  go(pageFromHash(), false);
})();
