import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { AuthService, type AuthResult, type LoginCredentials, type RegisterCredentials } from './auth-service';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Mock the supabase module
vi.mock('./supabase.js', () => {
  const mockSupabase = {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  };

  return {
    supabase: mockSupabase,
    isAuthEnabled: vi.fn(),
  };
});

// Import mocked functions
import { supabase, isAuthEnabled } from './supabase.js';

const mockSupabase = supabase as any;
const mockIsAuthEnabled = isAuthEnabled as MockedFunction<typeof isAuthEnabled>;

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to auth enabled for most tests
    mockIsAuthEnabled.mockReturnValue(true);
    
    // Mock window.location for tests that need it
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
      },
      writable: true,
    });
  });

  describe('isEnabled', () => {
    it('should return true when auth is enabled', () => {
      mockIsAuthEnabled.mockReturnValue(true);
      expect(AuthService.isEnabled()).toBe(true);
    });

    it('should return false when auth is disabled', () => {
      mockIsAuthEnabled.mockReturnValue(false);
      expect(AuthService.isEnabled()).toBe(false);
    });
  });

  describe('register', () => {
    const validCredentials: RegisterCredentials = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockSession: Partial<Session> = {
        access_token: 'token-123',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await AuthService.register(validCredentials);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: validCredentials.email,
        password: validCredentials.password,
        options: {
          data: {
            full_name: validCredentials.fullName,
          },
        },
      });
    });

    it('should handle registration failure', async () => {
      const mockError: Partial<AuthError> = {
        message: 'Email already registered',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await AuthService.register(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });

    it('should handle registration with minimal credentials', async () => {
      const minimalCredentials: RegisterCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: {}, session: {} },
        error: null,
      });

      await AuthService.register(minimalCredentials);

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: minimalCredentials.email,
        password: minimalCredentials.password,
        options: {
          data: {
            full_name: '',
          },
        },
      });
    });

    it('should return error when auth is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await AuthService.register(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication is disabled');
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.signUp.mockRejectedValue(new Error('Network error'));

      const result = await AuthService.register(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      mockSupabase.auth.signUp.mockRejectedValue('String error');

      const result = await AuthService.register(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Registration failed');
    });
  });

  describe('login', () => {
    const validCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockSession: Partial<Session> = {
        access_token: 'token-123',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await AuthService.login(validCredentials);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: validCredentials.email,
        password: validCredentials.password,
      });
    });

    it('should handle login failure', async () => {
      const mockError: Partial<AuthError> = {
        message: 'Invalid credentials',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await AuthService.login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should return error when auth is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await AuthService.login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication is disabled');
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

      const result = await AuthService.login(validCredentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('loginWithProvider', () => {
    it('should initiate social login successfully', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://provider.com/auth' },
        error: null,
      });

      const result = await AuthService.loginWithProvider('google');

      expect(result.success).toBe(true);
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });
    });

    it('should use custom redirect URL', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://provider.com/auth' },
        error: null,
      });

      await AuthService.loginWithProvider('github', 'http://localhost:3000/custom-callback');

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3000/custom-callback',
        },
      });
    });

    it('should handle social login failure', async () => {
      const mockError: Partial<AuthError> = {
        message: 'Provider not configured',
      };

      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await AuthService.loginWithProvider('discord');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Provider not configured');
    });

    it('should return error when auth is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await AuthService.loginWithProvider('twitter');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication is disabled');
      expect(mockSupabase.auth.signInWithOAuth).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await AuthService.logout();

      expect(result.success).toBe(true);
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle logout failure', async () => {
      const mockError: Partial<AuthError> = {
        message: 'Logout failed',
      };

      mockSupabase.auth.signOut.mockResolvedValue({
        error: mockError,
      });

      const result = await AuthService.logout();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Logout failed');
    });

    it('should return error when auth is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await AuthService.logout();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication is disabled');
      expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.signOut.mockRejectedValue(new Error('Network error'));

      const result = await AuthService.logout();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getSession', () => {
    it('should return session when available', async () => {
      const mockSession: Partial<Session> = {
        access_token: 'token-123',
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await AuthService.getSession();

      expect(result).toEqual(mockSession);
    });

    it('should return null when no session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await AuthService.getSession();

      expect(result).toBeNull();
    });

    it('should return null when auth is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await AuthService.getSession();

      expect(result).toBeNull();
      expect(mockSupabase.auth.getSession).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session error'),
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await AuthService.getSession();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error getting session:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when available', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return null when auth is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await AuthService.getCurrentUser();

      expect(result).toBeNull();
      expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('User error'),
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await AuthService.getCurrentUser();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error getting current user:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile when found', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });
      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await AuthService.getUserProfile();

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    it('should return user profile with provided userId', async () => {
      const userId = 'user-456';
      const mockProfile = {
        id: userId,
        email: 'test@example.com',
        full_name: 'Test User',
      };

      const mockEq = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      });
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await AuthService.getUserProfile(userId);

      expect(result).toEqual(mockProfile);
      expect(mockEq).toHaveBeenCalledWith('id', userId);
    });

    it('should return null when auth is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await AuthService.getUserProfile();

      expect(result).toBeNull();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return null when no current user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await AuthService.getUserProfile();

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      });
      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await AuthService.getUserProfile();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error getting user profile:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const updates = {
        full_name: 'Updated Name',
        bio: 'Updated bio',
      };
      const updatedProfile = {
        id: 'user-123',
        ...updates,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: updatedProfile,
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });
      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      const result = await AuthService.updateProfile(updates);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', mockUser.id);
    });

    it('should return error when auth is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await AuthService.updateProfile({});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication is disabled');
    });

    it('should return error when no user found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await AuthService.updateProfile({});

      expect(result.success).toBe(false);
      expect(result.error).toBe('No authenticated user found');
    });

    it('should handle database errors', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      });
      const mockSelect = vi.fn().mockReturnValue({
        single: mockSingle,
      });
      const mockEq = vi.fn().mockReturnValue({
        select: mockSelect,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      const result = await AuthService.updateProfile({});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await AuthService.resetPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'http://localhost:3000/auth/reset-password',
        }
      );
    });

    it('should handle reset password failure', async () => {
      const mockError: Partial<AuthError> = {
        message: 'User not found',
      };

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await AuthService.resetPassword('test@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should return error when auth is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await AuthService.resetPassword('test@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication is disabled');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await AuthService.updatePassword('newpassword123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
    });

    it('should handle password update failure', async () => {
      const mockError: Partial<AuthError> = {
        message: 'Password too weak',
      };

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await AuthService.updatePassword('weak');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password too weak');
    });

    it('should return error when auth is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await AuthService.updatePassword('newpassword123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication is disabled');
    });
  });

  describe('onAuthStateChange', () => {
    it('should set up auth state listener when auth is enabled', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      const mockSubscription = {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      };

      mockSupabase.auth.onAuthStateChange.mockReturnValue(mockSubscription);

      const result = AuthService.onAuthStateChange(mockCallback);

      expect(result).toEqual(mockSubscription);
      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
    });

    it('should return dummy subscription when auth is disabled', () => {
      mockIsAuthEnabled.mockReturnValue(false);
      const mockCallback = vi.fn();

      const result = AuthService.onAuthStateChange(mockCallback);

      expect(result.data.subscription.unsubscribe).toBeInstanceOf(Function);
      expect(mockSupabase.auth.onAuthStateChange).not.toHaveBeenCalled();
    });
  });
});