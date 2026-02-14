# 🎓 Add ASTU Logo Here

## Required Logo File

**Filename:** `astu-logo.png`  
**Location:** This folder (`frontend/public/assets/`)

## How to Add the Logo

### Option 1: Save the Logo Image
1. Save the ASTU logo (the circular logo with red border, green tree, blue grid, and book)
2. Name it exactly: `astu-logo.png`
3. Place it in this folder: `frontend/public/assets/`

### Option 2: Convert and Save
If you have the logo in a different format:
```bash
# Convert to PNG (if needed)
# Then save as astu-logo.png in this folder
```

## Logo Specifications

**Recommended:**
- Format: PNG (with transparent background preferred)
- Dimensions: 512x512px or higher (square)
- File Size: Under 100KB
- Quality: High resolution, clear details

**The Logo Should Show:**
- Red circular border with Amharic and English text
- Green tree/mountain in center
- Atom symbol in the middle
- Blue grid/globe pattern
- Open book at the bottom
- "ADAMA SCIENCE AND TECHNOLOGY UNIVERSITY" text

## What Happens After Adding

Once you add `astu-logo.png` to this folder:

1. ✅ The navbar will display the actual ASTU logo
2. ✅ Logo will have proper styling:
   - White background in light mode
   - Dark background in dark mode
   - Rounded corners
   - Hover scale effect
   - Professional appearance
3. ✅ Fallback icon will no longer be used
4. ✅ Logo will be visible on all pages

## Current Status

- [ ] Logo not added yet (using fallback building icon)
- [ ] Once added, check this: ✅ Logo added successfully!

## Verify It Works

After adding the logo:

1. Refresh your browser: http://localhost:3000
2. Check the top-left corner of the navbar
3. You should see the ASTU logo
4. Try hovering over it (should scale up slightly)
5. Toggle dark mode to see it in both themes

## Troubleshooting

**Logo not showing?**
- Check filename is exactly: `astu-logo.png` (lowercase, .png extension)
- Check file is in correct folder: `frontend/public/assets/`
- Refresh browser (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors
- Verify image file isn't corrupted

**Logo looks wrong?**
- Ensure it's a square image (1:1 aspect ratio)
- Check file format is PNG
- Try with transparent background
- Optimize file size if too large
- Ensure image quality is good

**Logo too big/small?**
- The logo is set to 32x32px (w-8 h-8)
- It will auto-scale to fit
- Original image should be at least 512x512px for quality

---

**The navbar is already configured to use the logo!**  
Just add your ASTU logo image and it will appear automatically! 🎓
