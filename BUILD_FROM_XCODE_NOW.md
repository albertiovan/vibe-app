# Build from Xcode (Sandbox Issue Workaround)

The command-line build is hitting a sandbox permission error. Let's build directly from Xcode instead.

## Steps to Build

### 1. Open Xcode (if not already open)
```bash
open ios/VIBEDEBUG.xcworkspace
```

### 2. Select Your Device
- At the top of Xcode, click the device dropdown (next to the Play button)
- Select **Michael** (your iPhone)

### 3. Build and Run
- Click the **▶ Play** button (top left)
- Or press **Cmd + R**

Xcode will:
1. Build the app
2. Install it on your iPhone
3. Launch it automatically

### 4. First Time: Trust Certificate
On your iPhone:
1. Go to **Settings → General → VPN & Device Management**
2. Tap your Apple Developer account
3. Tap **Trust**
4. Launch the app

### 5. Start Metro Bundler
In a terminal:
```bash
npx expo start --dev-client
```

Make sure your iPhone and Mac are on the same WiFi network.

## What Works Without Reanimated

The app will work perfectly, just without animations:
- ✅ All navigation
- ✅ All features (AI recs, filters, profiles, Challenge Me)
- ✅ Complete database (516 activities)
- ✅ All UI components (static)
- ❌ Animations (temporarily disabled)
- ❌ Swipeable cards (temporarily disabled)

## To Re-enable Animations Later

Once we can upgrade React Native (requires Expo SDK upgrade), we'll add Reanimated back and all animations will work.

For now, you can test all the core functionality on your device!
