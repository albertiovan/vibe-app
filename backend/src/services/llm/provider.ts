/**
 * LLM Provider Interface
 * Defines the contract for all LLM providers with strict JSON output
 */

import { ZodSchema } from 'zod';

export interface LLMProvider {
  name: 'claude' | 'openai' | 'mistral';
  
  /**
   * Complete a prompt with strict JSON output validation
   * @param system - System prompt
   * @param user - User prompt  
   * @param schema - Zod schema for validation
   * @param maxTokens - Optional token limit
   * @returns Validated JSON data or error
   */
  completeJSON<T>({
    system,
    user,
    schema,
    maxTokens
  }: {
    system: string;
    user: string;
    schema: ZodSchema<T>;
    maxTokens?: number;
  }): Promise<{ ok: true; data: T } | { ok: false; error: string }>;
}

/**
 * Base configuration for all providers
 */
export interface ProviderConfig {
  provider: string;
  model: string;
  apiKey: string;
  timeoutMs: number;
}

/**
 * Standard LLM completion parameters
 */
export interface CompletionParams {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stop?: string[];
}

/**
 * Default completion parameters for deterministic JSON output
 */
export const DEFAULT_JSON_PARAMS: CompletionParams = {
  temperature: 0.1,
  topP: 1.0,
  maxTokens: 2000
};

/**
 * JSON extraction and validation utilities
 */
export class JSONValidator {
  /**
   * Extract JSON from text that may contain markdown fencing
   */
  static extractJSON(text: string): string {
    // Remove markdown code fences
    const cleanText = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // Try to find JSON object boundaries
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return cleanText.slice(jsonStart, jsonEnd + 1);
    }
    
    return cleanText;
  }

  /**
   * Parse and validate JSON against schema
   */
  static parseAndValidate<T>(
    jsonString: string, 
    schema: ZodSchema<T>
  ): { ok: true; data: T } | { ok: false; error: string } {
    try {
      // Check if schema is provided
      if (!schema) {
        return { ok: false, error: 'JSON validation failed: No schema provided' };
      }

      const extracted = this.extractJSON(jsonString);
      
      if (!extracted.trim()) {
        return { ok: false, error: 'JSON validation failed: Empty JSON string after extraction' };
      }

      const parsed = JSON.parse(extracted);
      const validated = schema.parse(parsed);
      
      return { ok: true, data: validated };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      return { ok: false, error: `JSON validation failed: ${errorMessage}` };
    }
  }

  /**
   * Create stricter instructions for retry attempts
   */
  static createRetryInstructions(originalError: string): string {
    return `
CRITICAL: Your previous response failed JSON validation with error: "${originalError}"

You MUST:
1. Output ONLY valid JSON - no explanations, no markdown, no extra text
2. Start with { and end with }
3. Use double quotes for all strings
4. Follow the exact schema provided
5. Do not add any fields not in the schema
6. Use null for optional fields you cannot determine

Example format:
{"field1": "value", "field2": null, "field3": []}
`;
  }
}
