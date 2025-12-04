import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/database';
import { supabase, getCurrentProfile } from '@/services/supabase';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({ user: session.user, isAuthenticated: true });
        const profile = await getCurrentProfile();
        set({ profile });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ isLoading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      set({ user, isAuthenticated: !!user });

      if (user) {
        const profile = await getCurrentProfile();
        set({ profile });
      } else {
        set({ profile: null });
      }
    });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, isAuthenticated: false });
  },

  refreshProfile: async () => {
    const profile = await getCurrentProfile();
    set({ profile });
  },
}));
