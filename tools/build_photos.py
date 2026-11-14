#!/usr/bin/env python3
"""
build_photos.py — auto-place travel photos on the map.

Drop photos into  static/img/explore/  then run:   python tools/build_photos.py

For every photo it:
  1. reads the GPS position from the photo's EXIF data,
  2. finds the nearest town + the country OFFLINE (GeoNames via `reverse_geocoder`
     — free, no API key, no limits),
  3. names each place + writes a description from the nearest Wikipedia article (free, needs internet;
     skip with --no-wiki), and guesses the pin type (mountain, museum, zoo, airport ...),
  3b. groups photos taken close together into one place,
  4. writes static/js/travel_data_auto.js, which travel_map.js merges into the map + gallery.

Setup (once):   pip install pillow reverse_geocoder pycountry
Thumbnails + HEIC/DNG conversion are handled by generate_thumbs.py, which runs this script at the end.

Photos with no GPS are listed at the end — give them coordinates in
tools/photo_overrides.json (see README text at the bottom of this file).
"""
import argparse, json, math, re, sys, time, urllib.parse, urllib.request
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageOps

try:
    import pillow_heif; pillow_heif.register_heif_opener()
except Exception:
    pass
try:
    import reverse_geocoder as rg
    import pycountry
except ImportError:
    sys.exit("Missing packages. Run:  pip install pillow reverse_geocoder pycountry")

ROOT      = Path(__file__).resolve().parent.parent
PHOTO_DIR = ROOT / "static" / "img" / "explore"
OUT_JS    = ROOT / "static" / "js" / "travel_data_auto.js"
OVERRIDES = Path(__file__).resolve().parent / "photo_overrides.json"
CACHE     = Path(__file__).resolve().parent / "photo_gps_cache.json"   # remembers GPS if you later --strip-gps
EXTS      = {".jpg", ".jpeg", ".png", ".webp"}   # .heic/.dng are converted to .jpg by generate_thumbs.py first
GPS_IFD, EXIF_IFD = 0x8825, 0x8769

# ── EXIF helpers ────────────────────────────────────────────────
def _deg(dms, ref):
    d, m, s = (float(x) for x in dms)
    v = d + m / 60 + s / 3600
    return -v if ref in ("S", "W") else v

def read_exif(path):
    """-> (lat, lng, datetime|None); lat/lng None if the photo has no GPS."""
    try:
        with Image.open(path) as im:
            ex = im.getexif()
            gps = ex.get_ifd(GPS_IFD)
            when = ex.get_ifd(EXIF_IFD).get(36867) or ex.get(306)
    except Exception:
        return None, None, None
    dt = None
    if when:
        try: dt = datetime.strptime(str(when)[:19], "%Y:%m:%d %H:%M:%S")
        except ValueError: pass
    try:
        lat = _deg(gps[2], gps[1]); lng = _deg(gps[4], gps[3])
        if abs(lat) < 1e-6 and abs(lng) < 1e-6:      # 0,0 = "no fix"
            return None, None, dt
        return lat, lng, dt
    except Exception:
        return None, None, dt

def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2-la1)/2)**2 + math.cos(la1)*math.cos(la2)*math.sin((lo2-lo1)/2)**2
    return 12742 * math.asin(math.sqrt(h))

def country_name(cc):
    c = pycountry.countries.get(alpha_2=cc)
    if not c: return cc
    return getattr(c, "common_name", None) or c.name


# ── Auto title / description / type from Wikipedia (free, no API key) ──────────
WIKI_CACHE = Path(__file__).resolve().parent / "place_cache.json"
UA = "kosalnith-travelmap/1.0 (https://kosalnith.github.io; personal travel map)"

def _get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.load(r)

def _short(text, limit=200):
    """first 1–2 sentences, pronunciations/brackets removed, <= limit chars"""
    text = re.sub(r"\s*\([^)]*\)", "", text or "")
    text = re.sub(r"\s+", " ", text).strip()
    sents = re.split(r"(?<=[.!?])\s+(?=[A-Z])", text)
    out = sents[0] if sents else text
    if len(sents) > 1 and len(out) + len(sents[1]) + 1 <= limit:
        out += " " + sents[1]
    return out if len(out) <= limit else out[:limit].rsplit(" ", 1)[0].rstrip(",;:") + "…"

# ordered: first match wins. Types must exist in tmPinTypes (travel_map.js).
TYPE_RULES = [
    (r"\bairport\b", "airport"), (r"railway station|train station|metro station|\bstation\b", "train"),
    (r"\bzoo\b|safari park|aquarium", "zoo"), (r"waterfall", "waterfall"), (r"hot spring|onsen|thermal bath", "hotspring"),
    (r"\bbeach\b|\bcoast\b|\bisland\b|\bbay\b", "beach"), (r"\blake\b|\breservoir\b", "lake"),
    (r"museum|gallery", "museum"), (r"university|college|\bschool\b", "university"),
    (r"national park|nature reserve|\bpark\b|garden|botanical", "park"),
    (r"temple|pagoda|shrine|mosque|cathedral|church|monastery|palace|castle|fortress|monument|memorial|square|tower|bridge|mountain|peak|summit|viewpoint|\bhill\b|ruins|heritage", "sightseeing"),
    (r"\bvillage\b|\bhamlet\b", "village"), (r"\bmarket\b|shopping|\bmall\b", "shop"),
    (r"restaurant", "restaurant"), (r"\bcafe\b|café", "cafe"), (r"\bhotel\b", "hotel"),
    (r"\bcity\b|capital|municipality|metropolis|\btown\b", "city"),
]
def guess_type(text):
    t = (text or "").lower()
    for rx, typ in TYPE_RULES:
        if re.search(rx, t): return typ
    return "photospot"

def wiki_place(lat, lng, radius, lang, cache, offline=False):
    """Nearest Wikipedia article within `radius` m -> {title, desc, type} or None."""
    key = f"{lang}:{lat:.3f},{lng:.3f}:{radius}"
    if key in cache: return cache[key]
    if offline: return None
    try:
        q = urllib.parse.urlencode({"action": "query", "list": "geosearch", "format": "json",
                                    "gscoord": f"{lat}|{lng}", "gsradius": radius, "gslimit": 8})
        hits = _get_json(f"https://{lang}.wikipedia.org/w/api.php?{q}").get("query", {}).get("geosearch", [])
        for h in hits:                                    # nearest first
            time.sleep(0.15)
            sm = _get_json(f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/"
                           + urllib.parse.quote(h["title"].replace(" ", "_"), safe=""))
            if sm.get("type") != "standard" or len(sm.get("extract", "")) < 40: continue
            res = {"title": sm["title"], "desc": _short(sm["extract"]),
                   "type": guess_type((sm.get("description", "") + " " + sm["extract"][:300]))}
            cache[key] = res
            return res
        cache[key] = None                                 # looked, nothing nearby — remember that too
    except Exception as e:                                # network down etc. — don't cache, just fall back
        print(f"   (wiki lookup skipped: {e.__class__.__name__})")
    return None


def write_js(countries, existing):
    OUT_JS.parent.mkdir(parents=True, exist_ok=True)
    OUT_JS.write_text(
        "/* AUTO-GENERATED by tools/build_photos.py — do not edit by hand */\n"
        "/* photos that really exist in static/img/explore (places without any are hidden on the site) */\n"
        "window.TM_EXISTING_IMGS = " + json.dumps(existing, ensure_ascii=False) + ";\n"
        "window.TM_AUTO_COUNTRIES = " + json.dumps(countries, ensure_ascii=False, indent=1) + ";\n", "utf-8")


# ── main ────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--radius", type=float, default=3.0,
                    help="km — photos closer than this become one place (default 3)")
    ap.add_argument("--no-wiki", action="store_true", help="don't look up titles/descriptions on Wikipedia")
    ap.add_argument("--wiki-radius", type=int, default=500, help="metres — nearest Wikipedia article within this distance names the place (default 500)")
    ap.add_argument("--wiki-lang", default="en", help="Wikipedia language for titles/descriptions (default en)")
    ap.add_argument("--strip-gps", action="store_true",
                    help="ALSO remove GPS/EXIF from the full-size photos (recommended for a public site)")
    args = ap.parse_args()

    ov = json.loads(OVERRIDES.read_text("utf-8")) if OVERRIDES.exists() else {}
    ignore, manual_pos, place_ov = set(ov.get("ignore", [])), ov.get("photos", {}), ov.get("places", {})

    cache = json.loads(CACHE.read_text("utf-8")) if CACHE.exists() else {}
    files = sorted(p for p in PHOTO_DIR.iterdir() if p.suffix.lower() in EXTS and p.is_file())

    photos, no_gps = [], []
    for f in files:
        name = f.stem
        if name in ignore: continue
        lat, lng, dt = read_exif(f)
        if lat is not None:
            cache[name] = {"lat": round(lat, 5), "lng": round(lng, 5), "dt": dt.isoformat() if dt else None}
        elif name in cache:                      # GPS was stripped earlier — use the remembered position
            lat, lng = cache[name]["lat"], cache[name]["lng"]
            dt = datetime.fromisoformat(cache[name]["dt"]) if cache[name].get("dt") else None
        if name in manual_pos:
            lat, lng = manual_pos[name]["lat"], manual_pos[name]["lng"]
        if lat is None:
            no_gps.append(f.name); continue
        photos.append(dict(name=name, file=f, lat=lat, lng=lng,
                           dt=dt or datetime.fromtimestamp(f.stat().st_mtime)))

    existing = sorted(f.stem for f in files if f.suffix == ".jpg")     # the site loads <name>.jpg
    if not photos:
        write_js([], existing)
        print("No photos with GPS found in " + str(PHOTO_DIR) + " (existing-photo list still updated).")
        if no_gps: print("   no GPS: " + ", ".join(no_gps))
        return

    # offline reverse-geocode (one batch call, fast)
    hits = rg.search([(p["lat"], p["lng"]) for p in photos], mode=1)
    for p, h in zip(photos, hits):
        p["cc"], p["town"] = h["cc"], h["name"]

    # cluster: same country + within --radius km of an existing place's centre
    photos.sort(key=lambda p: p["dt"])
    clusters = []
    for p in photos:
        for c in clusters:
            if c["cc"] == p["cc"] and km((c["lat"], c["lng"]), (p["lat"], p["lng"])) <= args.radius:
                c["photos"].append(p)
                c["lat"] = sum(x["lat"] for x in c["photos"]) / len(c["photos"])
                c["lng"] = sum(x["lng"] for x in c["photos"]) / len(c["photos"])
                break
        else:
            clusters.append(dict(cc=p["cc"], lat=p["lat"], lng=p["lng"], photos=[p]))

    # group clusters by country  (title / description / type: overrides > Wikipedia > plain fallback)
    wcache = json.loads(WIKI_CACHE.read_text("utf-8")) if WIKI_CACHE.exists() else {}
    by_cc = {}
    for c in clusters:
        towns = [x["town"] for x in c["photos"]]
        town  = max(set(towns), key=towns.count)
        cname = country_name(c["cc"])
        w = None if args.no_wiki else wiki_place(c["lat"], c["lng"], args.wiki_radius, args.wiki_lang, wcache)
        auto_name = (w or {}).get("title", town)
        o = place_ov.get(f"{cname}/{auto_name}") or place_ov.get(f"{cname}/{town}") or {}
        name = o.get("name", auto_name)
        by_cc.setdefault(c["cc"], []).append({
            "name": name,
            "lat": round(c["lat"], 4), "lng": round(c["lng"], 4),
            "type": o.get("type", (w or {}).get("type", "photospot")),
            "desc": o.get("desc", (w or {}).get("desc", f"Photos from {name}, {cname}.")),
            "imgs": [x["name"] for x in c["photos"]],
        })
    WIKI_CACHE.write_text(json.dumps(wcache, ensure_ascii=False, indent=1), "utf-8")

    countries = []
    for cc, cities in sorted(by_cc.items(), key=lambda kv: country_name(kv[0])):
        cname = country_name(cc)
        co = ov.get("countries", {}).get(cname, {})
        countries.append({
            "name": cname, "flag": cc.lower(),
            "lat": round(sum(c["lat"] for c in cities) / len(cities), 2),
            "lng": round(sum(c["lng"] for c in cities) / len(cities), 2),
            "desc": co.get("desc", f"Photos from {cname}."),
            "cities": sorted(cities, key=lambda c: c["name"]),
        })

    write_js(countries, existing)

    CACHE.write_text(json.dumps(cache, indent=1), "utf-8")
    if args.strip_gps:
        for p in photos:
            with Image.open(p["file"]) as im:
                im.load()
                clean = ImageOps.exif_transpose(im)
                fmt = "JPEG" if p["file"].suffix.lower() in (".jpg", ".jpeg") else im.format
                if fmt == "JPEG": clean = clean.convert("RGB")
                clean.save(p["file"], fmt, quality=95) if fmt == "JPEG" else clean.save(p["file"], fmt)

    n_places = sum(len(c["cities"]) for c in countries)
    print(f"✓ {len(photos)} photos → {n_places} places in {len(countries)} countries → {OUT_JS.relative_to(ROOT)}")
    for c in countries:
        print(f"   {c['name']}: " + ", ".join(f"{x['name']} ({len(x['imgs'])})" for x in c["cities"]))
    if no_gps:
        print(f"\n⚠ {len(no_gps)} photo(s) have no GPS and were skipped:\n   " + ", ".join(no_gps))
        print("  Add them to tools/photo_overrides.json → \"photos\": {\"name\": {\"lat\":…, \"lng\":…}}")

if __name__ == "__main__":
    main()

# ──────────────────────────────────────────────────────────────
# tools/photo_overrides.json  (all keys optional)
# {
#   "ignore":    ["ep55", "home_selfie"],                       # never show these photos
#   "photos":    { "ep60": {"lat": 47.26, "lng": 11.39} },      # photos that have no GPS
#   "places":    { "Austria/Absam": {"name": "Hafelekarspitze",
#                                    "type": "sightseeing",
#                                    "desc": "High Alpine peak above Innsbruck."} },
#   "countries": { "Austria": {"desc": "Alpine majesty, classical music…"} }
# }
# "places" keys are  "<Country>/<auto-detected name>"  exactly as printed by the script.
