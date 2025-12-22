# Theme System Guide

## Overview
The app uses a comprehensive theme system that automatically adapts colors based on light/dark mode. **All new features MUST use this system** to ensure proper theme support.

## Theme Architecture

### Two Theme Systems (Migration in Progress)

1. **NEW SYSTEM** (`/ui/theme/`) - **USE THIS FOR ALL NEW CODE**
   - Full light/dark theme support
   - Semantic color tokens
   - Theme-aware text colors
   - Glass surface support

2. **OLD SYSTEM** (`/src/design-system/`) - **DEPRECATED**
   - Dark theme only
   - Being phased out
   - Do not use for new features

## Using the Theme System

### 1. Import the Theme Hook

```typescript
import { useTheme } from '../src/contexts/ThemeContext';
```

### 2. Get Theme Colors in Your Component

```typescript
const { colors, resolvedTheme } = useTheme();
```

### 3. Use Semantic Text Colors

#### For Text on Solid Backgrounds
```typescript
<Text style={{ color: colors.text.primary }}>Main heading</Text>
<Text style={{ color: colors.text.secondary }}>Subheading</Text>
<Text style={{ color: colors.text.tertiary }}>Caption text</Text>
```

#### For Text on Glass/Translucent Surfaces
```typescript
<GlassCard>
  <Text style={{ color: colors.text.onGlass.primary }}>Title on glass</Text>
  <Text style={{ color: colors.text.onGlass.secondary }}>Subtitle on glass</Text>
  <Text style={{ color: colors.text.onGlass.tertiary }}>Caption on glass</Text>
</GlassCard>
```

## Color Token Reference

### Background Colors
```typescript
colors.background  // Main app background (adapts to theme)
colors.surface     // Card/surface background (adapts to theme)
```

### Text Colors (Theme-Aware)
```typescript
// On solid backgrounds
colors.text.primary    // Dark: #FFFFFF, Light: #0B1220
colors.text.secondary  // Dark: rgba(255,255,255,0.7), Light: #1E3A5F
colors.text.tertiary   // Dark: rgba(255,255,255,0.5), Light: #4B6B94

// On glass/translucent surfaces (higher contrast)
colors.text.onGlass.primary    // Dark: #FFFFFF, Light: #0B1220
colors.text.onGlass.secondary  // Dark: rgba(255,255,255,0.8), Light: #1E3A5F
colors.text.onGlass.tertiary   // Dark: rgba(255,255,255,0.6), Light: #4B6B94
```

### Border Colors
```typescript
colors.border  // Adapts to theme
```

## Rules for New Features

### ✅ DO
- Always use `useTheme()` hook for colors
- Use semantic color tokens (`colors.text.primary` not hardcoded `#FFFFFF`)
- Use `colors.text.onGlass.*` for text on translucent surfaces
- Test your feature in both light and dark themes
- Use `resolvedTheme` if you need conditional logic based on theme

### ❌ DON'T
- Hardcode color values like `#FFFFFF` or `rgba(255,255,255,0.7)`
- Import from `/src/design-system/colors.ts` (old system)
- Assume dark theme only
- Use `colors.text.primary` on glass surfaces (use `colors.text.onGlass.primary`)

## Migration Checklist for Existing Components

When updating an existing component to support themes:

1. [ ] Replace old color imports with `useTheme()` hook
2. [ ] Replace all hardcoded colors with semantic tokens
3. [ ] Identify glass/translucent surfaces
4. [ ] Use `colors.text.onGlass.*` for text on glass surfaces
5. [ ] Test in both light and dark themes
6. [ ] Remove any theme-specific conditional logic (tokens handle this)

## Example: Migrating a Component

### Before (Hardcoded Dark Theme)
```typescript
import { colors } from '../src/design-system/colors';

const MyComponent = () => (
  <GlassCard>
    <Text style={{ color: '#FFFFFF' }}>Title</Text>
    <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Subtitle</Text>
  </GlassCard>
);
```

### After (Theme-Aware)
```typescript
import { useTheme } from '../src/contexts/ThemeContext';

const MyComponent = () => {
  const { colors } = useTheme();
  
  return (
    <GlassCard>
      <Text style={{ color: colors.text.onGlass.primary }}>Title</Text>
      <Text style={{ color: colors.text.onGlass.secondary }}>Subtitle</Text>
    </GlassCard>
  );
};
```

## Testing Themes

### Switch Between Themes
The app includes a theme toggle in the UI. Test your feature by:
1. Viewing in dark theme (default)
2. Switching to light theme
3. Verifying all text is readable
4. Checking glass surfaces have proper contrast

### Common Issues
- **White text on light background**: Use `colors.text.primary` not hardcoded white
- **Low contrast on glass**: Use `colors.text.onGlass.*` variants
- **Borders invisible**: Use `colors.border` not hardcoded values

## Theme Context API

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';      // User preference
  resolvedTheme: 'light' | 'dark';         // Actual theme (resolves 'system')
  colors: ThemeColors;                      // All color tokens
  setTheme: (theme: ThemeMode) => void;    // Change theme
}
```

## Future-Proofing

This system is designed to scale. Future additions might include:
- High contrast mode
- Custom color schemes
- Per-category theming
- Accessibility modes

By using semantic tokens now, your code will automatically support these features.

## Questions?

If you're unsure which color token to use:
1. Is it on a glass/translucent surface? → Use `colors.text.onGlass.*`
2. Is it primary/secondary/tertiary text? → Use the appropriate level
3. When in doubt, use `colors.text.primary` for solid backgrounds

**Remember: Never hardcode colors. Always use theme tokens.**
