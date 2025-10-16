/**
 * RapidAPI HTTP Client
 * Typed client for making requests to RapidAPI endpoints with proper headers and error handling
 */

import { rapidApiConfig } from '../config/rapidapi.js';

// Base types for RapidAPI responses
export interface RapidApiResponse<T = any> {
  data?: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface RapidApiError {
  status: number;
  code: string;
  message: string;
  details?: any;
}

// TripAdvisor specific types
export interface TripAdvisorLocation {
  location_id: string;
  name: string;
  address_obj?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalcode?: string;
    address_string?: string;
  };
  latitude?: string;
  longitude?: string;
  timezone?: string;
  phone?: string;
  website?: string;
  email?: string;
}

export interface TripAdvisorSearchResponse {
  data: TripAdvisorLocation[];
  status: boolean;
}

export interface TripAdvisorPingResponse {
  ok: boolean;
  provider: string;
  timestamp: string;
  quotaHeaders?: Record<string, string>;
  sampleData?: any;
}

/**
 * RapidAPI HTTP Client Class
 */
export class RapidApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor() {
    if (!rapidApiConfig.isEnabled) {
      throw new Error('RapidAPI client cannot be initialized: missing RAPIDAPI_KEY');
    }

    this.baseUrl = rapidApiConfig.tripAdvisorBaseUrl;
    this.timeout = rapidApiConfig.timeout;
    this.defaultHeaders = {
      'X-RapidAPI-Key': rapidApiConfig.apiKey,
      'X-RapidAPI-Host': rapidApiConfig.tripAdvisorHost,
      'Content-Type': 'application/json',
      'User-Agent': 'Vibe-App/1.0.0',
    };

    // Log client initialization (non-production only)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔌 RapidAPI Client initialized:', {
        baseUrl: this.baseUrl,
        host: rapidApiConfig.tripAdvisorHost,
        timeout: this.timeout,
      });
    }
  }

  /**
   * Make a GET request to RapidAPI endpoint
   */
  async get<T = any>(endpoint: string, params?: Record<string, string>): Promise<RapidApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl);
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return this.request<T>('GET', url.toString());
  }

  /**
   * Make a POST request to RapidAPI endpoint
   */
  async post<T = any>(endpoint: string, body?: any): Promise<RapidApiResponse<T>> {
    const url = new URL(endpoint, this.baseUrl).toString();
    return this.request<T>('POST', url, body);
  }

  /**
   * Core request method with error handling and logging
   */
  private async request<T>(
    method: string,
    url: string,
    body?: any
  ): Promise<RapidApiResponse<T>> {
    const startTime = Date.now();
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const requestOptions: RequestInit = {
        method,
        headers: this.defaultHeaders,
        signal: controller.signal,
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        requestOptions.body = JSON.stringify(body);
      }

      // Log request (development only)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📡 RapidAPI ${method} ${url}`);
      }

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;
      
      // Extract quota headers for monitoring
      const quotaHeaders: Record<string, string> = {};
      ['x-ratelimit-requests-limit', 'x-ratelimit-requests-remaining', 'x-ratelimit-requests-reset'].forEach(header => {
        const value = response.headers.get(header);
        if (value) quotaHeaders[header] = value;
      });

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json() as T;
      } else {
        data = await response.text() as T;
      }

      // Log response (development only)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ RapidAPI ${method} ${response.status} (${duration}ms)`, {
          quotaHeaders,
          dataLength: typeof data === 'string' ? data.length : JSON.stringify(data).length,
        });
      }

      // Monitor quota and rate limits
      this.monitorQuotaUsage(quotaHeaders);

      if (!response.ok) {
        throw this.createError(response.status, response.statusText, data);
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = this.createError(408, 'Request Timeout', {
          message: `Request timed out after ${this.timeout}ms`,
          duration,
        });
        console.error('⏰ RapidAPI Request Timeout:', timeoutError);
        throw timeoutError;
      }

      if (error instanceof Error) {
        const networkError = this.createError(0, 'Network Error', {
          message: error.message,
          duration,
        });
        console.error('🌐 RapidAPI Network Error:', networkError);
        throw networkError;
      }

      throw error;
    }
  }

  /**
   * Create standardized error object
   */
  private createError(status: number, statusText: string, details?: any): RapidApiError {
    return {
      status,
      code: statusText.toUpperCase().replace(/\s+/g, '_'),
      message: `RapidAPI Error: ${statusText}`,
      details,
    };
  }

  /**
   * Monitor quota usage and send alerts when thresholds are reached
   */
  public monitorQuotaUsage(quotaHeaders: Record<string, string>): void {
    try {
      // Extract quota information - handle different header formats
      const monthlyRemaining = parseInt(
        quotaHeaders['x-ratelimit-rapid-free-plans-hard-limit-remaining'] || 
        quotaHeaders['x-rapidapi-requests-remaining'] || 
        '0'
      );
      const monthlyLimit = parseInt(
        quotaHeaders['x-ratelimit-rapid-free-plans-hard-limit-limit'] || 
        quotaHeaders['x-rapidapi-requests-limit'] || 
        '0'
      );
      const rateRemaining = parseInt(quotaHeaders['x-ratelimit-requests-remaining'] || '0');
      const rateLimit = parseInt(quotaHeaders['x-ratelimit-requests-limit'] || '0');

      // Debug logging to see what headers we're getting
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 Quota headers received:', quotaHeaders);
        console.log('📊 Parsed values:', {
          monthlyRemaining,
          monthlyLimit,
          rateRemaining,
          rateLimit
        });
      }

      // Calculate usage percentages
      const monthlyUsagePercent = monthlyLimit > 0 ? ((monthlyLimit - monthlyRemaining) / monthlyLimit) * 100 : 0;
      const rateUsagePercent = rateLimit > 0 ? ((rateLimit - rateRemaining) / rateLimit) * 100 : 0;

      // Update last quota status for health checks
      this.lastQuotaStatus = {
        monthly: {
          remaining: monthlyRemaining,
          limit: monthlyLimit,
          usagePercent: monthlyUsagePercent
        },
        rate: {
          remaining: rateRemaining,
          limit: rateLimit,
          usagePercent: rateUsagePercent
        },
        timestamp: new Date().toISOString()
      };

      // Monthly quota alerts
      if (monthlyRemaining <= 1000 && monthlyRemaining > 0) {
        this.sendQuotaAlert('CRITICAL', 'Monthly quota critically low', {
          remaining: monthlyRemaining,
          limit: monthlyLimit,
          usagePercent: monthlyUsagePercent.toFixed(1)
        });
      } else if (monthlyRemaining <= 10000 && monthlyRemaining > 1000) {
        this.sendQuotaAlert('WARNING', 'Monthly quota running low', {
          remaining: monthlyRemaining,
          limit: monthlyLimit,
          usagePercent: monthlyUsagePercent.toFixed(1)
        });
      } else if (monthlyUsagePercent >= 50 && monthlyUsagePercent < 80) {
        // Only alert once when crossing 50% threshold
        if (!this.hasAlerted('monthly_50')) {
          this.sendQuotaAlert('INFO', 'Monthly quota 50% used', {
            remaining: monthlyRemaining,
            limit: monthlyLimit,
            usagePercent: monthlyUsagePercent.toFixed(1)
          });
          this.markAlerted('monthly_50');
        }
      }

      // Rate limit alerts
      if (rateRemaining <= 2 && rateRemaining > 0) {
        this.sendQuotaAlert('CRITICAL', 'Rate limit critically low', {
          remaining: rateRemaining,
          limit: rateLimit,
          usagePercent: rateUsagePercent.toFixed(1),
          timeWindow: 'hour'
        });
      } else if (rateRemaining <= 5 && rateRemaining > 2) {
        this.sendQuotaAlert('WARNING', 'Rate limit running low', {
          remaining: rateRemaining,
          limit: rateLimit,
          usagePercent: rateUsagePercent.toFixed(1),
          timeWindow: 'hour'
        });
      }

    } catch (error) {
      console.error('Error monitoring quota usage:', error);
    }
  }

  /**
   * Send quota alert with different severity levels
   */
  private sendQuotaAlert(severity: 'INFO' | 'WARNING' | 'CRITICAL', message: string, data: any): void {
    const timestamp = new Date().toISOString();
    const alertData = {
      severity,
      message,
      timestamp,
      service: 'RapidAPI TripAdvisor',
      data
    };

    // Console logging with appropriate colors/emojis
    const severityEmoji = {
      'INFO': '📊',
      'WARNING': '⚠️',
      'CRITICAL': '🚨'
    };

    const severityColor = {
      'INFO': '\x1b[36m',    // Cyan
      'WARNING': '\x1b[33m', // Yellow
      'CRITICAL': '\x1b[31m' // Red
    };

    const resetColor = '\x1b[0m';
    
    console.log(
      `${severityEmoji[severity]} ${severityColor[severity]}[${severity}]${resetColor} ${message}`,
      JSON.stringify(data, null, 2)
    );

    // In production, you would send this to your monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example integrations (uncomment and configure as needed):
      
      // Slack webhook
      // this.sendSlackAlert(alertData);
      
      // Email notification
      // this.sendEmailAlert(alertData);
      
      // Monitoring service (DataDog, New Relic, etc.)
      // this.sendToMonitoringService(alertData);
      
      // Database logging
      // this.logAlertToDatabase(alertData);
    }

    // Development: Also log to a file for persistence
    if (process.env.NODE_ENV !== 'production') {
      this.logAlertToFile(alertData);
    }
  }

  /**
   * Simple alert deduplication to prevent spam
   */
  private alertHistory = new Set<string>();
  
  private hasAlerted(alertKey: string): boolean {
    return this.alertHistory.has(alertKey);
  }
  
  private markAlerted(alertKey: string): void {
    this.alertHistory.add(alertKey);
    // Clear alert history after 1 hour to allow re-alerting
    setTimeout(() => {
      this.alertHistory.delete(alertKey);
    }, 60 * 60 * 1000);
  }

  /**
   * Log alerts to file for development debugging
   */
  private logAlertToFile(alertData: any): void {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, 'quota-alerts.log');
      
      // Create logs directory if it doesn't exist
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logEntry = `${alertData.timestamp} [${alertData.severity}] ${alertData.message} ${JSON.stringify(alertData.data)}\n`;
      fs.appendFileSync(logFile, logEntry);
      
    } catch (error) {
      console.error('Failed to log alert to file:', error);
    }
  }

  /**
   * Get current quota status (useful for health checks)
   */
  getLastQuotaStatus(): any {
    return this.lastQuotaStatus;
  }

  private lastQuotaStatus: any = null;

  /**
   * Check if the client is properly configured
   */
  static isConfigured(): boolean {
    return rapidApiConfig.isEnabled;
  }
}

// Export singleton instance
export const rapidApiClient = RapidApiClient.isConfigured() ? new RapidApiClient() : null;
