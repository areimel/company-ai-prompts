import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  FeatureFlags, 
  useFeatureFlag, 
  renderIfAuth, 
  renderIfFavorites, 
  getAuthStatusMessage, 
  logFeatureFlags 
} from './feature-flags';

describe('FeatureFlags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    // Reset import.meta.env
    if (globalThis.import?.meta?.env) {
      delete (globalThis.import.meta as any).env;
    }
  });

  describe('AUTH_ENABLED', () => {
    it('should return true when ENABLE_USER_AUTH is "true"', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      expect(FeatureFlags.AUTH_ENABLED).toBe(true);
    });

    it('should return false when ENABLE_USER_AUTH is "false"', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'false');
      expect(FeatureFlags.AUTH_ENABLED).toBe(false);
    });

    it('should return false when ENABLE_USER_AUTH is undefined', () => {
      // Make sure we're not inheriting from setup
      vi.unstubAllEnvs();
      expect(FeatureFlags.AUTH_ENABLED).toBe(false);
    });

    it('should return false when ENABLE_USER_AUTH is empty string', () => {
      vi.stubEnv('ENABLE_USER_AUTH', '');
      expect(FeatureFlags.AUTH_ENABLED).toBe(false);
    });

    it('should return false when ENABLE_USER_AUTH is any other value', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'yes');
      expect(FeatureFlags.AUTH_ENABLED).toBe(false);
    });

    it('should handle server-side contexts without import.meta', () => {
      // Mock scenario where import.meta is undefined (server-side)
      const originalImportMeta = globalThis.import?.meta;
      if (globalThis.import) {
        delete (globalThis.import as any).meta;
      }

      // Set process.env for server-side test
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      process.env.ENABLE_USER_AUTH = 'true';

      expect(FeatureFlags.AUTH_ENABLED).toBe(true);

      // Restore import.meta if it existed
      if (originalImportMeta && globalThis.import) {
        (globalThis.import as any).meta = originalImportMeta;
      }
    });
  });

  describe('FAVORITES_ENABLED', () => {
    it('should return true when auth is enabled', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      expect(FeatureFlags.FAVORITES_ENABLED).toBe(true);
    });

    it('should return false when auth is disabled', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'false');
      expect(FeatureFlags.FAVORITES_ENABLED).toBe(false);
    });
  });

  describe('SOCIAL_AUTH_ENABLED', () => {
    it('should return true when auth is enabled', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      expect(FeatureFlags.SOCIAL_AUTH_ENABLED).toBe(true);
    });

    it('should return false when auth is disabled', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'false');
      expect(FeatureFlags.SOCIAL_AUTH_ENABLED).toBe(false);
    });
  });

  describe('USER_PROFILES_ENABLED', () => {
    it('should return true when auth is enabled', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      expect(FeatureFlags.USER_PROFILES_ENABLED).toBe(true);
    });

    it('should return false when auth is disabled', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'false');
      expect(FeatureFlags.USER_PROFILES_ENABLED).toBe(false);
    });
  });

  describe('DEV_MODE', () => {
    it('should return true when NODE_ENV is development', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(FeatureFlags.DEV_MODE).toBe(true);
    });

    it('should return false when NODE_ENV is production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      expect(FeatureFlags.DEV_MODE).toBe(false);
    });

    it('should return false when NODE_ENV is test', () => {
      vi.stubEnv('NODE_ENV', 'test');
      expect(FeatureFlags.DEV_MODE).toBe(false);
    });

    it('should handle server-side contexts without import.meta', () => {
      // Mock scenario where import.meta is undefined (server-side)
      const originalImportMeta = globalThis.import?.meta;
      if (globalThis.import) {
        delete (globalThis.import as any).meta;
      }

      process.env.NODE_ENV = 'development';
      expect(FeatureFlags.DEV_MODE).toBe(true);

      process.env.NODE_ENV = 'production';
      expect(FeatureFlags.DEV_MODE).toBe(false);

      // Restore import.meta if it existed
      if (originalImportMeta && globalThis.import) {
        (globalThis.import as any).meta = originalImportMeta;
      }
    });
  });

  describe('AUTH_CONFIG_VALID', () => {
    it('should return true when auth is disabled', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'false');
      expect(FeatureFlags.AUTH_CONFIG_VALID).toBe(true);
    });

    it('should return true when auth is enabled and all required vars are present', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
      vi.stubEnv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      
      expect(FeatureFlags.AUTH_CONFIG_VALID).toBe(true);
    });

    it('should return false when auth is enabled but SUPABASE_URL is missing', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      vi.stubEnv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      
      expect(FeatureFlags.AUTH_CONFIG_VALID).toBe(false);
    });

    it('should return false when auth is enabled but SUPABASE_ANON_KEY is missing', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
      
      expect(FeatureFlags.AUTH_CONFIG_VALID).toBe(false);
    });

    it('should return false when auth is enabled but required vars are empty', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      vi.stubEnv('SUPABASE_URL', '');
      vi.stubEnv('SUPABASE_ANON_KEY', '   ');
      
      expect(FeatureFlags.AUTH_CONFIG_VALID).toBe(false);
    });

    it('should handle server-side contexts without import.meta', () => {
      // Mock scenario where import.meta is undefined (server-side)
      const originalImportMeta = globalThis.import?.meta;
      if (globalThis.import) {
        delete (globalThis.import as any).meta;
      }

      process.env.ENABLE_USER_AUTH = 'true';
      process.env.SUPABASE_URL = 'https://example.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      
      expect(FeatureFlags.AUTH_CONFIG_VALID).toBe(true);

      // Restore import.meta if it existed
      if (originalImportMeta && globalThis.import) {
        (globalThis.import as any).meta = originalImportMeta;
      }
    });

    it('should handle errors gracefully', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      
      // Mock console.warn to verify error handling
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Force an error by making import.meta.env undefined but accessing it anyway
      const originalEnv = import.meta.env;
      Object.defineProperty(import.meta, 'env', {
        get: () => {
          throw new Error('Test error');
        },
        configurable: true,
      });

      const result = FeatureFlags.AUTH_CONFIG_VALID;
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error checking auth config:', expect.any(Error));

      // Restore original env
      Object.defineProperty(import.meta, 'env', {
        value: originalEnv,
        configurable: true,
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('useFeatureFlag', () => {
    it('should return the correct flag value', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      expect(useFeatureFlag('AUTH_ENABLED')).toBe(true);
      
      vi.stubEnv('ENABLE_USER_AUTH', 'false');
      expect(useFeatureFlag('AUTH_ENABLED')).toBe(false);
    });

    it('should work with all feature flags', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
      vi.stubEnv('SUPABASE_ANON_KEY', 'key');
      vi.stubEnv('NODE_ENV', 'development');

      expect(useFeatureFlag('AUTH_ENABLED')).toBe(true);
      expect(useFeatureFlag('FAVORITES_ENABLED')).toBe(true);
      expect(useFeatureFlag('SOCIAL_AUTH_ENABLED')).toBe(true);
      expect(useFeatureFlag('USER_PROFILES_ENABLED')).toBe(true);
      expect(useFeatureFlag('DEV_MODE')).toBe(true);
      expect(useFeatureFlag('AUTH_CONFIG_VALID')).toBe(true);
    });
  });

  describe('renderIfAuth', () => {
    it('should render when auth is enabled', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      
      const component = () => '<div>Auth Component</div>';
      const result = renderIfAuth(component);
      
      expect(result).toBe('<div>Auth Component</div>');
    });

    it('should return null when auth is disabled', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'false');
      
      const component = () => '<div>Auth Component</div>';
      const result = renderIfAuth(component);
      
      expect(result).toBeNull();
    });

    it('should handle complex components', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      
      const complexComponent = () => ({
        type: 'AuthComponent',
        props: { user: 'testUser' },
      });
      
      const result = renderIfAuth(complexComponent);
      
      expect(result).toEqual({
        type: 'AuthComponent',
        props: { user: 'testUser' },
      });
    });
  });

  describe('renderIfFavorites', () => {
    it('should render when favorites are enabled (auth enabled)', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      
      const component = () => '<div>Favorites Component</div>';
      const result = renderIfFavorites(component);
      
      expect(result).toBe('<div>Favorites Component</div>');
    });

    it('should return null when favorites are disabled (auth disabled)', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'false');
      
      const component = () => '<div>Favorites Component</div>';
      const result = renderIfFavorites(component);
      
      expect(result).toBeNull();
    });
  });

  describe('getAuthStatusMessage', () => {
    it('should return disabled message when auth is disabled', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'false');
      
      const message = getAuthStatusMessage();
      
      expect(message).toBe('User authentication is disabled');
    });

    it('should return incomplete config message when auth is enabled but config is invalid', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      // Don't set required environment variables
      
      const message = getAuthStatusMessage();
      
      expect(message).toBe('Authentication configuration is incomplete');
    });

    it('should return enabled message when auth is enabled and config is valid', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
      vi.stubEnv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      
      const message = getAuthStatusMessage();
      
      expect(message).toBe('Authentication is enabled and configured');
    });
  });

  describe('logFeatureFlags', () => {
    it('should log feature flags when in development mode', () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
      vi.stubEnv('SUPABASE_ANON_KEY', 'key');

      const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

      logFeatureFlags();

      expect(consoleGroupSpy).toHaveBeenCalledWith('🏃 Feature Flags Status');
      expect(consoleLogSpy).toHaveBeenCalledWith('AUTH_ENABLED:', true);
      expect(consoleLogSpy).toHaveBeenCalledWith('FAVORITES_ENABLED:', true);
      expect(consoleLogSpy).toHaveBeenCalledWith('SOCIAL_AUTH_ENABLED:', true);
      expect(consoleLogSpy).toHaveBeenCalledWith('USER_PROFILES_ENABLED:', true);
      expect(consoleLogSpy).toHaveBeenCalledWith('AUTH_CONFIG_VALID:', true);
      expect(consoleLogSpy).toHaveBeenCalledWith('DEV_MODE:', true);
      expect(consoleGroupEndSpy).toHaveBeenCalled();

      consoleGroupSpy.mockRestore();
      consoleLogSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });

    it('should not log feature flags when not in development mode', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      logFeatureFlags();

      expect(consoleGroupSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();

      consoleGroupSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle missing environment variables gracefully', () => {
      // Clear all environment variables
      vi.unstubAllEnvs();
      
      expect(FeatureFlags.AUTH_ENABLED).toBe(false);
      expect(FeatureFlags.FAVORITES_ENABLED).toBe(false);
      expect(FeatureFlags.SOCIAL_AUTH_ENABLED).toBe(false);
      expect(FeatureFlags.USER_PROFILES_ENABLED).toBe(false);
      expect(FeatureFlags.AUTH_CONFIG_VALID).toBe(true); // True when auth is disabled
    });

    it('should handle whitespace-only environment variables', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'true');
      vi.stubEnv('SUPABASE_URL', '   ');
      vi.stubEnv('SUPABASE_ANON_KEY', '\t\n');
      
      expect(FeatureFlags.AUTH_CONFIG_VALID).toBe(false);
    });

    it('should handle boolean-like strings correctly', () => {
      vi.stubEnv('ENABLE_USER_AUTH', 'TRUE');
      expect(FeatureFlags.AUTH_ENABLED).toBe(false);
      
      vi.stubEnv('ENABLE_USER_AUTH', '1');
      expect(FeatureFlags.AUTH_ENABLED).toBe(false);
      
      vi.stubEnv('ENABLE_USER_AUTH', 'yes');
      expect(FeatureFlags.AUTH_ENABLED).toBe(false);
    });
  });
});