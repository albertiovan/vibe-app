/**
 * Tag Validator
 * 
 * Validates tags against taxonomy and provides helpful error messages
 */

import { Tag, isValidTag, parseTag, formatTag, resolveAlias } from './taxonomy.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  validated: Tag[];
}

/**
 * Validate a list of faceted tags
 */
export function validateTags(tags: Tag[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const validated: Tag[] = [];
  
  for (const tag of tags) {
    // Check facet and value format
    if (!tag.facet || !tag.value) {
      errors.push(`Invalid tag format: ${JSON.stringify(tag)}`);
      continue;
    }
    
    // Validate against taxonomy
    if (!isValidTag(tag.facet, tag.value)) {
      if (tag.facet === 'experimental') {
        warnings.push(`Experimental tag: ${formatTag(tag)}`);
        validated.push(tag);
      } else {
        errors.push(`Invalid tag: ${formatTag(tag)} (facet "${tag.facet}" or value "${tag.value}" not in taxonomy)`);
      }
    } else {
      validated.push(tag);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validated
  };
}

/**
 * Validate tag strings (e.g., ["experience_level:beginner"])
 */
export function validateTagStrings(tagStrings: string[]): ValidationResult {
  const tags: Tag[] = [];
  const errors: string[] = [];
  
  for (const str of tagStrings) {
    const tag = parseTag(str);
    if (!tag) {
      errors.push(`Invalid tag format: "${str}" (expected "facet:value")`);
    } else {
      tags.push(tag);
    }
  }
  
  if (errors.length > 0) {
    return { valid: false, errors, warnings: [], validated: [] };
  }
  
  return validateTags(tags);
}

/**
 * Check for required tags on an activity
 */
export function validateActivityTags(tags: Tag[]): ValidationResult {
  const result = validateTags(tags);
  
  // Check for required facets
  const requiredFacets = [
    'category',
    'experience_level',
    'energy',
    'indoor_outdoor',
    'seasonality'
  ];
  
  const presentFacets = new Set(tags.map(t => t.facet));
  const missing = requiredFacets.filter(f => !presentFacets.has(f));
  
  if (missing.length > 0) {
    result.warnings.push(`Missing recommended facets: ${missing.join(', ')}`);
  }
  
  return result;
}

/**
 * Check for required tags on a venue
 */
export function validateVenueTags(tags: Tag[]): ValidationResult {
  const result = validateTags(tags);
  
  // Check for recommended facets
  const recommendedFacets = ['cost_band', 'context'];
  const presentFacets = new Set(tags.map(t => t.facet));
  const missing = recommendedFacets.filter(f => !presentFacets.has(f));
  
  if (missing.length > 0) {
    result.warnings.push(`Missing recommended facets: ${missing.join(', ')}`);
  }
  
  return result;
}
