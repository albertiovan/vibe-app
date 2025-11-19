# Fix Expo Errors - Step by Step

## Errors Encountered:
1. ❌ **App entry not found** - Main entry point not registered
2. ❌ **Worklets mismatch** - Version mismatch (0.6.1 vs 0.5.1)

## Fixes Applied:

### 1. Created `babel.config.js`
Added Reanimated plugin to Babel configuration.

### 2. Updated `app.json`
Added `"main": "index.ts"` to explicitly define entry point.

## 🔧 Steps to Fix:

### Step 1: Clear Metro bundler cache
```bash
npx expo start --clear
```

### Step 2: If that doesn't work, do a full clean:
```bash
# Stop any running Metro bundler (Ctrl+C)

# Clear watchman cache
watchman watch-del-all

# Clear Metro cache
rm -rf /tmp/metro-*

# Clear Expo cache
rm -rf ~/.expo/cache

# Restart with clean cache
npx expo start --clear
```

### Step 3: If Worklets error persists, reinstall dependencies:
```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall everything
npm install

# Start fresh
npx expo start --clear
```

### Step 4: If still having issues, rebuild native modules:
```bash
# For iOS (if using iOS simulator)
cd ios && pod install && cd ..

# Then start
npx expo start --clear
```

## 🎯 Quick Fix (Try This First):

```bash
# Stop the current Metro bundler (Ctrl+C in terminal)
# Then run:
npx expo start --clear
```

This should resolve both errors!

## ✅ What Was Fixed:

1. **babel.config.js** - Added Reanimated plugin (required for Worklets)
2. **app.json** - Added explicit main entry point

## 📱 After Fixing:

1. Scan QR code again in Expo Go
2. App should load without errors
3. You'll see the swipeable card stack working smoothly!

## 🐛 If Errors Persist:

Check terminal output for specific error messages and share them. Common issues:
- Metro bundler not fully stopped
- Cached files causing conflicts
- Node modules corruption
- Expo Go app needs update
