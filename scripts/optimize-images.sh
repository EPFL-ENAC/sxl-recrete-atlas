#!/bin/bash
# scripts/optimize-images.sh
# Resize and convert images in public/images/ to webp (1920px and 512px max-width)
# Processes all images but skips reprocessing if the output file is up-to-date based on timestamp comparison. Keeps originals for fallback.

set -e

IMG_DIR="public/images"
QUALITY=85

find "$IMG_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.JPG' \) | while read -r img; do
  base="${img%.*}"
  ext="${img##*.}"
  for size in 1920 512; do
    out_file="${base}-${size}.webp"
    # Only process if source is newer than output or output doesn't exist
    if [[ ! -f "$out_file" || "$img" -nt "$out_file" ]]; then
      echo "Converting $img to $out_file (max-width: ${size}px, quality: $QUALITY)"
      magick "$img" -auto-orient -resize "${size}x" -quality $QUALITY "$out_file"
    fi
  done
done