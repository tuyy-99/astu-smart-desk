# 📸 Add ASTU Campus Images

## Required Images

You need to save the ASTU campus photos in this folder with these exact names:

### 1. Main Building Image (Primary)
**Filename:** `astu-main-building.jpg`

**Description:** The main ASTU academic building with the central tower
- Shows the historic building with beige/cream colored facade
- Central tower with red roof
- Multiple windows in vertical columns
- Green lawn in foreground
- Trees and landscaping

**This image will be displayed in the hero section of the landing page.**

---

### 2. Modern Building Image (Optional - for future use)
**Filename:** `astu-modern-building.jpg`

**Description:** Modern ASTU campus building
- Shows contemporary architecture with curved balconies
- Yellow/cream colored building
- Palm trees and greenery
- Stone wall detail

**This image can be used for additional sections or galleries.**

---

### 3. ASTU Logo (Required)
**Filename:** `astu-logo.png`

**Description:** Official ASTU logo
- Circular logo with red border
- Green tree/plant symbol
- Atom/science symbol
- Blue grid pattern
- Open book at bottom

**This logo appears in the navbar.**

---

## How to Add Images

### Step 1: Save Your Images

1. Take the ASTU campus photos you have
2. Rename them exactly as shown above:
   - Main building photo → `astu-main-building.jpg`
   - Modern building photo → `astu-modern-building.jpg`
   - ASTU logo → `astu-logo.png`

### Step 2: Place in Assets Folder

Copy the images to this location:
```
frontend/public/assets/
├── astu-main-building.jpg  ← Main building with tower
├── astu-modern-building.jpg ← Modern campus building (optional)
└── astu-logo.png           ← ASTU logo
```

### Step 3: Verify

1. Restart the frontend server (if running)
2. Open http://localhost:3001
3. You should see:
   - Main building image in the hero section
   - ASTU logo in the navbar
   - All text overlays and badges working

---

## Image Specifications

### Recommended Sizes

**Main Building Image:**
- Format: JPG
- Minimum size: 1920x1080px (Full HD)
- Recommended: 2560x1440px or higher
- Aspect ratio: 16:9 or wider
- File size: Under 2MB (optimized for web)

**Logo:**
- Format: PNG (with transparency)
- Size: 512x512px or higher
- Square aspect ratio (1:1)
- File size: Under 200KB

### Image Quality Tips

- Use high-resolution photos
- Ensure good lighting and clarity
- Avoid blurry or pixelated images
- Compress images for web (use tools like TinyPNG)
- Keep file sizes reasonable for fast loading

---

## Current Setup

The landing page is already configured to display:

✅ Main building image with glass morphism effects
✅ Animated decorative frames
✅ Floating badges (Verified Campus, Est. 2011, 15K+ Students)
✅ Text overlay with location info
✅ Google Maps integration
✅ Hover effects and animations
✅ Light/dark mode support
✅ Fallback to stock image if files not found

---

## Fallback Behavior

If images are not found, the system will:
- Use a generic university building stock photo
- Display a building icon instead of logo
- All functionality will still work

But for the best experience, add your actual ASTU images!

---

## Example File Structure

```
frontend/public/assets/
├── astu-main-building.jpg    ✅ Main hero image
├── astu-modern-building.jpg  ⚠️  Optional (for future use)
├── astu-logo.png             ✅ Navbar logo
├── ADD_ASTU_IMAGES.md        📄 This file
└── README.md                 📄 General info
```

---

## Troubleshooting

### Image Not Showing

1. **Check filename exactly matches:**
   - `astu-main-building.jpg` (not `astu-main-building.jpeg` or `ASTU-Main-Building.jpg`)
   - Filenames are case-sensitive on some systems

2. **Check file location:**
   - Must be in `frontend/public/assets/`
   - Not in `frontend/src/assets/` or other folders

3. **Restart frontend server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   cd frontend
   npm run dev
   ```

4. **Clear browser cache:**
   - Press Ctrl+Shift+R (Windows/Linux)
   - Press Cmd+Shift+R (Mac)

5. **Check browser console:**
   - Press F12 to open DevTools
   - Look for 404 errors for images
   - Verify the image path

### Logo Not Showing

- Same troubleshooting steps as above
- Ensure PNG format with transparency
- Check that filename is exactly `astu-logo.png`

---

## What You'll See

After adding the images, your landing page will show:

🏛️ **Hero Section:**
- Beautiful ASTU main building with tower
- Glass morphism container with effects
- Animated borders and glows
- Text overlay: "ASTU - Main Academic Building"
- Location badge: "Adama, Ethiopia"
- Floating badges with campus info

🎓 **Navbar:**
- ASTU logo (circular with red border)
- "ASTU SmartDesk" branding
- Theme toggle and navigation

✨ **Effects:**
- Hover zoom on image
- Shine sweep effect
- Rotating border glow
- Smooth animations
- Light/dark mode support

---

**Ready to add your images! 🎉**

Just save them with the correct names in this folder and refresh your browser.

