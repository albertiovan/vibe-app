/**
 * Lazy LLM Initialization Utility
 * 
 * Provides a safe pattern for initializing LLM services that prevents
 * timing issues with environment variable loading.
 */

import { getLLMProvider } from '../services/llm/index.js';

/**
 * Creates a lazy-initialized LLM provider that's safe to use in constructors
 * 
 * Usage:
 * ```typescript
 * class MyService {
 *   private llm = createLazyLLM();
 * 
 *   async doSomething() {
 *     const provider = await this.llm.get();
 *     return provider.complete(...);
 *   }
 * }
 * ```
 */
export function createLazyLLM() {
  let provider: any = null;
  let initialized = false;
  let initPromise: Promise<any> | null = null;

  return {
    async get() {
      // If already initialized, return immediately
      if (initialized && provider) {
        return provider;
      }

      // If initialization is in progress, wait for it
      if (initPromise) {
        return initPromise;
      }

      // Start initialization
      initPromise = (async () => {
        try {
          provider = getLLMProvider();
          initialized = true;
          return provider;
        } catch (error) {
          initPromise = null; // Reset so we can retry
          throw new Error(`LLM initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      })();

      return initPromise;
    },

    isInitialized() {
      return initialized;
    },

    reset() {
      provider = null;
      initialized = false;
      initPromise = null;
    }
  };
}

/**
 * Mixin class that provides lazy LLM initialization
 * 
 * Usage:
 * ```typescript
 * class MyService extends LazyLLMService {
 *   async doSomething() {
 *     const llm = await this.getLLM();
 *     return llm.complete(...);
 *   }
 * }
 * ```
 */
export class LazyLLMService {
  private lazyLLM = createLazyLLM();

  protected async getLLM() {
    return this.lazyLLM.get();
  }

  protected isLLMInitialized() {
    return this.lazyLLM.isInitialized();
  }

  protected resetLLM() {
    this.lazyLLM.reset();
  }
}

/**
 * Decorator that ensures a method initializes LLM before running
 * 
 * Usage:
 * ```typescript
 * class MyService {
 *   private llm = createLazyLLM();
 * 
 *   @requiresLLM
 *   async doSomething() {
 *     // this.llm is guaranteed to be initialized
 *     return this.llm.complete(...);
 *   }
 * }
 * ```
 */
export function requiresLLM(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    // Ensure LLM is initialized before calling the method
    if (this.llm && typeof this.llm.get === 'function') {
      await this.llm.get();
    }
    
    return method.apply(this, args);
  };

  return descriptor;
}
