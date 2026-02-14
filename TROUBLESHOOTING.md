# 🔧 Troubleshooting Guide

## Fixed Issues ✅

The following errors have been resolved in the updated files:

### ❌ "require is not defined" 
**Fixed:** Removed ES6 `import` statements and used global variables instead

### ❌ "Cannot read properties of undefined (reading 'useState')"
**Fixed:** Changed to use `const { useState } = React` from global scope

### ❌ "Cannot read properties of undefined (reading 'useEffect')"
**Fixed:** Changed to use `const { useEffect } = React` from global scope

## Testing the Fix

### Option 1: Use test.html (Recommended)
1. Open `test.html` in your browser
2. You should see all checks pass with green checkmarks:
   - ✓ React
   - ✓ ReactDOM
   - ✓ Babel
   - ✓ Lucide Icons
   - ✓ React Hooks
3. Click "🚀 Launch App"
4. The game should load without errors

### Option 2: Check Browser Console
1. Open `index.html` in browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. You should see no red errors
5. The app should load and show the setup screen

## Common Issues

### "Babel transformer" Warning (Yellow)
This is just a warning, not an error. It's safe to ignore for local development. For production (GitHub Pages), the app works fine.

### File Protocol Error
**Error:** "Cross-Origin Request Blocked" or similar
**Solution:** Don't open HTML files directly (file://). Use a local server:

```bash
# Python
python -m http.server 8000

# Node.js  
npx serve .

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

### Icons Not Showing
**Symptoms:** Boxes or missing suit symbols
**Solutions:**
1. Check browser console for 404 errors
2. Verify Lucide loaded: In console, type `lucide` and press Enter. Should show an object.
3. Clear browser cache and reload

### localStorage Errors
**Error:** "localStorage is not defined" or quota exceeded
**Solutions:**
1. Don't use Private/Incognito mode
2. Clear browser data for the site
3. Check browser settings allow localStorage

### Service Worker Issues
**Symptoms:** Old version of app keeps loading
**Solutions:**
1. Open DevTools → Application → Service Workers
2. Click "Unregister" on any old service workers
3. Clear cache: Application → Storage → Clear site data
4. Hard reload: Ctrl+Shift+R (Cmd+Shift+R on Mac)

## File Checklist

Make sure all these files are in the same folder:
- [x] `index.html`
- [x] `judgement-game.jsx` (updated version without imports)
- [x] `manifest.json`
- [x] `sw.js`
- [x] `icon.svg`
- [ ] `icon-192.png` (generate using icon-generator.html)
- [ ] `icon-512.png` (generate using icon-generator.html)

## Verify Fixes

Run this in browser console after loading index.html:

```javascript
// Should all return objects, not undefined
console.log('React:', typeof React);           // "object"
console.log('ReactDOM:', typeof ReactDOM);     // "object"
console.log('lucide:', typeof lucide);         // "object"
console.log('Babel:', typeof Babel);           // "object"

// Should all be functions
console.log('useState:', typeof React.useState);   // "function"
console.log('useEffect:', typeof React.useEffect); // "function"
```

## Still Having Issues?

1. **Clear everything:**
   - Close all browser tabs with the app
   - Clear browser cache and cookies for the site
   - Restart browser

2. **Check file contents:**
   - `judgement-game.jsx` should start with `const { useState, useEffect } = React;`
   - It should NOT have `import React` or `import { ... } from 'react'`

3. **Try different browser:**
   - Chrome/Edge (best support)
   - Firefox (good support)
   - Safari (should work)

4. **Verify local server:**
   - URL should be `http://localhost:XXXX` NOT `file:///`
   - If using `file://`, switch to a local server

## Success Indicators

You know it's working when:
- ✅ No red errors in console
- ✅ Green felt background appears
- ✅ Card suit symbols (♥♣♦♠) display correctly
- ✅ Can enter player names and start game
- ✅ Game state persists after refresh
- ✅ Bid review screen shows edit buttons

---

**All files have been updated with the fixes. You should be good to go!** 🎉
