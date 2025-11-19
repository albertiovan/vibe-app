# Profile Customization - Quick Start Guide

## How to Test the Feature

### 1. Navigate to Profile Screen
- Open the app
- Tap the profile icon (top-right on most screens)
- Or navigate to "Profile & Settings" from menu

### 2. You'll See the New Profile Header
```
┌─────────────────────────────────────┐
│  [Avatar]  John Doe                 │
│   (80px)   john@email.com           │
│            [Edit Profile]           │
└─────────────────────────────────────┘
```

**Avatar Options:**
- If no photo: Shows first letter in colored circle (e.g., "J")
- If photo exists: Shows profile picture
- Small pencil icon badge on avatar

### 3. Open Profile Editor
**Two ways:**
1. Tap the avatar directly
2. Tap "Edit Profile" button

### 4. Customize Your Profile

#### Add/Change Profile Picture
1. Tap the large circular photo area
2. Choose from action sheet:
   - **Take Photo** - Opens camera
   - **Choose from Library** - Opens photo picker
   - **Remove Photo** - Deletes current photo (if exists)
   - **Cancel** - Close menu

3. If taking/picking photo:
   - Built-in crop tool appears (square crop)
   - Adjust as needed
   - Confirm selection
   - Photo appears immediately in preview

#### Edit Nickname
1. Tap the nickname text field
2. Enter your display name (max 30 characters)
3. Character counter shows remaining: "15/30"
4. This will be your public name for social features

#### View Private Info
- Your full name is shown as "Private"
- This won't be shared with friends
- Email (if provided) also shown

### 5. Save Changes
- Tap "Save Profile" button
- Success alert appears
- Modal closes automatically
- Profile header updates with new info

### 6. Cancel Without Saving
- Tap "Cancel" button at bottom
- Changes are discarded
- Modal closes

## Testing Scenarios

### Scenario 1: First Time Setup
```
1. New user with no customization
2. Avatar shows: "J" (first letter of name)
3. Name shows: "John Doe" (full name)
4. Tap "Edit Profile"
5. Add photo from library
6. Set nickname: "Johnny"
7. Save
8. Profile now shows:
   - Photo instead of letter
   - "Johnny" as main name
   - "John Doe" below as real name
```

### Scenario 2: Update Existing Profile
```
1. User with nickname "Johnny" and photo
2. Tap avatar to edit
3. Change nickname to "JD"
4. Remove photo
5. Save
6. Profile now shows:
   - "J" letter (photo removed)
   - "JD" as main name
   - "John Doe" below as real name
```

### Scenario 3: Permission Denied
```
1. Tap "Take Photo" or "Choose from Library"
2. If permission denied:
   - Alert appears: "Permission Required"
   - Explains why permission needed
   - User can go to Settings to enable
```

## Visual States

### Avatar Display Logic
```
IF profilePicture exists:
  → Show photo (80x80 circle)
ELSE:
  → Show colored circle with first letter
  → Color: cyan (accent.primary + 40% opacity)
  → Letter: white, 36px, bold
```

### Nickname Display Logic
```
IF nickname exists:
  → Show nickname as main name (XL, bold)
  → Show full name below (SM, secondary)
ELSE:
  → Show full name as main name (XL, bold)
  → No secondary line
```

## Keyboard Shortcuts (iOS)

- **Return/Done:** Save and close (when in text field)
- **Escape:** Cancel and close modal

## Permissions Required

### First Time Photo Access
1. Tap photo option
2. iOS/Android permission dialog appears
3. User must grant permission
4. If denied, feature explains why needed

### Permission Prompts
- **Camera:** "We need access to your camera to take a profile picture"
- **Photos:** "We need access to your photos to set your profile picture"

## Data Persistence

### Where Data is Stored
- AsyncStorage (local device)
- Key: `@vibe_user_account`
- Persists across app restarts
- Cleared only when user logs out or clears data

### What's Saved
```json
{
  "userId": "user_1234567890_abc123",
  "name": "John Doe",
  "nickname": "Johnny",
  "email": "john@email.com",
  "profilePicture": "file:///path/to/photo.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "onboardingCompleted": true
}
```

## Troubleshooting

### Photo Not Showing
- Check if URI is valid
- Try removing and re-adding photo
- Check file permissions
- Verify photo wasn't deleted from device

### Nickname Not Saving
- Ensure nickname is not empty
- Check for special characters (all allowed)
- Verify AsyncStorage is working
- Check console for errors

### Modal Won't Close
- Try tapping Cancel button
- Check for unsaved changes alert
- Restart app if stuck

### Permission Issues
**iOS:**
1. Go to Settings → Privacy → Photos/Camera
2. Find "Vibe" app
3. Enable permission

**Android:**
1. Go to Settings → Apps → Vibe
2. Tap Permissions
3. Enable Camera/Storage

## Development Testing

### Reset Profile Data
```typescript
// In DevMenu or console
import { userStorage } from './src/services/userStorage';
await userStorage.clearAllData();
// App will show onboarding again
```

### Test Different States
```typescript
// No nickname, no photo
await userStorage.updateAccount({
  nickname: undefined,
  profilePicture: undefined
});

// With nickname, no photo
await userStorage.updateAccount({
  nickname: "Johnny",
  profilePicture: undefined
});

// With nickname and photo
await userStorage.updateAccount({
  nickname: "Johnny",
  profilePicture: "file:///path/to/photo.jpg"
});
```

## Next Steps After Testing

Once you've confirmed the feature works:

1. **Add to Onboarding** (Optional)
   - Add profile setup step after interests
   - "Set up your profile for future social features"
   - Skip button for later

2. **Show in Other Screens**
   - Display avatar in navigation header
   - Show nickname in chat messages
   - Use in activity sharing (future)

3. **Cloud Storage** (Future)
   - Upload photos to S3/Cloudinary
   - Generate thumbnails
   - Sync across devices

4. **Social Features** (Future)
   - Friends list with avatars
   - Activity sharing with profile
   - Group activities with members
   - Public profiles and discovery

## Questions?

Check the full documentation: `PROFILE_CUSTOMIZATION_FEATURE.md`
