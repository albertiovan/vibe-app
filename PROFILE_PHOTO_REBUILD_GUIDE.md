# Profile Photo Feature - Rebuild Guide

## Issue
The profile customization feature shows only the pencil icon with error:
```
Error: Cannot find native module 'ExponentImagePicker'
```

## Root Cause
The `expo-image-picker` package requires native iOS/Android code that needs to be compiled into the app. Installing via npm only adds the JavaScript part.

## Solution

### Option 1: Rebuild iOS App (Recommended)
This is currently running in the background:

```bash
# Clean and regenerate native folders
npx expo prebuild --clean

# Rebuild iOS app with native modules
npx expo run:ios
```

**Wait Time:** 5-10 minutes for full rebuild

### Option 2: Use Development Build
If you have Expo Go, the native modules won't work. You need a development build:

```bash
# Build development client
npx expo run:ios

# Or for Android
npx expo run:android
```

### Option 3: Temporary - Nickname Only
I've added safety checks so the app won't crash. You can:
- ✅ Edit nickname (works without rebuild)
- ❌ Add/change photo (requires rebuild)

The photo picker will show "Feature Unavailable" alert until rebuild completes.

## What's Happening Now

The iOS app is being rebuilt with these steps:
1. ✅ Cleaned old native code
2. ✅ Regenerated iOS project with all dependencies
3. 🔄 Compiling native modules (currently running)
4. ⏳ Installing on simulator/device
5. ⏳ App will launch automatically

## After Rebuild Completes

Once the build finishes and the app launches:

1. **Navigate to Profile**
2. **Tap the pencil icon or "Edit" button**
3. **You'll see the full profile editor with:**
   - ✅ Profile picture picker (camera + library)
   - ✅ Nickname editor
   - ✅ All features working

## Verification

To confirm it's working:
```
1. Open Profile screen
2. Tap pencil icon
3. Tap the large circular photo area
4. You should see action sheet with:
   - "Take Photo"
   - "Choose from Library"
   - "Cancel"
```

If you still see "Feature Unavailable", the rebuild didn't complete properly.

## Troubleshooting

### Build Failed
```bash
# Clear everything and try again
rm -rf ios android node_modules
npm install
npx expo prebuild --clean
npx expo run:ios
```

### Still Not Working
```bash
# Check if expo-image-picker is installed
npm list expo-image-picker

# Should show: expo-image-picker@15.0.7 (or similar)
```

### Simulator Issues
```bash
# Reset simulator
xcrun simctl erase all

# Rebuild
npx expo run:ios
```

## Alternative: Test on Physical Device

If simulator has issues, test on your iPhone:
```bash
# Connect iPhone via USB
# Trust computer on iPhone
npx expo run:ios --device
```

## Current Status

✅ Safety checks added (app won't crash)
✅ Nickname editing works immediately
🔄 iOS rebuild in progress
⏳ Photo features available after rebuild

## Next Steps

1. **Wait for build to complete** (watch terminal)
2. **App will launch automatically**
3. **Test profile customization**
4. **If issues persist, try Option 1 troubleshooting**

## Files Modified

- `/components/ProfileCustomization.tsx` - Added safety checks
- `/screens/MinimalUserProfileScreen.tsx` - Integrated profile header
- Native iOS project - Being rebuilt with expo-image-picker

## Expected Timeline

- **Now:** Build compiling (5-10 min)
- **After build:** App launches with full features
- **Testing:** 2-3 minutes to verify

Total: ~15 minutes from start to fully working
