import type { APIRoute } from 'astro';
import { FavoritesService } from '../../../lib/favorites-service.js';

export const POST: APIRoute = async ({ request }) => {
  // Check if favorites functionality is enabled
  if (!FavoritesService.isEnabled()) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Favorites feature is disabled' 
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
    const { contentType, contentSlug, contentTitle } = body;

    // Validate input
    if (!contentType || !contentSlug) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Content type and slug are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate content type
    if (!['prompt', 'persona', 'blog'].includes(contentType)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid content type. Must be prompt, persona, or blog' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Toggle favorite status
    const result = await FavoritesService.toggleFavorite(
      contentType,
      contentSlug,
      contentTitle
    );

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

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        isFavorited: result.isFavorited,
        message: result.isFavorited ? 'Added to favorites' : 'Removed from favorites'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Toggle favorite API error:', error);
    
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
      error: 'Method not allowed. Use POST to toggle favorites.' 
    }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};