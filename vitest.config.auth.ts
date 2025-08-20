import { defineConfig } from 'vitest/config';

/**
 * Specialized Vitest configuration for authentication tests
 * 
 * This configuration is optimized for testing authentication functionality
 * with proper mocking of Supabase and browser APIs.
 */
export default defineConfig({
  test: {
    environment: 'jsdom', // Use jsdom for browser-like environment needed for auth
    globals: true,
    setupFiles: ['./src/test/auth-setup.ts'], // Auth-specific test setup
    include: [
      'src/**/*auth*.{test,spec}.{js,ts}',
      'src/**/auth-*.{test,spec}.{js,ts}',
      'src/**/*favorite*.{test,spec}.{js,ts}',
      'src/**/*feature-flag*.{test,spec}.{js,ts}',
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'src/**/*.d.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/lib/auth-service.ts',
        'src/lib/favorites-service.ts',
        'src/lib/feature-flags.ts',
        'src/lib/supabase.ts',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/test/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/lib/auth-service.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/lib/favorites-service.ts': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'src/lib/feature-flags.ts': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },
    // Mock browser APIs and Supabase
    env: {},
    // Longer timeout for auth operations
    testTimeout: 10000,
    // Run tests serially to avoid auth state conflicts
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  // Resolve modules for testing
  resolve: {
    alias: {
      '@lib': '/src/lib',
      '@utils': '/src/utils',
      '@components': '/src/components',
      '@layouts': '/src/layouts',
      '@assets': '/src/assets',
      '@pages': '/src/pages',
      '@data': '/src/data',
    },
  },
  // Define globals for auth testing
  define: {},
});