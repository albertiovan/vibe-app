/**
 * Google Maps URL Generator
 * 
 * Creates "Open in Google Maps" links from coordinates or addresses
 */

export interface LocationInput {
  lat?: number | null;
  lng?: number | null;
  lon?: number | null; // Alias for lng
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  name?: string | null;
}

/**
 * Build Google Maps URL from location data
 * 
 * Priority:
 * 1. Coordinates (lat/lng)
 * 2. Address
 * 3. Name (as fallback search)
 */
export function buildMapsUrl(location: LocationInput): string | null {
  // Normalize coordinate fields
  const lat = location.lat ?? location.latitude;
  const lng = location.lng ?? location.lon ?? location.longitude;
  
  // Priority 1: Coordinates
  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  
  // Priority 2: Address
  if (location.address && location.address.trim()) {
    const query = encodeURIComponent(location.address.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
  
  // Priority 3: Name as search query
  if (location.name && location.name.trim()) {
    const query = encodeURIComponent(location.name.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
  
  return null;
}

/**
 * Build directions URL to a location
 */
export function buildDirectionsUrl(
  destination: LocationInput,
  origin?: LocationInput
): string | null {
  const destUrl = buildMapsUrl(destination);
  if (!destUrl) return null;
  
  if (!origin) {
    // From current location
    return destUrl.replace('/maps?q=', '/maps/dir/Current+Location/');
  }
  
  const originUrl = buildMapsUrl(origin);
  if (!originUrl) return destUrl;
  
  // Extract coordinates or queries
  const destCoords = extractCoordinates(destination);
  const originCoords = extractCoordinates(origin);
  
  if (destCoords && originCoords) {
    return `https://www.google.com/maps/dir/${originCoords}/${destCoords}`;
  }
  
  return destUrl;
}

/**
 * Extract coordinate string for URLs
 */
function extractCoordinates(location: LocationInput): string | null {
  const lat = location.lat ?? location.latitude;
  const lng = location.lng ?? location.lon ?? location.longitude;
  
  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
    return `${lat},${lng}`;
  }
  
  if (location.address) {
    return encodeURIComponent(location.address);
  }
  
  return null;
}

/**
 * Validate coordinates
 */
export function isValidCoordinate(lat?: number | null, lng?: number | null): boolean {
  if (lat == null || lng == null) return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}
