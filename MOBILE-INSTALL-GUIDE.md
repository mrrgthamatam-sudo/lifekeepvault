# 📱 LifeKeepVault — Install on ALL Mobile Platforms

## Quick Summary

| Platform | Method | Difficulty |
|---|---|---|
| **Android** | APK file (build & install) | ⭐⭐ Medium |
| **iPhone/iPad** | PWA (add to home screen) | ⭐ Easy |
| **Any phone** | Open web app in browser | ⭐ Easiest |

---

## 🤖 Android — APK Installation

### Prerequisites (one-time on your PC)

1. **Node.js** — [nodejs.org](https://nodejs.org) (LTS)
2. **Java JDK 17** — [adoptium.net](https://adoptium.net) → Temurin 17 LTS
3. **Android Studio** — [developer.android.com/studio](https://developer.android.com/studio)

**After installing Android Studio:**
- Open it once → let it download Android SDK (~2GB)
- Go to **Tools → SDK Manager → SDK Platforms** → check **Android 14 (API 34)**
- **SDK Tools tab** → check **Android SDK Build-Tools** + **Command-line Tools**
- Close Android Studio

### Build the APK

**Method 1: Double-click**
```
Double-click BUILD-APK.bat
```

**Method 2: Command line**
```bash
cd "C:\Users\Ravindra Goud\Downloads\family-information-management-application"
node build-mobile.cjs
```

### Find your APK
```
android\app\build\outputs\apk\debug\LifeKeepVault.apk
```

### Install on Android phone

1. **Transfer** the `LifeKeepVault.apk` to your phone:
   - WhatsApp → send as document
   - Email → attach to yourself
   - Google Drive → upload, download on phone
   - USB cable → copy to phone storage

2. **Tap** the APK file on your phone

3. If prompted: **Settings → Allow install from this source** → toggle ON

4. Tap **Install**

5. Open **LifeKeepVault** from your app drawer! 🎉

### Supported Android versions
- Android 7.0+ (API 24 and above)
- Works on: Samsung, OnePlus, Xiaomi, Realme, Vivo, OPPO, Pixel, Motorola, etc.

---

## 🍎 iPhone / iPad — PWA Installation

iPhones don't support APK files. Instead, install as a **Progressive Web App (PWA)**:

1. Host the web app online (Netlify, Vercel, GitHub Pages) OR use a local URL
2. Open the URL in **Safari** (⚠️ Must be Safari, not Chrome!)
3. Tap the **Share button** (□↑) at bottom center
4. Scroll down → tap **"Add to Home Screen"**
5. Name it **"LifeKeepVault"** → tap **Add**
6. App icon appears on your home screen — opens fullscreen!

### PWA features on iPhone:
- ✅ Fullscreen (no browser bar)
- ✅ Own app icon on home screen
- ✅ Works offline after first load
- ✅ All features work (camera, file upload, etc.)
- ❌ No App Store listing (it's a web app)

---

## 🌐 Any Phone — Browser Access

The simplest option — works on **every phone** with a browser:

1. Host the web app (or use local network)
2. Open the URL in any browser (Chrome, Safari, Firefox, Edge)
3. All features work — no installation needed
4. Bookmark it for quick access

---

## 🔄 Sync Data Between Desktop & Mobile

After installing on both devices:

```
DESKTOP → Sync Data tab → "Download My Vault File" → .json file
PHONE   → Open LifeKeepVault → Sync Data → "Import" → select .json
```

Both devices now have the same data!

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `gradlew` not found | Open Android Studio once to generate project files |
| `JAVA_HOME` not set | Install JDK 17 from adoptium.net, restart PC |
| `SDK not found` | Open Android Studio → SDK Manager → install API 34 |
| APK won't install on phone | Enable "Install from unknown sources" in phone settings |
| iPhone can't install APK | Use Safari PWA method instead (iPhones don't support APK) |
| Camera not working in PWA | Must be served over HTTPS (not HTTP) |

---

## 📋 What the APK Includes

- ✅ All 16 modules (Personal, Family, Loans, Insurance, etc.)
- ✅ Document scanner with auto-crop
- ✅ Password vault
- ✅ File upload/download
- ✅ Multi-user login
- ✅ Profile picture
- ✅ Data sync
- ✅ Works 100% offline
- ✅ All data stays on YOUR device
