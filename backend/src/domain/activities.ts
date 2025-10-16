/**
 * Normalized Activities Domain Models
 * Provider-agnostic interfaces for activities, experiences, and events
 */

export type ActivityProviderId = 'viator' | 'getyourguide' | 'musement' | 'opentripmap' | 'eventbrite' | 'mock';

export type ActivityType = 
  | 'tour'           // Guided tours, walking tours
  | 'experience'     // Unique experiences, workshops
  | 'attraction'     // Museums, landmarks, monuments
  | 'outdoor'        // Hiking, cycling, water sports
  | 'cultural'       // Art galleries, theaters, concerts
  | 'food'           // Food tours, cooking classes
  | 'adventure'      // Extreme sports, adventure activities
  | 'entertainment'  // Shows, nightlife, events
  | 'transportation' // Airport transfers, city passes
  | 'event'          // Temporary events, festivals
  | 'poi';           // Points of interest

export type ActivityDuration = 
  | 'under_1h'       // Less than 1 hour
  | '1_3h'           // 1-3 hours
  | '3_6h'           // 3-6 hours (half day)
  | '6_12h'          // 6-12 hours (full day)
  | 'multi_day'      // Multiple days
  | 'flexible';      // Flexible duration

export type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'expert';

export type AgeGroup = 'all_ages' | 'adults_only' | 'family_friendly' | 'seniors' | 'children';

export interface ActivityLocation {
  city: string;
  country: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  meetingPoint?: string;
  landmarks?: string[];
}

export interface ActivityPricing {
  currency: string;
  basePrice: number;
  discountedPrice?: number;
  pricePerPerson?: boolean;
  groupDiscounts?: {
    minSize: number;
    discount: number; // percentage
  }[];
  cancellationPolicy?: {
    freeCancellation: boolean;
    cutoffHours?: number;
    refundPercentage?: number;
  };
}

export interface ActivityAvailability {
  available: boolean;
  nextAvailableDate?: string; // ISO date
  timeSlots?: {
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    available: boolean;
    spotsLeft?: number;
  }[];
  seasonality?: {
    startMonth: number; // 1-12
    endMonth: number;   // 1-12
  };
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
}

export interface ActivityReview {
  id: string;
  providerId: ActivityProviderId;
  rating: number; // 1-5
  title?: string;
  content: string;
  author: {
    name: string;
    location?: string;
    verified?: boolean;
  };
  date: string; // ISO date
  helpful?: number;
  language?: string;
  photos?: string[];
}

export interface ActivityMedia {
  photos: {
    url: string;
    caption?: string;
    isPrimary?: boolean;
    width?: number;
    height?: number;
  }[];
  videos?: {
    url: string;
    thumbnail?: string;
    duration?: number; // seconds
  }[];
  virtualTour?: string; // URL to virtual tour
}

export interface ActivityInclusions {
  included: string[];
  excluded: string[];
  requirements?: string[];
  recommendations?: string[];
  restrictions?: string[];
}

export interface ActivitySummary {
  // Core identification
  id: string;
  providerId: ActivityProviderId;
  providerActivityId: string;
  
  // Basic information
  title: string;
  shortDescription: string;
  type: ActivityType;
  duration: ActivityDuration;
  
  // Location
  location: ActivityLocation;
  
  // Pricing
  pricing: ActivityPricing;
  
  // Quality indicators
  rating?: number; // 1-5
  reviewCount?: number;
  popularity?: number; // 1-100
  
  // Media
  primaryImage?: string;
  imageCount?: number;
  
  // Availability
  instantConfirmation?: boolean;
  mobileTicket?: boolean;
  
  // Categories and tags
  categories: string[];
  tags: string[];
  
  // Accessibility
  wheelchairAccessible?: boolean;
  ageGroup?: AgeGroup;
  difficultyLevel?: DifficultyLevel;
  
  // Metadata
  lastUpdated: string; // ISO date
  featured?: boolean;
}

export interface ActivityDetails extends ActivitySummary {
  // Extended description
  fullDescription: string;
  highlights: string[];
  itinerary?: {
    step: number;
    title: string;
    description: string;
    duration?: string;
    location?: string;
  }[];
  
  // Complete media
  media: ActivityMedia;
  
  // Detailed availability
  availability: ActivityAvailability;
  
  // Inclusions and requirements
  inclusions: ActivityInclusions;
  
  // Booking information
  bookingInfo: {
    confirmationType: 'instant' | 'manual' | 'pending';
    leadTime?: number; // hours before activity
    groupSizeMin?: number;
    groupSizeMax?: number;
    languages?: string[];
  };
  
  // Provider-specific data
  providerData?: Record<string, any>;
}

export interface ActivitySearchFilters {
  // Location
  cityId?: string;
  coordinates?: {
    lat: number;
    lng: number;
    radius?: number; // km
  };
  
  // Activity characteristics
  types?: ActivityType[];
  categories?: string[];
  duration?: ActivityDuration[];
  difficultyLevel?: DifficultyLevel[];
  ageGroup?: AgeGroup[];
  
  // Pricing
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  
  // Availability
  dateFrom?: string; // ISO date
  dateTo?: string;   // ISO date
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  
  // Quality filters
  minRating?: number;
  minReviewCount?: number;
  instantConfirmation?: boolean;
  
  // Accessibility
  wheelchairAccessible?: boolean;
  
  // Sorting and pagination
  sortBy?: 'popularity' | 'rating' | 'price_low' | 'price_high' | 'duration' | 'distance';
  limit?: number;
  offset?: number;
}

export interface ActivitySearchResult {
  activities: ActivitySummary[];
  totalCount: number;
  hasMore: boolean;
  filters: ActivitySearchFilters;
  providerId: ActivityProviderId;
  searchId?: string; // For pagination
}

export interface ProviderCapabilities {
  providerId: ActivityProviderId;
  name: string;
  
  // Supported features
  features: {
    search: boolean;
    details: boolean;
    availability: boolean;
    reviews: boolean;
    booking?: boolean;
    realTimeAvailability?: boolean;
  };
  
  // Supported locations
  coverage: {
    global: boolean;
    countries?: string[]; // ISO country codes
    cities?: string[];
  };
  
  // Supported activity types
  supportedTypes: ActivityType[];
  
  // API characteristics
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay?: number;
  };
  
  // Data quality
  dataQuality: {
    averagePhotosPerActivity: number;
    reviewCoverage: number; // percentage
    realTimeData: boolean;
  };
}

export interface ProviderError {
  providerId: ActivityProviderId;
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: string;
}

// Utility types for provider responses
export interface ProviderResponse<T> {
  success: boolean;
  data?: T;
  error?: ProviderError;
  metadata?: {
    requestId?: string;
    processingTime?: number;
    cached?: boolean;
    quotaRemaining?: number;
  };
}

// Event-specific extensions (for Eventbrite)
export interface EventActivity extends ActivityDetails {
  eventSpecific: {
    startDateTime: string; // ISO datetime
    endDateTime: string;   // ISO datetime
    timezone: string;
    ticketTypes: {
      name: string;
      price: number;
      currency: string;
      available: boolean;
      salesEnd?: string; // ISO datetime
    }[];
    organizer: {
      name: string;
      description?: string;
      website?: string;
    };
    venue?: {
      name: string;
      address: string;
      capacity?: number;
    };
  };
}

// POI-specific extensions (for OpenTripMap)
export interface POIActivity extends ActivityDetails {
  poiSpecific: {
    wikidata?: string;
    wikipedia?: string;
    openingHours?: {
      [day: string]: string; // e.g., "monday": "09:00-17:00"
    };
    admissionFee?: {
      adult?: number;
      child?: number;
      senior?: number;
      currency: string;
    };
    historicalPeriod?: string;
    architecturalStyle?: string;
  };
}
