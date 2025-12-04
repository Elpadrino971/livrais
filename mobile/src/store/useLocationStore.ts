import { create } from 'zustand';
import { Location } from '@/types/database';
import { getCurrentLocation, watchLocation } from '@/services/location';

interface LocationState {
  currentLocation: Location | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  updateLocation: () => Promise<void>;
}

let locationSubscription: any = null;

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  isTracking: false,
  error: null,

  startTracking: async () => {
    try {
      const location = await getCurrentLocation();
      set({ currentLocation: location, isTracking: true, error: null });

      // Watch for location changes
      locationSubscription = await watchLocation((newLocation) => {
        set({ currentLocation: newLocation });
      });
    } catch (error: any) {
      set({ error: error.message, isTracking: false });
      throw error;
    }
  },

  stopTracking: () => {
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
    }
    set({ isTracking: false });
  },

  updateLocation: async () => {
    try {
      const location = await getCurrentLocation();
      set({ currentLocation: location, error: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
