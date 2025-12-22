# Testing New Home Screen 🧪

## Setup Complete! ✅

The NewHomeScreen is now integrated and set as the initial route.

---

## What to Test

### 1. **Startup Animation Sequence**
**Expected behavior:**
1. App opens with vibe gradient background
2. "Hello [your name]" fades in smoothly (0.8s)
3. Text holds for 2 seconds
4. "Hello [name]" fades out (0.6s)
5. "What's the vibe?" fades in (0.8s)
6. Main screen appears with input and navigation

**Total animation time:** ~4 seconds

**What to check:**
- ✅ Animations are smooth (60fps)
- ✅ No jank or stuttering
- ✅ Text is centered and readable
- ✅ Gradient background is visible
- ✅ Transitions feel natural

### 2. **Theme Switching**
**How to test:**
- Open profile (bottom nav → Profile icon)
- Toggle between light and dark mode

**What to check:**
- ✅ Background gradient updates
- ✅ Text colors change appropriately
- ✅ Input box styling updates
- ✅ Bottom nav updates
- ✅ All text is readable in both themes

### 3. **Vibe Input**
**How to test:**
- Type in the "Describe your vibe..." input
- Watch for submit arrow (→) to appear

**What to check:**
- ✅ Input is responsive
- ✅ Placeholder text is visible
- ✅ Submit arrow appears when typing
- ✅ Keyboard doesn't cover input
- ✅ Can submit with Enter key

### 4. **Bottom Navigation**
**How to test:**
- Tap each tab: Home 🏠, Profile 👤, Challenge ⚡

**What to check:**
- ✅ Active tab highlights
- ✅ Tab switches smoothly
- ✅ Content area updates
- ✅ Navigation feels responsive
- ✅ Icons and labels are clear

### 5. **Action Buttons**
**How to test:**
- Tap "Filters" button
- Tap "Vibe Profiles" button

**What to check:**
- ✅ Buttons are tappable
- ✅ Visual feedback on press
- ✅ Glassy styling looks good
- ✅ Icons and text are clear

---

## Known Placeholders

These are intentionally incomplete and will be built next:

1. **Home Tab Content** - Shows "Home content coming soon..."
2. **Profile Tab** - Shows "Profile content coming soon..."
3. **Challenge Tab** - Shows "Challenge Me content coming soon..."
4. **Filters Panel** - Button exists but doesn't open panel yet
5. **Vibe Profiles** - Button exists but doesn't open panel yet
6. **Vibe Submit** - Input works but doesn't navigate yet

---

## Performance Expectations

### Smooth Animations:
- All animations should run at 60fps
- No dropped frames during transitions
- Reanimated runs on UI thread (not JS thread)

### Fast Startup:
- Greeting animation starts immediately
- No loading delays
- Gradient renders instantly

### Responsive Input:
- Keyboard appears quickly
- Typing is smooth
- No input lag

---

## How to Run

```bash
# If Metro is already running, just reload:
# - iOS: Cmd+R in simulator
# - Android: Double-tap R
# - Physical device: Shake and tap "Reload"

# If Metro is not running:
npm start

# Then press:
# - 'i' for iOS
# - 'a' for Android
```

---

## Troubleshooting

### Animation doesn't play:
- **Fix:** Restart Metro bundler: `npm start --reset-cache`
- **Reason:** Reanimated cache might be stale

### Gradient not showing:
- **Check:** Background should be transparent in styles
- **Fix:** Verify `backgroundColor: 'transparent'` in SafeAreaView

### Text not visible:
- **Check:** Theme colors are being applied
- **Fix:** Toggle theme in profile to refresh

### Bottom nav not showing:
- **Check:** Greeting animation completed
- **Fix:** Wait for full animation sequence (4 seconds)

### Keyboard covers input:
- **Check:** KeyboardAvoidingView is working
- **Fix:** Adjust `keyboardVerticalOffset` if needed

---

## Next Steps After Testing

Once you confirm the animations are smooth:

1. **Build Home Tab** - Community updates, sidequests
2. **Build Challenge Tab** - Challenge Me home page
3. **Wire up Profile Tab** - Use existing MinimalUserProfileScreen
4. **Connect Filters** - Open filters panel on button press
5. **Connect Vibe Profiles** - Open profiles panel on button press
6. **Wire up Submit** - Navigate to suggestions on vibe submit

---

## Success Criteria

✅ **Startup animation is smooth and beautiful**
✅ **Theme switching works perfectly**
✅ **Input is responsive and accessible**
✅ **Navigation feels intuitive**
✅ **All text is readable in both themes**
✅ **No performance issues or lag**

**If all criteria are met, we're ready to build the tab content!** 🚀
