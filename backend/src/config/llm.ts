/**
 * LLM Provider Configuration
 * Environment validation and configuration loading for LLM services
 */

export interface LLMConfig {
  provider: 'claude' | 'openai' | 'mistral';
  model: string;
  timeoutMs: number;
  apiKeys: {
    claude?: string;
    openai?: string;
  };
}

/**
 * Load and validate LLM configuration from environment
 * CRITICAL: This function should ONLY be called after environment is loaded
 */
function loadLLMConfig(): LLMConfig {
  // SAFETY CHECK: Ensure environment is loaded
  if (!process.env.CLAUDE_API_KEY && !process.env.OPENAI_API_KEY) {
    console.warn('⚠️ LLM config loading but no API keys found - environment may not be loaded yet');
  }

  const provider = (process.env.LLM_PROVIDER || 'claude') as 'claude' | 'openai' | 'mistral';
  const model = process.env.LLM_MODEL || getDefaultModel(provider);
  const timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS || '15000', 10);

  // Debug environment variable loading - only log when actually loading
  console.log('🔧 Loading LLM config (runtime):', {
    provider,
    model,
    timeoutMs,
    claudeKeyExists: !!process.env.CLAUDE_API_KEY,
    claudeKeyLength: process.env.CLAUDE_API_KEY?.length || 0,
    openaiKeyExists: !!process.env.OPENAI_API_KEY,
    openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    timestamp: new Date().toISOString()
  });

  const config: LLMConfig = {
    provider,
    model,
    timeoutMs,
    apiKeys: {
      claude: process.env.CLAUDE_API_KEY,
      openai: process.env.OPENAI_API_KEY
    }
  };

  // Validate required API keys based on provider
  validateLLMConfig(config);

  return config;
}

/**
 * Get default model for each provider
 */
function getDefaultModel(provider: string): string {
  switch (provider) {
    case 'claude': return 'claude-3-haiku-20240307';
    case 'openai': return 'gpt-4o-mini';
    case 'mistral': return 'mistral-large';
    default: return 'claude-3-haiku-20240307';
  }
}

/**
 * Validate configuration and fail fast if invalid
 */
function validateLLMConfig(config: LLMConfig): void {
  // Check provider-specific API keys
  switch (config.provider) {
    case 'claude':
      if (!config.apiKeys.claude) {
        console.warn(
          `⚠️ LLM_PROVIDER is set to 'claude' but CLAUDE_API_KEY is not provided. ` +
          `LLM features will be disabled. Please set CLAUDE_API_KEY to enable LLM functionality.`
        );
        return; // Don't throw, just warn
      }
      break;
    
    case 'openai':
      if (!config.apiKeys.openai) {
        console.warn(
          `⚠️ LLM_PROVIDER is set to 'openai' but OPENAI_API_KEY is not provided. ` +
          `LLM features will be disabled. Please set OPENAI_API_KEY to enable LLM functionality.`
        );
        return; // Don't throw, just warn
      }
      break;
    
    case 'mistral':
      throw new Error(
        `LLM_PROVIDER 'mistral' is not yet implemented. ` +
        `Please use 'claude' or 'openai'.`
      );
    
    default:
      throw new Error(
        `Invalid LLM_PROVIDER '${config.provider}'. ` +
        `Supported providers: claude, openai`
      );
  }

  // Validate timeout
  if (config.timeoutMs < 1000 || config.timeoutMs > 60000) {
    throw new Error(
      `LLM_TIMEOUT_MS must be between 1000 and 60000 milliseconds. ` +
      `Got: ${config.timeoutMs}`
    );
  }

  console.log('🤖 LLM Configuration loaded:', {
    provider: config.provider,
    model: config.model,
    timeoutMs: config.timeoutMs,
    hasClaudeKey: !!config.apiKeys.claude,
    hasOpenAIKey: !!config.apiKeys.openai
  });
}

/**
 * Global LLM configuration instance (lazy loaded)
 */
let _llmConfig: LLMConfig | null = null;

export function getLLMConfig(): LLMConfig {
  if (!_llmConfig) {
    _llmConfig = loadLLMConfig();
  }
  return _llmConfig;
}

// For backward compatibility - but use getLLMConfig() for proper lazy loading
export const llmConfig = {
  get provider() { return getLLMConfig().provider; },
  get model() { return getLLMConfig().model; },
  get timeoutMs() { return getLLMConfig().timeoutMs; },
  get apiKeys() { return getLLMConfig().apiKeys; }
};

/**
 * Check if LLM is properly configured
 */
export function isLLMConfigured(): boolean {
  switch (llmConfig.provider) {
    case 'claude':
      return !!llmConfig.apiKeys.claude;
    case 'openai':
      return !!llmConfig.apiKeys.openai;
    default:
      return false;
  }
}

/**
 * Get configuration for specific provider (with fallback)
 */
export function getProviderConfig(preferredProvider?: string) {
  const provider = preferredProvider || llmConfig.provider;
  
  switch (provider) {
    case 'claude':
      console.log('🔧 Claude config debug:', {
        claudeKeyExists: !!llmConfig.apiKeys.claude,
        claudeKeyLength: llmConfig.apiKeys.claude?.length || 0,
        model: llmConfig.model,
        provider: llmConfig.provider
      });
      
      if (!llmConfig.apiKeys.claude) {
        throw new Error('Claude API key is not configured');
      }
      
      return {
        provider: 'claude' as const,
        model: llmConfig.model,
        apiKey: llmConfig.apiKeys.claude,
        timeoutMs: llmConfig.timeoutMs
      };
    
    case 'openai':
      return {
        provider: 'openai' as const,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        apiKey: llmConfig.apiKeys.openai!,
        timeoutMs: llmConfig.timeoutMs
      };
    
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
