# 📱 Xcode Build Steps (Visual Guide)

## ✅ Metro is Running!

You should see the QR code in your terminal. Keep that terminal open.

## 🔧 Configure Xcode (One-Time Setup)

### Step 1: Select Project
```
Click "VIBEDEBUG" in the left sidebar (blue icon at the very top)
```

### Step 2: Select Target
```
In the main panel, under "TARGETS", click "VIBEDEBUG"
```

### Step 3: Go to Build Phases
```
Click the "Build Phases" tab at the top
(tabs: General | Signing & Capabilities | Resource Tags | Info | Build Settings | Build Phases | Build Rules)
```

### Step 4: Disable Bundle Script
```
Scroll down to find: "Bundle React Native code and images"
Click the checkbox on the LEFT to UNCHECK it (disable)
```

**Visual:**
```
☐ Bundle React Native code and images    ← UNCHECK THIS
  Run Script
  Shell: /bin/sh
  ...
```

Should look like:
```
☑ Check Pods Manifest.lock               ← Keep checked
☑ [Expo] Configure project                ← Keep checked
☐ Bundle React Native code and images    ← UNCHECKED (disabled)
☑ [CP] Copy Pods Resources                ← Keep checked
```

### Step 5: Select Your Device
```
Top toolbar: Click device dropdown (next to VIBEDEBUG)
Select: "Michael" (your iPhone)
Or: "iPhone 17 Pro Max" (simulator)
```

### Step 6: Build!
```
Click the Play button (▶) or press Cmd+R
```

## ✅ What Happens

1. **Xcode builds** native code only (no sandbox errors!)
2. **App launches** on your device/simulator
3. **App connects** to Metro (running in terminal)
4. **JavaScript loads** from Metro
5. **App runs** with all features and animations!

## 🎉 Success!

You should see:
- ✅ Build Succeeded (in Xcode)
- ✅ App launches on device
- ✅ "Bundled" message in Metro terminal
- ✅ App loads and runs

## 🔄 Daily Workflow

After this one-time setup:

1. **Start Metro:** `npx expo start --dev-client`
2. **Open app** on device (already installed)
3. **Make changes** to code
4. **Shake device** → Reload (or it auto-reloads)

No need to rebuild in Xcode unless you change native code!

## ❌ Troubleshooting

### "Could not connect to development server"
- Make sure Metro is running (terminal shows QR code)
- iPhone and Mac on same WiFi
- Restart Metro: Ctrl+C, then `npx expo start --dev-client`

### Build still fails
- Clean: Cmd+Shift+K
- Make sure bundle script is UNCHECKED
- Try again: Cmd+R

### Deprecation warnings
- These are just warnings, not errors
- App will still work perfectly
- Can be ignored for development

## 📝 Notes

**Why disable the bundle script?**
- Xcode's sandbox blocks Metro from writing files
- Running Metro separately has proper permissions
- This is the standard Expo development workflow

**Is this permanent?**
- No! Re-enable for production builds
- For development, keep it disabled
- Metro handles bundling during development

**What about production?**
- Use `eas build` for production builds
- Or re-enable the script for Archive builds
- Development builds don't need it

---

🎉 **You're all set! Just press Play in Xcode!**
