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
  beach:       { color:'#3aa3aa', icon:'fa-solid fa-umbrella-beach',      label:'Beach'            },
  park:        { color:'#a5ae00', icon:'fa-solid fa-tree',                label:'Park'             },
  hike:        { color:'#1caa0d', icon:'fa-solid fa-person-hiking',       label:'Hike'             },
  waterfall:   { color:'#3faa9c', icon:'fa-solid fa-water',               label:'Waterfall'        },
  hotspring:   { color:'#ca6f1e', icon:'fa-solid fa-hot-tub-person',      label:'Hot Spring'       },
  wildlife:    { color:'#117a65', icon:'fa-solid fa-paw',                 label:'Wildlife'         },
  campsite:    { color:'#1a5276', icon:'fa-solid fa-campground',          label:'Campsite'         },

  /* ── SIGHTSEEING & CULTURE  (golden / amber — matches Rexby) ── */
  sightseeing: { color:'#ff4e22', icon:'fa-solid fa-binoculars',          label:'Sightseeing'      },
  museum:      { color:'#b7950b', icon:'fa-solid fa-building-columns',    label:'Museum'           },
  culture:     { color:'#5260c1', icon:'fa-solid fa-masks-theater',       label:'Culture'          },
  photospot:   { color:'#ff7b31', icon:'fa-solid fa-camera-retro',        label:'Photospot'        },
  area:        { color:'#7d6608', icon:'fa-solid fa-map-location-dot',    label:'Area'             },
  town:        { color:'#41087d', icon:'fa-solid ffa-mountain-city',      label:'Town'             },
  city:        { color:'#eed410', icon:'fa-solid fa-city',                label:'City'             },
  village:     { color:'#710ab5', icon:'fa-solid fa-people-roof',         label:'Village'          },
  zoo:         { color:'#04265d', icon:'fa-solid fa-paw',                 label:'Zoo'              },

  /* ── TRANSPORT  (dark slate blue — matches Rexby) ── */
  transport:   { color:'#2e4057', icon:'fa-solid fa-bus',                 label:'Public Transport' },
  harbor:      { color:'#1a252f', icon:'fa-solid fa-anchor',              label:'Harbor'           },
  airport:     { color:'#283747', icon:'fa-solid fa-plane-departure',     label:'Airport'          },
  train:       { color:'#13ce83', icon:'fa-solid fa-train-subway',          label:'Train Station'    },

  /* ── ACCOMMODATION  (purple / indigo — matches Rexby) ── */
  hotel:       { color:'#6c3483', icon:'fa-solid fa-bed',                 label:'Hotel'            },
  hostel:      { color:'#76448a', icon:'fa-solid fa-people-roof',         label:'Hostel'           },
  home:        { color:'#5b2c6f', icon:'fa-solid fa-house',               label:'Homes'            },

  /* ── ACTIVITIES & WELLNESS  (orange / coral — matches Rexby) ── */
  activity:    { color:'#e67e22', icon:'fa-solid fa-person-running',      label:'Activity'         },
  tours:       { color:'#ca6f1e', icon:'fa-solid fa-route',               label:'Tours'            },
  spa:         { color:'#a569bd', icon:'fa-solid fa-spa',                 label:'Spa'              },
  walking:     { color:'#242755', icon:'fa-solid fa-person-walking',      label:'Walking'          },
  workshop:    { color:'#d950de', icon:'fa-solid fa-comment-dots',        label:'Workshop'         },
  conference:  { color:'#b75214', icon:'fa-solid fa-chalkboard-user',    label:'Conference'       },


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
      {name:"Vienna",    lat:48.2082, lng:16.3738, type:"city",  desc:"Imperial capital of art, music, and coffeehouse culture.", imgs:["ep20","ep21","ep22","ep23", "ep24"]},
      {name:"Salzburg",  lat:47.8095, lng:13.0550, type:"culture", desc:"Birthplace of Mozart, baroque architecture and Alpine setting.", imgs:["salzburg_1","salzburg_2","salzburg_3","salzburg_4"]},
      {name:"Hafelekarspitze", lat:47.3162, lng:11.3996, type:"sightseeing",   desc:"High Alpine peak above Innsbruck, cable car access, sweeping views.", imgs:["ep1","ep2","ep3","ep4"]},
      {name:"Innsbruck", lat:47.2650, lng:11.3920, type:"city",   desc:"Tyrolean city nestled in Alps, colourful houses, imperial history, winter sports.", imgs:["ep5","ep6","ep7","ep8"]},
      {name:"Hallstatt", lat:47.5667, lng:13.6620, type:"walking",   desc:"Lakeside village with pastel houses, alpine views, and historic salt mines.", imgs:["ep9","ep10","ep11"]},
      {name:"Hallstatt", lat:47.5646, lng:13.6498, type:"village",   desc:"Lakeside village with pastel houses, alpine views, and historic salt mines.", imgs:["ep12","ep13","ep14", "ep15"]},
      {name:"Alpenzoo Innsbruck - Tirol", lat:47.2813, lng:11.3982, type:"zoo",   desc:"Alpine zoo showcasing mountain wildlife, perched above Innsbruck with views.", imgs:["ep17","ep18","ep19"]},

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
      {name:"Beijing Capital International Airport",  lat:40.0822, lng:116.6053, type:"airport",  desc:"Massive global hub with terminals, flights, shops, and bustling travellers.", imgs:["ep34"]},
      {name:"Shanghai", lat:31.2304, lng:121.4737, type:"city", desc:"Futuristic skyline meets colonial Bund architecture.", imgs:["ep29"]},
      {name:"Suzhou",    lat:31.3025, lng:120.5842, type:"culture", desc:"Ancient canal city famed for classical gardens, silk heritage, and bridges.", imgs:["ep30","ep31","ep32","ep33"]},
      {name:"C-SEASD Workshop",   lat:31.2749, lng:120.7380, type:"workshop", desc:"It was a two‑day academic workshop connecting China and Southeast Asia researchers to discuss sustainable development challenges.", imgs:["ep35","ep36","ep37", "ep84"]},
       {name:"Fuyong Subdistrict",   lat:22.6715, lng:113.8225, type:"area", desc:"Urban area in Shenzhen, China, known for its transport hubs and local communities.", imgs:["ep77","ep78","ep79"]},
    ]},

  { name:"Denmark", lat:56.0, lng:10.0, flag:"dk", desc:"Hygge lifestyle, Viking history, and modern Scandinavian design.",
    cities:[
      {name:"Copenhagen", lat:55.6761, lng:12.5683, type:"city",  desc:"Colorful Nyhavn, cycling culture, and world-class cuisine.", imgs:["ep38","ep39","ep40","ep41"]},
      {name:"Aalborg",     lat:57.0311, lng:9.9166, type:"culture", desc:"Historic Danish city known for vibrant culture, waterfronts, and modern architecture.", imgs:["ep42","ep43","ep44","ep45"]},
      {name:"6th Nordic Post-Keynesian Conference",     lat:57.0147, lng:9.9753, type:"conference", desc:"International economics conference gathering scholars to discuss Post-Keynesian theory and research.", imgs:["ep46","ep47","ep48"]},
    ]},


  { name:"Ethiopia", lat:9.5, lng:39.5, flag:"et", desc:"Ancient rock churches, coffee origins, and breathtaking highland landscapes.",
    cities:[
      {name:"Addis Ababa", lat:9.0320, lng:38.7469, type:"airport", desc:"Africa's diplomatic capital, high-altitude city with rich culture.", imgs:["addis_ababa_1","addis_ababa_2","addis_ababa_3","addis_ababa_4"]},
    ]},
  { name:"Fiji", lat:-17.5, lng:178.0, flag:"fj", desc:"Coral reefs, turquoise waters, and the warm tropical Bula spirit.",
    cities:[
      {name:"Suva", lat:-18.1416, lng:178.4419, type:"city", desc:"Capital city on the Pacific, vibrant market and cultural hub.", imgs:["suva_1","suva_2","suva_3","suva_4"]},
      {name:"Nadi", lat:-17.7765, lng:177.4356, type:"airport",   desc:"Gateway city with lush gardens and Mamanuca Islands access.", imgs:["nadi_1","nadi_2","nadi_3","nadi_4"]},
    ]},
  { name:"Finland", lat:62.0, lng:25.0, flag:"fi", desc:"A thousand lakes, Nordic saunas, and the magical Northern Lights.",
    cities:[
      {name:"Helsinki", lat:60.1699, lng:24.9384, type:"airport", desc:"Design capital on the Baltic, cathedral squares and saunas.", imgs:["helsinki_1","helsinki_2","helsinki_3","helsinki_4"]},
    ]},
  { name:"France", lat:46.5, lng:2.5, flag:"fr", desc:"Art, romance, cuisine, and iconic landmarks from coast to countryside.",
    cities:[
      {name:"Paris", lat:48.8566, lng:2.3522, type:"sightseeing", desc:"City of Light — Eiffel Tower, Louvre, and café terraces.", imgs:["ep74","ep75","ep76",]},
    ]},
  { name:"Germany", lat:51.0, lng:10.0, flag:"de", desc:"Castles, beer gardens, fairy-tale forests, and cutting-edge innovation.",
    cities:[
      {name:"Berlin",  lat:52.5200, lng:13.4050, type:"sightseeing",  desc:"Reunified capital, cutting-edge art and tumultuous history.", imgs:["berlin_1","berlin_2","berlin_3","berlin_4"]},
      {name:"Munich Central Station",  lat:48.1404, lng:11.5600, type:"train", desc:"Major Bavarian rail hub, bustling platforms, shops, and international connections.", imgs:["ep25","ep26","ep27"]},
      {name:"Hamburg", lat:53.5753, lng:10.0153, type:"culture", desc:"Great port city, Speicherstadt warehouse district.", imgs:["hamburg_1","hamburg_2","hamburg_3","hamburg_4"]},
    ]},

  { name:"India", lat:22.0, lng:79.0, flag:"in", desc:"A subcontinent of ancient temples, spice markets, and breathtaking diversity.",
    cities:[
      {name:"New Delhi",  lat:28.6139, lng:77.2090, type:"sightseeing",  desc:"Mughal forts, colonial boulevards, and vibrant bazaars.", imgs:["new_delhi_1","new_delhi_2","new_delhi_3","new_delhi_4"]},
      {name:"Mumbai",     lat:19.0760, lng:72.8777, type:"culture", desc:"Bollywood, colonial architecture, and the bustling Gateway of India.", imgs:["mumbai_1","mumbai_2","mumbai_3","mumbai_4"]},
    ]},
  { name:"Indonesia", lat:-3.0, lng:117.0, flag:"id", desc:"Thousands of islands, volcanoes, rainforests, and vibrant cultures.",
    cities:[
      {name:"Jakarta", lat:-6.2088, lng:106.8456, type:"beach", desc:"Sprawling megacity, melting pot of cultures and cuisines.", imgs:["ep49","ep50","ep51","ep52", "ep56"]},
      {name:"32nd ASEAS Conference", lat:-6.3605, lng:106.8272, type:"conference", desc:"International hybrid conference in Indonesia uniting scholars to discuss Southeast Asian studies and interdisciplinary research.", imgs:["ep53","ep54","ep55"]},
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
      {name:"Amstersdam Airport Schipol", lat:52.3180, lng:4.7486, type:"airport", desc:"Major Dutch airport hub with global connections, trains, shops, and lounges.", imgs:["ep28"]},
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
      {name:"Madrid",    lat:40.4168, lng:-3.7038, type:"city",  desc:"Royal Palace, Prado Museum, and vibrant nightlife.", imgs:["ep68","ep69","ep70","ep71", "ep72", "ep73"]},
      {name:"Barcelona", lat:41.3851, lng:2.1734,  type:"culture", desc:"Gaudí's Sagrada Família, Gothic Quarter and La Rambla.", imgs:["ep57","ep58","ep59","ep60", "ep61", "ep67"]},
      {name:"Mercat de la Boqueria", lat:41.3818, lng:2.1715,  type:"shop", desc:"Famous Barcelona market offering fresh food, vibrant stalls, and local delicacies..", imgs:["ep62","ep63","ep64","ep65", "ep66"]},

    ]},
  { name:"Sweden", lat:62.0, lng:15.0, flag:"se", desc:"Archipelagos, minimalist design, and the magic of endless summer light.",
    cities:[
      {name:"Stockholm", lat:59.3293, lng:18.0686, type:"sightseeing", desc:"Venice of the North — islands, Viking history and design.", imgs:["ep80","ep81","ep82","ep83"]},
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
   { name:"Uganda", lat:1.4, lng:32.3, flag:"ug", desc:"Source of the Nile, home to gorillas, forests, and savannahs.",
    cities:[
      {name:"Dubai",     lat:25.2048, lng:55.2708, type:"culture", desc:"Burj Khalifa, gold souks, and desert safaris meet the future.", imgs:["dubai_1","dubai_2","dubai_3","dubai_4"]},
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
  const n = city.imgs.length;

  /* ── photo count → layout modifier class ── */
  let layoutClass;
  if      (n === 1)  layoutClass = 'tm-photos--1';
  else if (n === 2)  layoutClass = 'tm-photos--2';
  else if (n === 3)  layoutClass = 'tm-photos--3';
  else if (n === 4)  layoutClass = 'tm-photos--4';
  else if (n <= 6)   layoutClass = 'tm-photos--5-6';
  else if (n <= 9)   layoutClass = 'tm-photos--7-9';
  else               layoutClass = 'tm-photos--10plus';

  /* For 7+ photos show first 6 visible tiles + a "+N more" overlay on the last */
  const visibleImgs = n <= 6 ? city.imgs : city.imgs.slice(0, 6);
  const extraCount  = n > 6 ? n - 5 : 0;  /* tiles 1-5 shown normally, tile 6 = overflow */

  const photos = visibleImgs.map((name, i) => {
    const isOverflowTile = extraCount > 0 && i === 5;
    const overlay = isOverflowTile
      ? `<div class="tm-ph-more">+${extraCount}</div>`
      : `<div class="tm-zoom-hint"><i class="fa-solid fa-expand"></i> View</div>`;
    /* For the overflow tile the data-idx still opens the full lightbox from img 5 */
    return `
    <div class="tm-ph" data-idx="${i}">
      <img src="${tmThumb(name)}" alt="" loading="lazy"
           onerror="this.src='${tmFull(name)}';this.onerror=null;">
      ${overlay}
    </div>`;
  }).join('');

  const locLabel = country.cities.length > 1 ? 'location' : 'city';
  const wiki = `https://en.wikipedia.org/wiki/${encodeURIComponent(city.name)}`;

  /* Photo count badge — only for 2+ */
  const photoBadge = n > 1
    ? `<span class="tm-photo-count"><i class="fa-solid fa-images"></i> ${n}</span>`
    : '';

  return `
    <div class="tm-popup-body">
      <div class="tm-popup-photos ${layoutClass}">${photos}${photoBadge}</div>
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
              /* overflow tile (last visible when >6 photos) opens at idx 5 */
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

/* ══════════════════════════════════════════════════════════════
   VIEW TOGGLE — Map ↔ Gallery
══════════════════════════════════════════════════════════════ */
(function tmViewToggle() {
  const btnMap     = document.getElementById('tm-btn-map');
  const btnGallery = document.getElementById('tm-btn-gallery');
  const mapShell   = document.getElementById('tm-shell');
  const galleryEl  = document.getElementById('tm-gallery-view');
  if (!btnMap || !btnGallery || !mapShell || !galleryEl) return;

  function tmSidebarsVisible(show) {
    ['tm-gs-left','tm-gs-right'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('tm-gs--visible', show);
    });
  }

  function showMap() {
    mapShell.style.display  = '';
    galleryEl.style.display = 'none';
    galleryEl.setAttribute('aria-hidden', 'true');
    galleryEl.classList.remove('tm-gallery--active');
    tmSidebarsVisible(false);
    btnMap.classList.add('tm-view-btn--active');
    btnMap.setAttribute('aria-pressed', 'true');
    btnGallery.classList.remove('tm-view-btn--active');
    btnGallery.setAttribute('aria-pressed', 'false');
    setTimeout(() => tmMap.invalidateSize(), 50);
  }

  function showGallery() {
    mapShell.style.display  = 'none';
    galleryEl.style.display = 'block';
    galleryEl.setAttribute('aria-hidden', 'false');
    galleryEl.classList.add('tm-gallery--active');
    tmSidebarsVisible(true);
    btnGallery.classList.add('tm-view-btn--active');
    btnGallery.setAttribute('aria-pressed', 'true');
    btnMap.classList.remove('tm-view-btn--active');
    btnMap.setAttribute('aria-pressed', 'false');
    tmRenderGallery();
  }

  btnMap.addEventListener('click', showMap);
  btnGallery.addEventListener('click', showGallery);
})();

/* ══════════════════════════════════════════════════════════════
   GALLERY SIDEBAR TOGGLES
══════════════════════════════════════════════════════════════ */
(function tmSidebarToggles() {
  function initSidebar(sidebarId, toggleId, panelId, chevronId, collapseClass) {
    const sidebar  = document.getElementById(sidebarId);
    const toggle   = document.getElementById(toggleId);
    const chevron  = document.getElementById(chevronId);
    if (!sidebar || !toggle) return;

    /* Start collapsed */
    sidebar.classList.add(collapseClass);

    toggle.addEventListener('click', () => {
      const isCollapsed = sidebar.classList.toggle(collapseClass);
      if (chevron) chevron.style.transform = isCollapsed ? '' : 'rotate(180deg)';
    });
  }

  initSidebar('tm-gs-left',  'tm-gs-left-toggle',  'tm-gs-left-panel',  'tm-gs-left-chevron',  'tm-gs--collapsed');
  initSidebar('tm-gs-right', 'tm-gs-right-toggle', 'tm-gs-right-panel', 'tm-gs-right-chevron', 'tm-gs--collapsed');
})();

/* ══════════════════════════════════════════════════════════════
   GALLERY — search + filter state
══════════════════════════════════════════════════════════════ */
let tmGalleryQuery      = '';
let tmGalleryCountries  = new Set();   /* multi-select */
let tmGalleryTypes      = new Set();   /* multi-select */

function tmUpdateFilterBadge(id, set) {
  const badge = document.getElementById(id);
  if (!badge) return;
  const n = set.size;
  badge.textContent = n ? n : '';
  badge.classList.toggle('tm-gs-badge--on', n > 0);
}

/* ── Build filter chips once ── */
function tmBuildGalleryFilters() {

  /* ── Country chips ── */
  const countryChips = document.getElementById('tm-gf-countries');
  if (countryChips) {
    tmCountries.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'tm-gf-chip';
      btn.dataset.value = c.name;
      btn.innerHTML = `
        <div class="tm-gf-flag-wrap"><span class="fi fi-${c.flag}"></span></div>
        <span class="tm-gf-chip-label">${c.name}</span>`;
      btn.addEventListener('click', () => {
        if (tmGalleryCountries.has(c.name)) tmGalleryCountries.delete(c.name);
        else tmGalleryCountries.add(c.name);
        btn.classList.toggle('tm-gf-chip--on', tmGalleryCountries.has(c.name));
        tmUpdateFilterBadge('tm-gf-country-badge', tmGalleryCountries);
        tmRenderGallery();
      });
      countryChips.appendChild(btn);
    });
  }

  /* ── Type chips ── */
  const usedTypes = new Set();
  tmCountries.forEach(c => c.cities.forEach(city => usedTypes.add(city.type || 'default')));
  const typeChips = document.getElementById('tm-gf-types');
  if (typeChips) {
    Object.entries(tmPinTypes).forEach(([key, t]) => {
      if (!usedTypes.has(key) || key === 'default') return;
      const btn = document.createElement('button');
      btn.className = 'tm-gf-chip';
      btn.dataset.value = key;
      btn.innerHTML = `
        <div class="tm-gf-icon-circle" style="background:${t.color}">
          <i class="${t.icon}"></i>
        </div>
        <span class="tm-gf-chip-label">${t.label}</span>`;
      btn.addEventListener('click', () => {
        if (tmGalleryTypes.has(key)) tmGalleryTypes.delete(key);
        else tmGalleryTypes.add(key);
        btn.classList.toggle('tm-gf-chip--on', tmGalleryTypes.has(key));
        tmUpdateFilterBadge('tm-gf-type-badge', tmGalleryTypes);
        tmRenderGallery();
      });
      typeChips.appendChild(btn);
    });
  }

  /* ── Footer reset buttons ── */
  document.getElementById('tm-gf-country-reset')?.addEventListener('click', () => {
    tmGalleryCountries.clear();
    countryChips?.querySelectorAll('.tm-gf-chip').forEach(b => b.classList.remove('tm-gf-chip--on'));
    tmUpdateFilterBadge('tm-gf-country-badge', tmGalleryCountries);
    tmRenderGallery();
  });
  document.getElementById('tm-gf-type-reset')?.addEventListener('click', () => {
    tmGalleryTypes.clear();
    typeChips?.querySelectorAll('.tm-gf-chip').forEach(b => b.classList.remove('tm-gf-chip--on'));
    tmUpdateFilterBadge('tm-gf-type-badge', tmGalleryTypes);
    tmRenderGallery();
  });

  /* ── Search ── */
  const inp = document.getElementById('tm-gallery-search');
  const clearBtn = document.getElementById('tm-gallery-search-clear');
  if (inp) {
    inp.addEventListener('input', e => {
      tmGalleryQuery = e.target.value;
      if (clearBtn) clearBtn.style.display = tmGalleryQuery ? 'flex' : 'none';
      tmRenderGallery();
    });
  }
  if (clearBtn) {
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', () => {
      if (inp) inp.value = '';
      tmGalleryQuery = '';
      clearBtn.style.display = 'none';
      tmRenderGallery();
    });
  }

  /* ── Clear all ── */
  document.getElementById('tm-gallery-clear-all')?.addEventListener('click', () => {
    tmGalleryQuery = '';
    tmGalleryCountries.clear();
    tmGalleryTypes.clear();
    if (inp) inp.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    document.querySelectorAll('.tm-gf-chip').forEach(b => b.classList.remove('tm-gf-chip--on'));
    tmUpdateFilterBadge('tm-gf-country-badge', tmGalleryCountries);
    tmUpdateFilterBadge('tm-gf-type-badge', tmGalleryTypes);
    tmRenderGallery();
  });
}

/* ══════════════════════════════════════════════════════════════
   GALLERY RENDERER
══════════════════════════════════════════════════════════════ */
function tmRenderGallery() {
  const container = document.getElementById('tm-gallery-countries');
  const activeBar = document.getElementById('tm-gallery-active-bar');
  const countEl   = document.getElementById('tm-gallery-result-count');
  if (!container) return;
  container.innerHTML = '';

  const q = tmGalleryQuery.toLowerCase().trim();

  /* Filter countries + cities */
  let totalCards = 0;
  const sections = [];

  tmCountries.forEach(country => {
    /* Country filter — show if none selected OR country is in set */
    if (tmGalleryCountries.size > 0 && !tmGalleryCountries.has(country.name)) return;

    /* Filter cities */
    const matchingCities = country.cities.filter(city => {
      const matchesType   = tmGalleryTypes.size === 0 || tmGalleryTypes.has(city.type);
      const matchesSearch = !q ||
        country.name.toLowerCase().includes(q) ||
        city.name.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });

    if (matchingCities.length > 0) {
      sections.push({ country, cities: matchingCities });
      totalCards += matchingCities.length;
    }
  });

  /* Active bar */
  const hasFilter = q || tmGalleryCountries.size > 0 || tmGalleryTypes.size > 0;
  if (activeBar) {
    activeBar.style.display = hasFilter ? 'flex' : 'none';
    if (countEl) countEl.textContent = `${totalCards} location${totalCards !== 1 ? 's' : ''} found`;
  }

  if (sections.length === 0) {
    container.innerHTML = '<p class="tm-gallery-empty"><i class="fa-solid fa-magnifying-glass"></i><br>No locations match your filters.</p>';
    return;
  }

  sections.forEach(({ country, cities }) => {
    const section = document.createElement('div');
    section.className = 'tm-gc-section';

    const header = document.createElement('div');
    header.className = 'tm-gc-country-header';
    header.innerHTML = `
      <span class="tm-gc-flag fi fi-${country.flag}"></span>
      <h3 class="tm-gc-country-name">${country.name}</h3>
      <span class="tm-gc-country-desc">${country.desc}</span>`;
    section.appendChild(header);

    const locGrid = document.createElement('div');
    locGrid.className = 'tm-gc-locations';

    cities.forEach(city => {
      const t = tmPinTypes[city.type] || tmPinTypes.default;
      const fullSrcs = city.imgs.map(name => tmFull(name));
      const n = city.imgs.length;

      const card = document.createElement('div');
      card.className = 'tm-gc-card';

      const photoGrid = document.createElement('div');
      photoGrid.className = 'tm-gc-photo-wrap';
      photoGrid.innerHTML = tmGalleryPhotoGrid(city.imgs);

      if (n > 1) {
        const badge = document.createElement('span');
        badge.className = 'tm-gc-photo-count';
        badge.innerHTML = `<i class="fa-solid fa-images"></i> ${n}`;
        photoGrid.querySelector('.tm-gc-photos').appendChild(badge);
      }

      const info = document.createElement('div');
      info.className = 'tm-gc-info';
      info.innerHTML = `
        <div class="tm-gc-type-badge" style="color:${t.color};background:${t.color}14;border-color:${t.color}30">
          <i class="${t.icon}"></i> ${t.label}
        </div>
        <button class="tm-gc-loc-name" data-lat="${city.lat}" data-lng="${city.lng}" title="View on map">
          ${city.name} <i class="fa-solid fa-map-location-dot"></i>
        </button>
        <p class="tm-gc-loc-desc">${city.desc}</p>`;

      card.appendChild(photoGrid);
      card.appendChild(info);

      card.querySelectorAll('.tm-gc-ph').forEach(ph => {
        ph.style.cursor = 'zoom-in';
        ph.addEventListener('click', function(e) {
          e.stopPropagation();
          tmOpenLb(fullSrcs, parseInt(this.dataset.idx) || 0, city.name);
        });
      });

      card.querySelector('.tm-gc-loc-name').addEventListener('click', function() {
        const lat = parseFloat(this.dataset.lat);
        const lng  = parseFloat(this.dataset.lng);
        document.getElementById('tm-btn-map').click();
        setTimeout(() => {
          tmMap.flyTo([lat, lng], 14, { duration: 1.4 });
          setTimeout(() => {
            tmAllMarkers.forEach(({ marker }) => {
              const pos = marker.getLatLng();
              if (Math.abs(pos.lat - lat) < 0.001 && Math.abs(pos.lng - lng) < 0.001) {
                marker.openPopup();
              }
            });
          }, 1500);
        }, 100);
      });

      locGrid.appendChild(card);
    });

    section.appendChild(locGrid);
    container.appendChild(section);
  });
}

/* Init filters once */
tmBuildGalleryFilters();
function tmGalleryPhotoGrid(imgs) {
  const n = imgs.length;
  const th = name => `static/img/explore/thumbs/${name}.jpg`;

  /* ── 1 photo: single full-width hero ── */
  if (n === 1) {
    return `<div class="tm-gc-photos tm-gc-photos--1">
      <div class="tm-gc-ph" data-idx="0">
        <img src="${th(imgs[0])}" loading="lazy" alt="" onerror="this.src='${tmFull(imgs[0])}'">
      </div>
    </div>`;
  }

  /* ── 2 photos: equal columns ── */
  if (n === 2) {
    return `<div class="tm-gc-photos tm-gc-photos--2">
      <div class="tm-gc-ph" data-idx="0"><img src="${th(imgs[0])}" loading="lazy" alt="" onerror="this.src='${tmFull(imgs[0])}'"></div>
      <div class="tm-gc-ph" data-idx="1"><img src="${th(imgs[1])}" loading="lazy" alt="" onerror="this.src='${tmFull(imgs[1])}'"></div>
    </div>`;
  }

  /* ── 3 photos: hero left + 2 stacked right ── */
  if (n === 3) {
    return `<div class="tm-gc-photos tm-gc-photos--3">
      <div class="tm-gc-ph" data-idx="0"><img src="${th(imgs[0])}" loading="lazy" alt="" onerror="this.src='${tmFull(imgs[0])}'"></div>
      <div class="tm-gc-ph" data-idx="1"><img src="${th(imgs[1])}" loading="lazy" alt="" onerror="this.src='${tmFull(imgs[1])}'"></div>
      <div class="tm-gc-ph" data-idx="2"><img src="${th(imgs[2])}" loading="lazy" alt="" onerror="this.src='${tmFull(imgs[2])}'"></div>
    </div>`;
  }

  /* ── 4 photos: 2×2 grid ── */
  if (n === 4) {
    return `<div class="tm-gc-photos tm-gc-photos--4">
      <div class="tm-gc-ph" data-idx="0"><img src="${th(imgs[0])}" loading="lazy" alt="" onerror="this.src='${tmFull(imgs[0])}'"></div>
      <div class="tm-gc-ph" data-idx="1"><img src="${th(imgs[1])}" loading="lazy" alt="" onerror="this.src='${tmFull(imgs[1])}'"></div>
      <div class="tm-gc-ph" data-idx="2"><img src="${th(imgs[2])}" loading="lazy" alt="" onerror="this.src='${tmFull(imgs[2])}'"></div>
      <div class="tm-gc-ph" data-idx="3"><img src="${th(imgs[3])}" loading="lazy" alt="" onerror="this.src='${tmFull(imgs[3])}'"></div>
    </div>`;
  }

  /* ── 5+ photos: hero top full-width + 4 equal thumbs below, last = +N ── */
  const extra = n - 5;
  const tiles = imgs.slice(1, 5).map((name, i) => {
    const isOverflow = extra > 0 && i === 3;
    return `<div class="tm-gc-ph" data-idx="${i + 1}">
      <img src="${th(name)}" loading="lazy" alt="" onerror="this.src='${tmFull(name)}'">
      ${isOverflow ? `<div class="tm-gc-more">+${extra + 1}</div>` : ''}
    </div>`;
  }).join('');

  return `<div class="tm-gc-photos tm-gc-photos--5plus">
    <div class="tm-gc-ph tm-gc-ph--hero" data-idx="0">
      <img src="${th(imgs[0])}" loading="lazy" alt="" onerror="this.src='${tmFull(imgs[0])}'">
    </div>
    <div class="tm-gc-ph-strip">${tiles}</div>
  </div>`;
}


})(); /* end IIFE */
