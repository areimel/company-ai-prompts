/**
 * Feature Flags - Centralized feature toggle management
 * Provides runtime checks for optional features like authentication
 */

// Environment-based feature flags
export const FeatureFlags = {
  /**
   * Check if user authentication is enabled
   */
  get AUTH_ENABLED(): boolean {
    if (typeof import.meta === 'undefined') {
      // Fallback for server-side contexts where import.meta might not be available
      return process.env.ENABLE_USER_AUTH === 'true';
    }
    return import.meta.env.ENABLE_USER_AUTH === 'true';
  },

  /**
   * Check if favorites functionality is enabled (depends on auth)
   */
  get FAVORITES_ENABLED(): boolean {
    return this.AUTH_ENABLED;
  },

  /**
   * Check if social login is enabled
   */
  get SOCIAL_AUTH_ENABLED(): boolean {
    return this.AUTH_ENABLED;
  },

  /**
   * Check if user profiles/dashboard is enabled
   */
  get USER_PROFILES_ENABLED(): boolean {
    return this.AUTH_ENABLED;
  },

  /**
   * Development mode features
   */
  get DEV_MODE(): boolean {
    if (typeof import.meta === 'undefined') {
      return process.env.NODE_ENV === 'development';
    }
    return import.meta.env.DEV;
  },

  /**
   * Check if all required auth environment variables are present
   */
  get AUTH_CONFIG_VALID(): boolean {
    if (!this.AUTH_ENABLED) return true; // Valid if disabled
    
    try {
      const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
      
      if (typeof import.meta !== 'undefined') {
        return requiredVars.every(varName => 
          import.meta.env[varName] && import.meta.env[varName].trim() !== ''
        );
      } else {
        return requiredVars.every(varName => 
          process.env[varName] && process.env[varName].trim() !== ''
        );
      }
    } catch (error) {
      console.warn('Error checking auth config:', error);
      return false;
    }
  }
};

/**
 * Hook for reactive feature flag checks in components
 * Usage: const authEnabled = useFeatureFlag('AUTH_ENABLED');
 */
export function useFeatureFlag(flag: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[flag];
}

/**
 * Conditional rendering helper for auth features
 * Usage: renderIfAuth(() => <AuthComponent />)
 */
export function renderIfAuth<T>(renderFn: () => T): T | null {
  return FeatureFlags.AUTH_ENABLED ? renderFn() : null;
}

/**
 * Conditional rendering helper for favorites features
 * Usage: renderIfFavorites(() => <FavoriteButton />)
 */
export function renderIfFavorites<T>(renderFn: () => T): T | null {
  return FeatureFlags.FAVORITES_ENABLED ? renderFn() : null;
}

/**
 * Get user-friendly status message for feature availability
 */
export function getAuthStatusMessage(): string {
  if (!FeatureFlags.AUTH_ENABLED) {
    return 'User authentication is disabled';
  }
  
  if (!FeatureFlags.AUTH_CONFIG_VALID) {
    return 'Authentication configuration is incomplete';
  }
  
  return 'Authentication is enabled and configured';
}

/**
 * Development helper to log all feature flags
 */
export function logFeatureFlags(): void {
  if (FeatureFlags.DEV_MODE) {
    console.group('🏃 Feature Flags Status');
    console.log('AUTH_ENABLED:', FeatureFlags.AUTH_ENABLED);
    console.log('FAVORITES_ENABLED:', FeatureFlags.FAVORITES_ENABLED);
    console.log('SOCIAL_AUTH_ENABLED:', FeatureFlags.SOCIAL_AUTH_ENABLED);
    console.log('USER_PROFILES_ENABLED:', FeatureFlags.USER_PROFILES_ENABLED);
    console.log('AUTH_CONFIG_VALID:', FeatureFlags.AUTH_CONFIG_VALID);
    console.log('DEV_MODE:', FeatureFlags.DEV_MODE);
    console.groupEnd();
  }
}