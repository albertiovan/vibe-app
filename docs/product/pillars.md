# Vibes → Experiences: Product Pillars

## Core Philosophy

**"Vibes → Experiences"** - We transform user moods and desires into curated, diverse activity recommendations that prioritize experiences over consumption.

## The 5-Result Rule

**Hard Constraint**: Every vibe match returns exactly **5 diverse activities** from distinct experience sectors.

### Why 5?
- **Cognitive Load**: Perfect number for decision-making without overwhelm
- **Quality over Quantity**: Forces curation of only the best matches
- **Diversity Guarantee**: Ensures variety across different experience types
- **Mobile Optimized**: Fits perfectly on mobile screens

## Experience Sectors

Our recommendation engine diversifies across 6 core sectors:

### 🥾 Trails & Outdoor (Priority: 9)
- **Focus**: Hiking, nature walks, outdoor exploration
- **Place Types**: `park`, `tourist_attraction`, `natural_feature`
- **Keywords**: trail, hike, nature, outdoor, walk, forest, mountain

### ⚡ Adrenaline & Sports (Priority: 8)  
- **Focus**: High-energy activities, sports, adventure
- **Place Types**: `amusement_park`, `stadium`, `gym`, `bowling_alley`
- **Keywords**: adrenaline, sports, adventure, extreme, thrill, active, energy

### 🌿 Nature & Serenity (Priority: 8)
- **Focus**: Peaceful natural settings, gardens, scenic spots
- **Place Types**: `park`, `zoo`, `aquarium`, `botanical_garden`
- **Keywords**: nature, peaceful, garden, scenic, tranquil, wildlife, green

### 🎨 Culture & Arts (Priority: 7)
- **Focus**: Museums, galleries, historical sites, cultural experiences
- **Place Types**: `museum`, `art_gallery`, `library`, `church`, `synagogue`, `hindu_temple`
- **Keywords**: culture, art, history, museum, gallery, heritage, learn

### 🧘 Wellness & Relaxation (Priority: 6)
- **Focus**: Spas, wellness centers, relaxation activities
- **Place Types**: `spa`, `beauty_salon`, `gym`, `park`
- **Keywords**: wellness, spa, relax, massage, meditation, health, rejuvenate

### 🌙 Nightlife & Social (Priority: 5)
- **Focus**: Evening entertainment, social venues (non-food focused)
- **Place Types**: `night_club`, `bar`, `casino`, `movie_theater`
- **Keywords**: nightlife, party, social, evening, drinks, entertainment, music

## Food Policy: Premium Only

### Default Behavior
- **Food is OFF by default**
- Focus on experiences, activities, and cultural engagement
- No casual dining recommendations

### When Food is Included
Food is only surfaced for **explicit culinary experiences**:

#### Triggers
User must specifically mention:
- "dining", "restaurant", "food", "eating"
- "culinary", "michelin", "tasting menu"
- "fine dining", "chef", "gourmet"

#### Premium Criteria
When food is enabled, only include places that meet ALL:
- **Price Level**: ≥3 (Google Places scale 0-4)
- **Rating**: ≥4.3 stars
- **Premium Keywords**: michelin, starred, fine dining, tasting, chef
- **OR**: Price Level ≥3 AND Rating ≥4.5

### Curated Allowlist
Exceptional culinary experiences (Michelin-starred, etc.) bypass normal filters.

## Diversity Algorithm

### Selection Process
1. **Classify** each place into experience sectors
2. **Group** by sector, sort by rating within each
3. **Select** max 2 places per sector (diversity constraint)
4. **Prioritize** sectors by priority score (trails > adrenaline > nature > culture > wellness > nightlife)
5. **Cap** at exactly 5 results
6. **Fallback** to top-rated if insufficient sector diversity

### Diversity Guarantees
- **Minimum 3 sectors** represented when possible
- **Maximum 2 places** per sector
- **Priority-weighted** selection favoring outdoor/active experiences
- **Quality threshold** maintained (rating-based sorting)

## Implementation Rules

### Feature Flags
```typescript
features.experiencesDefault = true  // Default to experiences
features.food = false              // Food off by default
```

### Result Structure
```typescript
{
  places: VibePlace[],     // Exactly 5 diverse results
  totalFound: number,      // Total before diversity filtering
  vibeAnalysis: {
    sectors: string[],     // Sectors represented
    diversity: number      // Diversity score 0-1
  }
}
```

### Quality Assurance
- **No duplicates** (by place_id)
- **Minimum rating** thresholds per sector
- **Distance relevance** (walking time < 60min preferred)
- **Opening hours** awareness when available

## User Experience Impact

### Before: Restaurant-Heavy
- 7-8 restaurants per search
- Limited activity diversity
- Food-centric recommendations

### After: Experience-Rich
- 5 carefully curated activities
- Guaranteed sector diversity
- Experience-first mindset
- Premium food only when explicitly requested

## Success Metrics

### Diversity Metrics
- **Sector Coverage**: Average sectors per result set
- **Experience Ratio**: Non-food vs food recommendations
- **User Engagement**: Time spent on diverse vs single-sector results

### Quality Metrics
- **Rating Distribution**: Average rating of recommended places
- **User Satisfaction**: Feedback on recommendation relevance
- **Conversion Rate**: Bookings/visits from recommendations

---

*This document defines the core product principles for the "Vibes → Experiences" transformation. All features and algorithms must align with these pillars.*
