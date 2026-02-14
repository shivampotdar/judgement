# 🎴 Judgement PWA - Getting Started

## What You Have
A complete Progressive Web App that:
- Tracks Judgement/Kachuful card game scores
- Works offline after first load
- Can be installed on phones like a native app
- Auto-saves game state

## 3 Steps to Deploy

### 1️⃣ Generate Icons (2 minutes)
1. Double-click `icon-generator.html` to open in browser
2. Click "Download" under each icon
3. Save both files in this folder

### 2️⃣ Upload to GitHub (5 minutes)
```bash
# In this folder, run:
git init
git add .
git commit -m "Judgement PWA"
git remote add origin https://github.com/YOUR_USERNAME/judgement-game.git
git push -u origin main
```

### 3️⃣ Enable GitHub Pages (1 minute)
1. Go to your GitHub repository
2. Settings → Pages
3. Source: **main** branch → Save
4. Your app is live! 🎉

## Install on Your Phone

**Android (Chrome):**
1. Visit your GitHub Pages URL
2. Menu (⋮) → "Add to Home screen"

**iPhone (Safari):**
1. Visit your GitHub Pages URL
2. Share button → "Add to Home Screen"

## Files Explained

**Essential Files:**
- `index.html` - Main app page
- `judgement-game.jsx` - Game logic
- `manifest.json` - PWA configuration
- `sw.js` - Offline support
- `icon.svg` - Icon source

**You Need to Create:**
- `icon-192.png` - Using icon-generator.html
- `icon-512.png` - Using icon-generator.html

**Helper Files:**
- `icon-generator.html` - Creates PNG icons
- `README.md` - Full documentation
- `DEPLOY.md` - Quick deployment guide
- `CHECKLIST.md` - Pre-deployment checklist

## Need Help?

Check `CHECKLIST.md` for troubleshooting.

---

**That's it! Your card game tracker is ready to deploy! 🚀**
