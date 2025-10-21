# 🌤️ Weather Integration Guide

## How the App Knows About Weather

Your Vibe App has a **smart, multi-layered weather system** that automatically adapts recommendations based on real-time weather conditions.

---

## 🎯 Overview

**Short Answer:** The app uses **Open-Meteo API** (free, no API key needed) to get real-time weather based on the user's GPS location.

**Data Flow:**
```
User Location (GPS) 
  → Open-Meteo API 
    → Current Weather Data 
      → Contextual AI Prompts 
        → Smart Activity Recommendations
```

---

## 📍 How It Gets Weather Data

### **1. User Location**
```typescript
// Frontend requests GPS permission
const { status } = await Location.requestForegroundPermissionsAsync();
const location = await Location.getCurrentPositionAsync();

// Example: lat: 44.4268, lng: 26.1025 (Bucharest)
```

### **2. Weather API Call**
```typescript
// Calls Open-Meteo (free weather API)
const weather = await weatherService.getCurrentWeather(lat, lng);

// Response:
{
  condition: "partly_cloudy",  // or "rain", "clear", "snow", etc.
  temperature: 18,             // °C
  precipitation: 0.5,          // mm per hour
  windSpeed: 15,               // km/h
  humidity: 65                 // %
}
```

### **3. API Details**
**Service:** [Open-Meteo](https://open-meteo.com)
- ✅ **FREE** - No API key required
- ✅ **Reliable** - 99.9% uptime
- ✅ **Fast** - ~200ms response time
- ✅ **Accurate** - Uses official weather models (NOAA, DWD, etc.)

**Endpoint:**
```
https://api.open-meteo.com/v1/forecast
?latitude={lat}
&longitude={lng}
&current=temperature_2m,precipitation,wind_speed_10m,weather_code
```

---

## 🧠 How It Uses Weather

### **1. Contextual Greetings (New Chat System)**

**Location:** `backend/src/services/context/contextualPrompts.ts`

The AI greeting changes based on weather:

```typescript
// ☀️ Hot Weather (>30°C)
"It's pretty warm today! Pool, ice cream, or air-conditioned culture?"

// 🌧️ Rainy Weather
"It's a bit gray out. Cozy café or indoor adventure?"

// ❄️ Cold Weather (<5°C)
"Bundle up! It's chilly. Warm café, indoor activities, or brave the cold?"

// 🌤️ Perfect Weather (15-28°C, clear)
"Perfect weather outside! Get out there – park, terrace, or adventure?"
```

**Logic:**
```typescript
function getWeatherPrompt(weather: { condition: string, temperature: number }) {
  // Rainy
  if (condition.includes('rain')) {
    return {
      greeting: "It's a bit gray out.",
      suggestion: "Cozy café or indoor adventure?",
      emoji: "🌧️"
    };
  }
  
  // Very hot
  if (temperature > 30) {
    return {
      greeting: "It's pretty warm today!",
      suggestion: "Pool, ice cream, or air-conditioned culture?",
      emoji: "☀️"
    };
  }
  
  // Cold
  if (temperature < 5) {
    return {
      greeting: "Bundle up! It's chilly.",
      suggestion: "Warm café, indoor activities, or brave the cold?",
      emoji: "❄️"
    };
  }
  
  // Beautiful weather
  if (condition.includes('clear') && temperature > 15 && temperature < 28) {
    return {
      greeting: "Perfect weather outside!",
      suggestion: "Get out there – park, terrace, or adventure?",
      emoji: "🌤️"
    };
  }
}
```

---

### **2. Activity Filtering**

**Location:** `backend/src/services/weather/openmeteo.ts`

Weather automatically filters unsuitable activities:

```typescript
// Analyze weather conditions
function analyzeWeatherGating(weather) {
  const heavyRain = weather.precipitation > 5;        // >5mm/hour
  const strongWind = weather.windSpeed > 30;          // >30km/h  
  const extremeTemp = weather.temperature < -10 || weather.temperature > 35;
  const poorVisibility = weather.visibility < 1;      // <1km
  
  // Decision logic
  if (heavyRain || poorVisibility) {
    recommendation = 'indoor';
  } else if (strongWind || extremeTemp) {
    recommendation = 'covered';  // Covered/sheltered activities
  } else {
    recommendation = 'outdoor';
  }
}
```

**Activity Suggestions:**
```typescript
// 🌧️ Heavy Rain
recommended: ['museums', 'galleries', 'shopping', 'indoor_climbing', 'escape_rooms']
avoid: ['hiking', 'cycling', 'outdoor_sports', 'picnics']

// ☀️ Beautiful Weather
recommended: ['hiking', 'cycling', 'parks', 'outdoor_sports', 'sightseeing']

// 🔥 Very Hot (>25°C)
recommended: ['water_activities', 'swimming', 'shaded_areas', 'indoor_cooling']

// ❄️ Very Cold (<5°C)
recommended: ['winter_sports', 'hot_drinks', 'indoor_warmth', 'heated_venues']
```

---

### **3. Real-Time Updates**

**Current Behavior:**
- Weather fetched **when user opens chat**
- Updates **on app foreground** (when user returns to app)
- Cached for **5 minutes** to avoid excessive API calls

**Future Enhancement (Optional):**
```typescript
// Auto-refresh weather every 30 minutes
useEffect(() => {
  const interval = setInterval(async () => {
    const newWeather = await weatherService.getCurrentWeather(lat, lng);
    updateGreeting(newWeather);
  }, 30 * 60 * 1000); // 30 minutes
  
  return () => clearInterval(interval);
}, [lat, lng]);
```

---

## 🔧 Implementation Details

### **Frontend Weather Service**

**Location:** `src/services/weatherService.ts` ✨ NEW

```typescript
import { weatherService } from './src/services/weatherService';

// Fetch current weather
const weather = await weatherService.getCurrentWeather(44.4268, 26.1025);

// Returns:
{
  condition: 'partly_cloudy',
  temperature: 18,
  precipitation: 0,
  windSpeed: 12,
  humidity: 65
}
```

### **Backend Weather Service**

**Location:** `backend/src/services/weather/openmeteo.ts`

```typescript
import { OpenMeteoService } from './services/weather/openmeteo';

const weatherService = new OpenMeteoService();

// Get current weather
const current = await weatherService.getCurrentWeather(lat, lng);

// Get hourly forecast (next 24 hours)
const forecast = await weatherService.getHourlyForecast(lat, lng);

// Analyze conditions
const gating = weatherService.analyzeWeatherGating(current);
// Returns: { heavyRain, strongWind, extremeTemp, recommendation }

// Get activity suggestions
const suggestions = weatherService.getWeatherBasedSuggestions(current);
// Returns: { recommended, avoid, conditions }
```

---

## 🌍 Supported Weather Conditions

The app understands these conditions:

```typescript
Weather Codes:
├─ ☀️ Clear: 'clear', 'mainly_clear'
├─ ⛅ Cloudy: 'partly_cloudy', 'overcast'
├─ 🌫️ Fog: 'fog'
├─ 🌧️ Rain: 'drizzle', 'rain', 'rain_showers'
├─ ⛈️ Storm: 'thunderstorm', 'thunderstorm_with_hail'
├─ ❄️ Snow: 'snow', 'snow_showers'
└─ 🌡️ Temperature: -40°C to +50°C
```

---

## 📱 User Experience Flow

### **Example 1: Sunny Day**

```
1. User opens app in Bucharest
2. App gets GPS: 44.4268, 26.1025
3. Weather API: 24°C, clear sky
4. AI Greeting: "Perfect weather outside! Get out there – park, terrace, or adventure? 🌤️"
5. Suggested Vibes: ["🏔️ Outdoor Adventure", "🌅 Sunset", "☕ Terrace"]
6. Activities shown: Parks, cycling, outdoor cafés, hiking
```

### **Example 2: Rainy Day**

```
1. User opens app in Cluj
2. App gets GPS: 46.7712, 23.6236
3. Weather API: 12°C, moderate rain (6mm/h)
4. AI Greeting: "It's a bit gray out. Cozy café or indoor adventure? 🌧️"
5. Suggested Vibes: ["😌 Chill", "🎨 Creative", "🍷 Cozy"]
6. Activities shown: Museums, escape rooms, indoor climbing, cafés
```

### **Example 3: Hot Summer Day**

```
1. User opens app in Constanța (beach city)
2. App gets GPS: 44.1598, 28.6348
3. Weather API: 32°C, clear
4. AI Greeting: "It's pretty warm today! Pool, ice cream, or air-conditioned culture? ☀️"
5. Suggested Vibes: ["🏊 Water Fun", "🍦 Cool Down", "🏛️ AC Culture"]
6. Activities shown: Beach, water parks, air-conditioned museums, ice cream cafés
```

---

## 🔍 Testing Weather

### **Test Different Conditions**

```bash
# Test rainy weather
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-123",
    "weather": {
      "condition": "rain",
      "temperature": 12
    }
  }'

# Expected: "It's a bit gray out. Cozy café or indoor adventure?"

# Test hot weather
curl -X POST http://localhost:3000/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-123",
    "weather": {
      "condition": "clear",
      "temperature": 32
    }
  }'

# Expected: "It's pretty warm today! Pool, ice cream, or air-conditioned culture?"
```

### **Test Live Weather**

```typescript
// In your app
import { weatherService } from './src/services/weatherService';

// Test for Bucharest
const weather = await weatherService.getCurrentWeather(44.4268, 26.1025);
console.log('Current weather:', weather);

// Test for different cities
const cluj = await weatherService.getCurrentWeather(46.7712, 23.6236);
const constanta = await weatherService.getCurrentWeather(44.1598, 28.6348);
```

---

## 🚀 What's Already Working

✅ **Backend Weather Service** - OpenMeteo integration complete  
✅ **Weather Analysis** - Smart filtering (indoor/outdoor/covered)  
✅ **Contextual Prompts** - Weather-aware greetings  
✅ **Frontend Service** - Auto-fetch weather ✨ NEW  
✅ **ChatHomeScreen Integration** - Automatic weather on start ✨ NEW  

---

## 🔮 Future Enhancements

### **Coming Soon**

1. **Hourly Forecast**
   - "Rain expected in 2 hours - wrap up outdoor plans"
   - "Weather improving after 3pm - perfect for evening terrace"

2. **Multi-Day Planning**
   - "This weekend: Saturday sunny ☀️, Sunday rain 🌧️"
   - "Best day for hiking this week: Thursday"

3. **Weather Alerts**
   - "Storm warning ⛈️ - indoor activities recommended"
   - "Perfect sunset tonight 🌅 - rooftop bars open"

4. **Location-Specific**
   - Mountain weather vs. city weather
   - Beach conditions (water temp, waves)
   - Ski resort conditions (snow depth)

---

## 📊 Weather API Details

**Open-Meteo API:**
- **Rate Limit:** 10,000 requests/day (free tier)
- **Update Frequency:** Every hour
- **Coverage:** Global
- **Accuracy:** 90%+ for 24h forecast
- **Cost:** FREE (no API key needed!)

**Alternative APIs (if needed):**
- ~~OpenWeatherMap~~ (requires API key, paid)
- ~~Weather.com~~ (requires API key, paid)
- ✅ **Open-Meteo** (free, reliable, chosen)

---

## 🎉 Summary

**How it works:**
1. 📍 User location → GPS coordinates
2. 🌐 API call → Open-Meteo weather service
3. 🌤️ Real weather data → temperature, precipitation, wind, conditions
4. 🧠 Smart analysis → indoor/outdoor/covered recommendation
5. 💬 Contextual greeting → "It's rainy. Cozy café or indoor adventure?"
6. 🎯 Activity filtering → Show weather-appropriate options

**Result:** Users get **hyper-relevant** activity suggestions that match both their vibe AND the current weather! 🌈

---

## 🛠️ Quick Reference

```typescript
// Get current weather
const weather = await weatherService.getCurrentWeather(lat, lng);

// Start chat with weather context
const chat = await chatApi.startConversation({
  deviceId,
  location: { city, lat, lng },
  weather: { condition, temperature }
});

// Backend uses weather automatically
// Returns weather-aware greeting + suggestions
```

**Weather is now fully integrated into your new UI/UX! 🎊**
