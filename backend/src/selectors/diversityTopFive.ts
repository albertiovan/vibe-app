/**
 * Diversity Top-5 Selector
 * 
 * Enforces bucket/subtype diversity to prevent repetitive results.
 * Guarantees 5 distinct activity ideas per query.
 */

export interface DiversityCandidate {
  id: string;
  name: string;
  bucket: string;
  subtype?: string;
  score: number;
  region?: string;
  [key: string]: any;
}

export interface DiversityResult {
  selected: DiversityCandidate[];
  diversityStats: {
    totalCandidates: number;
    uniqueBuckets: number;
    uniqueSubtypes: number;
    diversityScore: number; // 0-1, higher = more diverse
  };
}

/**
 * Pick diverse top 5 results enforcing bucket and subtype diversity
 */
export function pickDiverseFive(candidates: DiversityCandidate[]): DiversityResult {
  if (candidates.length === 0) {
    return {
      selected: [],
      diversityStats: {
        totalCandidates: 0,
        uniqueBuckets: 0,
        uniqueSubtypes: 0,
        diversityScore: 0
      }
    };
  }

  // Sort by score (highest first)
  const sortedCandidates = [...candidates].sort((a, b) => b.score - a.score);
  
  const result: DiversityCandidate[] = [];
  const usedBuckets = new Set<string>();
  const usedSubtypes = new Set<string>();
  
  console.log('🎯 Diversity selection from', candidates.length, 'candidates');

  // Phase 1: Select one from each unique bucket (priority)
  for (const candidate of sortedCandidates) {
    if (result.length >= 5) break;
    
    if (!usedBuckets.has(candidate.bucket)) {
      result.push(candidate);
      usedBuckets.add(candidate.bucket);
      if (candidate.subtype) {
        usedSubtypes.add(candidate.subtype);
      }
      
      console.log(`   ✅ Bucket diversity: ${candidate.bucket} - ${candidate.name} (score: ${candidate.score.toFixed(2)})`);
    }
  }

  // Phase 2: Fill remaining slots with unique subtypes
  if (result.length < 5) {
    for (const candidate of sortedCandidates) {
      if (result.length >= 5) break;
      
      // Skip if already selected
      if (result.some(r => r.id === candidate.id)) continue;
      
      // Prefer unique subtypes
      if (candidate.subtype && !usedSubtypes.has(candidate.subtype)) {
        result.push(candidate);
        usedSubtypes.add(candidate.subtype);
        
        console.log(`   ✅ Subtype diversity: ${candidate.subtype} - ${candidate.name} (score: ${candidate.score.toFixed(2)})`);
      }
    }
  }

  // Phase 3: Fill remaining slots with highest scoring (if still < 5)
  if (result.length < 5) {
    for (const candidate of sortedCandidates) {
      if (result.length >= 5) break;
      
      // Skip if already selected
      if (result.some(r => r.id === candidate.id)) continue;
      
      result.push(candidate);
      console.log(`   ✅ Score fill: ${candidate.bucket} - ${candidate.name} (score: ${candidate.score.toFixed(2)})`);
    }
  }

  // Calculate diversity metrics
  const finalBuckets = new Set(result.map(r => r.bucket));
  const finalSubtypes = new Set(result.map(r => r.subtype).filter(Boolean));
  const diversityScore = Math.min(
    finalBuckets.size / Math.min(5, candidates.length),
    1.0
  );

  const stats = {
    totalCandidates: candidates.length,
    uniqueBuckets: finalBuckets.size,
    uniqueSubtypes: finalSubtypes.size,
    diversityScore
  };

  console.log('🎯 Diversity results:', {
    selected: result.length,
    buckets: stats.uniqueBuckets,
    subtypes: stats.uniqueSubtypes,
    score: stats.diversityScore.toFixed(2)
  });

  return {
    selected: result.slice(0, 5), // Ensure exactly 5
    diversityStats: stats
  };
}

/**
 * Enhanced diversity selector with regional distribution
 */
export function pickDiverseFiveWithRegions(candidates: DiversityCandidate[]): DiversityResult {
  if (candidates.length === 0) {
    return pickDiverseFive(candidates);
  }

  // Group by region for better distribution
  const regionGroups = new Map<string, DiversityCandidate[]>();
  
  candidates.forEach(candidate => {
    const region = candidate.region || 'Unknown';
    if (!regionGroups.has(region)) {
      regionGroups.set(region, []);
    }
    regionGroups.get(region)!.push(candidate);
  });

  console.log('🗺️  Regional distribution:', 
    Array.from(regionGroups.entries()).map(([region, items]) => 
      `${region}: ${items.length}`
    ).join(', ')
  );

  // If we have multiple regions, try to include at least one from each major region
  if (regionGroups.size > 1) {
    const result: DiversityCandidate[] = [];
    const usedBuckets = new Set<string>();
    const usedRegions = new Set<string>();
    
    // Sort regions by candidate count (prioritize regions with more options)
    const sortedRegions = Array.from(regionGroups.entries())
      .sort(([, a], [, b]) => b.length - a.length);

    // Phase 1: One high-scoring candidate from each region (up to 3 regions)
    for (const [region, regionCandidates] of sortedRegions.slice(0, 3)) {
      if (result.length >= 5) break;
      
      const bestInRegion = regionCandidates
        .filter(c => !usedBuckets.has(c.bucket))
        .sort((a, b) => b.score - a.score)[0];
      
      if (bestInRegion) {
        result.push(bestInRegion);
        usedBuckets.add(bestInRegion.bucket);
        usedRegions.add(region);
        
        console.log(`   🗺️  Regional pick: ${region} - ${bestInRegion.name}`);
      }
    }

    // Phase 2: Fill remaining with standard diversity logic
    const remaining = candidates.filter(c => !result.some(r => r.id === c.id));
    const remainingResult = pickDiverseFive([...result, ...remaining]);
    
    return {
      selected: remainingResult.selected,
      diversityStats: {
        ...remainingResult.diversityStats,
        // Add regional diversity info
        uniqueRegions: usedRegions.size
      } as any
    };
  }

  // Single region - use standard diversity
  return pickDiverseFive(candidates);
}

/**
 * Validate diversity requirements for QA
 */
export function validateDiversity(
  results: DiversityCandidate[],
  requirements: {
    minBuckets?: number;
    minSubtypes?: number;
    minRegions?: number;
    exactCount?: number;
  } = {}
): {
  isValid: boolean;
  violations: string[];
  metrics: {
    buckets: number;
    subtypes: number;
    regions: number;
    count: number;
  };
} {
  const violations: string[] = [];
  
  const buckets = new Set(results.map(r => r.bucket));
  const subtypes = new Set(results.map(r => r.subtype).filter(Boolean));
  const regions = new Set(results.map(r => r.region).filter(Boolean));
  
  const metrics = {
    buckets: buckets.size,
    subtypes: subtypes.size,
    regions: regions.size,
    count: results.length
  };

  if (requirements.exactCount && results.length !== requirements.exactCount) {
    violations.push(`Expected exactly ${requirements.exactCount} results, got ${results.length}`);
  }

  if (requirements.minBuckets && buckets.size < requirements.minBuckets) {
    violations.push(`Expected at least ${requirements.minBuckets} unique buckets, got ${buckets.size}`);
  }

  if (requirements.minSubtypes && subtypes.size < requirements.minSubtypes) {
    violations.push(`Expected at least ${requirements.minSubtypes} unique subtypes, got ${subtypes.size}`);
  }

  if (requirements.minRegions && regions.size < requirements.minRegions) {
    violations.push(`Expected at least ${requirements.minRegions} unique regions, got ${regions.size}`);
  }

  return {
    isValid: violations.length === 0,
    violations,
    metrics
  };
}
