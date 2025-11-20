# Complete iOS Build Guide - Sandbox Fix

## The Problem

Xcode builds fail with sandbox errors when trying to write `ip.txt` during the Metro bundling phase.

## ✅ Complete Solution

### Step 1: Start Metro BEFORE Building

**In Terminal 1:**
```bash
cd /Users/aai/CascadeProjects/vibe-app
npx expo start --dev-client
```

Keep this running. Metro will start on port 8081.

### Step 2: Build in Xcode WITHOUT Metro Bundling

**In Xcode:**

1. **Disable the Bundle Script:**
   - Click on **VIBEDEBUG** project (top of left sidebar)
   - Select **VIBEDEBUG** target
   - Go to **Build Phases** tab
   - Find **"Bundle React Native code and images"**
   - **Uncheck** the checkbox next to it (to disable)

2. **Build:**
   - Select your device (Michael or simulator)
   - Press **Cmd + R**

3. **The app will:**
   - Build successfully (no sandbox errors)
   - Launch on device/simulator
   - Connect to Metro running in Terminal 1
   - Load your JavaScript bundle

### Step 3: Re-enable for Production Builds

When you want to create a production build (not for development):

1. Re-check the "Bundle React Native code and images" script
2. Build for Release configuration

## Alternative: Use Expo Dev Client Workflow

This is the recommended approach for Expo apps:

### One-Time Setup

**Build the native app once in Xcode:**
1. Disable "Bundle React Native code and images" script
2. Build and install on device/simulator
3. Keep the app installed

### Daily Development

**Just run Metro:**
```bash
npx expo start --dev-client
```

The installed app will automatically connect and reload when you make changes.

## Why This Works

1. **Metro runs separately** with proper permissions
2. **Xcode only builds native code** (no file writing issues)
3. **App connects to Metro** at runtime (standard React Native workflow)
4. **No sandbox violations** because Xcode isn't trying to write files

## Quick Commands

### Build for Simulator
```bash
# Terminal 1: Start Metro
npx expo start --dev-client

# Terminal 2: Build (or use Xcode)
# Disable bundle script first, then:
npx expo run:ios
```

### Build for Device
```bash
# Terminal 1: Start Metro
npx expo start --dev-client

# Xcode: 
# 1. Disable bundle script
# 2. Select your iPhone
# 3. Cmd + R
```

## Deprecation Warnings

The Hermes warning is just informational. To silence it:

1. In Xcode → **VIBEDEBUG** target → **Build Phases**
2. Find **"[CP-User] [Hermes] Replace Hermes..."**
3. Click on it
4. Check **"Based on dependency analysis"** at the bottom
5. Add output file: `$(DERIVED_FILE_DIR)/hermes-configured`

This is optional - the warning doesn't affect functionality.

## Summary

**The key insight:** Separate Metro from Xcode builds.

1. ✅ Metro runs in Terminal (has permissions)
2. ✅ Xcode builds native code only (no sandbox issues)
3. ✅ App connects at runtime (standard workflow)

This is actually the **recommended** Expo development workflow!

🎉 **Your app will build and run perfectly!**
