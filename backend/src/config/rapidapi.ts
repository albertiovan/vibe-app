/**
 * RapidAPI TripAdvisor Configuration
 * Validates and exports environment variables for RapidAPI integration
 */

export interface RapidApiConfig {
  apiKey: string;
  tripAdvisorHost: string;
  tripAdvisorBaseUrl: string;
  timeout: number;
  isEnabled: boolean;
  defaultCity: string;
  defaultLocationId: string;
}

/**
 * Validates and loads RapidAPI configuration from environment variables
 * Fails fast if required variables are missing in production
 */
function loadRapidApiConfig(): RapidApiConfig {
  const apiKey = process.env.RAPIDAPI_KEY;
  const tripAdvisorHost = process.env.TRIPADVISOR_RAPIDAPI_HOST || 'tripadvisor16.p.rapidapi.com';
  const tripAdvisorBaseUrl = process.env.TRIPADVISOR_BASE_URL || 'https://tripadvisor16.p.rapidapi.com';
  const defaultCity = process.env.DEFAULT_CITY || 'Bucharest, Romania';
  const defaultLocationId = process.env.DEFAULT_LOCATION_ID || '294458';

  // In production, fail fast if API key is missing
  if (process.env.NODE_ENV === 'production' && !apiKey) {
    throw new Error('RAPIDAPI_KEY is required in production environment');
  }
  
  // In development, warn but continue without API key
  const isEnabled = Boolean(apiKey);
  if (!isEnabled && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  RAPIDAPI_KEY not configured - TripAdvisor API will not work');
  }
  
  return {
    apiKey: apiKey || '',
    tripAdvisorHost,
    tripAdvisorBaseUrl,
    timeout: 8000, // 8 second timeout
    isEnabled,
    defaultCity,
    defaultLocationId,
  };
}

export const rapidApiConfig = loadRapidApiConfig();

// Log configuration status on startup
if (rapidApiConfig.isEnabled) {
  console.log('✅ RapidAPI TripAdvisor configured:', {
    host: rapidApiConfig.tripAdvisorHost,
    baseUrl: rapidApiConfig.tripAdvisorBaseUrl,
    timeout: rapidApiConfig.timeout,
    defaultCity: rapidApiConfig.defaultCity,
    defaultLocationId: rapidApiConfig.defaultLocationId
  });
} else {
  console.log('❌ RapidAPI TripAdvisor not configured (missing RAPIDAPI_KEY)');
}
