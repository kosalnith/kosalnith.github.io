/* =============================================================
   activity-widget.js  — performance-hardened build
   Depends on: activity-data.js being loaded first.

   FIXES APPLIED
   ─────────────────────────────────────────────────────────────
   1.  Search: debounced (250 ms) — was firing getFilteredActivities()
       on every keystroke, re-scanning all activities + re-sorting.

   2.  dateToSortKey: was called during Array.sort() — O(n·log n)
       regex runs per render. Now pre-computed once per activity at
       startup and stored as a._sortKey.

   3.  renderActivities(): was building one giant innerHTML string by
       concatenating hundreds of template-literal strings, then
       assigning it — causing a full DOM parse + repaint. Now uses
       DocumentFragment + replaceChildren() for a single reflow.

   4.  updateYearUI(): was re-querying 7 DOM elements via getElementById
       on every slider 'input' event. Now cached once at init in _yr{}.

   5.  thumbCorrection(): was calling minEl.offsetWidth on every slider
       move, forcing a layout reflow each time. Now cached in
       _trackWidth, refreshed lazily via ResizeObserver.

   6.  document-level 'click' delegators for #sortBtn and #exportBtn
       replaced with direct addEventListener on the elements.

   7.  renderPagination(): was re-adding addEventListener to every
       page-number on every render. Replaced by a single delegated
       listener on the pagination container, set once at init.

   8.  updateTypePills(): was running four separate Array.filter()
       passes over activities. Now a single pass counts all buckets.

   9.  SDG / type counts: were recomputed via DOM queries on every
       filter change. Now pre-computed once at startup (_sdgCounts,
       _typeCounts) since the data is static.

   10. parseInt(a.year) inside filter() on every render: pre-cast to
       a._year at startup.

   11. Mobile drawer: guarded with a sentinel element so it cannot
       be double-initialised.

   12. innerText replaced with textContent everywhere (no layout
       reflow for textContent reads/writes).
   ============================================================= */

'use strict';

/* ─── 0. Type list (must be defined before pre-computed counts) ── */
const allActivityTypes = [
  "Talks and presentations in private or public companies",
  "Conference organisation or participation",
  "Conference presentations",
  "Organisation or participation in workshops, courses, seminars, exhibitions or similar",
  "Peer review of manuscripts",
  "Membership of committees, commissions, boards, councils, associations, organisations, or similar",
  "Membership of review committee",
  "Other",
  "Membership of research networks or expert groups",
  "External examination",
  "Guest lecturers",
  "External teaching and course activities at other universities",
  "Journal editor",
  "Board duties in companies, associations, or public organisations",
  "Visiting another research institution",
  "Consultancy",
  "Internal examination",
  "Hosting a guest lecturer",
  "Series editor",
  "Public Sector Consultancy",
  "Editor of unfinished research anthology/collection",
  "External PhD Supervision",
  "Internal PhD Supervision",
  "Employment with any other public or private company including your own company",
  "Starting your own company"
];

/* ─── 1. Data normalisation (runs once at startup) ──────────────── */
(function normaliseActivities() {
  const monthMap = {
    jan:1,feb:2,mar:3,apr:4,may:5,jun:6,
    jul:7,aug:8,sep:9,oct:10,nov:11,dec:12
  };
  activities.forEach(a => {
    // Pre-cast year
    a._year = parseInt(a.year, 10) || 0;

    // Pre-compute sort key (YYYYMMDD) so sort() never calls regex
    const lower = (a.date || '').toLowerCase();
    const ym = lower.match(/(\d{4})/);
    const yr = ym ? parseInt(ym[1], 10) : 0;
    const mm = lower.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
    const mo = mm ? monthMap[mm[1]] : 0;
    const dm = lower.match(/\b(\d{1,2})\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
    const dy = dm ? parseInt(dm[1], 10) : 0;
    a._sortKey = yr * 10000 + mo * 100 + dy;
  });
})();

/* ─── 2. Pre-computed static counts ─────────────────────────────── */
const _sdgCounts = (function() {
  const counts = {};
  sdgOptions.forEach(s => { counts[s] = 0; });
  activities.forEach(a => {
    (a.sdg || []).forEach(s => {
      if (counts[s] !== undefined) {
        counts[s]++;
      } else {
        const p = s.match(/^SDG \d+/);
        if (p) {
          const m = sdgOptions.find(o => o.startsWith(p[0] + ' ') || o === p[0]);
          if (m) counts[m]++;
        }
      }
    });
  });
  return counts;
})();

const _typeCounts = (function() {
  const counts = {};
  allActivityTypes.forEach(t => { counts[t] = 0; });
  activities.forEach(a => {
    const k = allActivityTypes.includes(a.typeCategory) ? a.typeCategory : 'Other';
    counts[k]++;
  });
  return counts;
})();

/* ─── 3. SDG filter render ──────────────────────────────────────── */
function renderSdgList() {
  const container = document.getElementById('sdgList');
  const frag = document.createDocumentFragment();
  sdgOptions.forEach((label, idx) => {
    const lbl = document.createElement('label');
    lbl.className = 'custom-check' + (idx >= 5 ? ' sdg-hidden' : '');
    lbl.innerHTML =
      `<input type="checkbox" data-sdg="${label}">` +
      `<span class="check-box"></span>` +
      `<span class="custom-check-left">` +
        `<span>${label}</span>` +
        `<span class="count-badge">(${_sdgCounts[label] || 0})</span>` +
      `</span>`;
    frag.appendChild(lbl);
  });
  container.innerHTML = '';
  container.appendChild(frag);

  let expanded = false;
  document.getElementById('toggleSdgBtn').onclick = () => {
    expanded = !expanded;
    container.querySelectorAll('.custom-check').forEach((c, i) => {
      if (expanded) c.classList.remove('sdg-hidden');
      else if (i >= 5) c.classList.add('sdg-hidden');
    });
    document.getElementById('toggleSdgBtn').textContent = expanded ? 'Show less' : 'Show more \u203a';
  };
}

/* ─── 4. Type filter render ─────────────────────────────────────── */
function renderTypeDetail() {
  const container = document.getElementById('typeDetailList');
  const frag = document.createDocumentFragment();
  allActivityTypes.forEach((type, idx) => {
    const lbl = document.createElement('label');
    lbl.className = 'custom-check' + (idx >= 5 ? ' type-hidden' : '');
    lbl.title = type;
    lbl.innerHTML =
      `<input type="checkbox" data-activity-type="${type}">` +
      `<span class="check-box"></span>` +
      `<span class="custom-check-left">` +
        `<span>${type}</span>` +
        `<span class="count-badge">(${_typeCounts[type] || 0})</span>` +
      `</span>`;
    frag.appendChild(lbl);
  });
  container.innerHTML = '';
  container.appendChild(frag);

  let expanded = false;
  document.getElementById('toggleTypeBtn').onclick = () => {
    expanded = !expanded;
    container.querySelectorAll('.custom-check').forEach((c, i) => {
      if (expanded) c.classList.remove('type-hidden');
      else if (i >= 5) c.classList.add('type-hidden');
    });
    document.getElementById('toggleTypeBtn').textContent = expanded ? 'Show less' : 'Show more \u203a';
  };
}

/* ─── 5. Type pills — single-pass count ─────────────────────────── */
function updateTypePills() {
  let conf = 0, seminar = 0, workshop = 0, org = 0;
  activities.forEach(a => {
    if (a.type === 'Conference presentation' || a.type === 'Keynote') conf++;
    if (a.type === 'Seminar')                                          seminar++;
    if (a.type === 'Workshop' || a.type === 'Participation' || a.type === 'Keynote') workshop++;
    if (a.type === 'Organisation' || a.type === 'Consultancy')         org++;
  });
  document.getElementById('totalActivitiesCount').textContent = activities.length;
  document.getElementById('confCount').textContent            = conf;
  document.getElementById('seminarCount').textContent         = seminar;
  document.getElementById('workshopCount').textContent        = workshop;
  document.getElementById('orgCount').textContent             = org;
}

/* ─── 6. Year slider — cached refs + ResizeObserver ─────────────── */
let yearMin, yearMax, yearAll;
let _trackWidth = 280;

const _yr = { minEl:null, maxEl:null, fill:null, minLabel:null, maxLabel:null, absMin:null, absMax:null };

function renderYearFilters() {
  yearAll = [...new Set(activities.map(a => a._year))].sort((a, b) => a - b);
  if (!yearAll.length) return;
  yearMin = yearAll[0];
  yearMax = yearAll[yearAll.length - 1];

  _yr.minEl    = document.getElementById('yearRangeMin');
  _yr.maxEl    = document.getElementById('yearRangeMax');
  _yr.fill     = document.getElementById('yearFill');
  _yr.minLabel = document.getElementById('yearMinLabel');
  _yr.maxLabel = document.getElementById('yearMaxLabel');
  _yr.absMin   = document.getElementById('yearAbsMin');
  _yr.absMax   = document.getElementById('yearAbsMax');

  _yr.minEl.min = _yr.maxEl.min = yearMin;
  _yr.minEl.max = _yr.maxEl.max = yearMax;
  _yr.minEl.value = yearMin;
  _yr.maxEl.value = yearMax;

  // Cache track width once; update on resize (avoids reflow on every drag)
  const track = _yr.minEl.closest('.year-track') || _yr.minEl;
  _trackWidth = _yr.minEl.offsetWidth || 280;
  if (window.ResizeObserver) {
    new ResizeObserver(() => { _trackWidth = _yr.minEl.offsetWidth || 280; }).observe(track);
  }

  updateYearUI();

  function onSlide() {
    let lo = parseInt(_yr.minEl.value, 10), hi = parseInt(_yr.maxEl.value, 10);
    if (lo > hi) {
      if (parseInt(_yr.minEl.value, 10) > parseInt(_yr.maxEl.value, 10))
        _yr.minEl.value = hi;
      else
        _yr.maxEl.value = lo;
    }
    updateYearUI();
    debouncedRender();
  }
  _yr.minEl.addEventListener('input', onSlide);
  _yr.maxEl.addEventListener('input', onSlide);
}

function updateYearUI() {
  const lo = parseInt(_yr.minEl.value, 10);
  const hi = parseInt(_yr.maxEl.value, 10);
  const pct = v => ((v - yearMin) / (yearMax - yearMin || 1)) * 100;
  const loP = pct(lo), hiP = pct(hi);

  _yr.fill.style.left  = loP + '%';
  _yr.fill.style.width = (hiP - loP) + '%';

  const thumbR = 8;
  // px position of thumb centre within the track element
  const thumbPx = p => (p / 100) * (_trackWidth - thumbR * 2) + thumbR;

  // Half-width of each label (measured after first render; fallback 24px)
  const minHalf = Math.ceil((_yr.minLabel.offsetWidth || 48) / 2);
  const maxHalf = Math.ceil((_yr.maxLabel.offsetWidth || 48) / 2);

  // Clamp inside [0, trackWidth] so the badge never exits the padded area
  const loPx = Math.max(minHalf, Math.min(_trackWidth - minHalf, thumbPx(loP)));
  const hiPx = Math.max(maxHalf, Math.min(_trackWidth - maxHalf, thumbPx(hiP)));

  _yr.minLabel.textContent = lo;
  _yr.maxLabel.textContent = hi;
  _yr.minLabel.style.left  = loPx + 'px';
  _yr.maxLabel.style.left  = hiPx + 'px';

  if (_yr.absMin) _yr.absMin.textContent = yearMin;
  if (_yr.absMax) _yr.absMax.textContent = yearMax;
}

function getYearRange() {
  if (!yearAll || !yearAll.length) return null;
  return {
    lo: parseInt(_yr.minEl.value, 10),
    hi: parseInt(_yr.maxEl.value, 10)
  };
}

/* ─── 7. Filter ─────────────────────────────────────────────────── */
let currentPage   = 1;
const ITEMS_PER_PAGE = 30;
let currentSearch = '';
let sortOrder     = 'desc';

function getFilteredActivities() {
  let filtered = activities;

  if (currentSearch.trim()) {
    const term = currentSearch.trim().toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(term) ||
      (a.description && a.description.toLowerCase().includes(term))
    );
  }

  const selectedSdg = Array.from(document.querySelectorAll('#sdgList input:checked'))
    .map(cb => cb.getAttribute('data-sdg'));
  if (selectedSdg.length) {
    filtered = filtered.filter(a =>
      a.sdg && a.sdg.some(s =>
        selectedSdg.some(sel => {
          if (s === sel) return true;
          const sp = s.match(/^SDG \d+/);
          const ep = sel.match(/^SDG \d+/);
          return sp && ep && sp[0] === ep[0];
        })
      )
    );
  }

  const yr = getYearRange();
  if (yr) filtered = filtered.filter(a => a._year >= yr.lo && a._year <= yr.hi);

  const selectedTypes = Array.from(document.querySelectorAll('#typeDetailList input:checked'))
    .map(cb => cb.getAttribute('data-activity-type'));
  if (selectedTypes.length) filtered = filtered.filter(a => selectedTypes.includes(a.typeCategory));

  // Sort using pre-computed keys — zero regex cost
  return filtered.slice().sort((a, b) =>
    sortOrder === 'desc' ? b._sortKey - a._sortKey : a._sortKey - b._sortKey
  );
}

/* ─── 8. Render (DocumentFragment, single DOM swap) ─────────────── */
function renderActivities() {
  const filtered   = getFilteredActivities();
  const total      = filtered.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  const start     = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  const grouped = {};
  pageItems.forEach(a => { (grouped[a.year] = grouped[a.year] || []).push(a); });
  const yearsSorted = Object.keys(grouped).sort((a, b) => b - a);

  const frag = document.createDocumentFragment();

  if (!yearsSorted.length) {
    const msg = document.createElement('div');
    msg.style.cssText = 'padding:2rem;text-align:center;';
    msg.textContent = 'No activities match the selected filters.';
    frag.appendChild(msg);
  } else {
    for (const y of yearsSorted) {
      const hdr = document.createElement('div');
      hdr.className = 'year-header';
      hdr.textContent = y;
      frag.appendChild(hdr);

      for (const a of grouped[y]) {
        const dateLocation = a.location ? `${a.date}, ${a.location}` : a.date;

        const card    = document.createElement('div');
        card.className = 'activity';
        const details = document.createElement('div');
        details.className = 'activity-details';

        // Title
        const titleEl = document.createElement(a.titleUrl ? 'a' : 'span');
        titleEl.className = 'activity-title';
        titleEl.textContent = a.title;
        if (a.titleUrl) { titleEl.href = a.titleUrl; titleEl.target = '_blank'; titleEl.rel = 'noopener'; }
        details.appendChild(titleEl);

        // Role
        const personDiv = document.createElement('div');
        personDiv.className = 'activity-person';
        personDiv.innerHTML = `<span class="role-label">Role:</span><span class="role-badge">${a.role}</span>`;
        details.appendChild(personDiv);

        // Date
        const dateDiv = document.createElement('div');
        dateDiv.className = 'activity-date';
        dateDiv.textContent = dateLocation;
        details.appendChild(dateDiv);

        // Type
        const typeDiv = document.createElement('div');
        typeDiv.className = 'activity-type-line';
        typeDiv.textContent = a.typeCategory;
        details.appendChild(typeDiv);

        // Resources
        if (a.resources && a.resources.length) {
          const resDiv = document.createElement('div');
          resDiv.className = 'activity-resource';
          resDiv.textContent = 'Resource: ';
          a.resources.forEach(r => {
            const link = document.createElement('a');
            link.className = 'resource-link';
            link.href = r.url; link.target = '_blank'; link.rel = 'noopener';
            const icon = document.createElement('i');
            icon.className = `fas ${r.type === 'video' ? 'fa-video' : r.type === 'photo' ? 'fa-image' : 'fa-link'}`;
            link.appendChild(icon);
            link.appendChild(document.createTextNode(' ' + r.label));
            resDiv.appendChild(link);
          });
          details.appendChild(resDiv);
        }

        card.appendChild(details);
        frag.appendChild(card);
      }
    }
  }

  document.getElementById('activitiesContainer').replaceChildren(frag);

  const countEl = document.getElementById('resultCount');
  countEl.textContent = total === 0
    ? '0 results'
    : `${start + 1} \u2013 ${Math.min(start + pageItems.length, total)} out of ${total} results`;

  const sortBtn = document.getElementById('sortBtn');
  if (sortBtn) {
    sortBtn.innerHTML = sortOrder === 'desc'
      ? `Start date (descending) <i class="fas fa-arrow-down"></i>`
      : `Start date (ascending) <i class="fas fa-arrow-up"></i>`;
  }

  renderPagination(totalPages);
}

/* ─── 9. Pagination (no per-render listener re-add) ─────────────── */
function renderPagination(totalPages) {
  const container = document.getElementById('paginationContainer');
  const tp = Math.max(totalPages, 1);

  let pages = '';
  let sp = Math.max(1, currentPage - 4);
  let ep = Math.min(tp, sp + 8);
  if (ep - sp < 8) sp = Math.max(1, ep - 8);

  if (sp > 1) pages += `<a class="pg-num" data-page="1">1</a>`;
  if (sp > 2) pages += `<span class="ellipsis">\u2026</span>`;
  for (let i = sp; i <= ep; i++) {
    pages += i === currentPage
      ? `<span class="pg-num active-page">${i}</span>`
      : `<a class="pg-num" data-page="${i}">${i}</a>`;
  }
  if (ep < tp - 1) pages += `<span class="ellipsis">\u2026</span>`;
  if (ep < tp)     pages += `<a class="pg-num" data-page="${tp}">${tp}</a>`;

  const pd = currentPage <= 1, nd = currentPage >= tp;
  container.innerHTML =
    `<button class="pagination-nav${pd?' disabled':''}" ${pd?'disabled':`data-page="${currentPage-1}"`}>` +
      `<i class="fas fa-chevron-left"></i> Prev</button>` +
    `<div class="pagination-pages">${pages}</div>` +
    `<button class="pagination-nav${nd?' disabled':''}" ${nd?'disabled':`data-page="${currentPage+1}"`}>` +
      `Next <i class="fas fa-chevron-right"></i></button>`;
  // Click handled by single delegated listener set at init (below)
}

function resetAndRender() { currentPage = 1; renderActivities(); }

/* ─── 10. Debounce ──────────────────────────────────────────────── */
function debounce(fn, ms) {
  let t;
  return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}
const debouncedRender = debounce(resetAndRender, 250);

/* ─── 11. CSV Export ────────────────────────────────────────────── */
function exportToCSV() {
  const filtered = getFilteredActivities();
  const headers = ['Title','Role','Date','Location','Type','Activity Category','SDGs','Description'];
  const rows = filtered.map(a => [
    a.title, a.role, a.date, a.location || '',
    a.type, a.typeCategory, (a.sdg || []).join('; '), a.description || ''
  ].map(v => `"${String(v).replace(/"/g,'""')}"`));
  const csv = [headers.map(h=>`"${h}"`), ...rows].map(r=>r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'research-activities.csv';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─── 12. Event listeners — all set once at init ────────────────── */
// Search (debounced)
document.getElementById('searchInput').addEventListener('input', e => {
  currentSearch = e.target.value;
  debouncedRender();
});

// Filter changes — delegated on containers
document.getElementById('sdgList').addEventListener('change',        resetAndRender);
document.getElementById('yearFilters').addEventListener('change',    resetAndRender);
document.getElementById('typeDetailList').addEventListener('change', resetAndRender);

// Type pills
document.querySelectorAll('.type-pill[data-filter-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.getAttribute('data-filter-type');
    document.querySelectorAll('#typeDetailList input').forEach(cb => { cb.checked = false; });
    if (type !== 'all') {
      const map = {
        'Conference presentation': 'Conference presentations',
        'Seminar':      'Talks and presentations in private or public companies',
        'Workshop':     'Organisation or participation in workshops, courses, seminars, exhibitions or similar',
        'Organisation': 'Conference organisation or participation'
      };
      const cb = document.querySelector(`#typeDetailList input[data-activity-type="${map[type]}"]`);
      if (cb) cb.checked = true;
    }
    resetAndRender();
  });
});

// Sort — direct listener (not document-level)
document.getElementById('sortBtn').addEventListener('click', () => {
  sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
  resetAndRender();
});

// Export — direct listener
document.getElementById('exportBtn').addEventListener('click', exportToCSV);

// Pagination — single delegated listener (no re-add on every render)
document.getElementById('paginationContainer').addEventListener('click', e => {
  const el = e.target.closest('[data-page]');
  if (!el) return;
  e.preventDefault();
  currentPage = parseInt(el.getAttribute('data-page'), 10);
  renderActivities();
  const rc = document.querySelector('.research-container');
  if (rc) window.scrollTo({ top: rc.offsetTop - 20, behavior: 'smooth' });
});

/* ─── 13. Init ──────────────────────────────────────────────────── */
renderSdgList();
renderYearFilters();
renderTypeDetail();
updateTypePills();
renderActivities();

/* ─── 14. Mobile drawer (guarded against double-init) ───────────── */
(function initDrawer() {
  if (document.getElementById('_filterDrawerInit')) return;
  const sentinel = document.createElement('div');
  sentinel.id = '_filterDrawerInit';
  sentinel.hidden = true;
  document.body.appendChild(sentinel);

  const sidebar = document.querySelector('.research-container .research-sidebar');
  const twoCol  = document.querySelector('.research-container .two-columns');
  if (!sidebar || !twoCol) return;

  const overlay = document.createElement('div');
  overlay.className = 'research-filter-overlay';
  document.body.appendChild(overlay);

  const closeWrap = document.createElement('div');
  closeWrap.className = 'drawer-close-btn';
  closeWrap.innerHTML = '<button aria-label="Close filters"><i class="fas fa-times"></i></button>';
  sidebar.insertBefore(closeWrap, sidebar.firstChild);

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'filter-toggle-btn';
  toggleBtn.innerHTML = '<i class="fas fa-sliders-h"></i> Filters';
  toggleBtn.setAttribute('aria-label', 'Open filters');
  twoCol.parentNode.insertBefore(toggleBtn, twoCol);

  const open  = () => { sidebar.classList.add('drawer-open');    overlay.classList.add('active');    document.body.style.overflow = 'hidden'; };
  const close = () => { sidebar.classList.remove('drawer-open'); overlay.classList.remove('active'); document.body.style.overflow = ''; };

  toggleBtn.addEventListener('click', open);
  overlay.addEventListener('click', close);
  closeWrap.querySelector('button').addEventListener('click', close);
  sidebar.addEventListener('change', () => { if (window.innerWidth <= 860) setTimeout(close, 200); });
})();
