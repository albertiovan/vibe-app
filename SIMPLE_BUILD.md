# Simple Build Instructions

## What I Fixed

The codegen files were missing. I ran `npx expo prebuild --clean` which regenerated all the native files properly.

## Build Now

Xcode is open. Just:

1. **Select "Any iOS Device (arm64)"** from device dropdown
2. **Product → Archive**
3. **Distribute → Ad Hoc → Export**
4. **Install on iPhone**

That's it.

## If It Still Fails

Run this first:
```bash
npx expo prebuild --clean
open ios/VIBEDEBUG.xcworkspace
```

Then archive in Xcode.

Done.
