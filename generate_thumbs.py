#!/usr/bin/env python3
"""
generate_thumbs.py
──────────────────
1. Converts any .heic / .HEIC in static/img/explore/ to high‑quality .jpg
   (saved in the same folder, quality 100, full chroma). Skips conversion
   if the .jpg already exists.
2. Generates compressed thumbnails (800×560px, quality 72) for every
   .jpg / .jpeg / .png / .webp (including newly converted JPGs) and saves
   them to static/img/explore/thumbs/.

The original files are NEVER touched — the lightbox still loads full‑resolution originals.

Requirements:
    pip install Pillow pillow-heif

Usage (run from the root of your website, next to the static/ folder):
    python generate_thumbs.py
    python generate_thumbs.py --skip-existing          # skip existing thumbnails
    python generate_thumbs.py --force-heic-conversion  # re‑convert all HEIC (overwrite JPGs)
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is not installed.\nRun: pip install Pillow")

# Optional HEIC support
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIC_SUPPORT = True
except ImportError:
    HEIC_SUPPORT = False
    print("⚠️  pillow-heif not installed. HEIC files will be ignored.\n"
          "   Install with: pip install pillow-heif", file=sys.stderr)

# ── Configuration ────────────────────────────────────────────────
SOURCE_DIR   = Path("static/img/explore")          # originals live here
THUMBS_DIR   = SOURCE_DIR / "thumbs"               # output subfolder
MAX_SIZE     = (800, 560)                          # max width × height (px)
THUMB_QUALITY = 72                                 # 60–80 is the sweet spot
HEIC_JPG_QUALITY = 100                             # maximum quality
HEIC_SUBSAMPLING = 0                               # 0 = 4:4:4 (no chroma subsampling)
EXTENSIONS   = {".jpg", ".jpeg", ".png", ".webp"}  # file types to process for thumbs
# ─────────────────────────────────────────────────────────────────


def convert_heic_to_jpg(heic_path: Path, jpg_path: Path, quality: int, subsampling: int) -> bool:
    """Convert HEIC to high‑quality JPG. Returns True on success."""
    try:
        with Image.open(heic_path) as img:
            img = ImageOps.exif_transpose(img)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            img.save(jpg_path, "JPEG", quality=quality, subsampling=subsampling, optimize=False)
        return True
    except Exception as e:
        print(f"    ERROR: {e}")
        return False


def make_thumb(src: Path, dst: Path, max_size: tuple, quality: int) -> tuple[int, int]:
    """
    Open src, resize to fit within max_size, save to dst as JPEG.
    Returns (original_bytes, thumb_bytes).
    """
    with Image.open(src) as img:
        img = ImageOps.exif_transpose(img)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")

        original_size = src.stat().st_size
        img.thumbnail(max_size, Image.LANCZOS)

        dst.parent.mkdir(parents=True, exist_ok=True)
        img.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)

        thumb_size = dst.stat().st_size
        return original_size, thumb_size


def main():
    parser = argparse.ArgumentParser(description="Convert HEIC to high-quality JPG and generate thumbnails.")
    parser.add_argument(
        "--skip-existing", action="store_true",
        help="Skip thumbnail generation for files that already have a thumbnail (faster re-runs)."
    )
    parser.add_argument(
        "--force-heic-conversion", action="store_true",
        help="Re‑convert .heic files even if the .jpg already exists (overwrites existing JPGs)."
    )
    args = parser.parse_args()

    if not SOURCE_DIR.exists():
        sys.exit(
            f"Source folder not found: {SOURCE_DIR}\n"
            "Make sure you run this script from the root of your website,\n"
            "next to the  static/  folder."
        )

    # ────────── 1. Convert HEIC files to high‑quality JPG ──────────
    if HEIC_SUPPORT:
        heic_files = list(SOURCE_DIR.glob("*.[hH][eE][iI][cC]"))
        if heic_files:
            print(f"Found {len(heic_files)} HEIC file(s).")
            for heic_path in sorted(heic_files):
                jpg_path = heic_path.with_suffix(".jpg")
                if not args.force_heic_conversion and jpg_path.exists():
                    print(f"  ⏩  {heic_path.name} → JPG already exists, skipping.")
                    continue
                print(f"  🔄  {heic_path.name} → {jpg_path.name} (quality {HEIC_JPG_QUALITY}, full chroma)")
                if convert_heic_to_jpg(heic_path, jpg_path, HEIC_JPG_QUALITY, HEIC_SUBSAMPLING):
                    print("      ✓  Converted.")
                else:
                    print("      ✗  Conversion failed.")
            print()
        else:
            print("No .heic files found.\n")
    else:
        print("⚠️  HEIC support disabled (pillow-heif not installed). No HEIC files will be converted.\n")

    # ────────── 2. Generate thumbnails for all images ──────────
    sources = [
        p for p in SOURCE_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in EXTENSIONS
    ]

    if not sources:
        print("No images found in", SOURCE_DIR)
        return

    total_orig  = 0
    total_thumb = 0
    skipped     = 0
    processed   = 0
    errors      = 0

    print(f"Found {len(sources)} image(s) for thumbnails in {SOURCE_DIR}")
    print(f"Output → {THUMBS_DIR}  |  max {MAX_SIZE[0]}×{MAX_SIZE[1]}px  |  quality {THUMB_QUALITY}\n")

    for src in sorted(sources):
        dst = THUMBS_DIR / (src.stem + ".jpg")   # always save as .jpg

        if args.skip_existing and dst.exists():
            skipped += 1
            continue

        try:
            orig_b, thumb_b = make_thumb(src, dst, MAX_SIZE, THUMB_QUALITY)
            saving = (1 - thumb_b / orig_b) * 100 if orig_b else 0
            print(f"  ✓  {src.name:<40}  "
                  f"{orig_b/1024:>7.1f} KB  →  {thumb_b/1024:>6.1f} KB  "
                  f"({saving:.0f}% smaller)")
            total_orig  += orig_b
            total_thumb += thumb_b
            processed   += 1
        except Exception as exc:
            print(f"  ✗  {src.name}  —  ERROR: {exc}")
            errors += 1

    print(f"\n{'─'*60}")
    print(f"  Thumbnails processed : {processed}  |  Skipped : {skipped}  |  Errors : {errors}")
    if processed:
        overall = (1 - total_thumb / total_orig) * 100 if total_orig else 0
        print(f"  Total saved : {total_orig/1024/1024:.1f} MB  →  "
              f"{total_thumb/1024/1024:.1f} MB  ({overall:.0f}% smaller overall)")
    print(f"{'─'*60}")
    print("\nDone! Thumbnails are in:", THUMBS_DIR)
    print("The lightbox still loads originals from:", SOURCE_DIR)


if __name__ == "__main__":
    main()