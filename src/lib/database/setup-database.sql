-- Complete database setup for AI Prompts Directory with User Authentication
-- This file combines all migrations for easy setup in Supabase SQL Editor
-- 
-- Instructions:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query and paste this entire file
-- 4. Run the query to set up all tables, functions, and policies
-- 
-- This script is idempotent - safe to run multiple times

-- ========================================
-- USER PROFILES TABLE
-- ========================================

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    display_name TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- USER FAVORITES TABLE
-- ========================================

-- Create user favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('prompt', 'persona', 'blog')),
    content_slug TEXT NOT NULL,
    content_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate favorites
DROP INDEX IF EXISTS user_favorites_unique_idx;
CREATE UNIQUE INDEX user_favorites_unique_idx 
ON public.user_favorites (user_id, content_type, content_slug);

-- Create indexes for faster queries
DROP INDEX IF EXISTS user_favorites_user_id_idx;
CREATE INDEX user_favorites_user_id_idx ON public.user_favorites (user_id);

DROP INDEX IF EXISTS user_favorites_content_type_idx;
CREATE INDEX user_favorites_content_type_idx ON public.user_favorites (content_type);

DROP INDEX IF EXISTS user_favorites_created_at_idx;
CREATE INDEX user_favorites_created_at_idx ON public.user_favorites (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user_favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
CREATE POLICY "Users can insert own favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;
CREATE POLICY "Users can delete own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- DATABASE FUNCTIONS
-- ========================================

-- Create function to add a favorite
CREATE OR REPLACE FUNCTION public.add_to_favorites(
    p_content_type TEXT,
    p_content_slug TEXT,
    p_content_title TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    favorite_id UUID;
BEGIN
    INSERT INTO public.user_favorites (user_id, content_type, content_slug, content_title)
    VALUES (auth.uid(), p_content_type, p_content_slug, p_content_title)
    ON CONFLICT (user_id, content_type, content_slug) DO NOTHING
    RETURNING id INTO favorite_id;
    
    RETURN favorite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to remove a favorite
CREATE OR REPLACE FUNCTION public.remove_from_favorites(
    p_content_type TEXT,
    p_content_slug TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_favorites
    WHERE user_id = auth.uid()
    AND content_type = p_content_type
    AND content_slug = p_content_slug;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if content is favorited
CREATE OR REPLACE FUNCTION public.is_favorited(
    p_content_type TEXT,
    p_content_slug TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_favorites
        WHERE user_id = auth.uid()
        AND content_type = p_content_type
        AND content_slug = p_content_slug
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's favorites with pagination
CREATE OR REPLACE FUNCTION public.get_user_favorites(
    p_content_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    content_type TEXT,
    content_slug TEXT,
    content_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.content_type,
        f.content_slug,
        f.content_title,
        f.created_at
    FROM public.user_favorites f
    WHERE f.user_id = auth.uid()
    AND (p_content_type IS NULL OR f.content_type = p_content_type)
    ORDER BY f.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- SETUP COMPLETE
-- ========================================

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Tables created: user_profiles, user_favorites';
    RAISE NOTICE 'Functions created: handle_new_user, add_to_favorites, remove_from_favorites, is_favorited, get_user_favorites';
    RAISE NOTICE 'Row Level Security enabled with appropriate policies';
END $$;