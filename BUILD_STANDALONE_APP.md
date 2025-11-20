# 📱 Build Standalone App (Works Anywhere)

## Goal: App that works WITHOUT Mac nearby

You want a **standalone build** with JavaScript bundled inside the app.

## ✅ Solution: Use EAS Build (Recommended)

EAS Build creates a complete standalone app in the cloud (no sandbox issues).

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

Use your Expo account credentials.

### Step 3: Configure Project

```bash
eas build:configure
```

This is already done (you have `eas.json`).

### Step 4: Build for iPhone

```bash
eas build --platform ios --profile standalone
```

This will:
- ✅ Build in the cloud (no sandbox issues)
- ✅ Bundle JavaScript inside the app
- ✅ Create a standalone `.ipa` file
- ✅ Works anywhere (no Mac needed)

### Step 5: Install on iPhone

After build completes (~15-20 minutes):

**Option A: Direct Install**
```bash
eas build:run --platform ios --latest
```

**Option B: Download and Install**
1. Download `.ipa` from Expo dashboard
2. Use Apple Configurator or Xcode to install

## 🚀 Alternative: Local Standalone Build

If you want to build locally (avoiding sandbox):

### Method 1: Archive in Xcode (Production Build)

1. **In Xcode:**
   - Product → Scheme → Edit Scheme
   - Change "Run" to "Release" configuration
   - Product → Archive
   - This bundles JavaScript and creates standalone app

2. **Distribute:**
   - Window → Organizer
   - Select archive → Distribute App
   - Choose "Ad Hoc" or "Development"
   - Export and install on iPhone

### Method 2: Expo Prebuild + Archive

```bash
# Generate native project with bundled JS
npx expo export

# Then archive in Xcode (Release mode)
```

## 📊 Comparison

| Method | Pros | Cons |
|--------|------|------|
| **EAS Build** | ✅ No sandbox issues<br>✅ Cloud build<br>✅ Easy distribution | ⏱️ Takes 15-20 min<br>💰 Free tier limited |
| **Xcode Archive** | ✅ Local control<br>✅ Immediate | ❌ Sandbox issues in Debug<br>✅ Works in Release |
| **Development Build** | ✅ Fast iteration | ❌ Needs Mac nearby<br>❌ Requires Metro |

## ✅ Recommended Approach

### For Testing on Your iPhone Anywhere:

**Use EAS Build:**
```bash
eas build --platform ios --profile standalone
```

Then install the resulting `.ipa` on your iPhone. This app will:
- ✅ Work anywhere (no Mac needed)
- ✅ Have all JavaScript bundled
- ✅ Include all animations and features
- ✅ Be a complete standalone app

### For Daily Development:

**Use Development Build + Metro:**
```bash
npx expo start --dev-client
```

This is faster for making changes, but requires Mac nearby.

## 🎯 Quick Commands

### Build Standalone App (Cloud)
```bash
eas build --platform ios --profile standalone
```

### Build and Auto-Install
```bash
eas build --platform ios --profile standalone --local
```

### Check Build Status
```bash
eas build:list
```

### Install Latest Build
```bash
eas build:run --platform ios --latest
```

## 📝 Important Notes

### JavaScript Bundle Location

**Development Build:**
- JavaScript loaded from Metro (Mac required)
- Fast reload for development
- Requires `npx expo start`

**Standalone Build:**
- JavaScript bundled inside `.app`
- Works anywhere
- No Metro needed

### Build Profiles (in eas.json)

- `development` - Dev client (needs Metro)
- `standalone` - Complete app (works anywhere)
- `production` - App Store build

## 🔧 Fix for Local Xcode Build

If you want to build standalone locally in Xcode:

1. **Change to Release configuration:**
   - Xcode → Product → Scheme → Edit Scheme
   - Run → Build Configuration → Release

2. **Re-enable bundle script:**
   - Build Phases → Check "Bundle React Native code and images"

3. **Archive:**
   - Product → Archive
   - No sandbox issues in Release mode!

## ✅ Final Recommendation

**For your use case (app works anywhere):**

```bash
# One-time setup
npm install -g eas-cli
eas login

# Build standalone app
eas build --platform ios --profile standalone

# Install on iPhone
eas build:run --platform ios --latest
```

This creates a **true standalone app** that works anywhere, just like any App Store app!

🎉 **No Mac, no Metro, no sandbox issues - just a working app!**
