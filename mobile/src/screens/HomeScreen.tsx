import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import { useLocationStore } from '@/store/useLocationStore';
import { DeliveryRequest } from '@/types/database';
import { calculateDistance } from '@/services/location';

export default function HomeScreen({ navigation }: any) {
  const { profile } = useAuthStore();
  const { requests, isLoading, fetchNearbyRequests } = useDeliveryStore();
  const { currentLocation, startTracking } = useLocationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      await startTracking();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à votre position');
    }
  };

  useEffect(() => {
    if (currentLocation) {
      loadNearbyRequests();
    }
  }, [currentLocation]);

  const loadNearbyRequests = async () => {
    if (!currentLocation) return;

    try {
      await fetchNearbyRequests(
        currentLocation.latitude,
        currentLocation.longitude,
        20
      );
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNearbyRequests();
    setRefreshing(false);
  };

  const renderRequestCard = ({ item }: { item: DeliveryRequest }) => {
    const distance = currentLocation
      ? calculateDistance(currentLocation, item.pickup_location)
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RequestDetails', { requestId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {distance && (
            <Text style={styles.distance}>{distance.toFixed(1)} km</Text>
          )}
        </View>

        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>📍 {item.pickup_address}</Text>
            <Text style={styles.locationText}>🎯 {item.delivery_address}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{item.price.toFixed(2)} €</Text>
          </View>
        </View>

        {item.needs_two_people && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>👥 2 personnes requises</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Bonjour {profile?.full_name || 'Utilisateur'} 👋
        </Text>
        <Text style={styles.subtitle}>
          Demandes de livraison à proximité
        </Text>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequestCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucune demande à proximité pour le moment
            </Text>
            <Text style={styles.emptySubtext}>
              Tirez pour actualiser
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateRequest')}
      >
        <Text style={styles.createButtonText}>+ Créer une demande</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  priceContainer: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    marginTop: 10,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  createButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    left: 20,
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
