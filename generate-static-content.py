"""
generate-static-content.py
────────────────────────────────────────────────────────────────────────────────
Regenerates static/js/static-content.js from all static HTML pages.

Usage:  python3 generate-static-content.py

Pages are read from static/js/search-registry.js automatically.
To add a new page: add it to search-registry.js pages[] list, then run this script.
────────────────────────────────────────────────────────────────────────────────
"""
from html.parser import HTMLParser
import re, json, os

SKIP_TAGS = {'script', 'style', 'noscript', 'head'}
SKIP_TEXT = {'Main content start'}

# ═══════════════════════════════════════════════════════════════════════════════
#  PART 1 — static-content.js
# ═══════════════════════════════════════════════════════════════════════════════

def read_registry(registry_path='static/js/search-registry.js'):
    if not os.path.exists(registry_path):
        print(f'  WARNING: {registry_path} not found — using built-in page list')
        return None
    with open(registry_path, encoding='utf-8') as f:
        content = f.read()
    pages = []
    for m in re.finditer(r'\{\s*url:\s*[\'"]([^\'"]+)[\'"],\s*label:\s*[\'"]([^\'"]+)[\'"]', content):
        url, label = m.group(1), m.group(2)
        # Skip data-driven pages — their content comes from JS data files, not HTML
        if url in ('research.html', 'activity.html', 'updates.html', 'travelmap.html'):
            continue
        pages.append((url, label, url))
    return pages if pages else None

PAGES_FALLBACK = [
    ('index.html',         'Home',          'index.html'),
    ('teaching.html',      'Teaching',      'teaching.html'),
    ('miscellaneous.html', 'Miscellaneous', 'miscellaneous.html'),
    ('press.html',         'Press',         'press.html'),
    ('work.html',          'Work',          'work.html'),
    ('personal.html',      'Personal',      'personal.html'),
    ('foot.html',          'Foot',          'foot.html'),
    ('food.html',          'Food',          'food.html'),
    ('trees.html',         'Trees',         'trees.html'),
    ('friends.html',       'Friends',       'friends.html'),
    ('bio.html',           'Bio',           'bio.html'),
    ('cv.html',            'CV',            'cv.html'),
    ('contact.html',       'Contact',       'contact.html'),
    ('events.html',        'Events',        'events.html'),
    ('pastevents.html',    'Past Events',   'pastevents.html'),
    ('explore.html',       'Explore',       'explore.html'),
]

MANUAL_BLOBS = {
    'Food':    'Local Foods local food culinary journey fresh ingredients nearby farms producers.',
    'Trees':   'Tree Collections tree images mountain areas rainforests rural urban areas.',
    'Friends': 'Friends and Colleagues best friends brilliant colleagues research personal life.',
}

class PageParser(HTMLParser):
    def __init__(self, label, url):
        super().__init__()
        self.label = label; self.url = url
        self.sections = []
        self._cur = None
        self._skip_depth = 0; self._nav_depth = 0
        self._buf = ''; self._in_heading = False
        self._img_alts = []

    def _new_section(self, heading):
        self._cur = {'heading': heading, 'texts': []}
        self.sections.append(self._cur)

    def handle_starttag(self, tag, attrs):
        cls = dict(attrs).get('class', '')
        if tag in SKIP_TAGS: self._skip_depth += 1
        if tag in ('nav', 'header', 'footer') or any(x in cls for x in
           ['masthead', 'site-header', 'site-footer', 'su-global-footer',
            'su-local-footer', 'su-main-nav']):
            self._nav_depth += 1
        if tag == 'img':
            alt = dict(attrs).get('alt', '').strip()
            if alt and len(alt) > 3: self._img_alts.append(alt)
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5'):
            self._in_heading = True; self._buf = ''

    def handle_endtag(self, tag):
        if tag in SKIP_TAGS: self._skip_depth = max(0, self._skip_depth - 1)
        if tag in ('nav', 'header', 'footer'): self._nav_depth = max(0, self._nav_depth - 1)
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5') and self._in_heading:
            text = re.sub(r'\s+', ' ', self._buf).strip()
            if text and len(text) > 2 and text not in SKIP_TEXT:
                self._new_section(text)
            self._in_heading = False; self._buf = ''

    def handle_data(self, data):
        if self._skip_depth > 0 or self._nav_depth > 0: return
        if self._in_heading: self._buf += data; return
        text = re.sub(r'\s+', ' ', data).strip()
        if text and len(text) > 8 and text not in SKIP_TEXT:
            if self._cur is None: self._new_section(self.label)
            self._cur['texts'].append(text)

    def to_records(self):
        seen_headings = set()
        records = []
        alts = ' '.join(set(
            a for a in self._img_alts
            if a and len(a) >= 4 and not re.match(r'^[a-z0-9_\-\.]+$', a)
        ))
        all_text = ' '.join(
            s['heading'] + ' ' + ' '.join(s['texts']) for s in self.sections
        ).strip()
        if alts: all_text = (all_text + ' ' + alts).strip()
        if all_text:
            records.append({'url': self.url, 'pageLabel': self.label,
                             'heading': self.label, 'text': all_text,
                             'isHeading': False, 'category': 'page'})
            seen_headings.add(self.label)
        for s in self.sections:
            h = s['heading']
            blob = (h + ' ' + ' '.join(s['texts'])).strip()
            k = h[:80]
            if k in seen_headings or len(blob) < 4: continue
            seen_headings.add(k)
            records.append({'url': self.url, 'pageLabel': self.label,
                             'heading': h, 'text': blob,
                             'isHeading': True, 'category': 'page'})
        return records

def build_static_content():
    print('── Part 1: static-content.js ──────────────────────────────────────')
    pages = read_registry() or PAGES_FALLBACK
    print(f'Indexing {len(pages)} pages...')
    all_records = []
    for (html_file, label, url) in pages:
        if not os.path.exists(html_file):
            print(f'  SKIP (not found): {html_file}'); continue
        with open(html_file, encoding='utf-8') as f:
            html = f.read()
        parser = PageParser(label, url); parser.feed(html)
        records = parser.to_records()
        if label in MANUAL_BLOBS:
            appended = False
            for r in records:
                if r['heading'] == label:
                    r['text'] = (r['text'] + ' ' + MANUAL_BLOBS[label]).strip()
                    appended = True; break
            if not appended:
                records.insert(0, {'url': url, 'pageLabel': label, 'heading': label,
                                    'text': MANUAL_BLOBS[label], 'isHeading': False, 'category': 'page'})
        all_records.extend(records)
        print(f'  {label}: {len(records)} entries')

    seen = set(); deduped = []
    for r in all_records:
        k = r['url'] + '|' + r['heading'][:80]
        if k not in seen: seen.add(k); deduped.append(r)

    out_path = os.path.join('static', 'js', 'static-content.js')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    output = ('// static-content.js — pre-built search index for static HTML pages\n'
              '// Auto-generated — do not edit manually.\n'
              '// Regenerate: python3 generate-static-content.py\n'
              'const staticPageContent = ' + json.dumps(deduped, ensure_ascii=False) + ';\n')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(output)
    print(f'  → {out_path}  ({len(deduped)} entries, {len(output.encode())/1024:.1f} KB)\n')

# ══════════════════════════════════════════════════════════════════════════════
print('generate-static-content.py\n')
build_static_content()
print('Done.')
