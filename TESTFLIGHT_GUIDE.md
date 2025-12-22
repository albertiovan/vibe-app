# TestFlight Deployment Guide - iOS

## Prerequisites
- Mac with Xcode 15+ installed
- Apple Developer Account ($99/year)
- iOS device for testing
- Backend deployed to AWS (or accessible URL)

## Part 1: Apple Developer Account Setup (30 minutes)

### Step 1: Enroll in Apple Developer Program
1. Go to https://developer.apple.com/programs/
2. Click "Enroll"
3. Sign in with Apple ID
4. Complete enrollment ($99/year)
5. Wait for approval (usually 24-48 hours)

### Step 2: Create App ID
1. Go to https://developer.apple.com/account
2. Navigate to "Certificates, Identifiers & Profiles"
3. Click "Identifiers" → "+" button
4. Select "App IDs" → Continue
5. **Description**: Vibe - Activity Recommendations
6. **Bundle ID**: `com.vibeapp.vibe` (or your domain)
7. **Capabilities**: Enable:
   - Push Notifications
   - Associated Domains (if using deep links)
   - Sign in with Apple (if planning to add)
8. Click "Continue" → "Register"

### Step 3: Create Provisioning Profile
1. Still in "Certificates, Identifiers & Profiles"
2. Click "Profiles" → "+" button
3. Select "App Store" → Continue
4. Select your App ID → Continue
5. Select your certificate → Continue
6. Name: "Vibe App Store Profile"
7. Click "Generate"
8. Download the profile

## Part 2: Xcode Project Configuration (20 minutes)

### Step 1: Open Project in Xcode
```bash
cd /Users/aai/CascadeProjects/vibe-app
open ios/vibeapp.xcworkspace
```

If `.xcworkspace` doesn't exist:
```bash
cd ios
pod install
open vibeapp.xcworkspace
```

### Step 2: Update Project Settings
1. Select project in navigator (top-level "vibeapp")
2. Select target "vibeapp"
3. **General Tab:**
   - Display Name: `Vibe`
   - Bundle Identifier: `com.vibeapp.vibe`
   - Version: `1.0.0`
   - Build: `1`

4. **Signing & Capabilities:**
   - ✅ Automatically manage signing
   - Team: Select your Apple Developer team
   - Provisioning Profile: Xcode Managed Profile
   - Signing Certificate: Apple Distribution

5. **Build Settings:**
   - Search for "Dead Code Stripping" → Set to `Yes`
   - Search for "Strip Debug Symbols" → Set to `Yes`
   - Search for "Enable Bitcode" → Set to `No` (deprecated)

### Step 3: Update Info.plist
Add required permissions and configurations:

```xml
<!-- Location permissions -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Vibe needs your location to find nearby activities and experiences.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Vibe uses your location to recommend activities near you.</string>

<!-- Camera permissions (for profile pictures) -->
<key>NSCameraUsageDescription</key>
<string>Vibe needs camera access to take profile pictures.</string>

<!-- Photo library permissions -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Vibe needs access to your photos to set profile pictures.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Vibe needs access to save photos to your library.</string>

<!-- App Transport Security (if using HTTP in dev) -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
</dict>
```

### Step 4: Update API Configuration
Edit `/src/config/api.ts`:

```typescript
// Production API URL (your AWS backend)
const PRODUCTION_URL = 'https://api.vibeapp.com'; // Or your AWS URL

export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.88.199:3000'  // Local development
  : PRODUCTION_URL;                // Production (TestFlight)

export const CDN_BASE_URL = __DEV__
  ? ''
  : 'https://d1234567890.cloudfront.net'; // Your CloudFront domain
```

### Step 5: Add App Icons
1. Create app icons (1024x1024px)
2. Use https://appicon.co to generate all sizes
3. In Xcode, select `Images.xcassets` → `AppIcon`
4. Drag and drop icons for each size

Required sizes:
- 20x20 (2x, 3x)
- 29x29 (2x, 3x)
- 40x40 (2x, 3x)
- 60x60 (2x, 3x)
- 1024x1024 (App Store)

### Step 6: Add Launch Screen
1. Select `LaunchScreen.storyboard`
2. Add your app logo/branding
3. Keep it simple (shows for 1-2 seconds)

## Part 3: Build for TestFlight (15 minutes)

### Step 1: Select Build Target
1. In Xcode toolbar, select:
   - Device: "Any iOS Device (arm64)"
   - Scheme: "vibeapp" (Release)

2. Edit Scheme:
   - Product → Scheme → Edit Scheme
   - Build Configuration: Release
   - Close

### Step 2: Archive the App
1. Product → Archive
2. Wait for build to complete (5-10 minutes)
3. Organizer window will open automatically

### Step 3: Validate the Archive
1. In Organizer, select your archive
2. Click "Validate App"
3. Select your distribution certificate
4. Click "Validate"
5. Wait for validation (2-3 minutes)
6. Fix any errors if they appear

Common validation errors:
- **Missing icons**: Add all required icon sizes
- **Missing permissions**: Add to Info.plist
- **Invalid bundle ID**: Must match App ID in Developer Portal

### Step 4: Upload to App Store Connect
1. Click "Distribute App"
2. Select "App Store Connect"
3. Click "Upload"
4. Select options:
   - ✅ Upload your app's symbols
   - ✅ Manage Version and Build Number
5. Click "Upload"
6. Wait for upload (5-10 minutes)

## Part 4: App Store Connect Configuration (20 minutes)

### Step 1: Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. **Platforms**: iOS
4. **Name**: Vibe
5. **Primary Language**: English (US)
6. **Bundle ID**: Select `com.vibeapp.vibe`
7. **SKU**: `vibe-app-001`
8. **User Access**: Full Access
9. Click "Create"

### Step 2: Fill App Information
1. **App Information:**
   - Subtitle: "Discover Your Perfect Vibe"
   - Category: Lifestyle (Primary), Travel (Secondary)
   - Content Rights: Yes (you own the rights)

2. **Pricing and Availability:**
   - Price: Free
   - Availability: All countries

3. **App Privacy:**
   - Privacy Policy URL: (create one if needed)
   - Data Collection:
     - Location: Yes (for activity recommendations)
     - User Content: Yes (profile pictures, activity reviews)
     - Usage Data: Yes (analytics)

### Step 3: Prepare TestFlight
1. Go to "TestFlight" tab
2. Select your build (should appear after upload)
3. **Test Information:**
   - What to Test: "Initial beta release. Test all core features."
   - Beta App Description: "Vibe helps you discover activities based on your mood and preferences."
   - Feedback Email: your-email@example.com

4. **Export Compliance:**
   - Does your app use encryption? No (unless you added it)
   - Click "Submit for Review"

### Step 4: Add Internal Testers
1. In TestFlight → Internal Testing
2. Click "+" to add testers
3. Enter email addresses
4. Testers will receive invitation email

### Step 5: Add External Testers (Optional)
1. Create a new group: "Beta Testers"
2. Add testers (up to 10,000)
3. Submit for Beta App Review (1-2 days)

## Part 5: Install on Device (5 minutes)

### Step 1: Install TestFlight App
1. On iOS device, download "TestFlight" from App Store
2. Sign in with Apple ID (same as tester email)

### Step 2: Accept Invitation
1. Check email for TestFlight invitation
2. Tap "View in TestFlight"
3. Tap "Accept"
4. Tap "Install"

### Step 3: Launch App
1. Open Vibe from home screen
2. Grant permissions when prompted:
   - Location access
   - Camera access (when taking profile picture)
   - Photo library access

## Part 6: Testing Checklist

### Core Features to Test:
- ✅ App launches successfully
- ✅ Location permission works
- ✅ Home screen loads activities
- ✅ Search and filters work
- ✅ Activity details display correctly
- ✅ Profile tab loads
- ✅ Profile picture upload works (S3)
- ✅ Friends system works
- ✅ Navigation between tabs
- ✅ Theme switching (light/dark)
- ✅ Language switching (EN/RO)
- ✅ Challenge Me feature
- ✅ Vibe profiles
- ✅ Activity completion tracking

### Performance Testing:
- ✅ App loads in < 3 seconds
- ✅ Images load from CloudFront
- ✅ No crashes or freezes
- ✅ Smooth scrolling
- ✅ API calls complete successfully

### Edge Cases:
- ✅ No internet connection handling
- ✅ Location services disabled
- ✅ Empty states (no activities, no friends)
- ✅ Error messages are user-friendly

## Part 7: Iterate and Update

### To Release New Build:
1. Update version/build number in Xcode
2. Make your changes
3. Archive again
4. Upload to TestFlight
5. Testers get automatic update notification

### Version Numbering:
- **Version**: User-facing (1.0.0, 1.1.0, 2.0.0)
- **Build**: Internal (1, 2, 3, 4...)

Example progression:
- 1.0.0 (1) - Initial TestFlight
- 1.0.0 (2) - Bug fixes
- 1.0.0 (3) - More fixes
- 1.1.0 (4) - New features
- 2.0.0 (1) - Major update

## Part 8: Prepare for App Store Release

### When Ready for Public Release:
1. Complete all App Store Connect information
2. Add screenshots (required):
   - 6.7" display (iPhone 15 Pro Max)
   - 6.5" display (iPhone 11 Pro Max)
   - 5.5" display (iPhone 8 Plus)
3. Add app preview video (optional but recommended)
4. Write app description
5. Add keywords for search
6. Submit for App Review
7. Wait 1-3 days for review
8. App goes live!

## Troubleshooting

### Build Fails in Xcode:
- Clean build folder: Product → Clean Build Folder
- Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- Update CocoaPods: `cd ios && pod install`

### Archive Not Showing in Organizer:
- Check build target is "Any iOS Device"
- Check scheme is set to "Release"
- Check signing is configured correctly

### Upload Fails:
- Check internet connection
- Verify Apple Developer account is active
- Check bundle ID matches App ID
- Ensure all required icons are present

### TestFlight Build Not Appearing:
- Wait 10-15 minutes after upload
- Check email for processing errors
- Verify export compliance was submitted

### App Crashes on Launch:
- Check API_BASE_URL is correct
- Verify backend is accessible
- Check Info.plist permissions
- Review crash logs in Xcode Organizer

## Cost Summary

### One-Time Costs:
- Apple Developer Program: $99/year
- App icons/design: $0-500 (can use free tools)

### Ongoing Costs:
- AWS infrastructure: ~$55-190/month (see AWS_DEPLOYMENT_ARCHITECTURE.md)
- Domain name: ~$12/year (optional)
- SSL certificate: Free (AWS Certificate Manager)

## Next Steps

1. ✅ Complete AWS setup (AWS_SETUP_GUIDE.md)
2. ✅ Deploy backend to AWS
3. ✅ Update API URLs in app
4. ✅ Build and upload to TestFlight
5. ✅ Test thoroughly with beta testers
6. ✅ Iterate based on feedback
7. ✅ Submit for App Store review
8. 🎉 Launch!

## Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

Good luck with your launch! 🚀
