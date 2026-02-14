# ✅ Pre-Deployment Checklist

Before deploying to GitHub Pages, make sure you have:

## Required Files
- [ ] `index.html` - Main app file
- [ ] `judgement-game.jsx` - Game component
- [ ] `manifest.json` - PWA manifest
- [ ] `sw.js` - Service worker
- [ ] `icon.svg` - SVG icon source
- [ ] `icon-192.png` - 192x192 PNG icon ⚠️ **GENERATE THIS**
- [ ] `icon-512.png` - 512x512 PNG icon ⚠️ **GENERATE THIS**
- [ ] `.nojekyll` - Prevents Jekyll processing
- [ ] `.github/workflows/deploy.yml` - Auto-deployment (optional)

## Generate Icons (Required!)
1. Open `icon-generator.html` in browser
2. Click download for each icon size
3. Save as `icon-192.png` and `icon-512.png` in root directory

## Test Locally (Optional but Recommended)
```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx serve .
```
Then visit http://localhost:8000

## Deploy
```bash
# First time
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/judgement-game.git
git push -u origin main

# After changes
git add .
git commit -m "Your change description"
git push
```

## Enable GitHub Pages
1. Repository → Settings → Pages
2. Source: **main** branch
3. Save
4. Wait 1-2 minutes
5. Visit: `https://YOUR_USERNAME.github.io/judgement-game/`

## Test PWA Installation
### Android (Chrome)
- Open site → Menu → Add to Home screen

### iOS (Safari)  
- Open site → Share → Add to Home Screen

## Verify Everything Works
- [ ] Site loads at GitHub Pages URL
- [ ] No console errors (F12)
- [ ] Icons display correctly
- [ ] Can install as PWA
- [ ] Game saves state (refresh page)
- [ ] Works offline (disable network, reload)

## Troubleshooting
**Icons not showing:**
- Did you generate and upload both PNG files?

**Can't install as app:**
- Site must be HTTPS (GitHub Pages does this automatically)
- Check manifest.json is accessible
- Clear browser cache

**Service worker errors:**
- Check sw.js paths match your repo structure
- If using custom domain or repo name, update paths in:
  - manifest.json (start_url, scope)
  - sw.js (all paths in urlsToCache)

## Success! 🎉
Your PWA is now live and installable!

Share it: `https://YOUR_USERNAME.github.io/judgement-game/`
