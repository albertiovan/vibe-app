/**
 * Rate Limited LLM Provider
 * 
 * Wraps LLM providers with intelligent rate limiting, retry logic, and backoff strategies
 * to handle API rate limits gracefully.
 */

import { getLLMProvider } from './index.js';
import { ZodSchema } from 'zod';

interface RateLimitConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  rateLimitCooldownMs: number;
}

interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  request: () => Promise<any>;
  retryCount: number;
  priority: number;
}

export class RateLimitedLLMProvider {
  private provider: any;
  private requestQueue: QueuedRequest[] = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private rateLimitUntil = 0;
  private initialized = false;
  
  private config: RateLimitConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    rateLimitCooldownMs: 60000 // 1 minute cooldown after rate limit
  };

  constructor(customConfig?: Partial<RateLimitConfig>) {
    // TIMING SAFETY: Don't initialize LLM provider in constructor
    this.config = { ...this.config, ...customConfig };
  }

  /**
   * Lazy initialization of LLM provider
   */
  private async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      this.provider = getLLMProvider();
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize LLM provider:', error);
      throw new Error(`LLM provider initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rate-limited completeJSON with retry logic
   */
  async completeJSON<T>({
    system,
    user,
    schema,
    maxTokens,
    priority = 1
  }: {
    system: string;
    user: string;
    schema: ZodSchema<T>;
    maxTokens?: number;
    priority?: number;
  }): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
    
    return new Promise((resolve, reject) => {
      const request = async () => {
        try {
          // Ensure LLM provider is initialized
          await this.ensureInitialized();
          
          // Check if we're in rate limit cooldown
          if (Date.now() < this.rateLimitUntil) {
            const waitTime = this.rateLimitUntil - Date.now();
            console.log(`⏳ Rate limit cooldown: waiting ${Math.round(waitTime / 1000)}s`);
            await this.sleep(waitTime);
          }

          // Add minimum delay between requests
          const timeSinceLastRequest = Date.now() - this.lastRequestTime;
          const minDelay = 500; // 500ms minimum between requests
          if (timeSinceLastRequest < minDelay) {
            await this.sleep(minDelay - timeSinceLastRequest);
          }

          this.lastRequestTime = Date.now();
          
          const result = await this.provider.completeJSON({
            system,
            user,
            schema,
            maxTokens
          });

          return result;
          
        } catch (error: any) {
          // Handle rate limit errors
          if (this.isRateLimitError(error)) {
            console.log('🚫 Rate limit detected, entering cooldown period');
            this.rateLimitUntil = Date.now() + this.config.rateLimitCooldownMs;
            throw new Error(`Rate limit exceeded. Cooldown until ${new Date(this.rateLimitUntil).toLocaleTimeString()}`);
          }
          
          throw error;
        }
      };

      this.requestQueue.push({
        resolve,
        reject,
        request,
        retryCount: 0,
        priority
      });

      this.processQueue();
    });
  }

  /**
   * Process the request queue with rate limiting and retries
   */
  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      // Sort by priority (higher priority first)
      this.requestQueue.sort((a, b) => b.priority - a.priority);
      
      const queuedRequest = this.requestQueue.shift()!;
      
      try {
        const result = await this.executeWithRetry(queuedRequest);
        queuedRequest.resolve(result);
        
      } catch (error) {
        queuedRequest.reject(error);
      }

      // Small delay between processing requests
      await this.sleep(100);
    }

    this.isProcessing = false;
  }

  /**
   * Execute request with exponential backoff retry logic
   */
  private async executeWithRetry(queuedRequest: QueuedRequest): Promise<any> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await queuedRequest.request();
        
        // Reset retry count on success
        queuedRequest.retryCount = 0;
        
        return result;
        
      } catch (error: any) {
        lastError = error;
        queuedRequest.retryCount++;

        // Don't retry if we've exceeded max retries
        if (attempt >= this.config.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.config.baseDelayMs * Math.pow(this.config.backoffMultiplier, attempt),
          this.config.maxDelayMs
        );

        console.log(`⚠️ Request failed (attempt ${attempt + 1}/${this.config.maxRetries + 1}), retrying in ${delay}ms: ${error.message}`);
        
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Check if error is a rate limit error
   */
  private isRateLimitError(error: any): boolean {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorString = error.toString?.()?.toLowerCase() || '';
    
    return (
      errorMessage.includes('rate limit') ||
      errorMessage.includes('429') ||
      errorString.includes('rate limit') ||
      errorString.includes('429') ||
      error.status === 429
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue status for monitoring
   */
  getQueueStatus() {
    return {
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
      rateLimitUntil: this.rateLimitUntil,
      inCooldown: Date.now() < this.rateLimitUntil
    };
  }

  /**
   * Clear the queue (emergency use)
   */
  clearQueue() {
    this.requestQueue.forEach(req => {
      req.reject(new Error('Queue cleared'));
    });
    this.requestQueue = [];
  }
}

// Export singleton instance
export const rateLimitedLLM = new RateLimitedLLMProvider();
