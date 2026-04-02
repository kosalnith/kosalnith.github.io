#!/usr/bin/env python3
"""
generate_thumbs.py
──────────────────
Generates compressed thumbnail copies of every .jpg / .jpeg / .png
inside  static/img/explore/  and saves them to
        static/img/explore/thumbs/

Thumbnails are:
  • Resized to fit within 800 × 560 px  (keeps aspect ratio)
  • Saved as JPEG at quality 72          (looks fine on screen,
                                          typically 5–15× smaller)

The original files are NEVER touched — the lightbox still loads
them at full resolution when the user clicks a thumbnail.

Requirements:
    pip install Pillow

Usage (run from the root of your website, next to the static/ folder):
    python generate_thumbs.py

To re-generate only missing thumbs (skip already-done ones):
    python generate_thumbs.py --skip-existing

To change quality or max size, edit the constants below.
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit(
        "Pillow is not installed.\n"
        "Run:  pip install Pillow\n"
        "Then re-run this script."
    )

# ── Configuration ────────────────────────────────────────────────
SOURCE_DIR   = Path("static/img/explore")          # originals live here
THUMBS_DIR   = SOURCE_DIR / "thumbs"               # output subfolder
MAX_SIZE     = (800, 560)                           # max width × height (px)
JPEG_QUALITY = 72                                   # 60–80 is the sweet spot
EXTENSIONS   = {".jpg", ".jpeg", ".png", ".webp"}  # file types to process
# ─────────────────────────────────────────────────────────────────


def make_thumb(src: Path, dst: Path, max_size: tuple, quality: int) -> tuple[int, int]:
    """
    Open src, resize to fit within max_size, save to dst as JPEG.
    Returns (original_bytes, thumb_bytes).
    """
    with Image.open(src) as img:
        # Correct EXIF orientation so the thumb isn't rotated
        img = ImageOps.exif_transpose(img)

        # Convert palette / RGBA to RGB (JPEG doesn't support transparency)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")

        original_size = src.stat().st_size

        # Only downscale — never upscale a small image
        img.thumbnail(max_size, Image.LANCZOS)

        dst.parent.mkdir(parents=True, exist_ok=True)
        img.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)

        thumb_size = dst.stat().st_size
        return original_size, thumb_size


def main():
    parser = argparse.ArgumentParser(description="Generate thumbnails for the travel map.")
    parser.add_argument(
        "--skip-existing", action="store_true",
        help="Skip files that already have a thumbnail (faster re-runs)."
    )
    args = parser.parse_args()

    if not SOURCE_DIR.exists():
        sys.exit(
            f"Source folder not found: {SOURCE_DIR}\n"
            "Make sure you run this script from the root of your website,\n"
            "next to the  static/  folder."
        )

    # Collect source files (exclude anything already in thumbs/)
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

    print(f"Found {len(sources)} image(s) in {SOURCE_DIR}")
    print(f"Output → {THUMBS_DIR}  |  max {MAX_SIZE[0]}×{MAX_SIZE[1]}px  |  quality {JPEG_QUALITY}\n")

    for src in sorted(sources):
        dst = THUMBS_DIR / (src.stem + ".jpg")   # always save as .jpg

        if args.skip_existing and dst.exists():
            skipped += 1
            continue

        try:
            orig_b, thumb_b = make_thumb(src, dst, MAX_SIZE, JPEG_QUALITY)
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
    print(f"  Processed : {processed}  |  Skipped : {skipped}  |  Errors : {errors}")
    if processed:
        overall = (1 - total_thumb / total_orig) * 100 if total_orig else 0
        print(f"  Total saved : {total_orig/1024/1024:.1f} MB  →  "
              f"{total_thumb/1024/1024:.1f} MB  ({overall:.0f}% smaller overall)")
    print(f"{'─'*60}")
    print("\nDone! Thumbnails are in:", THUMBS_DIR)
    print("The lightbox still loads originals from:", SOURCE_DIR)


if __name__ == "__main__":
    main()
