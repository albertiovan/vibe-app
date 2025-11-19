# Activity Detail Screen - Monochrome Redesign

## ✅ Complete Redesign

Redesigned the activity detail screen to match the minimal monochrome aesthetic with a large, attention-grabbing hero image while keeping all essential functionality.

---

## 🎨 Design Changes

### Before (ActivityDetailScreenShell)
- Blue gradient background
- Glass morphism cards
- Photo carousel
- Colorful buttons
- Complex styling

### After (MinimalActivityDetailScreen)
- **Pure black background** (#000000)
- **Large hero image** (50% of screen height)
- **Activity name overlaid on image**
- **Monochrome cards** (white borders)
- **Clean, minimal design**
- **Kept:** Nearest venue, Learn More, GO NOW buttons

---

## 📱 Visual Layout

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│      [LARGE HERO IMAGE]         │  ← 50% screen height
│                                 │
│  ←  [Back Button]               │
│                                 │
│  Padel Court Booking            │  ← Name on image
│  (Romexpo Area)                 │
│                                 │
├─────────────────────────────────┤
│  ┌─────────────────────────────┐│
│  │ NEAREST                     ││  ← Venue card
│  │ Padel Arena Romexpo         ││
│  │ 📍 10.3km                   ││
│  └─────────────────────────────┘│
│                                 │
│  Description text here...       │
│  Book doubles at modern...      │
│                                 │
│  ┌─────────────────────────────┐│
│  │ ⏱ Duration  ⚡ Energy       ││  ← Meta info
│  │   1-2h        Medium        ││
│  │              📌 Location    ││
│  │                Bucharest    ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │      Learn More             ││  ← Buttons
│  └─────────────────────────────┘│
│  ┌─────────────────────────────┐│
│  │      GO NOW                 ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

---

## 🎯 Hero Image Design

### Large & Attention-Grabbing
```typescript
heroContainer: {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT * 0.5,  // 50% of screen!
}

heroImage: {
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
}
```

### Overlay for Readability
```typescript
heroOverlay: {
  backgroundColor: 'rgba(0, 0, 0, 0.3)',  // Subtle dark overlay
}
```

### Activity Name on Image
```typescript
heroTextContainer: {
  position: 'absolute',
  bottom: 24,
  left: 20,
  right: 20,
}

activityName: {
  fontSize: 32,
  fontWeight: '700',
  color: '#FFFFFF',
  textShadowColor: 'rgba(0, 0, 0, 0.8)',  // Shadow for readability
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 8,
}
```

### Back Button
```typescript
backButton: {
  position: 'absolute',
  top: 16,
  left: 20,
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.3)',
}
```

---

## 🎨 Nearest Venue Card

### Kept & Enhanced
```typescript
venueCard: {
  padding: 16,
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
}

venueLabel: {
  fontSize: 11,
  fontWeight: '600',
  color: 'rgba(255, 255, 255, 0.5)',
  textTransform: 'uppercase',  // "NEAREST"
  letterSpacing: 0.5,
}

venueName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#FFFFFF',
}

venueDistance: {
  fontSize: 14,
  color: 'rgba(255, 255, 255, 0.7)',
}
```

**Example:**
```
┌─────────────────────────────────┐
│ NEAREST                         │
│ Padel Arena Romexpo             │
│ 📍 10.3km                       │
└─────────────────────────────────┘
```

---

## 📊 Meta Information Card

### Three Columns
```typescript
metaSection: {
  padding: 20,
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
}

metaRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
}

metaItem: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
}
```

**Layout:**
```
┌─────────────────────────────────┐
│ ⏱ Duration │ ⚡ Energy │ 📌 Location │
│   1-2h     │  Medium  │  Bucharest │
└─────────────────────────────────┘
```

---

## 🎯 Action Buttons

### Learn More (Secondary)
```typescript
learnMoreButton: {
  paddingVertical: 16,
  borderRadius: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.3)',
}

learnMoreText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#FFFFFF',
}
```

### GO NOW (Primary)
```typescript
goNowButton: {
  paddingVertical: 16,
  borderRadius: 8,
  backgroundColor: '#FFFFFF',  // White background
}

goNowText: {
  fontSize: 16,
  fontWeight: '700',
  color: '#000000',  // Black text
  letterSpacing: 0.5,
}
```

---

## 🎨 Color Palette

```
Background:         #000000 (pure black)
Hero overlay:       rgba(0, 0, 0, 0.3)
Card BG:            rgba(255, 255, 255, 0.05)
Card Border:        rgba(255, 255, 255, 0.2)
Text (primary):     #FFFFFF (white)
Text (secondary):   rgba(255, 255, 255, 0.8)
Text (muted):       rgba(255, 255, 255, 0.7)
Text (subtle):      rgba(255, 255, 255, 0.5)
Back button BG:     rgba(0, 0, 0, 0.5)
Back button border: rgba(255, 255, 255, 0.3)
Learn More BG:      rgba(255, 255, 255, 0.1)
Learn More border:  rgba(255, 255, 255, 0.3)
GO NOW BG:          #FFFFFF (white)
GO NOW text:        #000000 (black)
```

---

## ✨ Features Maintained

### Nearest Venue Selection ✓
- **Haversine formula** for distance calculation
- **Automatic selection** of closest venue
- **Distance display** in km or meters
- **Logs** nearest venue selection

### Learn More Button ✓
- Opens venue website
- Checks for `website`, `websiteUrl`, or `url`
- Alert if no website available

### GO NOW Button ✓
- Opens Google Maps
- Uses `mapsUrl` if available
- Falls back to coordinates
- Alert if no location available

---

## 📏 Dimensions

### Hero Image
```
Width: 100% of screen
Height: 50% of screen (SCREEN_HEIGHT * 0.5)
Overlay: 30% black opacity
```

### Back Button
```
Size: 44x44px (touch target)
Border radius: 22px (circular)
Position: Top-left, 16px from top, 20px from left
```

### Activity Name
```
Font size: 32px
Font weight: 700 (bold)
Line height: 38px
Position: Bottom of hero, 24px from bottom
Text shadow: For readability on image
```

### Cards
```
Margin: 20px horizontal
Padding: 16-20px
Border radius: 12px
Border width: 1px
Gap between cards: 20-24px
```

### Buttons
```
Padding: 16px vertical
Border radius: 8px
Gap: 12px between buttons
Font size: 16px
```

---

## 🎯 Visual Hierarchy

### Priority Levels
1. **Hero Image** - Largest, most prominent (50% screen)
2. **Activity Name** - Large text on image
3. **GO NOW Button** - White background (most prominent)
4. **Nearest Venue** - Important info, highlighted card
5. **Description** - Readable, clear
6. **Meta Info** - Organized, structured
7. **Learn More Button** - Secondary action

---

## 🔄 Nearest Venue Logic

### Three Cases

**Case 1: No Venues**
```typescript
// Use activity location
setSelectedVenue({
  id: activity.id,
  name: activity.name,
  location: activityLocation,
  distance: activity.distance || 0,
});
```

**Case 2: No User Location**
```typescript
// Use first venue
setSelectedVenue(venues[0]);
```

**Case 3: Calculate Nearest**
```typescript
// Haversine formula
const distance = calculateDistance(
  userLocation.latitude,
  userLocation.longitude,
  venue.location.lat,
  venue.location.lng
);

// Sort by distance, select closest
venuesWithDistances.sort((a, b) => a.distance - b.distance);
setSelectedVenue(venuesWithDistances[0]);
```

---

## 📱 Responsive Behavior

### Hero Image
- Always 50% of screen height
- Scales with device
- Maintains aspect ratio

### Content
- Scrollable below hero
- Padding: 20px horizontal
- Safe area insets respected

### Buttons
- Full width (minus margins)
- Stacked vertically
- 12px gap between

---

## 🎨 Image Presentation

### Attention-Grabbing
- **Large size** - 50% of screen
- **Full width** - Edge to edge
- **High quality** - Cover resize mode
- **Subtle overlay** - Doesn't obscure image
- **Text on image** - Creates impact

### Minimalist Approach
- **No carousel** - Single hero image
- **No borders** - Clean edges
- **No effects** - Pure image
- **Simple overlay** - Just for readability

---

## ✅ Benefits

### Visual Impact
- **Large hero image** - Grabs attention immediately
- **Beautiful presentation** - Image is the star
- **Clean design** - No distractions
- **High contrast** - Easy to read

### User Experience
- **Clear hierarchy** - Know what to focus on
- **Easy actions** - Two clear buttons
- **Quick info** - Nearest venue prominent
- **Smooth scrolling** - Natural interaction

### Technical
- **Simpler code** - No carousel complexity
- **Better performance** - Single image load
- **Easier maintenance** - Clean structure
- **Consistent** - Matches app aesthetic

---

## 📊 Comparison

| Feature | Old (Glass) | New (Minimal) |
|---------|-------------|---------------|
| **Background** | Blue gradient | Pure black |
| **Hero** | Carousel | Single large image |
| **Image size** | Small cards | 50% screen |
| **Name** | Below image | On image |
| **Cards** | Glass blur | White borders |
| **Buttons** | Colorful | Monochrome |
| **Complexity** | High | Low |
| **Focus** | Distributed | Image-first |

---

## 🔧 Implementation

### Files
- **Created:** `MinimalActivityDetailScreen.tsx`
- **Modified:** `App.tsx` (navigation)
- **Preserved:** Original `ActivityDetailScreenShell.tsx`

### Key Features
```typescript
// Large hero image (50% screen)
<View style={styles.heroContainer}>
  <Image source={{ uri: activity.heroImage }} />
  <View style={styles.heroOverlay} />
  <Text style={styles.activityName}>{activity.name}</Text>
</View>

// Nearest venue card
<View style={styles.venueCard}>
  <Text>NEAREST</Text>
  <Text>{selectedVenue.name}</Text>
  <Text>📍 {formatDistance(selectedVenue.distance)}</Text>
</View>

// Action buttons
<TouchableOpacity onPress={handleLearnMore}>
  <Text>Learn More</Text>
</TouchableOpacity>
<TouchableOpacity onPress={handleGoNow}>
  <Text>GO NOW</Text>
</TouchableOpacity>
```

---

## ✅ Testing Checklist

- [x] Hero image displays correctly
- [x] Activity name readable on image
- [x] Back button works
- [x] Nearest venue calculates correctly
- [x] Distance formats properly
- [x] Description scrolls
- [x] Meta info displays
- [x] Learn More opens website
- [x] GO NOW opens maps
- [x] Monochrome styling applied
- [x] Safe area respected

---

**Status:** ✅ Activity detail screen redesigned  
**Date:** 2025-11-14  
**Style:** Minimal monochrome with large hero image  
**Focus:** Image-first, attention-grabbing design  
**Functionality:** All features maintained (Nearest, Learn More, GO NOW)  
**Impact:** Beautiful, clean, and functional
