import * as Location from 'expo-location';
import { Location as LocationType } from '@/types/database';

export const requestLocationPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission de localisation refusée');
  }
  return status === 'granted';
};

export const getCurrentLocation = async (): Promise<LocationType> => {
  const { coords } = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
};

export const watchLocation = (callback: (location: LocationType) => void) => {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // Update every 5 seconds
      distanceInterval: 10, // Or every 10 meters
    },
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    }
  );
};

export const calculateDistance = (
  loc1: LocationType,
  loc2: LocationType
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.latitude)) *
    Math.cos(toRad(loc2.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Distance in km
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

export const reverseGeocode = async (location: LocationType): Promise<string> => {
  const results = await Location.reverseGeocodeAsync(location);
  if (results.length > 0) {
    const address = results[0];
    return `${address.street || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
  }
  return 'Adresse inconnue';
};

export const geocodeAddress = async (address: string): Promise<LocationType | null> => {
  const results = await Location.geocodeAsync(address);
  if (results.length > 0) {
    return {
      latitude: results[0].latitude,
      longitude: results[0].longitude,
    };
  }
  return null;
};
