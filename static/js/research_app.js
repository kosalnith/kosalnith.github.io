// ===== Constants & State =====
const ITEMS_PER_PAGE = 50;
const YEAR_MIN_BOUND = 2018;
const YEAR_MAX_BOUND = 2026;

let currentPage = 1;
let currentSearchTerm = '';
let yearRangeMin = YEAR_MIN_BOUND;
let yearRangeMax = YEAR_MAX_BOUND;
let currentDetailIdx = -1;
let sortOrder = 'desc'; // 'desc' = newest first, 'asc' = oldest first

// ===== Filtering =====

function getFilterKeyFromTypeLabel(label) {
  const mapping = {
    "Journal article": "articles",
    "Book chapter": "chapters",
    "Working paper": "working",
    "Other publication": "other",
    "Op-Ed / Commentary": "opeds",
    "Policy brief": "policy",
    "Work in progress": "progress"
  };
  return mapping[label] || null;
}

function getFilteredPublications() {
  const selectedTypeLabels = Array.from(document.querySelectorAll('#fullTypeList input:checked'))
    .map(cb => cb.getAttribute('data-type-label'));
  const types = selectedTypeLabels.map(label => getFilterKeyFromTypeLabel(label)).filter(k => k !== null);
  const oaOnly = document.getElementById('oaFilterCheckbox').checked;

  // Language filter
  const selectedLangs = Array.from(document.querySelectorAll('input[data-lang]:checked'))
    .map(cb => cb.getAttribute('data-lang'));

  // SDG filter
  const selectedSdgs = Array.from(document.querySelectorAll('.sdg-checkbox:checked'))
    .map(cb => cb.getAttribute('data-sdg'));

  let filtered = publicationsData.filter(p => {
    if (types.length && !types.includes(p.type)) return false;
    const yearNum = parseInt(p.year);
    if (!isNaN(yearNum) && (yearNum < yearRangeMin || yearNum > yearRangeMax)) return false;
    if (oaOnly && !p.oa) return false;
    if (selectedLangs.length && !selectedLangs.includes(p.lang || 'en')) return false;
    // SDG: publication must have at least one of the selected SDGs
    if (selectedSdgs.length) {
      if (!p.sdgs || !p.sdgs.some(s => selectedSdgs.includes(s))) return false;
    }
    return true;
  });

  if (currentSearchTerm.trim() !== '') {
    const term = currentSearchTerm.trim().toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.authors.toLowerCase().includes(term) ||
      (p.outlet && p.outlet.toLowerCase().includes(term)) ||
      (p.abstract && p.abstract.toLowerCase().includes(term)) ||
      (p.keywords && p.keywords.some(k => k.toLowerCase().includes(term)))
    );
  }
  return filtered;
}

// ===== Debounce utility =====
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ===== Abstract toggle =====
function toggleAbstract(btn) {
  const absDiv = btn.closest('.pub-details').querySelector('.abstract-text');
  const chevron = btn.querySelector('.abstract-chevron');
  const hint = btn.querySelector('.abstract-hint');
  const isOpen = absDiv.style.display !== 'none';
  absDiv.style.display = isOpen ? 'none' : 'block';
  chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
  if (hint) hint.textContent = isOpen ? '(click to expand)' : '(click to collapse)';
}

// ===== Co-author website directory =====
const coAuthorLinks = {
  'Sovannroeun Samreth':    'https://scholar.google.com/citations?user=samreth',
  'Dina Chhorn':            'https://www.cdri.org.kh/staff/dina-chhorn',
  'Yuki Kanayama':          'https://scholar.google.com/citations?user=kanayama',
  'Simona Iammarino':       'https://www.lse.ac.uk/geography-and-environment/people/academic-staff/simona-iammarino',
  'Sumontheany Muth':       'https://scholar.google.com/citations?user=muth',
  'Daniel Yonto':           'https://www.danielyonto.com',
  'Yudo Angorro':           'https://scholar.google.com/citations?user=angorro',
  'Vuthoun Khiev':          'https://scholar.google.com/citations?user=khiev',
  'I Younan An':            'https://www.cdri.org.kh',
  'Sivly Houy':             'https://www.cdri.org.kh',
  'Muny Nhim Kean':         'https://www.cdri.org.kh',
  'Sosengphyrun Mao':       'https://www.cdri.org.kh',
  'Summer-Solstice Thomas': 'https://asiafoundation.org',
  'Singhong Ly':            'https://scholar.google.com/citations?user=ly',
  'Kimly Lay':              'https://scholar.google.com/citations?user=lay',
  'Sopheak Song':           'https://www.cdri.org.kh',
  'Ronald A. Ruran':        'https://scholar.google.com/citations?user=ruran',
  'Hang Panha Hour':        'https://scholar.google.com/citations?user=hour',
};

// ===== Author display: only "(with X, Y and Z)" — Kosal Nith omitted (his page) =====
function formatAuthorsChicagoMeta(authorsStr) {
  if (!authorsStr) return '';

  const parts = authorsStr.split(/\s*&\s*|\s*,\s*(?=[A-Z])/);
  const coAuthors = parts.slice(1).map(a => a.trim()).filter(Boolean);

  // Solo author — show nothing
  if (!coAuthors.length) return '';

  // Build co-author list with links
  const coHtml = coAuthors.map(name => {
    const url = coAuthorLinks[name];
    return url
      ? `<a href="${url}" target="_blank" style="color:#1f4a7c;font-weight:500;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${name}</a>`
      : `<span style="color:#2e2d29;">${name}</span>`;
  });

  // Join: "X" / "X and Y" / "X, Y and Z"
  let coStr;
  if (coHtml.length === 1) {
    coStr = coHtml[0];
  } else if (coHtml.length === 2) {
    coStr = coHtml[0] + ' and ' + coHtml[1];
  } else {
    coStr = coHtml.slice(0, -1).join(', ') + ' and ' + coHtml[coHtml.length - 1];
  }

  return `<span style="color:#4a5568;font-weight:400;">(with ${coStr})</span>`;
}

// ===== Publication info line formatter =====
// Renders: *Journal*, vol(issue), pages, Month Year.
// Falls back gracefully when vol/issue/pages are absent.
function formatPubInfo(pub) {
  const parts = [];

  // Outlet in italics
  if (pub.outlet) parts.push(`<em>${pub.outlet}</em>`);

  // vol(issue) e.g. "140(4)"
  if (pub.vol) {
    parts.push(pub.issue ? `${pub.vol}(${pub.issue})` : `${pub.vol}`);
  }

  // pages e.g. "835–888"
  if (pub.pages) parts.push(pub.pages);

  // Month Year e.g. "May 2025" — use pub.month if set, else pub.date
  const timeStr = pub.month && pub.year && pub.year !== 'progress'
    ? `${pub.month} ${pub.year}`
    : pub.date || '';
  if (timeStr) parts.push(timeStr);

  // DOI
  if (pub.doi) parts.push(`DOI: <a href="https://doi.org/${pub.doi}" target="_blank" style="color:#b1040e;">${pub.doi}</a>`);

  return parts.join(', ');
}



function renderPublicationsWithPagination() {
  const filtered = getFilteredPublications();
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages === 0) currentPage = 1;
  else if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const grouped = {};
  pageItems.forEach(p => { if (!grouped[p.year]) grouped[p.year] = []; grouped[p.year].push(p); });
  const yearOrder = sortOrder === 'desc'
    ? ['progress','2026','2025','2024','2023','2022','2021','2020','2019','2018']
    : ['2018','2019','2020','2021','2022','2023','2024','2025','2026','progress'];

  let html = '';
  for (let y of yearOrder) {
    if (!grouped[y]) continue;
    const yearLabel = y === 'progress' ? 'Work in Progress' : y;
    html += `<div class="year-header">${yearLabel}</div>`;
    for (let pub of grouped[y]) {
      html += `
        <div class="publication">
          <div class="pub-details">
            <div class="pub-title">
              <a href="#" class="pub-detail-link" data-pub-idx="${publicationsData.indexOf(pub)}">${pub.title}</a>
            </div>
            ${formatAuthorsChicagoMeta(pub.authors) ? `<div class="pub-meta">${formatAuthorsChicagoMeta(pub.authors)}</div>` : ''}
            <div class="pub-outlet">${formatPubInfo(pub)}</div>
            <div class="pub-breadcrumb">${pub.breadcrumb || 'Research output'}</div>

            <div class="card-bottom">

              ${(pub.oa || pub.forthcoming || pub.underReview || pub.award) ? `
              <div class="badge-row">
                ${pub.oa ? '<span class="oa-badge"><i class="fas fa-lock-open"></i> Open Access</span>' : ''}
                ${pub.forthcoming ? '<span class="forthcoming"><i class="fas fa-clock"></i> Forthcoming</span>' : ''}
                ${pub.underReview ? '<span class="under-review"><i class="fas fa-rotate"></i> Under Review</span>' : ''}
                ${pub.award ? '<span class="award-badge"><i class="fas fa-trophy"></i> Award Winner</span>' : ''}
              </div>` : ''}

              <div class="pub-actions">
                ${pub.abstract ? `
                <button class="abstract-toggle-btn" onclick="toggleAbstract(this)">
                  <i class="fas fa-chevron-right abstract-chevron"></i>
                  <strong>Abstract</strong>
                  <span class="abstract-hint">(click to expand)</span>
                </button>` : ''}
                ${pub.abstract && pub.link ? `<span class="pub-actions-sep">·</span>` : ''}
                ${pub.link ? `<a class="link-btn" href="${pub.link}" target="_blank"><i class="fas fa-arrow-up-right-from-square"></i> Open</a>` : ''}
              </div>

              ${pub.abstract ? `<div class="abstract-text" style="display:none;">${pub.abstract}</div>` : ''}

              ${pub.resources && pub.resources.length ? `
              <div class="pub-resources">
                ${pub.resources.map(r => r.url
                  ? `<a class="resource-btn" href="${r.url}" target="_blank"><i class="fas ${r.icon}"></i> ${r.label}</a>`
                  : `<span class="resource-btn resource-btn--inactive"><i class="fas ${r.icon}"></i> ${r.label}</span>`
                ).join('')}
              </div>` : ''}

              ${pub.keywords && pub.keywords.length ? `
              <div class="pub-keywords">
                ${pub.keywords.slice(0, 3).map((k, i) =>
                  `<span class="pub-kw"><span class="pub-kw-dot ${pub.kwStrength[i] || 'none'}"></span>${k}</span>`
                ).join('')}
              </div>` : ''}

            </div>
          </div>
          <div class="right-stats">
            <div class="altmetric-donut">
              <svg viewBox="0 0 100 100" width="48" height="48" aria-hidden="true">
                <use href="#altmetric-icon"/>
              </svg>
            </div>
            ${pub.downloads ? `
            <div class="download-circle">
              <div class="dl-num">${pub.downloads}</div>
              <div class="dl-label">Downloads</div>
            </div>` : ''}
          </div>
        </div>`;
    }
  }

  document.getElementById('publicationsContainer').innerHTML = html ||
    '<div style="padding: 2rem; text-align: center; color: #6c7a8e;">No publications match the selected filters and search term.</div>';

  const start = totalItems === 0 ? 0 : startIdx + 1;
  const end = Math.min(startIdx + pageItems.length, totalItems);
  document.getElementById('resultCount').innerText =
    totalItems === 0 ? '0 results' : `${start} - ${end} out of ${totalItems} results`;

  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  const container = document.getElementById('paginationContainer');
  if (!container) return;
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '';
  if (currentPage > 1) html += `<a data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i> Previous</a>`;
  else html += `<span class="disabled"><i class="fas fa-chevron-left"></i> Previous</span>`;

  let startPage = Math.max(1, currentPage - 3);
  let endPage = Math.min(totalPages, startPage + 6);
  if (endPage - startPage < 6 && startPage > 1) startPage = Math.max(1, endPage - 6);

  if (startPage > 1) html += `<a data-page="1">1</a>`;
  if (startPage > 2) html += `<span class="ellipsis">...</span>`;
  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) html += `<span class="active-page">${i}</span>`;
    else html += `<a data-page="${i}">${i}</a>`;
  }
  if (endPage < totalPages - 1) html += `<span class="ellipsis">...</span>`;
  if (endPage < totalPages) html += `<a data-page="${totalPages}">${totalPages}</a>`;

  if (currentPage < totalPages) html += `<a data-page="${currentPage + 1}">Next <i class="fas fa-chevron-right"></i></a>`;
  else html += `<span class="disabled">Next <i class="fas fa-chevron-right"></i></span>`;

  container.innerHTML = html;
  container.querySelectorAll('a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const newPage = parseInt(link.getAttribute('data-page'), 10);
      if (!isNaN(newPage) && newPage !== currentPage) {
        currentPage = newPage;
        renderPublicationsWithPagination();
      }
    });
  });
}

// ===== Rendering: Sidebar Filters =====

function renderSdgList() {
  const container = document.getElementById('sdgList');
  if (!container) return;
  let html = '';
  sdgItems.forEach((item, idx) => {
    const hiddenClass = idx >= 6 ? 'sdg-hidden' : '';
    html += `<label class="custom-check ${hiddenClass}">
      <input type="checkbox" class="sdg-checkbox" data-sdg="${item.label}">
      <span class="check-box"></span>
      <span class="custom-check-left">
        <span>${item.label}</span>
        <span class="count-badge">(${item.count})</span>
      </span>
    </label>`;
  });
  container.innerHTML = html;

  let expanded = false;
  const toggleBtn = document.getElementById('toggleSdgBtn');
  toggleBtn.innerText = 'Show more ›';
  toggleBtn.onclick = () => {
    expanded = !expanded;
    const allItems = document.querySelectorAll('#sdgList .custom-check');
    if (expanded) {
      allItems.forEach(item => item.classList.remove('sdg-hidden'));
      toggleBtn.innerText = 'Show less';
    } else {
      allItems.forEach((item, idx) => {
        if (idx >= 6) item.classList.add('sdg-hidden');
        else item.classList.remove('sdg-hidden');
      });
      toggleBtn.innerText = 'Show more ›';
    }
  };
}

function renderTypeList() {
  const container = document.getElementById('fullTypeList');
  if (!container) return;
  let html = '';
  const INITIAL_VISIBLE = 5;
  uniqueTypes.forEach((type, idx) => {
    const hiddenClass = idx >= INITIAL_VISIBLE ? 'type-hidden' : '';
    html += `<label class="custom-check ${hiddenClass}" data-type-key="${type.key}">
      <input type="checkbox" data-filter="${type.dataFilter || type.key}" data-type-label="${type.label}">
      <span class="check-box"></span>
      <span class="custom-check-left">
        <span>${type.label}</span>
        <span class="count-badge">(${type.count})</span>
      </span>
    </label>`;
  });
  container.innerHTML = html;

  let typeExpanded = false;
  const showMoreBtn = document.getElementById('showMoreTypesBtn');
  showMoreBtn.innerText = 'Show more ›';
  showMoreBtn.onclick = () => {
    typeExpanded = !typeExpanded;
    const allItems = document.querySelectorAll('#fullTypeList .custom-check');
    allItems.forEach((item, idx) => {
      if (typeExpanded) item.classList.remove('type-hidden');
      else if (idx >= INITIAL_VISIBLE) item.classList.add('type-hidden');
      else item.classList.remove('type-hidden');
    });
    showMoreBtn.innerText = typeExpanded ? 'Show less' : 'Show more ›';
  };
}

// ===== Year Slider =====

function updateYearSliderUI() {
  const minVal = parseInt(document.getElementById('yearSliderMin').value);
  const maxVal = parseInt(document.getElementById('yearSliderMax').value);
  const pctMin = (minVal - YEAR_MIN_BOUND) / (YEAR_MAX_BOUND - YEAR_MIN_BOUND) * 100;
  const pctMax = (maxVal - YEAR_MIN_BOUND) / (YEAR_MAX_BOUND - YEAR_MIN_BOUND) * 100;

  // Hide floating pill labels (replaced by static minmax display)
  const minLabel = document.getElementById('yearMinLabel');
  const maxLabel = document.getElementById('yearMaxLabel');
  if (minLabel) minLabel.style.display = 'none';
  if (maxLabel) maxLabel.style.display = 'none';

  // Update static min/max labels below the track to show selected years
  const minStatic = document.getElementById('yearMinStatic');
  const maxStatic = document.getElementById('yearMaxStatic');
  if (minStatic) { minStatic.textContent = minVal; minStatic.style.color = minVal > YEAR_MIN_BOUND ? '#b1040e' : ''; minStatic.style.fontWeight = minVal > YEAR_MIN_BOUND ? '700' : ''; }
  if (maxStatic) { maxStatic.textContent = maxVal; maxStatic.style.color = maxVal < YEAR_MAX_BOUND ? '#b1040e' : ''; maxStatic.style.fontWeight = maxVal < YEAR_MAX_BOUND ? '700' : ''; }

  // Fill bar
  const fill = document.getElementById('yearFill');
  if (fill) { fill.style.left = pctMin + '%'; fill.style.width = (pctMax - pctMin) + '%'; }

  yearRangeMin = minVal;
  yearRangeMax = maxVal;
}

function initYearSlider() {
  const sliderMin = document.getElementById('yearSliderMin');
  const sliderMax = document.getElementById('yearSliderMax');
  sliderMin.addEventListener('input', () => {
    if (parseInt(sliderMin.value) > parseInt(sliderMax.value)) sliderMin.value = sliderMax.value;
    updateYearSliderUI();
    updateFiltersAndResetPage();
  });
  sliderMax.addEventListener('input', () => {
    if (parseInt(sliderMax.value) < parseInt(sliderMin.value)) sliderMax.value = sliderMin.value;
    updateYearSliderUI();
    updateFiltersAndResetPage();
  });
  updateYearSliderUI();
}

// ===== Event Listeners =====

function updateFiltersAndResetPage() {
  currentPage = 1;
  renderPublicationsWithPagination();
}

function initEventListeners() {
  // Debounced search input
  document.getElementById('searchInput').addEventListener('input', debounce((e) => {
    currentSearchTerm = e.target.value;
    currentPage = 1;
    renderPublicationsWithPagination();
  }, 200));

  document.getElementById('fullTypeList').addEventListener('change', updateFiltersAndResetPage);
  document.getElementById('oaFilterCheckbox').addEventListener('change', updateFiltersAndResetPage);

  // Language filter checkboxes
  document.querySelectorAll('input[data-lang]').forEach(cb => {
    cb.addEventListener('change', updateFiltersAndResetPage);
  });

  // SDG filter — event delegation on the container (handles dynamic checkboxes)
  const sdgContainer = document.getElementById('sdgList');
  if (sdgContainer) {
    sdgContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('sdg-checkbox')) {
        updateFiltersAndResetPage();
      }
    });
  }

  // Top pill buttons
  document.querySelectorAll('.type-pill[data-filter-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      const filterVal = btn.getAttribute('data-filter-type');
      document.querySelectorAll('#fullTypeList input').forEach(cb => cb.checked = false);
      if (filterVal !== 'all') {
        const targetCb = document.querySelector(`#fullTypeList input[data-filter="${filterVal}"]`);
        if (targetCb) targetCb.checked = true;
      }
      document.getElementById('oaFilterCheckbox').checked = false;
      document.getElementById('yearSliderMin').value = YEAR_MIN_BOUND;
      document.getElementById('yearSliderMax').value = YEAR_MAX_BOUND;
      updateYearSliderUI();
      updateFiltersAndResetPage();
    });
  });

  // More dropdown items
  document.querySelectorAll('.more-item').forEach(item => {
    item.addEventListener('click', () => {
      const type = item.getAttribute('data-more-type');
      document.querySelectorAll('#fullTypeList input').forEach(cb => cb.checked = false);
      const targetCb = document.querySelector(`#fullTypeList input[data-filter="${type}"]`);
      if (targetCb) targetCb.checked = true;
      document.getElementById('oaFilterCheckbox').checked = false;
      document.getElementById('yearSliderMin').value = YEAR_MIN_BOUND;
      document.getElementById('yearSliderMax').value = YEAR_MAX_BOUND;
      updateYearSliderUI();
      updateFiltersAndResetPage();
      document.getElementById('moreDropdown').classList.remove('open');
    });
  });

  document.getElementById('moreButton').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('moreDropdown').classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.more-wrapper')) document.getElementById('moreDropdown').classList.remove('open');
  });

  // Sort button
  const sortBtn = document.getElementById('sortBtn');
  if (sortBtn) {
    sortBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
      const label = sortOrder === 'desc' ? 'Publication Year, Title <i class="fas fa-chevron-down" id="sortIcon"></i>'
                                         : 'Publication Year, Title <i class="fas fa-chevron-up" id="sortIcon"></i>';
      sortBtn.innerHTML = label;
      currentPage = 1;
      renderPublicationsWithPagination();
    });
  }

  // Export button — builds CSV from currently filtered results
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const filtered = getFilteredPublications();
      if (!filtered.length) { alert('No results to export.'); return; }
      const headers = ['Title','Authors','Year','Date','Outlet','Type','OA','Link','Abstract'];
      const escape = v => `"${String(v || '').replace(/"/g, '""')}"`;
      const rows = filtered.map(p => [
        escape(p.title),
        escape(p.authors),
        escape(p.year),
        escape(p.date),
        escape(p.outlet),
        escape(p.type),
        escape(p.oa ? 'Yes' : 'No'),
        escape(p.link),
        escape(p.abstract)
      ].join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'kosalnith_research_output.csv';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    });
  }


  document.getElementById('publicationsContainer').addEventListener('click', (e) => {
    const link = e.target.closest('.pub-detail-link');
    if (link) {
      e.preventDefault();
      const idx = parseInt(link.getAttribute('data-pub-idx'));
      showDetail(idx);
    }
  });
}

// ===== Detail Page — URL routing =====

// Build a clean URL slug from a publication title
function titleToSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80)
    .replace(/-+$/, '');
}

// Find publication index by slug
function findIdxBySlug(slug) {
  return publicationsData.findIndex(p => titleToSlug(p.title) === slug);
}

// Update <meta> OG tags for social sharing
function updateMetaTags(pub) {
  const base = 'https://kosalnith.github.io/research_main.html';
  const slug = titleToSlug(pub.title);
  const url  = `${base}?pub=${slug}`;
  const desc = pub.abstract
    ? pub.abstract.substring(0, 200) + '…'
    : `${pub.authors}. ${pub.outlet || ''}. ${pub.year || ''}`;

  // Each publication has its own ogImage field pointing to a unique branded card
  const ogImage = pub.ogImage || 'https://kosalnith.github.io/static/img/og-research.png';

  const setMeta = (sel, val) => {
    let el = document.querySelector(sel);
    if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
    el.setAttribute('content', val);
  };
  const setMetaProp = (prop, val) => setMeta(`meta[property="${prop}"]`, val);
  const setMetaName  = (name, val) => setMeta(`meta[name="${name}"]`, val);

  document.title = pub.title + ' · Kosal Nith';

  setMetaProp('og:title',           pub.title + ' · Kosal Nith');
  setMetaProp('og:description',     desc);
  setMetaProp('og:url',             url);
  setMetaProp('og:type',            'article');
  setMetaProp('og:image',           ogImage);
  setMetaProp('og:image:width',     '1200');
  setMetaProp('og:image:height',    '630');
  setMetaProp('og:site_name',       'Kosal Nith · Research Portal');

  setMetaName('twitter:card',        'summary_large_image');
  setMetaName('twitter:title',       pub.title + ' · Kosal Nith');
  setMetaName('twitter:description', desc);
  setMetaName('twitter:image',       ogImage);
  setMetaName('twitter:site',        '@kosalnith');

  // Update canonical href
  let canon = document.querySelector('link[rel="canonical"]');
  if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
  canon.href = url;
}

function showList() {
  document.getElementById('pubDetailView').style.display = 'none';
  document.getElementById('pubListView').style.display  = 'block';
  window.scrollTo(0, 0);
  document.title = 'Kosal Nith · Research output';
  history.pushState({ view: 'list' }, '', window.location.pathname);
  // Restore default meta
  const setMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', val); };
  setMeta('meta[property="og:title"]',       'Research output · Kosal Nith');
  setMeta('meta[property="og:description"]', 'Research output by Kosal Nith — economist and researcher at CDRI.');
  setMeta('meta[property="og:url"]',         'https://kosalnith.github.io/research_main.html');
  setMeta('meta[property="og:image"]',       'https://kosalnith.github.io/static/img/og-research.png');
  setMeta('meta[name="twitter:image"]',      'https://kosalnith.github.io/static/img/og-research.png');
  setMeta('meta[name="twitter:card"]',       'summary_large_image');
}

function showDetail(idx) {
  const pub = publicationsData[idx];
  if (!pub) return;
  currentDetailIdx = idx;
  document.getElementById('pubListView').style.display   = 'none';
  document.getElementById('pubDetailView').style.display = 'block';
  window.scrollTo(0, 0);
  document.title = pub.title + ' · Kosal Nith';

  // Push ?pub=slug to URL
  const slug    = titleToSlug(pub.title);
  const newUrl  = `${window.location.pathname}?pub=${slug}`;
  history.pushState({ view: 'detail', idx }, '', newUrl);
  updateMetaTags(pub);

  // Build shareable URL
  const shareUrl = `https://kosalnith.github.io/research_main.html?pub=${slug}`;

  // Prev / Next nav
  const prevPub = publicationsData[idx - 1];
  const nextPub = publicationsData[idx + 1];
  document.getElementById('detailNavRow').innerHTML = `
    <button class="detail-nav-btn ${!prevPub ? 'disabled' : ''}" onclick="${prevPub ? `showDetail(${idx - 1})` : ''}">
      <i class="fas fa-chevron-left"></i>
      <span class="nav-label">Previous</span>
    </button>
    <button class="detail-back-btn" onclick="showList()" style="margin:0;white-space:nowrap;">
      <i class="fas fa-list"></i> All publications
    </button>
    <div class="detail-share-inline">
      <span class="detail-share-label"><i class="fas fa-share-nodes"></i> Share</span>
      <a class="detail-share-inline-btn" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(pub.title)}&url=${encodeURIComponent(shareUrl)}" target="_blank" title="Share on X / Twitter">
        <i class="fab fa-x-twitter"></i>
      </a>
      <a class="detail-share-inline-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}" target="_blank" title="Share on LinkedIn">
        <i class="fab fa-linkedin-in"></i>
      </a>
      <a class="detail-share-inline-btn" href="mailto:?subject=${encodeURIComponent(pub.title)}&body=${encodeURIComponent('Check out this paper: ' + shareUrl)}" title="Share via Email">
        <i class="fas fa-envelope"></i>
      </a>
      <button class="detail-share-inline-btn detail-copy-link-btn" onclick="copyPubLink('${shareUrl}')" title="Copy link">
        <i class="fas fa-link" id="copyLinkIcon"></i>
      </button>
    </div>
    <button class="detail-nav-btn ${!nextPub ? 'disabled' : ''}" onclick="${nextPub ? `showDetail(${idx + 1})` : ''}" style="flex-direction:row-reverse;text-align:right;">
      <span class="nav-label">Next</span>
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  // Breadcrumb
  const typeLabel = pub.breadcrumb || 'Research output';
  document.getElementById('detailBreadcrumb').innerHTML =
    `<a href="#" onclick="showList();return false;"><i class="fas fa-home" style="font-size:1.5rem;margin-right:3px;"></i> Research output</a>
     <span class="sep">›</span>
     <span>${typeLabel}</span>
     <span class="sep">›</span>
     <span style="color:#2c3f55;font-weight:500;">${pub.title.substring(0, 60)}${pub.title.length > 60 ? '…' : ''}</span>`;

  // Fingerprint from keywords
  const fpItems = pub.keywords
    ? pub.keywords.slice(0, 5).map((k, i) => ({
        label: k,
        pct: Math.max(18, Math.round(100 - i * 18)),
        cat: i % 2 === 0 ? 'Economics & Finance' : 'Keyphrases'
      }))
    : [];

  // Citation formats
  const yearStr = pub.year && pub.year !== 'progress' ? pub.year : 'n.d.';

  // Authors are already full names in data (e.g. "Kosal Nith & Yuki Kanayama")
  // Helper: split on " & " or ", " between authors
  function splitAuthors(raw) {
    return raw.split(/\s*&\s*/).map(a => a.trim()).filter(Boolean);
  }

  // For APA/Harvard/Chicago: convert "First Last" → "Last, First"
  function toLastFirst(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return name;
    const last = parts[parts.length - 1];
    const first = parts.slice(0, -1).join(' ');
    return `${last}, ${first}`;
  }

  // authorsExpanded = full name string for metadata table / BibTeX / RIS
  const authorsExpanded = pub.authors;
  const authorList = splitAuthors(pub.authors);

  // APA: Last, First, & Last, First (year). Title. Outlet.
  function buildAPA(p, yr) {
    const formatted = authorList.map((a, i) => {
      const lf = toLastFirst(a);
      return i === authorList.length - 1 && authorList.length > 1 ? '&amp; ' + lf : lf;
    }).join(', ');
    return `${formatted} (${yr}). ${p.title}. <em>${p.outlet || ''}</em>.${p.link ? ` <a href="${p.link}" target="_blank" style="color:#b1040e;">${p.link}</a>` : ''}`;
  }

  // Harvard: Last, First and Last, First (year) 'Title', Outlet.
  function buildHarvard(p, yr) {
    const formatted = authorList.map((a, i) => {
      const lf = toLastFirst(a);
      return i === authorList.length - 1 && authorList.length > 1 ? 'and ' + lf : lf;
    }).join(', ');
    return `${formatted} (${yr}) '${p.title}', <em>${p.outlet || ''}</em>.`;
  }

  // Chicago 17th ed: Last, First, First Last, and First Last. YEAR. "Title." Outlet. URL.
  // e.g. Rossi-Hansberg, Esteban, Pierre-Daniel Sarte, and Felipe Schwartzman. 2026.
  //      "Cognitive Hubs and Spatial Redistribution." American Economic Journal: Macroeconomics 18 (2): 72–111.
  function buildChicago(p, yr) {
    const formatted = authorList.map((a, i) => {
      if (i === 0) return toLastFirst(a);  // first: Last, First
      return a;                             // subsequent: First Last
    });
    const authStr = formatted.length > 2
      ? formatted.slice(0, -1).join(', ') + ', and ' + formatted[formatted.length - 1]
      : formatted.length === 2
        ? formatted[0] + ', and ' + formatted[1]
        : formatted[0];
    const outletStr = p.outlet ? `<em>${p.outlet}</em>` : '';
    const linkStr = p.link ? ` <a href="${p.link}" target="_blank" style="color:#b1040e;">${p.link}</a>` : '';
    return `${authStr}. ${yr !== 'n.d.' ? yr : 'n.d.'}. "${p.title}." ${outletStr}.${linkStr}`;
  }

  const apa      = buildAPA(pub, yearStr);
  const harvard  = buildHarvard(pub, yearStr);
  const chicago  = buildChicago(pub, yearStr);
  const bibtex   = `@article{nith${yearStr},\n  title    = {${pub.title}},\n  author   = {${authorsExpanded}},\n  year     = {${yearStr}},\n  journal  = {${pub.outlet || ''}},${pub.link ? `\n  url      = {${pub.link}},` : ''}\n  keywords = {${(pub.keywords || []).join(', ')}}\n}`;
  const ris      = `TY  - JOUR\nT1  - ${pub.title}\nAU  - ${authorsExpanded}\nPY  - ${yearStr}\nJO  - ${pub.outlet || ''}\n${pub.link ? `UR  - ${pub.link}\n` : ''}KW  - ${(pub.keywords || []).join('\nKW  - ')}\nER  -`;

  // Related publications
  const related = publicationsData
    .filter((p, i) => i !== idx && (p.type === pub.type || (pub.keywords && p.keywords && pub.keywords.some(k => p.keywords.includes(k)))))
    .slice(0, 4);

  // Build main content
  document.getElementById('detailMain').innerHTML = `
    <div class="detail-type-tag">${typeLabel}</div>
    <h1 class="detail-title">${pub.title}</h1>
    <div class="detail-authors">${formatAuthorsChicagoMeta(pub.authors)}</div>
    <div class="detail-affil">
      <i class="fas fa-university" style="color:#9aaebf;margin-right:6px;font-size:1.5rem;"></i>
      Cambodia Development Resource Institute (CDRI) &nbsp;·&nbsp; Phnom Penh, Cambodia
    </div>
    <div class="detail-output-tag">
      Research output: ${typeLabel}
      ${pub.oa ? ' &nbsp;<span class="detail-badge-oa" style="vertical-align:middle;"><i class="fas fa-lock-open"></i> Open Access</span>' : ''}
      ${pub.award ? ' &nbsp;<span style="color:#bc7a2e;font-style:normal;"><i class="fas fa-trophy"></i> Award Winner</span>' : ''}
    </div>

    <div class="detail-tab-bar">
      <div class="detail-tab active" onclick="switchDetailTab(this,'overview')">Overview</div>
      <div class="detail-tab" onclick="switchDetailTab(this,'fingerprint')">Fingerprint</div>
      <div class="detail-tab" onclick="switchDetailTab(this,'cite')">Cite</div>
    </div>

    <!-- Overview tab -->
    <div id="detailTabOverview">
      ${pub.abstract ? `
      <div class="detail-section-title">Abstract</div>
      <div class="detail-abstract">${pub.abstract}</div>` : `
      <div style="padding:1.2rem;background:#f9fbfd;border-radius:10px;color:#6c7a8e;font-size:1.6rem;margin-bottom:1.5rem;border:1px solid #e8edf5;">
        <i class="fas fa-info-circle" style="margin-right:6px;"></i>No abstract available for this publication.
      </div>`}

      <div class="detail-section-title">Publication details</div>
      <table class="detail-meta-table">
        <tr><td>Authors</td><td>${authorsExpanded}</td></tr>
        <tr><td>Year</td><td>${yearStr !== 'n.d.' ? yearStr : '<em style="color:#6c7a8e;">Work in progress</em>'}</td></tr>
        <tr><td>Date</td><td>${pub.date || '—'}</td></tr>
        <tr><td>Outlet / Journal</td><td>${pub.outlet || '—'}</td></tr>
        <tr><td>Publication type</td><td>${typeLabel}</td></tr>
        <tr><td>Language</td><td>${pub.lang === 'fr' ? 'French' : pub.lang === 'km' ? 'Khmer' : 'English'}</td></tr>
        <tr><td>Open Access</td><td>${pub.oa ? '<span class="detail-badge-oa" style="margin:0;"><i class="fas fa-lock-open"></i> Open Access</span>' : '<span style="color:#6c7a8e;">Restricted</span>'}</td></tr>
        ${pub.forthcoming ? `<tr><td>Status</td><td><span class="forthcoming">Forthcoming</span></td></tr>` : ''}
        ${pub.underReview ? `<tr><td>Status</td><td><span class="under-review">Under Review</span></td></tr>` : ''}
        ${pub.link ? `<tr><td>External link</td><td><a href="${pub.link}" target="_blank" style="color:#b1040e;">${pub.link} <i class="fas fa-external-link-alt" style="font-size:1.4rem;"></i></a></td></tr>` : ''}
      </table>

      ${pub.keywords && pub.keywords.length ? `
      <div class="detail-section-title">Keywords</div>
      <div class="detail-keywords">
        ${pub.keywords.map(k => `<span class="detail-keyword">${k}</span>`).join('')}
      </div>` : ''}

      ${related.length ? `
      <div class="detail-section-title">Related publications</div>
      <div>
        ${related.map((r) => `
        <div class="detail-related-item">
          <div class="detail-related-title" onclick="showDetail(${publicationsData.indexOf(r)})">${r.title}</div>
          <div class="detail-related-meta">${r.authors} · ${r.date || r.year || ''} · ${r.outlet || ''}</div>
        </div>`).join('')}
      </div>` : ''}
    </div>

    <!-- Fingerprint tab -->
    <div id="detailTabFingerprint" style="display:none;">
      ${fpItems.length ? `
      <p style="font-size:1.6rem;color:#4b5e77;margin-bottom:1.5rem;line-height:1.6;">
        Dive into the research topics of '<em>${pub.title}</em>'. Together they form a unique fingerprint.
      </p>
      <div class="detail-fp-header">Research topics</div>
      ${fpItems.map(fp => `
        <div class="detail-fingerprint-item">
          <div class="detail-fp-label">
            <span>${fp.label}</span>
            <span>${fp.pct}%</span>
          </div>
          <div class="detail-fp-bar-bg">
            <div class="detail-fp-bar" style="width:${fp.pct}%"></div>
          </div>
          <div style="font-size:1.5rem;color:#9aaebf;margin-top:3px;">${fp.cat}</div>
        </div>`).join('')}` : `
      <p style="color:#6c7a8e;font-size:1.6rem;padding:1rem 0;">No fingerprint data available for this publication.</p>`}
    </div>

    <!-- Cite tab — redesigned -->
    <div id="detailTabCite" style="display:none;">
      <div class="detail-section-title">Cite this publication</div>

      <!-- Tab selector bar -->
      <div class="cite-tab-bar">
        <button class="cite-tab-btn active" onclick="switchCiteTab(this,'apa')">APA</button>
        <button class="cite-tab-btn" onclick="switchCiteTab(this,'harvard')">Harvard</button>
        <button class="cite-tab-btn" onclick="switchCiteTab(this,'chicago')">Chicago</button>
        <button class="cite-tab-btn" onclick="switchCiteTab(this,'bibtex')">BibTeX</button>
        <button class="cite-tab-btn" onclick="switchCiteTab(this,'ris')">RIS</button>
      </div>

      <!-- Citation boxes -->
      <div class="cite-box-wrap">
        <div class="cite-box" id="citeBoxApa">
          <button class="cite-copy-btn" onclick="copyText('citeBoxApa')"><i class="fas fa-copy"></i> Copy</button>
          <div class="cite-text">${apa}</div>
        </div>
        <div class="cite-box" id="citeBoxHarvard" style="display:none;">
          <button class="cite-copy-btn" onclick="copyText('citeBoxHarvard')"><i class="fas fa-copy"></i> Copy</button>
          <div class="cite-text">${harvard}</div>
        </div>
        <div class="cite-box" id="citeBoxChicago" style="display:none;">
          <button class="cite-copy-btn" onclick="copyText('citeBoxChicago')"><i class="fas fa-copy"></i> Copy</button>
          <div class="cite-text">${chicago}</div>
        </div>
        <div class="cite-box" id="citeBoxBibtex" style="display:none;font-family:monospace;">
          <button class="cite-copy-btn" onclick="copyText('citeBoxBibtex')"><i class="fas fa-copy"></i> Copy</button>
          <div class="cite-text" style="white-space:pre;">${bibtex}</div>
        </div>
        <div class="cite-box" id="citeBoxRis" style="display:none;font-family:monospace;">
          <button class="cite-copy-btn" onclick="copyText('citeBoxRis')"><i class="fas fa-copy"></i> Copy</button>
          <div class="cite-text" style="white-space:pre;">${ris}</div>
        </div>
      </div>

      <!-- Export buttons -->
      <div class="cite-export-row">
        <a class="cite-export-btn" href="data:text/plain;charset=utf-8,${encodeURIComponent(ris)}" download="citation_nith.ris">
          <i class="fas fa-download"></i> Export RIS
        </a>
        <a class="cite-export-btn" href="data:text/plain;charset=utf-8,${encodeURIComponent(bibtex)}" download="citation_nith.bib">
          <i class="fas fa-download"></i> Export BibTeX
        </a>
      </div>
    </div>
  `;

  // Build sidebar
  document.getElementById('detailSidebar').innerHTML = `
    ${pub.award ? `<div class="detail-award"><i class="fas fa-trophy"></i> Award Winner — Best Paper</div>` : ''}

    ${pub.oa || pub.link ? `
    <div class="detail-card">
      <div class="detail-card-title"><i class="fas fa-folder-open" style="margin-right:5px;color:#b1040e;"></i>Access to Publication</div>
      ${pub.oa ? '<div class="detail-badge-oa"><i class="fas fa-lock-open"></i> Open Access</div>' : ''}
      ${pub.link ? `<a class="detail-access-link" href="${pub.link}" target="_blank">
        <span class="access-icon"><i class="fas fa-external-link-alt" style="color:#b1040e;font-size:1.6rem;"></i></span>
        <span style="font-size:1.6rem;">Open full text<span class="detail-access-sub" style="font-size:1.5rem;">${pub.outlet || 'External link'}</span></span>
      </a>` : ''}
    </div>` : ''}

    ${pub.downloads ? `
    <div class="detail-card">
      <div class="detail-card-title"><i class="fas fa-chart-bar" style="margin-right:5px;color:#b1040e;"></i>Usage statistics</div>
      <div class="detail-stat-row">
        <div class="detail-stat-num">${pub.downloads}</div>
        <div style="line-height:1.3;font-size:1.6rem;"><strong>Downloads</strong><br><span style="font-size:1.5rem;color:#6c7a8e;">Full-text downloads</span></div>
      </div>
    </div>` : ''}

    <div class="detail-card">
      <div class="detail-card-title"><i class="fas fa-user-circle" style="margin-right:5px;color:#b1040e;"></i>Author profile</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#b1040e,#e84655);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:2rem;flex-shrink:0;">K</div>
        <div>
          <div style="font-size:1.7rem;font-weight:700;color:#2e2d29;">Kosal Nith</div>
          <div style="font-size:1.5rem;color:#6c7a8e;">Economist &amp; Researcher</div>
        </div>
      </div>
      <div style="font-size:1.6rem;color:#4b5e77;line-height:1.6;margin-bottom:12px;">
        <i class="fas fa-map-marker-alt" style="color:#b1040e;margin-right:6px;font-size:1.5rem;"></i>
        Cambodia Development Resource Institute<br>
        <span style="margin-left:20px;">Phnom Penh, Cambodia</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <a href="https://scholar.google.com/citations?user=LG2mrO4AAAAJ" target="_blank" class="detail-share-btn">
          <i class="fas fa-graduation-cap" style="color:#4285F4;"></i> Google Scholar
        </a>
        <a href="https://orcid.org/0000-0002-6976-4733" target="_blank" class="detail-share-btn">
          <i class="fas fa-id-badge" style="color:#A6CE39;"></i> ORCID
        </a>
        <a href="https://ideas.repec.org/f/pni504.html" target="_blank" class="detail-share-btn">
          <i class="fas fa-chart-line" style="color:#b1040e;"></i> IDEAS/RePec
        </a>
      </div>
    </div>

    <div class="detail-card">
      <div class="detail-card-title"><i class="fas fa-share-alt" style="margin-right:5px;color:#b1040e;"></i>Share</div>
      <div class="detail-share-row">
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(pub.title)}&url=${encodeURIComponent(pub.link || 'https://kosalnith.com')}" target="_blank" class="detail-share-btn">
          <i class="fab fa-twitter" style="color:#1da1f2;"></i> Twitter
        </a>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pub.link || 'https://kosalnith.com')}" target="_blank" class="detail-share-btn">
          <i class="fab fa-linkedin" style="color:#0077b5;"></i> LinkedIn
        </a>
      </div>
    </div>

    <div class="detail-card">
      <div class="detail-card-title"><i class="fas fa-atom" style="margin-right:5px;color:#7b3fa0;"></i>Altmetric</div>
      <div style="display:flex;align-items:center;gap:14px;padding:4px 0 8px;">
        <svg viewBox="0 0 100 100" width="60" height="60" style="flex-shrink:0;">
          <circle cx="50" cy="50" r="8" fill="#7b3fa0"/>
          <circle cx="50" cy="18" r="7" fill="#e8821a"/>
          <circle cx="76" cy="30" r="6" fill="#7b3fa0"/>
          <circle cx="82" cy="60" r="6" fill="#7b3fa0"/>
          <circle cx="62" cy="82" r="6" fill="#7b3fa0"/>
          <circle cx="36" cy="80" r="5" fill="#7b3fa0"/>
          <circle cx="20" cy="60" r="5" fill="#c0c0c0"/>
          <circle cx="26" cy="30" r="5" fill="#7b3fa0"/>
          <line x1="50" y1="50" x2="50" y2="18" stroke="#7b3fa0" stroke-width="2.5"/>
          <line x1="50" y1="50" x2="76" y2="30" stroke="#7b3fa0" stroke-width="2.5"/>
          <line x1="50" y1="50" x2="82" y2="60" stroke="#7b3fa0" stroke-width="2.5"/>
          <line x1="50" y1="50" x2="62" y2="82" stroke="#7b3fa0" stroke-width="2.5"/>
          <line x1="50" y1="50" x2="36" y2="80" stroke="#7b3fa0" stroke-width="2.5"/>
          <line x1="50" y1="50" x2="20" y2="60" stroke="#c0c0c0" stroke-width="2.5"/>
          <line x1="50" y1="50" x2="26" y2="30" stroke="#7b3fa0" stroke-width="2.5"/>
        </svg>
        <div style="font-size:1.6rem;color:#6c7a8e;line-height:1.6;">Attention score<br>across online sources</div>
      </div>
    </div>
  `;
}

// ===== Tab Switching =====

function switchDetailTab(el, tab) {
  document.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const tabs = { overview: 'detailTabOverview', fingerprint: 'detailTabFingerprint', cite: 'detailTabCite' };
  Object.entries(tabs).forEach(([key, id]) => {
    const elem = document.getElementById(id);
    if (elem) elem.style.display = key === tab ? 'block' : 'none';
  });
}

function switchCiteTab(el, fmt) {
  document.querySelectorAll('.cite-tab-btn').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['apa', 'harvard', 'chicago', 'bibtex', 'ris'].forEach(id => {
    const box = document.getElementById('citeBox' + id.charAt(0).toUpperCase() + id.slice(1));
    if (box) box.style.display = id === fmt ? 'block' : 'none';
  });
}

function copyText(boxId) {
  const box = document.getElementById(boxId);
  const textEl = box.querySelector('.cite-text');
  const text = textEl ? textEl.innerText.trim() : box.innerText.replace(/^Copy\n?/, '').trim();
  navigator.clipboard.writeText(text).then(() => {
    const btn = box.querySelector('.cite-copy-btn');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check" style="margin-right:3px;color:#2c6e2c;"></i> Copied!';
    setTimeout(() => btn.innerHTML = orig, 1800);
  }).catch(() => {
    const range = document.createRange();
    range.selectNodeContents(textEl || box);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
}

// Copy shareable pub link to clipboard
function copyPubLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    const icon = document.getElementById('copyLinkIcon');
    if (icon) {
      icon.className = 'fas fa-check';
      icon.parentElement.style.color = '#2c6e2c';
      setTimeout(() => {
        icon.className = 'fas fa-link';
        icon.parentElement.style.color = '';
      }, 2000);
    }
  }).catch(() => {
    prompt('Copy this link:', url);
  });
}

// ===== Sticky Sidebar Fallback =====
// CSS position:sticky can be broken when any ancestor has overflow:hidden/auto/scroll.
// This JS fallback detects that situation and switches to position:fixed instead.
function initStickySidebar() {
  const sidebar = document.querySelector('.research-sidebar');
  if (!sidebar) return;

  // Test if sticky actually works: after a tiny scroll, check if the sidebar moved
  // A simpler reliable approach: always use the scroll-based fixed fallback
  const twoCol = document.querySelector('.two-columns');
  if (!twoCol) return;

  function onScroll() {
    const colRect  = twoCol.getBoundingClientRect();
    const sidebarH = sidebar.offsetHeight;
    const viewH    = window.innerHeight;

    // Only fix when the two-column layout top is scrolled above viewport top
    if (colRect.top <= 20) {
      // Don't go past the bottom of the two-column container
      const bottomLimit = colRect.bottom - sidebarH;
      if (bottomLimit <= 20) {
        sidebar.classList.remove('is-fixed');
        sidebar.style.position = 'absolute';
        sidebar.style.top = (twoCol.offsetHeight - sidebarH) + 'px';
      } else {
        sidebar.style.position = '';
        sidebar.style.top = '';
        sidebar.classList.add('is-fixed');
      }
    } else {
      sidebar.classList.remove('is-fixed');
      sidebar.style.position = '';
      sidebar.style.top = '';
    }
  }

  // Only activate the JS fallback if CSS sticky is not working
  // We detect this by checking if the sidebar's computed position is actually sticky
  const computed = window.getComputedStyle(sidebar).position;
  if (computed !== 'sticky') {
    // CSS sticky is not supported or blocked — use JS fallback
    twoCol.style.position = 'relative';
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  // If sticky IS working, also listen for scroll to handle max-height overflow scroll
}


document.addEventListener('DOMContentLoaded', () => {
  renderSdgList();
  initYearSlider();
  renderTypeList();
  renderPublicationsWithPagination();
  initEventListeners();
  initStickySidebar();

  // On load: check ?pub=slug in URL and open that publication directly
  const params = new URLSearchParams(window.location.search);
  const pubSlug = params.get('pub');
  if (pubSlug) {
    const idx = findIdxBySlug(pubSlug);
    if (idx !== -1) showDetail(idx);
  }

  // Handle browser back / forward button
  window.addEventListener('popstate', (e) => {
    const st = e.state;
    if (st && st.view === 'detail' && typeof st.idx === 'number') {
      showDetail(st.idx);
    } else {
      showList();
    }
  });
});
