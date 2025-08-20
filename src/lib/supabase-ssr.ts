import { createServerClient, createBrowserClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Environment variables
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

// Helper function to check if user authentication is enabled
export function isAuthEnabled(): boolean {
  return import.meta.env.ENABLE_USER_AUTH === 'true';
}

// Check environment variables only if auth is enabled
function validateEnvironment() {
  if (isAuthEnabled() && (!supabaseUrl || !supabaseAnonKey)) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
    return false;
  }
  return true;
}

/**
 * Create a Supabase client for server-side operations (middleware, API endpoints)
 * This client manages sessions using cookies for SSR compatibility
 */
export function createServerSupabaseClient({ 
  request, 
  cookies 
}: { 
  request: Request; 
  cookies: AstroCookies; 
}) {
  if (!validateEnvironment()) {
    throw new Error('Supabase configuration is invalid or authentication is disabled');
  }

  // Get cookie header from the request
  const cookieHeader = request.headers.get("Cookie") || "";

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Parse the cookie header to get all cookies
        const parsedCookies = parseCookieHeader(cookieHeader);
        return parsedCookies.map(({ name, value }) => ({
          name,
          value: value ?? '',
        }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, {
            ...options,
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
          });
        });
      },
    },
  });
}

/**
 * Create a Supabase client for browser-side operations
 * This client handles client-side authentication and session management
 */
export function createBrowserSupabaseClient() {
  // Only create browser client if we're in the browser environment
  if (typeof window === 'undefined') {
    throw new Error('createBrowserSupabaseClient should only be called in browser environment');
  }

  const publicUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const publicKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (isAuthEnabled() && (!publicUrl || !publicKey)) {
    throw new Error('Missing public Supabase environment variables for browser client');
  }

  return createBrowserClient(publicUrl, publicKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
}

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