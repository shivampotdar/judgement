# 🚀 Quick Deployment Guide

## Step 1: Generate Icons

Open `icon-generator.html` in your browser:
1. Icons will be generated automatically
2. Click "Download" under each icon
3. Save as `icon-192.png` and `icon-512.png`

## Step 2: Deploy to GitHub Pages

### Create Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/judgement-game.git
git push -u origin main
```

### Enable GitHub Pages
1. Go to repository **Settings** → **Pages**
2. Source: **main** branch
3. Click **Save**
4. Visit: `https://YOUR_USERNAME.github.io/judgement-game/`

## Step 3: Install as App

### Android
1. Open site in Chrome
2. Menu (⋮) → "Add to Home screen"
3. Tap "Add"

### iOS
1. Open site in Safari
2. Share button (□↑)
3. "Add to Home Screen"
4. Tap "Add"

## That's it! 🎉

Your Judgement score tracker is now installed and ready to use offline.

---

## Troubleshooting

**Icons not showing?**
- Make sure you downloaded both PNG files
- Place them in the root directory
- Clear browser cache

**Can't install as app?**
- Must use HTTPS (GitHub Pages provides this)
- Check browser console for errors
- Try different browser

**App not updating?**
- Edit `sw.js` line 1: Change `'judgement-v1'` to `'judgement-v2'`
- Commit and push changes
- Clear browser cache on device
