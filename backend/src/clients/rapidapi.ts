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
   * Check if the client is properly configured
   */
  static isConfigured(): boolean {
    return rapidApiConfig.isEnabled;
  }
}

// Export singleton instance
export const rapidApiClient = RapidApiClient.isConfigured() ? new RapidApiClient() : null;
