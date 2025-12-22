# Challenge Me Button - Custom Images Setup

## Images to Save

You need to save the two images you uploaded to the `/assets` folder with these exact names:

### 1. Light Mode Image
**Filename:** `challenge-me-light.png`
**Content:** "CHALLENGE ME" text with boxing glove icon (black text on transparent/light background)
**Location:** `/Users/aai/CascadeProjects/vibe-app/assets/challenge-me-light.png`

### 2. Dark Mode Image  
**Filename:** `challenge-me-dark.png`
**Content:** Adventure activity silhouettes (biking, skiing, skydiving - black silhouettes on transparent background)
**Location:** `/Users/aai/CascadeProjects/vibe-app/assets/challenge-me-dark.png`

## How to Save

1. **Download/Save the images** from your upload
2. **Rename them** to the exact filenames above
3. **Move them** to the `/assets` folder in your project
4. **Reload the app** - the button will automatically use the correct image based on theme

## What the Code Does

The Challenge Me button now:
- ✅ Shows `challenge-me-light.png` in **light mode**
- ✅ Shows `challenge-me-dark.png` in **dark mode**
- ✅ Automatically switches when you toggle themes
- ✅ Uses `resizeMode="contain"` to fit the image properly
- ✅ Has a height of 60px with full width

## Current Implementation

```tsx
<TouchableOpacity
  onPress={handleChallengeMe}
  style={styles.challengeButton}
  activeOpacity={0.7}
>
  <Image
    source={
      resolvedTheme === 'light'
        ? require('../assets/challenge-me-light.png')
        : require('../assets/challenge-me-dark.png')
    }
    style={styles.challengeImage}
    resizeMode="contain"
  />
</TouchableOpacity>
```

## Styles

```tsx
challengeButton: {
  paddingHorizontal: 20,
  paddingVertical: 16,
  alignItems: 'center',
  justifyContent: 'center',
},
challengeImage: {
  width: '100%',
  height: 60,
},
```

## Testing

After saving the images:
1. Open the app
2. Toggle between light and dark mode
3. The Challenge Me button should show different images for each theme
4. Both images should be clearly visible and properly sized

## Troubleshooting

If images don't show:
- ✅ Check filenames are **exactly** `challenge-me-light.png` and `challenge-me-dark.png`
- ✅ Check they're in the `/assets` folder (same folder as `orb.png`)
- ✅ Restart the Metro bundler: `npm start --reset-cache`
- ✅ Rebuild the app if using iOS/Android native build
