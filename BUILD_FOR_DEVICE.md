# Build Vibe App for Physical iPhone

## Prerequisites ✅
- Apple Developer Account (you have this now!)
- iPhone connected via USB
- Xcode installed
- CocoaPods installed

## Step 1: Configure Apple Developer Account in Xcode

1. **Open Xcode**
2. **Go to Settings** (Xcode → Settings or Cmd+,)
3. **Click "Accounts" tab**
4. **Click "+" and add your Apple ID**
5. **Sign in with your Apple Developer credentials**

## Step 2: Configure Project Signing

We'll do this through Xcode for the easiest setup:

1. **Open the project in Xcode:**
   ```bash
   cd /Users/aai/CascadeProjects/vibe-app
   open ios/VIBEDEBUG.xcworkspace
   ```

2. **Select the VIBEDEBUG target** (in the left sidebar)

3. **Go to "Signing & Capabilities" tab**

4. **Check "Automatically manage signing"**

5. **Select your Team** (your Apple Developer account)

6. **Change Bundle Identifier** to something unique:
   - Current: `com.albertiovan.vibeapp`
   - Suggested: `com.albertiovan.vibeapp.dev` or `com.[yourname].vibeapp`

## Step 3: Connect Your iPhone

1. **Connect iPhone via USB cable**
2. **Unlock your iPhone**
3. **Trust this computer** (if prompted on iPhone)
4. **In Xcode, select your iPhone** from the device dropdown (top toolbar)

## Step 4: Build and Run

### Option A: Build from Xcode (Recommended for first time)

1. **Apply Folly patch first:**
   ```bash
   cd /Users/aai/CascadeProjects/vibe-app
   chmod +w ios/Pods/Headers/Public/ReactNativeDependencies/folly/*.h 2>/dev/null
   perl -pi -e 's/#if FOLLY_HAS_COROUTINES\s*$/#if FOLLY_HAS_COROUTINES \&\& 0/' ios/Pods/Headers/Public/ReactNativeDependencies/folly/Expected.h ios/Pods/Headers/Public/ReactNativeDependencies/folly/Optional.h 2>/dev/null
   ```

2. **Click the Play button** (▶) in Xcode or press Cmd+R

3. **First time only:** You'll need to trust the developer certificate on your iPhone:
   - Go to **Settings → General → VPN & Device Management**
   - Tap your Apple Developer account
   - Tap **Trust**

### Option B: Build from Terminal

```bash
cd /Users/aai/CascadeProjects/vibe-app

# Apply Folly patch
chmod +w ios/Pods/Headers/Public/ReactNativeDependencies/folly/*.h 2>/dev/null
perl -pi -e 's/#if FOLLY_HAS_COROUTINES\s*$/#if FOLLY_HAS_COROUTINES \&\& 0/' ios/Pods/Headers/Public/ReactNativeDependencies/folly/Expected.h ios/Pods/Headers/Public/ReactNativeDependencies/folly/Optional.h 2>/dev/null

# Build for connected device
npx expo run:ios --device
```

## Step 5: Start Metro Bundler

The app needs the Metro bundler to load JavaScript:

```bash
cd /Users/aai/CascadeProjects/vibe-app
npx expo start --dev-client
```

**Important:** Your iPhone must be on the same WiFi network as your Mac for the app to connect to Metro.

## Troubleshooting

### "Failed to verify code signature"
- Go to iPhone Settings → General → VPN & Device Management
- Trust your developer certificate

### "Could not connect to development server"
- Ensure iPhone and Mac are on same WiFi
- Check firewall settings on Mac
- Try shaking the iPhone and tapping "Configure Bundler" → enter your Mac's IP manually

### Folly errors during build
- Run the Folly patch command again (it gets reset by pod install)
- The patch is in the build commands above

### "No matching provisioning profile found"
- In Xcode, go to Signing & Capabilities
- Make sure your Team is selected
- Try changing the Bundle Identifier to something unique

## Building for Distribution (Later)

Once you want to distribute via TestFlight or App Store:

1. **Create App ID** in Apple Developer Portal
2. **Create Provisioning Profile**
3. **Archive in Xcode** (Product → Archive)
4. **Upload to App Store Connect**

For now, development builds are perfect for testing!

## What Works Now

With Reanimated installed and the Folly patch applied:
- ✅ All animations
- ✅ Swipeable cards
- ✅ Gesture interactions
- ✅ Complete app functionality
- ✅ All 466 activities with full data
- ✅ Challenge Me, Sidequest, all features

## Quick Reference Commands

```bash
# Apply Folly patch (run after pod install)
chmod +w ios/Pods/Headers/Public/ReactNativeDependencies/folly/*.h 2>/dev/null && perl -pi -e 's/#if FOLLY_HAS_COROUTINES\s*$/#if FOLLY_HAS_COROUTINES \&\& 0/' ios/Pods/Headers/Public/ReactNativeDependencies/folly/Expected.h ios/Pods/Headers/Public/ReactNativeDependencies/folly/Optional.h 2>/dev/null

# Build for device
npx expo run:ios --device

# Start Metro
npx expo start --dev-client
```
