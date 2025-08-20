-- Create user favorites table
-- This table stores user's favorited content (prompts, personas, blog posts)

CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('prompt', 'persona', 'blog')),
    content_slug TEXT NOT NULL,
    content_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate favorites
CREATE UNIQUE INDEX IF NOT EXISTS user_favorites_unique_idx 
ON public.user_favorites (user_id, content_type, content_slug);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_favorites_user_id_idx ON public.user_favorites (user_id);
CREATE INDEX IF NOT EXISTS user_favorites_content_type_idx ON public.user_favorites (content_type);
CREATE INDEX IF NOT EXISTS user_favorites_created_at_idx ON public.user_favorites (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user_favorites
-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

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