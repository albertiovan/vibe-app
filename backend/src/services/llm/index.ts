/**
 * LLM Provider Factory
 * Creates and manages LLM provider instances
 */

import { LLMProvider } from './provider.js';
import { ClaudeProvider } from './claude.js';
import { OpenAIProvider } from './openai.js';
import { getLLMConfig, getProviderConfig } from '../../config/llm.js';

// Singleton provider instance
let _providerInstance: LLMProvider | null = null;

/**
 * Get the configured LLM provider instance
 */
export function getLLMProvider(): LLMProvider {
  if (!_providerInstance) {
    const config = getLLMConfig();
    _providerInstance = createProvider(config.provider);
  }
  return _providerInstance;
}

/**
 * Create a provider instance for the specified type
 */
function createProvider(providerType: string): LLMProvider {
  const config = getProviderConfig(providerType);
  
  switch (config.provider) {
    case 'claude':
      return new ClaudeProvider(config);
    
    case 'openai':
      return new OpenAIProvider(config);
    
    default:
      throw new Error(`Unsupported LLM provider: ${providerType}`);
  }
}

/**
 * Test the current provider connection
 */
export async function testLLMConnection(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const provider = getLLMProvider();
    
    // Test connection if provider supports it
    if ('testConnection' in provider && typeof provider.testConnection === 'function') {
      return await provider.testConnection();
    }
    
    return { ok: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { ok: false, error: errorMessage };
  }
}

/**
 * Reset provider instance (for testing or config changes)
 */
export function resetLLMProvider(): void {
  _providerInstance = null;
}

/**
 * Get provider info
 */
export function getLLMProviderInfo() {
  const config = getLLMConfig();
  return {
    provider: config.provider,
    model: config.model,
    timeoutMs: config.timeoutMs,
    isConfigured: !!_providerInstance
  };
}

// Export provider types for convenience
export { LLMProvider } from './provider.js';
export { ClaudeProvider } from './claude.js';
export { OpenAIProvider } from './openai.js';
