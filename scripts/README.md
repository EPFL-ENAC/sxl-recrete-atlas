# Scripts Directory

This directory contains utility scripts for data processing and image optimization tasks in the SXL Recrete Atlas project.

## Overview

The `/scripts` folder provides essential tools for:
- Converting CSV data files to JSON format
- Converting Excel files to CSV format  
- Optimizing and converting project images to WebP format

## Scripts Description

### 🔄 `convert.js`
**Purpose**: Converts CSV data files to JSON format with data sanitization and transformation.

**What it does**:
- Converts multiple CSV files (`keys.csv`, `data.csv`, `project_values.csv`, `references.csv`) to JSON
- Sanitizes data by removing extra quotes and trimming whitespace
- Transforms coordinate data from `"lat, long"` format to `[long, lat]` array
- Converts image paths to WebP format using the `-1920.webp` naming convention
- Splits comma-separated values into arrays for fields like `main_concrete_type`, `actors`, etc.

**Usage**:
```bash
npm run convert
```

**Input**: CSV files in `/src/assets/data/`
**Output**: JSON files in `/src/assets/data/`

### 🖼️ `optimize-images.sh`
**Purpose**: Batch processes images for web optimization by creating multiple sizes and converting to WebP format.

**What it does**:
- Finds all `.jpg`, `.jpeg`, and `.png` files in `public/images/`
- Creates two optimized versions for each image:
  - `-1920.webp`: Maximum width of 1920px for desktop viewing
  - `-512.webp`: Maximum width of 512px for mobile/thumbnail use
- Uses ImageMagick with 80% quality compression
- Implements smart processing: only converts if source is newer than output or output doesn't exist
- Preserves original files as fallbacks

**Usage**:
```bash
npm run optimize-images
```

**Clean optimized images**:
```bash
npm run clean-optimize-images
```

**Requirements**: ImageMagick must be installed on the system

### 📊 `convert-xlsx.py`
**Purpose**: Python script for converting Excel (.xlsx) files to CSV format.

**Usage**: This script can be used to convert Excel data exports to CSV format before using the `convert.js` script.

## NPM Pre-hooks Integration

The scripts are automatically executed through npm pre-hooks to ensure data and images are always up-to-date:

### 🚀 Development Workflow
```bash
npm run dev
```
**Automatically runs**: `predev` → `optimize-images` + `convert` → `dev`

The `predev` hook ensures that:
1. All images are optimized and converted to WebP format
2. All CSV data is converted to JSON format
3. The development server starts with fresh, optimized assets

### 🏗️ Build Workflow
```bash
npm run build
```
**Automatically runs**: `prebuild` → `optimize-images` + `convert` → `build`

The `prebuild` hook ensures that:
1. Production builds always use optimized images
2. All data transformations are applied
3. The build process has access to the latest JSON data

### 🔍 Type Checking Workflow
```bash
npm run type-check
```
**Automatically runs**: `pretype-check` → `convert` → `type-check`

The `pretype-check` hook ensures that:
1. JSON files are generated before TypeScript type checking
2. Type definitions can validate against actual data structure

## Manual vs Automatic Execution

| Command | When to Use | What Happens |
|---------|-------------|--------------|
| `npm run dev` | **Recommended**: Starting development | Automatic: images + data conversion |
| `npm run build` | **Recommended**: Building for production | Automatic: images + data conversion |
| `npm run convert` | Manual: After CSV updates | Manual: data conversion only |
| `npm run optimize-images` | Manual: After adding new images | Manual: image optimization only |

## Workflow

The typical data processing workflow is:

### Automatic (Recommended)
1. **Development**: Simply run `npm run dev` - everything is handled automatically
2. **Production**: Run `npm run build` - all optimizations applied automatically

### Manual (When needed)
1. **Excel to CSV** (if needed): Use `convert-xlsx.py` to convert Excel files to CSV
2. **CSV to JSON**: Run `npm run convert` to process CSV files into JSON format
3. **Image Optimization**: Run `npm run optimize-images` to create optimized WebP versions
4. **Development**: Start the development server with `npm run dev`

## Dependencies

These scripts rely on the following tools:
- **Node.js**: For running `convert.js`
- **ImageMagick**: For image processing in `optimize-images.sh`
- **Python**: For running `convert-xlsx.py`
- **npm packages**: `csvtojson`, `rimraf` (for cleaning)

## File Structure Impact

```
src/assets/data/
├── *.csv (input files)
└── *.json (generated by convert.js)

public/images/
├── original.jpg
├── original-1920.webp (generated)
└── original-512.webp (generated)
```

## Performance Benefits

The pre-hook integration provides several advantages:

- **🔄 Consistency**: Ensures all developers and CI/CD have the same optimized assets
- **⚡ Efficiency**: Only processes changed files (smart timestamp checking)
- **🛡️ Reliability**: Prevents runtime errors from missing or outdated JSON files
- **📦 Automation**: No manual steps required for standard development workflow

## Notes

- All scripts are designed to be idempotent - they can be run multiple times safely
- The image optimization script only processes files that have changed
- Original image files are preserved alongside optimized versions
- Generated JSON files should not be committed to version control (see `.gitignore`)
- Pre-hooks run automatically - no manual intervention required for standard workflows