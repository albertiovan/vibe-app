/**
 * Schema Learning System
 * 
 * Learns from Claude's actual response patterns to improve schema validation
 * and reduce fallback usage while maintaining structured outputs.
 */

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

interface SchemaFailure {
  timestamp: number;
  stage: 'think' | 'curate' | 'reflect';
  vibe: string;
  rawResponse: any;
  validationErrors: any[];
  fallbackUsed: boolean;
}

interface SchemaPattern {
  stage: string;
  commonFields: Record<string, { type: string; frequency: number }>;
  alternativeNames: Record<string, string[]>;
  typicalStructure: any;
  successRate: number;
}

class SchemaLearningSystem {
  private failuresPath: string;
  private patternsPath: string;
  private failures: SchemaFailure[] = [];
  private patterns: Record<string, SchemaPattern> = {};
  private isLoaded = false;

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    this.failuresPath = path.join(dataDir, 'schema_failures.json');
    this.patternsPath = path.join(dataDir, 'schema_patterns.json');
  }

  /**
   * Load existing failure data and patterns
   */
  async load(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const dataDir = path.dirname(this.failuresPath);
      await fs.mkdir(dataDir, { recursive: true });

      // Load failures
      try {
        const failuresData = await fs.readFile(this.failuresPath, 'utf-8');
        this.failures = JSON.parse(failuresData);
      } catch {
        this.failures = [];
      }

      // Load patterns
      try {
        const patternsData = await fs.readFile(this.patternsPath, 'utf-8');
        this.patterns = JSON.parse(patternsData);
      } catch {
        this.patterns = {};
      }

      console.log('📚 Schema learning system loaded:', {
        failures: this.failures.length,
        patterns: Object.keys(this.patterns).length
      });
    } catch (error) {
      console.error('❌ Failed to load schema learning data:', error);
    }

    this.isLoaded = true;
  }

  /**
   * Record a schema validation failure
   */
  async recordFailure(
    stage: 'think' | 'curate' | 'reflect',
    vibe: string,
    rawResponse: any,
    validationErrors: any[],
    fallbackUsed: boolean
  ): Promise<void> {
    await this.load();

    const failure: SchemaFailure = {
      timestamp: Date.now(),
      stage,
      vibe,
      rawResponse,
      validationErrors,
      fallbackUsed
    };

    this.failures.push(failure);

    // Keep only recent failures (last 100)
    if (this.failures.length > 100) {
      this.failures = this.failures.slice(-100);
    }

    await this.save();
    await this.analyzePatterns();

    console.log('📝 Schema failure recorded:', {
      stage,
      errorsCount: validationErrors.length,
      fallbackUsed
    });
  }

  /**
   * Record a successful validation
   */
  async recordSuccess(
    stage: 'think' | 'curate' | 'reflect',
    vibe: string,
    validatedData: any
  ): Promise<void> {
    await this.load();

    // Update success patterns
    if (!this.patterns[stage]) {
      this.patterns[stage] = {
        stage,
        commonFields: {},
        alternativeNames: {},
        typicalStructure: {},
        successRate: 0
      };
    }

    // Analyze successful structure
    this.analyzeSuccessfulStructure(stage, validatedData);
    await this.save();
  }

  /**
   * Get adaptive schema suggestions for a stage
   */
  async getAdaptiveSuggestions(stage: 'think' | 'curate' | 'reflect'): Promise<{
    commonMistakes: string[];
    suggestedFields: string[];
    alternativeNames: Record<string, string[]>;
    fallbackRate: number;
  }> {
    await this.load();

    const stageFailures = this.failures.filter(f => f.stage === stage);
    const recentFailures = stageFailures.filter(f => f.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Analyze common validation errors
    const errorMessages = recentFailures.flatMap(f => 
      f.validationErrors.map(e => e.message || e.code || 'unknown')
    );
    const errorCounts = new Map<string, number>();
    errorMessages.forEach(msg => {
      errorCounts.set(msg, (errorCounts.get(msg) || 0) + 1);
    });

    const commonMistakes = Array.from(errorCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([msg]) => msg);

    // Get pattern suggestions
    const pattern = this.patterns[stage];
    const suggestedFields = pattern ? Object.keys(pattern.commonFields) : [];
    const alternativeNames = pattern?.alternativeNames || {};
    const fallbackRate = stageFailures.length > 0 ? 
      stageFailures.filter(f => f.fallbackUsed).length / stageFailures.length : 0;

    return {
      commonMistakes,
      suggestedFields,
      alternativeNames,
      fallbackRate
    };
  }

  /**
   * Attempt intelligent schema repair
   */
  async repairResponse(
    stage: 'think' | 'curate' | 'reflect',
    rawResponse: any,
    validationErrors: any[]
  ): Promise<{ repaired: any; success: boolean; changes: string[] }> {
    await this.load();

    const changes: string[] = [];
    let repaired = JSON.parse(JSON.stringify(rawResponse)); // Deep clone

    try {
      // Apply common repairs based on learned patterns
      const pattern = this.patterns[stage];
      if (pattern) {
        // Fix missing required fields with defaults
        for (const error of validationErrors) {
          if (error.code === 'invalid_type' && error.expected && error.path) {
            const fieldPath = error.path.join('.');
            const defaultValue = this.getDefaultForType(error.expected);
            
            if (defaultValue !== undefined) {
              this.setNestedValue(repaired, error.path, defaultValue);
              changes.push(`Added default ${error.expected} for ${fieldPath}`);
            }
          }

          // Fix enum validation errors by mapping to closest valid value
          if (error.code === 'invalid_enum_value' && error.options && error.path) {
            const received = error.received;
            const validOptions = error.options;
            const closest = this.findClosestEnumValue(received, validOptions);
            
            if (closest) {
              this.setNestedValue(repaired, error.path, closest);
              changes.push(`Mapped "${received}" to "${closest}"`);
            }
          }

          // Fix string length issues
          if (error.code === 'too_big' && error.path) {
            const currentValue = this.getNestedValue(repaired, error.path);
            if (typeof currentValue === 'string' && error.maximum) {
              const truncated = currentValue.substring(0, error.maximum);
              this.setNestedValue(repaired, error.path, truncated);
              changes.push(`Truncated string at ${error.path.join('.')}`);
            }
          }
        }
      }

      return { repaired, success: changes.length > 0, changes };
    } catch (error) {
      console.error('❌ Schema repair failed:', error);
      return { repaired: rawResponse, success: false, changes: [] };
    }
  }

  /**
   * Check if fallback should be used based on learning
   */
  shouldUseFallback(stage: 'think' | 'curate' | 'reflect', errorCount: number): boolean {
    const pattern = this.patterns[stage];
    if (!pattern) return errorCount > 5; // Conservative fallback for unknown stages

    const recentFailures = this.failures.filter(f => 
      f.stage === stage && 
      f.timestamp > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const fallbackRate = recentFailures.length > 0 ? 
      recentFailures.filter(f => f.fallbackUsed).length / recentFailures.length : 0;

    // Use fallback if:
    // 1. Too many errors (>10)
    // 2. Recent fallback rate is very high (>80%) and errors are significant (>5)
    // 3. Critical system errors
    return errorCount > 10 || (fallbackRate > 0.8 && errorCount > 5);
  }

  /**
   * Get schema learning statistics
   */
  async getStats(): Promise<{
    totalFailures: number;
    recentFailures: number;
    fallbackRate: number;
    commonErrors: string[];
    stageStats: Record<string, { failures: number; fallbackRate: number }>;
  }> {
    await this.load();

    const recentFailures = this.failures.filter(f => 
      f.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
    );

    const fallbackRate = this.failures.length > 0 ? 
      this.failures.filter(f => f.fallbackUsed).length / this.failures.length : 0;

    // Get common error messages
    const allErrors = this.failures.flatMap(f => 
      f.validationErrors.map(e => e.message || e.code || 'unknown')
    );
    const errorCounts = new Map<string, number>();
    allErrors.forEach(msg => {
      errorCounts.set(msg, (errorCounts.get(msg) || 0) + 1);
    });

    const commonErrors = Array.from(errorCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([msg]) => msg);

    // Stage-specific stats
    const stageStats: Record<string, { failures: number; fallbackRate: number }> = {};
    ['think', 'curate', 'reflect'].forEach(stage => {
      const stageFailures = this.failures.filter(f => f.stage === stage);
      stageStats[stage] = {
        failures: stageFailures.length,
        fallbackRate: stageFailures.length > 0 ? 
          stageFailures.filter(f => f.fallbackUsed).length / stageFailures.length : 0
      };
    });

    return {
      totalFailures: this.failures.length,
      recentFailures: recentFailures.length,
      fallbackRate,
      commonErrors,
      stageStats
    };
  }

  // Private helper methods
  private async save(): Promise<void> {
    try {
      await fs.writeFile(this.failuresPath, JSON.stringify(this.failures, null, 2));
      await fs.writeFile(this.patternsPath, JSON.stringify(this.patterns, null, 2));
    } catch (error) {
      console.error('❌ Failed to save schema learning data:', error);
    }
  }

  private async analyzePatterns(): Promise<void> {
    // Analyze failure patterns to improve schemas
    const stageGroups = new Map<string, SchemaFailure[]>();
    this.failures.forEach(failure => {
      const stage = failure.stage;
      if (!stageGroups.has(stage)) {
        stageGroups.set(stage, []);
      }
      stageGroups.get(stage)!.push(failure);
    });

    // Update patterns for each stage
    for (const [stage, failures] of stageGroups) {
      this.updateStagePattern(stage, failures);
    }
  }

  private updateStagePattern(stage: string, failures: SchemaFailure[]): void {
    if (!this.patterns[stage]) {
      this.patterns[stage] = {
        stage,
        commonFields: {},
        alternativeNames: {},
        typicalStructure: {},
        successRate: 0
      };
    }

    // Analyze what fields Claude actually provides
    failures.forEach(failure => {
      if (failure.rawResponse && typeof failure.rawResponse === 'object') {
        this.analyzeResponseStructure(stage, failure.rawResponse);
      }
    });
  }

  private analyzeResponseStructure(stage: string, response: any): void {
    const pattern = this.patterns[stage];
    
    const analyzeObject = (obj: any, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        
        if (!pattern.commonFields[fullKey]) {
          pattern.commonFields[fullKey] = { type, frequency: 0 };
        }
        pattern.commonFields[fullKey].frequency++;
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          analyzeObject(value, fullKey);
        }
      });
    };
    
    analyzeObject(response);
  }

  private analyzeSuccessfulStructure(stage: string, data: any): void {
    // Record successful patterns for future reference
    const pattern = this.patterns[stage];
    pattern.typicalStructure = data;
  }

  private getDefaultForType(type: string): any {
    switch (type) {
      case 'string': return '';
      case 'number': return 0;
      case 'boolean': return false;
      case 'array': return [];
      case 'object': return {};
      default: return undefined;
    }
  }

  private findClosestEnumValue(received: string, options: string[]): string | null {
    if (!received || !options.length) return null;
    
    const receivedLower = received.toLowerCase();
    
    // Exact match (case insensitive)
    const exactMatch = options.find(opt => opt.toLowerCase() === receivedLower);
    if (exactMatch) return exactMatch;
    
    // Partial match
    const partialMatch = options.find(opt => 
      opt.toLowerCase().includes(receivedLower) || 
      receivedLower.includes(opt.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    // Fallback to first option
    return options[0];
  }

  private getNestedValue(obj: any, path: (string | number)[]): any {
    return path.reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: (string | number)[], value: any): void {
    const lastKey = path[path.length - 1];
    const parentPath = path.slice(0, -1);
    const parent = parentPath.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    parent[lastKey] = value;
  }
}

// Singleton instance
export const schemaLearning = new SchemaLearningSystem();
