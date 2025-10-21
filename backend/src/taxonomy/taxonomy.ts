/**
 * Taxonomy Loader
 * 
 * Single source of truth for faceted tags
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Tag {
  facet: string;
  value: string;
}

export interface Taxonomy {
  version: string;
  facets: Record<string, string[]>;
  aliases: Record<string, string>;
}

let cachedTaxonomy: Taxonomy | null = null;

/**
 * Load taxonomy from JSON file (cached)
 */
export function loadTaxonomy(): Taxonomy {
  if (cachedTaxonomy) return cachedTaxonomy;
  
  const taxonomyPath = join(__dirname, '../../data/taxonomy.json');
  cachedTaxonomy = JSON.parse(readFileSync(taxonomyPath, 'utf-8'));
  return cachedTaxonomy!;
}

/**
 * Get all valid values for a facet
 */
export function getValidValues(facet: string): string[] {
  const taxonomy = loadTaxonomy();
  return taxonomy.facets[facet] || [];
}

/**
 * Get all facet names
 */
export function getAllFacets(): string[] {
  const taxonomy = loadTaxonomy();
  return Object.keys(taxonomy.facets);
}

/**
 * Check if a facet exists
 */
export function isValidFacet(facet: string): boolean {
  const taxonomy = loadTaxonomy();
  return facet in taxonomy.facets || facet === 'experimental';
}

/**
 * Check if a facet:value pair is valid
 */
export function isValidTag(facet: string, value: string): boolean {
  if (facet === 'experimental') return true; // Allow experimental tags
  
  const taxonomy = loadTaxonomy();
  const validValues = taxonomy.facets[facet];
  return validValues && validValues.includes(value);
}

/**
 * Parse faceted tag string (e.g., "experience_level:beginner")
 */
export function parseTag(tagString: string): Tag | null {
  const parts = tagString.split(':');
  if (parts.length !== 2) return null;
  
  const [facet, value] = parts;
  return { facet: facet.trim(), value: value.trim() };
}

/**
 * Format tag to string
 */
export function formatTag(tag: Tag): string {
  return `${tag.facet}:${tag.value}`;
}

/**
 * Resolve alias to full faceted tag
 */
export function resolveAlias(token: string): string {
  const taxonomy = loadTaxonomy();
  return taxonomy.aliases[token] || token;
}

/**
 * Get all tags for a facet (formatted strings)
 */
export function getTagsForFacet(facet: string): string[] {
  const values = getValidValues(facet);
  return values.map(v => `${facet}:${v}`);
}
