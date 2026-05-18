# 📱 EternalVault — Build Android APK

## Prerequisites (one-time install)

### 1. Node.js
- Download from https://nodejs.org (LTS version)
- Install → Restart PC

### 2. Java JDK 17
- Download from https://adoptium.net
- Install the **Temurin JDK 17** (LTS)
- After install, verify: open Command Prompt → type `java -version`

### 3. Android Studio
- Download from https://developer.android.com/studio
- Install → Open Android Studio once → it will download Android SDK
- In Android Studio: **Tools → SDK Manager → SDK Platforms** → make sure **Android 14 (API 34)** is checked
- **SDK Tools tab** → check **Android SDK Build-Tools**, **Android SDK Command-line Tools**

## Build the APK

### Method 1: One-Click (after prerequisites installed)
Double-click `BUILD-APK.bat`

### Method 2: Command Line
```bash
npm install
npm run build
npx cap add android      # first time only
npx cap sync android
cd android
gradlew.bat assembleDebug
```

### Method 3: Via Android Studio
```bash
npm install
npm run build
npx cap add android      # first time only
npx cap sync android
npx cap open android     # opens in Android Studio
```
Then in Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

## Find Your APK
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Install on Your Phone

1. **Transfer** the `app-debug.apk` to your phone (WhatsApp, Email, Google Drive, USB cable)
2. **Tap** the APK file on your phone
3. If prompted, go to **Settings → Allow install from this source**
4. Tap **Install**
5. Open **EternalVault** from your app drawer!

## Sync Data: Desktop ↔ Mobile

After installing on both Desktop and Mobile:

1. On Desktop: Open EternalVault → **Sync Data** tab → **Download My Vault File**
2. Send the `.json` file to your phone (WhatsApp/Email/Drive)
3. On Mobile: Open EternalVault → **Sync Data** tab → **Select Vault File to Import**
4. Done! Same user, same data, both devices.

To sync changes back: repeat in reverse (export from Mobile → import on Desktop).
