-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  favorite_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, favorite_user_id),
  CHECK (user_id != favorite_user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_favorite_user_id ON public.favorites(favorite_user_id);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policies for favorites
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove favorites
CREATE POLICY "Users can remove favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add favorite_count to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;

-- Function to update favorite_count
CREATE OR REPLACE FUNCTION update_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.favorite_user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET favorite_count = favorite_count - 1
    WHERE id = OLD.favorite_user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update favorite_count
CREATE TRIGGER trigger_update_favorite_count
AFTER INSERT OR DELETE ON public.favorites
FOR EACH ROW
EXECUTE FUNCTION update_favorite_count();

-- Function to get user's favorites with stats
CREATE OR REPLACE FUNCTION get_user_favorites(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  rating DECIMAL,
  total_deliveries INTEGER,
  is_available BOOLEAN,
  favorite_since TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.rating,
    p.total_deliveries,
    p.is_available,
    f.created_at as favorite_since
  FROM public.favorites f
  JOIN public.profiles p ON p.id = f.favorite_user_id
  WHERE f.user_id = user_uuid
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize favorite_count for existing profiles
UPDATE public.profiles
SET favorite_count = (
  SELECT COUNT(*)
  FROM public.favorites
  WHERE favorite_user_id = profiles.id
)
WHERE favorite_count IS NULL OR favorite_count = 0;
