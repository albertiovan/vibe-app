# OpenMeteo API Integration

## Overview

OpenMeteo provides free weather data including current conditions, hourly forecasts, and historical data. No API key required, making it perfect for weather-aware activity recommendations.

## Base URL
```
https://api.open-meteo.com/v1
```

## Authentication
No API key required - completely free service.

## Endpoints

### Current Weather + Forecast
Get current weather conditions and hourly forecast.

**Endpoint:** `GET /forecast`

**Parameters:**
- `latitude` - Latitude coordinate (required)
- `longitude` - Longitude coordinate (required)
- `current` - Current weather variables (comma-separated)
- `hourly` - Hourly forecast variables (comma-separated)
- `daily` - Daily forecast variables (comma-separated)
- `timezone` - Timezone (default: auto)
- `forecast_days` - Number of forecast days (1-16)

## Weather Variables

### Current Weather
- `temperature_2m` - Temperature at 2m height (°C)
- `precipitation` - Precipitation (mm)
- `wind_speed_10m` - Wind speed at 10m (km/h)
- `wind_direction_10m` - Wind direction (degrees)
- `relative_humidity_2m` - Relative humidity (%)
- `visibility` - Visibility (m)
- `weather_code` - Weather condition code
- `uv_index` - UV index

### Hourly Forecast
Same variables as current, plus:
- `precipitation_probability` - Chance of precipitation (%)
- `cloud_cover` - Cloud cover (%)
- `is_day` - Day/night indicator

## Usage Examples

### Current Weather
```
GET /forecast?latitude=44.4268&longitude=26.1025&current=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m,relative_humidity_2m,visibility,weather_code&timezone=auto
```

**Response:**
```json
{
  "latitude": 44.4268,
  "longitude": 26.1025,
  "generationtime_ms": 0.123,
  "utc_offset_seconds": 7200,
  "timezone": "Europe/Bucharest",
  "current_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "precipitation": "mm",
    "wind_speed_10m": "km/h",
    "wind_direction_10m": "°",
    "relative_humidity_2m": "%",
    "visibility": "m",
    "weather_code": "wmo code"
  },
  "current": {
    "time": "2025-10-17T10:00",
    "temperature_2m": 18.5,
    "precipitation": 0.0,
    "wind_speed_10m": 12.3,
    "wind_direction_10m": 245,
    "relative_humidity_2m": 65,
    "visibility": 24140,
    "weather_code": 2
  }
}
```

### Hourly Forecast
```
GET /forecast?latitude=44.4268&longitude=26.1025&hourly=temperature_2m,precipitation,wind_speed_10m,weather_code&forecast_days=1&timezone=auto
```

**Response:**
```json
{
  "latitude": 44.4268,
  "longitude": 26.1025,
  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "precipitation": "mm",
    "wind_speed_10m": "km/h",
    "weather_code": "wmo code"
  },
  "hourly": {
    "time": [
      "2025-10-17T00:00",
      "2025-10-17T01:00",
      "2025-10-17T02:00"
    ],
    "temperature_2m": [15.2, 14.8, 14.5],
    "precipitation": [0.0, 0.1, 0.3],
    "wind_speed_10m": [8.5, 9.2, 10.1],
    "weather_code": [1, 2, 3]
  }
}
```

## Weather Codes (WMO)

OpenMeteo uses World Meteorological Organization (WMO) weather codes:

### Clear/Cloudy (0-3)
- `0` - Clear sky
- `1` - Mainly clear
- `2` - Partly cloudy
- `3` - Overcast

### Fog (45-48)
- `45` - Fog
- `48` - Depositing rime fog

### Drizzle (51-57)
- `51` - Light drizzle
- `53` - Moderate drizzle
- `55` - Dense drizzle
- `56` - Light freezing drizzle
- `57` - Dense freezing drizzle

### Rain (61-67)
- `61` - Slight rain
- `63` - Moderate rain
- `65` - Heavy rain
- `66` - Light freezing rain
- `67` - Heavy freezing rain

### Snow (71-77)
- `71` - Slight snow fall
- `73` - Moderate snow fall
- `75` - Heavy snow fall
- `77` - Snow grains

### Showers (80-86)
- `80` - Slight rain showers
- `81` - Moderate rain showers
- `82` - Violent rain showers
- `85` - Slight snow showers
- `86` - Heavy snow showers

### Thunderstorm (95-99)
- `95` - Thunderstorm
- `96` - Thunderstorm with slight hail
- `99` - Thunderstorm with heavy hail

## Weather-Based Activity Gating

### Conditions for Indoor Recommendations
- Heavy rain: `precipitation > 5mm/h`
- Poor visibility: `visibility < 1000m`
- Extreme temperatures: `< -10°C or > 35°C`
- Strong winds: `wind_speed > 30km/h`

### Activity Suitability Matrix

| Weather Condition | Outdoor | Covered | Indoor |
|------------------|---------|---------|--------|
| Clear, mild      | ✅ 1.0  | ✅ 1.0  | ✅ 1.0 |
| Light rain       | ⚠️ 0.6  | ✅ 0.9  | ✅ 1.0 |
| Heavy rain       | ❌ 0.2  | ⚠️ 0.6  | ✅ 1.2 |
| Strong wind      | ⚠️ 0.4  | ✅ 0.8  | ✅ 1.1 |
| Extreme cold     | ❌ 0.3  | ⚠️ 0.7  | ✅ 1.2 |
| Extreme heat     | ⚠️ 0.5  | ✅ 0.8  | ✅ 1.1 |

## Integration Examples

### Get Current Weather
```typescript
const weather = await openMeteoService.getCurrentWeather(44.4268, 26.1025);
```

### Get Weather Forecast
```typescript
const forecast = await openMeteoService.getWeatherForecast(44.4268, 26.1025);
```

### Apply Weather Gating
```typescript
const { filtered, weatherAdvice } = WeatherGatingService.applyWeatherGating(
  places,
  weather.current
);
```

### Get Activity Suggestions
```typescript
const suggestions = WeatherGatingService.getWeatherActivitySuggestions(
  weather.current
);
// Returns: { prioritize: string[], avoid: string[], message: string }
```

## Rate Limits
- 10,000 API calls per day per IP
- No authentication required
- Fair use policy applies

## Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad request (invalid coordinates)
- `429` - Rate limit exceeded
- `500` - Server error

### Invalid Coordinates
```json
{
  "error": true,
  "reason": "Latitude must be in range of -90 to 90°. Given: 91.0"
}
```

## Best Practices

### Caching Strategy
```typescript
// Cache weather data for 15 minutes
const WEATHER_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Cache key based on rounded coordinates
const cacheKey = `weather_${Math.round(lat * 100)}_${Math.round(lng * 100)}`;
```

### Error Handling
```typescript
try {
  const weather = await openMeteoService.getCurrentWeather(lat, lng);
  return weather;
} catch (error) {
  console.warn('Weather service unavailable, using fallback');
  return null; // Graceful degradation
}
```

### Coordinate Validation
```typescript
function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}
```

## Weather-Aware Recommendations

### Rainy Day Activities
```typescript
if (weather.precipitation > 2) {
  prioritize(['museums', 'galleries', 'shopping', 'cinemas', 'cafes']);
  avoid(['parks', 'trails', 'outdoor_sports']);
}
```

### Perfect Weather Activities
```typescript
if (weather.temperature > 15 && weather.temperature < 25 && 
    weather.precipitation < 0.5 && weather.wind_speed < 20) {
  prioritize(['hiking', 'cycling', 'parks', 'sightseeing', 'outdoor_dining']);
}
```

### Hot Weather Adaptations
```typescript
if (weather.temperature > 28) {
  prioritize(['swimming', 'water_activities', 'air_conditioned_spaces']);
  modify(['prefer_shaded_areas', 'indoor_alternatives']);
}
```

## Troubleshooting

### No Weather Data
- Verify coordinates are valid
- Check network connectivity
- Implement fallback behavior
- Use cached data if available

### Inaccurate Forecasts
- Weather accuracy decreases beyond 3 days
- Use hourly data for short-term planning
- Combine with user location for better accuracy
- Consider local weather variations

### Performance Optimization
- Cache responses for 15-30 minutes
- Round coordinates to reduce cache misses
- Batch requests for multiple locations
- Use appropriate timeout values (5-10 seconds)
