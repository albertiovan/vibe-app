# Worklets Version Mismatch Fix (0.6.1 vs 0.5.1)

## 🐛 The Problem

**Error**: `[Worklets] Mismatch between JavaScript part and native part of Worklets (0.6.1 vs 0.5.1)`

**Root Cause**: 
- JavaScript side updated to Reanimated 4.x (includes Worklets 0.6.1)
- Native iOS modules still on old version (Worklets 0.5.1)
- This happens because **Expo Go** doesn't support custom native modules

---

## ⚠️ Critical Understanding

### Expo Go Limitation
**Expo Go cannot run apps with custom native code or updated native modules.**

React Native Reanimated 4.x requires native module updates that Expo Go doesn't include.

### Solution: Create a Development Build

You need to create a **custom development build** (like Expo Go, but with your native modules).

---

## 🚀 Fix Steps

### Option 1: Create Development Build (RECOMMENDED)

This creates a custom version of your app with the correct native modules:

```bash
# 1. Install EAS CLI (if not already installed)
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure your project
eas build:configure

# 4. Create a development build for iOS
eas build --profile development --platform ios

# 5. Install the build on your device
# Download from the link EAS provides and install via TestFlight or direct install
```

After installation, start your app:
```bash
npx expo start --dev-client
```

Scan the QR code with your **development build** (not Expo Go).

---

### Option 2: Downgrade Reanimated (TEMPORARY WORKAROUND)

If you need a quick fix to test with Expo Go:

```bash
# Downgrade to Reanimated 3.x (compatible with Expo Go)
npm install react-native-reanimated@~3.10.0

# Clear cache and restart
npx expo start --clear
```

**⚠️ Warning**: This removes the swipeable card stack feature since it requires Reanimated 4.x.

---

### Option 3: Use iOS Simulator with Prebuild

Build the native iOS project locally:

```bash
# 1. Generate native iOS folder
npx expo prebuild

# 2. Install iOS dependencies
cd ios && pod install && cd ..

# 3. Run on iOS simulator
npx expo run:ios
```

This creates a full native build on your Mac.

---

## 📱 Recommended Workflow

### For Development:
1. **Create EAS development build** (one-time setup)
2. **Install on your device** via TestFlight
3. **Use `npx expo start --dev-client`** for development
4. **Hot reload works** just like Expo Go

### Why Development Build?
- ✅ Supports all native modules (Reanimated 4.x, Gesture Handler, etc.)
- ✅ Hot reload and fast refresh still work
- ✅ Can test on real device
- ✅ Production-like environment
- ✅ One-time setup, reuse for months

---

## 🔧 Quick Commands

### Check your current Reanimated version:
```bash
npm list react-native-reanimated
```

### Clear everything and start fresh:
```bash
./FIX_IOS_WORKLETS.sh
```

### Start with development build:
```bash
npx expo start --dev-client --clear
```

### Start with Expo Go (limited features):
```bash
npx expo start --clear
```

---

## 🎯 What Each Option Gives You

| Feature | Expo Go | Development Build | Full Native Build |
|---------|---------|-------------------|-------------------|
| Swipeable Cards | ❌ | ✅ | ✅ |
| Reanimated 4.x | ❌ | ✅ | ✅ |
| Hot Reload | ✅ | ✅ | ✅ |
| Quick Setup | ✅ | ⚠️ (one-time) | ❌ |
| Real Device | ✅ | ✅ | ✅ |
| Custom Native Code | ❌ | ✅ | ✅ |

---

## 💡 Understanding the Error

### What are Worklets?
- Special functions that run on the UI thread (not JavaScript thread)
- Enable 60fps animations without blocking
- Required by React Native Reanimated for smooth gestures

### Why the Mismatch?
1. **JavaScript side** (your code): Uses Reanimated 4.x → Worklets 0.6.1
2. **Native side** (Expo Go): Has Reanimated 3.x → Worklets 0.5.1
3. **Result**: Version mismatch error

### The Fix:
Either:
- **Match JavaScript to Native**: Downgrade Reanimated to 3.x
- **Match Native to JavaScript**: Create development build with Reanimated 4.x

---

## 🆘 Troubleshooting

### "I don't want to create a development build"
→ Use Option 2 (downgrade Reanimated), but you'll lose the swipeable card feature.

### "EAS build is taking too long"
→ First build takes 10-20 minutes. Subsequent builds are faster (5-10 min).

### "Can I use the iOS Simulator?"
→ Yes! Use Option 3 (`npx expo prebuild` then `npx expo run:ios`).

### "I just want to test quickly"
→ Downgrade to Reanimated 3.x temporarily, test other features, then upgrade later.

---

## ✅ Recommended Solution

**Create a development build once, use it forever:**

```bash
# One-time setup (15-20 minutes)
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform ios

# Daily development (instant)
npx expo start --dev-client
```

This gives you the best of both worlds:
- ✅ All native features work (Reanimated 4.x, swipeable cards)
- ✅ Fast refresh and hot reload
- ✅ Real device testing
- ✅ Production-like environment

---

## 📚 More Info

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Worklets Troubleshooting](https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting)
