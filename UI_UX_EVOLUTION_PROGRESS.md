# UI/UX Evolution Progress

## Overview
Evolving the Vibe app UI/UX based on 21st.dev design principles with React Native adaptations.

## Core Principles
- **Pre-vibe state**: Visually neutral, non-directive (neutral greys, muted blue accent)
- **Post-vibe state**: Subtle background tint/gradient derived from vibe color (5-10% saturation)
- **Category colors**: Expressive but not neon, used as accents (borders, glows, chips)
- **Minimal, calm, premium**: Focus on readability and one element at a time

---

## ✅ COMPLETED

### 1. Design System Foundation
**Files Created/Modified:**
- `/src/design-system/colors.ts` - Enhanced with:
  - Neutral color palette for pre-vibe state
  - Refined category colors (15 categories)
  - High-energy accent (Challenge Me)
  - Helper functions: `getVibeColorPalette()`, `getNeutralColor()`, `hexToRgba()`

**Category Color Mapping:**
```typescript
wellness: '#4ECDC4'      // Teal/soft-blue
nature: '#00B894'        // Green
culture: '#D4876F'       // Warm terracotta
adventure: '#FF8E53'     // Orange
culinary: '#FFB366'      // Warm apricot
water: '#4ECDC4'         // Cyan/blue
nightlife: '#9B59B6'     // Purple
social: '#FF6B9D'        // Pink/magenta
fitness: '#00D2A0'       // Green/blue accent
sports: '#74B9FF'        // Clear blue
seasonal: '#6B8E7F'      // Evergreen
romance: '#FD79A8'       // Pink
mindfulness: '#A78BFA'   // Lavender
creative: '#C084FC'      // Playful purple/pink
```

### 2. Theme System
**Files Created:**
- `/src/contexts/ThemeContext.tsx` - React Native theme provider
  - Supports light/dark/system modes
  - Persists preference to AsyncStorage
  - Provides `useTheme()` hook

- `/components/ThemeToggle.tsx` - Theme switcher component
  - Three options: Light ☀️, Dark 🌙, System ⚙️
  - Integrated design system styling

**Integration:**
- `App.tsx` wrapped with `<ThemeProvider>`
- Theme state available throughout app

### 3. React Native Animation Components
**Files Created:**

#### `/ui/components/BorderBeam.tsx`
- Shimmering border effect using Reanimated
- For Challenge Me cards and highlighted suggestions
- Props: `lightColor`, `borderWidth`, `duration`, `borderRadius`
- Uses LinearGradient with rotation animation

#### `/ui/components/ShineBorder.tsx`
- Subtle passing light effect
- For focused cards or selected chips
- Props: `shineColor`, `duration`, `delay`, `repeat`
- One-shot or continuous animation

#### `/ui/components/AnimatedGradientBackground.tsx`
- Slow-moving gradient background
- For Challenge Me screen immersive moment
- Props: `colors` (array), `duration`
- Smooth color interpolation

#### `/ui/components/CategoryGradientCard.tsx`
- Activity card with category-colored aura
- Neutral surface for readability + subtle gradient
- Props: `category`, `intensity` (subtle/medium/strong)
- Uses BlurView + LinearGradient

#### `/ui/components/GlowButton.tsx`
- Button with breathing glow effect
- For primary CTAs ("Accept", "Go Now")
- Props: `glowColor`, `textColor`
- Animated scale + opacity

---

## 🚧 IN PROGRESS

### 4. Screen Updates

#### Home Screen (`/screens/HomeScreenShell.tsx`)
**TODO:**
- [ ] Implement pre-vibe neutral state
  - Use neutral colors from design system
  - Remove/reduce existing strong colors
  - Single neutral accent for focus states
- [ ] Implement post-vibe subtle tint
  - Detect when vibe is set (query submitted or profile selected)
  - Apply 5-10% opacity background gradient based on vibe
  - Use `getVibeColorPalette()` helper
- [ ] Update Challenge Me button
  - Make visually secondary in pre-vibe state
  - No loud colors or heavy animations initially

#### Profile Screen (`/screens/UserProfileScreen.tsx`)
**TODO:**
- [ ] Add vibe aura behind avatar
  - Blurred background using current vibe color
  - Use `getVibeColorPalette()` with 'subtle' intensity
- [ ] Add subtitle showing current vibe profile
  - "Current vibe profile · Explorer"
  - Use vibe accent color
- [ ] Update favorite category chips
  - Use category colors from mapping
  - Unselected: neutral background + border
  - Selected: category-colored border + tiny glow
  - Optional: one-shot shimmer on selection (ShineBorder)
- [ ] Integrate ThemeToggle component
  - Add under Settings section
  - Wire to existing theme context

#### Suggestions Screen (`/screens/SuggestionsScreenShell.tsx` or `/screens/MinimalSuggestionsScreen.tsx`)
**TODO:**
- [ ] Wrap cards in CategoryGradientCard
  - Pass activity category to component
  - Use 'subtle' intensity by default
- [ ] Add ShineBorder to focused card
  - Only one card at a time
  - Use category color for shine
  - Avoid multiple simultaneous animations
- [ ] Ensure scrolling performance
  - Test with FlatList virtualization
  - Monitor frame rate

#### Challenge Me Screen (`/screens/MinimalChallengeMeScreen.tsx` or `/screens/ChallengeMeScreen.tsx`)
**TODO:**
- [ ] Wrap screen in AnimatedGradientBackground
  - Blend current vibe palette + high-energy accent
  - Slow, smooth animation (8-10s duration)
- [ ] Wrap challenge card in BorderBeam
  - Use high-energy color (`colors.highEnergy.primary`)
  - Neutral interior for readability
- [ ] Replace CTA button with GlowButton
  - "Accept Challenge", "Go Now"
  - Use high-energy glow color
  - Breathing animation

#### Activity Detail Screen (`/screens/ActivityDetailScreenShell.tsx` or `/screens/MinimalActivityDetailScreen.tsx`)
**TODO:**
- [ ] Apply minimal category styling
  - Thin border or simple shine (one-time on appear)
  - Category/energy/location chips with category color
  - Keep text area clean and readable
  - Avoid constant motion

---

## 📋 REMAINING TASKS

### 5. State Management
**TODO:**
- [ ] Create vibe state context or hook
  - Track current vibe (pre-vibe vs post-vibe)
  - Track selected vibe profile
  - Provide vibe color palette to components
- [ ] Wire vibe state to screens
  - Home screen detects vibe changes
  - Profile screen shows current vibe
  - Suggestions/Detail use vibe for styling

### 6. Testing & Refinement
**TODO:**
- [ ] Test light/dark theme switching
  - Verify all screens update correctly
  - Check color contrast ratios
  - Ensure CSS variables sync
- [ ] Test across vibes
  - Calm, excited, romantic, adventurous
  - Verify color palettes apply correctly
  - Check gradient intensities
- [ ] Test across categories
  - All 15 categories
  - Verify color mapping
  - Check chip/card styling
- [ ] Performance optimization
  - Monitor animation frame rates
  - Check memory usage with 3D gradients
  - Optimize re-renders
- [ ] Fix z-index/pointer issues
  - Ensure BorderBeam doesn't block taps
  - Verify Glow doesn't interfere with clicks
  - Test hit areas on all interactive elements

### 7. Bug Prevention
**TODO:**
- [ ] Run type checks (`npx tsc --noEmit`)
- [ ] Run linting
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Verify no duplicate components (Button, Card, Badge)
- [ ] Check Tailwind config (if web version exists)
- [ ] Ensure no theme context conflicts

---

## 🎯 NEXT STEPS

1. **Create vibe state management**
   - Hook or context to track current vibe
   - Helper to determine pre-vibe vs post-vibe
   
2. **Update Home screen**
   - Neutral pre-vibe state
   - Subtle post-vibe tint
   
3. **Update Profile screen**
   - Vibe aura, subtitle, category chips, theme toggle
   
4. **Update Suggestions screen**
   - Category gradient cards, focused card shimmer
   
5. **Update Challenge Me screen**
   - Animated background, BorderBeam card, Glow CTA
   
6. **Update Activity Detail screen**
   - Minimal category styling
   
7. **Test everything**
   - Themes, vibes, categories, performance

---

## 📝 NOTES

- This is a **React Native app**, not Next.js/web
- 21st.dev components required adaptation from web (Tailwind) to RN (StyleSheet)
- All animations use `react-native-reanimated` (already installed)
- Theme system uses AsyncStorage (already installed)
- No new dependencies required beyond what's already in package.json
- Keep changes incremental and testable
- Prioritize performance (60fps) over visual complexity
- Follow existing code patterns and file structure

---

## 🔗 KEY FILES

**Design System:**
- `/src/design-system/colors.ts`
- `/src/design-system/tokens.ts`
- `/ui/theme/colors.ts`
- `/ui/theme/tokens.ts`

**Theme:**
- `/src/contexts/ThemeContext.tsx`
- `/components/ThemeToggle.tsx`

**Animation Components:**
- `/ui/components/BorderBeam.tsx`
- `/ui/components/ShineBorder.tsx`
- `/ui/components/AnimatedGradientBackground.tsx`
- `/ui/components/CategoryGradientCard.tsx`
- `/ui/components/GlowButton.tsx`

**Screens:**
- `/screens/HomeScreenShell.tsx` (or `/screens/HomeScreenMinimal.tsx`)
- `/screens/UserProfileScreen.tsx` (or `/screens/MinimalUserProfileScreen.tsx`)
- `/screens/SuggestionsScreenShell.tsx` (or `/screens/MinimalSuggestionsScreen.tsx`)
- `/screens/ChallengeMeScreen.tsx` (or `/screens/MinimalChallengeMeScreen.tsx`)
- `/screens/ActivityDetailScreenShell.tsx` (or `/screens/MinimalActivityDetailScreen.tsx`)

**App Entry:**
- `/App.tsx` (wrapped with ThemeProvider)
