#!/usr/bin/env python3
"""
generate_thumbs.py
──────────────────
1. Converts .heic / .HEIC to high‑quality .jpg (using pillow-heif).
2. Converts .dng / .DNG to high‑quality .jpg (using sips on macOS or ImageMagick).
3. Generates compressed thumbnails (800×560px, quality 72) for every
   .jpg / .jpeg / .png / .webp into static/img/explore/thumbs/.
   **Skips thumbnails that already exist** (use --force-thumbs to regenerate all).

Requirements:
    pip install Pillow pillow-heif
    (optional) ImageMagick if not on macOS

Usage:
    python generate_thumbs.py
    python generate_thumbs.py --force-conversion       # reconvert HEIC/DNG to JPG (overwrite)
    python generate_thumbs.py --force-thumbs           # regenerate all thumbnails (overwrite)
"""

import argparse
import subprocess
import sys
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
# ─────────────────────────────────────────────────────────────────


def convert_heic_to_jpg(heic_path: Path, jpg_path: Path, quality: int, subsampling: int) -> bool:
    """Convert HEIC to high‑quality JPG using pillow-heif."""
    try:
        with Image.open(heic_path) as img:
            img = ImageOps.exif_transpose(img)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
            img.save(jpg_path, "JPEG", quality=quality, subsampling=subsampling, optimize=False)
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


def main():
    parser = argparse.ArgumentParser(description="Convert HEIC/DNG to high-quality JPG and generate thumbnails.")
    parser.add_argument("--force-conversion", action="store_true",
                        help="Re‑convert HEIC/DNG files even if the JPG already exists (overwrite).")
    parser.add_argument("--force-thumbs", action="store_true",
                        help="Regenerate all thumbnails, overwriting existing ones.")
    args = parser.parse_args()

    if not SOURCE_DIR.exists():
        sys.exit(f"Source folder not found: {SOURCE_DIR}\nRun this script from the root of your website (next to static/).")

    # ────────── 1. Convert HEIC files ──────────
    if HEIC_SUPPORT:
        heic_files = list(SOURCE_DIR.glob("*.[hH][eE][iI][cC]"))
        if heic_files:
            print(f"\n📸 Found {len(heic_files)} HEIC file(s).")
            for heic_path in sorted(heic_files):
                jpg_path = heic_path.with_suffix(".jpg")
                if not args.force_conversion and jpg_path.exists():
                    print(f"  ⏩ {heic_path.name} → JPG already exists, skipping.")
                    continue
                print(f"  🔄 Converting {heic_path.name} → {jpg_path.name} (quality {HEIC_JPG_QUALITY})")
                if convert_heic_to_jpg(heic_path, jpg_path, HEIC_JPG_QUALITY, HEIC_SUBSAMPLING):
                    print("     ✓ Done")
                else:
                    print("     ✗ Failed")
        else:
            print("\n📸 No HEIC files found.")
    else:
        print("\n⚠️ HEIC support disabled – install pillow-heif to convert HEIC files.\n")

    # ────────── 2. Convert DNG files ──────────
    dng_files = list(SOURCE_DIR.glob("*.[dD][nN][gG]"))
    if dng_files:
        print(f"\n📷 Found {len(dng_files)} DNG file(s).")
        for dng_path in sorted(dng_files):
            jpg_path = dng_path.with_suffix(".jpg")
            if not args.force_conversion and jpg_path.exists():
                print(f"  ⏩ {dng_path.name} → JPG already exists, skipping.")
                continue
            print(f"  🔄 Converting {dng_path.name} → {jpg_path.name} (quality {DNG_JPG_QUALITY})")
            if convert_dng_to_jpg(dng_path, jpg_path, DNG_JPG_QUALITY):
                print("     ✓ Done")
            else:
                print("     ✗ Failed")
    else:
        print("\n📷 No DNG files found.")

    # ────────── 3. Generate thumbnails (skip existing by default) ──────────
    sources = [
        p for p in SOURCE_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in EXTENSIONS
    ]

    if not sources:
        print("\n❌ No images found for thumbnail generation.")
        return

    total_orig = total_thumb = skipped = processed = errors = 0
    print(f"\n🖼️  Generating thumbnails for {len(sources)} image(s)")
    print(f"   Output folder: {THUMBS_DIR}")
    print(f"   Max size: {MAX_SIZE[0]}×{MAX_SIZE[1]}px, Quality: {THUMB_QUALITY}")
    print("   (skipping thumbnails that already exist; use --force-thumbs to overwrite)\n")

    for src in sorted(sources):
        dst = THUMBS_DIR / (src.stem + ".jpg")
        if not args.force_thumbs and dst.exists():
            skipped += 1
            print(f"  ⏩ {src.name:<40} thumb already exists, skipped")
            continue

        try:
            orig_b, thumb_b = make_thumb(src, dst, MAX_SIZE, THUMB_QUALITY)
            saving = (1 - thumb_b / orig_b) * 100 if orig_b else 0
            print(f"  ✓ {src.name:<40} {orig_b/1024:>7.1f} KB → {thumb_b/1024:>6.1f} KB ({saving:.0f}% smaller)")
            total_orig += orig_b
            total_thumb += thumb_b
            processed += 1
        except Exception as e:
            print(f"  ✗ {src.name:<40} ERROR: {e}")
            errors += 1

    print(f"\n{'─'*60}")
    print(f"  Thumbnails processed : {processed}  |  Skipped: {skipped}  |  Errors: {errors}")
    if processed:
        overall = (1 - total_thumb / total_orig) * 100 if total_orig else 0
        print(f"  Total size: {total_orig/1024/1024:.1f} MB → {total_thumb/1024/1024:.1f} MB ({overall:.0f}% smaller)")
    print(f"{'─'*60}")
    print("\n✅ Done!\n")


if __name__ == "__main__":
    main()