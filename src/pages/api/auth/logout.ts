import type { APIRoute } from 'astro';
import { createServerSupabaseClient, isAuthEnabled } from '../../../lib/supabase-ssr.js';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Check if authentication is enabled
  if (!isAuthEnabled()) {
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
    // Create Supabase client with cookie management
    const supabase = createServerSupabaseClient({ request, cookies });

    // Attempt logout
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Logged out successfully' 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Logout API error:', error);
    
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
      error: 'Method not allowed. Use POST for logout.' 
    }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};