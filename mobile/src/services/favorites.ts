import { supabase } from './supabase';

export interface FavoriteUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  total_deliveries: number;
  is_available: boolean;
  favorite_since: string;
}

/**
 * Add a user to favorites
 */
export const addFavorite = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('favorite_user_id', userId)
      .single();

    if (existing) {
      return { success: false, error: 'Déjà dans vos favoris' };
    }

    // Add to favorites
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.user.id,
        favorite_user_id: userId,
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error adding favorite:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove a user from favorites
 */
export const removeFavorite = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.user.id)
      .eq('favorite_user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error removing favorite:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if a user is favorited
 */
export const isFavorite = async (userId: string): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return false;

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('favorite_user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error checking favorite:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

/**
 * Get all favorites for the current user
 */
export const getFavorites = async (): Promise<{ data: FavoriteUser[]; error?: string }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return { data: [], error: 'Utilisateur non authentifié' };
    }

    const { data, error } = await supabase.rpc('get_user_favorites', {
      user_uuid: user.user.id,
    });

    if (error) throw error;

    return { data: data || [] };
  } catch (error: any) {
    console.error('Error getting favorites:', error);
    return { data: [], error: error.message };
  }
};

/**
 * Get favorite count for a user
 */
export const getFavoriteCount = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id', { count: 'exact', head: true })
      .eq('favorite_user_id', userId);

    if (error) throw error;

    return data?.length || 0;
  } catch (error) {
    console.error('Error getting favorite count:', error);
    return 0;
  }
};

/**
 * Toggle favorite status
 */
export const toggleFavorite = async (userId: string): Promise<{ isFavorite: boolean; success: boolean; error?: string }> => {
  try {
    const currentlyFavorited = await isFavorite(userId);

    if (currentlyFavorited) {
      const result = await removeFavorite(userId);
      return { isFavorite: false, ...result };
    } else {
      const result = await addFavorite(userId);
      return { isFavorite: true, ...result };
    }
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return { isFavorite: false, success: false, error: error.message };
  }
};

/**
 * Get favorite deliverers near a location
 */
export const getFavoriteDeliverersNearby = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 30
): Promise<{ data: FavoriteUser[]; error?: string }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return { data: [], error: 'Utilisateur non authentifié' };
    }

    // Get all favorites
    const { data: favorites, error: favError } = await getFavorites();
    if (favError) throw new Error(favError);

    // Filter by availability and proximity (would need location data in real implementation)
    const availableFavorites = favorites.filter(fav => fav.is_available);

    return { data: availableFavorites };
  } catch (error: any) {
    console.error('Error getting nearby favorites:', error);
    return { data: [], error: error.message };
  }
};
