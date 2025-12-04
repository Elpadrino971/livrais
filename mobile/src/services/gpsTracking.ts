import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { supabase } from './supabase';

const LOCATION_TRACKING_TASK = 'location-tracking';

interface TrackingConfig {
  accuracy: Location.Accuracy;
  timeInterval: number; // en ms
  distanceInterval: number; // en mètres
  showsBackgroundLocationIndicator?: boolean;
}

/**
 * Configuration par défaut pour le tracking
 */
const DEFAULT_TRACKING_CONFIG: TrackingConfig = {
  accuracy: Location.Accuracy.High,
  timeInterval: 5000, // Toutes les 5 secondes
  distanceInterval: 10, // Tous les 10 mètres
  showsBackgroundLocationIndicator: true,
};

/**
 * Définit la tâche de tracking en arrière-plan
 */
TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error('Erreur de tracking GPS:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location) {
      // Récupérer l'ID de livraison en cours depuis AsyncStorage
      const deliveryId = await getActiveDeliveryId();

      if (deliveryId) {
        await updateDeliveryLocation(deliveryId, {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    }
  }
});

/**
 * Démarre le tracking GPS
 */
export const startLocationTracking = async (
  deliveryId: string,
  config: Partial<TrackingConfig> = {}
): Promise<boolean> => {
  try {
    // Demander la permission de localisation en arrière-plan
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      throw new Error('Permission de localisation refusée');
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== 'granted') {
      console.warn('Permission de localisation en arrière-plan refusée');
      // On continue quand même avec le tracking foreground
    }

    // Sauvegarder l'ID de livraison
    await saveActiveDeliveryId(deliveryId);

    // Démarrer le tracking
    const trackingConfig = { ...DEFAULT_TRACKING_CONFIG, ...config };

    await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
      accuracy: trackingConfig.accuracy,
      timeInterval: trackingConfig.timeInterval,
      distanceInterval: trackingConfig.distanceInterval,
      showsBackgroundLocationIndicator: trackingConfig.showsBackgroundLocationIndicator,
      foregroundService: {
        notificationTitle: 'Livrais',
        notificationBody: 'Livraison en cours...',
        notificationColor: '#2196F3',
      },
    });

    console.log('Tracking GPS démarré');
    return true;
  } catch (error) {
    console.error('Erreur lors du démarrage du tracking:', error);
    return false;
  }
};

/**
 * Arrête le tracking GPS
 */
export const stopLocationTracking = async (): Promise<boolean> => {
  try {
    const isTracking = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING_TASK
    );

    if (isTracking) {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
      await removeActiveDeliveryId();
      console.log('Tracking GPS arrêté');
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'arrêt du tracking:', error);
    return false;
  }
};

/**
 * Met à jour la position dans la base de données
 */
export const updateDeliveryLocation = async (
  deliveryId: string,
  location: { latitude: number; longitude: number }
) => {
  try {
    const { error } = await supabase
      .from('deliveries')
      .update({
        current_location: `POINT(${location.longitude} ${location.latitude})`,
      })
      .eq('id', deliveryId);

    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la position:', error);
  }
};

/**
 * Obtient la position actuelle
 */
export const getCurrentPosition = async (): Promise<Location.LocationObject> => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permission de localisation refusée');
  }

  return await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
};

/**
 * Calcule la distance entre deux points (formule de Haversine)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Distance en km
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

/**
 * Calcule l'ETA (temps d'arrivée estimé) en minutes
 */
export const calculateETA = (
  distanceKm: number,
  averageSpeedKmh: number = 30
): number => {
  const timeHours = distanceKm / averageSpeedKmh;
  return Math.round(timeHours * 60); // En minutes
};

/**
 * Obtient la position d'une livraison
 */
export const getDeliveryLocation = async (
  deliveryId: string
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select('current_location')
      .eq('id', deliveryId)
      .single();

    if (error || !data.current_location) {
      return null;
    }

    // Parse PostGIS POINT format
    // Format: "POINT(longitude latitude)"
    const match = data.current_location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
      return {
        longitude: parseFloat(match[1]),
        latitude: parseFloat(match[2]),
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la position:', error);
    return null;
  }
};

/**
 * Écoute les changements de position en temps réel
 */
export const subscribeToDeliveryLocation = (
  deliveryId: string,
  callback: (location: { latitude: number; longitude: number }) => void
) => {
  const channel = supabase
    .channel(`delivery_location:${deliveryId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'deliveries',
        filter: `id=eq.${deliveryId}`,
      },
      (payload) => {
        if (payload.new.current_location) {
          const match = payload.new.current_location.match(
            /POINT\(([^ ]+) ([^ ]+)\)/
          );
          if (match) {
            callback({
              longitude: parseFloat(match[1]),
              latitude: parseFloat(match[2]),
            });
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Helpers pour AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_DELIVERY_KEY = 'active_delivery_id';

const saveActiveDeliveryId = async (deliveryId: string) => {
  await AsyncStorage.setItem(ACTIVE_DELIVERY_KEY, deliveryId);
};

const getActiveDeliveryId = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(ACTIVE_DELIVERY_KEY);
};

const removeActiveDeliveryId = async () => {
  await AsyncStorage.removeItem(ACTIVE_DELIVERY_KEY);
};
