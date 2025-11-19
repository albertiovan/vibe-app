# Location Text Overflow Fix

## Problem
Location names like "Cheia (Near Turda)" were overflowing their designated container boxes in the Challenge Me screen, causing text to be cut off.

## Solution Applied

### Responsive Text Sizing
Added automatic font size adjustment for location text:
```tsx
<Text 
  style={styles.metaValue} 
  numberOfLines={2}
  adjustsFontSizeToFit
  minimumFontScale={0.7}
>
  {currentChallenge.city}
</Text>
```

**Key Properties:**
- `numberOfLines={2}` - Allows text to wrap to 2 lines
- `adjustsFontSizeToFit` - Automatically reduces font size to fit container
- `minimumFontScale={0.7}` - Won't shrink below 70% of original size (13px → 9.1px minimum)

### Container Constraints
Updated meta item styling to prevent overflow:

```typescript
metaItem: {
  alignItems: 'center',
  flex: 1,              // Equal width distribution
  maxWidth: 110,        // Maximum width constraint
},
metaValue: {
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: '600',
  marginTop: 6,
  textAlign: 'center',  // Center align text
  width: '100%',        // Fill container width
},
```

### Layout Improvements
- Added `gap: 8` to `metaRow` for consistent spacing
- Each meta item gets equal width with `flex: 1`
- Maximum width of 110px prevents items from getting too wide
- Text wraps to 2 lines before shrinking font size

## Behavior

### Short Location Names
- Display at full size (13px)
- Single line
- Example: "Cluj-Napoca"

### Medium Location Names  
- Display at full size (13px)
- Wrap to 2 lines if needed
- Example: "Cheia (Near Turda)"

### Very Long Location Names
- Wrap to 2 lines
- Font size automatically reduces (down to 9.1px minimum)
- All text remains visible and readable
- Example: "Very Long Location Name Here"

## Files Modified
- `/screens/MinimalChallengeMeScreen.tsx`
  - Updated LOCATION text component with responsive props
  - Added container constraints to metaItem
  - Added text alignment and width to metaValue
  - Added gap to metaRow

## Testing Scenarios
- [x] Short names (1 word) - displays normally
- [x] Medium names (2-3 words) - wraps to 2 lines
- [x] Long names with parentheses - wraps and shrinks if needed
- [x] Very long names - shrinks to minimum scale
- [x] All three meta items (Category, Energy, Location) align properly
- [x] Text remains centered and readable

## Status
✅ **Complete** - Location text now automatically adjusts to fit its container with variable formatting.
