# Icon Conversion Guide

This guide explains how to convert the SVG icon to the formats needed for different platforms.

## Method 0: Using the npm script (Recommended)

We've included a script to generate all icons automatically:

```bash
# From the electron-app directory
npm run generate-icons
```

This will create all necessary icons in the `assets/icons` directory. Move them to the correct locations:

```bash
# From the assets directory
cp icons/mac/icon.icns ./icon.icns
cp icons/win/icon.ico ./icon.ico
cp icons/png/512x512.png ./icon.png
```

## Method 1: Using electron-icon-maker manually

1. Install the tool:
```bash
npm install -g electron-icon-maker
```

2. Run the conversion:
```bash
electron-icon-maker --input=./icon.svg --output=./
```

This will generate:
- `icons/` directory with various sizes for macOS, Windows, and Linux

3. Rename the files:
   - For macOS: Use `icons/mac/icon.icns`
   - For Windows: Use `icons/win/icon.ico`
   - For Linux: Use a 512x512 PNG from `icons/png/`

## Method 2: Manual conversion

### For PNG (Linux)
```bash
# Using Inkscape
inkscape icon.svg --export-filename=icon.png -w 512 -h 512

# Or using ImageMagick
convert -background none icon.svg -resize 512x512 icon.png
```

### For ICO (Windows)
```bash
# Using ImageMagick
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### For ICNS (macOS)
```bash
# macOS only
mkdir MyIcon.iconset
sips -z 16 16     icon.png --out MyIcon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out MyIcon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out MyIcon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out MyIcon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out MyIcon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out MyIcon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out MyIcon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out MyIcon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out MyIcon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out MyIcon.iconset/icon_512x512@2x.png
iconutil -c icns MyIcon.iconset -o icon.icns
rm -R MyIcon.iconset
```

## Online Converters

You can also use online tools like:
- https://cloudconvert.com/svg-to-ico
- https://convertio.co/svg-icns/
- https://icoconvert.com/ 

# Using Your Own Icons

The application is configured to use your PNG icon file directly. Just place your icon at:

```
assets/icon.png
```

Requirements:
- The icon should be at least 512x512 pixels
- PNG format with transparency (if needed)
- Square dimensions recommended

The build system will automatically use this icon for all platforms (macOS, Windows, and Linux). 