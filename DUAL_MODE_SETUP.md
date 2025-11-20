# Dual Mode Setup: Simulator + Standalone Phone

## Overview

Your app now supports **two modes simultaneously**:

1. **iOS Simulator (Dev Mode)** - For active development with Metro bundler
2. **Standalone App on Phone (Release Mode)** - For testing native features without Metro

Both can run at the same time, both hitting the **same backend on your Mac**.

---

## Requirements

### For Both Modes
- **Backend must be running on your Mac:**
  ```bash
  cd /Users/aai/CascadeProjects/vibe-app/backend
  npm run dev
  ```
  This runs on `http://localhost:3000` and is accessible at `http://10.103.30.198:3000` (your Mac's LAN IP).

- **Your phone must be on the same Wi-Fi network as your Mac** (for standalone app to reach backend).

---

## Mode 1: iOS Simulator (Dev)

### How to Run
```bash
cd /Users/aai/CascadeProjects/vibe-app
npx expo start --clear --lan
# Press 'i' to open iOS Simulator
```

### What It Uses
- **Metro bundler** running on your Mac
- **Backend URL:** `http://localhost:3000` (via `__DEV__` flag)
- **Hot reload** enabled for instant code changes
- **Debug mode** with full console logs

### When to Use
- Active development
- Testing UI changes
- Debugging with React DevTools
- Fast iteration cycles

---

## Mode 2: Standalone App on Phone (Release)

### How to Build & Install

1. **Open Xcode:**
   ```bash
   open ios/VIBEDEBUG.xcworkspace
   ```

2. **Switch to Release mode:**
   - Product → Scheme → Edit Scheme
   - Click "Run" in left sidebar
   - Change "Build Configuration" to **"Release"**
   - Click "Close"

3. **Connect your iPhone via USB**

4. **Select your device** in Xcode toolbar (top-left, next to play button)

5. **Build & Run:**
   - Click the **Play button** (▶️) in Xcode
   - Or: Product → Run (⌘R)

6. **Trust developer certificate on iPhone:**
   - Settings → General → VPN & Device Management
   - Tap your Apple ID → Trust

### What It Uses
- **No Metro bundler** (standalone binary)
- **Backend URL:** `http://10.103.30.198:3000` (your Mac's LAN IP)
- **Release optimizations** (minified, production-ready)
- **Native animations** (Reanimated, gestures, etc.)

### When to Use
- Testing native features (animations, gestures, camera, etc.)
- Verifying performance on real device
- Testing away from your desk (but still on same Wi-Fi)
- Showing the app to others

---

## API Configuration Summary

All API clients now use this logic:

```typescript
const getApiUrl = () => {
  // 1. Check for explicit env override
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // 2. Dev mode: use localhost (Simulator)
  if (__DEV__) {
    return 'http://localhost:3000';
  }
  
  // 3. Release mode: use Mac's LAN IP (standalone app)
  return 'http://10.103.30.198:3000';
};
```

### Files Updated
- `src/config/api.ts` - Main API config
- `src/services/api.ts` - Generic API service
- `src/services/vibeProfilesApi.ts` - Vibe profiles
- `components/ChallengeMe.tsx` - Challenge Me feature

---

## Typical Workflow

### Development Session
1. Start backend:
   ```bash
   cd /Users/aai/CascadeProjects/vibe-app/backend
   npm run dev
   ```

2. Start Expo (in another terminal):
   ```bash
   cd /Users/aai/CascadeProjects/vibe-app
   npx expo start --clear --lan
   ```

3. Press `i` to open iOS Simulator

4. Make code changes → See them instantly in Simulator

### Testing on Phone
1. Keep backend running (same terminal as above)

2. Open Xcode:
   ```bash
   open ios/VIBEDEBUG.xcworkspace
   ```

3. Ensure **Release** mode is selected (see "How to Build & Install" above)

4. Connect iPhone via USB

5. Click Play (▶️) in Xcode

6. App installs and runs on your phone (no Metro needed)

7. **Both Simulator and Phone work at the same time!**

---

## Troubleshooting

### Standalone App Crashes on Launch
- **Check backend is running:** Visit `http://10.103.30.198:3000/api/health` in Safari on your phone
- **Check Wi-Fi:** Phone and Mac must be on same network
- **Check Mac's IP hasn't changed:** Run `ifconfig | grep "inet "` and verify `10.103.30.198` is still correct
- **Rebuild app:** If IP changed, update all config files and rebuild in Xcode

### Simulator Can't Reach Backend
- **Check backend is running:** `curl http://localhost:3000/api/health`
- **Restart Metro:** `npx expo start --clear`

### "Cannot connect to Metro" on Phone
- **This is expected!** Standalone Release builds don't use Metro.
- If you see this, it means you built in **Debug** mode instead of **Release**.
- Go back to Xcode and switch to Release (see "How to Build & Install").

---

## When to Deploy Backend to Production

You'll need to deploy the backend (Railway/Render/etc.) when:

1. You want to test the app **away from your Mac** (different Wi-Fi network)
2. You want to share the app with others (TestFlight, App Store)
3. You're ready for production release

Until then, this dual-mode setup lets you develop efficiently while testing native features on your phone.

---

## Summary

✅ **Simulator:** Fast development with hot reload  
✅ **Phone:** Real device testing with native features  
✅ **Both:** Work simultaneously, same backend  
✅ **Backend:** Runs on your Mac, accessible to both  
✅ **No Metro on Phone:** True standalone app experience
