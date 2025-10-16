/**
 * Claude LLM Provider
 * Anthropic Claude adapter with JSON guardrails and retry logic
 */

import Anthropic from '@anthropic-ai/sdk';
import { ZodSchema } from 'zod';
import { LLMProvider, ProviderConfig, DEFAULT_JSON_PARAMS, JSONValidator } from './provider.js';

export class ClaudeProvider implements LLMProvider {
  name: 'claude' = 'claude';
  private client: Anthropic;
  private config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
      timeout: config.timeoutMs
    });
    
    console.log('🤖 Claude provider initialized:', {
      model: config.model,
      timeout: config.timeoutMs
    });
  }

  /**
   * Complete prompt with strict JSON output and validation
   */
  async completeJSON<T>({
    system,
    user,
    schema,
    maxTokens = DEFAULT_JSON_PARAMS.maxTokens
  }: {
    system: string;
    user: string;
    schema: ZodSchema<T>;
    maxTokens?: number;
  }): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
    
    const startTime = Date.now();
    console.log('🤖 Claude completion request:', {
      model: this.config.model,
      maxTokens,
      systemPromptLength: system.length,
      userPromptLength: user.length
    });

    // First attempt
    const firstAttempt = await this.attemptCompletion({
      system,
      user,
      schema,
      maxTokens,
      isRetry: false
    });

    if (firstAttempt.ok) {
      console.log('✅ Claude completion successful on first attempt:', {
        duration: Date.now() - startTime,
        dataKeys: Object.keys(firstAttempt.data as any)
      });
      return firstAttempt;
    }

    console.warn('⚠️ Claude first attempt failed, retrying with stricter instructions:', firstAttempt.error);

    // Retry with stricter instructions
    const retrySystem = system + '\n\n' + JSONValidator.createRetryInstructions(firstAttempt.error);
    const retryAttempt = await this.attemptCompletion({
      system: retrySystem,
      user,
      schema,
      maxTokens,
      isRetry: true
    });

    if (retryAttempt.ok) {
      console.log('✅ Claude completion successful on retry:', {
        duration: Date.now() - startTime
      });
      return retryAttempt;
    }

    console.error('❌ Claude completion failed after retry:', {
      duration: Date.now() - startTime,
      finalError: retryAttempt.error
    });

    return retryAttempt;
  }

  /**
   * Single completion attempt with error handling
   */
  private async attemptCompletion<T>({
    system,
    user,
    schema,
    maxTokens,
    isRetry
  }: {
    system: string;
    user: string;
    schema: ZodSchema<T>;
    maxTokens?: number;
    isRetry: boolean;
  }): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
    
    const maxRetries = 2;
    let lastError = '';

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.client.messages.create({
          model: this.config.model,
          max_tokens: maxTokens || DEFAULT_JSON_PARAMS.maxTokens!,
          temperature: DEFAULT_JSON_PARAMS.temperature,
          top_p: DEFAULT_JSON_PARAMS.topP,
          system,
          messages: [
            {
              role: 'user',
              content: user
            }
          ]
        });

        // Extract text content
        const textContent = response.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('\n');

        if (!textContent.trim()) {
          lastError = 'Empty response from Claude';
          continue;
        }

        console.log('🤖 Claude raw response:', {
          attempt: attempt + 1,
          isRetry,
          responseLength: textContent.length,
          preview: textContent.slice(0, 200) + '...'
        });

        // Parse and validate JSON
        const validationResult = JSONValidator.parseAndValidate(textContent, schema);
        
        if (validationResult.ok) {
          return validationResult;
        }

        lastError = validationResult.error;
        console.warn(`⚠️ Claude attempt ${attempt + 1} validation failed:`, lastError);

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }

      } catch (error) {
        lastError = this.handleClaudeError(error);
        console.warn(`⚠️ Claude attempt ${attempt + 1} API error:`, lastError);

        // Wait before retry for API errors
        if (attempt < maxRetries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    return { ok: false, error: lastError };
  }

  /**
   * Handle Claude-specific errors
   */
  private handleClaudeError(error: unknown): string {
    if (error instanceof Anthropic.APIError) {
      if (error.status && error.status >= 500) {
        return `Claude server error (${error.status}): ${error.message}`;
      }
      if (error.status === 429) {
        return `Claude rate limit exceeded: ${error.message}`;
      }
      if (error.status === 401) {
        return `Claude authentication failed: ${error.message}`;
      }
      return `Claude API error (${error.status}): ${error.message}`;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return `Claude request timeout after ${this.config.timeoutMs}ms`;
      }
      return `Claude error: ${error.message}`;
    }

    return `Unknown Claude error: ${String(error)}`;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test connection to Claude API
   */
  async testConnection(): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ]
      });

      if (response.content.length > 0) {
        return { ok: true };
      } else {
        return { ok: false, error: 'Empty response from Claude' };
      }

    } catch (error) {
      return { ok: false, error: this.handleClaudeError(error) };
    }
  }
}
