# Profile Customization Feature

## Overview
Comprehensive user profile customization system with nickname and profile picture support, designed to scale for future social features (friends, sharing, activity groups, etc.).

## Features Implemented

### 1. User Account Schema Updates
**File:** `/src/services/userStorage.ts`

Added new fields to `UserAccount` interface:
- `nickname?: string` - Display name for social features
- `profilePicture?: string` - URI to profile photo (local or remote)

### 2. ProfileCustomization Component
**File:** `/components/ProfileCustomization.tsx`

Full-featured profile editor with:
- **Profile Picture Management**
  - Pick from photo library
  - Take new photo with camera
  - Square crop (1:1 aspect ratio)
  - Remove existing photo
  - 140x140px circular display with cyan border
  - Edit overlay on hover/tap
  
- **Nickname Editor**
  - 30 character limit with counter
  - Real-time validation
  - Auto-capitalization
  - Placeholder support
  
- **Privacy Display**
  - Shows full name as private
  - Clear distinction between public nickname and private name
  
- **Modal Support**
  - Can be used as full-screen modal or inline component
  - Smooth slide-in animation
  - Cancel/Save actions

### 3. UserProfileScreen Integration
**File:** `/screens/UserProfileScreen.tsx`

Enhanced profile screen with:
- **Profile Header Card**
  - Large circular avatar (80x80px)
  - Displays profile picture or initial letter
  - Edit badge with pencil icon
  - Nickname display (falls back to full name)
  - Full name shown below nickname (if nickname exists)
  - Email display
  - "Edit Profile" button
  
- **Tap-to-Edit**
  - Avatar is tappable to open editor
  - Edit button opens full customization modal
  
- **Auto-Refresh**
  - Profile reloads after updates
  - Changes reflect immediately

## User Experience Flow

### First Time Setup
1. User completes onboarding with full name
2. User navigates to Profile screen
3. Profile header shows initial letter in placeholder avatar
4. User taps avatar or "Edit Profile" button
5. ProfileCustomization modal opens
6. User can add photo and set nickname
7. Changes save and reflect immediately

### Editing Profile
1. User taps avatar or "Edit Profile" button
2. Modal opens with current values pre-filled
3. User can:
   - Change profile picture (library/camera/remove)
   - Edit nickname
   - See full name (read-only)
4. Tap "Save Profile" to persist changes
5. Modal closes, profile header updates

### Photo Selection
1. User taps profile picture area
2. Action sheet appears with options:
   - "Take Photo" (requires camera permission)
   - "Choose from Library" (requires photo permission)
   - "Remove Photo" (only if photo exists)
   - "Cancel"
3. Selected photo is cropped to square
4. Preview shows immediately
5. Save to persist

## Permissions Required

### iOS (Info.plist)
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos to set your profile picture</string>
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to take a profile picture</string>
```

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
```

## Technical Details

### Dependencies Added
- `expo-image-picker` - Native image picker and camera access

### Storage
- Profile data stored in AsyncStorage via `userStorage` service
- Profile pictures stored as local URIs
- Future: Can be uploaded to cloud storage (S3, Cloudinary, etc.)

### Data Structure
```typescript
interface UserAccount {
  userId: string;
  name: string;              // Full name (private)
  nickname?: string;         // Display name (public)
  email?: string;
  profilePicture?: string;   // Local URI or remote URL
  createdAt: string;
  onboardingCompleted: boolean;
}
```

### Image Handling
- **Format:** JPEG with 0.8 quality
- **Aspect Ratio:** 1:1 (square)
- **Editing:** Built-in crop tool
- **Display Sizes:**
  - Profile Header: 80x80px
  - Customization Modal: 140x140px
  - Future: Can add thumbnail generation

## Future Social Features Preparation

This implementation is designed to support:

### 1. Friends System
- Nickname will be displayed to friends
- Profile picture shown in friend lists
- Full name remains private

### 2. Activity Sharing
- Share activities with friends using nickname/photo
- "John wants to go hiking" notifications
- Friend activity feed

### 3. Group Activities
- Create activity groups with friends
- Group avatars and names
- Member lists with profile pictures

### 4. Leaderboards/Gamification
- Public profiles with nickname/photo
- Activity completion stats
- Badges and achievements

### 5. Social Discovery
- Find friends by nickname
- Profile previews in search
- Privacy controls (who can see profile)

## Design System Integration

### Colors
- Avatar border: `colors.accent.primary` (cyan)
- Edit badge: `colors.accent.primary` background
- Placeholder: `colors.accent.primary + '40'` (40% opacity)

### Typography
- Profile name: `fontSize.xl`, `fontWeight.bold`
- Real name: `fontSize.sm`, secondary color
- Email: `fontSize.xs`, tertiary color

### Spacing
- Consistent with `tokens.spacing` scale
- Glass card padding: `lg`
- Border radius: `sm` for buttons, `md` for cards

### Glass Morphism
- Profile header uses `GlassCard` component
- Customization modal uses `GlassCard` for content
- Consistent blur and transparency

## Accessibility

### Screen Readers
- Avatar has `accessibilityLabel`: "Profile picture, tap to edit"
- Edit button: "Edit profile"
- All inputs have proper labels

### Touch Targets
- All buttons ≥ 44×44 hit area
- Avatar: 80×80 (exceeds minimum)
- Edit button: Properly sized

### Keyboard Navigation
- TextInput supports keyboard
- Proper tab order
- Submit on keyboard "Done"

## Testing Checklist

- [ ] Add profile picture from library
- [ ] Take photo with camera
- [ ] Remove profile picture
- [ ] Edit nickname (valid input)
- [ ] Edit nickname (empty - should show error)
- [ ] Edit nickname (30+ chars - should truncate)
- [ ] Save changes and verify persistence
- [ ] Cancel without saving
- [ ] Reload app and verify data persists
- [ ] Test on iOS and Android
- [ ] Test permission denial scenarios
- [ ] Test with no camera/no photos
- [ ] Verify avatar placeholder shows initial
- [ ] Verify nickname falls back to full name

## Known Limitations

1. **Photo Storage:** Currently stores local URIs only
   - Future: Upload to cloud storage for cross-device sync
   
2. **No Image Optimization:** Photos stored at full resolution
   - Future: Add thumbnail generation and compression
   
3. **No Profile Visibility Controls:** All profiles are "private" for now
   - Future: Add privacy settings (public/friends/private)
   
4. **No Username/Handle:** Only nickname (can contain spaces)
   - Future: Add unique @username for mentions/search

## Migration Notes

Existing users will:
- Keep their full name as-is
- Have no nickname initially (falls back to name)
- Have no profile picture (shows initial letter)
- See the new profile header on next app launch
- Can optionally customize their profile

No data migration required - new fields are optional.

## Files Modified/Created

### Created
- `/components/ProfileCustomization.tsx` - Main customization component
- `/PROFILE_CUSTOMIZATION_FEATURE.md` - This documentation

### Modified
- `/src/services/userStorage.ts` - Added nickname and profilePicture fields
- `/screens/UserProfileScreen.tsx` - Added profile header and modal integration

### Dependencies
- Added `expo-image-picker` to package.json

## Usage Example

```typescript
import { ProfileCustomization } from '../components/ProfileCustomization';
import { userStorage } from '../src/services/userStorage';

// In your component
const [account, setAccount] = useState<UserAccount | null>(null);
const [showEditor, setShowEditor] = useState(false);

useEffect(() => {
  loadAccount();
}, []);

const loadAccount = async () => {
  const acc = await userStorage.getAccount();
  setAccount(acc);
};

// Render
{account && showEditor && (
  <ProfileCustomization
    account={account}
    onUpdate={async (updates) => {
      setAccount({ ...account, ...updates });
      await loadAccount();
    }}
    onClose={() => setShowEditor(false)}
    isModal={true}
  />
)}
```

## Next Steps

1. **Cloud Storage Integration**
   - Upload photos to S3/Cloudinary
   - Generate thumbnails
   - CDN delivery

2. **Username System**
   - Add unique @username field
   - Username validation and availability check
   - Search by username

3. **Privacy Controls**
   - Profile visibility settings
   - Block list
   - Friend requests

4. **Social Features**
   - Friends list
   - Activity sharing
   - Group activities

5. **Profile Enhancements**
   - Bio/description field
   - Location (city)
   - Interests badges
   - Activity stats showcase
