import { defineMiddleware } from "astro:middleware";
import { createServerSupabaseClient, isAuthEnabled } from "./lib/supabase-ssr.js";

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/profile',
  '/dashboard',
  '/favorites',
  '/settings',
  '/account',
];

// Define auth routes that should redirect authenticated users
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/auth/callback',
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, locals, redirect, cookies, request } = context;
  
  // Skip auth middleware if authentication is disabled
  if (!isAuthEnabled()) {
    // Clear any auth state when disabled
    locals.session = null;
    locals.user = null;
    locals.isAuthenticated = false;
    return next();
  }

  // Get pathname from URL
  const pathname = url.pathname;
  
  try {
    // Create server-side Supabase client with cookie management
    const supabase = createServerSupabaseClient({ request, cookies });
    
    // Use getUser() for secure server-side authentication (not getSession())
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Middleware auth error:', error);
    }

    // Add auth state to locals for use in pages/components
    locals.user = user;
    locals.isAuthenticated = !!user;
    
    // Get session data for additional info (but don't rely on it for auth)
    const { data: { session } } = await supabase.auth.getSession();
    locals.session = session;

    // Check if current route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname.startsWith(route)
    );

    // Check if current route is an auth route
    const isAuthRoute = AUTH_ROUTES.some(route => 
      pathname.startsWith(route)
    );

    // Handle protected routes
    if (isProtectedRoute && !locals.isAuthenticated) {
      // Store the intended destination for redirect after login
      const redirectUrl = encodeURIComponent(url.pathname + url.search);
      return redirect(`/login?redirect=${redirectUrl}`);
    }

    // Handle auth routes (redirect authenticated users away from login/register)
    if (isAuthRoute && locals.isAuthenticated) {
      // Don't redirect callback route as it needs to process the auth
      if (pathname.startsWith('/auth/callback')) {
        return next();
      }
      
      // Check for redirect parameter
      const redirectParam = url.searchParams.get('redirect');
      if (redirectParam) {
        try {
          const decodedRedirect = decodeURIComponent(redirectParam);
          // Validate redirect URL is safe (same origin)
          const redirectUrl = new URL(decodedRedirect, url.origin);
          if (redirectUrl.origin === url.origin) {
            return redirect(decodedRedirect);
          }
        } catch (e) {
          // Invalid redirect URL, fall through to default
        }
      }
      
      // Default redirect for authenticated users on auth pages
      return redirect('/dashboard');
    }

    // Continue to the requested page
    return next();
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, clear any potentially corrupted auth state
    locals.session = null;
    locals.user = null;
    locals.isAuthenticated = false;
    
    // If we're on a protected route and there's an auth error, redirect to login
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname.startsWith(route)
    );
    
    if (isProtectedRoute) {
      const redirectUrl = encodeURIComponent(url.pathname + url.search);
      return redirect(`/login?redirect=${redirectUrl}&error=auth_error`);
    }
    
    // Continue for non-protected routes
    return next();
  }
});

// Extend Astro locals interface to include auth data
declare global {
  namespace App {
    interface Locals {
      session: any;
      user: any;
      isAuthenticated: boolean;
    }
  }
}