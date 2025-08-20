import type { APIRoute } from 'astro';
import { FavoritesService } from '../../../lib/favorites-service.js';

export const GET: APIRoute = async ({ url }) => {
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
    // Parse query parameters
    const searchParams = url.searchParams;
    const contentType = searchParams.get('type') as 'prompt' | 'persona' | 'blog' | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validate parameters
    if (page < 1) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Page number must be greater than 0' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Limit must be between 1 and 100' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (contentType && !['prompt', 'persona', 'blog'].includes(contentType)) {
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

    // Get user's favorites
    const result = await FavoritesService.getUserFavorites(
      contentType || undefined,
      page,
      limit
    );

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          items: result.items,
          pagination: {
            page,
            limit,
            hasMore: result.hasMore,
            totalShown: result.items.length
          }
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Get favorites API error:', error);
    
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

export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({ 
      error: 'Method not allowed. Use GET to retrieve favorites.' 
    }),
    { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};