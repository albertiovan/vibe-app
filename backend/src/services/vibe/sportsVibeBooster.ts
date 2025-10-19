/**
 * Sports Vibe Booster
 * 
 * Specifically handles sports-related vibes to ensure gyms and sports facilities
 * are prioritized over generic entertainment venues.
 */

export interface SportsVibeResult {
  isSportsVibe: boolean;
  sportsKeywords: string[];
  priorityTypes: string[];
  boostScore: number;
}

/**
 * Detect if a vibe is sports-related and boost accordingly
 */
export function detectAndBoostSportsVibe(vibe: string): SportsVibeResult {
  const vibeText = vibe.toLowerCase();
  
  // Sports detection keywords
  const sportsKeywords = [
    'sport', 'sports', 'gym', 'fitness', 'workout', 'exercise', 'training',
    'tennis', 'basketball', 'football', 'soccer', 'volleyball', 'swimming',
    'martial arts', 'karate', 'judo', 'boxing', 'mma', 'kickboxing',
    'yoga', 'pilates', 'dance', 'dancing', 'athletic', 'physical activity'
  ];

  const foundKeywords = sportsKeywords.filter(keyword => vibeText.includes(keyword));
  const isSportsVibe = foundKeywords.length > 0;

  // Priority Google Places types for sports
  const priorityTypes = [
    'gym',
    'health', 
    'physiotherapist',
    'stadium',
    'bowling_alley',
    'spa' // For yoga/wellness sports
  ];

  // Calculate boost score based on keyword matches
  let boostScore = 0;
  if (foundKeywords.includes('sport') || foundKeywords.includes('sports')) {
    boostScore = 1.0; // Maximum boost for explicit sports mention
  } else if (foundKeywords.includes('gym') || foundKeywords.includes('fitness')) {
    boostScore = 0.9; // High boost for gym/fitness
  } else if (foundKeywords.some(k => ['tennis', 'basketball', 'football', 'swimming'].includes(k))) {
    boostScore = 0.8; // High boost for specific sports
  } else if (foundKeywords.some(k => ['yoga', 'pilates', 'dance'].includes(k))) {
    boostScore = 0.7; // Medium boost for wellness sports
  } else if (foundKeywords.length > 0) {
    boostScore = 0.6; // Some boost for other sports keywords
  }

  return {
    isSportsVibe,
    sportsKeywords: foundKeywords,
    priorityTypes,
    boostScore
  };
}

/**
 * Boost sports venues in search results
 */
export function boostSportsVenues(places: any[], vibe: string): any[] {
  const sportsDetection = detectAndBoostSportsVibe(vibe);
  
  if (!sportsDetection.isSportsVibe) {
    return places; // No sports vibe detected, return as-is
  }

  console.log('🏃‍♂️ Sports vibe detected:', {
    keywords: sportsDetection.sportsKeywords,
    boostScore: sportsDetection.boostScore
  });

  // Boost places that match sports criteria
  const boostedPlaces = places.map(place => {
    const types = place.types || [];
    const name = place.name?.toLowerCase() || '';
    
    let sportsRelevance = 0;
    
    // Check for direct sports venue types
    if (types.includes('gym')) {
      sportsRelevance = 1.0;
    } else if (types.includes('health') || types.includes('physiotherapist')) {
      sportsRelevance = 0.8;
    } else if (types.includes('stadium') || types.includes('bowling_alley')) {
      sportsRelevance = 0.7;
    } else if (types.includes('spa') && (vibe.includes('yoga') || vibe.includes('pilates'))) {
      sportsRelevance = 0.6;
    }
    
    // Check for sports keywords in name
    const sportsNameKeywords = ['gym', 'fitness', 'sport', 'club', 'arena', 'court'];
    const hasNameMatch = sportsNameKeywords.some(keyword => name.includes(keyword));
    if (hasNameMatch) {
      sportsRelevance = Math.max(sportsRelevance, 0.8);
    }

    // Apply boost to vibe score
    let boostedVibeScore = place.vibeScore || 0.5;
    if (sportsRelevance > 0) {
      boostedVibeScore = Math.min(boostedVibeScore + (sportsRelevance * sportsDetection.boostScore), 1.0);
      
      console.log(`   🏋️‍♂️ Boosted ${place.name}: ${place.vibeScore?.toFixed(2)} → ${boostedVibeScore.toFixed(2)}`);
    }

    return {
      ...place,
      vibeScore: boostedVibeScore,
      sportsRelevance,
      wasBoosted: sportsRelevance > 0
    };
  });

  // Sort by boosted vibe score
  boostedPlaces.sort((a, b) => (b.vibeScore || 0) - (a.vibeScore || 0));

  const boostedCount = boostedPlaces.filter(p => p.wasBoosted).length;
  console.log(`✅ Sports boost applied: ${boostedCount}/${places.length} venues boosted`);

  return boostedPlaces;
}

/**
 * Ensure sports venues appear in top results
 */
export function ensureSportsInTopFive(places: any[], vibe: string): any[] {
  const sportsDetection = detectAndBoostSportsVibe(vibe);
  
  if (!sportsDetection.isSportsVibe) {
    return places;
  }

  // Find all sports venues
  const sportsVenues = places.filter(place => {
    const types = place.types || [];
    const name = place.name?.toLowerCase() || '';
    
    return types.includes('gym') || 
           types.includes('health') ||
           types.includes('stadium') ||
           name.includes('gym') ||
           name.includes('fitness') ||
           name.includes('sport');
  });

  // Find non-sports venues
  const nonSportsVenues = places.filter(place => !sportsVenues.includes(place));

  console.log(`🎯 Sports venue distribution: ${sportsVenues.length} sports, ${nonSportsVenues.length} non-sports`);

  // Ensure at least 3 sports venues in top 5 for sports vibes
  const targetSportsCount = Math.min(3, sportsVenues.length);
  const topSports = sportsVenues.slice(0, targetSportsCount);
  const remainingSlots = 5 - topSports.length;
  const topNonSports = nonSportsVenues.slice(0, remainingSlots);

  const reorderedTop5 = [...topSports, ...topNonSports];
  const remaining = places.slice(5);

  console.log(`✅ Reordered for sports: ${topSports.length} sports venues in top 5`);

  return [...reorderedTop5, ...remaining];
}
