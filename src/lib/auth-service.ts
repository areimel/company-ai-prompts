import { createBrowserSupabaseClient, isAuthEnabled, type UserProfile } from './supabase-ssr.js';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Authentication result types
export interface AuthResult {
  success: boolean;
  user?: User | null;
  error?: string;
  session?: Session | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName?: string;
}

// Social auth providers supported
export type SocialProvider = 'google' | 'github' | 'discord' | 'twitter';

/**
 * Authentication Service - Orchestrator for all auth operations
 * Provides a centralized interface for user authentication and session management
 */
export class AuthService {
  
  /**
   * Check if authentication is enabled in the application
   */
  static isEnabled(): boolean {
    return isAuthEnabled();
  }

  /**
   * Register a new user with email and password
   */
  static async register(credentials: RegisterCredentials): Promise<AuthResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Authentication is disabled' };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName || '',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  /**
   * Sign in with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Authentication is disabled' };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Failed to initialize authentication client' };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Sign in with social provider
   */
  static async loginWithProvider(provider: SocialProvider, redirectTo?: string): Promise<AuthResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Authentication is disabled' };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Failed to initialize authentication client' };
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // For OAuth, the actual auth happens via redirect
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Social login failed',
      };
    }
  }

  /**
   * Sign out the current user
   */
  static async logout(): Promise<AuthResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Authentication is disabled' };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Failed to initialize authentication client' };
      }
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }

  /**
   * Get the current user session
   */
  static async getSession(): Promise<Session | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return null;
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Get the current user
   */
  static async getCurrentUser(): Promise<User | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return null;
      }
      
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get user profile data
   */
  static async getUserProfile(userId?: string): Promise<UserProfile | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return null;
      }
      
      // If no userId provided, get current user's profile
      if (!userId) {
        const user = await this.getCurrentUser();
        if (!user) return null;
        userId = user.id;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: Partial<UserProfile>): Promise<AuthResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Authentication is disabled' };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Failed to initialize authentication client' };
      }
      
      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, error: 'No authenticated user found' };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Profile update failed',
      };
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<AuthResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Authentication is disabled' };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Failed to initialize authentication client' };
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<AuthResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Authentication is disabled' };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Failed to initialize authentication client' };
      }
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password update failed',
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!this.isEnabled()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
      console.error('Error setting up auth state change listener:', error);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
}