/**
 * Feature Flags
 * Control feature rollout and A/B testing
 */

export interface FeatureFlags {
  shell_refresh: boolean;
  // Add more flags as needed
}

/**
 * Default feature flags
 * Set to false for production, true for development
 */
const defaultFlags: FeatureFlags = {
  shell_refresh: false, // Temporarily disabled to debug
};

/**
 * Runtime feature flag overrides
 * Can be toggled via dev menu or remote config
 */
let runtimeFlags: Partial<FeatureFlags> = {};

/**
 * Get current value of a feature flag
 */
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  if (flag in runtimeFlags) {
    return runtimeFlags[flag] as boolean;
  }
  return defaultFlags[flag];
};

/**
 * Toggle a feature flag at runtime (dev only)
 */
export const toggleFeature = (flag: keyof FeatureFlags, enabled?: boolean): void => {
  if (!__DEV__) {
    console.warn('Feature flags can only be toggled in development');
    return;
  }
  
  runtimeFlags[flag] = enabled ?? !isFeatureEnabled(flag);
  console.log(`🚩 Feature flag '${flag}' ${runtimeFlags[flag] ? 'ENABLED' : 'DISABLED'}`);
};

/**
 * Reset all runtime overrides
 */
export const resetFeatureFlags = (): void => {
  runtimeFlags = {};
  console.log('🚩 Feature flags reset to defaults');
};

/**
 * Get all feature flags for debugging
 */
export const getAllFlags = (): FeatureFlags => {
  return {
    ...defaultFlags,
    ...runtimeFlags,
  };
};
