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
5. WORK PAGE (static/img/work/): converts HEIC/DNG there too, makes <name>_s.jpg thumbnails
   (skips existing ones, incl. old names like name_S.jpg / names.jpg), and lists photos that are
   not on work.html yet. Add --add-to-work to insert them automatically (newest first).

Requirements:
    pip install Pillow pillow-heif reverse_geocoder pycountry
    (optional) ImageMagick if not on macOS

Usage:
    python generate_thumbs.py
    python generate_thumbs.py --force-conversion       # reconvert HEIC/DNG to JPG (overwrite)
    python generate_thumbs.py --force-thumbs           # regenerate all thumbnails (overwrite)
    python generate_thumbs.py --add-to-work            # also add new work photos to work.html
"""

import argparse
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
WORK_DIR     = Path("static/img/work")    # photos shown on work.html (thumbnail = <name>_s.jpg, same folder)
WORK_HTML    = Path("work.html")
WORK_GRID_ID = "work-grid"
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


def thumb_batch(sources, dst_for, force: bool, label: str):
    """Make thumbnails for `sources`; dst_for(src)->Path. Returns list of sources newly thumbnailed."""
    total_orig = total_thumb = skipped = errors = 0
    made = []
    print(f"\n🖼️  {label}: {len(sources)} image(s) — max {MAX_SIZE[0]}×{MAX_SIZE[1]}px, quality {THUMB_QUALITY}")
    for src in sorted(sources):
        dst = dst_for(src)
        if dst is None or (not force and dst.exists()):
            skipped += 1
            continue
        try:
            orig_b, thumb_b = make_thumb(src, dst, MAX_SIZE, THUMB_QUALITY)
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


# ── work.html helpers ────────────────────────────────────────────
_THUMB_SUFFIXES = ("_s", "_S")

def work_originals():
    """Full-size photos in static/img/work (thumbnails like name_s.jpg / name_S.jpg / names.jpg excluded)."""
    files = [p for p in WORK_DIR.iterdir() if p.is_file() and p.suffix.lower() in EXTENSIONS]
    stems = {p.stem for p in files}
    out = []
    for p in files:
        st = p.stem
        if st.endswith(_THUMB_SUFFIXES):                      # name_s / name_S
            continue
        if st[-1:] in ("s", "S") and st[:-1] in stems:        # names  (old style: NUM24 + NUM24s)
            continue
        out.append(p)
    return out

def work_thumb_path(src: Path):
    """Where the thumbnail should go, or an existing one (old naming) so it is not duplicated."""
    for name in (f"{src.stem}_s.jpg", f"{src.stem}_S.jpg", f"{src.stem}s.jpg", f"{src.stem}S.jpg"):
        if (WORK_DIR / name).exists():
            return WORK_DIR / name
    return WORK_DIR / f"{src.stem}_s.jpg"

def photo_date(p: Path):
    try:
        with Image.open(p) as im:
            ex = im.getexif()
            when = ex.get_ifd(0x8769).get(36867) or ex.get(306)
        if when:
            return datetime.strptime(str(when)[:19], "%Y:%m:%d %H:%M:%S")
    except Exception:
        pass
    return datetime.fromtimestamp(p.stat().st_mtime)

def work_card_html(src: Path, thumb: Path):
    title = re.sub(r"[_\-]+", " ", src.stem).strip().title()
    return (f'<section class="highlight">\n<figure class="landscape">\n  <picture>\n'
            f'    <a href="{WORK_DIR.as_posix()}/{src.name}" target="_blank"><img src="{WORK_DIR.as_posix()}/{thumb.name}" alt="{title}"></a>\n'
            f'  </picture>\n</figure>\n<p><span style="font-weight: 400;">{title}</span></p>\n</section>\n')

def handle_work_page(add: bool):
    html = WORK_HTML.read_text(encoding="utf-8") if WORK_HTML.exists() else ""
    used = set(re.findall(r'static/img/work/([^"\']+?)\.(?:jpe?g|png|webp)', html, flags=re.I))
    missing = [p for p in work_originals() if p.stem not in used and work_thumb_path(p).exists()]
    if not missing:
        print("\n✅ work.html already lists every photo in static/img/work.")
        return
    missing.sort(key=photo_date, reverse=True)                # newest first
    print(f"\n📄 {len(missing)} photo(s) in {WORK_DIR} are not on work.html yet:")
    for p in missing:
        print(f"   • {p.name}")
    if not add:
        print("   Run:  python3 generate_thumbs.py --add-to-work   to add them (titles come from file names — edit them in work.html).")
        return
    m = re.search(r'<div[^>]*id="' + WORK_GRID_ID + r'"[^>]*>', html)
    if not m:
        print(f'   ✗ Could not find <div id="{WORK_GRID_ID}"> in work.html — see instructions.')
        return
    cards = "\n".join(work_card_html(p, work_thumb_path(p)) for p in missing)
    WORK_HTML.write_text(html[:m.end()] + "\n\n" + cards + "\n" + html[m.end():], encoding="utf-8")
    print(f"   ✓ Added to the top of the grid in {WORK_HTML}. Titles are taken from the file names — edit them there.")


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
    parser.add_argument("--add-to-work", action="store_true",
                        help="Insert work-page photos that are not on work.html yet (newest first).")
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

    # ────────── 4. Work-page thumbnails → static/img/work/<name>_s.jpg ──────────
    if WORK_DIR.exists():
        thumb_batch(work_originals(), lambda s: None if (work_thumb_path(s).exists() and not args.force_thumbs)
                    else work_thumb_path(s), args.force_thumbs, "Work page")
        if WORK_HTML.exists():
            handle_work_page(args.add_to_work)
    else:
        print(f"\nℹ️  {WORK_DIR} not found – skipping work-page thumbnails.")

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
