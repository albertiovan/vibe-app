/**
 * External Integrations Configuration
 * 
 * Feature flags and API keys for media and enrichment services
 */

export const features = {
  media: {
    youtube: process.env.ENABLE_YOUTUBE === 'true' || true
  },
  enrichment: {
    tavily: process.env.ENABLE_TAVILY === 'true' || true,
    wikipedia: process.env.ENABLE_WIKIPEDIA === 'true' || true
  }
};

export const getIntegrationKeys = () => ({
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '', // Use dedicated YouTube key or fallback to Google Maps key
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || ''
  // Wikipedia doesn't require API key
});

// For backward compatibility, but this will be evaluated at runtime
export const integrationKeys = getIntegrationKeys();

export const rateLimits = {
  youtube: {
    maxConcurrent: 2,
    timeoutMs: 6000,
    retryAttempts: 2
  },
  tavily: {
    maxConcurrent: 1,
    timeoutMs: 8000,
    retryAttempts: 2
  },
  wikipedia: {
    maxConcurrent: 2,
    timeoutMs: 5000,
    retryAttempts: 2
  }
};

export const cacheTTL = {
  youtube: 20 * 60 * 1000,  // 20 minutes
  tavily: 10 * 60 * 1000,   // 10 minutes
  wikipedia: 60 * 60 * 1000 // 60 minutes (more stable content)
};

/**
 * Validate integration configuration
 */
export function validateIntegrationConfig(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  const keys = getIntegrationKeys();
  
  if (features.media.youtube && !keys.YOUTUBE_API_KEY) {
    missing.push('YOUTUBE_API_KEY (Google Maps API key)');
  }

  if (features.enrichment.tavily && !keys.TAVILY_API_KEY) {
    missing.push('TAVILY_API_KEY');
  }

  if (!features.media.youtube) {
    warnings.push('YouTube service disabled - tutorial videos unavailable');
  }

  if (!features.enrichment.wikipedia && !features.enrichment.tavily) {
    warnings.push('No enrichment services enabled - activity context may be limited');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

export default {
  features,
  integrationKeys,
  rateLimits,
  cacheTTL,
  validateIntegrationConfig
};
