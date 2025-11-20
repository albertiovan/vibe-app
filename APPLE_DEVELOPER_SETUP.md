# Complete Apple Developer Setup Guide

## 🎉 You Have Apple Developer Account!

Now you can build and test the full Vibe app with all animations and gestures on your physical iPhone.

---

## Quick Start (3 Steps)

### 1. Configure Xcode with Your Apple ID

```bash
# Open Xcode
open /Applications/Xcode.app
```

Then:
1. Go to **Xcode → Settings** (or press `Cmd + ,`)
2. Click **Accounts** tab
3. Click the **+** button (bottom left)
4. Select **Apple ID**
5. Sign in with your Apple Developer credentials
6. Wait for Xcode to download certificates

### 2. Open Project and Configure Signing

```bash
cd /Users/aai/CascadeProjects/vibe-app
open ios/VIBEDEBUG.xcworkspace
```

In Xcode:
1. Select **VIBEDEBUG** in the left sidebar (under TARGETS)
2. Click **Signing & Capabilities** tab
3. Check ☑️ **Automatically manage signing**
4. Select your **Team** from dropdown (your Apple Developer account)
5. **Bundle Identifier**: Change to something unique if needed
   - Current: `com.albertiovan.vibeapp`
   - Example: `com.albertiovan.vibeapp.dev`

### 3. Connect iPhone and Build

```bash
# Connect your iPhone via USB
# Unlock it and trust this computer

# Run the build script
cd /Users/aai/CascadeProjects/vibe-app
./build-device.sh
```

**First time only:** After the app installs, go to iPhone **Settings → General → VPN & Device Management** → tap your developer account → **Trust**.

---

## What's Included

### ✅ All Features Working
- **Animations**: Glass morphism, transitions, fades
- **Swipeable Cards**: Challenge Me discovery interface
- **Gesture Interactions**: Swipe, tap, long-press
- **Complete Database**: 466 activities with full venue data
- **All Screens**: Home, Discovery, Challenge Me, Profile, etc.
- **Backend Integration**: AI recommendations, filters, profiles

### 🎨 Design System
- Glass morphism with blur effects
- Gradient backgrounds
- Smooth 60fps animations via Reanimated
- Modern iOS-native feel

---

## Building Options

### Option A: Automated Script (Recommended)
```bash
./build-device.sh
```

### Option B: Manual Build
```bash
# Apply Folly patch
chmod +w ios/Pods/Headers/Public/ReactNativeDependencies/folly/*.h 2>/dev/null
perl -pi -e 's/#if FOLLY_HAS_COROUTINES\s*$/#if FOLLY_HAS_COROUTINES \&\& 0/' ios/Pods/Headers/Public/ReactNativeDependencies/folly/Expected.h ios/Pods/Headers/Public/ReactNativeDependencies/folly/Optional.h 2>/dev/null

# Build for connected device
npx expo run:ios --device
```

### Option C: Build from Xcode
1. Open `ios/VIBEDEBUG.xcworkspace` in Xcode
2. Select your iPhone from device dropdown
3. Press **▶ Play** button or `Cmd + R`

---

## Running the App

### Start Metro Bundler
The app needs Metro to load JavaScript:

```bash
npx expo start --dev-client
```

**Important:** Your iPhone must be on the **same WiFi network** as your Mac.

### Using the App
1. Launch the app on your iPhone
2. It will connect to Metro automatically
3. If it doesn't connect:
   - Shake your iPhone
   - Tap "Configure Bundler"
   - Enter your Mac's local IP (shown in Metro output)

---

## Troubleshooting

### "Failed to verify code signature"
**Solution:** Trust the developer certificate on your iPhone
- Settings → General → VPN & Device Management
- Tap your Apple Developer account
- Tap **Trust**

### "Could not connect to development server"
**Solutions:**
1. Ensure iPhone and Mac are on same WiFi network
2. Check Mac firewall settings (System Settings → Network → Firewall)
3. Manually configure bundler:
   - Shake iPhone → Configure Bundler
   - Enter Mac IP from Metro output (e.g., `10.103.28.232:8081`)

### Folly build errors
**Solution:** The Folly patch gets reset by `pod install`. Reapply it:
```bash
chmod +w ios/Pods/Headers/Public/ReactNativeDependencies/folly/*.h 2>/dev/null
perl -pi -e 's/#if FOLLY_HAS_COROUTINES\s*$/#if FOLLY_HAS_COROUTINES \&\& 0/' ios/Pods/Headers/Public/ReactNativeDependencies/folly/Expected.h ios/Pods/Headers/Public/ReactNativeDependencies/folly/Optional.h 2>/dev/null
```

### "No provisioning profile found"
**Solution:** In Xcode Signing & Capabilities:
1. Uncheck "Automatically manage signing"
2. Check it again
3. Select your Team again
4. Try changing Bundle Identifier to something unique

### Reanimated errors
**Solution:** Make sure `react-native-reanimated/plugin` is in `babel.config.js`:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
```

---

## Testing on Device Anywhere

Once the app is installed on your iPhone, you can test it anywhere:

### Development Mode (Requires Mac)
- iPhone must be on same WiFi as Mac
- Metro bundler must be running on Mac
- Good for: Active development, hot reload

### Standalone Mode (No Mac Needed)
For a fully standalone app that works without Metro:

1. **Build Release Version:**
   ```bash
   # In Xcode: Product → Scheme → Edit Scheme
   # Change Build Configuration to "Release"
   # Then build normally
   ```

2. **Or use EAS Build (cloud build):**
   ```bash
   npm install -g eas-cli
   eas build --platform ios --profile development
   ```

The standalone build will have all JavaScript bundled and work anywhere without WiFi connection to your Mac.

---

## Next Steps: Distribution

### TestFlight (Beta Testing)
1. **Create App in App Store Connect**
2. **Archive in Xcode:** Product → Archive
3. **Upload to App Store Connect**
4. **Invite testers via TestFlight**

### App Store Release
1. Complete App Store listing
2. Submit for review
3. Once approved, release to public

---

## Quick Reference

```bash
# Build for device
./build-device.sh

# Or manually
npx expo run:ios --device

# Start Metro
npx expo start --dev-client

# Build for simulator (testing)
npx expo run:ios

# Apply Folly patch (after pod install)
chmod +w ios/Pods/Headers/Public/ReactNativeDependencies/folly/*.h 2>/dev/null && perl -pi -e 's/#if FOLLY_HAS_COROUTINES\s*$/#if FOLLY_HAS_COROUTINES \&\& 0/' ios/Pods/Headers/Public/ReactNativeDependencies/folly/Expected.h ios/Pods/Headers/Public/ReactNativeDependencies/folly/Optional.h 2>/dev/null

# Reinstall pods (if needed)
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
```

---

## Current Setup

- ✅ Expo SDK 54
- ✅ React Native 0.81.4
- ✅ React 18.2.0
- ✅ Reanimated 3.6.3 (with Folly patch)
- ✅ All animations and gestures enabled
- ✅ Complete database (466 activities)
- ✅ Full backend integration

**You're ready to build and test on your iPhone! 🎉**
