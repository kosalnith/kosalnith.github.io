// ===== Constants & State =====
const ITEMS_PER_PAGE = 50;
const YEAR_MIN_BOUND = 2018;
const YEAR_MAX_BOUND = 2026;

let currentPage = 1;
let currentSearchTerm = '';
let yearRangeMin = YEAR_MIN_BOUND;
let yearRangeMax = YEAR_MAX_BOUND;
let currentDetailIdx = -1;

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

  let filtered = publicationsData.filter(p => {
    if (types.length && !types.includes(p.type)) return false;
    const yearNum = parseInt(p.year);
    if (!isNaN(yearNum) && (yearNum < yearRangeMin || yearNum > yearRangeMax)) return false;
    if (oaOnly && !p.oa) return false;
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

// ===== Rendering: Publications List =====

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
  const yearOrder = ['2026','2025','2024','2023','2022','2021','2020','2019','2018','progress'];

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
            <div class="pub-meta"><strong>${pub.authors}</strong>, ${pub.date || ''}, ${pub.outlet || ''}</div>
            <div class="pub-breadcrumb">${pub.breadcrumb || 'Research output'}</div>
            <div class="badge-row">
              ${pub.oa ? '<span class="oa-badge"><i class="fas fa-lock-open"></i> Open Access</span>' : ''}
              ${pub.forthcoming ? '<span class="forthcoming">Forthcoming</span>' : ''}
              ${pub.underReview ? '<span class="under-review">Under Review</span>' : ''}
              ${pub.award ? '<span class="award-badge"><i class="fas fa-trophy"></i> Award Winner</span>' : ''}
            </div>
            <div class="pub-links">
              ${pub.abstract ? `<button class="link-btn abstract-toggle">📄 Abstract</button>` : ''}
              ${pub.link ? `<a class="link-btn" href="${pub.link}" target="_blank">🔗 Open</a>` : ''}
            </div>
            <div class="abstract-text">${pub.abstract || ''}</div>
            <div class="keywords">
              ${pub.keywords ? pub.keywords.map((k, idx) =>
                `<span class="keyword"><span class="kw-dot ${pub.kwStrength[idx]}"></span> ${k}</span>`
              ).join('') : ''}
            </div>
          </div>
          <div class="right-stats">
            <div class="altmetric-donut">
              <svg viewBox="0 0 100 100" width="48" height="48">
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

  document.querySelectorAll('.abstract-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const absDiv = btn.closest('.pub-details').querySelector('.abstract-text');
      absDiv.classList.toggle('open');
      btn.innerText = absDiv.classList.contains('open') ? 'Hide Abstract' : '📄 Abstract';
    });
  });

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
  document.getElementById('yearMinDisplay').textContent = minVal;
  document.getElementById('yearMaxDisplay').textContent = maxVal;
  const pctMin = (minVal - YEAR_MIN_BOUND) / (YEAR_MAX_BOUND - YEAR_MIN_BOUND) * 100;
  const pctMax = (maxVal - YEAR_MIN_BOUND) / (YEAR_MAX_BOUND - YEAR_MIN_BOUND) * 100;
  document.getElementById('yearRangeFill').style.left = pctMin + '%';
  document.getElementById('yearRangeFill').style.width = (pctMax - pctMin) + '%';
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
  document.getElementById('searchInput').addEventListener('input', (e) => {
    currentSearchTerm = e.target.value;
    currentPage = 1;
    renderPublicationsWithPagination();
  });

  document.getElementById('fullTypeList').addEventListener('change', updateFiltersAndResetPage);
  document.getElementById('oaFilterCheckbox').addEventListener('change', updateFiltersAndResetPage);

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

  // Publication list click — navigate to detail
  document.getElementById('publicationsContainer').addEventListener('click', (e) => {
    const link = e.target.closest('.pub-detail-link');
    if (link) {
      e.preventDefault();
      const idx = parseInt(link.getAttribute('data-pub-idx'));
      showDetail(idx);
    }
  });
}

// ===== Detail Page =====

function showList() {
  document.getElementById('pubDetailView').style.display = 'none';
  document.getElementById('pubListView').style.display = 'block';
  window.scrollTo(0, 0);
  document.title = 'Kosal Nith · Research output';
  history.pushState({}, '', window.location.pathname);
}

function showDetail(idx) {
  const pub = publicationsData[idx];
  currentDetailIdx = idx;
  document.getElementById('pubListView').style.display = 'none';
  document.getElementById('pubDetailView').style.display = 'block';
  window.scrollTo(0, 0);
  document.title = pub.title + ' · Kosal Nith';

  // Prev / Next nav
  const prevPub = publicationsData[idx - 1];
  const nextPub = publicationsData[idx + 1];
  document.getElementById('detailNavRow').innerHTML = `
    <button class="detail-nav-btn ${!prevPub ? 'disabled' : ''}" onclick="${prevPub ? `showDetail(${idx - 1})` : ''}">
      <i class="fas fa-chevron-left"></i>
      <span>
        <span class="nav-label">Previous</span>
        ${prevPub ? prevPub.title.substring(0, 55) + (prevPub.title.length > 55 ? '…' : '') : '—'}
      </span>
    </button>
    <button class="detail-back-btn" onclick="showList()" style="margin:0;">
      <i class="fas fa-th-list"></i> All publications
    </button>
    <button class="detail-nav-btn ${!nextPub ? 'disabled' : ''}" onclick="${nextPub ? `showDetail(${idx + 1})` : ''}" style="flex-direction:row-reverse;text-align:right;">
      <i class="fas fa-chevron-right"></i>
      <span>
        <span class="nav-label">Next</span>
        ${nextPub ? nextPub.title.substring(0, 55) + (nextPub.title.length > 55 ? '…' : '') : '—'}
      </span>
    </button>
  `;

  // Breadcrumb
  const typeLabel = pub.breadcrumb || 'Research output';
  document.getElementById('detailBreadcrumb').innerHTML =
    `<a href="#" onclick="showList();return false;"><i class="fas fa-home" style="font-size:0.75rem;margin-right:3px;"></i> Research output</a>
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
  const apa = `${pub.authors} (${yearStr}). ${pub.title}. <em>${pub.outlet || ''}</em>.${pub.link ? ` <a href="${pub.link}" target="_blank">${pub.link}</a>` : ''}`;
  const harvard = `${pub.authors.split(',')[0]} et al. (${yearStr}) '${pub.title}', <em>${pub.outlet || ''}</em>.`;
  const bibtex = `@article{nith${yearStr},
  title   = {${pub.title}},
  author  = {${pub.authors}},
  year    = {${yearStr}},
  journal = {${pub.outlet || ''}},${pub.link ? `\n  url     = {${pub.link}},` : ''}
  keywords = {${(pub.keywords || []).join(', ')}}
}`;
  const ris = `TY  - JOUR
T1  - ${pub.title}
AU  - ${pub.authors}
PY  - ${yearStr}
JO  - ${pub.outlet || ''}
${pub.link ? `UR  - ${pub.link}\n` : ''}KW  - ${(pub.keywords || []).join('\nKW  - ')}
ER  -`;

  // Related publications
  const related = publicationsData
    .filter((p, i) => i !== idx && (p.type === pub.type || (pub.keywords && p.keywords && pub.keywords.some(k => p.keywords.includes(k)))))
    .slice(0, 4);

  // Build main content
  document.getElementById('detailMain').innerHTML = `
    <div class="detail-type-tag">${typeLabel}</div>
    <h1 class="detail-title">${pub.title}</h1>
    <div class="detail-authors">${pub.authors}</div>
    <div class="detail-affil">
      <i class="fas fa-university" style="color:#9aaebf;margin-right:6px;font-size:0.8rem;"></i>
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
      <div style="padding:1.2rem;background:#f9fbfd;border-radius:10px;color:#6c7a8e;font-size:0.88rem;margin-bottom:1.5rem;border:1px solid #e8edf5;">
        <i class="fas fa-info-circle" style="margin-right:6px;"></i>No abstract available for this publication.
      </div>`}

      <div class="detail-section-title">Publication details</div>
      <table class="detail-meta-table">
        <tr><td>Authors</td><td>${pub.authors}</td></tr>
        <tr><td>Year</td><td>${yearStr !== 'n.d.' ? yearStr : '<em style="color:#6c7a8e;">Work in progress</em>'}</td></tr>
        <tr><td>Date</td><td>${pub.date || '—'}</td></tr>
        <tr><td>Outlet / Journal</td><td>${pub.outlet || '—'}</td></tr>
        <tr><td>Publication type</td><td>${typeLabel}</td></tr>
        <tr><td>Language</td><td>English</td></tr>
        <tr><td>Open Access</td><td>${pub.oa ? '<span class="detail-badge-oa" style="margin:0;"><i class="fas fa-lock-open"></i> Open Access</span>' : '<span style="color:#6c7a8e;">Restricted</span>'}</td></tr>
        ${pub.forthcoming ? `<tr><td>Status</td><td><span class="forthcoming">Forthcoming</span></td></tr>` : ''}
        ${pub.underReview ? `<tr><td>Status</td><td><span class="under-review">Under Review</span></td></tr>` : ''}
        ${pub.link ? `<tr><td>External link</td><td><a href="${pub.link}" target="_blank">${pub.link} <i class="fas fa-external-link-alt" style="font-size:0.7rem;"></i></a></td></tr>` : ''}
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
      <p style="font-size:0.88rem;color:#4b5e77;margin-bottom:1.5rem;line-height:1.6;">
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
          <div style="font-size:0.72rem;color:#9aaebf;margin-top:3px;">${fp.cat}</div>
        </div>`).join('')}` : `
      <p style="color:#6c7a8e;font-size:0.88rem;padding:1rem 0;">No fingerprint data available for this publication.</p>`}
    </div>

    <!-- Cite tab -->
    <div id="detailTabCite" style="display:none;">
      <div class="detail-section-title">Cite this publication</div>
      <div class="detail-cite-tabs">
        <div class="detail-cite-tab active" onclick="switchCiteTab(this,'apa')">APA</div>
        <div class="detail-cite-tab" onclick="switchCiteTab(this,'harvard')">Harvard</div>
        <div class="detail-cite-tab" onclick="switchCiteTab(this,'bibtex')">BibTeX</div>
        <div class="detail-cite-tab" onclick="switchCiteTab(this,'ris')">RIS</div>
      </div>
      <div class="detail-cite-box" id="citeBoxApa">
        <button class="detail-copy-btn" onclick="copyText('citeBoxApa')"><i class="fas fa-copy" style="margin-right:3px;"></i>Copy</button>
        ${apa}
      </div>
      <div class="detail-cite-box" id="citeBoxHarvard" style="display:none;">
        <button class="detail-copy-btn" onclick="copyText('citeBoxHarvard')"><i class="fas fa-copy" style="margin-right:3px;"></i>Copy</button>
        ${harvard}
      </div>
      <div class="detail-cite-box" id="citeBoxBibtex" style="display:none;font-family:monospace;font-size:0.8rem;">
        <button class="detail-copy-btn" onclick="copyText('citeBoxBibtex')"><i class="fas fa-copy" style="margin-right:3px;"></i>Copy</button>
        ${bibtex}
      </div>
      <div class="detail-cite-box" id="citeBoxRis" style="display:none;font-family:monospace;font-size:0.8rem;">
        <button class="detail-copy-btn" onclick="copyText('citeBoxRis')"><i class="fas fa-copy" style="margin-right:3px;"></i>Copy</button>
        ${ris}
      </div>
      <div style="margin-top:1rem;display:flex;gap:8px;flex-wrap:wrap;">
        <a class="detail-export-btn" href="data:text/plain;charset=utf-8,${encodeURIComponent(ris)}" download="citation_nith.ris">
          <i class="fas fa-download"></i> Export RIS
        </a>
        <a class="detail-export-btn" href="data:text/plain;charset=utf-8,${encodeURIComponent(bibtex)}" download="citation_nith.bib">
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
      <div class="detail-card-title"><i class="fas fa-folder-open" style="margin-right:5px;color:#1f4a7c;"></i>Access to Publication</div>
      ${pub.oa ? '<div class="detail-badge-oa"><i class="fas fa-lock-open"></i> Open Access</div>' : ''}
      ${pub.link ? `<a class="detail-access-link" href="${pub.link}" target="_blank">
        <span class="access-icon"><i class="fas fa-external-link-alt" style="color:#1f4a7c;font-size:0.9rem;"></i></span>
        <span>Open full text<span class="detail-access-sub">${pub.outlet || 'External link'}</span></span>
      </a>` : ''}
    </div>` : ''}

    ${pub.downloads ? `
    <div class="detail-card">
      <div class="detail-card-title"><i class="fas fa-chart-bar" style="margin-right:5px;color:#1f4a7c;"></i>Usage statistics</div>
      <div class="detail-stat-row">
        <div class="detail-stat-num">${pub.downloads}</div>
        <div style="line-height:1.3;"><strong>Downloads</strong><br><span style="font-size:0.75rem;color:#6c7a8e;">Full-text downloads</span></div>
      </div>
    </div>` : ''}

    <div class="detail-card">
      <div class="detail-card-title"><i class="fas fa-user-circle" style="margin-right:5px;color:#1f4a7c;"></i>Author profile</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#1f4a7c,#4a7fb5);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:1rem;flex-shrink:0;">K</div>
        <div>
          <div style="font-size:0.9rem;font-weight:700;color:#0f2b4d;">Kosal Nith</div>
          <div style="font-size:0.75rem;color:#6c7a8e;">Economist & Researcher</div>
        </div>
      </div>
      <div style="font-size:0.8rem;color:#4b5e77;line-height:1.6;margin-bottom:10px;">
        <i class="fas fa-map-marker-alt" style="color:#9aaebf;margin-right:4px;font-size:0.75rem;"></i>
        Cambodia Development Resource Institute<br>
        <span style="margin-left:14px;">Phnom Penh, Cambodia</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <a href="https://scholar.google.com/citations?user=LG2mrO4AAAAJ" target="_blank" class="detail-share-btn">
          <i class="fas fa-graduation-cap" style="color:#4285F4;"></i> Google Scholar
        </a>
        <a href="https://orcid.org/0000-0002-6976-4733" target="_blank" class="detail-share-btn">
          <i class="fas fa-id-badge" style="color:#A6CE39;"></i> ORCID
        </a>
        <a href="https://ideas.repec.org/f/pni504.html" target="_blank" class="detail-share-btn">
          <i class="fas fa-chart-line" style="color:#1f4a7c;"></i> IDEAS/RePec
        </a>
      </div>
    </div>

    <div class="detail-card">
      <div class="detail-card-title"><i class="fas fa-share-alt" style="margin-right:5px;color:#1f4a7c;"></i>Share</div>
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
      <div style="display:flex;align-items:center;gap:12px;padding:4px 0 8px;">
        <svg viewBox="0 0 100 100" width="54" height="54" style="flex-shrink:0;">
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
        <div>
          <div style="font-size:0.78rem;color:#6c7a8e;line-height:1.5;">Attention score<br>across online sources</div>
        </div>
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
  document.querySelectorAll('.detail-cite-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['apa', 'harvard', 'bibtex', 'ris'].forEach(id => {
    const box = document.getElementById('citeBox' + id.charAt(0).toUpperCase() + id.slice(1));
    if (box) box.style.display = id === fmt ? 'block' : 'none';
  });
}

function copyText(boxId) {
  const box = document.getElementById(boxId);
  const text = box.innerText.replace(/^[\s\S]*?Copy\n?/, '').trim();
  navigator.clipboard.writeText(text).then(() => {
    const btn = box.querySelector('.detail-copy-btn');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check" style="margin-right:3px;color:#2c6e2c;"></i>Copied!';
    setTimeout(() => btn.innerHTML = orig, 1800);
  }).catch(() => {
    const range = document.createRange();
    range.selectNodeContents(box);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  renderSdgList();
  initYearSlider();
  renderTypeList();
  renderPublicationsWithPagination();
  initEventListeners();
});
