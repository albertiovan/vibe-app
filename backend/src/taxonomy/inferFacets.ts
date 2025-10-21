/**
 * Facet Inference
 * 
 * Auto-converts legacy tags to faceted tags using heuristics
 */

import { Tag, getAllFacets, getValidValues, resolveAlias, parseTag } from './taxonomy.js';

/**
 * Infer facet for a raw tag value
 */
export function inferFacet(value: string): Tag | null {
  // First, try alias resolution
  const resolved = resolveAlias(value);
  if (resolved.includes(':')) {
    const parsed = parseTag(resolved);
    if (parsed) return parsed;
  }
  
  // Check each facet to see if value exists
  const facets = getAllFacets();
  for (const facet of facets) {
    const validValues = getValidValues(facet);
    if (validValues.includes(value)) {
      return { facet, value };
    }
  }
  
  // Special handling for common patterns
  if (value.includes('-gear') || value.includes('helmet') || value.includes('harness')) {
    return { facet: 'equipment', value };
  }
  
  if (value.includes('guide') || value.includes('booking') || value.includes('lesson')) {
    return { facet: 'requirement', value };
  }
  
  if (value.includes('family') || value.includes('kids') || value.includes('solo') || value.includes('group')) {
    return { facet: 'context', value };
  }
  
  // Default to experimental
  return { facet: 'experimental', value };
}

/**
 * Convert legacy tag array to faceted tags
 */
export function facetLegacyTags(legacyTags: string[]): Tag[] {
  const faceted: Tag[] = [];
  const seen = new Set<string>();
  
  for (const tag of legacyTags) {
    // Try parsing as faceted tag first
    const parsed = parseTag(tag);
    if (parsed) {
      const key = `${parsed.facet}:${parsed.value}`;
      if (!seen.has(key)) {
        faceted.push(parsed);
        seen.add(key);
      }
      continue;
    }
    
    // Infer facet
    const inferred = inferFacet(tag);
    if (inferred) {
      const key = `${inferred.facet}:${inferred.value}`;
      if (!seen.has(key)) {
        faceted.push(inferred);
        seen.add(key);
      }
    }
  }
  
  return faceted;
}

/**
 * Lint legacy tags and provide suggestions
 */
export function lintLegacyTags(legacyTags: string[]): {
  tags: Tag[];
  ambiguous: string[];
  suggestions: Record<string, string[]>;
} {
  const tags: Tag[] = [];
  const ambiguous: string[] = [];
  const suggestions: Record<string, string[]> = {};
  
  for (const tag of legacyTags) {
    const inferred = inferFacet(tag);
    
    if (inferred) {
      tags.push(inferred);
      
      // Check if it's experimental
      if (inferred.facet === 'experimental') {
        ambiguous.push(tag);
        suggestions[tag] = findSimilarTags(tag);
      }
    }
  }
  
  return { tags, ambiguous, suggestions };
}

/**
 * Find similar tags in taxonomy
 */
function findSimilarTags(value: string): string[] {
  const similar: string[] = [];
  const valueLower = value.toLowerCase();
  
  const facets = getAllFacets();
  for (const facet of facets) {
    const validValues = getValidValues(facet);
    for (const v of validValues) {
      if (v.includes(valueLower) || valueLower.includes(v)) {
        similar.push(`${facet}:${v}`);
      }
    }
  }
  
  return similar.slice(0, 5); // Top 5 suggestions
}
