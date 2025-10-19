/**
 * Improved Vibe Matcher
 * 
 * Uses the existing ontology system to properly match user vibes
 * to relevant activities and places, ensuring accurate results.
 */

import { ALL_ROMANIA_ACTIVITIES } from '../../domain/activities/index.js';

export interface VibeMatchResult {
  activityCategories: string[];
  keywords: string[];
  confidence: number;
  reasoning: string[];
  googlePlacesTypes: string[];
}

export interface PlaceVibeScore {
  placeId: string;
  vibeScore: number;
  matchReasons: string[];
  categoryMatches: string[];
}

/**
 * Enhanced vibe matching using the existing ontology
 */
export function matchVibeToActivities(vibe: string): VibeMatchResult {
  const vibeText = vibe.toLowerCase().trim();
  const matchedCategories: string[] = [];
  const matchedKeywords: string[] = [];
  const reasoning: string[] = [];
  const googlePlacesTypes: string[] = [];
  
  console.log('🎯 Matching vibe:', `"${vibe}"`);

  // FIRST: Enhanced keyword-based matching for common vibes (takes priority)
  const enhancedMatching = [
    {
      keywords: ['sport', 'sports', 'gym', 'fitness', 'workout', 'exercise', 'training', 'athletic', 'new sport', 'try sport'],
      category: 'sports',
      types: ['gym', 'stadium', 'bowling_alley', 'physiotherapist', 'health'],
      reasoning: 'Sports/fitness keywords → sports venues'
    },
    {
      keywords: ['tennis', 'football', 'soccer', 'basketball', 'volleyball', 'swimming', 'pool'],
      category: 'sports',
      types: ['gym', 'stadium', 'health', 'physiotherapist'],
      reasoning: 'Specific sport mentioned → sports facilities'
    },
    {
      keywords: ['martial arts', 'karate', 'judo', 'boxing', 'mma', 'kickboxing', 'taekwondo'],
      category: 'sports',
      types: ['gym', 'health'],
      reasoning: 'Martial arts → specialized gyms'
    },
    {
      keywords: ['dance', 'dancing', 'salsa', 'tango', 'ballet', 'hip hop'],
      category: 'creative',
      types: ['gym', 'health', 'school'],
      reasoning: 'Dance keywords → dance studios/gyms'
    },
    {
      keywords: ['yoga', 'pilates', 'meditation', 'wellness', 'spa', 'massage'],
      category: 'wellness',
      types: ['spa', 'gym', 'health'],
      reasoning: 'Wellness keywords → wellness venues'
    },
    {
      keywords: ['museum', 'art', 'gallery', 'history', 'culture', 'exhibition'],
      category: 'culture',
      types: ['museum', 'art_gallery', 'tourist_attraction', 'library'],
      reasoning: 'Cultural keywords → cultural venues'
    },
    {
      keywords: ['coffee', 'cafe', 'social', 'meet', 'friends', 'chat'],
      category: 'social',
      types: ['cafe', 'restaurant', 'bar'],
      reasoning: 'Social keywords → social venues'
    },
    {
      keywords: ['nature', 'park', 'outdoor', 'hiking', 'walking', 'fresh air'],
      category: 'nature',
      types: ['park', 'natural_feature', 'campground'],
      reasoning: 'Nature keywords → outdoor venues'
    },
    {
      keywords: ['food', 'restaurant', 'eat', 'dining', 'cuisine', 'meal'],
      category: 'culinary',
      types: ['restaurant', 'cafe', 'bakery', 'meal_takeaway'],
      reasoning: 'Food keywords → dining venues'
    },
    {
      keywords: ['nightlife', 'bar', 'club', 'drinks', 'party', 'evening'],
      category: 'nightlife',
      types: ['night_club', 'bar', 'casino'],
      reasoning: 'Nightlife keywords → nightlife venues'
    }
  ];

  // Apply enhanced matching first
  for (const match of enhancedMatching) {
    const hasKeyword = match.keywords.some(keyword => vibeText.includes(keyword.toLowerCase()));
    if (hasKeyword) {
      if (!matchedCategories.includes(match.category)) {
        matchedCategories.push(match.category);
      }
      googlePlacesTypes.push(...match.types);
      reasoning.push(match.reasoning);
      matchedKeywords.push(...match.keywords.filter(k => vibeText.includes(k.toLowerCase())));
    }
  }

  // SECOND: Use the existing Romania activities ontology (as fallback)
  for (const activity of ALL_ROMANIA_ACTIVITIES) {
    let categoryScore = 0;
    const categoryReasons: string[] = [];

    // Check activity label matches
    const activityLabel = activity.label.toLowerCase();
    const labelWords = activityLabel.split(/\s+/);
    
    for (const word of labelWords) {
      if (vibeText.includes(word) && word.length > 2) {
        categoryScore += 0.5;
        categoryReasons.push(`Label word match: "${word}"`);
        matchedKeywords.push(word);
      }
    }

    // Check subtype matches
    for (const subtype of activity.subtypes) {
      const subtypeWords = subtype.replace(/_/g, ' ').toLowerCase();
      if (vibeText.includes(subtypeWords)) {
        categoryScore += 1.0;
        categoryReasons.push(`Subtype match: "${subtypeWords}"`);
        matchedKeywords.push(subtypeWords);
      }
    }

    // Check category name match
    if (vibeText.includes(activity.category.toLowerCase())) {
      categoryScore += 1.5;
      categoryReasons.push(`Category match: "${activity.category}"`);
    }

    // Check region matches (for location-specific vibes)
    for (const region of activity.regions) {
      if (vibeText.includes(region.toLowerCase())) {
        categoryScore += 0.8;
        categoryReasons.push(`Region match: "${region}"`);
      }
    }

    // Energy level matching
    if (vibeText.includes('adventure') || vibeText.includes('exciting') || vibeText.includes('active')) {
      if (activity.energy === 'high') {
        categoryScore += 0.7;
        categoryReasons.push('High energy activity match');
      }
    }
    
    if (vibeText.includes('relax') || vibeText.includes('peaceful') || vibeText.includes('calm')) {
      if (activity.energy === 'chill') {
        categoryScore += 0.7;
        categoryReasons.push('Relaxing activity match');
      }
    }

    // Indoor/outdoor matching
    if (vibeText.includes('outdoor') || vibeText.includes('nature') || vibeText.includes('fresh air')) {
      if (activity.indoorOutdoor === 'outdoor') {
        categoryScore += 0.5;
        categoryReasons.push('Outdoor activity match');
      }
    }

    // If we have a good match, include this category
    if (categoryScore > 0) {
      matchedCategories.push(activity.category);
      reasoning.push(`${activity.category}: ${categoryReasons.join(', ')} (score: ${categoryScore.toFixed(1)})`);
      
      // Map activity categories to Google Places types
      const categoryToTypes: Record<string, string[]> = {
        adventure: ['amusement_park', 'tourist_attraction', 'park'],
        nature: ['park', 'natural_feature', 'campground'],
        culture: ['museum', 'art_gallery', 'tourist_attraction', 'library'],
        wellness: ['spa', 'gym', 'health', 'physiotherapist'],
        nightlife: ['night_club', 'bar', 'casino'],
        culinary: ['restaurant', 'cafe', 'bakery', 'meal_takeaway'],
        creative: ['art_gallery', 'museum', 'store'],
        sports: ['gym', 'stadium', 'bowling_alley', 'health', 'physiotherapist', 'school'],
        learning: ['library', 'university', 'school', 'museum']
      };
      
      if (categoryToTypes[activity.category]) {
        googlePlacesTypes.push(...categoryToTypes[activity.category]);
      }
    }
  }

  // Calculate overall confidence
  const confidence = Math.min(matchedCategories.length * 0.2 + matchedKeywords.length * 0.1, 1.0);


  // Fallback for very generic vibes
  if (matchedCategories.length === 0) {
    console.log('⚠️ No specific matches found, using fallback categories');
    
    // Generic adventure/fun fallbacks
    if (vibeText.includes('fun') || vibeText.includes('exciting') || vibeText.includes('new')) {
      matchedCategories.push('adventure');
      googlePlacesTypes.push('amusement_park', 'tourist_attraction');
      reasoning.push('Generic fun/excitement → adventure venues');
    }
    
    // Default fallback
    if (matchedCategories.length === 0) {
      matchedCategories.push('adventure', 'culture', 'social');
      googlePlacesTypes.push('tourist_attraction', 'museum', 'park', 'cafe');
      reasoning.push('No matches found → using diverse fallback categories');
    }
  }

  // Remove duplicates
  const uniqueCategories = [...new Set(matchedCategories)];
  const uniqueTypes = [...new Set(googlePlacesTypes)];
  const uniqueKeywords = [...new Set(matchedKeywords)];

  console.log('✅ Vibe matching result:', {
    categories: uniqueCategories,
    types: uniqueTypes.slice(0, 5), // Limit for readability
    confidence: confidence.toFixed(2),
    keywordMatches: uniqueKeywords.length
  });

  return {
    activityCategories: uniqueCategories,
    keywords: uniqueKeywords,
    confidence,
    reasoning,
    googlePlacesTypes: uniqueTypes
  };
}

/**
 * Score places based on how well they match the vibe
 */
export function scorePlaceForVibe(
  place: any,
  vibeMatch: VibeMatchResult
): PlaceVibeScore {
  let score = 0;
  const matchReasons: string[] = [];
  const categoryMatches: string[] = [];

  // Check Google Places type matches
  const placeTypes = place.types || [];
  for (const placeType of placeTypes) {
    if (vibeMatch.googlePlacesTypes.includes(placeType)) {
      score += 0.3;
      matchReasons.push(`Type match: ${placeType}`);
    }
  }

  // Check name/description keyword matches
  const placeName = (place.name || '').toLowerCase();
  const placeVicinity = (place.vicinity || '').toLowerCase();
  
  for (const keyword of vibeMatch.keywords) {
    if (placeName.includes(keyword) || placeVicinity.includes(keyword)) {
      score += 0.2;
      matchReasons.push(`Keyword in name/vicinity: ${keyword}`);
    }
  }

  // Boost popular, well-rated places
  const rating = place.rating || 0;
  const ratingsTotal = place.userRatingsTotal || 0;
  
  if (rating >= 4.0 && ratingsTotal >= 100) {
    score += 0.2;
    matchReasons.push(`High quality (${rating}★, ${ratingsTotal} reviews)`);
  } else if (rating >= 3.5 && ratingsTotal >= 50) {
    score += 0.1;
    matchReasons.push(`Good quality (${rating}★, ${ratingsTotal} reviews)`);
  }

  // Boost tourist attractions and popular venues
  if (placeTypes.includes('tourist_attraction')) {
    score += 0.15;
    matchReasons.push('Tourist attraction (tried & tested)');
  }

  if (placeTypes.includes('establishment') && ratingsTotal >= 200) {
    score += 0.1;
    matchReasons.push('Well-established venue');
  }

  // Normalize score to 0-1 range
  score = Math.min(score, 1.0);

  return {
    placeId: place.placeId,
    vibeScore: score,
    matchReasons,
    categoryMatches
  };
}

/**
 * Batch score multiple places for a vibe
 */
export function scorePlacesForVibe(
  places: any[],
  vibe: string
): Array<any & { vibeScore: number; vibeReasons: string[] }> {
  
  console.log('🎯 Scoring', places.length, 'places for vibe matching...');
  
  // First, match the vibe to activities
  const vibeMatch = matchVibeToActivities(vibe);
  
  // Then score each place
  const scoredPlaces = places.map(place => {
    const vibeScore = scorePlaceForVibe(place, vibeMatch);
    
    return {
      ...place,
      vibeScore: vibeScore.vibeScore,
      vibeReasons: vibeScore.matchReasons,
      vibeCategories: vibeMatch.activityCategories
    };
  });

  // Sort by vibe score (highest first)
  scoredPlaces.sort((a, b) => b.vibeScore - a.vibeScore);

  console.log('✅ Vibe scoring complete. Top matches:');
  scoredPlaces.slice(0, 3).forEach((place, index) => {
    console.log(`   ${index + 1}. ${place.name} (${place.vibeScore.toFixed(2)}) - ${place.vibeReasons.join(', ')}`);
  });

  return scoredPlaces;
}

/**
 * Get vibe matching insights for debugging
 */
export function getVibeMatchingInsights(vibe: string, places: any[]) {
  const vibeMatch = matchVibeToActivities(vibe);
  const scoredPlaces = scorePlacesForVibe(places, vibe);
  
  const highScorePlaces = scoredPlaces.filter(p => p.vibeScore >= 0.5).length;
  const mediumScorePlaces = scoredPlaces.filter(p => p.vibeScore >= 0.3 && p.vibeScore < 0.5).length;
  const lowScorePlaces = scoredPlaces.filter(p => p.vibeScore < 0.3).length;

  return {
    vibeAnalysis: {
      matchedCategories: vibeMatch.activityCategories,
      confidence: vibeMatch.confidence,
      reasoning: vibeMatch.reasoning
    },
    scoreDistribution: {
      high: highScorePlaces,
      medium: mediumScorePlaces,
      low: lowScorePlaces,
      total: places.length
    },
    topMatches: scoredPlaces.slice(0, 5).map(p => ({
      name: p.name,
      score: p.vibeScore,
      reasons: p.vibeReasons
    }))
  };
}
