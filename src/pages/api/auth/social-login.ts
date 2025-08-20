import type { APIRoute } from 'astro';
import { AuthService, type SocialProvider } from '../../../lib/auth-service.js';

export const POST: APIRoute = async ({ request }) => {
  // Check if authentication is enabled
  if (!AuthService.isEnabled()) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Authentication is disabled' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Parse request body
    const body = await request.json();
    const { provider, redirectTo } = body;

    // Validate input
    if (!provider) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Provider is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate provider
    const validProviders: SocialProvider[] = ['google', 'github', 'discord', 'twitter'];
    if (!validProviders.includes(provider)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid provider. Must be google, github, discord, or twitter' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate redirectTo URL
    let validatedRedirectTo = '/';
    if (redirectTo) {
      try {
        const url = new URL(redirectTo, 'http://localhost'); // Use dummy base for relative URLs
        validatedRedirectTo = url.pathname + url.search;
      } catch (error) {
        console.warn('Invalid redirectTo URL, using default:', redirectTo);
      }
    }

    // Attempt social login
    const result = await AuthService.loginWithProvider(provider, validatedRedirectTo);

    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: result.error 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // For OAuth flows, Supabase handles the redirect automatically
    // The result won't contain a URL in newer versions, but we return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Initiating ${provider} login...`,
        provider
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Social login API error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ 
      error: 'Method not allowed. Use POST for social login.' 
    }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};