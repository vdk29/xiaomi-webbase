"""Build faithful, centered WebP assets from the individually reviewed manifest.
Usage: python scripts/prepare-photo-assets.py manifest.json /private/output/directory
Requires Pillow. Review source images before adding them to the manifest.
"""
import hashlib
import io
import json
import pathlib
import sys
import urllib.request
from PIL import Image, ImageChops

manifest_path = pathlib.Path(sys.argv[1])
output = pathlib.Path(sys.argv[2])
output.mkdir(parents=True, exist_ok=True)
manifest = json.loads(manifest_path.read_text())
for entry in manifest:
    request = urllib.request.Request(entry['image_url'], headers={'User-Agent': 'WebBase product asset preparation'})
    with urllib.request.urlopen(request, timeout=45) as response:
        raw = response.read(20 * 1024 * 1024 + 1)
    if len(raw) > 20 * 1024 * 1024:
        raise ValueError('Source image exceeds 20 MB')
    image = Image.open(io.BytesIO(raw)).convert('RGBA')
    white = Image.new('RGBA', image.size, 'white')
    white.alpha_composite(image)
    image = white.convert('RGB')
    difference = ImageChops.difference(image, Image.new('RGB', image.size, 'white'))
    box = difference.convert('L').point(lambda pixel: 255 if pixel > 18 else 0).getbbox()
    if box:
        margin = round(max(image.size) * 0.02)
        image = image.crop((max(0, box[0]-margin), max(0, box[1]-margin),
                            min(image.width, box[2]+margin), min(image.height, box[3]+margin)))
    image.thumbnail((520, 520), Image.Resampling.LANCZOS)
    canvas = Image.new('RGB', (640, 640), 'white')
    canvas.paste(image, ((640-image.width)//2, (640-image.height)//2))
    target = output / (entry['sku'] + '.webp')
    canvas.save(target, 'WEBP', quality=82, method=6)
    data = target.read_bytes()
    entry.update(byte_size=len(data), sha256=hashlib.sha256(data).hexdigest(), width=640, height=640)
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Prepared {len(manifest)} images, {sum(entry["byte_size"] for entry in manifest)} bytes')
