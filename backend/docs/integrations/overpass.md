# Overpass API Integration

## Overview

The Overpass API provides access to OpenStreetMap data for trails, outdoor routes, and recreational activities. This integration fetches hiking trails, MTB routes, cycling paths, and ski pistes.

## Base URL
```
https://overpass-api.de/api/interpreter
```

## Authentication
No API key required - free to use with rate limits.

## Sample Queries

### MTB Trails
```overpass
[out:json][timeout:25];
(
  relation["route"="mtb"](bbox:44.3,26.0,44.5,26.2);
  way["route"="mtb"](bbox:44.3,26.0,44.5,26.2);
);
out geom;
```

**Response Structure:**
```json
{
  "elements": [
    {
      "type": "relation",
      "id": 123456,
      "tags": {
        "route": "mtb",
        "name": "Carpathian MTB Trail",
        "mtb:scale": "2",
        "distance": "15.5 km",
        "surface": "gravel"
      },
      "members": [...]
    }
  ]
}
```

### Hiking Routes
```overpass
[out:json][timeout:25];
(
  relation["route"="hiking"](bbox:44.3,26.0,44.5,26.2);
  way["route"="hiking"](bbox:44.3,26.0,44.5,26.2);
);
out geom;
```

**Key Tags:**
- `route=hiking` - Hiking trail
- `sac_scale` - Difficulty (T1-T6)
- `trail_visibility` - Path visibility
- `surface` - Trail surface type

### Cycling Routes
```overpass
[out:json][timeout:25];
(
  relation["route"="bicycle"](bbox:44.3,26.0,44.5,26.2);
  way["route"="bicycle"](bbox:44.3,26.0,44.5,26.2);
);
out geom;
```

### Ski Pistes
```overpass
[out:json][timeout:25];
(
  way["piste:type"](bbox:44.3,26.0,44.5,26.2);
  relation["piste:type"](bbox:44.3,26.0,44.5,26.2);
);
out geom;
```

**Piste Types:**
- `piste:type=downhill` - Alpine skiing
- `piste:type=nordic` - Cross-country
- `piste:difficulty` - green/blue/red/black

### Outdoor Amenities
```overpass
[out:json][timeout:25];
(
  node["amenity"~"^(parking|toilets|drinking_water|shelter)$"](bbox:44.3,26.0,44.5,26.2);
  node["tourism"~"^(viewpoint|picnic_site|camp_site)$"](bbox:44.3,26.0,44.5,26.2);
);
out;
```

## Difficulty Mapping

### MTB Scale (mtb:scale)
- `0-1` → `easy`
- `2-3` → `moderate` 
- `4-5` → `difficult`
- `6` → `expert`

### SAC Scale (sac_scale)
- `T1` → `easy` (Walking)
- `T2-T3` → `moderate` (Mountain hiking)
- `T4-T5` → `difficult` (Alpine hiking)
- `T6` → `expert` (Difficult alpine)

### Ski Difficulty
- `novice/green` → `easy`
- `easy/blue` → `easy`
- `intermediate/red` → `moderate`
- `advanced/black` → `difficult`
- `expert/double_black` → `expert`

## Rate Limits
- 10,000 queries per day per IP
- 25 second timeout per query
- Concurrent request limit: 2

## Error Handling

### Common Errors
- `400` - Malformed query
- `429` - Rate limit exceeded
- `504` - Query timeout

### Best Practices
1. Use appropriate bounding boxes (not too large)
2. Set reasonable timeouts (25s max)
3. Cache results when possible
4. Handle empty responses gracefully

## Data Processing

### Geometry Extraction
```typescript
// For ways with geometry
if (element.type === 'way' && element.geometry) {
  const waypoints = element.geometry.map(coord => ({
    lat: coord.lat,
    lng: coord.lon,
    elevation: coord.elevation
  }));
}

// For relations with members
if (element.type === 'relation' && element.members) {
  const ways = element.members.filter(m => m.type === 'way');
  // Process member ways...
}
```

### Distance Calculation
```typescript
// Parse distance from tags
const distance = tags.distance || tags.length;
if (distance) {
  const match = distance.match(/(\d+(?:\.\d+)?)\s*(km|m|mi)?/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2] || 'm';
    // Convert to kilometers...
  }
}
```

## Usage Examples

### Search MTB Trails Near Bucharest
```typescript
const bbox = {
  south: 44.3268,
  west: 26.0025,
  north: 44.5268,
  east: 26.2025
};

const trails = await overpassProvider.searchTrails(bbox, ['mtb']);
```

### Get Trail Details
```typescript
const trailDetails = await overpassProvider.getTrailDetails('relation_123456');
```

## Integration Notes

- Overpass data quality varies by region
- Rural areas may have limited trail data
- Consider combining with other sources (OpenTripMap)
- Cache responses to reduce API calls
- Validate coordinates before querying
