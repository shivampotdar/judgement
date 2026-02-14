# 🎴 Judgement Score Tracker

A beautiful Progressive Web App (PWA) for tracking scores in the Judgement/Kachuful card game. Features automatic score calculation, bid validation, and persistent game state.

![Judgement Game](https://img.shields.io/badge/PWA-Ready-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🎯 **Smart Bidding Logic** - Enforces sum≠tricks rule with visual warnings
- 🔄 **Auto-rotation** - Dealer and first bidder rotate automatically
- 🎨 **Card Game Aesthetic** - Green felt background with suit icons
- 💾 **Auto-save** - Game state persists in localStorage
- 📱 **Mobile-first** - Responsive design for all devices
- ⚡ **Offline Support** - Works without internet after first load
- 📲 **Installable** - Add to home screen on iOS/Android

## 🚀 Quick Deploy to GitHub Pages

### 1. Generate Icons (One-time Setup)

**Option A: Using Python**
```bash
pip install cairosvg
python generate-icons.py
```

**Option B: Online Converter**
1. Go to [CloudConvert](https://cloudconvert.com/svg-to-png)
2. Upload `icon.svg`
3. Set dimensions to 192x192px, download as `icon-192.png`
4. Repeat with 512x512px, download as `icon-512.png`

### 2. Create GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Judgement Score Tracker PWA"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/judgement-game.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **main** branch
4. Click **Save**
5. Your app will be live at: `https://YOUR_USERNAME.github.io/judgement-game/`

**Note:** If deploying to a repository (not username.github.io), update these files:
- `manifest.json`: Change `"start_url"` and `"scope"` to `"/judgement-game/"`
- `index.html`: Change all `/` paths to `/judgement-game/`
- `sw.js`: Update the cache paths accordingly

### 4. Install as PWA

**On Android:**
1. Open the site in Chrome
2. Tap the menu (⋮) → "Add to Home screen"
3. Tap "Add"

**On iOS:**
1. Open the site in Safari
2. Tap the Share button (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

## 📁 Project Structure

```
judgement-game/
├── index.html              # Main HTML file
├── judgement-game.jsx      # React game component
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── icon.svg                # Source icon
├── icon-192.png           # PWA icon (192x192)
├── icon-512.png           # PWA icon (512x512)
├── generate-icons.py      # Icon generator script
├── .nojekyll              # Disable Jekyll processing
└── README.md              # This file
```

## 🎮 How to Play

1. **Setup**: Enter number of players and their names
2. **Trump Selection**: Dealer selects or confirms trump suit
3. **Bidding**: Each player predicts how many hands they'll win
   - Last player cannot bid if it makes sum = total tricks
4. **Review Bids**: Check all bids, edit if needed, then start round
5. **Playing**: Enter actual hands won for each player
6. **Scoring**: 
   - Match prediction: 10 + hands won
   - Miss prediction: 0 points
7. **Next Round**: Continue until all rounds complete

## 🛠️ Development

### Local Testing

Simply open `index.html` in a browser. For best PWA testing, use:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .
```

Then visit `http://localhost:8000`

### Updating the App

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages will automatically update (may take 1-2 minutes).

**Important:** Update the cache version in `sw.js` after changes:
```javascript
const CACHE_NAME = 'judgement-v2'; // Increment version
```

## 🎨 Customization

### Change Colors

Edit the CSS variables in `index.html` or the component colors in `judgement-game.jsx`:
- Green felt: `#166534`, `#15803d`
- Gold accents: `#fbbf24`, `#f59e0b`
- Suit colors: Hearts/Diamonds `#DC2626`, Clubs/Spades `#1F2937`

### Change Fonts

Update the Google Fonts import in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap">
```

## 📱 Browser Support

- ✅ Chrome/Edge (Android/Desktop)
- ✅ Safari (iOS/macOS)
- ✅ Firefox (Android/Desktop)
- ✅ Samsung Internet

## 🐛 Troubleshooting

**Icons not showing:**
- Make sure you generated PNG files from SVG
- Check browser console for 404 errors
- Verify paths in manifest.json

**App not installing:**
- Must be served over HTTPS (GitHub Pages does this automatically)
- Check manifest.json is valid at `https://manifest-validator.appspot.com/`
- Clear browser cache and reload

**Game state lost:**
- Check if localStorage is enabled in browser
- Don't use private/incognito mode

**Service worker not updating:**
- Increment version in `sw.js`
- Clear browser cache
- Unregister old service worker in DevTools

## 📄 License

MIT License - feel free to use and modify for your games!

## 🙏 Credits

Built with:
- React 18
- Lucide Icons
- Google Fonts (Crimson Text, Fredoka, Poppins)
- Love for card games ❤️

---

**Enjoy your Judgement games! 🎴**
