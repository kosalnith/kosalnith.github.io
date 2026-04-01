(function () { /* IIFE — nothing leaks to window except what we explicitly expose */

/* ── DATA ────────────────────────────────────────────────────── */
/* imgs[] values are the photo filenames (without .jpg extension)
   served from static/img/explore/<filename>.jpg
   Countries with more than one pink pin have locations that are
   regions / areas, not cities — the label is set dynamically below. */
const tmCountries = [
  { name:"Austria", lat:47.8, lng:13.0, flag:"🇦🇹", desc:"Alpine majesty, classical music, imperial palaces, and charming villages.",
    cities:[
      {name:"Vienna",    lat:48.2082, lng:16.3738, desc:"Imperial capital of art, music, and coffeehouse culture.", imgs:["Ethiopia25","vienna_2","vienna_3","vienna_4"]},
      {name:"Salzburg",  lat:47.8095, lng:13.0550, desc:"Birthplace of Mozart, baroque architecture and Alpine setting.", imgs:["salzburg_1","salzburg_2","salzburg_3","salzburg_4"]},
      {name:"Innsbruck", lat:47.2682, lng:11.3923, desc:"Mountain city nestled in the Alps, gateway to ski resorts.", imgs:["innsbruck_1","innsbruck_2","innsbruck_3","innsbruck_4"]},
    ]},
  { name:"Cambodia", lat:12.0, lng:104.5, flag:"🇰🇭", desc:"Home to Angkor Wat, ancient temples, and lush landscapes of Khmer heritage.",
    cities:[
      {name:"Siem Reap",  lat:13.3671, lng:103.8448, desc:"Gateway to the majestic Angkor temple complex.", imgs:["siem_reap_1","siem_reap_2","siem_reap_3","siem_reap_4"]},
      {name:"Phnom Penh", lat:11.5564, lng:104.9282, desc:"Vibrant capital on the Mekong with rich royal heritage.", imgs:["phnom_penh_1","phnom_penh_2","phnom_penh_3","phnom_penh_4"]},
      {name:"Kampot",     lat:10.6112, lng:104.1806, desc:"Riverside town famed for pepper plantations and French villas.", imgs:["kampot_1","kampot_2","kampot_3","kampot_4"]},
      {name:"Koh Rong",   lat:10.7226, lng:103.2440, desc:"Tropical island known for white beaches and clear waters.", imgs:["koh_rong_1","koh_rong_2","koh_rong_3","koh_rong_4"]},
      {name:"Phnom Preah",   lat:12.1738, lng:102.9069, desc:"Forested mountain rising above plains, offering peaceful nature and scenic views.", imgs:["PhnomPreah202301","PhnomPreah","WaterFell2021","koh_rong_4"]},
    ]},
  { name:"China", lat:35.0, lng:105.0, flag:"🇨🇳", desc:"Ancient wonders, futuristic cities, and the Great Wall stretching to the horizon.",
    cities:[
      {name:"Beijing",  lat:39.9042, lng:116.4074, desc:"Imperial capital, home to the Forbidden City and Great Wall.", imgs:["beijing_1","beijing_2","beijing_3","beijing_4"]},
      {name:"Shanghai", lat:31.2304, lng:121.4737, desc:"Futuristic skyline meets colonial Bund architecture.", imgs:["shanghai_1","shanghai_2","shanghai_3","shanghai_4"]},
      {name:"Xi'an",    lat:34.3416, lng:108.9398, desc:"Ancient capital, home of the Terracotta Army.", imgs:["xian_1","xian_2","xian_3","xian_4"]},
    ]},
  { name:"Denmark", lat:56.0, lng:10.0, flag:"🇩🇰", desc:"Hygge lifestyle, Viking history, and modern Scandinavian design.",
    cities:[
      {name:"Copenhagen", lat:55.6761, lng:12.5683, desc:"Colorful Nyhavn, cycling culture, and world-class cuisine.", imgs:["copenhagen_1","copenhagen_2","copenhagen_3","copenhagen_4"]},
      {name:"Aarhus",     lat:56.1629, lng:10.2039, desc:"Denmark's second city, vibrant arts scene and Latin Quarter.", imgs:["aarhus_1","aarhus_2","aarhus_3","aarhus_4"]},
    ]},
  { name:"Ethiopia", lat:9.5, lng:39.5, flag:"🇪🇹", desc:"Ancient rock churches, coffee origins, and breathtaking highland landscapes.",
    cities:[
      {name:"Addis Ababa", lat:9.0320, lng:38.7469, desc:"Africa's diplomatic capital, high-altitude city with rich culture.", imgs:["addis_ababa_1","addis_ababa_2","addis_ababa_3","addis_ababa_4"]},
    ]},
  { name:"Fiji", lat:-17.5, lng:178.0, flag:"🇫🇯", desc:"Coral reefs, turquoise waters, and the warm tropical Bula spirit.",
    cities:[
      {name:"Suva", lat:-18.1416, lng:178.4419, desc:"Capital city on the Pacific, vibrant market and cultural hub.", imgs:["suva_1","suva_2","suva_3","suva_4"]},
      {name:"Nadi", lat:-17.7765, lng:177.4356, desc:"Gateway city with lush gardens and Mamanuca Islands access.", imgs:["nadi_1","nadi_2","nadi_3","nadi_4"]},
    ]},
  { name:"Finland", lat:62.0, lng:25.0, flag:"🇫🇮", desc:"A thousand lakes, Nordic saunas, and the magical Northern Lights.",
    cities:[
      {name:"Helsinki", lat:60.1699, lng:24.9384, desc:"Design capital on the Baltic, cathedral squares and saunas.", imgs:["helsinki_1","helsinki_2","helsinki_3","helsinki_4"]},
    ]},
  { name:"France", lat:46.5, lng:2.5, flag:"🇫🇷", desc:"Art, romance, cuisine, and iconic landmarks from coast to countryside.",
    cities:[
      {name:"Paris", lat:48.8566, lng:2.3522, desc:"City of Light — Eiffel Tower, Louvre, and café terraces.", imgs:["paris_1","paris_2","paris_3","paris_4"]},
    ]},
  { name:"Germany", lat:51.0, lng:10.0, flag:"🇩🇪", desc:"Castles, beer gardens, fairy-tale forests, and cutting-edge innovation.",
    cities:[
      {name:"Berlin",  lat:52.5200, lng:13.4050, desc:"Reunified capital, cutting-edge art and tumultuous history.", imgs:["berlin_1","berlin_2","berlin_3","berlin_4"]},
      {name:"Munich",  lat:48.1351, lng:11.5820, desc:"Beer gardens, Oktoberfest, and Baroque Marienplatz.", imgs:["munich_1","munich_2","munich_3","munich_4"]},
      {name:"Hamburg", lat:53.5753, lng:10.0153, desc:"Great port city, Speicherstadt warehouse district.", imgs:["hamburg_1","hamburg_2","hamburg_3","hamburg_4"]},
    ]},
  { name:"Indonesia", lat:-3.0, lng:117.0, flag:"🇮🇩", desc:"Thousands of islands, volcanoes, rainforests, and vibrant cultures.",
    cities:[
      {name:"Jakarta", lat:-6.2088, lng:106.8456, desc:"Sprawling megacity, melting pot of cultures and cuisines.", imgs:["jakarta_1","jakarta_2","jakarta_3","jakarta_4"]},
    ]},
  { name:"Laos", lat:18.5, lng:103.0, flag:"🇱🇦", desc:"Serene mountains, Buddhist monasteries, and the mighty Mekong River.",
    cities:[
      {name:"Luang Prabang", lat:19.8845, lng:102.1347, desc:"UNESCO World Heritage town, golden temples on the Mekong.", imgs:["luang_prabang_1","luang_prabang_2","luang_prabang_3","luang_prabang_4"]},
      {name:"Vang Vieng",    lat:18.9222, lng:102.4417, desc:"Dramatic karst scenery, rivers and outdoor adventure.", imgs:["vang_vieng_1","vang_vieng_2","vang_vieng_3","vang_vieng_4"]},
    ]},
  { name:"Malaysia", lat:4.0, lng:109.0, flag:"🇲🇾", desc:"Rainforests, skyscrapers, diverse cultures, and incredible culinary fusion.",
    cities:[
      {name:"Kuala Lumpur", lat:3.1390, lng:101.6869, desc:"Petronas Towers, street food haven and multicultural city.", imgs:["kuala_lumpur_1","kuala_lumpur_2","kuala_lumpur_3","kuala_lumpur_4"]},
    ]},
  { name:"Netherlands", lat:52.5, lng:5.0, flag:"🇳🇱", desc:"Windmills, tulip fields, golden age canals, and vibrant cycling culture.",
    cities:[
      {name:"Amsterdam", lat:52.3702, lng:4.8952, desc:"Canal rings, Rijksmuseum, Anne Frank House and bike lanes.", imgs:["amsterdam_1","amsterdam_2","amsterdam_3","amsterdam_4"]},
    ]},
  { name:"Philippines", lat:12.5, lng:122.5, flag:"🇵🇭", desc:"Over 7,000 islands, pristine beaches, and legendary warm hospitality.",
    cities:[
      {name:"Manila",    lat:14.5995, lng:120.9842, desc:"Historic Intramuros, bustling bayside capital of the archipelago.", imgs:["manila_1","manila_2","manila_3","manila_4"]},
      {name:"Chocolate Hills", lat:9.8374, lng:124.1499, desc:"Famous limestone formations, turning brown in dry season, creating scenic landscapes.", imgs:["Phillipines25","IMG_5896","IMG_5909","IMG_5917"]},
    ]},
  { name:"Singapore", lat:1.3521, lng:103.8198, flag:"🇸🇬", desc:"Garden city, futuristic skyline, and multicultural melting pot.",
    cities:[
      {name:"Marina Bay", lat:1.2834, lng:103.8607, desc:"Iconic Marina Bay Sands, Gardens by the Bay and skyline.", imgs:["marina_bay_1","marina_bay_2","marina_bay_3","marina_bay_4"]},
      {name:"Chinatown",  lat:1.2838, lng:103.8448, desc:"Vibrant heritage district, temples, street markets and hawker stalls.", imgs:["chinatown_sg_1","chinatown_sg_2","chinatown_sg_3","chinatown_sg_4"]},
      {name:"Sentosa",    lat:1.2494, lng:103.8303, desc:"Resort island with Universal Studios and cable car views.", imgs:["sentosa_1","sentosa_2","sentosa_3","sentosa_4"]},
    ]},
  { name:"Spain", lat:40.0, lng:-3.5, flag:"🇪🇸", desc:"Flamenco, siesta, tapas, and a mosaic of vibrant historic cities.",
    cities:[
      {name:"Madrid",    lat:40.4168, lng:-3.7038, desc:"Royal Palace, Prado Museum, and vibrant nightlife.", imgs:["madrid_1","madrid_2","madrid_3","madrid_4"]},
      {name:"Barcelona", lat:41.3851, lng:2.1734,  desc:"Gaudí's Sagrada Família, Gothic Quarter and La Rambla.", imgs:["barcelona_1","barcelona_2","barcelona_3","barcelona_4"]},
    ]},
  { name:"Sweden", lat:62.0, lng:15.0, flag:"🇸🇪", desc:"Archipelagos, minimalist design, and the magic of endless summer light.",
    cities:[
      {name:"Stockholm", lat:59.3293, lng:18.0686, desc:"Venice of the North — islands, Viking history and design.", imgs:["stockholm_1","stockholm_2","stockholm_3","stockholm_4"]},
    ]},
  { name:"Switzerland", lat:46.8, lng:8.0, flag:"🇨🇭", desc:"Alpine peaks, pristine lakes, chocolate, and precision watchmaking.",
    cities:[
      {name:"Zürich",     lat:47.3769, lng:8.5417, desc:"Financial hub with old town, Lake Zürich and vibrant culture.", imgs:["zurich_1","zurich_2","zurich_3","zurich_4"]},
      {name:"Geneva",     lat:46.2044, lng:6.1432, desc:"International city, Jet d'Eau on Lake Geneva.", imgs:["geneva_1","geneva_2","geneva_3","geneva_4"]},
      {name:"Interlaken", lat:46.6863, lng:7.8632, desc:"Adventure capital between two lakes, gateway to the Alps.", imgs:["interlaken_1","interlaken_2","interlaken_3","interlaken_4"]},
    ]},
  { name:"Thailand", lat:15.0, lng:101.0, flag:"🇹🇭", desc:"Land of smiles, golden temples, vibrant street food, and tropical beaches.",
    cities:[
      {name:"Bangkok", lat:13.7367, lng:100.5231, desc:"Temple of the Emerald Buddha, floating markets and tuk-tuks.", imgs:["bangkok_1","bangkok_2","bangkok_3","bangkok_4"]},
    ]},
  { name:"United Kingdom", lat:54.0, lng:-2.5, flag:"🇬🇧", desc:"Royal heritage, literary legends, rolling countryside, and dynamic cities.",
    cities:[
      {name:"London",     lat:51.5074, lng:-0.1278, desc:"Big Ben, Tower Bridge, West End and multicultural energy.", imgs:["london_1","london_2","london_3","london_4"]},
      {name:"Edinburgh",  lat:55.9533, lng:-3.1883, desc:"Castle rock, Arthur's Seat, whisky trails and festivals.", imgs:["edinburgh_1","edinburgh_2","edinburgh_3","edinburgh_4"]},
      {name:"Manchester", lat:53.4808, lng:-2.2426, desc:"Music, football, Northern Quarter and Industrial heritage.", imgs:["manchester_1","manchester_2","manchester_3","manchester_4"]},
    ]},
  { name:"Vietnam", lat:16.5, lng:107.0, flag:"🇻🇳", desc:"Dramatic karst landscapes, bustling cities, and aromatic street food.",
    cities:[
      {name:"Hanoi",            lat:21.0285, lng:105.8542, desc:"French colonial old quarter, Hoan Kiem Lake and pho.", imgs:["hanoi_1","hanoi_2","hanoi_3","hanoi_4"]},
      {name:"Ho Chi Minh City", lat:10.8231, lng:106.6297, desc:"Saigon's energy, war history and street food culture.", imgs:["hcmc_1","hcmc_2","hcmc_3","hcmc_4"]},
    ]},
  { name:"Zambia", lat:-14.5, lng:27.5, flag:"🇿🇲", desc:"Victoria Falls, wild safaris, and the mighty Zambezi River.",
    cities:[
      {name:"Lusaka",      lat:-15.3875, lng:28.3228, desc:"Rapidly growing capital with markets and modern development.", imgs:["lusaka_1","lusaka_2","lusaka_3","lusaka_4"]},
      {name:"Livingstone", lat:-17.8619, lng:25.8564, desc:"Victoria Falls town, adventure capital of Africa.", imgs:["livingstone_1","livingstone_2","livingstone_3","livingstone_4"]},
    ]},
].sort((a, b) => a.name.localeCompare(b.name));

/* ── LIGHTBOX ────────────────────────────────────────────────── */
let tmLbSrcs = [], tmLbIdx = 0, tmLbCity = '';

function tmOpenLb(srcs, idx, cityName) {
  tmLbSrcs = srcs; tmLbIdx = idx; tmLbCity = cityName;
  tmRenderLb();
  document.getElementById('tm-lb').classList.add('tm-on');
}
function tmCloseLb() { document.getElementById('tm-lb').classList.remove('tm-on'); }
function tmLbNav(dir) { tmLbIdx = (tmLbIdx + dir + tmLbSrcs.length) % tmLbSrcs.length; tmRenderLb(); }
function tmRenderLb() {
  document.getElementById('tm-lb-img').src = tmLbSrcs[tmLbIdx];
  document.getElementById('tm-lb-caption').textContent =
    `${tmLbCity} · Photo ${tmLbIdx + 1} of ${tmLbSrcs.length}`;
  document.getElementById('tm-lb-dots').innerHTML = tmLbSrcs
    .map((_,i) => `<div class="tm-lb-dot${i===tmLbIdx?' tm-on':''}"
                        onclick="(function(){tmLbIdx=${i};tmRenderLb();})()"></div>`)
    .join('');
}
document.getElementById('tm-lb-close').addEventListener('click', tmCloseLb);
document.getElementById('tm-lb-prev').addEventListener('click', () => tmLbNav(-1));
document.getElementById('tm-lb-next').addEventListener('click', () => tmLbNav(1));
document.getElementById('tm-lb').addEventListener('click', function(e){ if(e.target===this) tmCloseLb(); });
document.addEventListener('keydown', e => {
  if (!document.getElementById('tm-lb').classList.contains('tm-on')) return;
  if (e.key === 'Escape')     tmCloseLb();
  if (e.key === 'ArrowLeft')  tmLbNav(-1);
  if (e.key === 'ArrowRight') tmLbNav(1);
});

/* Expose helpers needed by inline onclick in dots */
window.tmLbIdx    = () => tmLbIdx;
window.tmRenderLb = tmRenderLb;

/* ── IMAGE HELPERS ───────────────────────────────────────────── */
/* Thumbnails and full images served from the site's own static folder */
const tmThumb = (name) => `static/img/explore/${name}.jpg`;
const tmFull  = (name) => `static/img/explore/${name}.jpg`;

/* ── MAP ─────────────────────────────────────────────────────── */
const tmMap = L.map('tm-map', { zoomControl:false, attributionControl:false }).setView([20,10], 2.2);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  { subdomains:'abcd', maxZoom:19, minZoom:2 }).addTo(tmMap);
L.control.zoom({ position:'bottomright' }).addTo(tmMap);

const tmCountryIcon = () => L.divIcon({
  className: '',
  html: `<div class="tm-pin-outer"><div class="tm-pin-ring"></div><div class="tm-pin-ring2"></div><div class="tm-pin-inner"><i class="fa-solid fa-globe"></i></div></div>`,
  iconSize:[36,36], popupAnchor:[0,-20], tooltipAnchor:[0,-14]
});
const tmCityIcon = () => L.divIcon({
  className: '',
  html: `<div class="tm-city-pin-outer"><div class="tm-city-pin-ring"></div><div class="tm-city-pin-inner"><i class="fa-solid fa-camera"></i></div></div>`,
  iconSize:[28,28], popupAnchor:[0,-16], tooltipAnchor:[0,-12]
});

function tmCityPopupHtml(country, city) {
  const photos = city.imgs.map((name, i) => `
    <div class="tm-ph" data-idx="${i}">
      <img src="${tmThumb(name)}" alt="" loading="lazy"
           onerror="this.src='https://picsum.photos/400/280?random=${i}'">
      <div class="tm-zoom-hint"><i class="fa-solid fa-expand"></i> View</div>
    </div>`).join('');
  /* Use "location" label for countries with multiple pink pins (regions, not just cities) */
  const locLabel = country.cities.length > 1 ? 'location' : 'city';
  const wiki = `https://en.wikipedia.org/wiki/${encodeURIComponent(city.name)}`;
  return `
    <div class="tm-popup-body">
      <div class="tm-popup-photos">${photos}</div>
      <div class="tm-popup-text">
        <div class="tm-city-badge"><i class="fa-solid fa-location-dot"></i> ${country.flag} ${country.name}</div>
        <div class="tm-popup-title">${city.name}</div>
        <div class="tm-popup-desc">${city.desc}</div>
        <div class="tm-popup-actions">
          <a href="${wiki}" target="_blank" rel="noopener" class="tm-popup-link">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Read More
          </a>
          <span class="tm-popup-coord">${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}°</span>
        </div>
      </div>
    </div>`;
}

let tmActiveItem = null;

tmCountries.forEach(c => {
  /* Country pin */
  L.marker([c.lat, c.lng], { icon:tmCountryIcon(), riseOnHover:true, zIndexOffset:100 })
    .bindTooltip(`${c.flag} ${c.name}`, { sticky:true, offset:[0,-18], direction:'top', className:'tm-tt' })
    .on('click', () => tmMap.flyTo([c.lat, c.lng], 6, { duration:1.4, easeLinearity:0.2 }))
    .addTo(tmMap);

  /* Location pins */
  c.cities.forEach(city => {
    const fullSrcs = city.imgs.map(name => tmFull(name));
    L.marker([city.lat, city.lng], { icon:tmCityIcon(), riseOnHover:true })
      .bindPopup(tmCityPopupHtml(c, city), { maxWidth:410, minWidth:350, className:'tm-popup', offset:[0,-8] })
      .bindTooltip(`📍 ${city.name}`, { sticky:true, offset:[0,-14], direction:'top', className:'tm-tt' })
      .on('popupopen', () => {
        setTimeout(() => {
          document.querySelectorAll('.leaflet-popup-content .tm-ph').forEach(ph => {
            ph.style.cursor = 'zoom-in';
            ph.addEventListener('click', function(e) {
              e.stopPropagation();
              tmOpenLb(fullSrcs, parseInt(this.dataset.idx) || 0, city.name);
            });
          });
        }, 80);
      })
      .addTo(tmMap);
  });
});

/* ── PANEL LIST ──────────────────────────────────────────────── */
const tmListEl = document.getElementById('tm-country-list');
function tmRenderList(filter) {
  tmListEl.innerHTML = '';
  const list = filter
    ? tmCountries.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
    : tmCountries;
  list.forEach((c, i) => {
    /* Countries with >1 pink pin → "locations"; single pin → "city" */
    const locWord = c.cities.length > 1 ? 'locations' : 'city';
    const el = document.createElement('div');
    el.className = 'tm-country-item';
    el.style.animationDelay = `${i * 0.032 + 0.4}s`;
    el.innerHTML = `
      <div class="tm-c-flag">${c.flag}</div>
      <div class="tm-c-body">
        <div class="tm-c-name">${c.name}</div>
        <div class="tm-c-desc">${c.cities.length} ${locWord} · ${c.desc}</div>
      </div>
      <i class="fa-solid fa-chevron-right tm-c-arrow"></i>`;
    el.addEventListener('click', () => {
      if (tmActiveItem) tmActiveItem.classList.remove('tm-active');
      el.classList.add('tm-active');
      tmActiveItem = el;
      tmMap.flyTo([c.lat, c.lng], 6, { duration:1.5, easeLinearity:0.2 });
    });
    tmListEl.appendChild(el);
  });
}
tmRenderList('');
document.getElementById('tm-search').addEventListener('input', e => tmRenderList(e.target.value));
document.getElementById('tm-reset-btn').addEventListener('click', () => {
  tmMap.flyTo([20,10], 2.2, { duration:1.5 });
  tmMap.closePopup();
  if (tmActiveItem) { tmActiveItem.classList.remove('tm-active'); tmActiveItem = null; }
});

/* ── STATS ───────────────────────────────────────────────────── */
document.getElementById('tm-s-n').textContent = tmCountries.length;
document.getElementById('tm-nations-badge').textContent = tmCountries.length + ' nations';
const tmContMap = {Austria:1,Denmark:1,Finland:1,France:1,Germany:1,Netherlands:1,Spain:1,Sweden:1,Switzerland:1,"United Kingdom":1,Cambodia:2,China:2,Indonesia:2,Laos:2,Malaysia:2,Philippines:2,Singapore:2,Thailand:2,Vietnam:2,Ethiopia:3,Zambia:3,Fiji:4};
document.getElementById('tm-s-c').textContent = new Set(tmCountries.map(c => tmContMap[c.name] || 5)).size;

/* ── MAP HEIGHT: fills gap between header and bottom of viewport ─ */
function tmFitHeight() {
  const header = document.querySelector('header.su-masthead');
  const shell  = document.getElementById('tm-shell');
  if (!header || !shell) return;
  shell.style.height = Math.max(480, window.innerHeight - header.offsetHeight - 2) + 'px';
  tmMap.invalidateSize();
}
tmFitHeight();
window.addEventListener('resize', tmFitHeight);

})(); /* end IIFE */
