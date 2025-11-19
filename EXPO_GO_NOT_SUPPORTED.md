# Expo Go Not Supported - Use Dev Client

## Problem

```
Error: Exception in HostFunction: <unknown>
NativeReanimated
```

**Root Cause:** Your app uses `react-native-reanimated` which requires native modules that **Expo Go does not support**.

## Why Expo Go Doesn't Work

Expo Go is a sandbox app with pre-built native modules. It cannot:
- Load custom native code (like Reanimated)
- Support all third-party libraries
- Handle native module version mismatches

Your app uses these features that require native code:
- `react-native-reanimated` (animations)
- `react-native-gesture-handler` (swipe gestures)
- Custom native configurations

## Solution: Use Expo Dev Client

Expo Dev Client is like a custom version of Expo Go built specifically for your app.

### Step 1: Build Dev Client for iOS (One-Time, ~5 minutes)

```bash
# Clean any previous builds
npx expo prebuild --clean

# Build and install on your iOS device/simulator
npx expo run:ios
```

This will:
1. Generate native iOS project
2. Install all native dependencies
3. Build and launch the app
4. Install dev client on your device

### Step 2: Daily Development

After the initial build, use this command daily:

```bash
# Start dev server in dev client mode
npx expo start --dev-client
```

Then:
- **On Simulator:** App opens automatically
- **On Physical Device:** Scan QR code in the dev client app (not Expo Go)

## What Changes?

### Before (Expo Go)
- ❌ Limited native modules
- ❌ Can't use Reanimated
- ❌ Version conflicts
- ✅ No build required
- ✅ Quick to start

### After (Dev Client)
- ✅ Full native module support
- ✅ Reanimated works perfectly
- ✅ Production-ready
- ⏱️ Initial build: 5-10 min
- ⏱️ Daily start: same as Expo Go

## Commands Summary

```bash
# One-time setup (do this now)
npx expo prebuild --clean
npx expo run:ios

# Daily development (after setup)
npx expo start --dev-client

# If you need to rebuild (rare)
npx expo prebuild --clean
npx expo run:ios
```

## What Gets Created

After `npx expo prebuild`:
- `/ios` folder - Native iOS project
- `/android` folder - Native Android project (if you run android)

These folders are gitignored by default but can be committed if needed.

## Troubleshooting

### Build fails?
```bash
# Clear everything and try again
rm -rf ios android
npx expo prebuild --clean
npx expo run:ios
```

### Wrong device?
```bash
# List available simulators
xcrun simctl list devices

# Run on specific simulator
npx expo run:ios --simulator="iPhone 15 Pro"

# Run on physical device
npx expo run:ios --device
```

### Metro bundler issues?
```bash
# Clear cache
npx expo start --dev-client --clear
```

## Alternative: Remove Animations (Not Recommended)

If you absolutely cannot build right now, you could temporarily disable animations:

1. Comment out Reanimated imports in these files:
   - `screens/ChallengeMeScreen.tsx`
   - `screens/MinimalChallengeMeScreen.tsx`
   - `ui/components/AnimatedGlassCard.tsx`
   - `ui/components/SwipeableCardStack.tsx`
   - `ui/components/MinimalVibeInput.tsx`
   - `ui/components/RainbowButton.tsx`
   - `ui/components/ActivityDetailModal.tsx`
   - `ui/components/TextShimmer.tsx`
   - `ui/components/LoadingShimmer.tsx`

2. Replace animated components with regular React Native components

**But this breaks major features** like swipeable cards, Challenge Me, and all animations.

## Recommended Action

**Just build the dev client - it's worth the 5 minutes:**

```bash
npx expo prebuild --clean && npx expo run:ios
```

After this one-time setup, development is exactly the same as Expo Go, but with full native support.

## Why This Happened

You're building a production app with:
- Advanced animations (Reanimated)
- Gesture handling (swipeable cards)
- Custom UI components

These features require native code that Expo Go's sandbox cannot provide. This is normal and expected for any serious React Native app.

**Expo Dev Client is the standard development workflow for production apps.**

---

**Next Command:**
```bash
npx expo prebuild --clean && npx expo run:ios
```

This will fix the error permanently and give you full native module support.
