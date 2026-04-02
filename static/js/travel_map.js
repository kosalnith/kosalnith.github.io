(function () { /* IIFE — nothing leaks to window except what we explicitly expose */

/* ── DATA ────────────────────────────────────────────────────── */
/* imgs[] values are the photo filenames (without .jpg extension)
   served from static/img/explore/<filename>.jpg
   Countries with more than one pink pin have locations that are
   regions / areas, not cities — the label is set dynamically below. */
/* ══════════════════════════════════════════════════════════════
   PIN TYPE REGISTRY  —  Rexby-style colours
   ──────────────────────────────────────────────────────────────
   To add a new type, append one line before the closing brace:
     mytype: { color:'#hex', icon:'fa-solid fa-icon-name', label:'My Label' },
   Then set  type:"mytype"  on any city entry. Done — legend auto-updates.
══════════════════════════════════════════════════════════════ */
const tmPinTypes = {
  /* ── FOOD & DRINK  (pink / magenta family — matches Rexby) ── */
  restaurant:  { color:'#e8194b', icon:'fa-solid fa-utensils',            label:'Restaurant'       },
  cafe:        { color:'#c0392b', icon:'fa-solid fa-mug-saucer',          label:'Café'             },
  bar:         { color:'#9b2335', icon:'fa-solid fa-martini-glass',       label:'Bar'              },
  bakery:      { color:'#d35400', icon:'fa-solid fa-bread-slice',         label:'Bakery'           },
  brewery:     { color:'#b7410e', icon:'fa-solid fa-beer-mug-empty',      label:'Brewery'          },

  /* ── NATURE & OUTDOORS  (teal / green family — matches Rexby) ── */
  beach:       { color:'#16a085', icon:'fa-solid fa-umbrella-beach',      label:'Beach'            },
  park:        { color:'#27ae60', icon:'fa-solid fa-tree',                label:'Park'             },
  hike:        { color:'#1e8449', icon:'fa-solid fa-person-hiking',       label:'Hike'             },
  waterfall:   { color:'#148f77', icon:'fa-solid fa-water',               label:'Waterfall'        },
  hotspring:   { color:'#ca6f1e', icon:'fa-solid fa-hot-tub-person',      label:'Hot Spring'       },
  wildlife:    { color:'#117a65', icon:'fa-solid fa-paw',                 label:'Wildlife'         },
  campsite:    { color:'#1a5276', icon:'fa-solid fa-campground',          label:'Campsite'         },

  /* ── SIGHTSEEING & CULTURE  (golden / amber — matches Rexby) ── */
  sightseeing: { color:'#d4ac0d', icon:'fa-solid fa-binoculars',          label:'Sightseeing'      },
  museum:      { color:'#b7950b', icon:'fa-solid fa-building-columns',    label:'Museum'           },
  culture:     { color:'#9a7d0a', icon:'fa-solid fa-masks-theater',       label:'Culture'          },
  photospot:   { color:'#d68910', icon:'fa-solid fa-camera-retro',        label:'Photospot'        },
  area:        { color:'#7d6608', icon:'fa-solid fa-map-location-dot',    label:'Area'             },

  /* ── TRANSPORT  (dark slate blue — matches Rexby) ── */
  transport:   { color:'#2e4057', icon:'fa-solid fa-bus',                 label:'Public Transport' },
  harbor:      { color:'#1a252f', icon:'fa-solid fa-anchor',              label:'Harbor'           },
  airport:     { color:'#283747', icon:'fa-solid fa-plane-departure',     label:'Airport'          },

  /* ── ACCOMMODATION  (purple / indigo — matches Rexby) ── */
  hotel:       { color:'#6c3483', icon:'fa-solid fa-bed',                 label:'Hotel'            },
  hostel:      { color:'#76448a', icon:'fa-solid fa-people-roof',         label:'Hostel'           },
  home:        { color:'#5b2c6f', icon:'fa-solid fa-house',               label:'Homes'            },

  /* ── ACTIVITIES & WELLNESS  (orange / coral — matches Rexby) ── */
  activity:    { color:'#e67e22', icon:'fa-solid fa-person-running',      label:'Activity'         },
  tours:       { color:'#ca6f1e', icon:'fa-solid fa-route',               label:'Tours'            },
  spa:         { color:'#a569bd', icon:'fa-solid fa-spa',                 label:'Spa'              },

  /* ── SHOPPING  (hot pink) ── */
  shop:        { color:'#c0392b', icon:'fa-solid fa-bag-shopping',        label:'Shop'             },

  /* ── EDUCATION & WORK ── */
  university:  { color:'#1a5276', icon:'fa-solid fa-graduation-cap',      label:'University'       },
  research:    { color:'#42657b', icon:'fa-solid fa-microscope',          label:'Research'         },

  /* ── FALLBACK ── */
  default:     { color:'#7f8c8d', icon:'fa-solid fa-location-dot',        label:'Spot'             },
};

const tmCountries = [
  { name:"Austria", lat:47.8, lng:13.0, flag:"at", desc:"Alpine majesty, classical music, imperial palaces, and charming villages.",
    cities:[
      {name:"Vienna",    lat:48.2082, lng:16.3738, type:"sightseeing",  desc:"Imperial capital of art, music, and coffeehouse culture.", imgs:["Ethiopia25","vienna_2","vienna_3","vienna_4"]},
      {name:"Salzburg",  lat:47.8095, lng:13.0550, type:"culture", desc:"Birthplace of Mozart, baroque architecture and Alpine setting.", imgs:["salzburg_1","salzburg_2","salzburg_3","salzburg_4"]},
      {name:"Innsbruck", lat:47.2682, lng:11.3923, type:"park",   desc:"Mountain city nestled in the Alps, gateway to ski resorts.", imgs:["innsbruck_1","innsbruck_2","innsbruck_3","innsbruck_4"]},
    ]},
  { name:"Cambodia", lat:12.0, lng:104.5, flag:"kh", desc:"Home to Angkor Wat, ancient temples, and lush landscapes of Khmer heritage.",
    cities:[
      {name:"Siem Reap",  lat:13.3671, lng:103.8448, type:"culture", desc:"Gateway to the majestic Angkor temple complex.", imgs:["siem_reap_1","siem_reap_2","siem_reap_3","siem_reap_4"]},
      {name:"Phnom Penh", lat:11.5564, lng:104.9282, type:"sightseeing",  desc:"Vibrant capital on the Mekong with rich royal heritage.", imgs:["phnom_penh_1","phnom_penh_2","phnom_penh_3","phnom_penh_4"]},
      {name:"Kampot",     lat:10.6112, lng:104.1806, type:"park",   desc:"Riverside town famed for pepper plantations and French villas.", imgs:["kampot_1","kampot_2","kampot_3","kampot_4"]},
      {name:"Koh Rong",   lat:10.7226, lng:103.2440, type:"beach",    desc:"Tropical island known for white beaches and clear waters.", imgs:["koh_rong_1","koh_rong_2","koh_rong_3","koh_rong_4"]},
      {name:"Phnom Preah",lat:12.1738, lng:102.9069, type:"hike",   desc:"Forested mountain rising above plains, offering peaceful nature and scenic views.", imgs:["PhnomPreah202301","PhnomPreah","WaterFell2021","koh_rong_4"]},
    ]},
  { name:"China", lat:35.0, lng:105.0, flag:"cn", desc:"Ancient wonders, futuristic cities, and the Great Wall stretching to the horizon.",
    cities:[
      {name:"Beijing",  lat:39.9042, lng:116.4074, type:"airport",  desc:"Imperial capital, home to the Forbidden City and Great Wall.", imgs:["beijing_1","beijing_2","beijing_3","beijing_4"]},
      {name:"Shanghai", lat:31.2304, lng:121.4737, type:"culture", desc:"Futuristic skyline meets colonial Bund architecture.", imgs:["shanghai_1","shanghai_2","shanghai_3","shanghai_4"]},
      {name:"Xi'an",    lat:34.3416, lng:108.9398, type:"photospot", desc:"Ancient capital, home of the Terracotta Army.", imgs:["xian_1","xian_2","xian_3","xian_4"]},
    ]},
  { name:"Denmark", lat:56.0, lng:10.0, flag:"dk", desc:"Hygge lifestyle, Viking history, and modern Scandinavian design.",
    cities:[
      {name:"Copenhagen", lat:55.6761, lng:12.5683, type:"sightseeing",  desc:"Colorful Nyhavn, cycling culture, and world-class cuisine.", imgs:["copenhagen_1","copenhagen_2","copenhagen_3","copenhagen_4"]},
      {name:"Aarhus",     lat:56.1629, lng:10.2039, type:"culture", desc:"Denmark's second city, vibrant arts scene and Latin Quarter.", imgs:["aarhus_1","aarhus_2","aarhus_3","aarhus_4"]},
    ]},
  { name:"Ethiopia", lat:9.5, lng:39.5, flag:"et", desc:"Ancient rock churches, coffee origins, and breathtaking highland landscapes.",
    cities:[
      {name:"Addis Ababa", lat:9.0320, lng:38.7469, type:"airport", desc:"Africa's diplomatic capital, high-altitude city with rich culture.", imgs:["addis_ababa_1","addis_ababa_2","addis_ababa_3","addis_ababa_4"]},
    ]},
  { name:"Fiji", lat:-17.5, lng:178.0, flag:"fj", desc:"Coral reefs, turquoise waters, and the warm tropical Bula spirit.",
    cities:[
      {name:"Suva", lat:-18.1416, lng:178.4419, type:"sightseeing", desc:"Capital city on the Pacific, vibrant market and cultural hub.", imgs:["suva_1","suva_2","suva_3","suva_4"]},
      {name:"Nadi", lat:-17.7765, lng:177.4356, type:"beach",   desc:"Gateway city with lush gardens and Mamanuca Islands access.", imgs:["nadi_1","nadi_2","nadi_3","nadi_4"]},
    ]},
  { name:"Finland", lat:62.0, lng:25.0, flag:"fi", desc:"A thousand lakes, Nordic saunas, and the magical Northern Lights.",
    cities:[
      {name:"Helsinki", lat:60.1699, lng:24.9384, type:"airport", desc:"Design capital on the Baltic, cathedral squares and saunas.", imgs:["helsinki_1","helsinki_2","helsinki_3","helsinki_4"]},
    ]},
  { name:"France", lat:46.5, lng:2.5, flag:"fr", desc:"Art, romance, cuisine, and iconic landmarks from coast to countryside.",
    cities:[
      {name:"Paris", lat:48.8566, lng:2.3522, type:"sightseeing", desc:"City of Light — Eiffel Tower, Louvre, and café terraces.", imgs:["paris_1","paris_2","paris_3","paris_4"]},
    ]},
  { name:"Germany", lat:51.0, lng:10.0, flag:"de", desc:"Castles, beer gardens, fairy-tale forests, and cutting-edge innovation.",
    cities:[
      {name:"Berlin",  lat:52.5200, lng:13.4050, type:"sightseeing",  desc:"Reunified capital, cutting-edge art and tumultuous history.", imgs:["berlin_1","berlin_2","berlin_3","berlin_4"]},
      {name:"Munich",  lat:48.1351, lng:11.5820, type:"university", desc:"Beer gardens, Oktoberfest, and Baroque Marienplatz.", imgs:["munich_1","munich_2","munich_3","munich_4"]},
      {name:"Hamburg", lat:53.5753, lng:10.0153, type:"culture", desc:"Great port city, Speicherstadt warehouse district.", imgs:["hamburg_1","hamburg_2","hamburg_3","hamburg_4"]},
    ]},
  { name:"India", lat:22.0, lng:79.0, flag:"in", desc:"A subcontinent of ancient temples, spice markets, and breathtaking diversity.",
    cities:[
      {name:"New Delhi",  lat:28.6139, lng:77.2090, type:"sightseeing",  desc:"Mughal forts, colonial boulevards, and vibrant bazaars.", imgs:["new_delhi_1","new_delhi_2","new_delhi_3","new_delhi_4"]},
      {name:"Mumbai",     lat:19.0760, lng:72.8777, type:"culture", desc:"Bollywood, colonial architecture, and the bustling Gateway of India.", imgs:["mumbai_1","mumbai_2","mumbai_3","mumbai_4"]},
    ]},
  { name:"Indonesia", lat:-3.0, lng:117.0, flag:"id", desc:"Thousands of islands, volcanoes, rainforests, and vibrant cultures.",
    cities:[
      {name:"Jakarta", lat:-6.2088, lng:106.8456, type:"sightseeing", desc:"Sprawling megacity, melting pot of cultures and cuisines.", imgs:["jakarta_1","jakarta_2","jakarta_3","jakarta_4"]},
    ]},
  { name:"Laos", lat:18.5, lng:103.0, flag:"la", desc:"Serene mountains, Buddhist monasteries, and the mighty Mekong River.",
    cities:[
      {name:"Luang Prabang", lat:19.8845, lng:102.1347, type:"culture", desc:"UNESCO World Heritage town, golden temples on the Mekong.", imgs:["luang_prabang_1","luang_prabang_2","luang_prabang_3","luang_prabang_4"]},
      {name:"Vang Vieng",    lat:18.9222, lng:102.4417, type:"hike",   desc:"Dramatic karst scenery, rivers and outdoor adventure.", imgs:["vang_vieng_1","vang_vieng_2","vang_vieng_3","vang_vieng_4"]},
    ]},
  { name:"Malaysia", lat:4.0, lng:109.0, flag:"my", desc:"Rainforests, skyscrapers, diverse cultures, and incredible culinary fusion.",
    cities:[
      {name:"Kuala Lumpur", lat:3.1390, lng:101.6869, type:"sightseeing", desc:"Petronas Towers, street food haven and multicultural city.", imgs:["kuala_lumpur_1","kuala_lumpur_2","kuala_lumpur_3","kuala_lumpur_4"]},
    ]},
  { name:"Netherlands", lat:52.5, lng:5.0, flag:"nl", desc:"Windmills, tulip fields, golden age canals, and vibrant cycling culture.",
    cities:[
      {name:"Amsterdam", lat:52.3702, lng:4.8952, type:"airport", desc:"Canal rings, Rijksmuseum, Anne Frank House and bike lanes.", imgs:["amsterdam_1","amsterdam_2","amsterdam_3","amsterdam_4"]},
    ]},
  { name:"Philippines", lat:12.5, lng:122.5, flag:"ph", desc:"Over 7,000 islands, pristine beaches, and legendary warm hospitality.",
    cities:[
      {name:"Manila",         lat:14.5995, lng:120.9842, type:"sightseeing",  desc:"Historic Intramuros, bustling bayside capital of the archipelago.", imgs:["manila_1","manila_2","manila_3","manila_4"]},
      {name:"Chocolate Hills", lat:9.8374, lng:124.1499, type:"park",   desc:"Famous limestone formations, turning brown in dry season, creating scenic landscapes.", imgs:["Phillipines25","IMG_5896","IMG_5909","IMG_5917"]},
    ]},
  { name:"Qatar", lat:25.3, lng:51.2, flag:"qa", desc:"Futuristic skylines, desert dunes, and a crossroads of ancient trade routes.",
    cities:[
      {name:"Doha", lat:25.2854, lng:51.5310, type:"airport", desc:"Ultramodern capital with the Museum of Islamic Art and Souq Waqif.", imgs:["doha_1","doha_2","doha_3","doha_4"]},
    ]},
  { name:"Rwanda", lat:-2.0, lng:30.0, flag:"rw", desc:"Land of a thousand hills, mountain gorillas, and remarkable resilience.",
    cities:[
      {name:"Kigali",          lat:-1.9441, lng:30.0619, type:"sightseeing", desc:"Africa's cleanest capital, with powerful genocide memorials and growing innovation.", imgs:["kigali_1","kigali_2","kigali_3","kigali_4"]},
      {name:"Volcanoes N.P.",  lat:-1.4767, lng:29.5244, type:"wildlife",  desc:"Misty rainforests sheltering endangered mountain gorillas.", imgs:["volcanoes_1","volcanoes_2","volcanoes_3","volcanoes_4"]},
    ]},
  { name:"Singapore", lat:1.3521, lng:103.8198, flag:"sg", desc:"Garden city, futuristic skyline, and multicultural melting pot.",
    cities:[
      {name:"Marina Bay", lat:1.2834, lng:103.8607, type:"culture", desc:"Iconic Marina Bay Sands, Gardens by the Bay and skyline.", imgs:["marina_bay_1","marina_bay_2","marina_bay_3","marina_bay_4"]},
      {name:"Chinatown",  lat:1.2838, lng:103.8448, type:"restaurant",    desc:"Vibrant heritage district, temples, street markets and hawker stalls.", imgs:["chinatown_sg_1","chinatown_sg_2","chinatown_sg_3","chinatown_sg_4"]},
      {name:"Sentosa",    lat:1.2494, lng:103.8303, type:"beach",   desc:"Resort island with Universal Studios and cable car views.", imgs:["sentosa_1","sentosa_2","sentosa_3","sentosa_4"]},
    ]},
  { name:"Spain", lat:40.0, lng:-3.5, flag:"es", desc:"Flamenco, siesta, tapas, and a mosaic of vibrant historic cities.",
    cities:[
      {name:"Madrid",    lat:40.4168, lng:-3.7038, type:"sightseeing",  desc:"Royal Palace, Prado Museum, and vibrant nightlife.", imgs:["madrid_1","madrid_2","madrid_3","madrid_4"]},
      {name:"Barcelona", lat:41.3851, lng:2.1734,  type:"culture", desc:"Gaudí's Sagrada Família, Gothic Quarter and La Rambla.", imgs:["barcelona_1","barcelona_2","barcelona_3","barcelona_4"]},
    ]},
  { name:"Sweden", lat:62.0, lng:15.0, flag:"se", desc:"Archipelagos, minimalist design, and the magic of endless summer light.",
    cities:[
      {name:"Stockholm", lat:59.3293, lng:18.0686, type:"sightseeing", desc:"Venice of the North — islands, Viking history and design.", imgs:["stockholm_1","stockholm_2","stockholm_3","stockholm_4"]},
    ]},
  { name:"Switzerland", lat:46.8, lng:8.0, flag:"ch", desc:"Alpine peaks, pristine lakes, chocolate, and precision watchmaking.",
    cities:[
      {name:"Zürich",     lat:47.3769, lng:8.5417, type:"culture", desc:"Financial hub with old town, Lake Zürich and vibrant culture.", imgs:["zurich_1","zurich_2","zurich_3","zurich_4"]},
      {name:"Geneva",     lat:46.2044, lng:6.1432, type:"culture", desc:"International city, Jet d'Eau on Lake Geneva.", imgs:["geneva_1","geneva_2","geneva_3","geneva_4"]},
      {name:"Interlaken", lat:46.6863, lng:7.8632, type:"park",   desc:"Adventure capital between two lakes, gateway to the Alps.", imgs:["interlaken_1","interlaken_2","interlaken_3","interlaken_4"]},
    ]},
  { name:"Thailand", lat:15.0, lng:101.0, flag:"th", desc:"Land of smiles, golden temples, vibrant street food, and tropical beaches.",
    cities:[
      {name:"Bangkok", lat:13.7367, lng:100.5231, type:"sightseeing", desc:"Temple of the Emerald Buddha, floating markets and tuk-tuks.", imgs:["bangkok_1","bangkok_2","bangkok_3","bangkok_4"]},
    ]},
  { name:"United Arab Emirates", lat:24.0, lng:54.5, flag:"ae", desc:"Desert dunes, ultramodern towers, souk culture, and luxury at every turn.",
    cities:[
      {name:"Dubai",     lat:25.2048, lng:55.2708, type:"culture", desc:"Burj Khalifa, gold souks, and desert safaris meet the future.", imgs:["dubai_1","dubai_2","dubai_3","dubai_4"]},
      {name:"Abu Dhabi", lat:24.4539, lng:54.3773, type:"airport",  desc:"Capital city of stunning mosques, museums, and Formula 1.", imgs:["abu_dhabi_1","abu_dhabi_2","abu_dhabi_3","abu_dhabi_4"]},
    ]},
  { name:"United Kingdom", lat:54.0, lng:-2.5, flag:"gb", desc:"Royal heritage, literary legends, rolling countryside, and dynamic cities.",
    cities:[
      {name:"London",     lat:51.5074, lng:-0.1278, type:"sightseeing",  desc:"Big Ben, Tower Bridge, West End and multicultural energy.", imgs:["london_1","london_2","london_3","london_4"]},
      {name:"Leeds",  lat:55.9533, lng:-3.1883, type:"culture", desc:"Castle rock, Arthur's Seat, whisky trails and festivals.", imgs:["edinburgh_1","edinburgh_2","edinburgh_3","edinburgh_4"]},
      {name:"Manchester", lat:53.4808, lng:-2.2426, type:"culture", desc:"Music, football, Northern Quarter and Industrial heritage.", imgs:["manchester_1","manchester_2","manchester_3","manchester_4"]},
    ]},
  { name:"Vietnam", lat:16.5, lng:107.0, flag:"vn", desc:"Dramatic karst landscapes, bustling cities, and aromatic street food.",
    cities:[
      {name:"Hanoi",            lat:21.0285, lng:105.8542, type:"sightseeing", desc:"French colonial old quarter, Hoan Kiem Lake and pho.", imgs:["hanoi_1","hanoi_2","hanoi_3","hanoi_4"]},
      {name:"Ho Chi Minh City", lat:10.8231, lng:106.6297, type:"restaurant",    desc:"Saigon's energy, war history and street food culture.", imgs:["hcmc_1","hcmc_2","hcmc_3","hcmc_4"]},
    ]},
  { name:"Zambia", lat:-14.5, lng:27.5, flag:"zm", desc:"Victoria Falls, wild safaris, and the mighty Zambezi River.",
    cities:[
      {name:"Lusaka",      lat:-15.3875, lng:28.3228, type:"sightseeing", desc:"Rapidly growing capital with markets and modern development.", imgs:["lusaka_1","lusaka_2","lusaka_3","lusaka_4"]},
      {name:"Livingstone", lat:-17.8619, lng:25.8564, type:"waterfall",  desc:"Victoria Falls town, adventure capital of Africa.", imgs:["livingstone_1","livingstone_2","livingstone_3","livingstone_4"]},
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
/* Thumbnails: small compressed copies in the thumbs/ subfolder (generated by
   the batch script below). Full images: originals at full resolution.
   The popup grid loads thumbs (fast); the lightbox loads originals (crisp). */
const tmThumb = (name) => `static/img/explore/thumbs/${name}.jpg`;
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
const tmCityIcon = (type) => {
  const t = tmPinTypes[type] || tmPinTypes.default;
  return L.divIcon({
    className: '',
    html: `<div class="tm-city-pin-outer" data-pintype="${type||'default'}">
             <div class="tm-city-pill" style="background:${t.color}">
               <i class="${t.icon}"></i>
             </div>
           </div>`,
    iconSize:[30,30], popupAnchor:[0,-18], tooltipAnchor:[0,-14]
  });
};

function tmCityPopupHtml(country, city) {
  const t = tmPinTypes[city.type] || tmPinTypes.default;
  const photos = city.imgs.map((name, i) => `
    <div class="tm-ph" data-idx="${i}">
      <img src="${tmThumb(name)}" alt="" loading="lazy"
           onerror="this.src='${tmFull(name)}';this.onerror=null;">
      <div class="tm-zoom-hint"><i class="fa-solid fa-expand"></i> View</div>
    </div>`).join('');
  /* Use "location" label for countries with multiple pink pins (regions, not just cities) */
  const locLabel = country.cities.length > 1 ? 'location' : 'city';
  const wiki = `https://en.wikipedia.org/wiki/${encodeURIComponent(city.name)}`;
  return `
    <div class="tm-popup-body">
      <div class="tm-popup-photos">${photos}</div>
      <div class="tm-popup-text">
        <div class="tm-city-badge" style="color:${t.color};background:${t.color}14;border-color:${t.color}30">
          <i class="${t.icon}"></i> <span class="fi fi-${country.flag}" title="${country.name}"></span> ${country.name}
          <span class="tm-type-tag">${t.label}</span>
        </div>
        <div class="tm-popup-title">${city.name}</div>
        <div class="tm-popup-desc">${city.desc}</div>
        <div class="tm-popup-actions">
          <a href="${wiki}" target="_blank" rel="noopener" class="tm-popup-link" style="background:${t.color}">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Read More
          </a>
          <span class="tm-popup-coord">${city.lat.toFixed(2)}°, ${city.lng.toFixed(2)}°</span>
        </div>
      </div>
    </div>`;
}

let tmActiveItem   = null;
const tmAllMarkers = [];        /* { marker, type } — populated in forEach below */
const tmActiveFilters = new Set(); /* empty = show all */

tmCountries.forEach(c => {
  /* Location pins — country globe pins removed; only typed location pins shown */
  c.cities.forEach(city => {
    const fullSrcs = city.imgs.map(name => tmFull(name));
    const pinType  = city.type || 'default';
    const marker   = L.marker([city.lat, city.lng], { icon:tmCityIcon(pinType), riseOnHover:true })
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
      });
    marker.addTo(tmMap);
    /* Store marker reference for filter toggling */
    tmAllMarkers.push({ marker, type: pinType });
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
      <div class="tm-c-flag"><span class="fi fi-${c.flag}"></span></div>
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
const tmContMap = {Austria:1,Denmark:1,Finland:1,France:1,Germany:1,Netherlands:1,Spain:1,Sweden:1,Switzerland:1,"United Kingdom":1,Cambodia:2,China:2,India:2,Indonesia:2,Laos:2,Malaysia:2,Philippines:2,Singapore:2,Thailand:2,Vietnam:2,Ethiopia:3,Rwanda:3,Zambia:3,Fiji:4,Qatar:5,"United Arab Emirates":5};
document.getElementById('tm-s-c').textContent = new Set(tmCountries.map(c => tmContMap[c.name] || 5)).size;

/* ── PANEL TOGGLE ────────────────────────────────────────────── */
(function tmPanelToggle() {
  const panel   = document.getElementById('tm-panel');
  const btn     = document.getElementById('tm-panel-toggle');
  const chevron = document.getElementById('tm-panel-chevron');
  if (!panel || !btn) return;

  /* Auto-collapse on mobile (≤768px) so map is visible by default */
  if (window.innerWidth <= 768) {
    panel.classList.add('tm-panel--collapsed');
  }

  btn.addEventListener('click', () => {
    const collapsed = panel.classList.toggle('tm-panel--collapsed');
    /* After collapsing, invalidate map size so tiles fill the gap */
    setTimeout(() => tmMap.invalidateSize(), 320);
  });
})();

/* ── LEGEND — panel-style: collapsible, scrollable, filterable ── */
(function tmBuildLegend() {
  const legendEl  = document.getElementById('tm-legend');
  const listEl    = document.getElementById('tm-legend-list');
  const badgeEl   = document.getElementById('tm-types-badge');
  const resetBtn  = document.getElementById('tm-legend-reset-btn');
  const toggleBtn = document.getElementById('tm-legend-toggle');
  if (!legendEl || !listEl) return;

  /* Collect types actually used in the data */
  const usedTypes = new Set();
  tmCountries.forEach(c => c.cities.forEach(city => usedTypes.add(city.type || 'default')));

  /* Update the active-count badge */
  function tmUpdateBadge() {
    const n = tmActiveFilters.size;
    badgeEl.textContent = n === 0 ? 'all shown' : `${n} active`;
  }

  /* Show / hide markers according to active filters */
  function tmApplyFilter() {
    tmAllMarkers.forEach(({ marker, type }) => {
      if (tmActiveFilters.size === 0 || tmActiveFilters.has(type)) {
        marker.addTo(tmMap);
      } else {
        marker.remove();
      }
    });
    tmUpdateBadge();
  }

  /* Build one row per used type */
  Object.entries(tmPinTypes).forEach(([key, t]) => {
    if (key === 'default' || !usedTypes.has(key)) return;
    const row = document.createElement('div');
    row.className = 'tm-legend-item';
    row.dataset.type = key;
    row.innerHTML = `
      <div class="tm-legend-pill" style="background:${t.color}">
        <i class="${t.icon}"></i>
      </div>
      <span>${t.label}</span>`;

    row.addEventListener('click', () => {
      if (tmActiveFilters.has(key)) {
        tmActiveFilters.delete(key);
        row.classList.remove('tm-legend-active');
      } else {
        tmActiveFilters.add(key);
        row.classList.add('tm-legend-active');
      }
      tmApplyFilter();
    });

    listEl.appendChild(row);
  });

  /* Reset button — clears all filters */
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      tmActiveFilters.clear();
      listEl.querySelectorAll('.tm-legend-item').forEach(r => r.classList.remove('tm-legend-active'));
      tmApplyFilter();
    });
  }

  /* Toggle collapse — mirrors panel toggle behaviour */
  if (toggleBtn) {
    /* Auto-collapse on mobile */
    if (window.innerWidth <= 768) {
      legendEl.classList.add('tm-legend--collapsed');
    }
    toggleBtn.addEventListener('click', () => {
      legendEl.classList.toggle('tm-legend--collapsed');
    });
  }

  /* Initialise badge */
  tmUpdateBadge();

  /* ── Mobile FAB + Bottom Sheet ─────────────────────────────── */
  const fabEl       = document.getElementById('tm-filter-fab');
  const sheetEl     = document.getElementById('tm-filter-sheet');
  const sheetListEl = document.getElementById('tm-sheet-list');
  const sheetBadge  = document.getElementById('tm-sheet-badge');
  const fabBadge    = document.getElementById('tm-fab-badge');
  const sheetClose  = document.getElementById('tm-sheet-close');
  const sheetReset  = document.getElementById('tm-sheet-reset-btn');

  function tmOpenSheet() {
    sheetEl.classList.add('tm-sheet--open');
    document.body.style.overflow = 'hidden'; /* prevent body scroll behind sheet */
  }
  function tmCloseSheet() {
    sheetEl.classList.remove('tm-sheet--open');
    document.body.style.overflow = '';
  }

  /* Sync badge text across desktop legend, sheet, and FAB badge */
  function tmSyncBadges() {
    const n = tmActiveFilters.size;
    const txt = n === 0 ? 'all shown' : `${n} active`;
    badgeEl.textContent = txt;
    if (sheetBadge) sheetBadge.textContent = txt;
    if (fabBadge) {
      fabBadge.textContent = n;
      fabBadge.classList.toggle('tm-fab-badge--on', n > 0);
    }
  }

  if (fabEl && sheetEl && sheetListEl) {
    /* Clone legend items into sheet list so both panels stay in sync */
    Object.entries(tmPinTypes).forEach(([key, t]) => {
      if (key === 'default' || !usedTypes.has(key)) return;
      const row = document.createElement('div');
      row.className = 'tm-legend-item';
      row.dataset.type = key;
      row.innerHTML = `
        <div class="tm-legend-pill" style="background:${t.color}">
          <i class="${t.icon}"></i>
        </div>
        <span>${t.label}</span>`;

      /* Keep desktop + sheet rows visually in sync */
      function tmSyncRowState(active) {
        /* find matching row in desktop legend list */
        const desktopRow = listEl.querySelector(`.tm-legend-item[data-type="${key}"]`);
        [row, desktopRow].forEach(r => {
          if (!r) return;
          r.classList.toggle('tm-legend-active', active);
        });
      }

      row.addEventListener('click', () => {
        const nowActive = !tmActiveFilters.has(key);
        if (nowActive) tmActiveFilters.add(key); else tmActiveFilters.delete(key);
        tmSyncRowState(nowActive);
        tmApplyFilter();
        tmSyncBadges();
      });
      sheetListEl.appendChild(row);
    });

    /* FAB opens sheet */
    fabEl.addEventListener('click', tmOpenSheet);

    /* Close button + backdrop tap close sheet */
    if (sheetClose) sheetClose.addEventListener('click', tmCloseSheet);
    sheetEl.addEventListener('click', e => {
      if (e.target === sheetEl) tmCloseSheet();
    });

    /* Sheet reset button */
    if (sheetReset) {
      sheetReset.addEventListener('click', () => {
        tmActiveFilters.clear();
        sheetListEl.querySelectorAll('.tm-legend-item').forEach(r => r.classList.remove('tm-legend-active'));
        listEl.querySelectorAll('.tm-legend-item').forEach(r => r.classList.remove('tm-legend-active'));
        tmApplyFilter();
        tmSyncBadges();
      });
    }

    /* Intercept desktop reset to also sync sheet rows */
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        sheetListEl.querySelectorAll('.tm-legend-item').forEach(r => r.classList.remove('tm-legend-active'));
        tmSyncBadges();
      });
    }

    /* Override tmUpdateBadge to also update sheet/fab */
    const _origUpdate = tmUpdateBadge;
    tmUpdateBadge = tmSyncBadges;

    /* Initial badge state */
    tmSyncBadges();
  }
})();

/* ── MAP HEIGHT: fills gap between header and bottom of viewport ─ */
function tmFitHeight() {
  const header = document.querySelector('header.su-masthead');
  const shell  = document.getElementById('tm-shell');
  if (!header || !shell) return;
  /* Use visualViewport height on mobile (accounts for browser chrome/address bar) */
  const vh = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
  const minH = window.innerWidth <= 480 ? 380 : window.innerWidth <= 768 ? 420 : 480;
  shell.style.height = Math.max(minH, vh - header.offsetHeight - 2) + 'px';
  tmMap.invalidateSize();
}
tmFitHeight();
window.addEventListener('resize', tmFitHeight);
/* Also refit when mobile browser chrome shows/hides (address bar scroll) */
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', tmFitHeight);
}

})(); /* end IIFE */
