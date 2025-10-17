# Challenge Me: Outside-the-Box Suggestions

## Overview

The "Challenge Me" feature provides weather-aware, outside-the-box destination suggestions that go beyond the user's comfort zone while remaining safe and feasible.

## Core Concept

- **Maximum 2 suggestions** per search
- **Outside user's radius** but within travel limits (≤200km, ≤3h drive)
- **Weather-aware scoring** using 72-hour forecasts
- **Safety-first approach** with risk assessment
- **Clear labeling** with travel estimates and weather badges

## Architecture

### Challenge Weather Service
```typescript
interface WeatherForecast {
  location: { lat: number; lng: number; city: string };
  forecast: {
    date: string;
    temperature: { min: number; max: number };
    conditions: string;
    precipitation: number;
    windSpeed: number;
    suitability: number; // 0-1 score
    badge: string; // "☀️ Clear 18°C"
  }[];
}
```

### Challenge Selector
```typescript
interface ChallengePlace extends VibePlace {
  challengeScore: number;
  travelEstimate: TravelEstimate;
  weatherForecast: WeatherForecast['forecast'][0];
  challengeReason: string;
  riskNote?: string;
  seasonalPerks?: string[];
}
```

## Scoring Algorithm

### Challenge Score Calculation (0-1 scale)
```
challengeScore = 0.5 (base)
  + weatherSuitability * 0.4    // Weather compatibility
  + noveltyScore * 0.3          // Uniqueness factor
  + seasonalBonus * 0.2         // Seasonal perks
  - distancePenalty * 0.1       // Travel difficulty
```

### Weather Suitability Factors
- **Temperature Match**: Activity-specific temperature preferences
- **Precipitation Impact**: Rain good for indoor, bad for outdoor
- **Wind Conditions**: High wind generally reduces suitability
- **Activity Type**: Ski (cold), outdoor (moderate), indoor (any)

### Novelty Scoring
- **Unique Types**: Castles, thermal baths, caves (+0.3)
- **High Ratings**: 4.5+ stars (+0.2)
- **Tourist Attractions**: Special experiences (+0.1)

### Seasonal Perks Detection
- **Winter Sports**: "Fresh snow conditions" (ski + cold + precipitation)
- **Thermal Baths**: "Perfect weather for thermal baths" (spa + cold)
- **Clear Views**: "Clear views from heights" (castle + no rain)
- **Hiking Weather**: "Perfect hiking weather" (nature + clear)

## Safety Filters

### Automatic Exclusions
- **Heavy Rain**: >20mm precipitation
- **Dangerous Winds**: >30km/h wind speed
- **Extreme Travel**: >3 hours drive time
- **Low Scores**: <0.4 challenge score

### Risk Notes Generation
- "Heavy rain expected"
- "Strong winds"
- "Long drive required"
- "Freezing temperatures"

## Travel Estimation

### Simple Heuristics
```typescript
distanceKm = haversineDistance(origin, destination)
estimatedMinutes = (distanceKm / 80) * 60  // 80km/h avg highway speed
feasible = distanceKm <= 200 && estimatedMinutes <= 180
```

### Display Format
- **Distance**: "85km, 1h drive"
- **Mode**: Currently drive-only (future: transit options)
- **Feasibility**: Hard limits prevent impossible suggestions

## Weather Integration

### OpenMeteo API Integration
```
https://api.open-meteo.com/v1/forecast?
  latitude={lat}&longitude={lng}
  &daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode
  &forecast_days=3&timezone=auto
```

### Weather Badge Generation
- **Clear**: "☀️ Clear 18°C"
- **Cloudy**: "☁️ Cloudy 15°C"
- **Light Rain**: "🌦️ Light rain 12°C"
- **Heavy Rain**: "🌧️ Rain 10°C"

### Activity-Weather Matching
```typescript
// Outdoor activities prefer moderate temperatures
if (activityType.includes('outdoor') && temp >= 15 && temp <= 25) score += 0.3

// Winter activities prefer cold weather
if (activityType.includes('ski') && temp <= 5) score += 0.4

// Rain benefits indoor activities
if (precipitation > 5 && activityType.includes('indoor')) score += 0.1
```

## API Response Format

### Challenge Object
```json
{
  "id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "name": "Bran Castle",
  "rating": 4.3,
  "location": {"lat": 45.5149, "lng": 25.3675},
  "vicinity": "Bran, Brașov County",
  "city": "Regional destination",
  "imageUrl": "/api/places/photo?ref=...",
  "mapsUrl": "https://www.google.com/maps/search/?api=1&query_place_id=...",
  "travelEstimate": "120km, 2h drive",
  "weatherBadge": "☀️ Clear 16°C",
  "challengeReason": "Clear views from heights",
  "challengeScore": 0.82,
  "riskNote": null,
  "seasonalPerks": ["Clear views from heights", "Perfect hiking weather"]
}
```

### Search Stats
```json
{
  "challenges": {
    "totalCandidates": 45,
    "weatherChecked": 6,
    "reasoning": "Found 2 weather-safe challenges outside your 10km radius"
  }
}
```

## UI Integration Guidelines

### Challenge Section Display
```
┌─────────────────────────────────────┐
│ Challenge Me (2) ▼                  │
├─────────────────────────────────────┤
│ 🏰 Bran Castle                      │
│ ⭐ 4.3 • Regional destination       │
│ 🚗 120km, 2h drive                  │
│ ☀️ Clear 16°C                       │
│ 💡 Clear views from heights         │
│ [Open in Google Maps]               │
├─────────────────────────────────────┤
│ 🎿 Poiana Brașov Ski Resort        │
│ ⭐ 4.1 • Regional destination       │
│ 🚗 140km, 2h drive                  │
│ 🌨️ Snow 2°C                        │
│ 💡 Fresh snow conditions            │
│ ⚠️ Freezing temperatures            │
│ [Open in Google Maps]               │
└─────────────────────────────────────┘
```

### Visual Elements
- **Collapsible Section**: "Challenge Me (2)" with expand/collapse
- **Weather Badges**: Color-coded weather icons with temperature
- **Travel Estimates**: Clear distance and time indicators
- **Risk Warnings**: Prominent display of risk notes
- **Seasonal Highlights**: Special perks prominently featured

### Interaction Patterns
- **Tap to Expand**: Show full challenge details
- **Maps Integration**: Direct Google Maps navigation
- **Weather Details**: Tap weather badge for 3-day forecast
- **Challenge Acceptance**: "Accept Challenge" CTA button

## Implementation Status

### ✅ Completed
- Challenge weather service with OpenMeteo integration
- Challenge selector with scoring algorithm
- Safety filters and risk assessment
- Travel estimation with distance/time calculation
- Seasonal perks detection
- API integration with nearby search

### 🔧 In Progress
- TypeScript error resolution in challenge selector
- Challenge result verification and testing
- Weather forecast accuracy validation

### 📋 TODO
- Mobile UI challenge section implementation
- Challenge acceptance tracking
- User feedback on challenge suggestions
- Advanced travel modes (transit, walking)
- Challenge history and preferences

## Testing Examples

### Adventure Seeker in Bucharest
```
User: "I want adrenaline activities" (5km radius, 2h duration)
Challenges:
1. Poiana Brașov Ski Resort (140km, 2h) - "Fresh snow conditions"
2. Therme Balotești Adventure (25km, 30min) - "Perfect clear weather"
```

### Cultural Explorer
```
User: "I want cultural experiences" (10km radius, 3h duration)  
Challenges:
1. Bran Castle (120km, 2h) - "Clear views from heights"
2. Peleș Castle (130km, 2h) - "Perfect hiking weather"
```

### Weather-Aware Suggestions
```
Rainy Day: Indoor challenges prioritized (museums, thermal baths)
Clear Day: Outdoor challenges highlighted (castles, nature, hiking)
Snowy Day: Winter sports opportunities surfaced (ski resorts)
```

## Safety & Quality Assurance

### Mandatory Checks
- Weather safety validation
- Travel feasibility confirmation
- Destination rating verification (≥4.0 stars)
- Risk assessment completion

### Quality Metrics
- Challenge acceptance rate
- User satisfaction scores
- Weather prediction accuracy
- Travel time estimation accuracy

The Challenge Me feature provides curated, weather-aware suggestions that safely expand users' exploration horizons while maintaining high quality and safety standards.
