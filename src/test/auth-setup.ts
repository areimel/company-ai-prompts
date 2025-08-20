/**
 * Authentication Test Setup
 * 
 * This file contains setup code that runs before authentication tests.
 * It mocks browser APIs and sets up the testing environment for auth functionality.
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Mock browser APIs that auth components might use
global.window = Object.create(window);
global.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
} as any;

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock URL constructor for OAuth redirects
global.URL = class URL {
  href: string;
  origin: string;
  pathname: string;
  search: string;
  hash: string;
  
  constructor(url: string, base?: string) {
    this.href = url;
    this.origin = 'http://localhost:3000';
    this.pathname = '/';
    this.search = '';
    this.hash = '';
  }
} as any;

// Mock crypto for PKCE
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: (array: any) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
});

// Mock process.env for server-side contexts
if (typeof process !== 'undefined') {
  process.env = {
    ...process.env,
    ENABLE_USER_AUTH: 'true',
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    NODE_ENV: 'test',
  };
}

// Initialize import.meta if it doesn't exist, but don't override
if (typeof globalThis.import === 'undefined') {
  Object.defineProperty(globalThis, 'import', {
    value: {
      meta: {
        env: {},
      },
    },
    writable: true,
    configurable: true,
  });
}

// Test utilities for auth testing
export const authTestUtils = {
  /**
   * Create a mock user object for testing
   */
  createMockUser: (overrides: any = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: '2025-01-01T00:00:00Z',
    user_metadata: {
      full_name: 'Test User',
    },
    ...overrides,
  }),

  /**
   * Create a mock session object for testing
   */
  createMockSession: (overrides: any = {}) => ({
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: authTestUtils.createMockUser(),
    ...overrides,
  }),

  /**
   * Create a mock user profile for testing
   */
  createMockProfile: (overrides: any = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    display_name: 'TestUser',
    bio: 'Test bio',
    avatar_url: null,
    website: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }),

  /**
   * Create a mock favorite item for testing
   */
  createMockFavorite: (overrides: any = {}) => ({
    id: 'test-favorite-id',
    user_id: 'test-user-id',
    content_type: 'prompt' as const,
    content_slug: 'test-prompt-slug',
    content_title: 'Test Prompt',
    created_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }),

  /**
   * Reset all mocks to clean state
   */
  resetMocks: () => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    sessionStorageMock.clear.mockClear();
  },

  /**
   * Mock successful API response
   */
  mockApiSuccess: (data: any) => ({
    data,
    error: null,
  }),

  /**
   * Mock API error response
   */
  mockApiError: (message: string) => ({
    data: null,
    error: { message },
  }),
};

// Global setup for each test
beforeEach(() => {
  // Reset mocks before each test
  authTestUtils.resetMocks();
});

// Cleanup after each test
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

// Console setup for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Suppress expected console errors in tests unless explicitly needed
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Export test utilities
export default authTestUtils;