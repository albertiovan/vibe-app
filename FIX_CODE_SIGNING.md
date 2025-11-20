# Fix Code Signing Issue

## The Problem
"No code signing certificates are available to use"

This means Xcode needs to create signing certificates for your Apple Developer account.

## Solution: Configure Signing in Xcode

### Step 1: Add Your Apple ID to Xcode

1. **Open Xcode** (already open)
2. **Xcode → Settings** (or press `Cmd + ,`)
3. Click **Accounts** tab
4. Click the **+** button (bottom left)
5. Select **Apple ID**
6. **Sign in** with your Apple Developer credentials
7. After signing in, click **Download Manual Profiles** button
8. Wait for certificates to download

### Step 2: Configure Project Signing

The project is already open in Xcode (`VIBEDEBUG.xcworkspace`).

1. In the **left sidebar**, click on **VIBEDEBUG** (the blue project icon at the top)
2. Under **TARGETS**, select **VIBEDEBUG**
3. Click the **Signing & Capabilities** tab (top of main panel)
4. Under **Signing**, check the box: ☑️ **Automatically manage signing**
5. In the **Team** dropdown, select your Apple Developer account
6. Xcode will automatically create certificates and provisioning profiles

### Step 3: Verify Bundle Identifier

Make sure the Bundle Identifier is unique:
- Current: `com.albertiovan.vibeapp`
- If you get errors, try: `com.albertiovan.vibeapp.dev`

### Step 4: Build Again

Once signing is configured in Xcode, run the build script again:

```bash
./build-device.sh
```

## Alternative: Let Xcode Build It

If the script still has issues, build directly from Xcode:

1. Make sure your iPhone is selected in the device dropdown (top toolbar)
2. Click the **Play button** (▶) or press `Cmd + R`
3. Xcode will build and install on your iPhone

## First Time on Device

After the app installs, you need to trust the developer certificate on your iPhone:

1. On your iPhone: **Settings → General → VPN & Device Management**
2. Tap your Apple Developer account
3. Tap **Trust**
4. Now you can launch the app

## Troubleshooting

### "Failed to create provisioning profile"
- Make sure you're signed in to the correct Apple ID in Xcode Settings → Accounts
- Try toggling "Automatically manage signing" off and back on
- Change the Bundle Identifier to something unique

### "This device is not registered"
- Your Apple Developer account needs to register the device
- Xcode should do this automatically when you build
- If not, go to developer.apple.com → Certificates, Identifiers & Profiles → Devices → Add Device

### Still getting errors?
Build directly from Xcode instead of the terminal:
1. Select your iPhone from device dropdown
2. Press Cmd + R
3. Xcode will show more detailed error messages
