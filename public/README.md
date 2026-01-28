# Public Assets

Place your ClipSon logo file here.

## Logo Setup

1. **Add your logo file** to this directory:
   - Recommended: `logo.png` (transparent background PNG)
   - Alternative: `logo.svg` (scalable vector)
   - Alternative: `logo.jpg` (if PNG not available)

2. **Logo specifications:**
   - **Format**: PNG with transparent background (recommended)
   - **Size**: At least 512x512px (will be scaled automatically)
   - **Aspect Ratio**: Square (1:1) works best
   - **File Name**: Must be `logo.png` (or update Logo component to use different name)

3. **If no logo is provided:**
   - The system will automatically show a gradient badge with "CA" initials
   - This works as a fallback until you add your logo

## Current Logo Component

The logo component (`components/Logo.tsx`) will:
- Try to load `/logo.png` from the public folder
- If the image fails to load, it shows a gradient badge with "CA" text
- Supports multiple sizes: `sm`, `md`, `lg`, `xl`

## Usage

Once you add `logo.png` to this folder, it will automatically appear throughout the application:
- Admin sidebar
- Login pages
- Home page
- Clipper portal
- Client dashboard
- All branded pages

