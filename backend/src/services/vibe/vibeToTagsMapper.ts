/**
 * Vibe-to-Tags Mapper
 * 
 * Maps natural language vibe expressions to faceted PostgreSQL tags
 * Replaces old ontology-based vibe detection with taxonomy-based mapping
 */

import { Tag } from '../../taxonomy/taxonomy.js';

export interface VibeTagMapping {
  tags: Tag[];
  confidence: number;
  method: 'keyword' | 'pattern';
  detected: string[];
}

/**
 * Core vibe patterns mapped to tags
 * Multilingual support (English & Romanian)
 */
const VIBE_PATTERNS: Record<string, Tag[]> = {
  // Mood-based vibes
  'adventure|adventurous|aventura|aventuros': [
    { facet: 'mood', value: 'adrenaline' },
    { facet: 'mood', value: 'adventurous' },
    { facet: 'energy', value: 'high' }
  ],
  'adrenaline|thrill|exciting|incitant': [
    { facet: 'mood', value: 'adrenaline' },
    { facet: 'energy', value: 'high' }
  ],
  'relax|relaxing|chill|cozy|relaxant|confortabil': [
    { facet: 'mood', value: 'cozy' },
    { facet: 'energy', value: 'chill' }
  ],
  'romantic|romance|date|romantic': [
    { facet: 'mood', value: 'romantic' },
    { facet: 'context', value: 'date' }
  ],
  'social|friends|group|socializare|prieteni|grup': [
    { facet: 'mood', value: 'social' },
    { facet: 'context', value: 'group' }
  ],
  'mindful|meditation|zen|mindfulness|meditatie': [
    { facet: 'mood', value: 'mindful' },
    { facet: 'energy', value: 'chill' }
  ],
  'creative|artistic|art|creativ|artistic|arta': [
    { facet: 'mood', value: 'creative' },
    { facet: 'category', value: 'creative' }
  ],
  'explore|explorer|discover|explorare|descoperire': [
    { facet: 'mood', value: 'explorer' },
    { facet: 'mood', value: 'adventurous' }
  ],

  // Environment
  'outdoor|outside|nature|exterior|natura': [
    { facet: 'indoor_outdoor', value: 'outdoor' },
    { facet: 'terrain', value: 'forest' }
  ],
  'indoor|inside|interior': [
    { facet: 'indoor_outdoor', value: 'indoor' }
  ],
  'mountain|mountains|munte|munti': [
    { facet: 'terrain', value: 'mountain' },
    { facet: 'indoor_outdoor', value: 'outdoor' }
  ],
  'coast|beach|sea|ocean|litoral|plaja|mare': [
    { facet: 'terrain', value: 'coast' },
    { facet: 'category', value: 'water' }
  ],
  'forest|woods|padure': [
    { facet: 'terrain', value: 'forest' },
    { facet: 'indoor_outdoor', value: 'outdoor' }
  ],
  'city|urban|town|oras': [
    { facet: 'terrain', value: 'urban' }
  ],
  'lake|river|lac|rau': [
    { facet: 'terrain', value: 'lake' },
    { facet: 'category', value: 'water' }
  ],

  // Experience level
  'beginner|easy|first.time|incepator|usor|prima.data': [
    { facet: 'experience_level', value: 'beginner' }
  ],
  'intermediate|medium|intermediar|mediu': [
    { facet: 'experience_level', value: 'intermediate' }
  ],
  'advanced|expert|avansat|expert': [
    { facet: 'experience_level', value: 'advanced' }
  ],

  // Season
  'winter|snow|ski|iarna|zapada': [
    { facet: 'seasonality', value: 'winter' },
    { facet: 'weather_fit', value: 'cold_friendly' }
  ],
  'summer|hot|beach|vara|cald': [
    { facet: 'seasonality', value: 'summer' }
  ],
  'spring|fall|autumn|primavara|toamna': [
    { facet: 'seasonality', value: 'shoulder' }
  ],

  // Context
  'family|kids|familie|copii': [
    { facet: 'context', value: 'family' },
    { facet: 'context', value: 'kids' }
  ],
  'solo|alone|singur': [
    { facet: 'context', value: 'solo' }
  ],
  'group|team|grup|echipa': [
    { facet: 'context', value: 'group' }
  ],

  // Activities
  'water|swim|kayak|apa|inot': [
    { facet: 'category', value: 'water' }
  ],
  'wellness|spa|sauna|wellness': [
    { facet: 'category', value: 'wellness' }
  ],
  'culture|museum|history|cultura|muzeu|istorie': [
    { facet: 'category', value: 'culture' }
  ],
  'sports|fitness|exercise|sport|miscare': [
    { facet: 'category', value: 'sports' },
    { facet: 'energy', value: 'high' }
  ],
  'food|culinary|wine|restaurant|mancare|culinar|vin|restaurant': [
    { facet: 'category', value: 'culinary' }
  ],
  'nightlife|party|club|viata.de.noapte|petrecere': [
    { facet: 'category', value: 'nightlife' }
  ],
  'learning|workshop|class|invata|curs': [
    { facet: 'category', value: 'learning' }
  ]
};

/**
 * Map natural language vibe to PostgreSQL tags
 */
export function mapVibeToTags(vibeText: string): VibeTagMapping {
  const normalizedText = vibeText.toLowerCase().trim();
  const detectedPatterns: string[] = [];
  const tags: Tag[] = [];
  const seenTags = new Set<string>();

  // Match patterns
  for (const [pattern, patternTags] of Object.entries(VIBE_PATTERNS)) {
    const regex = new RegExp(pattern.split('|').join('|'), 'i');
    if (regex.test(normalizedText)) {
      detectedPatterns.push(pattern.split('|')[0]);
      
      // Add unique tags
      patternTags.forEach(tag => {
        const key = `${tag.facet}:${tag.value}`;
        if (!seenTags.has(key)) {
          tags.push(tag);
          seenTags.add(key);
        }
      });
    }
  }

  // Calculate confidence based on matches
  const confidence = detectedPatterns.length > 0 
    ? Math.min(95, 50 + (detectedPatterns.length * 15)) 
    : 0;

  return {
    tags,
    confidence,
    method: 'keyword',
    detected: detectedPatterns
  };
}

/**
 * Extract region/city filters from vibe text
 */
export function extractLocationFilters(vibeText: string): {
  region?: string;
  city?: string;
} {
  const text = vibeText.toLowerCase();
  
  // Romanian regions
  const regionMap: Record<string, string> = {
    'bucuresti|bucharest': 'București',
    'brasov|brașov': 'Brașov',
    'cluj|cluj-napoca': 'Cluj',
    'timisoara|timișoara': 'Timiș',
    'iasi|iași': 'Iași',
    'constanta|constanța': 'Constanța',
    'sibiu': 'Sibiu',
    'oradea': 'Bihor',
    'craiova': 'Dolj',
    'galati|galați': 'Galați'
  };

  for (const [pattern, region] of Object.entries(regionMap)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(text)) {
      return { region };
    }
  }

  return {};
}

/**
 * Build complete tag filter from vibe text
 */
export function buildTagFilterFromVibe(vibeText: string): {
  tags: Tag[];
  location?: { region?: string; city?: string };
  confidence: number;
} {
  const tagMapping = mapVibeToTags(vibeText);
  const location = extractLocationFilters(vibeText);

  return {
    tags: tagMapping.tags,
    location: Object.keys(location).length > 0 ? location : undefined,
    confidence: tagMapping.confidence
  };
}
