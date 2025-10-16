# TripAdvisor16 Integration Documentation

## Overview
Integration with DataCrawler's TripAdvisor16 API via RapidAPI for restaurant and attraction data.

**Provider**: DataCrawler  
**API**: TripAdvisor16  
**Host**: `tripadvisor16.p.rapidapi.com`  
**Base URL**: `https://tripadvisor16.p.rapidapi.com`

## Location Resolution

### Endpoint: Location Search
**Path**: `/api/v1/restaurant/searchLocation`  
**Method**: GET  
**Purpose**: Convert human-readable city names to TripAdvisor location IDs

#### Parameters:
- `query` (string): City name (e.g., "Bucharest, Romania")
- `language` (string, optional): Language code (default: "en")
- `limit` (number, optional): Max results (default: 10)

#### Sample Request:
```bash
GET /api/v1/restaurant/searchLocation?query=Bucharest%2C%20Romania&language=en&limit=5
Headers:
  X-RapidAPI-Key: {API_KEY}
  X-RapidAPI-Host: tripadvisor16.p.rapidapi.com
```

#### Sample Response:
```json
{
  "status": true,
  "message": "Success",
  "timestamp": 1697462400,
  "data": {
    "data": [
      {
        "locationId": "294458",
        "name": "Bucharest",
        "placeType": "city",
        "latitude": "44.4268",
        "longitude": "26.1025",
        "isGeo": true,
        "thumbnail": {
          "photoSizeDynamic": {
            "maxWidth": 1024,
            "maxHeight": 1024,
            "urlTemplate": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/f7/8e/bucharest.jpg?w={width}&h={height}&s=1"
          }
        }
      }
    ]
  }
}
```

### Resolved Location ID for Bucharest
**City**: "Bucharest, Romania"  
**Location ID**: `294458`  
**Coordinates**: 44.4268, 26.1025  
**Verified**: ✅ Returns Romanian restaurants and attractions

## Restaurant Search

### Endpoint: Search Restaurants
**Path**: `/api/v1/restaurant/searchRestaurants`  
**Method**: GET  
**Purpose**: Get restaurants for a specific location

#### Parameters:
- `locationId` (string, required): TripAdvisor location ID
- `offset` (number, optional): Pagination offset (default: 0)
- `currency` (string, optional): Currency code (default: "USD")
- `language` (string, optional): Language code (default: "en")

#### Sample Request:
```bash
GET /api/v1/restaurant/searchRestaurants?locationId=294458&offset=0&currency=USD&language=en
Headers:
  X-RapidAPI-Key: {API_KEY}
  X-RapidAPI-Host: tripadvisor16.p.rapidapi.com
```

#### Sample Response Structure:
```json
{
  "status": true,
  "message": "Success",
  "timestamp": 1697462400,
  "data": {
    "data": [
      {
        "restaurantsId": "Restaurant_Review-g294458-d123456-Reviews-Restaurant_Name-Bucharest",
        "heroImgUrl": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/...",
        "squareImgUrl": "https://dynamic-media-cdn.tripadvisor.com/media/photo-s/...",
        "name": "Restaurant Name",
        "averageRating": 4.5,
        "userReviewCount": 1234,
        "currentOpenStatusCategory": "OPEN",
        "currentOpenStatusText": "Open Now",
        "priceTag": "$$",
        "hasMenu": true,
        "establishmentTypeAndCuisineTags": [
          "Romanian",
          "European",
          "Fine Dining"
        ],
        "offers": {
          "slot1": null,
          "slot2": null
        },
        "reviewSnippets": {
          "reviewSnippetsList": [
            {
              "reviewText": "Excellent traditional Romanian cuisine...",
              "reviewUrl": "/ShowUserReviews-g294458-d123456-r123456789-Restaurant_Name-Bucharest.html"
            }
          ]
        }
      }
    ]
  }
}
```

## Caching Strategy

### Location ID Cache
- **TTL**: 24 hours (86400 seconds)
- **Key Format**: `location_id_{city_normalized}`
- **Storage**: In-memory NodeCache
- **Fallback**: Re-query API if cache miss

### Restaurant Data Cache
- **TTL**: 5 minutes (300 seconds)
- **Key Format**: `restaurants_{locationId}_{offset}`
- **Storage**: In-memory NodeCache
- **Fallback**: Re-query API if cache miss

## Error Handling

### Common Error Responses:
```json
{
  "status": false,
  "message": "Location not found",
  "timestamp": 1697462400,
  "data": null
}
```

### Fallback Strategy:
1. **Location Resolution Fails**: Use default Bucharest location ID (294458)
2. **Restaurant Search Fails**: Return empty array, log error
3. **Rate Limit Hit**: Use cached data if available, otherwise return empty array

## Configuration

### Environment Variables:
```env
# Default location settings
DEFAULT_CITY="Bucharest, Romania"
DEFAULT_LOCATION_ID="294458"

# API settings (already configured)
RAPIDAPI_KEY=your_rapidapi_key_here
TRIPADVISOR_RAPIDAPI_HOST=tripadvisor16.p.rapidapi.com
TRIPADVISOR_BASE_URL=https://tripadvisor16.p.rapidapi.com
```

## Usage Examples

### Resolve City to Location ID:
```typescript
const locationId = await resolveCityToLocationId("Bucharest, Romania");
// Returns: "294458"
```

### Get Restaurants for Location:
```typescript
const restaurants = await getRestaurantsForLocation("294458", 20);
// Returns: Array of Romanian restaurants in Bucharest
```

## Attractions/Activities Endpoints

### Current Limitation
**Status**: ❌ **Not Available**  
The DataCrawler TripAdvisor16 API provider currently only supports restaurant endpoints. Attraction/activity endpoints are not available in this provider.

### Attempted Endpoints (All Return 404):
```bash
# Tried various endpoint patterns:
/api/v1/attraction/searchAttractions
/api/v1/attraction/list
/api/v1/activity/searchActivities
/api/v1/thingstodo/list
/api/v1/things-to-do/list
/api/v1/poi/search
/attractions/list
/api/attractions/list
```

### Alternative Solutions

#### Option 1: Mock Data Service
For development and testing, we implement a mock activities service that provides:
- **Bucharest attractions** (Palace of Parliament, Old Town, Herastrau Park, etc.)
- **Proper domain models** (ActivitySummary, ActivityDetails)
- **Realistic data structure** matching expected TripAdvisor format

#### Option 2: Alternative API Provider
Consider switching to a different TripAdvisor API provider on RapidAPI that includes attractions:
- **Travel Advisor by apidojo**: `travel-advisor.p.rapidapi.com`
- **TripAdvisor API by DataCrawler**: Different provider with more endpoints
- **Tripadvisor by DataCrawler**: Alternative naming

#### Option 3: Hybrid Approach
- **Restaurants**: Use current TripAdvisor16 API (working)
- **Attractions**: Use alternative provider or mock data
- **Unified interface**: Abstract the differences in the service layer

### Planned Implementation

Even without real attraction endpoints, we will implement:

#### Domain Models:
```typescript
interface ActivitySummary {
  id: string;
  name: string;
  primaryPhoto?: string;
  rating?: number;
  reviewCount?: number;
  priceTier?: 'free' | 'budget' | 'moderate' | 'expensive';
  tags: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: 'cultural' | 'outdoor' | 'entertainment' | 'historical' | 'adventure';
}

interface ActivityDetails extends ActivitySummary {
  description?: string;
  address?: string;
  openingHours?: string;
  bookingLinks?: string[];
  photos?: string[];
  groups?: string[];
  website?: string;
  phone?: string;
}
```

#### Service Methods:
```typescript
// Mock implementation until real API is available
async listActivities(options: {
  locationId?: string;
  limit?: number;
  sort?: 'rating' | 'popularity' | 'distance';
  categories?: string[];
}): Promise<ActivitySummary[]>

async getActivityDetails(activityId: string): Promise<ActivityDetails | null>

async getActivityPhotos(activityId: string, limit?: number): Promise<string[]>

async getActivityReviews(activityId: string, options?: {
  limit?: number;
  sort?: 'recent' | 'helpful' | 'rating';
}): Promise<Review[]>
```

### Mock Data for Bucharest

#### Sample Activities:
1. **Palace of Parliament** - Historical/Cultural
2. **Old Town (Centrul Vechi)** - Cultural/Entertainment  
3. **Herastrau Park** - Outdoor/Recreation
4. **Romanian Athenaeum** - Cultural/Entertainment
5. **Dimitrie Gusti National Village Museum** - Cultural/Historical
6. **Calea Victoriei** - Cultural/Shopping
7. **Cismigiu Gardens** - Outdoor/Recreation

#### Sample Response Format:
```json
{
  "status": true,
  "message": "Success (Mock Data)",
  "timestamp": 1697462400,
  "data": {
    "data": [
      {
        "activityId": "attraction-294458-palace-parliament",
        "name": "Palace of Parliament",
        "rating": 4.2,
        "reviewCount": 15420,
        "category": "historical",
        "priceTier": "moderate",
        "coordinates": {
          "lat": 44.4276,
          "lng": 26.0876
        },
        "primaryPhoto": "https://example.com/palace-parliament.jpg",
        "tags": ["architecture", "history", "guided_tours", "government"]
      }
    ]
  }
}
```

## Testing

### Smoke Test Checklist:
- [ ] Location resolver returns valid location ID for Bucharest
- [ ] Restaurant search returns Romanian establishments
- [ ] Results contain Bucharest addresses/coordinates
- [ ] Caching works correctly (subsequent calls are faster)
- [ ] Error handling gracefully falls back to defaults
- [ ] Mock activities service returns Bucharest attractions
- [ ] Activity details load correctly for sample IDs
- [ ] Domain models properly normalize mock data
