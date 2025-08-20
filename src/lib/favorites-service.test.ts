import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { FavoritesService, type FavoritesResult, type FavoriteItem, type PaginatedFavorites } from './favorites-service';
import type { User } from '@supabase/supabase-js';

// Mock the dependencies
vi.mock('./supabase.js', () => {
  const mockSupabase = {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          or: vi.fn(),
        })),
      })),
    })),
  };

  return {
    supabase: mockSupabase,
    isAuthEnabled: vi.fn(),
  };
});

vi.mock('./auth-service.js', () => ({
  AuthService: {
    getCurrentUser: vi.fn(),
  },
}));

// Import mocked functions
import { supabase, isAuthEnabled } from './supabase.js';
import { AuthService } from './auth-service.js';

const mockSupabase = supabase as any;
const mockIsAuthEnabled = isAuthEnabled as MockedFunction<typeof isAuthEnabled>;
const mockGetCurrentUser = AuthService.getCurrentUser as MockedFunction<typeof AuthService.getCurrentUser>;

describe('FavoritesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to auth enabled for most tests
    mockIsAuthEnabled.mockReturnValue(true);
    
    // Default to authenticated user
    const mockUser: Partial<User> = {
      id: 'user-123',
      email: 'test@example.com',
    };
    mockGetCurrentUser.mockResolvedValue(mockUser as User);
  });

  describe('isEnabled', () => {
    it('should return true when auth is enabled', () => {
      mockIsAuthEnabled.mockReturnValue(true);
      expect(FavoritesService.isEnabled()).toBe(true);
    });

    it('should return false when auth is disabled', () => {
      mockIsAuthEnabled.mockReturnValue(false);
      expect(FavoritesService.isEnabled()).toBe(false);
    });
  });

  describe('addToFavorites', () => {
    it('should add content to favorites successfully', async () => {
      const mockResult = { success: true, id: 'favorite-123' };
      
      mockSupabase.rpc.mockResolvedValue({
        data: mockResult,
        error: null,
      });

      const result = await FavoritesService.addToFavorites(
        'prompt',
        'test-prompt-slug',
        'Test Prompt'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('add_to_favorites', {
        p_content_type: 'prompt',
        p_content_slug: 'test-prompt-slug',
        p_content_title: 'Test Prompt',
      });
    });

    it('should add content without title', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await FavoritesService.addToFavorites('persona', 'test-persona-slug');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('add_to_favorites', {
        p_content_type: 'persona',
        p_content_slug: 'test-persona-slug',
        p_content_title: null,
      });
    });

    it('should handle database errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await FavoritesService.addToFavorites(
        'blog',
        'test-blog-slug',
        'Test Blog'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should return error when favorites feature is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await FavoritesService.addToFavorites(
        'prompt',
        'test-prompt-slug'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Favorites feature is disabled');
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should return error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await FavoritesService.addToFavorites(
        'prompt',
        'test-prompt-slug'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('User must be authenticated to add favorites');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Network error'));

      const result = await FavoritesService.addToFavorites(
        'prompt',
        'test-prompt-slug'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      mockSupabase.rpc.mockRejectedValue('String error');

      const result = await FavoritesService.addToFavorites(
        'prompt',
        'test-prompt-slug'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to add favorite');
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove content from favorites successfully', async () => {
      const mockResult = { success: true };
      
      mockSupabase.rpc.mockResolvedValue({
        data: mockResult,
        error: null,
      });

      const result = await FavoritesService.removeFromFavorites(
        'prompt',
        'test-prompt-slug'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('remove_from_favorites', {
        p_content_type: 'prompt',
        p_content_slug: 'test-prompt-slug',
      });
    });

    it('should handle database errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await FavoritesService.removeFromFavorites(
        'prompt',
        'test-prompt-slug'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    it('should return error when favorites feature is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await FavoritesService.removeFromFavorites(
        'prompt',
        'test-prompt-slug'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Favorites feature is disabled');
    });

    it('should return error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await FavoritesService.removeFromFavorites(
        'prompt',
        'test-prompt-slug'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('User must be authenticated to remove favorites');
    });
  });

  describe('isFavorited', () => {
    it('should return true when content is favorited', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await FavoritesService.isFavorited('prompt', 'test-prompt-slug');

      expect(result).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('is_favorited', {
        p_content_type: 'prompt',
        p_content_slug: 'test-prompt-slug',
      });
    });

    it('should return false when content is not favorited', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      const result = await FavoritesService.isFavorited('prompt', 'test-prompt-slug');

      expect(result).toBe(false);
    });

    it('should return false when favorites feature is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await FavoritesService.isFavorited('prompt', 'test-prompt-slug');

      expect(result).toBe(false);
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should return false when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await FavoritesService.isFavorited('prompt', 'test-prompt-slug');

      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await FavoritesService.isFavorited('prompt', 'test-prompt-slug');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error checking favorite status:', { message: 'Database error' });
      
      consoleSpy.mockRestore();
    });

    it('should handle unexpected errors gracefully', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await FavoritesService.isFavorited('prompt', 'test-prompt-slug');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error checking favorite status:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('getUserFavorites', () => {
    const mockFavorites: FavoriteItem[] = [
      {
        id: 'fav-1',
        content_type: 'prompt',
        content_slug: 'prompt-1',
        content_title: 'Test Prompt 1',
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'fav-2',
        content_type: 'persona',
        content_slug: 'persona-1',
        content_title: 'Test Persona 1',
        created_at: '2025-01-02T00:00:00Z',
      },
    ];

    it('should return paginated favorites successfully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockFavorites,
        error: null,
      });

      const result = await FavoritesService.getUserFavorites();

      expect(result.items).toEqual(mockFavorites);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_favorites', {
        p_content_type: null,
        p_limit: 21, // limit + 1
        p_offset: 0,
      });
    });

    it('should return favorites with content type filter', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [mockFavorites[0]],
        error: null,
      });

      const result = await FavoritesService.getUserFavorites('prompt');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_favorites', {
        p_content_type: 'prompt',
        p_limit: 21,
        p_offset: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const page = 2;
      const limit = 10;
      
      mockSupabase.rpc.mockResolvedValue({
        data: mockFavorites,
        error: null,
      });

      await FavoritesService.getUserFavorites(undefined, page, limit);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_favorites', {
        p_content_type: null,
        p_limit: 11,
        p_offset: 10,
      });
    });

    it('should detect when there are more items', async () => {
      const manyFavorites = Array(21).fill(mockFavorites[0]).map((item, index) => ({
        ...item,
        id: `fav-${index}`,
      }));

      mockSupabase.rpc.mockResolvedValue({
        data: manyFavorites,
        error: null,
      });

      const result = await FavoritesService.getUserFavorites();

      expect(result.items).toHaveLength(20);
      expect(result.hasMore).toBe(true);
    });

    it('should return empty result when favorites feature is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await FavoritesService.getUserFavorites();

      expect(result).toEqual({ items: [], total: 0, hasMore: false });
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should return empty result when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await FavoritesService.getUserFavorites();

      expect(result).toEqual({ items: [], total: 0, hasMore: false });
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await FavoritesService.getUserFavorites();

      expect(result).toEqual({ items: [], total: 0, hasMore: false });
      expect(consoleSpy).toHaveBeenCalledWith('Error getting user favorites:', { message: 'Database error' });
      
      consoleSpy.mockRestore();
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite when not currently favorited', async () => {
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: false, error: null }) // isFavorited
        .mockResolvedValueOnce({ data: { success: true }, error: null }); // addToFavorites

      const result = await FavoritesService.toggleFavorite(
        'prompt',
        'test-prompt-slug',
        'Test Prompt'
      );

      expect(result.success).toBe(true);
      expect(result.isFavorited).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('is_favorited', {
        p_content_type: 'prompt',
        p_content_slug: 'test-prompt-slug',
      });
      expect(mockSupabase.rpc).toHaveBeenCalledWith('add_to_favorites', {
        p_content_type: 'prompt',
        p_content_slug: 'test-prompt-slug',
        p_content_title: 'Test Prompt',
      });
    });

    it('should remove favorite when currently favorited', async () => {
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: true, error: null }) // isFavorited
        .mockResolvedValueOnce({ data: { success: true }, error: null }); // removeFromFavorites

      const result = await FavoritesService.toggleFavorite(
        'prompt',
        'test-prompt-slug'
      );

      expect(result.success).toBe(true);
      expect(result.isFavorited).toBe(false);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('remove_from_favorites', {
        p_content_type: 'prompt',
        p_content_slug: 'test-prompt-slug',
      });
    });

    it('should return error when favorites feature is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await FavoritesService.toggleFavorite(
        'prompt',
        'test-prompt-slug'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Favorites feature is disabled');
      expect(result.isFavorited).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      // Mock the isFavorited call to fail
      mockSupabase.rpc.mockRejectedValueOnce(new Error('Network error'));

      const result = await FavoritesService.toggleFavorite(
        'prompt',
        'test-prompt-slug'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.isFavorited).toBe(false);
    });
  });

  describe('getFavoritesCount', () => {
    it('should return favorites count successfully', async () => {
      const mockCount = 15;
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });
      
      mockQuery.eq.mockResolvedValue({
        count: mockCount,
        error: null,
      });

      const result = await FavoritesService.getFavoritesCount();

      expect(result).toBe(mockCount);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_favorites');
    });

    it('should return count with content type filter', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });
      
      mockQuery.eq.mockResolvedValue({
        count: 5,
        error: null,
      });

      await FavoritesService.getFavoritesCount('prompt');

      expect(mockQuery.eq).toHaveBeenNthCalledWith(1, 'user_id', 'user-123');
      expect(mockQuery.eq).toHaveBeenNthCalledWith(2, 'content_type', 'prompt');
    });

    it('should return 0 when favorites feature is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await FavoritesService.getFavoritesCount();

      expect(result).toBe(0);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return 0 when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await FavoritesService.getFavoritesCount();

      expect(result).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery),
      });
      
      mockQuery.eq.mockResolvedValue({
        count: null,
        error: { message: 'Database error' },
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await FavoritesService.getFavoritesCount();

      expect(result).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('Error getting favorites count:', { message: 'Database error' });
      
      consoleSpy.mockRestore();
    });
  });

  describe('getBulkFavoriteStatus', () => {
    const mockItems = [
      { contentType: 'prompt' as const, contentSlug: 'prompt-1' },
      { contentType: 'persona' as const, contentSlug: 'persona-1' },
      { contentType: 'blog' as const, contentSlug: 'blog-1' },
    ];

    it('should return bulk favorite status successfully', async () => {
      const mockFavorites = [
        { content_type: 'prompt', content_slug: 'prompt-1' },
        { content_type: 'blog', content_slug: 'blog-1' },
      ];

      const mockOr = vi.fn().mockResolvedValue({
        data: mockFavorites,
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({
        or: mockOr,
      });
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await FavoritesService.getBulkFavoriteStatus(mockItems);

      expect(result).toEqual({
        'prompt:prompt-1': true,
        'persona:persona-1': false,
        'blog:blog-1': true,
      });
      expect(mockOr).toHaveBeenCalledWith(
        '(content_type.eq.prompt,content_slug.eq.prompt-1),(content_type.eq.persona,content_slug.eq.persona-1),(content_type.eq.blog,content_slug.eq.blog-1)'
      );
    });

    it('should return empty object when favorites feature is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await FavoritesService.getBulkFavoriteStatus(mockItems);

      expect(result).toEqual({});
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return empty object when no items provided', async () => {
      const result = await FavoritesService.getBulkFavoriteStatus([]);

      expect(result).toEqual({});
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return empty object when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await FavoritesService.getBulkFavoriteStatus(mockItems);

      expect(result).toEqual({});
    });

    it('should handle database errors gracefully', async () => {
      const mockOr = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });
      const mockEq = vi.fn().mockReturnValue({
        or: mockOr,
      });
      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await FavoritesService.getBulkFavoriteStatus(mockItems);

      expect(result).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith('Error getting bulk favorite status:', { message: 'Database error' });
      
      consoleSpy.mockRestore();
    });
  });

  describe('exportFavorites', () => {
    it('should export favorites successfully', async () => {
      const mockUser: Partial<User> = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockFavorites = [
        {
          id: 'fav-1',
          content_type: 'prompt',
          content_slug: 'prompt-1',
          content_title: 'Test Prompt 1',
          created_at: '2025-01-01T00:00:00Z',
        },
      ];

      mockGetCurrentUser.mockResolvedValue(mockUser as User);
      mockSupabase.rpc.mockResolvedValue({
        data: mockFavorites,
        error: null,
      });

      const result = await FavoritesService.exportFavorites();

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        userEmail: 'test@example.com',
        favorites: mockFavorites,
        totalCount: 1,
      });
      expect(result.data.exportDate).toBeDefined();
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_favorites', {
        p_content_type: null,
        p_limit: 10000,
        p_offset: 0,
      });
    });

    it('should return error when favorites feature is disabled', async () => {
      mockIsAuthEnabled.mockReturnValue(false);

      const result = await FavoritesService.exportFavorites();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Favorites feature is disabled');
    });

    it('should return error when user is not authenticated', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const result = await FavoritesService.exportFavorites();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User must be authenticated to export favorites');
    });

    it('should handle database errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Export failed' },
      });

      const result = await FavoritesService.exportFavorites();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Export failed');
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Network error'));

      const result = await FavoritesService.exportFavorites();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });
});