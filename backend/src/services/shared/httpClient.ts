/**
 * Shared HTTP Client with Rate Limiting and Retries
 * 
 * Provides consistent HTTP handling for external API integrations
 */

interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface RateLimitConfig {
  maxConcurrent: number;
  timeoutMs: number;
  retryAttempts: number;
}

class ConcurrencyLimiter {
  private running = new Set<Promise<any>>();
  
  constructor(private maxConcurrent: number) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if at capacity
    while (this.running.size >= this.maxConcurrent) {
      await Promise.race(this.running);
    }

    const promise = fn();
    this.running.add(promise);
    
    promise.finally(() => {
      this.running.delete(promise);
    });

    return promise;
  }

  getStats() {
    return {
      running: this.running.size,
      maxConcurrent: this.maxConcurrent
    };
  }
}

// Service-specific rate limiters
const limiters = new Map<string, ConcurrencyLimiter>();

/**
 * Get or create rate limiter for service
 */
function getRateLimiter(service: string, config: RateLimitConfig): ConcurrencyLimiter {
  if (!limiters.has(service)) {
    limiters.set(service, new ConcurrencyLimiter(config.maxConcurrent));
  }
  return limiters.get(service)!;
}

/**
 * Make HTTP request with rate limiting and retries
 */
export async function makeRequest<T>(
  service: string,
  config: RequestConfig,
  rateLimitConfig: RateLimitConfig
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const limiter = getRateLimiter(service, rateLimitConfig);
  
  return limiter.execute(async () => {
    const maxRetries = config.retries ?? rateLimitConfig.retryAttempts;
    let lastError: string = '';

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 
          config.timeout ?? rateLimitConfig.timeoutMs);

        const response = await fetch(config.url, {
          method: config.method ?? 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'VibeApp/1.0',
            ...config.headers
          },
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          lastError = `HTTP ${response.status}: ${errorText}`;
          
          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            break;
          }
          
          throw new Error(lastError);
        }

        const data = await response.json();
        
        console.log(`✅ ${service} request successful (attempt ${attempt + 1})`);
        return { ok: true as const, data };

      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        
        console.warn(`⚠️ ${service} request failed (attempt ${attempt + 1}/${maxRetries + 1}):`, lastError);
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = (config.retryDelay ?? 1000) * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error(`❌ ${service} request failed after ${maxRetries + 1} attempts:`, lastError);
    return { ok: false as const, error: lastError };
  });
}

/**
 * Get rate limiter statistics for monitoring
 */
export function getRateLimiterStats(): Record<string, any> {
  const stats: Record<string, any> = {};
  
  for (const [service, limiter] of limiters) {
    stats[service] = limiter.getStats();
  }
  
  return stats;
}
