// Re-export SSR utilities and client creation functions
export { 
  createServerSupabaseClient, 
  createBrowserSupabaseClient, 
  isAuthEnabled,
  type UserProfile,
  type UserFavorite 
} from './supabase-ssr.js';

// Legacy compatibility - create a basic client for non-SSR operations
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.');
}

// Legacy client for backward compatibility (use SSR clients in production)
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
}) : null;

// Types for our database schema
export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  display_name: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  content_type: 'prompt' | 'persona' | 'blog';
  content_slug: string;
  content_title: string | null;
  created_at: string;
}

// Helper function to check if user authentication is enabled
export function isAuthEnabled(): boolean {
  return import.meta.env.ENABLE_USER_AUTH === 'true';
}

// Helper function to get current user session
export async function getCurrentUser() {
  if (!isAuthEnabled()) {
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Helper function to get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isAuthEnabled()) {
    return null;
  }
  
  try {
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