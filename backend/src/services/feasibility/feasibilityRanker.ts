/**
 * Feasibility Ranker
 * 
 * Ranks experiences based on real-world feasibility and success rates
 * using Google Places reviews, ratings, and user behavior data.
 */

export interface FeasibilityMetrics {
  popularityScore: number; // 0-1 based on user ratings total
  qualityScore: number; // 0-1 based on rating
  accessibilityScore: number; // 0-1 based on location and transport
  reliabilityScore: number; // 0-1 based on consistent reviews
  overallFeasibility: number; // 0-1 combined score
  reasoning: string[];
}

export interface FeasibilityCandidate {
  placeId: string;
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  types: string[];
  vicinity?: string;
  priceLevel?: number;
  location: {
    lat: number;
    lng: number;
  };
  bucket: string;
  vibeScore?: number;
}

/**
 * Calculate feasibility score for a place based on real-world data
 */
export function calculateFeasibilityScore(place: FeasibilityCandidate): FeasibilityMetrics {
  const reasoning: string[] = [];
  
  // 1. Popularity Score (based on number of reviews)
  const ratingsTotal = place.userRatingsTotal || 0;
  let popularityScore = 0;
  
  if (ratingsTotal >= 1000) {
    popularityScore = 1.0;
    reasoning.push(`Very popular (${ratingsTotal} reviews)`);
  } else if (ratingsTotal >= 500) {
    popularityScore = 0.8;
    reasoning.push(`Popular (${ratingsTotal} reviews)`);
  } else if (ratingsTotal >= 100) {
    popularityScore = 0.6;
    reasoning.push(`Moderately popular (${ratingsTotal} reviews)`);
  } else if (ratingsTotal >= 20) {
    popularityScore = 0.4;
    reasoning.push(`Some reviews (${ratingsTotal} reviews)`);
  } else {
    popularityScore = 0.2;
    reasoning.push(`Limited reviews (${ratingsTotal} reviews)`);
  }

  // 2. Quality Score (based on rating)
  const rating = place.rating || 0;
  let qualityScore = 0;
  
  if (rating >= 4.5) {
    qualityScore = 1.0;
    reasoning.push(`Excellent rating (${rating}★)`);
  } else if (rating >= 4.0) {
    qualityScore = 0.8;
    reasoning.push(`Good rating (${rating}★)`);
  } else if (rating >= 3.5) {
    qualityScore = 0.6;
    reasoning.push(`Average rating (${rating}★)`);
  } else if (rating >= 3.0) {
    qualityScore = 0.4;
    reasoning.push(`Below average rating (${rating}★)`);
  } else {
    qualityScore = 0.2;
    reasoning.push(`Poor rating (${rating}★)`);
  }

  // 3. Accessibility Score (based on location and type)
  let accessibilityScore = 0.7; // Default moderate accessibility
  
  // Check if it's in a major city (easier to access)
  const vicinity = place.vicinity?.toLowerCase() || '';
  if (vicinity.includes('bucharest') || vicinity.includes('bucurești')) {
    accessibilityScore = 0.9;
    reasoning.push('Located in Bucharest (easily accessible)');
  } else if (vicinity.includes('brașov') || vicinity.includes('constanța') || vicinity.includes('cluj')) {
    accessibilityScore = 0.8;
    reasoning.push('Located in major city (good accessibility)');
  } else {
    accessibilityScore = 0.6;
    reasoning.push('Regional location (moderate accessibility)');
  }

  // Adjust for place type accessibility
  const types = place.types || [];
  if (types.includes('tourist_attraction') || types.includes('museum') || types.includes('park')) {
    accessibilityScore = Math.min(accessibilityScore + 0.1, 1.0);
    reasoning.push('Tourist-friendly venue type');
  }

  // 4. Reliability Score (combination of rating consistency and review volume)
  let reliabilityScore = 0;
  
  if (ratingsTotal >= 100 && rating >= 4.0) {
    reliabilityScore = 1.0;
    reasoning.push('Consistently highly rated with many reviews');
  } else if (ratingsTotal >= 50 && rating >= 3.8) {
    reliabilityScore = 0.8;
    reasoning.push('Reliable with good track record');
  } else if (ratingsTotal >= 20 && rating >= 3.5) {
    reliabilityScore = 0.6;
    reasoning.push('Moderately reliable');
  } else if (ratingsTotal >= 10) {
    reliabilityScore = 0.4;
    reasoning.push('Limited reliability data');
  } else {
    reliabilityScore = 0.2;
    reasoning.push('Insufficient reliability data');
  }

  // 5. Calculate overall feasibility (weighted average)
  const weights = {
    popularity: 0.3,
    quality: 0.3,
    accessibility: 0.2,
    reliability: 0.2
  };

  const overallFeasibility = 
    popularityScore * weights.popularity +
    qualityScore * weights.quality +
    accessibilityScore * weights.accessibility +
    reliabilityScore * weights.reliability;

  return {
    popularityScore,
    qualityScore,
    accessibilityScore,
    reliabilityScore,
    overallFeasibility,
    reasoning
  };
}

/**
 * Rank places by feasibility, prioritizing tried and tested experiences
 */
export function rankByFeasibility(places: FeasibilityCandidate[]): Array<FeasibilityCandidate & { feasibility: FeasibilityMetrics }> {
  console.log('🎯 Ranking', places.length, 'places by feasibility...');

  const rankedPlaces = places.map(place => ({
    ...place,
    feasibility: calculateFeasibilityScore(place)
  }));

  // Sort by overall feasibility score (highest first)
  rankedPlaces.sort((a, b) => b.feasibility.overallFeasibility - a.feasibility.overallFeasibility);

  // Log top results for debugging
  console.log('🏆 Top 5 most feasible places:');
  rankedPlaces.slice(0, 5).forEach((place, index) => {
    console.log(`   ${index + 1}. ${place.name} (${place.feasibility.overallFeasibility.toFixed(2)})`);
    console.log(`      ${place.feasibility.reasoning.join(', ')}`);
  });

  return rankedPlaces;
}

/**
 * Filter out places that don't meet minimum feasibility standards
 */
export function filterByMinimumFeasibility(
  places: Array<FeasibilityCandidate & { feasibility: FeasibilityMetrics }>,
  minScore: number = 0.3
): Array<FeasibilityCandidate & { feasibility: FeasibilityMetrics }> {
  
  const filtered = places.filter(place => place.feasibility.overallFeasibility >= minScore);
  
  console.log(`🔍 Filtered ${places.length} → ${filtered.length} places (min feasibility: ${minScore})`);
  
  return filtered;
}

/**
 * Get feasibility insights for debugging
 */
export function getFeasibilityInsights(places: Array<FeasibilityCandidate & { feasibility: FeasibilityMetrics }>) {
  const totalPlaces = places.length;
  const highFeasibility = places.filter(p => p.feasibility.overallFeasibility >= 0.7).length;
  const mediumFeasibility = places.filter(p => p.feasibility.overallFeasibility >= 0.4 && p.feasibility.overallFeasibility < 0.7).length;
  const lowFeasibility = places.filter(p => p.feasibility.overallFeasibility < 0.4).length;

  const avgRating = places.reduce((sum, p) => sum + (p.rating || 0), 0) / totalPlaces;
  const avgReviews = places.reduce((sum, p) => sum + (p.userRatingsTotal || 0), 0) / totalPlaces;

  return {
    totalPlaces,
    distribution: {
      high: highFeasibility,
      medium: mediumFeasibility,
      low: lowFeasibility
    },
    averages: {
      rating: avgRating.toFixed(1),
      reviews: Math.round(avgReviews)
    }
  };
}

/**
 * Boost places that are particularly well-suited for specific vibes
 */
export function applyVibeSpecificBoosts(
  places: Array<FeasibilityCandidate & { feasibility: FeasibilityMetrics }>,
  vibe: string
): Array<FeasibilityCandidate & { feasibility: FeasibilityMetrics }> {
  
  const vibeKeywords = vibe.toLowerCase();
  
  return places.map(place => {
    let boost = 0;
    const boostReasons: string[] = [];
    
    // Adventure vibes - boost outdoor and active places
    if (vibeKeywords.includes('adventure') || vibeKeywords.includes('outdoor') || vibeKeywords.includes('active')) {
      if (place.types.includes('amusement_park') || place.types.includes('park') || place.types.includes('zoo')) {
        boost += 0.1;
        boostReasons.push('Perfect for adventure seekers');
      }
    }
    
    // Culture vibes - boost museums and cultural sites
    if (vibeKeywords.includes('culture') || vibeKeywords.includes('museum') || vibeKeywords.includes('history')) {
      if (place.types.includes('museum') || place.types.includes('art_gallery') || place.types.includes('tourist_attraction')) {
        boost += 0.1;
        boostReasons.push('Ideal for cultural exploration');
      }
    }
    
    // Social vibes - boost cafes and social venues
    if (vibeKeywords.includes('social') || vibeKeywords.includes('coffee') || vibeKeywords.includes('meet')) {
      if (place.types.includes('cafe') || place.types.includes('restaurant') || place.types.includes('bar')) {
        boost += 0.1;
        boostReasons.push('Great for socializing');
      }
    }
    
    // Nature vibes - boost parks and natural areas
    if (vibeKeywords.includes('nature') || vibeKeywords.includes('peaceful') || vibeKeywords.includes('green')) {
      if (place.types.includes('park') || place.types.includes('natural_feature')) {
        boost += 0.1;
        boostReasons.push('Perfect nature experience');
      }
    }

    if (boost > 0) {
      const newFeasibility = {
        ...place.feasibility,
        overallFeasibility: Math.min(place.feasibility.overallFeasibility + boost, 1.0),
        reasoning: [...place.feasibility.reasoning, ...boostReasons]
      };
      
      return {
        ...place,
        feasibility: newFeasibility
      };
    }
    
    return place;
  });
}
