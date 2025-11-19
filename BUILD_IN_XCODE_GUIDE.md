# Build in Xcode - Fix Folly Error

## Current Status

✅ Xcode workspace opened: `ios/VIBEDEBUG.xcworkspace`
✅ Pods installed with Folly fix in Podfile
⏳ Ready to build in Xcode

## Option 1: Build in Xcode (Visual, Easier to Debug)

### Steps:

1. **Xcode should now be open** with your project

2. **Select a simulator:**
   - Top bar: Click device dropdown (next to "VIBEDEBUG")
   - Choose: "iPhone 15 Pro" or any simulator

3. **Build and Run:**
   - Press `Cmd + R` (or click the Play ▶️ button)
   - Watch the build progress in the top bar

4. **If Folly error appears:**
   - Click the error in the left panel
   - Look for the file path (usually in `Pods/Headers/Public/ReactNativeDependencies/folly/Expected.h`)
   - We'll apply a manual fix

### Manual Fix in Xcode (If Build Fails):

1. **Open the problematic file:**
   - In Xcode, press `Cmd + Shift + O`
   - Type: `Expected.h`
   - Open the file from `ReactNativeDependencies`

2. **Find line 1586-1587:**
```cpp
#if FOLLY_HAS_COROUTINES
#include <folly/coro/Coroutine.h>
```

3. **Change to:**
```cpp
#if FOLLY_HAS_COROUTINES && 0
#include <folly/coro/Coroutine.h>
```

4. **Save** (`Cmd + S`)

5. **Build again** (`Cmd + R`)

## Option 2: Build from Terminal (Automated)

If you prefer command line:

```bash
# Build for simulator
npx expo run:ios --simulator="iPhone 15 Pro"
```

If it fails with Folly error, try:

```bash
# Build with Xcode directly (more verbose errors)
cd ios
xcodebuild -workspace VIBEDEBUG.xcworkspace \
  -scheme VIBEDEBUG \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
  build
```

## Option 3: Patch Folly Automatically

Create a script to patch the Folly header:

```bash
# Create patch script
cat > fix-folly.sh << 'EOF'
#!/bin/bash
FOLLY_FILE="ios/Pods/Headers/Public/ReactNativeDependencies/folly/Expected.h"

if [ -f "$FOLLY_FILE" ]; then
  echo "Patching Folly Expected.h..."
  sed -i '' 's/#if FOLLY_HAS_COROUTINES/#if FOLLY_HAS_COROUTINES \&\& 0/' "$FOLLY_FILE"
  echo "✅ Patched successfully"
else
  echo "❌ File not found: $FOLLY_FILE"
fi
EOF

# Make executable
chmod +x fix-folly.sh

# Run after pod install
./fix-folly.sh

# Then build
npx expo run:ios
```

## What to Expect

### First Build (5-10 minutes):
- Compiling React Native
- Compiling all pods (94 dependencies)
- Compiling your app code
- Installing on simulator
- Launching app

### Subsequent Builds (~30 seconds):
- Only recompiles changed files
- Much faster

### Success Indicators:
- ✅ Simulator launches
- ✅ App installs
- ✅ Metro bundler starts
- ✅ App opens with your UI
- ✅ All animations work

## Troubleshooting

### Build Error: "folly/coro/Coroutine.h not found"

**Solution 1:** Manual fix in Xcode (see above)

**Solution 2:** Add to Podfile post_install (already done):
```ruby
config.build_settings['FOLLY_HAVE_COROUTINES'] = '0'
```

**Solution 3:** Patch the header file automatically (see script above)

### Build Error: "Command PhaseScriptExecution failed"

```bash
# Clean build folder
cd ios
rm -rf build
cd ..

# Rebuild
npx expo run:ios
```

### Simulator doesn't launch

```bash
# List available simulators
xcrun simctl list devices

# Boot a simulator manually
xcrun simctl boot "iPhone 15 Pro"

# Then build
npx expo run:ios
```

### Metro bundler issues

```bash
# In a separate terminal
npx expo start --clear
```

## After Successful Build

You'll have:
- ✅ App running in iOS Simulator
- ✅ Full Reanimated support
- ✅ All animations working
- ✅ Hot reload enabled
- ✅ Fast Refresh working

## Daily Workflow

After first successful build:

```bash
# Option A: Rebuild everything (if native code changed)
npx expo run:ios

# Option B: Just start Metro (if only JS changed)
npx expo start --dev-client
# Then press 'i' to open simulator
```

## Current Action

**Xcode is now open.** Try building:
1. Select "iPhone 15 Pro" simulator (top bar)
2. Press `Cmd + R` to build and run
3. If Folly error appears, apply the manual fix above

OR

**Close Xcode and run:**
```bash
npx expo run:ios
```

---

**Next Step:** Build in Xcode (`Cmd + R`) or run `npx expo run:ios` in terminal
