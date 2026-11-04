// build_static.js — run with:  node build_static.js
// Generates crawlable pages for Google Scholar / Google Search from research_data.js
//   research_main/<slug>.html  (one page per publication, with citation_* meta tags)
//   sitemap.xml, robots.txt
//   research.html  (static list injected between the STATIC-LIST markers)
// Put this file next to research.html. Re-run after every change to research_data.js.

const fs = require('fs');
const path = require('path');
const SITE = 'https://kosalnith.github.io';
const AUTHOR_ME = 'Nith, Kosal';
const ROOT = __dirname;
const DATA = path.join(ROOT, 'static/js/research_data.js');   // adjust if yours lives elsewhere

const src = fs.readFileSync(DATA, 'utf8') + '\n;module.exports={publicationsData};';
const m = { exports: {} };
new Function('module', 'exports', 'require', src)(m, m.exports, require);
const pubs = m.exports.publicationsData;

// ---- helpers (same slug rule as research_app.js) ----
const slugOf = t => t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
  .replace(/\s+/g, '-').substring(0, 80).replace(/-+$/, '');
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;');
const abs = u => !u ? '' : /^https?:/.test(u) ? u : `${SITE}/${u.replace(/^\/+/, '')}`;

const MONTHS = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
function parseDate(p) {
  const s = `${p.date || ''} ${p.month || ''}`;
  const y = (s.match(/\b(19|20)\d{2}\b/) || [p.year])[0];
  const mm = s.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/i);
  const d = (p.date || '').match(/\b(\d{1,2})\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
  if (!y) return '';
  if (!mm) return y;
  const mo = String(MONTHS[mm[1].toLowerCase()]).padStart(2, '0');
  return d ? `${y}/${mo}/${String(d[1]).padStart(2, '0')}` : `${y}/${mo}`;
}
// "Samreth & Nith" -> ["Samreth, S", ...] is risky, so keep "Last, First" form
function authorList(str) {
  return String(str || '').split(/\s*(?:,|&|\band\b)\s*/).map(s => s.trim()).filter(Boolean)
    .map(n => { const parts = n.split(/\s+/); return parts.length < 2 ? n : `${parts.slice(1).join(' ')}, ${parts[0]}`; });
}
const pdfOf = p => (p.resources || []).find(r => r.url && /fa-file-pdf/.test(r.icon) && /\.pdf$/i.test(r.url));
const doiOf = p => p.doi || ((p.link || '').match(/doi\.org\/(10\..+)$/) || [])[1] || '';

// Citation tags are written for EVERY publication type (articles, reports, policy briefs, op-eds,
// talks, works in progress). Google Scholar decides what it actually indexes; it mostly takes
// items that also have a full-text PDF on this site (citation_pdf_url below).
function citationMeta(p) {
  const zt = p.zoteroType || p.type;
  const pdf = pdfOf(p);
  const t = [];
  const add = (n, v) => v && t.push(`  <meta name="${n}" content="${esc(v)}">`);
  add('citation_title', p.title);
  authorList(p.authors).forEach(a => add('citation_author', a));
  add('citation_publication_date', parseDate(p));
  // Zotero item type -> Google Scholar (Highwire Press) tag family
  const inst = p.publisher || p.outlet;
  switch (zt) {
    case 'journalArticle':
      add('citation_journal_title', p.outlet);
      const vi = (p.month || '').match(/(\d+)\((\d+)\),?\s*([\d]+)\s*[-–]\s*([\d]+)/);
      if (vi) { add('citation_volume', vi[1]); add('citation_issue', vi[2]); add('citation_firstpage', vi[3]); add('citation_lastpage', vi[4]); }
      add('citation_publisher', p.publisher);
      break;
    case 'newspaperArticle': case 'magazineArticle': case 'blogPost': case 'webpage': case 'encyclopediaArticle':
      add('citation_journal_title', p.outlet);                  // outlet acts as the "journal"
      break;
    case 'bookSection':
      add('citation_inbook_title', p.outlet); add('citation_publisher', p.publisher);
      break;
    case 'book':
      add('citation_book_title', p.outlet || p.title); add('citation_publisher', p.publisher); add('citation_isbn', p.isbn);
      break;
    case 'conferencePaper': case 'presentation':
      add('citation_conference_title', p.outlet);
      break;
    case 'thesis':
      add('citation_dissertation_institution', inst);
      break;
    default:                                                    // report, policy brief, preprint, manuscript, document, progress...
      add('citation_technical_report_institution', inst);
      add('citation_technical_report_number', p.seriesNum || p.reportNumber || p.number);
  }
  add('citation_doi', doiOf(p));
  add('citation_language', p.lang);
  (p.keywords || []).length && add('citation_keywords', p.keywords.join('; '));
  add('citation_abstract_html_url', `${SITE}/research_main/${slugOf(p.title)}.html`);
  if (pdf) add('citation_pdf_url', abs(pdf.url));
  return t.join('\n');
}

function page(p, shell) {
  const slug = slugOf(p.title), url = `${SITE}/research_main/${slug}.html`;
  const desc = (p.abstract || `${p.authors}. ${p.outlet || ''}. ${p.year || ''}`).slice(0, 300);
  const pdf = pdfOf(p), doi = doiOf(p);
  const ld = {
    '@context': 'https://schema.org', '@type': 'ScholarlyArticle', name: p.title, headline: p.title,
    author: String(p.authors).split(/\s*(?:,|&|\band\b)\s*/).filter(Boolean).map(n => ({ '@type': 'Person', name: n })),
    datePublished: (parseDate(p) || '').replace(/\//g, '-'), inLanguage: p.lang || 'en', url,
    ...(p.abstract && { abstract: p.abstract }), ...(p.outlet && { isPartOf: { '@type': 'Periodical', name: p.outlet } }),
    ...(doi && { sameAs: `https://doi.org/${doi}` }), ...(pdf && { encoding: { '@type': 'MediaObject', contentUrl: abs(pdf.url), encodingFormat: 'application/pdf' } }),
    ...(p.keywords && { keywords: p.keywords.join(', ') }),
  };
  const head = `<!-- Page-specific meta (generated by build_static.js) -->
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  ${p.ogImage ? `<meta property="og:image" content="${esc(p.ogImage)}">` : ''}
  <meta name="twitter:title" content="${esc(p.title)}">
${citationMeta(p)}
  <script type="application/ld+json">${JSON.stringify(ld)}</script>`;
  const links = (p.resources || []).filter(r => r.url).map(r => `<li><a href="${esc(r.url)}">${esc(r.label)}</a></li>`).join('');
  const article = `<div class="detail-main" id="detailMain">
          <article>
            <h1>${esc(p.title)}</h1>
            <p><strong>${esc(p.authors)}</strong><br>${esc([p.outlet, p.publisher, p.date || p.year].filter(Boolean).join(' · '))}</p>
            ${p.abstract ? `<h2>Abstract</h2><p>${esc(p.abstract)}</p>` : ''}
            ${(p.keywords || []).length ? `<p>Keywords: ${p.keywords.map(esc).join('; ')}</p>` : ''}
            ${pdf ? `<p><a href="${esc(pdf.url)}">Download full text (PDF)</a></p>` : ''}
            ${doi ? `<p>DOI: <a href="https://doi.org/${esc(doi)}">https://doi.org/${esc(doi)}</a></p>` : ''}
            ${links ? `<ul>${links}</ul>` : ''}
          </article>
        </div>`;
  const swap = (html, re, to, label) => { if (!re.test(html)) throw new Error('research.html template changed: ' + label); return html.replace(re, () => to); };
  let h = shell;
  h = swap(h, /<head>/, `<head>\n  <base href="../">`, '<head>');
  h = swap(h, /<title>[\s\S]*?<\/title>/, `<title>${esc(p.title)} · Kosal Nith</title>`, '<title>');
  h = swap(h, /<!-- Page-specific meta -->[\s\S]*?<meta name="twitter:title"[^>]*>/, head, 'page-specific meta block');
  h = swap(h, /<div id="pubListView">/, '<div id="pubListView" style="display:none">', 'pubListView');
  h = swap(h, /<div class="detail-main" id="detailMain"><\/div>/, article, 'detailMain');
  h = swap(h, /<script src="static\/js\/research_app\.js"><\/script>/,
    `<script>window.STATIC_PUB_SLUG = ${JSON.stringify(slug)};</script>\n  <script src="static/js/research_app.js"></script>`, 'research_app.js tag');
  return h;
}

// ---- write per-paper pages ----
const htmlPath = path.join(ROOT, 'research.html');
const listRe = /<!-- STATIC-LIST-START -->[\s\S]*?<!-- STATIC-LIST-END -->/;
const shell = fs.readFileSync(htmlPath, 'utf8').replace(listRe, '');   // clean template (no static list)
const outDir = path.join(ROOT, 'research_main');
fs.mkdirSync(outDir, { recursive: true });
let withTags = 0;
pubs.forEach(p => {
  fs.writeFileSync(path.join(outDir, slugOf(p.title) + '.html'), page(p, shell));
  if (citationMeta(p)) withTags++;
});

// ---- sitemap + robots ----
const today = new Date().toISOString().slice(0, 10);
const urls = [`${SITE}/`, `${SITE}/research.html`, ...pubs.map(p => `${SITE}/research_main/${slugOf(p.title)}.html`)];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') + `\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

// ---- static list inside research.html (replaced by JS once it runs) ----
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  const list = '<!-- STATIC-LIST-START -->\n<ul class="static-pub-list">\n' + pubs.map(p => {
    const pdf = pdfOf(p);
    return `<li><a href="research_main/${slugOf(p.title)}.html">${esc(p.title)}</a> — ${esc(p.authors)} (${esc(p.year || '')})` +
      `${pdf ? ` · <a href="${esc(pdf.url)}">PDF</a>` : ''}</li>`;
  }).join('\n') + '\n</ul>\n<!-- STATIC-LIST-END -->';
  const re = /<div id="publicationsContainer">[\s\S]*?<\/div>(?=\s*<div id="paginationContainer")/;
  const re2 = /<!-- STATIC-LIST-START -->[\s\S]*?<!-- STATIC-LIST-END -->/;
  if (re2.test(html)) html = html.replace(re2, list);
  else html = html.replace(re, `<div id="publicationsContainer">\n${list}\n</div>`);
  fs.writeFileSync(htmlPath, html);
}
const noPdf = pubs.filter(p => !pdfOf(p));
if (noPdf.length) {
  console.log(`\n${noPdf.length} publication(s) have no PDF yet (add one to research/papers/ and list it under resources with icon "fa-file-pdf", then re-run):`);
  noPdf.forEach(p => console.log(`  - [${p.zoteroType || p.type}] ${p.title.slice(0, 90)}`));
  console.log('');
}
console.log(`Done: ${pubs.length} pages, ${withTags} with Google Scholar citation tags.`);
