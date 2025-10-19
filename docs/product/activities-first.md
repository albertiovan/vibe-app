# Activities-First Architecture

## Overview

The Vibe App has transitioned from a **places-first** to an **activities-first** architecture. This fundamental shift changes how we think about recommendations: instead of finding places and then figuring out what to do there, we start with activities and then discover venues where those activities can be performed.

## Core Concepts

### Activity vs Venue

**Activity (WHAT to do):**
- Represents a specific experience or action
- Has intent, requirements, and characteristics
- Examples: "Downhill MTB in Poiana Brașov", "Wine Tasting in Dealu Mare"
- Defined by energy level, duration, seasonality, difficulty

**Venue (WHERE to do it):**
- Physical location where an activity can be performed
- Verified through external providers (Google Places, OSM, OpenTripMap)
- Has coordinates, ratings, photos, opening hours
- Examples: "Terra Park" (for MTB), "Cramele Recaș" (for wine tasting)

### Why Activities-First?

1. **User Intent Alignment**: Users think "I want to go mountain biking" not "I want to visit a place that might have mountain biking"

2. **Better Personalization**: Activities have rich metadata (energy, difficulty, duration) that maps directly to user preferences

3. **Provider Agnostic**: We can verify venues through multiple data sources without being locked into one provider's categorization

4. **Scalable Discovery**: New activities can be added with automatic venue discovery across all providers

5. **Context Awareness**: Activities naturally encode seasonal, weather, and time-of-day constraints

## Architecture Components

### 1. Domain Model (`/domain/activities/`)

```
domain/activities/
├── types.ts                    # Core interfaces
├── romania-ontology.ts         # Activity catalog
├── mapping/
│   ├── google-places-mapping.ts
│   ├── osm-tags-mapping.ts
│   └── opentripmap-mapping.ts
└── index.ts                    # Helper functions
```

### 2. Activity Intent

Each activity is defined by an `ActivityIntent`:

```typescript
interface ActivityIntent {
  id: string;                 // 'mtb_downhill_brasov'
  label: string;              // 'Downhill MTB in Poiana Brașov'
  category: ActivityCategory; // 'adventure'
  subtypes: string[];         // ['mountain_biking', 'downhill']
  regions: string[];          // ['Brașov', 'Poiana Brașov']
  energy: EnergyLevel;        // 'high'
  indoorOutdoor: string;      // 'outdoor'
  seasonality?: string;       // 'summer'
  difficulty?: number;        // 4 (1-5 scale)
}
```

### 3. Venue Verification

Venues are discovered and verified through multiple providers:

- **Google Places**: Commercial venues, restaurants, tourist attractions
- **OpenStreetMap**: Trails, natural features, outdoor activities
- **OpenTripMap**: Cultural sites, museums, points of interest

### 4. Provider Mapping Tables

Each activity subtype maps to provider-specific search parameters:

**Google Places Example:**
```typescript
mountain_biking: {
  types: ['tourist_attraction', 'park'],
  keywords: ['mountain biking', 'bike park', 'MTB'],
  textQueries: ['mountain bike trails {region}'],
  searchParams: { radius: 25000 }
}
```

**OSM Tags Example:**
```typescript
mountain_biking: {
  tags: {
    'route': 'mtb',
    'highway': 'cycleway',
    'mtb:scale': ['0', '1', '2', '3', '4', '5']
  },
  elementTypes: ['way', 'relation']
}
```

## Romania Activity Ontology

### Categories & Examples

1. **Adventure** (7 activities)
   - Downhill MTB in Poiana Brașov
   - Via Ferrata on Omu Peak
   - Whitewater Rafting on Tisa River

2. **Nature** (5 activities)
   - Hiking to Omu Peak
   - Piatra Craiului National Park
   - Danube Delta Birdwatching

3. **Water** (4 activities)
   - Kayaking in Danube Delta
   - SUP on Herăstrău Lake
   - Thermal Baths in Băile Felix

4. **Culture** (5 activities)
   - Bran Castle Tour
   - Fortified Churches of Transylvania
   - Bucharest Street Art Tour

5. **Wellness** (3 activities)
   - Spa Retreat in Sovata
   - Yoga Retreat in Maramureș
   - Thermal Spa in Băile Herculane

6. **Nightlife** (3 activities)
   - Live Music in Bucharest Old Town
   - Club Night in Cluj-Napoca
   - Stand-up Comedy in Timișoara

7. **Culinary** (3 activities)
   - Wine Tasting in Dealu Mare
   - Traditional Cooking Class
   - Michelin Dining in Bucharest

8. **Creative** (3 activities)
   - Photography Walk in Brașov
   - Ceramics Workshop in Horezu
   - Maker Space in Bucharest

9. **Sports** (3 activities)
   - Indoor Climbing in Bucharest
   - Padel Tennis in Cluj-Napoca
   - Skateboarding in Timișoara

10. **Learning** (3 activities)
    - Language Exchange in Bucharest
    - Community Cleanup in Brașov
    - History Workshop in Alba Iulia

**Total: 37 activities across 25+ Romanian regions**

## Implementation Flow

### 1. Activity Discovery
```typescript
// Find activities matching user's vibe and constraints
const activities = filterActivities({
  categories: ['adventure', 'nature'],
  energyLevel: 'high',
  regions: ['Brașov'],
  seasonality: 'summer'
});
```

### 2. Venue Resolution
```typescript
// For each activity, resolve provider queries
const queries = resolveProviderQueries(
  'mountain_biking',
  { lat: 45.6427, lng: 25.5887 },
  'Brașov'
);

// Execute queries across all providers
const venues = await Promise.all([
  searchGooglePlaces(queries.google),
  queryOverpass(queries.osm),
  searchOpenTripMap(queries.openTripMap)
]);
```

### 3. Recommendation Assembly
```typescript
// Combine activity + verified venues + context
const recommendation: ActivityRecommendation = {
  intent: activity,
  verifiedVenues: venues,
  weatherSuitability: 'good',
  rationale: 'Perfect weather for outdoor mountain biking...',
  confidence: 0.9
};
```

## Benefits Realized

### For Users
- **Clearer Intent**: "I want adventure" → specific adventure activities
- **Better Context**: Activities include difficulty, duration, seasonality
- **Richer Information**: Multiple data sources provide comprehensive venue details

### For Developers
- **Maintainable**: Single source of truth for activities and mappings
- **Extensible**: Easy to add new activities or providers
- **Testable**: Clear separation between activity logic and venue discovery

### For the System
- **Provider Independence**: Not locked into Google Places categorization
- **Data Quality**: Multiple providers cross-validate venue information
- **Scalability**: New regions/activities automatically get venue discovery

## Migration Strategy

### Phase 1: Parallel Implementation ✅
- Build activities domain alongside existing places system
- Create comprehensive Romania ontology
- Implement provider mapping tables

### Phase 2: Integration (Next)
- Integrate activities system into recommendation engine
- Update API endpoints to use activity-first flow
- Maintain backward compatibility

### Phase 3: Full Migration
- Deprecate places-first endpoints
- Update mobile app to use activity-centric UI
- Optimize for activity-based personalization

## Data Governance

### Activity Ontology Maintenance
- **Single Source of Truth**: `romania-ontology.ts`
- **Validation**: Built-in integrity checks
- **Versioning**: Git-tracked with semantic versioning
- **Updates**: Quarterly reviews with local experts

### Provider Mapping Updates
- **Google Places**: Updated when new place types are added
- **OSM Tags**: Updated as OSM tagging conventions evolve  
- **OpenTripMap**: Updated when new kinds are available

### Quality Assurance
- **Automated Testing**: Validate all mappings resolve to queries
- **Manual Verification**: Sample venue discovery for each activity
- **User Feedback**: Track recommendation quality metrics

## Future Enhancements

### Short Term
- **Weather Integration**: Dynamic activity filtering based on conditions
- **Real-time Availability**: Check venue opening hours, seasonal closures
- **User Preferences**: Learn from activity feedback to improve recommendations

### Long Term
- **Dynamic Activities**: Generate activities based on emerging trends
- **Cross-Region Discovery**: "Similar activities in other regions"
- **Community Activities**: User-generated activity definitions
- **Multi-Day Experiences**: Combine activities into itineraries

## Conclusion

The activities-first architecture represents a fundamental improvement in how the Vibe App understands and serves user intent. By starting with activities and then discovering venues, we provide more relevant, personalized, and contextually appropriate recommendations while maintaining the flexibility to incorporate multiple data sources and adapt to changing user needs.

This approach positions the Vibe App as a true activity discovery platform rather than just a places directory, creating a more engaging and useful experience for users exploring Romania's diverse recreational opportunities.
