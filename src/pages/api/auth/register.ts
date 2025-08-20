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
    // Parse request body
    const body = await request.json();
    const { email, password, fullName, confirmPassword } = body;

    // Validate required fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email and password are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email format' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Password must be at least 8 characters long' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check password confirmation if provided
    if (confirmPassword && password !== confirmPassword) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Passwords do not match' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate full name if provided
    if (fullName && (fullName.length < 2 || fullName.length > 100)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Full name must be between 2 and 100 characters' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase client with cookie management
    const supabase = createServerSupabaseClient({ request, cookies });

    // Attempt registration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });

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
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          created_at: data.user?.created_at,
        }
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Registration API error:', error);
    
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
      error: 'Method not allowed. Use POST for registration.' 
    }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};