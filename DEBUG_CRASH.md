# App Crashes on Launch - Debugging Steps

## Most Likely Causes:

1. **JavaScript bundle not included** - The archive didn't bundle the JS
2. **Runtime error in App.tsx** - Something crashes immediately
3. **Missing native module** - A dependency isn't linked properly

## Quick Fix - Build with Metro Running:

Instead of archiving, let's build a version that connects to Metro:

1. **Start Metro:**
```bash
npx expo start --dev-client
```

2. **In Xcode:**
   - Select your iPhone (not "Any iOS Device")
   - Product → Run (⌘R)
   - NOT Archive, just Run

This will install the app and connect to Metro. You'll see the actual error message.

## If You Want Standalone (No Metro):

The archive needs to bundle JavaScript properly. Try this:

1. **Clean everything:**
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/VIBEDEBUG-*
cd ios && rm -rf build && cd ..
```

2. **Build for Release in Xcode:**
   - Product → Scheme → Edit Scheme
   - Change to "Release"
   - Product → Run (NOT Archive yet)
   - See if it works

3. **If it works, then Archive:**
   - Product → Archive
   - Distribute → Debugging

## Check Crash Logs:

Connect iPhone to Mac:
1. Xcode → Window → Devices and Simulators
2. Select your iPhone
3. Click "View Device Logs"
4. Find VIBEDEBUG crash log
5. Share the error message

This will show exactly why it's crashing.
