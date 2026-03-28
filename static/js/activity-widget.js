/* =============================================================
   activity-widget.js
   All rendering and filter logic for the Research Activities
   widget. Depends on: activity-data.js being loaded first.
   ============================================================= */

/* ── SDG filter ── */
function getSdgCounts() {
  const counts = {};
  sdgOptions.forEach(s => counts[s] = 0);
  activities.forEach(a => {
    if (a.sdg) {
      a.sdg.forEach(s => {
        let matched = sdgOptions.find(opt => opt.startsWith(s.split(' ')[0]));
        if (matched) counts[matched]++;
        else if (s.includes("SDG 8"))  counts["SDG 8 - Decent Work and Economic Growth"]++;
        else if (s.includes("SDG 13")) counts["SDG 13 - Climate Action"]++;
        else if (s.includes("SDG 1"))  counts["SDG 1 - No Poverty"]++;
        else if (s.includes("SDG 2"))  counts["SDG 2 - Zero Hunger"]++;
        else if (s.includes("SDG 5"))  counts["SDG 5 - Gender Equality"]++;
        else if (s.includes("SDG 16")) counts["SDG 16 - Peace, Justice and Strong Institutions"]++;
        else counts["SDG 8 - Decent Work and Economic Growth"]++;
      });
    } else {
      counts["SDG 8 - Decent Work and Economic Growth"]++;
    }
  });
  return counts;
}

function renderSdgList() {
  const container = document.getElementById('sdgList');
  const counts = getSdgCounts();
  let html = '';
  sdgOptions.forEach((label, idx) => {
    const cnt = counts[label] || 0;
    const hiddenClass = idx >= 5 ? 'sdg-hidden' : '';
    html += `<label class="custom-check ${hiddenClass}">
               <input type="checkbox" data-sdg="${label}">
               <span class="check-box"></span>
               <span class="custom-check-left">
                 <span>${label}</span>
                 <span class="count-badge">(${cnt})</span>
               </span>
             </label>`;
  });
  container.innerHTML = html;
  let expanded = false;
  document.getElementById('toggleSdgBtn').onclick = () => {
    expanded = !expanded;
    document.querySelectorAll('#sdgList .custom-check').forEach((c, i) => {
      if (expanded) c.classList.remove('sdg-hidden');
      else if (i >= 5) c.classList.add('sdg-hidden');
    });
    document.getElementById('toggleSdgBtn').innerText = expanded ? 'Show less' : 'Show more ›';
  };
}

/* ── Year range slider ── */
let yearMin, yearMax, yearAll;

function renderYearFilters() {
  yearAll = [...new Set(activities.map(a => parseInt(a.year)))].sort((a, b) => a - b);
  if (!yearAll.length) return;
  yearMin = yearAll[0];
  yearMax = yearAll[yearAll.length - 1];
  const minEl = document.getElementById('yearRangeMin');
  const maxEl = document.getElementById('yearRangeMax');
  minEl.min = maxEl.min = yearMin;
  minEl.max = maxEl.max = yearMax;
  minEl.value = yearMin;
  maxEl.value = yearMax;
  updateYearUI();
  function onSlide() {
    let lo = parseInt(minEl.value), hi = parseInt(maxEl.value);
    if (lo > hi) {
      if (this === minEl) minEl.value = hi;
      else maxEl.value = lo;
    }
    updateYearUI();
    resetAndRender();
  }
  minEl.addEventListener('input', onSlide);
  maxEl.addEventListener('input', onSlide);
}

function updateYearUI() {
  const minEl = document.getElementById('yearRangeMin');
  const maxEl = document.getElementById('yearRangeMax');
  const lo = parseInt(minEl.value), hi = parseInt(maxEl.value);
  document.getElementById('yearMinLabel').textContent = lo;
  document.getElementById('yearMaxLabel').textContent = hi;
  const pct = v => ((v - yearMin) / (yearMax - yearMin || 1)) * 100;
  const fill = document.getElementById('yearFill');
  fill.style.left  = pct(lo) + '%';
  fill.style.width = (pct(hi) - pct(lo)) + '%';
  const absMin = document.getElementById('yearAbsMin');
  const absMax = document.getElementById('yearAbsMax');
  if (absMin) absMin.textContent = yearMin;
  if (absMax) absMax.textContent = yearMax;
}

function getYearRange() {
  if (!yearAll || !yearAll.length) return null;
  return {
    lo: parseInt(document.getElementById('yearRangeMin').value),
    hi: parseInt(document.getElementById('yearRangeMax').value)
  };
}

/* ── Type filter ── */
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

function getTypeCounts() {
  const counts = {};
  allActivityTypes.forEach(t => counts[t] = 0);
  activities.forEach(a => {
    const matched = allActivityTypes.find(tt => tt === a.typeCategory);
    if (matched) counts[matched]++;
    else counts["Other"]++;
  });
  return counts;
}

function renderTypeDetail() {
  const container = document.getElementById('typeDetailList');
  const counts = getTypeCounts();
  let html = '';
  allActivityTypes.forEach((type, idx) => {
    const cnt = counts[type] || 0;
    const hiddenClass = idx >= 5 ? 'type-hidden' : '';
    html += `<label class="custom-check ${hiddenClass}" title="${type}">
               <input type="checkbox" data-activity-type="${type}">
               <span class="check-box"></span>
               <span class="custom-check-left">
                 <span>${type}</span>
                 <span class="count-badge">(${cnt})</span>
               </span>
             </label>`;
  });
  container.innerHTML = html;
  let expanded = false;
  document.getElementById('toggleTypeBtn').onclick = () => {
    expanded = !expanded;
    document.querySelectorAll('#typeDetailList .custom-check').forEach((c, i) => {
      if (expanded) c.classList.remove('type-hidden');
      else if (i >= 5) c.classList.add('type-hidden');
    });
    document.getElementById('toggleTypeBtn').innerText = expanded ? 'Show less' : 'Show more ›';
  };
}

/* ── Type pills counts ── */
function updateTypePills() {
  document.getElementById('totalActivitiesCount').innerText = activities.length;
  document.getElementById('confCount').innerText     = activities.filter(a => a.type === 'Conference presentation' || a.type === 'Keynote').length;
  document.getElementById('seminarCount').innerText  = activities.filter(a => a.type === 'Seminar').length;
  document.getElementById('workshopCount').innerText = activities.filter(a => a.type === 'Workshop' || a.type === 'Participation' || a.type === 'Keynote').length;
  document.getElementById('orgCount').innerText      = activities.filter(a => a.type === 'Organisation' || a.type === 'Consultancy').length;
}

/* ── Filter + render ── */
let currentPage  = 1;
const ITEMS_PER_PAGE = 50;
let currentSearch = '';

function getFilteredActivities() {
  let filtered = [...activities];

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
        selectedSdg.some(sel =>
          sel.startsWith(s.split(' ')[0]) || s.startsWith(sel.split(' ')[0])
        )
      )
    );
  }

  const yr = getYearRange();
  if (yr) {
    filtered = filtered.filter(a => parseInt(a.year) >= yr.lo && parseInt(a.year) <= yr.hi);
  }

  const selectedTypes = Array.from(document.querySelectorAll('#typeDetailList input:checked'))
    .map(cb => cb.getAttribute('data-activity-type'));
  if (selectedTypes.length) {
    filtered = filtered.filter(a => selectedTypes.includes(a.typeCategory));
  }

  return filtered;
}

function renderActivities() {
  const filtered    = getFilteredActivities();
  const total       = filtered.length;
  const totalPages  = Math.ceil(total / ITEMS_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  const start       = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems   = filtered.slice(start, start + ITEMS_PER_PAGE);

  const grouped = {};
  pageItems.forEach(a => {
    if (!grouped[a.year]) grouped[a.year] = [];
    grouped[a.year].push(a);
  });
  const yearsSorted = Object.keys(grouped).sort((a, b) => b - a);

  let html = '';
  for (const y of yearsSorted) {
    html += `<div class="year-header">${y}</div>`;
    for (const a of grouped[y]) {
      html += `<div class="activity">
        <div class="activity-details">
          <div class="activity-title">${a.title}</div>
          <div class="activity-person">${a.person} <strong>(${a.role})</strong></div>
          <div class="activity-date">${a.date}</div>
          <div class="activity-type-line">Activity: ${a.typeCategory} > ${a.type}</div>
        </div>
      </div>`;
    }
  }
  if (!html) html = '<div style="padding:2rem;text-align:center;">No activities match the selected filters.</div>';

  document.getElementById('activitiesContainer').innerHTML = html;
  document.getElementById('resultCount').innerHTML =
    total === 0 ? '0 results'
                : `${start + 1} - ${Math.min(start + pageItems.length, total)} out of ${total} results`;
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById('paginationContainer');
  const tp = Math.max(totalPages, 1);

  const prev = currentPage > 1
    ? `<a class="pagination-nav" data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i> Prev</a>`
    : `<span class="pagination-nav disabled"><i class="fas fa-chevron-left"></i> Prev</span>`;
  const next = currentPage < tp
    ? `<a class="pagination-nav" data-page="${currentPage + 1}">Next <i class="fas fa-chevron-right"></i></a>`
    : `<span class="pagination-nav disabled">Next <i class="fas fa-chevron-right"></i></span>`;

  let pages = '';
  let startPage = Math.max(1, currentPage - 4);
  let endPage   = Math.min(tp, startPage + 8);
  if (endPage - startPage < 8) startPage = Math.max(1, endPage - 8);

  if (startPage > 1) pages += `<a class="pg-num" data-page="1">1</a>`;
  if (startPage > 2) pages += `<span class="ellipsis">…</span>`;
  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) pages += `<span class="pg-num active-page">${i}</span>`;
    else pages += `<a class="pg-num" data-page="${i}">${i}</a>`;
  }
  if (endPage < tp - 1) pages += `<span class="ellipsis">…</span>`;
  if (endPage < tp)     pages += `<a class="pg-num" data-page="${tp}">${tp}</a>`;

  container.innerHTML = `${prev}<div class="pagination-pages">${pages}</div>${next}`;
  container.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      currentPage = parseInt(el.getAttribute('data-page'), 10);
      renderActivities();
      window.scrollTo({ top: document.querySelector('.research-container').offsetTop - 20, behavior: 'smooth' });
    });
  });
}

function resetAndRender() {
  currentPage = 1;
  renderActivities();
}

/* ── Event listeners ── */
document.getElementById('searchInput').addEventListener('input', e => {
  currentSearch = e.target.value;
  resetAndRender();
});

document.querySelectorAll('#sdgList, #yearFilters, #typeDetailList').forEach(el => {
  el.addEventListener('change', resetAndRender);
});

document.querySelectorAll('.type-pill[data-filter-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.getAttribute('data-filter-type');
    document.querySelectorAll('#typeDetailList input').forEach(cb => cb.checked = false);
    if (type !== 'all') {
      const map = {
        "Conference presentation": "Conference presentations",
        "Seminar":      "Talks and presentations in private or public companies",
        "Workshop":     "Organisation or participation in workshops, courses, seminars, exhibitions or similar",
        "Organisation": "Conference organisation or participation"
      };
      const targetCb = document.querySelector(`#typeDetailList input[data-activity-type="${map[type]}"]`);
      if (targetCb) targetCb.checked = true;
    }
    resetAndRender();
  });
});

/* ── Init ── */
renderSdgList();
renderYearFilters();
renderTypeDetail();
updateTypePills();
renderActivities();
