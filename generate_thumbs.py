#!/usr/bin/env python3
"""
generate_thumbs.py
──────────────────
1. Converts .heic / .HEIC to high‑quality .jpg (using pillow-heif).
2. Converts .dng / .DNG to high‑quality .jpg (using sips on macOS or ImageMagick).
3. Generates compressed thumbnails (800×560px, quality 72) for every
   .jpg / .jpeg / .png / .webp into static/img/explore/thumbs/.
   **Skips thumbnails that already exist** (use --force-thumbs to regenerate all).
4. Reads each photo's GPS and writes static/js/travel_data_auto.js (country + place
   auto-detected) by running tools/build_photos.py. Skip with --no-locations.
5. WORK PAGE (static/img/work/): converts HEIC/DNG there too, makes thumbnails in
   static/img/work/thumbs/, and keeps static/js/work_photos.js up to date:
   every photo in the folder is listed there, NEW photos go to the TOP (newest first), and
   each photo's title can be edited in that file (work.html reads it).

Requirements:
    pip install Pillow pillow-heif reverse_geocoder pycountry
    (optional) ImageMagick if not on macOS

Usage:
    python generate_thumbs.py
    python generate_thumbs.py --force-conversion       # reconvert HEIC/DNG to JPG (overwrite)
    python generate_thumbs.py --force-thumbs           # regenerate all thumbnails (overwrite)
    python generate_thumbs.py --clean-old-thumbs       # delete old name_s.jpg thumbnails in static/img/work
"""

import argparse
import html as htmllib
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
import shutil

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow not installed.\nRun: pip install Pillow")

# ── HEIC support (optional) ─────────────────────────────────────
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIC_SUPPORT = True
except ImportError:
    HEIC_SUPPORT = False
    print("⚠️  pillow-heif not installed. HEIC files will be ignored.\n"
          "   Install with: pip install pillow-heif", file=sys.stderr)

# ── Configuration ────────────────────────────────────────────────
SOURCE_DIR   = Path("static/img/explore")
THUMBS_DIR   = SOURCE_DIR / "thumbs"
MAX_SIZE     = (800, 560)                 # thumbnail max dimensions
THUMB_QUALITY = 72                        # thumbnail JPEG quality
HEIC_JPG_QUALITY = 100                    # maximum quality for HEIC→JPG
HEIC_SUBSAMPLING = 0                      # 0 = 4:4:4 (no chroma subsampling)
DNG_JPG_QUALITY = 100                     # quality for DNG→JPG (used by ImageMagick)
EXTENSIONS   = {".jpg", ".jpeg", ".png", ".webp"}  # for thumbnails
WORK_DIR     = Path("static/img/work")    # photos shown on work.html
WORK_THUMBS  = WORK_DIR / "thumbs"        # their small versions
WORK_JSON    = Path("static/js/work_photos.js")   # list + titles + order (edit titles here)
WORK_JSON_OLD = [Path("tools/work_photos.js"), Path("static/tools/work_photos.js"), Path("static/tools/work_photos.json"), Path("static/data/work_photos.json")]   # older locations — imported once
WORK_HTML    = Path("work.html")          # only read once, to import your existing cards
WORK_THUMB_SIZE = (1000, 2000)            # work thumbnails are 1000px wide (also for portrait photos) so the uniform crop stays sharp
WORK_THUMB_QUALITY = 75
# ─────────────────────────────────────────────────────────────────


def convert_heic_to_jpg(heic_path: Path, jpg_path: Path, quality: int, subsampling: int) -> bool:
    """Convert HEIC to high‑quality JPG using pillow-heif."""
    try:
        with Image.open(heic_path) as img:
            img = ImageOps.exif_transpose(img)          # also resets the orientation tag
            exif = img.getexif()                        # keep EXIF (GPS + date) so photos can be auto-located
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            img.save(jpg_path, "JPEG", quality=quality, subsampling=subsampling, optimize=False, exif=exif)
        return True
    except Exception as e:
        print(f"    ERROR (HEIC): {e}")
        return False


def convert_dng_to_jpg(dng_path: Path, jpg_path: Path, quality: int) -> bool:
    """
    Convert DNG to high‑quality JPG using sips (macOS) or ImageMagick (convert).
    Returns True on success.
    """
    # Try sips (built‑in on macOS)
    sips_path = shutil.which("sips")
    if sips_path:
        try:
            subprocess.run(
                [sips_path, "-s", "format", "jpeg", "--out", str(jpg_path), str(dng_path)],
                check=True, capture_output=True, text=True
            )
            return True
        except subprocess.CalledProcessError as e:
            print(f"    sips error: {e.stderr}")
            return False

    # Fallback to ImageMagick's convert
    convert_path = shutil.which("convert")
    if convert_path:
        try:
            subprocess.run(
                [convert_path, str(dng_path), "-quality", str(quality), "-sampling-factor", "4:4:4", str(jpg_path)],
                check=True, capture_output=True, text=True
            )
            return True
        except subprocess.CalledProcessError as e:
            print(f"    ImageMagick error: {e.stderr}")
            return False

    print("    No DNG converter found. Install ImageMagick or run on macOS with sips.")
    return False


def make_thumb(src: Path, dst: Path, max_size: tuple, quality: int) -> tuple[int, int]:
    """Create a thumbnail. Returns (original_bytes, thumb_bytes)."""
    with Image.open(src) as img:
        img = ImageOps.exif_transpose(img)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        orig_size = src.stat().st_size
        img.thumbnail(max_size, Image.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        img.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
        thumb_size = dst.stat().st_size
        return orig_size, thumb_size


def convert_folder(folder: Path, force: bool):
    """HEIC / DNG -> high-quality JPG (EXIF with GPS + date is kept)."""
    if HEIC_SUPPORT:
        heic_files = list(folder.glob("*.[hH][eE][iI][cC]"))
        if heic_files:
            print(f"\n📸 {folder}: found {len(heic_files)} HEIC file(s).")
            for heic_path in sorted(heic_files):
                jpg_path = heic_path.with_suffix(".jpg")
                if not force and jpg_path.exists():
                    print(f"  ⏩ {heic_path.name} → JPG already exists, skipping.")
                    continue
                print(f"  🔄 Converting {heic_path.name} → {jpg_path.name} (quality {HEIC_JPG_QUALITY})")
                print("     ✓ Done" if convert_heic_to_jpg(heic_path, jpg_path, HEIC_JPG_QUALITY, HEIC_SUBSAMPLING) else "     ✗ Failed")
        else:
            print(f"\n📸 {folder}: no HEIC files found.")
    else:
        print("\n⚠️ HEIC support disabled – install pillow-heif to convert HEIC files.\n")

    dng_files = list(folder.glob("*.[dD][nN][gG]"))
    if dng_files:
        print(f"\n📷 {folder}: found {len(dng_files)} DNG file(s).")
        for dng_path in sorted(dng_files):
            jpg_path = dng_path.with_suffix(".jpg")
            if not force and jpg_path.exists():
                print(f"  ⏩ {dng_path.name} → JPG already exists, skipping.")
                continue
            print(f"  🔄 Converting {dng_path.name} → {jpg_path.name} (quality {DNG_JPG_QUALITY})")
            print("     ✓ Done" if convert_dng_to_jpg(dng_path, jpg_path, DNG_JPG_QUALITY) else "     ✗ Failed")


def thumb_batch(sources, dst_for, force: bool, label: str, size=None, quality=None):
    """Make thumbnails for `sources`; dst_for(src)->Path. Returns list of sources newly thumbnailed."""
    total_orig = total_thumb = skipped = errors = 0
    made = []
    size, quality = size or MAX_SIZE, quality or THUMB_QUALITY
    print(f"\n🖼️  {label}: {len(sources)} image(s) — max {size[0]}×{size[1]}px, quality {quality}")
    for src in sorted(sources):
        dst = dst_for(src)
        if dst is None or (not force and dst.exists()):
            skipped += 1
            continue
        try:
            orig_b, thumb_b = make_thumb(src, dst, size, quality)
            saving = (1 - thumb_b / orig_b) * 100 if orig_b else 0
            print(f"  ✓ {src.name:<40} {orig_b/1024:>7.1f} KB → {thumb_b/1024:>6.1f} KB ({saving:.0f}% smaller)")
            total_orig += orig_b; total_thumb += thumb_b; made.append(src)
        except Exception as e:
            print(f"  ✗ {src.name:<40} ERROR: {e}")
            errors += 1
    print(f"  new: {len(made)}  |  already had a thumbnail: {skipped}  |  errors: {errors}")
    if made and total_orig:
        print(f"  size: {total_orig/1024/1024:.1f} MB → {total_thumb/1024/1024:.1f} MB ({(1-total_thumb/total_orig)*100:.0f}% smaller)")
    return made


# ── work page helpers ───────────────────────────────────────────
def work_originals():
    """Full-size photos in static/img/work (old thumbnails like name_s.jpg / name_S.jpg / names.jpg excluded)."""
    files = [p for p in WORK_DIR.iterdir() if p.is_file() and p.suffix.lower() in EXTENSIONS]
    stems = {p.stem for p in files}
    return [p for p in files if not is_old_thumb(p, stems)]

def is_old_thumb(p: Path, stems):
    st = p.stem
    if st.endswith(("_s", "_S")):                              # name_s / name_S
        return True
    return st[-1:] in ("s", "S") and st[:-1] in stems          # names  (old style: NUM24 + NUM24s)

def refresh_small_work_thumbs():
    """Thumbnails made by an older version were only up to 800x560 (too small for portrait photos in the uniform
    frame). Delete those so they are re-made at full width."""
    n = 0
    for src in work_originals():
        t = WORK_THUMBS / f"{src.stem}.jpg"
        if not t.exists():
            continue
        try:
            with Image.open(t) as ti, Image.open(src) as si:
                if ti.width < WORK_THUMB_SIZE[0] - 2 and ImageOps.exif_transpose(si).width > ti.width + 2:
                    t.unlink(); n += 1
        except Exception:
            pass
    if n:
        print(f"\n♻️  Re-making {n} small work thumbnail(s) at {WORK_THUMB_SIZE[0]}px wide.")

def added_time(p: Path):
    """When the photo was added: file creation time (macOS) or modified time."""
    stt = p.stat()
    return getattr(stt, "st_birthtime", stt.st_mtime)

def title_from_name(stem: str):
    return re.sub(r"[_\-]+", " ", stem).strip().title()

def seed_from_html():
    """First run only: import the cards already in work.html (order + titles are kept)."""
    if not WORK_HTML.exists():
        return []
    html = WORK_HTML.read_text(encoding="utf-8")
    out = []
    for sec in re.findall(r'<section class="highlight">(.*?)</section>', html, flags=re.S):
        href  = re.search(r'<a href="([^"]+)"', sec)
        thumb = re.search(r'<img src="([^"]+)"', sec)
        title = re.search(r'<p>\s*<span[^>]*>(.*?)</span>\s*</p>', sec, flags=re.S)
        if href:
            out.append({"image": href.group(1),
                        "thumb": thumb.group(1) if thumb else href.group(1),
                        "title": htmllib.unescape(re.sub(r"<[^>]+>", "", title.group(1))).strip() if title else title_from_name(Path(href.group(1)).stem)})
    return out

WORK_JS_HEADER = """/* Photos shown on work.html — edit a "title" here, save, and refresh the page (top of the list = top of the page).
   • Every photo is shown in the same-size frame (3:2); if a head gets cut, add  "focus": "50% 15%"  (x y) to that line.
   • "hidden": true on a line hides that photo.  • Keep the format: one {...} per line, commas between lines.
   • New photos in static/img/work/ are added at the TOP automatically by:  python3 generate_thumbs.py */
window.WORK_PHOTOS = [
"""

def save_work_json(entries):
    WORK_JSON.parent.mkdir(parents=True, exist_ok=True)
    body = ",\n".join("  " + json.dumps(e, ensure_ascii=False) for e in entries)
    WORK_JSON.write_text(WORK_JS_HEADER + body + "\n];\n", encoding="utf-8")

def load_work_js(path=None):
    """Read window.WORK_PHOTOS = [ ... ]; from the .js file. Raises ValueError with a clear message if it was edited wrongly."""
    path = path or WORK_JSON
    text = path.read_text(encoding="utf-8")
    start = text.index("[", text.index("WORK_PHOTOS"))
    end = text.rindex("]")
    arr = re.sub(r",\s*\]\s*$", "]", text[start:end + 1])          # tolerate a trailing comma
    try:
        return json.loads(arr)
    except json.JSONDecodeError as e:
        line = arr[:e.pos].count("\n") + 1
        raise ValueError(f"{path} has a typo near line {line + text[:start].count(chr(10))}: {e.msg} "
                         f"(check quotes \" and commas , between lines)")

def update_work_json():
    """Keep static/js/work_photos.js in sync with the photos in static/img/work."""
    if WORK_JSON.exists():
        try:
            entries = load_work_js()
        except ValueError as e:
            print(f"\n✗ {e}\n  Nothing was changed. Fix that line and run the script again.")
            return
    elif any(o.exists() for o in WORK_JSON_OLD):
        old = next(o for o in WORK_JSON_OLD if o.exists())
        try:
            entries = load_work_js(old) if old.suffix == ".js" else json.loads(old.read_text(encoding="utf-8"))
        except (ValueError, json.JSONDecodeError) as e:
            print(f"\n✗ Could not read {old}: {e}\n  Nothing was changed."); return
        print(f"\n📄 Imported {len(entries)} photos from the older {old} (titles + order kept).")
    else:
        entries = seed_from_html()
        if entries:
            print(f"\n📄 First run: imported {len(entries)} existing cards from {WORK_HTML} (titles + order kept).")

    originals = {f"{WORK_DIR.as_posix()}/{p.name}": p for p in work_originals()}
    known = {e["image"] for e in entries}

    # thumbnails of photos in static/img/work now live in static/img/work/thumbs/
    for e in entries:
        if e["image"] in originals:
            e["thumb"] = f"{WORK_THUMBS.as_posix()}/{originals[e['image']].stem}.jpg"

    # new photos -> TOP, newest first
    new = sorted((p for img, p in originals.items() if img not in known), key=added_time, reverse=True)
    added = [{"image": f"{WORK_DIR.as_posix()}/{p.name}",
              "thumb": f"{WORK_THUMBS.as_posix()}/{p.stem}.jpg",
              "title": title_from_name(p.stem)} for p in new]
    entries = added + entries
    save_work_json(entries)

    missing = [e["image"] for e in entries if e["image"].startswith(WORK_DIR.as_posix()) and e["image"] not in originals]
    print(f"\n📄 {WORK_JSON}: {len(entries)} photo(s) on the work page, {len(added)} new at the top.")
    for e in added:
        print(f"   ＋ {Path(e['image']).name}  →  \"{e['title']}\"   (edit the title in {WORK_JSON})")
    if missing:
        print(f"   ⚠ {len(missing)} entry/entries point to a file that is not in {WORK_DIR} (they stay hidden on the site): "
              + ", ".join(Path(m).name for m in missing))

def clean_old_thumbs():
    """Delete old name_s.jpg-style thumbnails (only if the original and the new thumbnail exist)."""
    files = [p for p in WORK_DIR.iterdir() if p.is_file() and p.suffix.lower() in EXTENSIONS]
    stems = {p.stem for p in files}
    n = 0
    for p in files:
        if is_old_thumb(p, stems):
            base = p.stem[:-2] if p.stem.endswith(("_s", "_S")) else p.stem[:-1]
            if (WORK_DIR / f"{base}.jpg").exists() and (WORK_THUMBS / f"{base}.jpg").exists():
                p.unlink(); n += 1
    print(f"\n🧹 Deleted {n} old thumbnail file(s) from {WORK_DIR}.")


def main():
    parser = argparse.ArgumentParser(description="Convert HEIC/DNG to high-quality JPG and generate thumbnails.")
    parser.add_argument("--force-conversion", action="store_true",
                        help="Re‑convert HEIC/DNG files even if the JPG already exists (overwrite).")
    parser.add_argument("--force-thumbs", action="store_true",
                        help="Regenerate all thumbnails, overwriting existing ones.")
    parser.add_argument("--no-locations", action="store_true",
                        help="Skip the auto-location step (tools/build_photos.py).")
    parser.add_argument("--strip-gps", action="store_true",
                        help="After locating photos, remove GPS/EXIF from the full-size photos (public-site privacy).")
    parser.add_argument("--clean-old-thumbs", action="store_true",
                        help="Delete old name_s.jpg-style thumbnails in static/img/work (after the new thumbs/ folder is made).")
    args = parser.parse_args()

    if not SOURCE_DIR.exists():
        sys.exit(f"Source folder not found: {SOURCE_DIR}\nRun this script from the root of your website (next to static/).")

    # ────────── 1-2. Convert HEIC / DNG ──────────
    convert_folder(SOURCE_DIR, args.force_conversion)
    if WORK_DIR.exists():
        convert_folder(WORK_DIR, args.force_conversion)

    # ────────── 3. Travel-gallery thumbnails → static/img/explore/thumbs/ ──────────
    sources = [p for p in SOURCE_DIR.iterdir() if p.is_file() and p.suffix.lower() in EXTENSIONS]
    if sources:
        thumb_batch(sources, lambda s: THUMBS_DIR / (s.stem + ".jpg"), args.force_thumbs, "Travel gallery")
    else:
        print("\n❌ No images found for travel-gallery thumbnails.")

    # ────────── 4. Work page: thumbs/ folder + photo list (work_photos.json) ──────────
    if WORK_DIR.exists():
        refresh_small_work_thumbs()
        thumb_batch(work_originals(), lambda s: WORK_THUMBS / (s.stem + ".jpg"), args.force_thumbs, "Work page",
                    size=WORK_THUMB_SIZE, quality=WORK_THUMB_QUALITY)
        update_work_json()
        if args.clean_old_thumbs:
            clean_old_thumbs()
    else:
        print(f"\nℹ️  {WORK_DIR} not found – skipping work page.")

    # ────────── 5. Auto-locate travel photos from GPS → travel_data_auto.js ──────────
    locator = Path("tools/build_photos.py")
    if args.no_locations:
        pass
    elif locator.exists():
        print("\n📍 Detecting photo locations from GPS ...\n")
        cmd = [sys.executable, str(locator)] + (["--strip-gps"] if args.strip_gps else [])
        subprocess.run(cmd)
    else:
        print("\nℹ️  tools/build_photos.py not found – skipping auto-location.")
    print("\n✅ Done!\n")


if __name__ == "__main__":
    main()
