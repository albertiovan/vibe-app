# Liquid Glass Button - Enhanced Features 🌊✨

## New Features Added!

### 1. **Icons Support** 🎨
Add emoji or text icons to your buttons

```tsx
// Left icon
<LiquidGlassButton icon="🎯" iconPosition="left" onPress={handlePress}>
  Find Activities
</LiquidGlassButton>

// Right icon
<LiquidGlassButton icon="→" iconPosition="right" onPress={handlePress}>
  Continue
</LiquidGlassButton>

// Icon only
<LiquidGlassButton icon="⚙️" onPress={handleSettings} />
```

### 2. **Loading State** ⏳
Show loading spinner while processing

```tsx
<LiquidGlassButton 
  loading={isSubmitting}
  onPress={handleSubmit}
>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</LiquidGlassButton>
```

### 3. **Press Animations** 🎭
Smooth scale and opacity animations on press

- **Press down**: Scale to 95%, opacity to 80%
- **Release**: Spring back to 100%
- **Smooth transitions**: Uses Reanimated for 60fps

### 4. **Full Width Option** 📏
Make button span full container width

```tsx
<LiquidGlassButton fullWidth onPress={handlePress}>
  Full Width Button
</LiquidGlassButton>
```

---

## Complete API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPress` | `() => void` | Required | Press handler |
| `children` | `ReactNode` | Required | Button text/content |
| `variant` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | Visual emphasis |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `disabled` | `boolean` | `false` | Disable button |
| `loading` | `boolean` | `false` | Show loading spinner |
| `icon` | `string` | `undefined` | Emoji or text icon |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon placement |
| `fullWidth` | `boolean` | `false` | Span full width |
| `style` | `ViewStyle` | `undefined` | Custom styles |

---

## Usage Examples

### Basic Examples

```tsx
// Simple button
<LiquidGlassButton onPress={() => console.log('Pressed')}>
  Click Me
</LiquidGlassButton>

// With icon
<LiquidGlassButton icon="✨" onPress={handlePress}>
  Magic Button
</LiquidGlassButton>

// Loading state
<LiquidGlassButton loading={true} onPress={handlePress}>
  Loading...
</LiquidGlassButton>

// Disabled
<LiquidGlassButton disabled onPress={handlePress}>
  Disabled
</LiquidGlassButton>

// Full width
<LiquidGlassButton fullWidth onPress={handlePress}>
  Full Width
</LiquidGlassButton>
```

### Advanced Examples

```tsx
// Submit button with loading
const [isSubmitting, setIsSubmitting] = useState(false);

<LiquidGlassButton
  variant="primary"
  size="large"
  fullWidth
  loading={isSubmitting}
  icon={isSubmitting ? undefined : "→"}
  iconPosition="right"
  onPress={async () => {
    setIsSubmitting(true);
    await submitForm();
    setIsSubmitting(false);
  }}
>
  {isSubmitting ? 'Submitting...' : 'Submit Form'}
</LiquidGlassButton>

// Navigation button
<LiquidGlassButton
  variant="secondary"
  icon="🏠"
  onPress={() => navigation.navigate('Home')}
>
  Go Home
</LiquidGlassButton>

// Settings button (icon only)
<LiquidGlassButton
  variant="tertiary"
  size="small"
  icon="⚙️"
  onPress={() => setShowSettings(true)}
/>

// Action button with haptics
<LiquidGlassButton
  variant="primary"
  icon="⚡"
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleAction();
  }}
>
  Challenge Me
</LiquidGlassButton>
```

---

## Real-World Integration Examples

### 1. **Home Screen - Filters & Vibe Profiles**

```tsx
<View style={styles.actionsRow}>
  <LiquidGlassButton 
    variant="secondary" 
    size="small"
    icon="🎚️"
    onPress={() => setShowFilters(!showFilters)}
  >
    Filters
  </LiquidGlassButton>
  
  <LiquidGlassButton 
    variant="secondary" 
    size="small"
    icon="✨"
    onPress={() => setShowVibeProfiles(!showVibeProfiles)}
  >
    Vibe Profiles
  </LiquidGlassButton>
</View>
```

### 2. **Vibe Submit Button**

```tsx
const [isSearching, setIsSearching] = useState(false);

<LiquidGlassButton
  variant="primary"
  size="large"
  fullWidth
  loading={isSearching}
  icon={isSearching ? undefined : "🔍"}
  iconPosition="right"
  disabled={!vibeInput.trim()}
  onPress={async () => {
    setIsSearching(true);
    await handleVibeSubmit();
    setIsSearching(false);
  }}
>
  {isSearching ? 'Finding activities...' : 'Find Activities'}
</LiquidGlassButton>
```

### 3. **Activity Card Actions**

```tsx
<View style={styles.cardActions}>
  <LiquidGlassButton
    variant="tertiary"
    size="small"
    icon="❤️"
    onPress={handleSave}
  />
  
  <LiquidGlassButton
    variant="tertiary"
    size="small"
    icon="📤"
    onPress={handleShare}
  />
  
  <LiquidGlassButton
    variant="primary"
    size="medium"
    icon="→"
    iconPosition="right"
    onPress={handleExplore}
  >
    Explore
  </LiquidGlassButton>
</View>
```

### 4. **Bottom Navigation Actions**

```tsx
<LiquidGlassButton
  variant="secondary"
  icon="🏠"
  onPress={() => setActiveTab('home')}
>
  Home
</LiquidGlassButton>

<LiquidGlassButton
  variant="secondary"
  icon="👤"
  onPress={() => setActiveTab('profile')}
>
  Profile
</LiquidGlassButton>

<LiquidGlassButton
  variant="secondary"
  icon="⚡"
  onPress={() => setActiveTab('challenge')}
>
  Challenge
</LiquidGlassButton>
```

---

## Animation Details

### Press Animation
```typescript
// On press down
scale: 1 → 0.95 (spring animation)
opacity: 1 → 0.8 (100ms timing)

// On release
scale: 0.95 → 1 (spring animation)
opacity: 0.8 → 1 (100ms timing)
```

### Spring Configuration
```typescript
{
  damping: 15,    // Smooth bounce
  stiffness: 300  // Quick response
}
```

---

## Accessibility Features

✅ **Minimum touch target**: 44x44 (medium/large sizes)
✅ **Visual feedback**: Scale and opacity on press
✅ **Loading state**: Spinner replaces icon
✅ **Disabled state**: Reduced opacity (50%)
✅ **Theme support**: Adapts to light/dark mode

---

## Performance

### Optimizations
- Reanimated runs on UI thread (60fps)
- BlurView uses native blur (GPU)
- Minimal re-renders
- Efficient state management

### Bundle Impact
- Component: ~3KB
- Uses existing dependencies
- No new packages needed

---

## Best Practices

### Icon Selection
- **Use emojis** for quick implementation
- **Keep it simple** - one icon per button
- **Match meaning** - icon should relate to action
- **Consider size** - emojis scale with text

### Loading States
- **Show feedback** - always indicate processing
- **Disable during load** - prevent double-taps
- **Update text** - "Submitting..." vs "Submit"
- **Hide icon** - spinner replaces icon when loading

### Variants & Sizes
- **Primary + Large** - Main CTAs
- **Secondary + Medium** - Common actions
- **Tertiary + Small** - Subtle actions
- **Icon only** - Compact UIs

---

## Common Patterns

### Form Submit Button
```tsx
<LiquidGlassButton
  variant="primary"
  size="large"
  fullWidth
  loading={isSubmitting}
  disabled={!isValid}
  icon="✓"
  iconPosition="right"
  onPress={handleSubmit}
>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</LiquidGlassButton>
```

### Navigation Button
```tsx
<LiquidGlassButton
  variant="secondary"
  icon="←"
  onPress={() => navigation.goBack()}
>
  Back
</LiquidGlassButton>
```

### Action Group
```tsx
<View style={{ flexDirection: 'row', gap: 12 }}>
  <LiquidGlassButton variant="tertiary" icon="❌" onPress={handleCancel}>
    Cancel
  </LiquidGlassButton>
  <LiquidGlassButton variant="primary" icon="✓" onPress={handleConfirm}>
    Confirm
  </LiquidGlassButton>
</View>
```

---

## Migration from Old Buttons

### Before
```tsx
<TouchableOpacity onPress={handlePress} style={styles.button}>
  <Text style={styles.buttonText}>Click Me</Text>
</TouchableOpacity>
```

### After
```tsx
<LiquidGlassButton variant="primary" onPress={handlePress}>
  Click Me
</LiquidGlassButton>
```

### With Loading
```tsx
// Before
<TouchableOpacity onPress={handlePress} disabled={isLoading}>
  {isLoading ? (
    <ActivityIndicator />
  ) : (
    <Text>Submit</Text>
  )}
</TouchableOpacity>

// After
<LiquidGlassButton loading={isLoading} onPress={handlePress}>
  Submit
</LiquidGlassButton>
```

---

## Status

✅ **All features implemented**
✅ **Fully tested**
✅ **Production-ready**
✅ **Theme-aware**
✅ **Performant**

**Ready to use throughout your app!** 🚀✨
