# Google Play Store Listing & Upload Guide

Everything you need to publish **Chess Timer Pro** to Google Play Store.

---

## 1. Play Store Text Assets (Copy-Paste Ready)

### App Title (Max 30 characters):
```
Chess Timer Pro - Chess Clock
```

### Short Description (Max 80 characters):
```
Professional offline digital chess clock with Fischer increments & FIDE rules.
```

### Full Description (Up to 4000 characters):
```
Chess Timer Pro is a clean, tournament-grade digital chess clock and timer designed for over-the-board games, blitz tournaments, rapid matches, and casual play with friends.

Key Features:
• 100% Offline & Ad-Free: Zero internet required, no subscriptions, and absolutely no distracting ads.
• Face-to-Face Dual Display: The top player's clock is permanently inverted 180° so two players facing each other can easily view and tap their timer.
• 180° Swap Sides: Instantly swap Black and White clocks with a single tap before the game begins.
• Illegal Move Penalty System: One-tap FIDE official time penalties (+1 min Blitz, +2 min Rapid, or custom adjustments).
• Standard Tournament Presets:
  - Bullet: 1m, 1m+1s, 2m+1s
  - Blitz: 3m, 3m+2s, 5m, 5m+3s, 5m+5s
  - Rapid: 10m, 15m+10s (FIDE standard), 20m
  - Classical: 30m, 60m, 90m+30s
• Custom Time Controls: Independently configure base minutes, seconds, and Fischer increments or Sudden Death for each player.
• Sound & Haptic Feedback: Authentic mechanical click sounds, low time warnings (< 10 seconds), and timeout buzzers with optional tactile vibration.
• Move Counter & History: Comprehensive move log tracking remaining time and elapsed duration per move.
• Battery Efficient & Battery Saver: Optimized lightweight performance that keeps your screen awake during gameplay.

Whether you are preparing for a chess tournament or enjoying a blitz match at your local club, Chess Timer Pro delivers the ultimate clock experience.
```

---

## 2. Graphic Assets Prepared

All required Google Play graphic assets are saved in the `playstore/` directory:
- **App Icon:** `playstore/app-icon-512x512.png` (512x512 PNG, 32-bit color, < 1024KB)
- **Feature Graphic:** `playstore/feature-graphic-1024x500.png` (1024x500 PNG, exact Play Store dimensions)
- **Privacy Policy URL:** Host `public/privacy-policy.html` on your web domain or GitHub Pages (e.g. `https://<username>.github.io/<repo>/privacy-policy.html`)

---

## 3. Play Store Questionnaire Answers

- **Category:** Games > Board  *(or Tools / Utilities)*
- **Content Rating:** Everyone / PEGI 3 (No violence, no objectionable content)
- **Target Audience:** All ages (13+ or General)
- **Data Safety:**
  - Does your app collect data? **No**
  - Does your app share data with third parties? **No**
  - All data handled locally on-device.
- **Ads:** "No, my app does not contain ads."
- **Financial Features / Government Features / Health:** "No"

---

## 4. How to Generate the Signed Release Bundle (.aab)

Google Play requires an `.aab` (Android App Bundle), not an `.apk`.

### Step 1: Generate Release Keystore (Run once on your PC/Terminal):
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias chesstimer-key
```
*(Keep this keystore file and password safe! You will need it for all future app updates).*

### Step 2: Build the Web App
```bash
npm run build
```

### Step 3: Copy Android Icons & Sync Capacitor
```bash
# Ensure the new light blue icons are copied to android/
cp -r android-res/* android/app/src/main/res/

# Sync capacitor
npx cap sync android
```

### Step 4: Build the Release AAB with Gradle
```bash
cd android
./gradlew bundleRelease
```

The output file will be at:
`android/app/build/outputs/bundle/release/app-release-unsigned.aab`

### Step 5: Sign the AAB with your Keystore
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore my-release-key.jks android/app/build/outputs/bundle/release/app-release-unsigned.aab chesstimer-key
```
Then rename or upload this `.aab` to Google Play Console under **Production > Create new release**!
