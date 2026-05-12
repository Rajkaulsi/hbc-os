# HBC Enterprise Consultant OS — Progressive Web App (V20-PWA)

Victorian building consulting platform — installable on iPhone, iPad, Android, Windows, Mac. Works offline. Optional Google Drive sync for cross-device backup.

## What's in this folder

```
HBC_PWA/
├── index.html              ← The app (468KB single-file)
├── manifest.json           ← PWA manifest (icons, app metadata)
├── sw.js                   ← Service worker (offline + caching)
├── icon-192.png            ← PWA icon (192×192)
├── icon-512.png            ← PWA icon (512×512)
├── icon-192-maskable.png   ← Maskable icon (Android adaptive)
├── icon-512-maskable.png   ← Maskable icon (large)
├── apple-touch-icon.png    ← iOS home screen (180×180)
├── apple-touch-icon-167.png ← iPad Pro
├── apple-touch-icon-152.png ← iPad
├── apple-touch-icon-120.png ← iPhone older
├── favicon-32.png          ← Browser tab icon
├── favicon-16.png          ← Browser tab icon (small)
├── splash-1284x2778.png    ← iOS splash — iPhone Pro Max
├── splash-1179x2556.png    ← iOS splash — iPhone 14/15/16
├── splash-1170x2532.png    ← iOS splash — iPhone 12/13/14 standard
└── splash-750x1334.png     ← iOS splash — iPhone SE
```

---

## Quick start — local testing

Open `index.html` directly in any modern browser to use as a normal HTML app. The PWA features (install, offline, service worker) require it to be served over HTTPS.

For local PWA testing:
```bash
cd HBC_PWA
python3 -m http.server 8000
# then visit http://localhost:8000 in Chrome
```

Chrome treats `localhost` as secure so service workers, install prompts, etc. all work.

---

## Deploying for real (free hosting)

### Option 1: GitHub Pages (recommended — easiest)

1. Create a free GitHub account at github.com.
2. Create a new repository (public) called e.g. `hbc-os`.
3. Upload every file from this folder into the repo (drag-and-drop in the GitHub web UI works).
4. Go to **Settings → Pages**.
5. Under "Source", select **Deploy from a branch**, branch **main**, folder **/ (root)**.
6. Click **Save**. After ~1 minute your app is live at:

   ```
   https://YOUR-USERNAME.github.io/hbc-os/
   ```

7. Open that URL in iPhone Safari → Share → **Add to Home Screen**.

### Option 2: Cloudflare Pages

1. Create a free Cloudflare account.
2. Pages → Create a project → Upload assets.
3. Drag the whole folder. Done.

### Option 3: Netlify

1. Sign in to netlify.com (free).
2. Drag the folder onto **netlify.com/drop**. Done.

All three give you HTTPS automatically — required for PWA features.

---

## Installing on iPhone / iPad

1. Open the deployed URL in **Safari** (must be Safari, not Chrome on iOS).
2. Tap the **Share button** (square with arrow up) at the bottom.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top-right.
5. The HBC icon appears on your home screen. Tap to open — runs full-screen, offline-capable, no Safari chrome.

**iOS minimum:** iOS 16.4 or later for full PWA support (push notifications, etc). Earlier iOS versions still work but without push support.

## Installing on Android

1. Open the URL in **Chrome**.
2. Chrome shows an "Install" prompt automatically — tap **Install**.
3. Alternatively: menu (three dots) → **Add to Home Screen** → **Install**.

## Installing on Windows / Mac / Linux

1. Open the URL in **Chrome** or **Edge**.
2. An install icon (□ with ↓) appears in the address bar — click it.
3. Or: Chrome menu → **Install HBC OS…**

---

## Storage — how it works

### Local (always available, even offline)

- **IndexedDB** stores the full project including all photos. No size limit (Chrome ~6GB+, Safari ~1GB+).
- **localStorage** stores app settings (which tab was last open, Google Drive Client ID) — small footprint only.
- Auto-saves to IndexedDB every **60 seconds** if data has changed.
- Manual save: Settings tab → **💾 Save now**.

### Google Drive sync (optional — for cross-device backup)

When signed in, the app uploads a JSON backup to your Google Drive's hidden **Application Data folder**. This folder is invisible in the regular Drive UI — only this app can read/write to it. You cannot accidentally delete it from Drive.

- **Auto-syncs every 5 minutes** when signed in + online.
- Manual: Settings tab → **☁ Backup to Drive now**.
- Load from another device: Settings tab → **📂 Load from Drive** → pick a backup.

#### Setting up Google Drive sync (one-time, ~10 minutes)

To use Drive sync you need your own free Google OAuth Client ID. Anthropic / Homi can't ship one — Google ties Client IDs to specific origins (your deployed URL).

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)** and sign in.
2. Click **Select a project** → **New Project**. Name: `HBC OS`. Click **Create**.
3. In the search bar, search for **Drive API**, click **Enable**.
4. Left menu → **APIs & Services** → **OAuth consent screen**:
   - User type: **External**.
   - Fill in App name (`HBC OS`), user support email (your email), developer email (your email).
   - Click **Save and Continue** through Scopes (nothing to add), Test users (add your own email).
   - Click **Back to Dashboard**.
5. Left menu → **Credentials** → **+ Create Credentials** → **OAuth client ID**.
6. Application type: **Web application**.
7. Name: `HBC OS PWA`.
8. **Authorised JavaScript origins** → **+ Add URI** → enter your deployed origin, e.g.
   ```
   https://YOUR-USERNAME.github.io
   ```
   (no trailing slash; for localhost testing also add `http://localhost:8000`).
9. **Authorised redirect URIs** — leave empty.
10. Click **Create**. Copy the **Client ID** shown (looks like `123456789-abc...apps.googleusercontent.com`).
11. Open your HBC OS app → **Settings tab** → scroll to **⚙ Google Drive Setup** → paste the Client ID → **Save Client ID**.
12. Click **🔐 Sign in with Google** → grant permission → done.

---

## App features (PWA-specific)

| Feature | Status |
|---|---|
| Installable on iPhone via Add to Home Screen | ✅ |
| Installable on Android via Chrome Install | ✅ |
| Installable on Windows / Mac via Chrome/Edge | ✅ |
| Works fully offline (after first load) | ✅ |
| Photos stored without filling browser storage | ✅ (IndexedDB) |
| iPhone notch / dynamic island safe-area | ✅ |
| iPhone splash screens (4 device sizes) | ✅ |
| Status bar matches app colour | ✅ |
| App shortcuts (long-press icon: Inspect, Admin, Knowledge) | ✅ |
| Auto-save every 60 seconds | ✅ |
| Google Drive sync every 5 minutes | ✅ |
| Update notifications when new version deployed | ✅ |
| Online/offline indicator | ✅ |
| Toast notifications | ✅ |
| Deep links — open specific tab via URL `?tab=N` | ✅ |
| Export/import JSON for manual backup | ✅ |

---

## Updating the app

When you make changes to `index.html`:

1. Bump the version in `sw.js`:
   ```js
   const CACHE_VERSION = 'hbc-os-v1.0.1';  // increment
   ```
2. Upload the new files to your host (GitHub Pages auto-deploys on push).
3. When users next open the app, they see a "🔄 A new version is available" banner — tap **Update now**.

---

## Troubleshooting

**"App won't install on iPhone"**
- Must use Safari (not Chrome on iOS).
- Must be served over HTTPS (not `file://` directly).
- iOS 11.3 or later.

**"Google Drive sign-in fails"**
- Check the **Authorised JavaScript origins** in Google Cloud Console exactly matches your deployed URL (no trailing slash, exact protocol).
- For localhost testing, add `http://localhost:8000` (or whatever port you use).
- Make sure your Google account is added as a **Test user** in OAuth consent screen.

**"Old version keeps loading"**
- Settings tab → **🗑 Clear app cache** → reload.
- Or in Chrome DevTools: Application → Service Workers → Unregister → reload.

**"Photos take ages to save"**
- The app resizes photos to max 1200px at 78% JPEG quality before storing. Very large originals still take a second.

**"Lost data after clearing browser cache"**
- IndexedDB survives normal cache clears, but **Clear All Site Data** wipes it.
- Use Google Drive sync or **Export as JSON** weekly for a backup.

---

## Credits

Built by Claude for Homi Building Consultants. Open source — modify and re-deploy as needed.
