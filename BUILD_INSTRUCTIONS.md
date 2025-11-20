# ✅ How to Build Vibe App (Sandbox Issue Workaround)

## The Problem

Command-line builds (`npx expo run:ios`) fail with sandbox errors:
```
Sandbox: rsync(xxx) deny(1) file-write-create
Sandbox: bash(xxx) deny(1) file-write-create
```

This is a macOS security restriction that affects Expo CLI builds.

## ✅ Solution: Build in Xcode

Xcode has proper permissions and builds successfully.

### Quick Start

```bash
./BUILD_ON_DEVICE.sh
```

This opens Xcode automatically.

### Manual Steps

1. **Open Xcode:**
   ```bash
   open ios/VIBEDEBUG.xcworkspace
   ```

2. **Select your device:**
   - Top toolbar → Device dropdown
   - Choose **"Michael"** (your iPhone) or **"iPhone 17 Pro Max"** (simulator)

3. **Build:**
   - Press **Play (▶)** button
   - Or press **Cmd + R**

4. **First time on device:**
   - iPhone: Settings → General → VPN & Device Management
   - Tap your Apple ID → Trust

5. **Start Metro:**
   ```bash
   npx expo start --dev-client
   ```

## What's Working

✅ **All animations** (Reanimated 4.1.5 + Worklets 0.6.1)
✅ **Swipeable cards** (Challenge Me)
✅ **Gesture interactions**
✅ **All features** (516 activities, AI recs, filters, profiles)
✅ **Folly patch applied** (for React Native 0.81.4)

## Build Configurations

### For Simulator
- Select any iPhone simulator from device dropdown
- Build and run (Cmd + R)
- No signing required

### For Physical Device
- Select your iPhone from device dropdown
- Xcode handles signing automatically (Apple Developer account)
- Trust certificate on device first time

## Troubleshooting

### If Build Fails in Xcode

1. **Clean build:**
   - Xcode → Product → Clean Build Folder (Shift + Cmd + K)
   - Try building again

2. **Reapply Folly patch:**
   ```bash
   chmod +w ios/Pods/ReactNativeDependencies/Headers/folly/Expected.h ios/Pods/ReactNativeDependencies/Headers/folly/Optional.h
   sed -i '' 's/#if FOLLY_HAS_COROUTINES$/#if FOLLY_HAS_COROUTINES \&\& 0/' ios/Pods/ReactNativeDependencies/Headers/folly/Expected.h ios/Pods/ReactNativeDependencies/Headers/folly/Optional.h
   ```

3. **Reinstall pods:**
   ```bash
   cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
   # Then reapply Folly patch (step 2)
   ```

### If Metro Won't Start

```bash
npx expo start --dev-client --clear
```

### If App Won't Connect

- Make sure iPhone and Mac are on same WiFi
- Check Metro is running (should show QR code)
- Restart the app on device

## Why Xcode Works

- Xcode runs with proper macOS permissions
- No sandbox restrictions on file operations
- Direct access to build artifacts
- Proper code signing integration

## Command Line Alternative

If you need command-line builds, use EAS Build (cloud builds):

```bash
npm install -g eas-cli
eas build --platform ios --profile development
```

This builds in the cloud without sandbox restrictions.

## Summary

**Always build through Xcode for local development.**

The app is fully functional with all animations. The sandbox issue is purely a build-time restriction, not a runtime problem.

🎉 **Your app is ready to test!**
