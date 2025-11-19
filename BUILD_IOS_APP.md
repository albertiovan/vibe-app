# Build Standalone iOS App

## What You're Building
A standalone iOS app that:
- ✅ Runs on your iPhone without needing your computer
- ✅ Works offline (once installed)
- ✅ Can be opened anytime from your home screen
- ✅ Doesn't require Expo Go or dev server

## Steps

### 1. Build the App (Running Now)
```bash
eas build --profile standalone --platform ios
```

This will:
- Build your app in the cloud (takes 10-20 minutes)
- Create an installable `.ipa` file
- Sign it with your Apple Developer account

### 2. Install on Your iPhone

**Option A: Install via EAS (Easiest)**
1. When build completes, you'll get a QR code
2. Scan it with your iPhone camera
3. Tap "Install" in Safari
4. Go to Settings > General > VPN & Device Management
5. Trust the developer certificate
6. App will appear on your home screen!

**Option B: Install via TestFlight**
1. Build completes → Download `.ipa`
2. Upload to App Store Connect
3. Invite yourself as a tester
4. Install via TestFlight app

### 3. Update Your Backend URL

**IMPORTANT:** Your app needs to connect to your backend server.

Current backend: `http://10.103.30.198:3000`

For standalone app, you need:
- **Option 1:** Deploy backend to a cloud server (Heroku, Railway, etc.)
- **Option 2:** Use ngrok to expose local backend
- **Option 3:** Use your computer's public IP (if on same WiFi)

Update in: `src/services/userApi.ts`, `src/services/chatApi.ts`, etc.

## Requirements

### Apple Developer Account
- **Free account:** Can install on your own devices (up to 3)
- **Paid account ($99/year):** Can distribute to others via TestFlight

### What Happens During Build
1. EAS uploads your code to cloud
2. Installs dependencies
3. Compiles native iOS code
4. Signs with your Apple certificates
5. Creates installable `.ipa` file
6. Provides download link + QR code

## Build Profiles

Your `eas.json` has:
- **standalone:** Internal distribution (install directly on device)
- **preview:** Quick builds for testing
- **production:** App Store builds

## Troubleshooting

### "Build failed - Missing credentials"
- Run: `eas credentials`
- Follow prompts to set up Apple certificates

### "App won't install"
- Check Settings > General > VPN & Device Management
- Trust the developer certificate

### "App crashes on launch"
- Check backend URL is accessible from phone
- Check console logs: `eas build:view --platform ios`

## Next Build

To rebuild after code changes:
```bash
eas build --profile standalone --platform ios
```

Builds are cached, so subsequent builds are faster (5-10 min).

## Alternative: Development Build

If you want faster iteration:
```bash
eas build --profile development --platform ios
```

This creates a development client that can load updates over-the-air without rebuilding.
