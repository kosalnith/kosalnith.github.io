from pathlib import Path
from PIL import Image, ImageOps
import pillow_heif

pillow_heif.register_heif_opener()

src_dir = Path("static/img/explore")
heic_files = list(src_dir.glob("*.[hH][eE][iI][cC]"))

print(f"Found {len(heic_files)} HEIC file(s).")

converted = 0
skipped = 0

for heic_path in sorted(heic_files):
    jpg_path = heic_path.with_suffix(".jpg")
    
    if jpg_path.exists():
        print(f"⏩ Skipping {heic_path.name} → {jpg_path.name} (already exists)")
        skipped += 1
        continue
    
    print(f"🔄 Converting {heic_path.name} -> {jpg_path.name} (quality 100, full chroma)")
    try:
        with Image.open(heic_path) as img:
            img = ImageOps.exif_transpose(img)
            if img.mode != "RGB":
                img = img.convert("RGB")
            # Save with maximum quality and no subsampling (4:4:4)
            img.save(jpg_path, "JPEG", quality=100, subsampling=0, optimize=False)
        print("  ✓ Success (high quality)")
        converted += 1
    except Exception as e:
        print(f"  ✗ FAILED: {e}")

print(f"\nDone: {converted} converted, {skipped} skipped (JPG already existed).")