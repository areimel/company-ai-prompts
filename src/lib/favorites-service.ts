import { createBrowserSupabaseClient, isAuthEnabled, type UserFavorite } from './supabase-ssr.js';

// Favorites service result types
export interface FavoritesResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface FavoriteItem {
  id: string;
  content_type: 'prompt' | 'persona' | 'blog';
  content_slug: string;
  content_title: string | null;
  created_at: string;
}

export interface PaginatedFavorites {
  items: FavoriteItem[];
  total: number;
  hasMore: boolean;
}

/**
 * Favorites Service - Orchestrator for favorites functionality
 * Provides a centralized interface for managing user favorites
 */
export class FavoritesService {

  /**
   * Check if favorites functionality is enabled
   */
  static isEnabled(): boolean {
    return isAuthEnabled();
  }

  /**
   * Add content to user's favorites
   */
  static async addToFavorites(
    contentType: 'prompt' | 'persona' | 'blog',
    contentSlug: string,
    contentTitle?: string
  ): Promise<FavoritesResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Favorites feature is disabled' };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Failed to initialize database client' };
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User must be authenticated to add favorites' };
      }

      // Use the database function for adding favorites
      const { data, error } = await supabase.rpc('add_to_favorites', {
        p_content_type: contentType,
        p_content_slug: contentSlug,
        p_content_title: contentTitle || null,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add favorite',
      };
    }
  }

  /**
   * Remove content from user's favorites
   */
  static async removeFromFavorites(
    contentType: 'prompt' | 'persona' | 'blog',
    contentSlug: string
  ): Promise<FavoritesResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Favorites feature is disabled' };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Failed to initialize database client' };
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User must be authenticated to remove favorites' };
      }

      // Use the database function for removing favorites
      const { data, error } = await supabase.rpc('remove_from_favorites', {
        p_content_type: contentType,
        p_content_slug: contentSlug,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove favorite',
      };
    }
  }

  /**
   * Check if content is favorited by current user
   */
  static async isFavorited(
    contentType: 'prompt' | 'persona' | 'blog',
    contentSlug: string
  ): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return false;
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return false;
      }

      // Use the database function for checking favorite status
      const { data, error } = await supabase.rpc('is_favorited', {
        p_content_type: contentType,
        p_content_slug: contentSlug,
      });

      if (error) {
        console.error('Error checking favorite status:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  /**
   * Get user's favorites with pagination
   */
  static async getUserFavorites(
    contentType?: 'prompt' | 'persona' | 'blog',
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedFavorites> {
    if (!this.isEnabled()) {
      return { items: [], total: 0, hasMore: false };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return { items: [], total: 0, hasMore: false };
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { items: [], total: 0, hasMore: false };
      }

      const offset = (page - 1) * limit;

      // Use the database function for getting favorites
      const { data, error } = await supabase.rpc('get_user_favorites', {
        p_content_type: contentType || null,
        p_limit: limit + 1, // Get one extra to check if there are more
        p_offset: offset,
      });

      if (error) {
        console.error('Error getting user favorites:', error);
        return { items: [], total: 0, hasMore: false };
      }

      const items = data || [];
      const hasMore = items.length > limit;
      
      // Remove the extra item if it exists
      if (hasMore) {
        items.pop();
      }

      return {
        items: items.slice(0, limit),
        total: items.length, // This is just the current page count, not total
        hasMore,
      };
    } catch (error) {
      console.error('Error getting user favorites:', error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  /**
   * Toggle favorite status for content
   */
  static async toggleFavorite(
    contentType: 'prompt' | 'persona' | 'blog',
    contentSlug: string,
    contentTitle?: string
  ): Promise<FavoritesResult & { isFavorited: boolean }> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Favorites feature is disabled', isFavorited: false };
    }

    try {
      const isFavorited = await this.isFavorited(contentType, contentSlug);

      if (isFavorited) {
        const result = await this.removeFromFavorites(contentType, contentSlug);
        return { ...result, isFavorited: false };
      } else {
        const result = await this.addToFavorites(contentType, contentSlug, contentTitle);
        return { ...result, isFavorited: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle favorite',
        isFavorited: false,
      };
    }
  }

  /**
   * Get favorites count for a user
   */
  static async getFavoritesCount(contentType?: 'prompt' | 'persona' | 'blog'): Promise<number> {
    if (!this.isEnabled()) {
      return 0;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return 0;
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return 0;
      }

      let query = supabase
        .from('user_favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error getting favorites count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting favorites count:', error);
      return 0;
    }
  }

  /**
   * Get multiple favorite statuses at once (for efficient bulk checking)
   */
  static async getBulkFavoriteStatus(
    items: Array<{ contentType: 'prompt' | 'persona' | 'blog'; contentSlug: string }>
  ): Promise<Record<string, boolean>> {
    if (!this.isEnabled() || items.length === 0) {
      return {};
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return {};
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return {};
      }

      // Create OR conditions for each item
      const orConditions = items.map(item => 
        `(content_type.eq.${item.contentType},content_slug.eq.${item.contentSlug})`
      ).join(',');

      const { data, error } = await supabase
        .from('user_favorites')
        .select('content_type, content_slug')
        .eq('user_id', user.id)
        .or(orConditions);

      if (error) {
        console.error('Error getting bulk favorite status:', error);
        return {};
      }

      // Convert to lookup object
      const result: Record<string, boolean> = {};
      
      // Initialize all items as not favorited
      items.forEach(item => {
        const key = `${item.contentType}:${item.contentSlug}`;
        result[key] = false;
      });

      // Mark favorited items as true
      data?.forEach(favorite => {
        const key = `${favorite.content_type}:${favorite.content_slug}`;
        result[key] = true;
      });

      return result;
    } catch (error) {
      console.error('Error getting bulk favorite status:', error);
      return {};
    }
  }

  /**
   * Export user's favorites as JSON
   */
  static async exportFavorites(): Promise<FavoritesResult> {
    if (!this.isEnabled()) {
      return { success: false, error: 'Favorites feature is disabled' };
    }

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        return { success: false, error: 'Failed to initialize database client' };
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User must be authenticated to export favorites' };
      }

      // Get all favorites without pagination
      const { data, error } = await supabase.rpc('get_user_favorites', {
        p_content_type: null,
        p_limit: 10000, // Large number to get all favorites
        p_offset: 0,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        userEmail: user.email,
        favorites: data || [],
        totalCount: data?.length || 0,
      };

      return { success: true, data: exportData };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }
}