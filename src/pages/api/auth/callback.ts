import type { APIRoute } from 'astro';
import { supabase, isAuthEnabled } from '../../../lib/supabase.js';

export const GET: APIRoute = async ({ url, redirect }) => {
  // Check if authentication is enabled
  if (!isAuthEnabled()) {
    return redirect('/login?error=auth_disabled');
  }

  try {
    // Extract code and state from URL parameters
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      const errorParam = encodeURIComponent(errorDescription || error);
      return redirect(`/login?error=${errorParam}`);
    }

    // Handle missing code
    if (!code) {
      return redirect('/login?error=missing_auth_code');
    }

    // Exchange the auth code for a session
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('Session exchange error:', sessionError);
      const errorParam = encodeURIComponent(sessionError.message);
      return redirect(`/login?error=${errorParam}`);
    }

    if (!data.session) {
      return redirect('/login?error=no_session_created');
    }

    // Successful authentication
    console.log('OAuth callback successful for user:', data.user?.email);

    // Determine redirect destination
    let redirectTo = '/dashboard';

    // Check if there's a stored redirect destination in state
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state));
        if (stateData.redirect && typeof stateData.redirect === 'string') {
          // Validate that redirect URL is safe (same origin)
          const redirectUrl = new URL(stateData.redirect, url.origin);
          if (redirectUrl.origin === url.origin) {
            redirectTo = stateData.redirect;
          }
        }
      } catch (e) {
        // Invalid state, use default redirect
        console.warn('Invalid state parameter in OAuth callback:', e);
      }
    }

    // Redirect to success destination
    return redirect(redirectTo);

  } catch (error) {
    console.error('OAuth callback error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'authentication_failed';
    const errorParam = encodeURIComponent(errorMessage);
    
    return redirect(`/login?error=${errorParam}`);
  }
};

export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({ 
      error: 'Method not allowed. OAuth callback uses GET.' 
    }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};