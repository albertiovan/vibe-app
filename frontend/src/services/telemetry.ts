/**
 * Telemetry Service
 * Logs weather gating, fallback triggers, and user interactions (no PII)
 */

export type TelemetryEvent = 
  | 'search_initiated'
  | 'search_completed'
  | 'search_failed'
  | 'weather_gating_applied'
  | 'fallback_triggered'
  | 'constraints_relaxed'
  | 'card_clicked'
  | 'drill_down_viewed'
  | 'retry_relaxed_initiated'
  | 'retry_relaxed_completed'
  | 'retry_relaxed_failed'
  | 'location_detected'
  | 'location_fallback'
  | 'weather_data_retrieved'
  | 'weather_data_failed'
  | 'llm_parsing_success'
  | 'llm_parsing_fallback'
  | 'llm_curation_success'
  | 'llm_curation_fallback'
  | 'provider_search_success'
  | 'provider_search_failed';

export interface TelemetryData {
  [key: string]: any;
}

interface TelemetryEntry {
  event: TelemetryEvent;
  data: TelemetryData;
  timestamp: string;
  sessionId: string;
  userAgent?: string;
  viewport?: string;
}

/**
 * Session ID for grouping related events
 */
let sessionId: string;

/**
 * Initialize session
 */
function initializeSession(): string {
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
}

/**
 * Log telemetry event (dev environment only, no PII)
 */
export function logTelemetry(event: TelemetryEvent, data: TelemetryData = {}): void {
  // Only log in development environment
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const entry: TelemetryEntry = {
    event,
    data: sanitizeData(data),
    timestamp: new Date().toISOString(),
    sessionId: initializeSession(),
    userAgent: navigator.userAgent.slice(0, 50), // Truncated
    viewport: `${window.innerWidth}x${window.innerHeight}`
  };

  // Console logging for development
  console.log('📊 Telemetry:', entry);

  // Store in session storage for debugging
  try {
    const existing = JSON.parse(sessionStorage.getItem('telemetry_log') || '[]');
    existing.push(entry);
    
    // Keep only last 100 entries
    const trimmed = existing.slice(-100);
    sessionStorage.setItem('telemetry_log', JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Failed to store telemetry:', error);
  }

  // In production, this would send to analytics service
  // sendToAnalytics(entry);
}

/**
 * Sanitize data to remove PII and sensitive information
 */
function sanitizeData(data: TelemetryData): TelemetryData {
  const sanitized: TelemetryData = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip sensitive fields
    if (isSensitiveField(key)) {
      continue;
    }

    // Sanitize string values
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(key, value);
    }
    // Sanitize arrays
    else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(key, item) : item
      );
    }
    // Keep other types as-is (numbers, booleans, objects)
    else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Check if field contains sensitive information
 */
function isSensitiveField(fieldName: string): boolean {
  const sensitiveFields = [
    'email',
    'phone',
    'address',
    'fullAddress',
    'personalInfo',
    'userId',
    'deviceId',
    'ipAddress',
    'coordinates', // Exact coordinates are PII
    'lat',
    'lng'
  ];

  return sensitiveFields.some(field => 
    fieldName.toLowerCase().includes(field.toLowerCase())
  );
}

/**
 * Sanitize string values based on context
 */
function sanitizeString(fieldName: string, value: string): string {
  const field = fieldName.toLowerCase();

  // Query sanitization - keep first 50 chars only
  if (field.includes('query') || field.includes('search')) {
    return value.slice(0, 50);
  }

  // Location sanitization - city/country only
  if (field.includes('location') || field.includes('address')) {
    // Extract only city/country if possible
    const parts = value.split(',');
    if (parts.length >= 2) {
      return `${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`;
    }
    return 'location_provided';
  }

  // Title/name sanitization - first 30 chars
  if (field.includes('title') || field.includes('name')) {
    return value.slice(0, 30);
  }

  // Error message sanitization - remove stack traces
  if (field.includes('error')) {
    return value.split('\n')[0].slice(0, 100);
  }

  // Default: truncate long strings
  return value.length > 100 ? value.slice(0, 100) + '...' : value;
}

/**
 * Log weather gating event
 */
export function logWeatherGating(data: {
  originalCount: number;
  filteredCount: number;
  weatherConditions: string;
  recommendation: string;
}): void {
  logTelemetry('weather_gating_applied', {
    originalCount: data.originalCount,
    filteredCount: data.filteredCount,
    reductionPercent: Math.round(((data.originalCount - data.filteredCount) / data.originalCount) * 100),
    weatherConditions: data.weatherConditions,
    recommendation: data.recommendation,
    effectiveness: data.filteredCount > 0 ? 'successful' : 'too_restrictive'
  });
}

/**
 * Log fallback trigger event
 */
export function logFallbackTrigger(data: {
  fallbackType: string;
  reason: string;
  originalAttempt?: string;
  fallbackResult?: string;
}): void {
  logTelemetry('fallback_triggered', {
    fallbackType: data.fallbackType,
    reason: data.reason.slice(0, 100), // Truncate reason
    originalAttempt: data.originalAttempt?.slice(0, 50),
    fallbackResult: data.fallbackResult?.slice(0, 50),
    timestamp: new Date().toISOString()
  });
}

/**
 * Log constraint relaxation event
 */
export function logConstraintRelaxation(data: {
  step: string;
  originalConstraints: any;
  newConstraints: any;
  resultImprovement: number;
}): void {
  logTelemetry('constraints_relaxed', {
    step: data.step,
    radiusChange: data.newConstraints.radiusKm - data.originalConstraints.radiusKm,
    ratingChange: data.originalConstraints.minRating - data.newConstraints.minRating,
    timeChange: data.newConstraints.maxTravelMinutes - data.originalConstraints.maxTravelMinutes,
    resultImprovement: data.resultImprovement,
    effectiveness: data.resultImprovement > 0 ? 'successful' : 'ineffective'
  });
}

/**
 * Get telemetry summary for debugging
 */
export function getTelemetrySummary(): {
  totalEvents: number;
  eventCounts: Record<string, number>;
  sessionDuration: number;
  recentEvents: TelemetryEntry[];
} {
  try {
    const log = JSON.parse(sessionStorage.getItem('telemetry_log') || '[]');
    const eventCounts: Record<string, number> = {};
    
    log.forEach((entry: TelemetryEntry) => {
      eventCounts[entry.event] = (eventCounts[entry.event] || 0) + 1;
    });

    const sessionStart = log.length > 0 ? new Date(log[0].timestamp).getTime() : Date.now();
    const sessionDuration = Date.now() - sessionStart;

    return {
      totalEvents: log.length,
      eventCounts,
      sessionDuration,
      recentEvents: log.slice(-10) // Last 10 events
    };
  } catch (error) {
    console.warn('Failed to get telemetry summary:', error);
    return {
      totalEvents: 0,
      eventCounts: {},
      sessionDuration: 0,
      recentEvents: []
    };
  }
}

/**
 * Clear telemetry data
 */
export function clearTelemetry(): void {
  try {
    sessionStorage.removeItem('telemetry_log');
    sessionId = '';
    console.log('📊 Telemetry data cleared');
  } catch (error) {
    console.warn('Failed to clear telemetry:', error);
  }
}

/**
 * Export telemetry data for debugging
 */
export function exportTelemetryData(): string {
  try {
    const log = JSON.parse(sessionStorage.getItem('telemetry_log') || '[]');
    const summary = getTelemetrySummary();
    
    return JSON.stringify({
      summary,
      events: log
    }, null, 2);
  } catch (error) {
    console.warn('Failed to export telemetry:', error);
    return '{}';
  }
}

// Initialize session on module load
initializeSession();
