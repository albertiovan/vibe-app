/**
 * OpenAI LLM Provider (Stub)
 * Placeholder implementation for future OpenAI integration
 */

import { ZodSchema } from 'zod';
import { LLMProvider, ProviderConfig } from './provider.js';

export class OpenAIProvider implements LLMProvider {
  name: 'openai' = 'openai';
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
    console.log('🤖 OpenAI provider initialized (STUB):', {
      model: config.model,
      timeout: config.timeoutMs
    });
  }

  /**
   * Complete prompt with strict JSON output and validation
   * TODO: Implement OpenAI API integration
   */
  async completeJSON<T>({
    system,
    user,
    schema,
    maxTokens
  }: {
    system: string;
    user: string;
    schema: ZodSchema<T>;
    maxTokens?: number;
  }): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
    
    console.warn('⚠️ OpenAI provider is not yet implemented');
    
    return {
      ok: false,
      error: 'OpenAI provider is not yet implemented. Please use Claude provider.'
    };
  }

  /**
   * Test connection to OpenAI API
   */
  async testConnection(): Promise<{ ok: true } | { ok: false; error: string }> {
    return {
      ok: false,
      error: 'OpenAI provider is not yet implemented'
    };
  }
}

// TODO: Implement full OpenAI integration
// This would include:
// - OpenAI SDK integration
// - JSON mode forcing
// - Error handling for OpenAI-specific errors
// - Rate limiting and retry logic
// - Token counting and optimization
