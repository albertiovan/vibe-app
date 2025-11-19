/**
 * Activity Name Simplifier
 * Extracts generic activity names from location-specific titles
 * Example: "Skiing in Poiana Brașov" → "Skiing"
 */

export const simplifyActivityName = (fullName: string): string => {
  // Remove common location patterns
  const patterns = [
    / in .+$/i,           // "Activity in Location"
    / at .+$/i,           // "Activity at Venue"
    / near .+$/i,         // "Activity near Location"
    / \(.+\)$/,           // "Activity (Location)"
    / - .+$/,             // "Activity - Location"
    / from .+$/i,         // "Activity from Location"
    / on .+$/i,           // "Activity on Location"
    / \(.+Area\)$/i,      // "Activity (Area)"
    / \(.+Region\)$/i,    // "Activity (Region)"
  ];

  let simplified = fullName.trim();

  // Apply each pattern
  for (const pattern of patterns) {
    simplified = simplified.replace(pattern, '').trim();
  }

  // Remove trailing punctuation
  simplified = simplified.replace(/[,:;-]+$/, '').trim();

  // If we removed too much (less than 2 words), return original
  const wordCount = simplified.split(/\s+/).length;
  if (wordCount < 2 && fullName.split(/\s+/).length > 2) {
    // Try to keep at least the first 2-3 meaningful words
    const words = fullName.split(/\s+/);
    simplified = words.slice(0, Math.min(3, words.length)).join(' ');
  }

  // Capitalize first letter
  simplified = simplified.charAt(0).toUpperCase() + simplified.slice(1);

  return simplified || fullName; // Fallback to original if empty
};

/**
 * Get category-based generic name
 * Maps specific activities to their generic category names
 */
export const getCategoryGenericName = (name: string, category?: string): string => {
  const categoryMap: Record<string, string> = {
    // Wellness
    'therme': 'Thermal Spa',
    'spa': 'Spa Day',
    'sauna': 'Sauna Session',
    'wellness': 'Wellness Experience',
    
    // Culture
    'castle': 'Castle Visit',
    'museum': 'Museum Tour',
    'monastery': 'Monastery Visit',
    'church': 'Church Visit',
    'walking tour': 'Walking Tour',
    
    // Nature
    'hike': 'Hiking',
    'hiking': 'Hiking',
    'trail': 'Nature Trail',
    'park': 'Park Visit',
    'delta': 'Wildlife Safari',
    'bear watching': 'Wildlife Watching',
    
    // Adventure
    'skiing': 'Skiing',
    'zipline': 'Zipline Adventure',
    'climbing': 'Climbing',
    'paragliding': 'Paragliding',
    'rafting': 'Rafting',
    'skydiving': 'Skydiving',
    'go-kart': 'Go-Karting',
    'karting': 'Go-Karting',
    'via ferrata': 'Via Ferrata',
    'ropes course': 'Ropes Course',
    'high ropes': 'Ropes Course',
    'orienteering': 'Orienteering',
    
    // Nightlife
    'club': 'Club Night',
    'bar': 'Bar Hopping',
    'pub': 'Pub Night',
    'cocktail': 'Cocktails',
    'rooftop': 'Rooftop Lounge',
    
    // Culinary
    'wine tasting': 'Wine Tasting',
    'food tour': 'Food Tour',
    'cooking class': 'Cooking Class',
    'restaurant': 'Dining Experience',
    
    // Sports
    'yoga': 'Yoga Class',
    'crossfit': 'CrossFit',
    'golf': 'Golf',
    'football': 'Football',
    'tennis': 'Tennis',
    
    // Water
    'kayaking': 'Kayaking',
    'sailing': 'Sailing',
    'swimming': 'Swimming',
    'diving': 'Diving',
    
    // Social
    'escape room': 'Escape Room',
    'board game': 'Board Games',
    'karaoke': 'Karaoke',
    'bowling': 'Bowling',
    
    // Creative
    'art': 'Art Class',
    'pottery': 'Pottery',
    'painting': 'Painting',
    'photography': 'Photography',
    'dance': 'Dance Class',
  };

  const lowerName = name.toLowerCase();
  
  // Check if any keyword matches (use word boundaries to avoid partial matches)
  for (const [keyword, genericName] of Object.entries(categoryMap)) {
    // Create regex with word boundaries to match whole words only
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(lowerName)) {
      return genericName;
    }
  }

  // Fallback to simplified name
  return simplifyActivityName(name);
};

/**
 * Smart simplification that combines both approaches
 * Keeps location names for differentiation when multiple similar activities exist
 */
export const getSmartSimplifiedName = (
  fullName: string,
  category?: string
): string => {
  const lowerName = fullName.toLowerCase();
  
  // For adventure parks, ziplines, and ropes courses - keep location for differentiation
  if (lowerName.includes('adventure park') || 
      (lowerName.includes('zipline') && lowerName.includes('rope')) ||
      lowerName.includes('ropes course')) {
    
    // Extract location name (usually before "Adventure Park" or at start)
    const locationMatch = fullName.match(/^([A-Z][a-zăâîșț]+(?:\s+[A-Z][a-zăâîșț]+)?)/);
    const location = locationMatch ? locationMatch[1] : '';
    
    if (lowerName.includes('zipline') && lowerName.includes('rope')) {
      return location ? `${location} Zipline & Ropes` : 'Zipline & Ropes';
    }
    if (lowerName.includes('adventure park')) {
      return location ? `${location} Adventure Park` : 'Adventure Park';
    }
  }
  
  // For specific activities with locations, keep some context
  if (lowerName.includes('via ferrata')) {
    const locationMatch = fullName.match(/Via Ferrata\s+([A-Z][a-zăâîșț\s]+?)(?:\s*–|\s*-|$)/i);
    return locationMatch ? `Via Ferrata ${locationMatch[1].trim()}` : 'Via Ferrata';
  }
  
  // First try category-based generic name
  const categoryName = getCategoryGenericName(fullName, category);
  
  // If it's different from the full name, use it
  if (categoryName !== fullName) {
    return categoryName;
  }
  
  // Otherwise use pattern-based simplification
  return simplifyActivityName(fullName);
};
