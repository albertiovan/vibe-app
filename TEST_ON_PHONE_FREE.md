# Test App on iPhone - FREE (No Apple Developer Account)

## ✅ Solution: Use Expo Go App

This lets you test your app anywhere without paying for Apple Developer account!

## Step 1: Install Expo Go on Your iPhone

1. Open App Store on your iPhone
2. Search for "Expo Go"
3. Install it (it's free!)

## Step 2: Start Your App with Tunnel

```bash
# Make sure backend is running
cd backend
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# In another terminal, start Expo with tunnel
npx expo start --tunnel
```

## Step 3: Scan QR Code

1. Open **Expo Go** app on your iPhone
2. Tap "Scan QR Code"
3. Scan the QR code from your terminal
4. App will load and run!

## ✅ Benefits

- **FREE** - No Apple Developer account needed ($0 vs $99/year)
- **Works anywhere** - Cellular data, any WiFi, any location
- **Instant updates** - Just save your code, app reloads automatically
- **Easy debugging** - Shake phone to open dev menu

## ⚠️ Limitations

- Must keep computer running with `expo start --tunnel`
- Not a "real" standalone app (requires Expo Go)
- Can't publish to App Store

## Alternative: TestFlight (Still Free!)

If you want a real standalone app without paying:

### Option A: Use a Free Apple Developer Account
- Sign up at https://developer.apple.com (free)
- Limited to 3 devices
- Apps expire after 7 days (need to rebuild)

### Option B: Use EAS Development Build
```bash
# Build a development client (free)
eas build --profile development --platform ios

# Install on your phone
# Then use Expo Go to load updates
```

## Recommended Workflow

### For Daily Testing (Now):
✅ Use **Expo Go + Tunnel** - Instant, free, works anywhere

### For Production (Later):
- Get paid Apple Developer account ($99/year)
- Build standalone app with `eas build`
- Distribute via TestFlight or App Store

## Quick Start Commands

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: ngrok (keep backend accessible)
ngrok http 3000

# Terminal 3: Expo with tunnel
npx expo start --tunnel
```

Then:
1. Open Expo Go on iPhone
2. Scan QR code
3. App loads and runs!

## Troubleshooting

### "Unable to connect"
- Make sure ngrok is running
- Make sure backend is running
- Check that `src/config/api.ts` has correct ngrok URL

### "Network error"
- Tunnel might be slow, wait a moment
- Try restarting: Ctrl+C and run `npx expo start --tunnel` again

### "App crashes"
- Check backend logs
- Check ngrok is forwarding correctly
- Verify API URL in config

## Current Setup

✅ Backend: Running on localhost:3000
✅ ngrok: `https://connectively-unrecurrent-dusti.ngrok-free.app`
✅ App config: Updated with ngrok URL

You're ready to test! Just run the commands above and scan the QR code with Expo Go!
