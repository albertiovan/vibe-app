# Third-Party Licenses

This file documents third-party assets, libraries, and dependencies used in the Vibe app.

## Libraries & Frameworks

### expo-linear-gradient (v15.0.7)
- **License:** MIT
- **Purpose:** Linear gradient backgrounds and button effects for visual shell redesign
- **Repository:** https://github.com/expo/expo/tree/main/packages/expo-linear-gradient
- **Usage:** Background gradients, radiating light effects, glass button gradients

### expo-blur (v15.0.7)
- **License:** MIT
- **Purpose:** Glass morphism (frosted glass) effects on inputs and buttons
- **Repository:** https://github.com/expo/expo/tree/main/packages/expo-blur
- **Usage:** Blur effects on glass capsule inputs, utility buttons, activity cards

### react-native-reanimated (v4.1.3)
- **License:** MIT
- **Purpose:** High-performance animations for UI elements
- **Repository:** https://github.com/software-mansion/react-native-reanimated
- **Usage:** Photo carousel animations, radiating gradient effects

### @react-navigation/native (v7.1.18)
- **License:** MIT
- **Purpose:** Navigation framework for screen transitions
- **Repository:** https://github.com/react-navigation/react-navigation
- **Usage:** Stack navigation between Home, Suggestions, and Detail screens

### @react-navigation/native-stack (v7.3.28)
- **License:** MIT
- **Purpose:** Native stack navigator for React Navigation
- **Repository:** https://github.com/react-navigation/react-navigation
- **Usage:** Native screen transitions and navigation

### react-native-gesture-handler (v2.28.0)
- **License:** MIT
- **Purpose:** Native gesture handling for touch interactions
- **Repository:** https://github.com/software-mansion/react-native-gesture-handler
- **Usage:** Swipe gestures for photo carousel

### @react-native-async-storage/async-storage (v2.2.0)
- **License:** MIT
- **Purpose:** Persistent local storage for user preferences
- **Repository:** https://github.com/react-native-async-storage/async-storage
- **Usage:** User account, preferences, and vibe profiles storage

### expo-location (v19.0.7)
- **License:** MIT
- **Purpose:** Location services for nearest venue calculation
- **Repository:** https://github.com/expo/expo/tree/main/packages/expo-location
- **Usage:** User location for distance calculations and venue selection

---

## Assets

### Orb Image
- **File:** `/assets/orb.png`
- **Status:** Placeholder (requires user-provided asset)
- **License:** N/A (to be provided by user)
- **Usage:** Static orb image on home screen
- **Specifications:** Transparent PNG, 500x500px recommended

---

## Icons & Emojis

All icons in the app use:
- **Unicode Emoji:** Standard system emojis (no additional licensing required)
- **Usage:** Profile icon (👤), utility buttons (⚙️, 📚), meta icons (⏱, 📍, 📌)

---

## Fonts

The app uses default system fonts:
- **iOS:** San Francisco
- **Android:** Roboto
- **License:** System fonts (no additional licensing required)

---

## Color Palette

The blue/cyan gradient color scheme is custom-designed:
- **Colors:** #0A0E17, #1A2332, #0F1922, #00AAFF, #00FFFF
- **License:** Proprietary (owned by project)
- **Usage:** Backgrounds, buttons, accents, glass tints

---

## Notes

- All dependencies use **MIT License** (permissive open-source)
- No paid or premium libraries were added
- Total bundle size impact: ~55-70KB gzipped (within acceptable limits)
- No heavy native dependencies requiring special configuration
- All libraries are Expo-compatible

---

**Last Updated:** October 24, 2025
**Maintained By:** Vibe App Development Team
