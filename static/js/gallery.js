/* ============================================================
   GALLERY — gallery.js
   Categories : research | friends | traveling | trees | food
   Pagination : 30 photos per page
   Lightbox   : keyboard + touch, navigates across pages
   Images     : Unsplash URLs — swap for static/img/file.jpg
   ============================================================ */

(function () {
  'use strict';

  /* ── Photo data ───────────────────────────────────────────
     To use local photos replace the URL string with a path:
       src:   'static/img/photo-large.jpg',
       thumb: 'static/img/photo-thumb.jpg',
  ─────────────────────────────────────────────────────────── */
  const PHOTOS = [

    /* ── Research Activities (10) ─────────────────────────── */
    { id:  1, category: 'research',
      src:   'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=700&q=80',
      title: 'Field Survey', location: 'Phnom Penh, Cambodia', date: '2024',
      desc:  'Data collection in the field — recording vegetation plots along transects at dawn.' },
    { id:  2, category: 'research',
      src:   'https://images.unsplash.com/photo-1532094349884-543559849441?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1532094349884-543559849441?w=700&q=80',
      title: 'Lab Analysis', location: 'University Lab', date: '2023',
      desc:  'Soil samples processed under the microscope after a week in the field.' },
    { id:  3, category: 'research',
      src:   'https://images.unsplash.com/photo-1564325724739-bae0bd08762c?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1564325724739-bae0bd08762c?w=700&q=80',
      title: 'Research Conference', location: 'Bangkok, Thailand', date: '2023',
      desc:  'Presenting findings at the regional biodiversity symposium.' },
    { id:  4, category: 'research',
      src:   'https://images.unsplash.com/photo-1581093458791-9b3d86fe9b87?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1581093458791-9b3d86fe9b87?w=700&q=80',
      title: 'Drone Mapping', location: 'Cardamom Mountains', date: '2024',
      desc:  'UAV survey over the forest canopy — capturing canopy height models.' },
    { id:  5, category: 'research',
      src:   'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=700&q=80',
      title: 'Specimen Collection', location: 'Mondulkiri, Cambodia', date: '2022',
      desc:  'Botanical specimens carefully pressed and labelled for the herbarium.' },
    { id:  6, category: 'research',
      src:   'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=700&q=80',
      title: 'Night Trapping', location: 'Virachey NP', date: '2023',
      desc:  'Camera traps set at dusk — patience rewarded with rare nocturnal species.' },
    { id:  7, category: 'research',
      src:   'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=700&q=80',
      title: 'Water Sampling', location: 'Tonle Sap Lake', date: '2024',
      desc:  'Collecting water quality samples along the lake margin at low season.' },
    { id:  8, category: 'research',
      src:   'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=700&q=80',
      title: 'Community Survey', location: 'Prey Veng Province', date: '2022',
      desc:  'Interviewing farmers about land-use practices for the socio-ecological study.' },
    { id:  9, category: 'research',
      src:   'https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?w=700&q=80',
      title: 'GIS Mapping Session', location: 'Remote Office', date: '2023',
      desc:  'Digitising land-cover boundaries from satellite imagery — hours well spent.' },
    { id: 10, category: 'research',
      src:   'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=700&q=80',
      title: 'Data Visualisation', location: 'Home Office', date: '2024',
      desc:  'Turning months of field data into something a policy maker can read.' },

    /* ── Friends & Colleagues (10) ────────────────────────── */
    { id: 11, category: 'friends',
      src:   'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=80',
      title: 'Team Dinner', location: 'Phnom Penh', date: '2024',
      desc:  'End-of-project celebration — good food, better company.' },
    { id: 12, category: 'friends',
      src:   'https://images.unsplash.com/photo-1543269665-7821e8cba468?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1543269665-7821e8cba468?w=700&q=80',
      title: 'Workshop Break', location: 'Siem Reap', date: '2023',
      desc:  'Coffee and laughter between sessions — the best part of every conference.' },
    { id: 13, category: 'friends',
      src:   'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=700&q=80',
      title: 'Office Colleagues', location: 'NGO Office, Phnom Penh', date: '2023',
      desc:  'The team that makes the work worth doing.' },
    { id: 14, category: 'friends',
      src:   'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=700&q=80',
      title: 'Field Team Photo', location: 'Ratanakiri', date: '2022',
      desc:  'After three weeks in the forest together, these faces feel like family.' },
    { id: 15, category: 'friends',
      src:   'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=700&q=80',
      title: 'Graduation Day', location: 'Phnom Penh', date: '2022',
      desc:  'Years of work, one photograph — surrounded by people who made it possible.' },
    { id: 16, category: 'friends',
      src:   'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=700&q=80',
      title: 'Weekend Picnic', location: 'Kep, Cambodia', date: '2024',
      desc:  'Borrowed a van, packed too much food, zero regrets.' },
    { id: 17, category: 'friends',
      src:   'https://images.unsplash.com/photo-1530099486328-e021101a494a?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1530099486328-e021101a494a?w=700&q=80',
      title: 'Study Group', location: 'University Library', date: '2023',
      desc:  'Exam prep fuelled by instant noodles and shared anxiety.' },
    { id: 18, category: 'friends',
      src:   'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=700&q=80',
      title: 'Mentor Meeting', location: 'Campus Cafe', date: '2024',
      desc:  'An hour with the right person can change the direction of everything.' },
    { id: 19, category: 'friends',
      src:   'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80',
      title: 'Collaborative Workshop', location: 'Singapore', date: '2023',
      desc:  'International partners, shared goals, and a whiteboard full of ideas.' },
    { id: 20, category: 'friends',
      src:   'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=700&q=80',
      title: 'Farewell Party', location: 'Phnom Penh', date: '2022',
      desc:  'Goodbyes are easier when you know the work continues in good hands.' },

    /* ── Traveling by Foot (10) ───────────────────────────── */
    { id: 21, category: 'traveling',
      src:   'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=700&q=80',
      title: 'Morning Trail', location: 'Bokor Mountain', date: '2024',
      desc:  'First light through the mist — every step up worth the view at the top.' },
    { id: 22, category: 'traveling',
      src:   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=80',
      title: 'Ridge Walk', location: 'Cardamom Range', date: '2023',
      desc:  'A narrow path between two valleys — the kind that makes you feel very small.' },
    { id: 23, category: 'traveling',
      src:   'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=700&q=80',
      title: 'Village Road', location: 'Stung Treng Province', date: '2022',
      desc:  'Red dirt roads, banana groves, and children running alongside.' },
    { id: 24, category: 'traveling',
      src:   'https://images.unsplash.com/photo-1434394354979-a235cd36269d?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1434394354979-a235cd36269d?w=700&q=80',
      title: 'Waterfall Path', location: 'Chi Phat, Cambodia', date: '2024',
      desc:  'Three hours through dense undergrowth to reach a waterfall nobody else visits.' },
    { id: 25, category: 'traveling',
      src:   'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=700&q=80',
      title: 'Temple Grounds', location: 'Angkor, Siem Reap', date: '2023',
      desc:  'Walking the outer circuit before the tour groups arrive — stone and silence.' },
    { id: 26, category: 'traveling',
      src:   'https://images.unsplash.com/photo-1499810631641-541e76d678a2?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1499810631641-541e76d678a2?w=700&q=80',
      title: 'Coastal Walk', location: 'Kep, Cambodia', date: '2024',
      desc:  'Crab claws and sea salt — the shoreline path at low tide.' },
    { id: 27, category: 'traveling',
      src:   'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=80',
      title: 'Paddy Field Route', location: 'Kampot Province', date: '2022',
      desc:  'Walking between rice paddies at harvest — golden in every direction.' },
    { id: 28, category: 'traveling',
      src:   'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=700&q=80',
      title: 'Forest Descent', location: 'Mondulkiri', date: '2023',
      desc:  'Downhill through secondary forest after a long plateau survey.' },
    { id: 29, category: 'traveling',
      src:   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80',
      title: 'Cloud Forest', location: 'Vietnam Border', date: '2023',
      desc:  'Above 1,800 m the trees disappear into cloud and the path becomes guesswork.' },
    { id: 30, category: 'traveling',
      src:   'https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=700&q=80',
      title: 'Night Market Walk', location: 'Phnom Penh', date: '2024',
      desc:  'The city on foot after dark — smells you never catch from a tuk-tuk.' },

    /* ── Tree Collections (10) ────────────────────────────── */
    { id: 31, category: 'trees',
      src:   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=80',
      title: 'Ancient Dipterocarp', location: 'Prey Lang Forest', date: '2024',
      desc:  'Dipterocarpus alatus — three people cannot reach around its base.' },
    { id: 32, category: 'trees',
      src:   'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=80',
      title: 'Canopy Layer', location: 'Virachey NP', date: '2023',
      desc:  'Looking straight up into a cathedral of interlocking crowns.' },
    { id: 33, category: 'trees',
      src:   'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=700&q=80',
      title: 'Strangler Fig', location: 'Ta Prohm, Angkor', date: '2022',
      desc:  'Ficus roots finding purchase where mortar once held.' },
    { id: 34, category: 'trees',
      src:   'https://images.unsplash.com/photo-1518021964703-4b2030f03085?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1518021964703-4b2030f03085?w=700&q=80',
      title: 'Bamboo Grove', location: 'Kampot', date: '2024',
      desc:  'A stand of giant bamboo — technically a grass, but let me have this one.' },
    { id: 35, category: 'trees',
      src:   'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=700&q=80',
      title: 'Sugar Palm Avenue', location: 'Battambang Province', date: '2023',
      desc:  "Borassus flabellifer — Cambodia's national tree, silhouetted at dusk." },
    { id: 36, category: 'trees',
      src:   'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=700&q=80',
      title: 'Root System', location: 'Cardamom Mountains', date: '2024',
      desc:  'Buttress roots spreading across the slope — architecture built over centuries.' },
    { id: 37, category: 'trees',
      src:   'https://images.unsplash.com/photo-1542601906897-cd3438a4f7e0?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1542601906897-cd3438a4f7e0?w=700&q=80',
      title: 'Mangrove Stand', location: 'Koh Kong Province', date: '2023',
      desc:  'Rhizophora at high tide — the forest standing in the sea.' },
    { id: 38, category: 'trees',
      src:   'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=700&q=80',
      title: 'Rain Tree Shade', location: 'Phnom Penh', date: '2022',
      desc:  'Samanea saman spreading its crown over an entire street.' },
    { id: 39, category: 'trees',
      src:   'https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1476611338391-6f395a0dd82e?w=700&q=80',
      title: 'Flowering Cassia', location: 'Phnom Penh Riverside', date: '2024',
      desc:  'Cassia fistula in full bloom — a tree that looks impossible in April heat.' },
    { id: 40, category: 'trees',
      src:   'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=700&q=80',
      title: 'Woodland Edge', location: 'Mondulkiri Plateau', date: '2023',
      desc:  'Dry deciduous woodland — sparse, light-drenched, and full of birds.' },

    /* ── Local Foods (10) ─────────────────────────────────── */
    { id: 41, category: 'food',
      src:   'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=700&q=80',
      title: 'Fish Amok', location: 'Siem Reap', date: '2024',
      desc:  "Cambodia's national dish — steamed in banana leaf, coconut and kroeung." },
    { id: 42, category: 'food',
      src:   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80',
      title: 'Morning Market', location: 'Phnom Penh', date: '2023',
      desc:  'Bai sach chrouk stalls open before sunrise — pork and rice for 2,000 riel.' },
    { id: 43, category: 'food',
      src:   'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=700&q=80',
      title: 'Fresh Herbs', location: 'Central Market', date: '2024',
      desc:  'Lemongrass, kaffir lime, galangal — the base of everything good.' },
    { id: 44, category: 'food',
      src:   'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=700&q=80',
      title: 'Num Banh Chok', location: 'Kampot', date: '2023',
      desc:  'Khmer noodles with green fish curry — eaten on a plastic stool at 7 a.m.' },
    { id: 45, category: 'food',
      src:   'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=700&q=80',
      title: 'Tropical Fruit', location: 'Battambang', date: '2022',
      desc:  'Rambutan, mangosteen, dragon fruit — the dry-season abundance.' },
    { id: 46, category: 'food',
      src:   'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=700&q=80',
      title: 'BBQ Night', location: 'Phnom Penh', date: '2024',
      desc:  'Roadside grill — skewered corn, pork, and sweet potato over charcoal.' },
    { id: 47, category: 'food',
      src:   'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=700&q=80',
      title: 'Rice Harvest Meal', location: 'Prey Veng Province', date: '2023',
      desc:  'A communal lunch in the field — freshly cooked rice and preserved fish.' },
    { id: 48, category: 'food',
      src:   'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=700&q=80',
      title: 'Soup Stall', location: 'Night Market, Siem Reap', date: '2023',
      desc:  'A bowl of kuy teav pulled from a pot simmering since midnight.' },
    { id: 49, category: 'food',
      src:   'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&q=80',
      title: 'Palm Sugar Making', location: 'Kampong Speu', date: '2022',
      desc:  'Watching a family render palm sap into blocks of sugar — three-hour process.' },
    { id: 50, category: 'food',
      src:   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=85',
      thumb: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80',
      title: 'Dinner Spread', location: 'Phnom Penh', date: '2024',
      desc:  'A table shared with colleagues after a long field week — the best meal of the year.' },
  ];

  /* ── State ─────────────────────────────────────────────── */
  const PER_PAGE    = 30;
  let activeFilter  = 'all';
  let currentPage   = 1;
  let filteredItems = [];
  let lightboxIndex = 0;

  /* ── DOM refs ──────────────────────────────────────────── */
  const grid       = document.getElementById('gallery-grid');
  const countEl    = document.getElementById('gallery-count-num');
  const countFill  = document.getElementById('gallery-count-fill');
  const countRange = document.getElementById('gallery-count-range');
  const pagination = document.getElementById('gallery-pagination');
  const lightbox   = document.getElementById('gallery-lightbox');
  const lbImg      = document.getElementById('lb-img');
  const lbTag      = document.getElementById('lb-tag');
  const lbTitle    = document.getElementById('lb-title');
  const lbDesc     = document.getElementById('lb-desc');
  const lbLocation = document.getElementById('lb-location');
  const lbDate     = document.getElementById('lb-date');
  const lbIndex    = document.getElementById('lb-index');
  const lbClose    = document.getElementById('lb-close');
  const lbPrev     = document.getElementById('lb-prev');
  const lbNext     = document.getElementById('lb-next');

  /* ── Helpers ───────────────────────────────────────────── */
  const CAT_LABELS = {
    research:  'Research Activities',
    friends:   'Friends & Colleagues',
    traveling: 'Traveling by Foot',
    trees:     'Tree Collections',
    food:      'Local Foods',
  };
  function categoryLabel(cat) { return CAT_LABELS[cat] || cat; }

  /* ── Filter ────────────────────────────────────────────── */
  function applyFilter(filter) {
    activeFilter  = filter;
    currentPage   = 1;
    filteredItems = PHOTOS.filter(p => filter === 'all' || p.category === filter);
    renderGrid();
    renderPagination();
    updateCount();
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  /* ── Grid ──────────────────────────────────────────────── */
  function renderGrid() {
    grid.innerHTML = '';
    const start     = (currentPage - 1) * PER_PAGE;
    const pageSlice = filteredItems.slice(start, start + PER_PAGE);

    if (pageSlice.length === 0) {
      grid.innerHTML = '<p class="gallery-empty">No photos in this category yet.</p>';
      return;
    }

    pageSlice.forEach((photo, localIdx) => {
      const globalIdx = start + localIdx;
      const item = document.createElement('div');
      item.className = 'gallery-item';

      item.innerHTML =
        '<div class="gallery-img-wrap">' +
          '<img src="' + photo.thumb + '" alt="' + photo.title + '" loading="lazy" onerror="this.style.opacity=\'0.3\'">' +
          '<div class="gallery-overlay">' +
            '<div class="overlay-icon"><i class="fa fa-expand"></i></div>' +
            '<div class="overlay-tag">' + categoryLabel(photo.category) + '</div>' +
            '<div class="overlay-title">' + photo.title + '</div>' +
            '<div class="overlay-meta">' + photo.location + ' \u00b7 ' + photo.date + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="item-category-strip">' +
          '<span class="item-index">' + String(globalIdx + 1).padStart(2, '0') + '</span>' +
          '<span class="item-dot"></span>' +
        '</div>';

      item.addEventListener('click', (function(idx) {
        return function() { openLightbox(idx); };
      })(globalIdx));

      grid.appendChild(item);
    });

    scheduleReveal();
    var section = grid.closest('section') || grid;
    window.scrollTo({ top: section.offsetTop - 80, behavior: 'smooth' });
  }

  /* ── Scroll reveal ─────────────────────────────────────── */
  function scheduleReveal() {
    var items = grid.querySelectorAll('.gallery-item');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
      items.forEach(function(item, i) {
        item.style.transitionDelay = Math.min(i * 40, 400) + 'ms';
        io.observe(item);
      });
    } else {
      items.forEach(function(item) { item.classList.add('visible'); });
    }
  }

  /* ── Count ─────────────────────────────────────────────── */
  function updateCount() {
    if (!countEl) return;
    countEl.textContent = filteredItems.length;
    if (countRange) {
      if (filteredItems.length > PER_PAGE) {
        var s = (currentPage - 1) * PER_PAGE + 1;
        var e = Math.min(currentPage * PER_PAGE, filteredItems.length);
        countRange.textContent = ' \u2014 showing ' + s + '\u2013' + e;
      } else {
        countRange.textContent = '';
      }
    }
    if (countFill) {
      countFill.style.width = PHOTOS.length ? (filteredItems.length / PHOTOS.length * 100) + '%' : '100%';
    }
  }

  /* ── Pagination ────────────────────────────────────────── */
  function renderPagination() {
    if (!pagination) return;
    var total = Math.ceil(filteredItems.length / PER_PAGE);
    pagination.innerHTML = '';
    if (total <= 1) return;

    pagination.appendChild(pageBtn('\u2039', currentPage - 1, currentPage === 1, 'page-arrow', 'Previous page'));

    buildPageRange(currentPage, total).forEach(function(p) {
      if (p === '...') {
        var el = document.createElement('span');
        el.className   = 'page-ellipsis';
        el.textContent = '\u2026';
        pagination.appendChild(el);
      } else {
        pagination.appendChild(pageBtn(p, p, false, p === currentPage ? 'active' : '', 'Page ' + p));
      }
    });

    pagination.appendChild(pageBtn('\u203a', currentPage + 1, currentPage === total, 'page-arrow', 'Next page'));
  }

  function buildPageRange(cur, total) {
    if (total <= 7) {
      var r = [];
      for (var i = 1; i <= total; i++) r.push(i);
      return r;
    }
    if (cur <= 4)         return [1, 2, 3, 4, 5, '...', total];
    if (cur >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
    return [1, '...', cur-1, cur, cur+1, '...', total];
  }

  function pageBtn(label, target, disabled, extraClass, ariaLabel) {
    var btn = document.createElement('button');
    btn.className   = ('page-btn ' + extraClass).trim();
    btn.textContent = label;
    btn.disabled    = disabled;
    btn.setAttribute('aria-label', ariaLabel);
    if (!disabled) {
      btn.addEventListener('click', (function(t) {
        return function() {
          currentPage = t;
          renderGrid();
          renderPagination();
          updateCount();
        };
      })(target));
    }
    return btn;
  }

  /* ── Layout toggle ─────────────────────────────────────── */
  document.querySelectorAll('.layout-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.layout-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      grid.className = 'gallery-grid layout-' + btn.dataset.layout;
    });
  });

  /* ── Lightbox ──────────────────────────────────────────── */
  function openLightbox(globalIndex) {
    lightboxIndex = globalIndex;
    renderLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderLightbox() {
    var photo = filteredItems[lightboxIndex];
    if (!photo) return;
    lbImg.style.opacity   = '0';
    lbImg.style.transform = 'scale(0.97)';
    setTimeout(function() {
      lbImg.src   = photo.src;
      lbImg.alt   = photo.title;
      lbImg.onload = function() {
        lbImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        lbImg.style.opacity    = '1';
        lbImg.style.transform  = 'scale(1)';
      };
    }, 120);
    lbTag.textContent      = categoryLabel(photo.category);
    lbTitle.textContent    = photo.title;
    lbDesc.textContent     = photo.desc;
    lbLocation.textContent = photo.location;
    lbDate.textContent     = photo.date;
    lbIndex.textContent    = (lightboxIndex + 1) + ' / ' + filteredItems.length;
  }

  function syncPageToLightbox() {
    var needed = Math.floor(lightboxIndex / PER_PAGE) + 1;
    if (needed !== currentPage) {
      currentPage = needed;
      renderGrid();
      renderPagination();
      updateCount();
    }
  }

  lbClose.addEventListener('click', closeLightbox);
  document.getElementById('lb-backdrop').addEventListener('click', closeLightbox);

  lbPrev.addEventListener('click', function() {
    lightboxIndex = (lightboxIndex - 1 + filteredItems.length) % filteredItems.length;
    syncPageToLightbox(); renderLightbox();
  });
  lbNext.addEventListener('click', function() {
    lightboxIndex = (lightboxIndex + 1) % filteredItems.length;
    syncPageToLightbox(); renderLightbox();
  });

  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     { closeLightbox(); return; }
    if (e.key === 'ArrowLeft')  { lightboxIndex = (lightboxIndex - 1 + filteredItems.length) % filteredItems.length; syncPageToLightbox(); renderLightbox(); }
    if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % filteredItems.length; syncPageToLightbox(); renderLightbox(); }
  });

  var touchStartX = 0;
  lightbox.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return;
    lightboxIndex = dx < 0
      ? (lightboxIndex + 1) % filteredItems.length
      : (lightboxIndex - 1 + filteredItems.length) % filteredItems.length;
    syncPageToLightbox(); renderLightbox();
  });

  /* ── Init ──────────────────────────────────────────────── */
  applyFilter('all');

})();
