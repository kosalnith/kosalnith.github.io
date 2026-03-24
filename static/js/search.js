(function () {
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
  ];

  var INDEX = [];
  var loaded = false;
  var loading = false;
  var activeIdx = -1;

  /* ─── CSS ─────────────────────────────────────────────── */
  var css = [
    /* NAV BUTTON */
    '#site-search-btn{',
      'display:inline-flex;align-items:center;gap:7px;',
      'background:transparent;',
      'border:1.5px solid rgba(140,21,21,0.25);',
      'border-radius:999px;',
      'padding:6px 14px 6px 10px;',
      'cursor:pointer;color:#8c1515;',
      'font-size:0.83rem;font-weight:600;letter-spacing:.01em;',
      'transition:all .18s;white-space:nowrap;',
      'line-height:1;',
    '}',
    '#site-search-btn:hover{',
      'background:rgba(140,21,21,0.07);',
      'border-color:rgba(140,21,21,0.45);',
    '}',

    /* OVERLAY */
    '#ss-overlay{',
      'display:none;position:fixed;inset:0;',
      'background:rgba(0,0,0,0.35);',
      'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);',
      'z-index:9998;',
    '}',
    '#ss-overlay.open{display:block;animation:ssOvIn .15s ease;}',
    '@keyframes ssOvIn{from{opacity:0}to{opacity:1}}',

    /* MODAL */
    '#ss-modal{',
      'display:none;position:fixed;',
      'top:clamp(80px,10vh,140px);left:50%;',
      'transform:translateX(-50%);',
      'width:min(660px,92vw);',
      'background:#ffffff;',
      'border-radius:20px;',
      'box-shadow:0 40px 100px rgba(0,0,0,.2),0 4px 20px rgba(0,0,0,.08);',
      'z-index:9999;overflow:hidden;',
      'font-family:inherit;',
    '}',
    '#ss-modal.open{display:block;animation:ssMdIn .2s cubic-bezier(.34,1.36,.64,1);}',
    '@keyframes ssMdIn{',
      'from{opacity:0;transform:translateX(-50%) translateY(-20px) scale(.95);}',
      'to  {opacity:1;transform:translateX(-50%) translateY(0)    scale(1);}',
    '}',

    /* INPUT ROW */
    '#ss-input-row{',
      'display:flex;align-items:center;gap:12px;',
      'padding:18px 20px;',
      'border-bottom:1px solid #f0f0f0;',
    '}',
    '#ss-search-icon{',
      'flex-shrink:0;',
      'color:#8c1515;opacity:0.6;',
      'display:flex;align-items:center;',
    '}',
    '#ss-input{',
      'flex:1;border:none;outline:none;',
      'font-size:1.15rem;font-weight:400;',
      'color:#111;background:transparent;',
      'caret-color:#8c1515;',
      'font-family:inherit;',
    '}',
    '#ss-input::placeholder{color:#c0c0c0;}',
    '#ss-clear-btn{',
      'background:#f2f2f2;border:none;border-radius:6px;',
      'width:28px;height:28px;',
      'cursor:pointer;color:#999;',
      'font-size:0.85rem;',
      'display:none;align-items:center;justify-content:center;',
      'flex-shrink:0;transition:background .12s,color .12s;',
    '}',
    '#ss-clear-btn:hover{background:#e5e5e5;color:#444;}',
    '#ss-clear-btn.visible{display:flex;}',
    '#ss-esc-hint{',
      'font-size:0.7rem;color:#ccc;',
      'border:1px solid #e8e8e8;border-radius:5px;',
      'padding:3px 8px;flex-shrink:0;',
      'font-family:inherit;background:#fafafa;',
    '}',

    /* RESULTS AREA */
    '#ss-results{',
      'max-height:420px;overflow-y:auto;',
      'padding:8px 0 12px;',
    '}',
    '#ss-results::-webkit-scrollbar{width:4px;}',
    '#ss-results::-webkit-scrollbar-thumb{background:#e8e8e8;border-radius:4px;}',

    /* STATUS */
    '.ss-status{',
      'padding:36px 24px;',
      'text-align:center;',
      'color:#c8c8c8;',
      'font-size:0.95rem;',
      'line-height:1.6;',
    '}',
    '.ss-status strong{color:#888;font-size:1.05rem;font-weight:600;}',
    '.ss-no-icon{display:block;margin:0 auto 14px;color:#ddd;}',

    /* PAGE GROUP */
    '.ss-page-group{margin-top:6px;}',
    '.ss-page-label{',
      'display:flex;align-items:center;gap:8px;',
      'padding:6px 20px 4px;',
      'font-size:0.68rem;font-weight:700;',
      'text-transform:uppercase;letter-spacing:.09em;',
      'color:#b04040;',
    '}',
    '.ss-page-label::after{content:"";flex:1;height:1px;background:#f5eaea;}',

    /* RESULT ITEM */
    '.ss-item{',
      'display:flex;align-items:center;gap:14px;',
      'padding:11px 14px;margin:1px 8px;',
      'border-radius:12px;',
      'text-decoration:none;color:#1a1a1a;',
      'transition:background .1s;',
      'cursor:pointer;',
    '}',
    '.ss-item:hover,.ss-item.ss-active{background:#fdf3f3;}',
    '.ss-item-icon{',
      'flex-shrink:0;width:38px;height:38px;',
      'background:#f9eeee;',
      'border-radius:10px;',
      'display:flex;align-items:center;justify-content:center;',
    '}',
    '.ss-item-icon svg{color:#8c1515;opacity:0.55;}',
    '.ss-item-body{flex:1;min-width:0;}',
    '.ss-item-title{',
      'font-size:0.96rem;font-weight:600;',
      'color:#1a1a1a;line-height:1.35;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
    '}',
    '.ss-item-snippet{',
      'font-size:0.83rem;color:#999;',
      'margin-top:3px;line-height:1.45;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
    '}',
    '.ss-chevron{color:#ddd;flex-shrink:0;transition:color .1s;}',
    '.ss-item:hover .ss-chevron,.ss-item.ss-active .ss-chevron{color:#c06060;}',

    /* HIGHLIGHT */
    'mark.ss-hl{',
      'background:#fff176;color:inherit;',
      'padding:0 1px;border-radius:3px;font-weight:700;',
    '}',

    /* FOOTER */
    '#ss-footer{',
      'display:flex;align-items:center;justify-content:space-between;',
      'padding:10px 20px 12px;',
      'border-top:1px solid #f5f5f5;',
      'background:#fafafa;',
    '}',
    '#ss-count{font-size:0.76rem;color:#c8c8c8;font-style:italic;}',
    '.ss-hints{display:flex;gap:12px;}',
    '.ss-hint{font-size:0.7rem;color:#ccc;display:flex;align-items:center;gap:4px;}',
    '.ss-hint kbd{',
      'display:inline-flex;align-items:center;justify-content:center;',
      'background:#fff;border:1px solid #e0e0e0;',
      'border-bottom:2px solid #d0d0d0;',
      'border-radius:5px;min-width:20px;height:20px;',
      'padding:0 5px;',
      'font-size:0.68rem;font-family:inherit;color:#999;',
    '}',
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ─── SVGs ────────────────────────────────────────────── */
  function icoSearch(sz, sw) {
    return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||'2')+'" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  }
  function icoFile() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
  }
  function icoChevron() {
    return '<svg class="ss-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
  }
  function icoEmpty() {
    return '<svg class="ss-no-icon" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
  }

  /* ─── Build widget ────────────────────────────────────── */
  function buildWidget() {
    var ul = document.querySelector('.su-multi-menu__menu-lv1');
    if (!ul) return;

    /* Nav pill button */
    var li = document.createElement('li');
    li.className = 'su-multi-menu__item';
    li.style.cssText = 'display:flex;align-items:center;margin-left:2px;';
    li.innerHTML =
      '<button id="site-search-btn" title="Search  Ctrl+K" aria-label="Search">' +
        icoSearch(14, '2.5') + '<span>Search</span>' +
      '</button>';
    ul.appendChild(li);

    /* Overlay */
    var overlay = document.createElement('div');
    overlay.id = 'ss-overlay';
    document.body.appendChild(overlay);

    /* Modal */
    var modal = document.createElement('div');
    modal.id = 'ss-modal';
    modal.setAttribute('role','dialog');
    modal.setAttribute('aria-modal','true');
    modal.setAttribute('aria-label','Site search');
    modal.innerHTML =
      '<div id="ss-input-row">' +
        '<span id="ss-search-icon">' + icoSearch(20, '2.2') + '</span>' +
        '<input id="ss-input" type="search" placeholder="Search across all pages\u2026" autocomplete="off" spellcheck="false" />' +
        '<button id="ss-clear-btn" title="Clear">\u2715</button>' +
        '<span id="ss-esc-hint">esc</span>' +
      '</div>' +
      '<div id="ss-results"><div class="ss-status">Start typing to search\u2026</div></div>' +
      '<div id="ss-footer">' +
        '<span id="ss-count"></span>' +
        '<div class="ss-hints">' +
          '<span class="ss-hint"><kbd>\u2191</kbd><kbd>\u2193</kbd>navigate</span>' +
          '<span class="ss-hint"><kbd>\u23ce</kbd>open</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    var btn      = document.getElementById('site-search-btn');
    var input    = document.getElementById('ss-input');
    var clearBtn = document.getElementById('ss-clear-btn');
    var results  = document.getElementById('ss-results');
    var countEl  = document.getElementById('ss-count');

    function openSearch() {
      overlay.classList.add('open');
      modal.classList.add('open');
      setTimeout(function(){ input.focus(); }, 40);
      if (!loaded && !loading) buildIndex();
    }
    function closeSearch() {
      overlay.classList.remove('open');
      modal.classList.remove('open');
      input.value = '';
      clearBtn.classList.remove('visible');
      results.innerHTML = '<div class="ss-status">Start typing to search\u2026</div>';
      countEl.textContent = '';
      activeIdx = -1;
    }

    btn.addEventListener('click', openSearch);
    overlay.addEventListener('click', closeSearch);
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey||e.metaKey) && e.key==='k'){ e.preventDefault(); openSearch(); }
      if (e.key==='Escape' && modal.classList.contains('open')) closeSearch();
      if (modal.classList.contains('open')) handleArrows(e);
    });

    input.addEventListener('input', function() {
      var q = input.value.trim();
      clearBtn.classList.toggle('visible', q.length > 0);
      activeIdx = -1;
      if (q.length < 2) {
        results.innerHTML = '<div class="ss-status">Start typing to search\u2026</div>';
        countEl.textContent = ''; return;
      }
      if (!loaded) {
        results.innerHTML = '<div class="ss-status">Indexing\u2026 please wait</div>'; return;
      }
      renderResults(q);
    });

    clearBtn.addEventListener('click', function() {
      input.value = ''; clearBtn.classList.remove('visible');
      results.innerHTML = '<div class="ss-status">Start typing to search\u2026</div>';
      countEl.textContent = ''; activeIdx = -1; input.focus();
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var a = results.querySelector('.ss-active');
        if (a && a.href) window.location.href = a.href;
      }
    });
  }

  function handleArrows(e) {
    var items = document.querySelectorAll('#ss-results .ss-item');
    if (!items.length) return;
    if (e.key==='ArrowDown'){ e.preventDefault(); activeIdx=Math.min(activeIdx+1,items.length-1); }
    else if (e.key==='ArrowUp'){ e.preventDefault(); activeIdx=Math.max(activeIdx-1,0); }
    else return;
    items.forEach(function(el,i){ el.classList.toggle('ss-active', i===activeIdx); });
    items[activeIdx].scrollIntoView({block:'nearest'});
  }

  /* ─── Index ───────────────────────────────────────────── */
  function buildIndex() {
    loading = true;
    var rem = PAGES.length;
    PAGES.forEach(function(page) {
      fetch(page.url)
        .then(function(r){ return r.ok ? r.text() : ''; })
        .then(function(html){ if (html) parsePageIntoIndex(html, page); })
        .catch(function(){})
        .finally(function(){
          rem--;
          if (rem===0) {
            loaded=true; loading=false;
            var q = document.getElementById('ss-input').value.trim();
            if (q.length>=2) renderResults(q);
            else document.getElementById('ss-results').innerHTML =
              '<div class="ss-status">Ready \u2014 searching '+PAGES.length+' pages</div>';
          }
        });
    });
  }

  function parsePageIntoIndex(html, page) {
    var p = new DOMParser();
    var doc = p.parseFromString(html, 'text/html');
    ['nav','header','footer','script','style','noscript'].forEach(function(t){
      doc.querySelectorAll(t).forEach(function(el){ el.remove(); });
    });
    var main = doc.querySelector('main') || doc.querySelector('.page-content') || doc.body;
    var curH = page.label;
    main.querySelectorAll('h1,h2,h3,h4,p,li,.cv-row,td').forEach(function(node) {
      var tag  = node.tagName.toLowerCase();
      var text = node.textContent.replace(/\s+/g,' ').trim();
      if (!text || text.length < 4) return;
      if (/^h[1-4]$/.test(tag)) {
        curH = text;
        INDEX.push({url:page.url, pageLabel:page.label, heading:text, text:text, isHeading:true});
      } else if (node.children.length===0 || tag==='p' || tag==='li' || node.classList.contains('cv-row')) {
        INDEX.push({url:page.url, pageLabel:page.label, heading:curH, text:text, isHeading:false});
      }
    });
  }

  /* ─── Render ──────────────────────────────────────────── */
  function esc(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

  function hl(text, q) {
    return text.replace(new RegExp(esc(q),'gi'), function(m){
      return '<mark class="ss-hl">'+m+'</mark>';
    });
  }

  function renderResults(q) {
    var results = document.getElementById('ss-results');
    var countEl = document.getElementById('ss-count');
    var re = new RegExp(esc(q),'i');
    var hits = INDEX.filter(function(item){ return re.test(item.text); });

    if (!hits.length) {
      countEl.textContent = '';
      results.innerHTML =
        '<div class="ss-status">'+icoEmpty()+
        'No results for <strong>\u201c'+q+'\u201d</strong><br>'+
        '<span style="font-size:.82rem;color:#d0d0d0;">Try a shorter or different keyword</span></div>';
      return;
    }

    // Deduplicate
    var seen = new Set();
    hits = hits.filter(function(item){
      var k = item.url+'|'+item.text.slice(0,80);
      if (seen.has(k)) return false; seen.add(k); return true;
    });

    // Group
    var groups={}, order=[];
    hits.forEach(function(item){
      if (!groups[item.pageLabel]){ groups[item.pageLabel]=[]; order.push(item.pageLabel); }
      groups[item.pageLabel].push(item);
    });

    var html='', shown=0;
    order.forEach(function(label){
      var items = groups[label].slice(0,5);
      shown += items.length;
      html += '<div class="ss-page-group"><div class="ss-page-label">'+label+'</div>';
      items.forEach(function(item){
        var title   = hl(item.heading, q);
        var snippet = item.isHeading ? '' :
          '<div class="ss-item-snippet">'+hl(item.text.slice(0,130), q)+'</div>';
        html +=
          '<a class="ss-item" href="'+item.url+'">' +
            '<div class="ss-item-icon">'+icoFile()+'</div>' +
            '<div class="ss-item-body">' +
              '<div class="ss-item-title">'+title+'</div>'+snippet+
            '</div>' +
            icoChevron() +
          '</a>';
      });
      html += '</div>';
    });

    var extra = hits.length - shown;
    if (extra>0) html += '<div class="ss-status" style="padding:10px 20px;font-size:.8rem;text-align:left;">+'+extra+' more result'+(extra>1?'s':'')+'</div>';

    countEl.textContent = hits.length+' result'+(hits.length!==1?'s':'');
    results.innerHTML = html;
  }

  /* ─── Init ────────────────────────────────────────────── */
  if (document.readyState==='loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
