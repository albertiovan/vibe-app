/**
 * Activities Provider Configuration
 * Configuration for different activity providers (Viator, GetYourGuide, etc.)
 */

import { ActivityProviderId } from '../domain/activities.js';
import { ProviderConfig } from '../interfaces/ActivitiesProvider.js';

export interface ProvidersConfig {
  // Primary provider selection
  primaryProvider: ActivityProviderId;
  
  // Fallback provider order
  fallbackProviders: ActivityProviderId[];
  
  // Individual provider configurations
  providers: Record<ActivityProviderId, ProviderConfig>;
  
  // Global settings
  global: {
    timeout: number; // milliseconds
    retryAttempts: number;
    cacheEnabled: boolean;
    defaultCurrency: string;
    defaultLanguage: string;
  };
}

/**
 * Load provider configuration from environment variables
 */
function loadProvidersConfig(): ProvidersConfig {
  // Determine primary provider from environment
  const primaryProvider = (process.env.ACTIVITIES_PROVIDER as ActivityProviderId) || 'mock';
  
  return {
    primaryProvider,
    
    // Fallback order: try primary, then mock as last resort
    fallbackProviders: primaryProvider !== 'mock' ? ['mock'] : [],
    
    global: {
      timeout: parseInt(process.env.PROVIDER_TIMEOUT || '10000'),
      retryAttempts: parseInt(process.env.PROVIDER_RETRY_ATTEMPTS || '2'),
      cacheEnabled: process.env.PROVIDER_CACHE_ENABLED !== 'false',
      defaultCurrency: process.env.DEFAULT_CURRENCY || 'EUR',
      defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en'
    },
    
    providers: {
      // Mock provider (always available for development/testing)
      mock: {
        providerId: 'mock',
        enabled: true,
        priority: 1,
        timeout: 1000,
        cache: {
          searchTTL: 300,    // 5 minutes
          detailsTTL: 3600,  // 1 hour
          reviewsTTL: 7200   // 2 hours
        },
        features: {
          search: true,
          details: true,
          availability: true,
          reviews: true,
          booking: false
        }
      },
      
      // Viator (TripAdvisor Experiences)
      viator: {
        providerId: 'viator',
        enabled: Boolean(process.env.VIATOR_API_KEY),
        priority: 10,
        apiKey: process.env.VIATOR_API_KEY,
        baseUrl: process.env.VIATOR_BASE_URL || 'https://api.viator.com',
        timeout: parseInt(process.env.VIATOR_TIMEOUT || '15000'),
        rateLimit: {
          requestsPerMinute: parseInt(process.env.VIATOR_RATE_LIMIT || '60'),
          requestsPerDay: parseInt(process.env.VIATOR_DAILY_LIMIT || '10000')
        },
        cache: {
          searchTTL: 1800,   // 30 minutes
          detailsTTL: 7200,  // 2 hours
          reviewsTTL: 14400  // 4 hours
        },
        features: {
          search: true,
          details: true,
          availability: true,
          reviews: true,
          booking: Boolean(process.env.VIATOR_BOOKING_ENABLED)
        },
        providerSpecific: {
          partnerId: process.env.VIATOR_PARTNER_ID,
          currency: process.env.VIATOR_CURRENCY || 'USD',
          language: process.env.VIATOR_LANGUAGE || 'en'
        }
      },
      
      // GetYourGuide
      getyourguide: {
        providerId: 'getyourguide',
        enabled: Boolean(process.env.GYG_API_KEY),
        priority: 9,
        apiKey: process.env.GYG_API_KEY,
        baseUrl: process.env.GYG_BASE_URL || 'https://api.getyourguide.com',
        timeout: parseInt(process.env.GYG_TIMEOUT || '12000'),
        rateLimit: {
          requestsPerMinute: parseInt(process.env.GYG_RATE_LIMIT || '100'),
          requestsPerDay: parseInt(process.env.GYG_DAILY_LIMIT || '5000')
        },
        cache: {
          searchTTL: 1800,   // 30 minutes
          detailsTTL: 7200,  // 2 hours
          reviewsTTL: 14400  // 4 hours
        },
        features: {
          search: true,
          details: true,
          availability: true,
          reviews: true,
          booking: Boolean(process.env.GYG_BOOKING_ENABLED)
        },
        providerSpecific: {
          partnerId: process.env.GYG_PARTNER_ID,
          currency: process.env.GYG_CURRENCY || 'EUR',
          language: process.env.GYG_LANGUAGE || 'en'
        }
      },
      
      // Musement
      musement: {
        providerId: 'musement',
        enabled: Boolean(process.env.MUSEMENT_API_KEY),
        priority: 8,
        apiKey: process.env.MUSEMENT_API_KEY,
        baseUrl: process.env.MUSEMENT_BASE_URL || 'https://api.musement.com',
        timeout: parseInt(process.env.MUSEMENT_TIMEOUT || '10000'),
        rateLimit: {
          requestsPerMinute: parseInt(process.env.MUSEMENT_RATE_LIMIT || '120'),
          requestsPerDay: parseInt(process.env.MUSEMENT_DAILY_LIMIT || '8000')
        },
        cache: {
          searchTTL: 1800,   // 30 minutes
          detailsTTL: 7200,  // 2 hours
          reviewsTTL: 14400  // 4 hours
        },
        features: {
          search: true,
          details: true,
          availability: true,
          reviews: true,
          booking: Boolean(process.env.MUSEMENT_BOOKING_ENABLED)
        },
        providerSpecific: {
          currency: process.env.MUSEMENT_CURRENCY || 'EUR',
          language: process.env.MUSEMENT_LANGUAGE || 'en'
        }
      },
      
      // OpenTripMap (POIs)
      opentripmap: {
        providerId: 'opentripmap',
        enabled: Boolean(process.env.OPENTRIPMAP_API_KEY),
        priority: 5,
        apiKey: process.env.OPENTRIPMAP_API_KEY,
        baseUrl: process.env.OPENTRIPMAP_BASE_URL || 'https://api.opentripmap.com',
        timeout: parseInt(process.env.OPENTRIPMAP_TIMEOUT || '8000'),
        rateLimit: {
          requestsPerMinute: parseInt(process.env.OPENTRIPMAP_RATE_LIMIT || '200'),
          requestsPerDay: parseInt(process.env.OPENTRIPMAP_DAILY_LIMIT || '20000')
        },
        cache: {
          searchTTL: 3600,   // 1 hour (POIs change less frequently)
          detailsTTL: 14400, // 4 hours
          reviewsTTL: 28800  // 8 hours
        },
        features: {
          search: true,
          details: true,
          availability: false, // POIs don't have availability
          reviews: false,      // OpenTripMap doesn't provide reviews
          booking: false
        },
        providerSpecific: {
          language: process.env.OPENTRIPMAP_LANGUAGE || 'en',
          radius: parseInt(process.env.OPENTRIPMAP_RADIUS || '10000'), // meters
          kinds: process.env.OPENTRIPMAP_KINDS || 'interesting_places'
        }
      },
      
      // Eventbrite (Events)
      eventbrite: {
        providerId: 'eventbrite',
        enabled: Boolean(process.env.EVENTBRITE_API_KEY),
        priority: 6,
        apiKey: process.env.EVENTBRITE_API_KEY,
        baseUrl: process.env.EVENTBRITE_BASE_URL || 'https://www.eventbriteapi.com',
        timeout: parseInt(process.env.EVENTBRITE_TIMEOUT || '10000'),
        rateLimit: {
          requestsPerMinute: parseInt(process.env.EVENTBRITE_RATE_LIMIT || '1000'),
          requestsPerDay: parseInt(process.env.EVENTBRITE_DAILY_LIMIT || '50000')
        },
        cache: {
          searchTTL: 900,    // 15 minutes (events change frequently)
          detailsTTL: 1800,  // 30 minutes
          reviewsTTL: 7200   // 2 hours
        },
        features: {
          search: true,
          details: true,
          availability: true,  // Event tickets availability
          reviews: false,      // Eventbrite doesn't provide reviews
          booking: Boolean(process.env.EVENTBRITE_BOOKING_ENABLED)
        },
        providerSpecific: {
          organizerId: process.env.EVENTBRITE_ORGANIZER_ID,
          currency: process.env.EVENTBRITE_CURRENCY || 'USD',
          categories: process.env.EVENTBRITE_CATEGORIES || 'music,arts,business'
        }
      }
    }
  };
}

export const providersConfig = loadProvidersConfig();

// Log provider configuration on startup
console.log('🔌 Provider Configuration:', {
  primary: providersConfig.primaryProvider,
  fallbacks: providersConfig.fallbackProviders,
  enabled: Object.entries(providersConfig.providers)
    .filter(([_, config]) => config.enabled)
    .map(([id, config]) => `${id}(${config.priority})`)
    .join(', ') || 'none'
});

/**
 * Get configuration for a specific provider
 */
export function getProviderConfig(providerId: ActivityProviderId): ProviderConfig | null {
  return providersConfig.providers[providerId] || null;
}

/**
 * Get all enabled providers sorted by priority
 */
export function getEnabledProviders(): ProviderConfig[] {
  return Object.values(providersConfig.providers)
    .filter(config => config.enabled)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Check if a provider is enabled and configured
 */
export function isProviderEnabled(providerId: ActivityProviderId): boolean {
  const config = getProviderConfig(providerId);
  return config?.enabled || false;
}

/**
 * Get the best provider for a specific feature
 */
export function getBestProviderForFeature(feature: keyof NonNullable<ProviderConfig['features']>): ActivityProviderId | null {
  const enabledProviders = getEnabledProviders();
  
  for (const provider of enabledProviders) {
    if (provider.features?.[feature]) {
      return provider.providerId;
    }
  }
  
  return null;
}

/**
 * Get providers that support a specific feature
 */
export function getProvidersWithFeature(feature: keyof NonNullable<ProviderConfig['features']>): ActivityProviderId[] {
  return getEnabledProviders()
    .filter(provider => provider.features?.[feature])
    .map(provider => provider.providerId);
}
