# OpenTripMap API Integration

## Overview

OpenTripMap provides access to points of interest (POIs) including natural attractions, parks, viewpoints, museums, and outdoor activities. Free to use with no API key required.

## Base URL
```
https://api.opentripmap.com/0.1/en/places
```

## Authentication
No API key required - free service with rate limits.

## Endpoints

### Places by Radius
Search for places within a radius of coordinates.

**Endpoint:** `GET /radius`

**Parameters:**
- `lat` - Latitude (required)
- `lon` - Longitude (required) 
- `radius` - Search radius in meters (default: 1000, max: 50000)
- `kinds` - Categories filter (comma-separated)
- `limit` - Max results (default: 10, max: 500)
- `format` - Response format (json/geojson)

**Example:**
```
GET /radius?lat=44.4268&lon=26.1025&radius=10000&kinds=natural,parks&limit=50&format=json
```

**Response:**
```json
[
  {
    "xid": "N123456",
    "name": "Herastrau Park",
    "kinds": "parks,urban_environment",
    "osm": "way/123456",
    "point": {
      "lon": 26.0969,
      "lat": 44.4698
    },
    "dist": 2500
  }
]
```

### Place Details
Get detailed information about a specific place.

**Endpoint:** `GET /xid/{xid}`

**Parameters:**
- `xid` - Place identifier (required)
- `format` - Response format (json)

**Example:**
```
GET /xid/N123456?format=json
```

**Response:**
```json
{
  "xid": "N123456",
  "name": "Herastrau Park",
  "address": {
    "city": "Bucharest",
    "country": "Romania",
    "country_code": "ro"
  },
  "rate": 3,
  "kinds": "parks,urban_environment,interesting_places",
  "sources": {
    "geometry": "osm",
    "attributes": ["osm", "wikidata"]
  },
  "point": {
    "lon": 26.0969,
    "lat": 44.4698
  },
  "wikipedia_extracts": {
    "title": "Herăstrău Park",
    "text": "Large park in northern Bucharest...",
    "html": "<p>Large park in northern Bucharest...</p>"
  },
  "info": {
    "descr": "One of the largest parks in Bucharest"
  }
}
```

## Categories (Kinds)

### Natural Features
- `natural` - Natural landmarks, geological formations
- `geological_formations` - Caves, rocks, cliffs
- `water` - Lakes, rivers, waterfalls
- `beaches` - Beaches and coastal areas
- `islands` - Islands and archipelagos

### Parks & Recreation
- `parks` - City parks, national parks
- `gardens` - Botanical gardens, public gardens
- `protected_areas` - Nature reserves, protected zones
- `zoos` - Zoos and wildlife parks

### Adventure & Sports
- `amusements` - Theme parks, entertainment
- `sport` - Sports facilities, stadiums
- `climbing` - Climbing areas, via ferrata
- `winter_sports` - Ski resorts, winter activities

### Cultural & Historic
- `museums` - Museums and exhibitions
- `historic` - Historic sites and monuments
- `architecture` - Notable buildings
- `religion` - Churches, temples, religious sites

### Viewpoints & Scenic
- `other_hotels` - Often contains viewpoints and scenic spots
- `towers` - Observation towers, lighthouses
- `bridges` - Notable bridges with views

## Usage Examples

### Search Natural Attractions
```typescript
const naturalPOIs = await openTripMapProvider.searchByGeo(
  44.4268, // lat
  26.1025, // lng
  15000,   // radius in meters
  ['natural', 'parks', 'water']
);
```

### Search Adventure Activities
```typescript
const adventurePOIs = await openTripMapProvider.searchOutdoorActivities(
  44.4268,
  26.1025,
  20000,
  'adventure'
);
```

### Get Detailed Information
```typescript
const details = await openTripMapProvider.getDetails('N123456');
```

## Category Mapping

Our system maps OpenTripMap kinds to experience categories:

### Natural → `natural`
- `natural`, `geological_formations`, `water`, `beaches`, `islands`
- Subcategories: water, geological, beach, forest, landscape

### Parks → `park` 
- `parks`, `gardens`, `protected_areas`
- Subcategories: national_park, garden, protected_area

### Recreation → `recreation`
- `amusements`, `sport`, `climbing`, `winter_sports`
- Subcategories: sport, climbing, winter_sports, water_park

### Adventure → `adventure`
- `extreme_sports`, `adventure`, `climbing`
- Subcategories: extreme

### Viewpoints → `viewpoint`
- `other_hotels`, `towers`, `lighthouses`
- Subcategories: scenic

## Rate Limits
- 1000 requests per hour per IP
- 10 requests per second
- No daily limits

## Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad request (invalid parameters)
- `429` - Rate limit exceeded
- `500` - Server error

### Empty Results
```json
[]
```

## Data Quality Notes

### Strengths
- Good coverage of major attractions
- Reliable coordinates
- Wikipedia integration for descriptions
- Free to use

### Limitations
- Limited user ratings/reviews
- Inconsistent data quality by region
- Some categories may be sparse
- No real-time information (hours, prices)

## Best Practices

1. **Radius Selection**
   - Urban areas: 5-10km
   - Rural areas: 15-25km
   - Maximum: 50km

2. **Category Filtering**
   - Use specific kinds for better results
   - Combine related categories
   - Filter results by outdoor relevance

3. **Caching**
   - Cache place details (they rarely change)
   - Cache radius searches for popular locations
   - Respect rate limits

4. **Data Enrichment**
   - Use Wikipedia extracts for descriptions
   - Combine with other data sources
   - Validate coordinates

## Integration Example

```typescript
// Search for outdoor POIs near location
const pois = await openTripMapProvider.searchByGeo(
  userLat,
  userLng,
  10000, // 10km radius
  ['natural', 'parks', 'amusements', 'sport']
);

// Filter for outdoor relevance
const outdoorPOIs = openTripMapProvider.filterOutdoorRelevant(pois);

// Enrich with details
const enrichedPOIs = await Promise.all(
  outdoorPOIs.slice(0, 10).map(poi => 
    openTripMapProvider.getDetails(poi.id)
  )
);
```

## Troubleshooting

### No Results
- Check coordinate validity
- Increase search radius
- Try different category combinations
- Verify network connectivity

### Rate Limiting
- Implement exponential backoff
- Cache frequently requested data
- Batch requests when possible
- Monitor request frequency
