# iOS Simulator Build Guide (No Apple Account Needed)

## The Solution

For **iOS Simulator** development, you don't need EAS or a paid Apple Developer account. Just build locally:

```bash
npx expo run:ios
```

This will:
1. Generate native iOS project (if not already done)
2. Compile the app with Xcode
3. Install on iOS Simulator
4. Launch the app
5. Start Metro bundler

## Why EAS Failed

EAS builds are for:
- Physical devices
- App Store distribution
- TestFlight

They require a **paid Apple Developer account ($99/year)**.

## Local Builds Are Free

Building for the **iOS Simulator** is completely free and doesn't require:
- ❌ Apple Developer account
- ❌ Code signing
- ❌ Provisioning profiles
- ❌ EAS subscription

## Step-by-Step: Build for Simulator

### 1. Make Sure Xcode is Installed

```bash
# Check Xcode installation
xcode-select -p

# If not installed, install from App Store
# Then run:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### 2. Accept Xcode License

```bash
sudo xcodebuild -license accept
```

### 3. Build and Run

```bash
# This command does everything
npx expo run:ios
```

**What happens:**
- Generates `/ios` folder (if needed)
- Installs CocoaPods dependencies
- Compiles native code with Xcode
- Launches iOS Simulator
- Installs and runs your app
- Starts Metro bundler

**First build:** ~5-10 minutes
**Subsequent builds:** ~30 seconds

## Fixing the Folly Error

The build might still fail with the Folly coroutine error. Here's the fix:

### Option A: Patch Folly Header (Recommended)

Create a patch file to fix the missing header:

```bash
# Create patches directory
mkdir -p patches

# Create patch file
cat > patches/react-native+0.81.4.patch << 'EOF'
diff --git a/node_modules/react-native/ReactCommon/react/nativemodule/core/platform/ios/RCTTurboModule.mm b/node_modules/react-native/ReactCommon/react/nativemodule/core/platform/ios/RCTTurboModule.mm
--- a/node_modules/react-native/ReactCommon/react/nativemodule/core/platform/ios/RCTTurboModule.mm
+++ b/node_modules/react-native/ReactCommon/react/nativemodule/core/platform/ios/RCTTurboModule.mm
@@ -1,3 +1,4 @@
+#define FOLLY_NO_CONFIG 1
 /*
  * Copyright (c) Meta Platforms, Inc. and affiliates.
  *
EOF

# Install patch-package
npm install --save-dev patch-package

# Add postinstall script to package.json
```

Then add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

### Option B: Disable Folly Coroutines in Podfile (Already Done)

We already added this to your Podfile:
```ruby
config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_NO_CONFIG'
config.build_settings['FOLLY_HAVE_COROUTINES'] = '0'
```

### Option C: Update React Native (If Errors Persist)

```bash
# Update to latest 0.81.x
npm install react-native@0.81.7

# Reinstall pods
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..

# Rebuild
npx expo run:ios
```

## If Build Still Fails

Try this clean rebuild:

```bash
# 1. Clean everything
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock
rm -rf node_modules
rm -rf .expo

# 2. Reinstall
npm install

# 3. Regenerate iOS project
npx expo prebuild --clean --platform ios

# 4. Install pods
cd ios && pod install && cd ..

# 5. Build
npx expo run:ios
```

## Choose Your Simulator

```bash
# List available simulators
xcrun simctl list devices

# Run on specific simulator
npx expo run:ios --simulator="iPhone 15 Pro"
npx expo run:ios --simulator="iPhone 14"
npx expo run:ios --simulator="iPad Pro (12.9-inch)"
```

## Daily Development Workflow

After the initial build succeeds:

```bash
# Option 1: Automatic (rebuilds if needed)
npx expo run:ios

# Option 2: Manual (faster if no native changes)
npx expo start --dev-client
# Then press 'i' to open iOS simulator
```

## What You Get

✅ Full Reanimated support
✅ All animations working
✅ Gesture handling
✅ Challenge Me screen
✅ Swipeable cards
✅ All native modules
✅ Hot reload
✅ Fast Refresh
✅ Chrome DevTools

## Troubleshooting

### "xcodebuild: command not found"
```bash
# Install Xcode from App Store
# Then:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### "No simulators available"
```bash
# Open Xcode
# Xcode → Settings → Platforms → iOS
# Download iOS simulator
```

### "Build failed with exit code 65"
```bash
# Clean build
cd ios
xcodebuild clean
cd ..
npx expo run:ios
```

### Metro bundler issues
```bash
# Clear cache
npx expo start --clear
```

## Summary

**Don't use:** `eas build` (requires paid Apple account)
**Do use:** `npx expo run:ios` (free, works on simulator)

**Next command:**
```bash
npx expo run:ios
```

This will build your app with full Reanimated support and run it on the iOS Simulator - no Apple Developer account needed!
