# Google Places API Integration

## Overview
This document outlines our Google Places API integration strategy, focusing on activities and attractions over food establishments.

## API Endpoints Used

### 1. Text Search
**Endpoint**: `https://maps.googleapis.com/maps/api/place/textsearch/json`

**Default Parameters**:
- `query`: "things to do in {CITY}" or keyword-based queries
- `type`: `tourist_attraction` (for primary search)
- `key`: Google Maps API key
- `fields`: Basic place information

**Use Cases**:
- Primary discovery: "things to do in {CITY}"
- Keyword-expanded searches: "museum", "art gallery", "indoor climbing", etc.

### 2. Nearby Search
**Endpoint**: `https://maps.googleapis.com/maps/api/place/nearbysearch/json`

**Default Parameters**:
- `location`: `{lat},{lng}`
- `radius`: `8000` (8km default)
- `type`: One of the activity types from allowlist
- `key`: Google Maps API key

**Use Cases**:
- Fan-out searches for each activity type in allowlist
- Location-based discovery within radius

### 3. Place Details
**Endpoint**: `https://maps.googleapis.com/maps/api/place/details/json`

**Required Fields**:
```
fields=name,place_id,geometry,photos,rating,user_ratings_total,formatted_address,opening_hours,types,website,editorial_summary
```

**Use Cases**:
- Enriching selected results with detailed information
- Getting comprehensive place data for final recommendations

## Place Types Configuration

### Activity Types Allowlist
Non-food activities prioritized in searches:
- `tourist_attraction`
- `museum`
- `art_gallery`
- `park`
- `amusement_park`
- `zoo`
- `aquarium`
- `stadium`
- `movie_theater`
- `bowling_alley`
- `spa`
- `campground`
- `church`
- `hindu_temple`
- `mosque`
- `synagogue`
- `library`
- `night_club`
- `point_of_interest`

### Food Types Blocklist
Food establishments filtered out by default (unless explicitly requested):
- `restaurant`
- `cafe`
- `bar`
- `bakery`
- `meal_takeaway`
- `meal_delivery`

## Search Strategy

### Multi-Query Orchestration
Searches are composed in this order, then merged and deduplicated:

1. **Primary Text Search**
   - Query: "things to do in {CITY}"
   - Type: `tourist_attraction`
   - Priority: Highest

2. **Nearby Fan-out Searches**
   - Location: User's coordinates
   - Radius: 8000m
   - Types: Each type from activity allowlist
   - Parallel execution with rate limiting

3. **Keyword-Expanded Text Searches**
   - Curated keyword list: "museum", "art gallery", "indoor climbing", "escape room", "thermal bath", "live music"
   - Location bias: User's city
   - Type filtering: Activity types only

### Deduplication
- Primary key: `place_id`
- Merge strategy: Preserve highest-quality data from multiple sources
- Conflict resolution: Prefer Place Details API data over search results

### Filtering
- **Default**: Exclude all food types from blocklist
- **Food Mode**: Include food types when explicitly requested
- **Quality Filter**: Minimum rating threshold (configurable)
- **Distance Filter**: Maximum distance from user location

## Concurrency & Rate Limiting

### Place Details Fetcher
- **Concurrency Cap**: 4-6 simultaneous requests
- **Rate Limiting**: 100ms delay between requests
- **Batch Size**: Process in chunks of 10-15 places
- **Error Handling**: Retry with exponential backoff

### Search Orchestrator
- **Fan-out Limit**: Maximum 5 parallel nearby searches
- **Request Spacing**: 50ms between search requests
- **Timeout**: 10 seconds per search request
- **Fallback**: Graceful degradation if some searches fail

## Feature Flags

### `features.activitiesDefault`
- **Default**: `true`
- **Effect**: Prioritizes activities over restaurants in search results
- **Fallback**: When `false`, uses original restaurant-heavy approach

## Response Models

### ActivitySummary
Normalized model with strict null handling:
```typescript
interface ActivitySummary {
  placeId: string;
  name: string;
  types: string[];
  coordinates: { lat: number; lng: number };
  rating: number | null;
  userRatingsTotal: number | null;
  address: string | null;
  photos: PhotoReference[] | null;
  openingHours: OpeningHours | null;
  website: string | null;
  editorialSummary: string | null;
  distanceMeters: number | null;
  vibeScore: number | null;
  activityCategory: ActivityCategory;
}
```

## Error Handling

### API Failures
- **Quota Exceeded**: Fallback to cached results or simplified search
- **Network Errors**: Retry with exponential backoff (max 3 attempts)
- **Invalid Responses**: Log error, continue with partial results

### Data Quality
- **Missing Required Fields**: Skip place or use defaults
- **Invalid Coordinates**: Exclude from location-based features
- **Malformed Data**: Sanitize and validate all inputs

## Performance Considerations

### Caching Strategy
- **Search Results**: Cache for 1 hour
- **Place Details**: Cache for 24 hours
- **Location Queries**: Cache for 30 minutes
- **Cache Key**: Hash of query parameters

### Optimization
- **Parallel Processing**: Execute independent searches concurrently
- **Early Termination**: Stop when sufficient high-quality results found
- **Smart Batching**: Group similar requests to minimize API calls
