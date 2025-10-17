# Google Places Photos & Deep Links Integration

## Overview

This integration adds Google Place images and "Open in Google Maps" functionality to the vibe app, providing rich visual content and seamless navigation to exact locations.

## Architecture

### Photo Proxy System
- **Endpoint**: `GET /api/places/photo?ref=<photo_reference>&maxwidth=<int>`
- **Purpose**: Server-side proxy to avoid CORS issues and hide API keys
- **Caching**: In-memory cache with 1-day TTL for photo URLs
- **Performance**: Concurrency-limited to 4 requests at once

### Google Maps Deep Links
- **Preferred**: `https://www.google.com/maps/search/?api=1&query_place_id=<PLACE_ID>`
- **Fallback**: `https://www.google.com/maps/search/?api=1&query=<place_name>`
- **Compatibility**: Works on both desktop and mobile devices

## API Integration

### Required Place Details Fields
```javascript
fields: [
  'name', 'place_id', 'geometry', 'types', 'photos',
  'price_level', 'rating', 'user_ratings_total',
  'formatted_address', 'opening_hours', 'website',
  'editorial_summary'
]
```

### Example Place Details Response (photos)
```json
{
  "photos": [
    {
      "photo_reference": "AeJbb3H7...",
      "width": 1024,
      "height": 768,
      "html_attributions": ["<a href=\"https://maps.google.com/maps/contrib/...\">Google User</a>"]
    }
  ]
}
```

## Image URL Construction

### Server-Side Proxy URLs
```javascript
const imageUrl = `/api/places/photo?ref=${encodeURIComponent(photo.photo_reference)}&maxwidth=${PHOTOS_MAX_WIDTH}`;
```

### Configuration
- **PHOTOS_MAX_WIDTH**: 800px (configurable via environment variable)
- **Aspect Ratio**: 16:9 for consistent card layout
- **Fallback**: Placeholder image for missing photos

## Mobile UI Implementation

### Card Component Structure
```jsx
<View style={styles.imageContainer}>
  <Image
    source={{
      uri: place.imageUrl 
        ? `http://10.103.30.198:3000${place.imageUrl}`
        : 'https://via.placeholder.com/400x225/E5E7EB/9CA3AF?text=No+Photo'
    }}
    style={styles.placeImage}
    resizeMode="cover"
  />
  
  {/* Photo Attribution Overlay */}
  {place.photoAttribution && (
    <View style={styles.attributionOverlay}>
      <Text style={styles.attributionText}>📷 Google</Text>
    </View>
  )}
  
  {/* Rating Badge Overlay */}
  {place.rating && (
    <View style={styles.ratingBadge}>
      <Text style={styles.ratingBadgeText}>★ {place.rating}</Text>
    </View>
  )}
</View>

{/* Google Maps Button */}
<TouchableOpacity
  style={styles.mapsButton}
  onPress={() => Linking.openURL(place.mapsUrl)}
>
  <Text style={styles.mapsButtonText}>🗺️ Open in Google Maps</Text>
</TouchableOpacity>
```

### Styling Guidelines
- **Image Container**: 16:9 aspect ratio with rounded corners
- **Attribution**: Semi-transparent overlay at bottom-left
- **Rating Badge**: Semi-transparent overlay at top-right
- **Maps Button**: Full-width blue button with icon

## Caching Strategy

### Photo URL Caching
```javascript
const photoCache = new Map<string, PhotoCacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 day

interface PhotoCacheEntry {
  url: string;
  timestamp: number;
}
```

### Cache Management
- **TTL**: 1 day for photo URLs
- **Key Format**: `${photo_reference}_${maxwidth}`
- **Cleanup**: Automatic expiry check on access
- **Stats Endpoint**: `/api/places/photo/stats` for monitoring

## Attribution Requirements

### Google Maps Platform Terms
- Display "Google" attribution for all photos
- Include `html_attributions` when available
- Follow Maps Platform service terms and attribution guidelines

### Implementation
```javascript
// Extract attribution from API response
photoAttribution = photo.html_attributions?.[0] || undefined;

// Display in UI overlay
<Text style={styles.attributionText}>📷 Google</Text>
```

## Performance Optimizations

### Lazy Loading
- Images load on-demand as cards scroll into view
- Placeholder prevents layout shift during loading
- Error handling for failed image loads

### Concurrency Control
```javascript
const concurrencyLimit = 4;
for (let i = 0; i < places.length; i += concurrencyLimit) {
  const batch = places.slice(i, i + concurrencyLimit);
  // Process batch concurrently
}
```

### Error Handling
- Graceful fallback to placeholder images
- Maps URL fallback for unverified places
- Console logging for debugging failed requests

## API Response Format

### Enhanced Place Object
```json
{
  "id": "place_123",
  "name": "Romanian Athenaeum",
  "imageUrl": "/api/places/photo?ref=AeJbb3H7...&maxwidth=800",
  "photoAttribution": "<a href=\"...\">Google User</a>",
  "mapsUrl": "https://www.google.com/maps/search/?api=1&query_place_id=ChIJ...",
  "highlights": ["📸 Photo available", "Verified location"],
  "rating": 4.5,
  "verified": true
}
```

## Testing & Debugging

### Photo Proxy Stats
```bash
curl http://localhost:3000/api/places/photo/stats
```

### Cache Management
```bash
# Clear photo cache
curl -X POST http://localhost:3000/api/places/photo/clear-cache
```

### Mobile Testing
- Test image loading on different network conditions
- Verify Google Maps opens correctly on iOS/Android
- Check attribution display and accessibility

## Security Considerations

- API keys hidden behind server proxy
- CORS properly configured for mobile access
- Photo URLs cached to reduce API quota usage
- Input validation on photo reference parameters

## Future Enhancements

- Multiple photo carousel support
- Image optimization and WebP support
- Offline caching for frequently accessed photos
- A/B testing for different image aspect ratios
