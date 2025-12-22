/**
 * Environment Configuration Loader
 * Ensures environment variables are loaded properly with validation
 */

import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Load environment variables with proper error handling
 */
export function loadEnvironment(): void {
  // Determine which .env file to load based on NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envFileName = nodeEnv === 'production' ? '.env.production' : '.env';
  const envPath = resolve(process.cwd(), envFileName);
  
  if (!existsSync(envPath)) {
    console.warn(`⚠️ No ${envFileName} file found at:`, envPath);
    console.warn('⚠️ Environment variables will be loaded from system environment only');
    return;
  }

  // Load .env file
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.error('❌ Failed to load .env file:', result.error.message);
    throw new Error(`Environment loading failed: ${result.error.message}`);
  }

  console.log('✅ Environment variables loaded from:', envPath);
  
  // Debug key environment variables (without exposing values)
  const keyVars = [
    'CLAUDE_API_KEY',
    'DATABASE_URL',
    'NODE_ENV',
    'PORT',
    'LLM_PROVIDER',
    'CORS_ORIGINS'
  ];

  console.log('🔧 Environment variables status:');
  keyVars.forEach(key => {
    const value = process.env[key];
    const status = value ? `✅ (${value.length} chars)` : '❌ missing';
    console.log(`  ${key}: ${status}`);
  });
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): void {
  const required = [
    'CLAUDE_API_KEY'
    // DATABASE_URL is validated separately by PostgreSQL client
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    
    console.error('\n💡 Please check your .env file contains:');
    missing.forEach(key => console.error(`  ${key}=your_api_key_here`));
    
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ All required environment variables are present');
}

/**
 * Get environment variable with fallback and validation
 */
export function getEnvVar(key: string, fallback?: string, required = false): string {
  const value = process.env[key] || fallback;
  
  if (required && !value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  
  return value || '';
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
