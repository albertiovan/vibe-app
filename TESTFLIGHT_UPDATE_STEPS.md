# TestFlight Update Steps

## Changes in This Build
- ✅ Fixed invisible button text on onboarding screens
- ✅ Fixed translation keys showing as raw text ("onboarding.name_label" etc.)
- ✅ All onboarding labels now display properly in both English and Romanian

## Steps to Upload New Build

### 1. Update Version Numbers
Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

### 2. Install Dependencies (if needed)
```bash
cd ios && pod install && cd ..
```

### 3. Open Xcode
```bash
open ios/VIBEDEBUG.xcworkspace
```

### 4. Clean and Archive
In Xcode:
1. Product → Clean Build Folder (Shift+Cmd+K)
2. Select "Any iOS Device (arm64)" at top
3. Product → Archive
4. Wait 5-10 minutes for build to complete

### 5. Upload to TestFlight
1. When Organizer opens, click "Distribute App"
2. Select "App Store Connect"
3. Click "Upload"
4. Accept defaults
5. Click "Upload"

### 6. Wait for Processing
- Upload takes ~5 minutes
- Apple processing takes ~10-15 minutes
- You'll get an email when ready
- Testers will be notified automatically

### 7. Test on Your iPhone
1. Open TestFlight app
2. Update to new build
3. Test onboarding flow
4. Verify button text is visible
5. Verify no "onboarding." keys showing

## Quick Commands

```bash
# Update version
# Edit app.json manually

# Rebuild pods
cd ios && pod install && cd ..

# Open Xcode
open ios/VIBEDEBUG.xcworkspace

# After upload, commit changes
git add .
git commit -m "Fix onboarding button text and translation keys - v1.0.1 (2)"
git push origin main
```

## Testing Checklist

After new build is live:
- [ ] Button text visible on all onboarding screens
- [ ] No "onboarding." keys showing
- [ ] Name and email labels display correctly
- [ ] Interest categories show proper names
- [ ] Energy level options display correctly
- [ ] Indoor/Outdoor options display correctly
- [ ] Back button text visible
- [ ] Next button text visible (purple on white)
- [ ] Test in both English and Romanian
