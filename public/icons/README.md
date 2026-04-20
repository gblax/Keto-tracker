# Icons

`icon.svg` is the source. For full PWA install support on Android, generate
PNGs at these sizes and drop them next to `icon.svg`:

- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `maskable-512.png` (512×512 with safe-zone padding)

Any SVG-to-PNG tool works, e.g.:

```bash
# with ImageMagick
magick -background none icon.svg -resize 192x192 icon-192.png
magick -background none icon.svg -resize 512x512 icon-512.png
magick -background none icon.svg -resize 360x360 -gravity center -extent 512x512 maskable-512.png
```

iOS and Chrome will fall back to `icon.svg` if the PNGs are missing.
