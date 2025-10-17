# Google Places API Field Masks

## Overview

Field masking is a critical optimization for Google Places API usage. It ensures you only request necessary data, reducing processing time and billing charges.

## Why Field Masks Matter

**Without Field Masks:**
- API returns ALL available fields
- Higher billing charges (charged per field returned)
- Unnecessary network overhead
- Slower response times

**With Field Masks:**
- Only requested fields returned
- Optimized billing (pay only for what you use)
- Faster responses
- Reduced bandwidth usage

## Implementation

### Nearby Search Field Mask
```javascript
const params = {
  location: { lat: 44.4268, lng: 26.1025 },
  radius: 20000,
  type: 'museum',
  key: apiKey,
  // Field mask - only request essential fields
  fields: [
    'place_id',      // Required for Place Details calls
    'name',          // Display name
    'geometry',      // Location coordinates
    'types',         // Place categories
    'rating',        // User rating
    'user_ratings_total', // Number of reviews
    'price_level',   // Price category (0-4)
    'vicinity',      // Address/area
    'opening_hours', // Operating hours
    'photos'         // Photo references
  ]
};
```

### Place Details Field Mask
```javascript
const params = {
  place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  key: apiKey,
  // Field mask - request specific details
  fields: [
    'place_id',
    'name',
    'geometry',
    'types',
    'photos',            // For image display
    'price_level',
    'rating',
    'user_ratings_total',
    'formatted_address', // Full address
    'opening_hours',     // Detailed hours
    'website',          // Official website
    'editorial_summary' // Google's description
  ]
};
```

## Field Categories & Billing

### Basic Fields (No additional charge)
- `place_id`
- `name`
- `geometry`
- `types`
- `vicinity`

### Contact Fields (Additional charge)
- `formatted_phone_number`
- `international_phone_number`
- `website`

### Atmosphere Fields (Additional charge)
- `rating`
- `user_ratings_total`
- `reviews`
- `price_level`

### Photo Fields (Additional charge)
- `photos`

### Hours Fields (Additional charge)
- `opening_hours`
- `current_opening_hours`

## Best Practices

### 1. Minimal Field Selection
```javascript
// ❌ Bad: Requesting unnecessary fields
fields: [
  'place_id', 'name', 'geometry', 'types', 'rating',
  'reviews', 'formatted_phone_number', 'website',
  'opening_hours', 'photos', 'editorial_summary',
  'price_level', 'user_ratings_total', 'vicinity'
]

// ✅ Good: Only essential fields for your use case
fields: [
  'place_id', 'name', 'geometry', 'rating', 'photos'
]
```

### 2. Context-Aware Field Selection

**For List View (Nearby Search):**
```javascript
fields: [
  'place_id',    // For details lookup
  'name',        // Display name
  'geometry',    // Map positioning
  'rating',      // Quick assessment
  'vicinity',    // Location context
  'photos'       // Visual appeal
]
```

**For Detail View (Place Details):**
```javascript
fields: [
  'place_id',
  'name',
  'formatted_address',  // Full address
  'photos',            // Multiple photos
  'opening_hours',     // Detailed hours
  'website',          // External link
  'rating',
  'user_ratings_total',
  'editorial_summary'  // Rich description
]
```

### 3. Progressive Enhancement
```javascript
// Step 1: Basic search with minimal fields
const basicSearch = {
  fields: ['place_id', 'name', 'geometry', 'rating']
};

// Step 2: Enrich selected places with more details
const detailsEnrichment = {
  fields: ['photos', 'opening_hours', 'website', 'formatted_address']
};
```

## Our Implementation

### Nearby Orchestrator
```javascript
// Optimized field mask for nearby search
fields: [
  'place_id',          // Essential for deduplication
  'name',              // Display name
  'geometry',          // Location for distance calc
  'types',             // Category classification
  'rating',            // Quality indicator
  'user_ratings_total', // Popularity indicator
  'price_level',       // Budget filtering
  'vicinity',          // Location context
  'opening_hours',     // Availability
  'photos'             // Visual content
]
```

### Place Details Enrichment
```javascript
// Comprehensive field mask for enrichment
fields: [
  'place_id',
  'name',
  'geometry',
  'types',
  'photos',            // For image proxy
  'price_level',
  'rating',
  'user_ratings_total',
  'formatted_address', // Full address display
  'opening_hours',     // Detailed schedule
  'website',          // External links
  'editorial_summary' // Rich descriptions
]
```

## Cost Optimization

### Field Cost Categories
1. **Basic**: Free with API call
2. **Contact**: ~$0.003 per field per request
3. **Atmosphere**: ~$0.005 per field per request
4. **Photos**: ~$0.007 per field per request

### Optimization Strategies

**1. Lazy Loading**
```javascript
// Initial search: basic fields only
const basicResults = await nearbySearch({
  fields: ['place_id', 'name', 'geometry', 'rating']
});

// Detailed enrichment: only for selected places
const enrichedPlace = await placeDetails({
  place_id: selectedPlaceId,
  fields: ['photos', 'opening_hours', 'website']
});
```

**2. Caching**
```javascript
// Cache expensive field data
const photoCache = new Map();
if (!photoCache.has(placeId)) {
  const photos = await getPlacePhotos(placeId);
  photoCache.set(placeId, photos);
}
```

**3. Conditional Fields**
```javascript
// Adjust fields based on user preferences
const fields = ['place_id', 'name', 'geometry'];
if (showRatings) fields.push('rating', 'user_ratings_total');
if (showPhotos) fields.push('photos');
if (showHours) fields.push('opening_hours');
```

## Monitoring & Analytics

### Track Field Usage
```javascript
const fieldUsageStats = {
  'photos': { requests: 1250, cost: 8.75 },
  'opening_hours': { requests: 890, cost: 4.45 },
  'rating': { requests: 2100, cost: 10.50 }
};
```

### Cost Analysis
```javascript
// Monitor API costs by field category
const costBreakdown = {
  basic: 0,      // Free fields
  contact: 15.30, // Phone, website
  atmosphere: 25.75, // Rating, reviews
  photos: 45.20   // Photo references
};
```

## Error Handling

### Invalid Field Names
```javascript
try {
  const result = await placeDetails({
    place_id: placeId,
    fields: ['invalid_field', 'name'] // Will cause error
  });
} catch (error) {
  console.error('Invalid field in mask:', error.message);
  // Fallback to basic fields
}
```

### Field Availability
```javascript
// Not all places have all fields
const safeFields = [
  'place_id',    // Always available
  'name',        // Always available
  'geometry',    // Always available
  'photos',      // May be empty array
  'rating'       // May be undefined
];
```

## Testing Field Masks

### Validate Field Usage
```bash
# Test with minimal fields
curl "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=44.4268,26.1025&radius=1000&type=restaurant&fields=place_id,name,rating&key=YOUR_KEY"

# Test with comprehensive fields
curl "https://maps.googleapis.com/maps/api/place/details/json?place_id=PLACE_ID&fields=place_id,name,photos,opening_hours&key=YOUR_KEY"
```

### Performance Comparison
```javascript
// Measure response times with different field masks
const startTime = Date.now();
const result = await nearbySearch({ fields: minimalFields });
const responseTime = Date.now() - startTime;

console.log(`Response time with ${fields.length} fields: ${responseTime}ms`);
```

Field masking is essential for cost-effective and performant Google Places API usage. Always specify exactly the fields you need!
