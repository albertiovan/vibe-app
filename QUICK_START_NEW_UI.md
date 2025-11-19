# Quick Start: New Visual Shell UI

## Get Started in 3 Steps

### Step 1: Add the Orb Image
The only missing piece is the orb image asset.

**Option A: Use Provided Orb (Recommended)**
1. Save Image 4 from your mockups (the glowing blue orb) as orb.png
2. Copy it to: /assets/orb.png
3. Replace the empty placeholder file

**Option B: Temporary Placeholder (For Testing)**
If you want to test immediately without the orb, comment out the orb image in NewChatHomeScreen.tsx

**Option C: Use Any Circular Image**
Any PNG with a glowing sphere will work as a temporary substitute.

### Step 2: Run the App
```bash
npm start
npm run ios
npm run android
```

### Step 3: Test the Flow
1. Open app - see new home screen with orb and glass UI
2. Type a vibe and press send
3. View 5 activity suggestions with glass cards
4. Tap Explore Now on any card
5. See photo carousel and nearest venue selected
6. Tap GO NOW to open Google Maps

## What Changed
- Home screen now uses NewChatHomeScreen with static orb design
- Activity suggestions show in new glass card list format
- Detail screen has photo carousel and nearest venue logic
- All original functionality preserved (can switch back anytime)

## Switch Back to Original
Change initialRouteName in App.tsx from NewChatHome to ChatHome

## Need Help
See VISUAL_SHELL_REDESIGN_COMPLETE.md for full documentation
