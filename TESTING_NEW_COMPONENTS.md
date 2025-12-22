# Testing New UI/UX Components

## Quick Start

### 1. Start the App
```bash
cd /Users/aai/CascadeProjects/vibe-app
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator

### 2. Navigate to Component Showcase

**Option A: From Profile Screen**
1. Open the app
2. Tap the profile icon (top-right)
3. Scroll down to "Quick Access"
4. Tap **"Component Showcase"** (only visible in dev mode)

**Option B: Direct Navigation (Dev Menu)**
1. Shake device/simulator
2. Select "Component Showcase" from dev menu

---

## What to Test

### ✅ Theme Toggle
**Location:** Top of showcase screen

**Test:**
1. Toggle between Light ☀️, Dark 🌙, and System ⚙️
2. Verify theme changes throughout the app
3. Close and reopen app - theme should persist

**Expected:**
- Smooth theme transition
- All components update colors
- Preference saved to AsyncStorage

---

### ✅ BorderBeam
**Location:** First demo card

**Test:**
1. Observe the animated shimmering border
2. Should rotate smoothly around the card
3. Uses high-energy yellow color

**Expected:**
- Smooth 360° rotation (3 second loop)
- No performance issues
- Border doesn't block card content

**Use Case:** Challenge Me cards, highlighted suggestions

---

### ✅ ShineBorder
**Location:** Second demo card

**Test:**
1. Watch for subtle light passing across the card
2. Should repeat continuously
3. Color matches selected category

**Expected:**
- Smooth horizontal shine animation
- Fades in/out naturally
- Doesn't distract from content

**Use Case:** Focused cards, selected filter chips

---

### ✅ CategoryGradientCard
**Location:** Third demo section with category selector

**Test:**
1. Tap different category chips (wellness, nature, culture, etc.)
2. Observe card's gradient aura change
3. Each category has unique color

**Expected:**
- Instant category color update
- Subtle gradient (not overwhelming)
- Neutral surface maintains readability
- Border color matches category

**Category Colors to Verify:**
- Wellness: Teal/soft-blue (#4ECDC4)
- Nature: Green (#00B894)
- Culture: Warm terracotta (#D4876F)
- Adventure: Orange (#FF8E53)
- Culinary: Warm apricot (#FFB366)
- Water: Cyan (#4ECDC4)
- Nightlife: Purple (#9B59B6)
- Social: Pink/magenta (#FF6B9D)
- Fitness: Green/blue (#00D2A0)
- Sports: Clear blue (#74B9FF)

**Use Case:** Activity cards with category-specific styling

---

### ✅ GlowButton
**Location:** Fourth demo section

**Test:**
1. Observe the breathing glow animation
2. Tap the button
3. Should show alert

**Expected:**
- Smooth scale + opacity animation (2 second loop)
- Glow pulses gently
- Button remains tappable
- High-energy yellow glow

**Use Case:** Primary CTAs ("Accept Challenge", "Go Now")

---

### ✅ Color Palette
**Location:** Bottom of showcase

**Test:**
1. Scroll through all 14 category colors
2. Verify each is distinct and readable

**Expected:**
- All colors visible and distinct
- No neon/harsh colors
- Labels readable

---

## Performance Checks

### Frame Rate
- Open React Native debugger
- Monitor FPS while scrolling showcase
- Should maintain 60fps

**Commands:**
```bash
# iOS
npx react-native log-ios

# Android  
npx react-native log-android
```

### Memory Usage
- Check Xcode Instruments (iOS) or Android Profiler
- Animations shouldn't cause memory leaks
- Smooth scrolling with no jank

### Animation Smoothness
All animations should:
- Start/stop smoothly
- No stuttering or frame drops
- Work on both iOS and Android

---

## Known Limitations

### Current State
- ✅ All 5 animation components working
- ✅ Theme system integrated
- ✅ Category color mapping complete
- ⚠️ Not yet integrated into main screens
- ⚠️ Vibe state management pending

### What's NOT Tested Yet
- Home screen pre-vibe vs post-vibe states
- Profile screen vibe aura
- Suggestions screen with CategoryGradientCard
- Challenge Me screen with full integration
- Activity Detail with category styling

---

## Troubleshooting

### "Cannot find module" errors
```bash
cd /Users/aai/CascadeProjects/vibe-app
npm install
```

### Animations not working
- Ensure `react-native-reanimated` is installed
- Check that Reanimated plugin is in `babel.config.js`
- Restart Metro bundler

### Theme not persisting
- Check AsyncStorage permissions
- Clear app data and try again
- Verify ThemeProvider wraps entire app

### Colors look wrong
- Verify you're in dark mode (default)
- Check `resolvedTheme` value in showcase
- Compare against color palette section

---

## Next Steps

After verifying showcase works:

1. **Integrate into Home screen**
   - Add neutral pre-vibe state
   - Add subtle post-vibe tint

2. **Integrate into Profile screen**
   - Add vibe aura behind avatar
   - Update category chips with colors
   - Add theme toggle

3. **Integrate into Suggestions screen**
   - Wrap cards in CategoryGradientCard
   - Add ShineBorder to focused card

4. **Integrate into Challenge Me**
   - Add AnimatedGradientBackground
   - Wrap card in BorderBeam
   - Replace CTA with GlowButton

5. **Test end-to-end**
   - Full user flow
   - All themes
   - All categories
   - Performance

---

## Reporting Issues

If you find bugs:

1. Note which component
2. Note device/simulator
3. Note theme (light/dark)
4. Check console for errors
5. Take screenshot if visual issue

**Console Logs:**
```bash
# iOS
npx react-native log-ios | grep -i error

# Android
npx react-native log-android | grep -i error
```

---

## Success Criteria

✅ All 5 components render without errors
✅ Animations run smoothly at 60fps
✅ Theme toggle works and persists
✅ Category colors match spec
✅ No memory leaks
✅ Works on both iOS and Android
✅ No TypeScript errors in new files
✅ Scrolling is smooth
✅ Buttons are tappable
✅ Text is readable on all backgrounds

---

## Files Created

**Components:**
- `/ui/components/BorderBeam.tsx`
- `/ui/components/ShineBorder.tsx`
- `/ui/components/AnimatedGradientBackground.tsx`
- `/ui/components/CategoryGradientCard.tsx`
- `/ui/components/GlowButton.tsx`

**Theme:**
- `/src/contexts/ThemeContext.tsx`
- `/components/ThemeToggle.tsx`

**Design System:**
- `/src/design-system/colors.ts` (enhanced)

**Showcase:**
- `/screens/ComponentShowcaseScreen.tsx`

**Documentation:**
- `/UI_UX_EVOLUTION_PROGRESS.md`
- `/TESTING_NEW_COMPONENTS.md` (this file)
