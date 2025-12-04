import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocationStore } from '@/store/useLocationStore';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import { DeliveryRequest } from '@/types/database';

const INITIAL_REGION = {
  latitude: 4.9333, // Cayenne, Guyane
  longitude: -52.3333,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function MapScreen({ navigation }: any) {
  const { currentLocation, startTracking } = useLocationStore();
  const { requests, fetchNearbyRequests } = useDeliveryStore();
  const [selectedRequest, setSelectedRequest] = useState<DeliveryRequest | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      await startTracking();
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  useEffect(() => {
    if (currentLocation) {
      loadNearbyRequests();
    }
  }, [currentLocation, radiusKm]);

  const loadNearbyRequests = async () => {
    if (!currentLocation) return;

    try {
      await fetchNearbyRequests(
        currentLocation.latitude,
        currentLocation.longitude,
        radiusKm
      );
    } catch (error) {
      console.error('Error loading nearby requests:', error);
    }
  };

  const increaseRadius = () => {
    setRadiusKm(prev => Math.min(prev + 5, 50));
  };

  const decreaseRadius = () => {
    setRadiusKm(prev => Math.max(prev - 5, 5));
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        region={
          currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }
            : undefined
        }
        showsUserLocation
        showsMyLocationButton
      >
        {/* Current location circle */}
        {currentLocation && (
          <Circle
            center={currentLocation}
            radius={radiusKm * 1000} // Convert km to meters
            fillColor="rgba(33, 150, 243, 0.1)"
            strokeColor="rgba(33, 150, 243, 0.5)"
            strokeWidth={2}
          />
        )}

        {/* Delivery requests markers */}
        {requests.map((request) => (
          <Marker
            key={request.id}
            coordinate={request.pickup_location}
            title={request.title}
            description={`${request.price.toFixed(2)} €`}
            onPress={() => setSelectedRequest(request)}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerPrice}>{request.price.toFixed(0)}€</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Radius controls */}
      <View style={styles.radiusControl}>
        <TouchableOpacity
          style={styles.radiusButton}
          onPress={decreaseRadius}
        >
          <Text style={styles.radiusButtonText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.radiusText}>Rayon: {radiusKm} km</Text>

        <TouchableOpacity
          style={styles.radiusButton}
          onPress={increaseRadius}
        >
          <Text style={styles.radiusButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Selected request card */}
      {selectedRequest && (
        <View style={styles.selectedCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedRequest(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.selectedTitle}>{selectedRequest.title}</Text>
          <Text style={styles.selectedDescription} numberOfLines={2}>
            {selectedRequest.description}
          </Text>

          <View style={styles.selectedFooter}>
            <Text style={styles.selectedPrice}>
              {selectedRequest.price.toFixed(2)} €
            </Text>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => {
                navigation.navigate('RequestDetails', {
                  requestId: selectedRequest.id,
                });
                setSelectedRequest(null);
              }}
            >
              <Text style={styles.detailsButtonText}>Voir détails</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerPrice: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  radiusControl: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  radiusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  radiusText: {
    marginHorizontal: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingRight: 30,
  },
  selectedDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  selectedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  detailsButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
