import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { StatusBadge } from '@/components/StatusBadge';
import { DeliveryStatus } from '@/types/database';
import { supabase } from '@/services/supabase';
import {
  subscribeToDeliveryLocation,
  calculateDistance,
  calculateETA,
} from '@/services/gpsTracking';

interface DeliveryTrackingScreenProps {
  route: any;
  navigation: any;
}

export default function DeliveryTrackingScreen({
  route,
  navigation,
}: DeliveryTrackingScreenProps) {
  const { deliveryId } = route.params;

  const [delivery, setDelivery] = useState<any>(null);
  const [delivererLocation, setDelivererLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(0);

  // Charger les données de la livraison
  useEffect(() => {
    loadDeliveryData();
  }, [deliveryId]);

  // Écouter les mises à jour de position en temps réel
  useEffect(() => {
    if (!deliveryId) return;

    const unsubscribe = subscribeToDeliveryLocation(deliveryId, (location) => {
      setDelivererLocation(location);
    });

    return () => unsubscribe();
  }, [deliveryId]);

  // Calculer le progrès et l'ETA quand la position change
  useEffect(() => {
    if (!delivery || !delivererLocation) return;

    calculateProgressAndETA();
  }, [delivererLocation, delivery]);

  const loadDeliveryData = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          request:delivery_requests(*),
          deliverer:profiles!deliveries_deliverer_id_fkey(*),
          customer:profiles!deliveries_customer_id_fkey(*)
        `)
        .eq('id', deliveryId)
        .single();

      if (error) throw error;

      setDelivery(data);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de charger les données de la livraison');
      console.error(error);
    }
  };

  const calculateProgressAndETA = () => {
    if (!delivery || !delivererLocation) return;

    const pickupLocation = delivery.request.pickup_location;
    const deliveryLocation = delivery.request.delivery_location;

    // Distance totale
    const totalDistance = calculateDistance(
      pickupLocation.latitude,
      pickupLocation.longitude,
      deliveryLocation.latitude,
      deliveryLocation.longitude
    );

    // Distance restante
    const remainingDistance = calculateDistance(
      delivererLocation.latitude,
      delivererLocation.longitude,
      deliveryLocation.latitude,
      deliveryLocation.longitude
    );

    // Calcul du progrès (0-100%)
    const progressPercent = Math.max(
      0,
      Math.min(100, ((totalDistance - remainingDistance) / totalDistance) * 100)
    );
    setProgress(Math.round(progressPercent));

    // Calcul de l'ETA
    const etaMinutes = calculateETA(remainingDistance);
    setEta(etaMinutes);
  };

  const getProgressSteps = () => {
    switch (delivery.status) {
      case 'accepted':
        return { step: 1, label: 'Acceptée' };
      case 'in_progress':
        return progress < 50
          ? { step: 2, label: 'En route vers le point de départ' }
          : { step: 3, label: 'En route vers la destination' };
      case 'completed':
        return { step: 4, label: 'Livrée' };
      default:
        return { step: 0, label: 'En attente' };
    }
  };

  const currentStep = getProgressSteps();

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleCompleteDelivery = () => {
    Alert.alert(
      'Confirmer',
      'Confirmer que la livraison est terminée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            setDelivery({ ...delivery, status: 'completed' });
            // Rediriger vers l'écran de notation
            setTimeout(() => {
              navigation.replace('RateDelivery', { deliveryId });
            }, 1000);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <StatusBadge status={delivery.status} size="large" />
        {delivery.status === 'in_progress' && eta > 0 && (
          <View style={styles.etaContainer}>
            <Text style={styles.etaLabel}>Arrivée estimée</Text>
            <Text style={styles.etaTime}>
              {eta < 60 ? `${eta} min` : `${Math.floor(eta / 60)}h ${eta % 60}min`}
            </Text>
          </View>
        )}
      </View>

      {/* Jauge de progression */}
      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>
          {delivery.status === 'completed' ? '✓ Livraison terminée' : currentStep.label}
        </Text>

        {/* Barre de progression */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.progressPercent}>{progress}%</Text>

        {/* Étapes visuelles */}
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={[styles.stepDot, currentStep.step >= 1 && styles.stepDotActive]}>
              <Text style={styles.stepDotText}>✓</Text>
            </View>
            <Text style={styles.stepLabel}>Acceptée</Text>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.step}>
            <View style={[styles.stepDot, currentStep.step >= 2 && styles.stepDotActive]}>
              <Text style={styles.stepDotText}>
                {currentStep.step >= 2 ? '✓' : '2'}
              </Text>
            </View>
            <Text style={styles.stepLabel}>Récupération</Text>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.step}>
            <View style={[styles.stepDot, currentStep.step >= 3 && styles.stepDotActive]}>
              <Text style={styles.stepDotText}>
                {currentStep.step >= 3 ? '✓' : '3'}
              </Text>
            </View>
            <Text style={styles.stepLabel}>En route</Text>
          </View>

          <View style={styles.stepLine} />

          <View style={styles.step}>
            <View style={[styles.stepDot, currentStep.step >= 4 && styles.stepDotActive]}>
              <Text style={styles.stepDotText}>
                {currentStep.step >= 4 ? '✓' : '4'}
              </Text>
            </View>
            <Text style={styles.stepLabel}>Livrée</Text>
          </View>
        </View>
      </View>

      {/* Trajet */}
      <View style={styles.routeSection}>
        <Text style={styles.sectionTitle}>📍 Trajet</Text>
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <Text style={styles.locationText}>{delivery.pickup_address}</Text>
        </View>
        <View style={styles.locationLine} />
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, styles.locationDotEnd]} />
          <Text style={styles.locationText}>{delivery.delivery_address}</Text>
        </View>
      </View>

      {/* Contact */}
      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>👤 Votre livreur</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{delivery.deliverer.full_name}</Text>
            <Text style={styles.contactRating}>
              ⭐ {delivery.deliverer.rating.toFixed(1)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(delivery.deliverer.phone)}
          >
            <Text style={styles.callButtonText}>📞 Appeler</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Prix */}
      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Montant</Text>
          <Text style={styles.priceAmount}>{delivery.total_amount.toFixed(2)}€</Text>
        </View>
      </View>

      {/* Actions */}
      {delivery.status === 'in_progress' && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteDelivery}
        >
          <Text style={styles.completeButtonText}>✓ Marquer comme livrée</Text>
        </TouchableOpacity>
      )}

      {delivery.status === 'completed' && (
        <TouchableOpacity
          style={styles.rateButton}
          onPress={() => navigation.replace('RateDelivery', { deliveryId })}
        >
          <Text style={styles.rateButtonText}>⭐ Donner une note</Text>
        </TouchableOpacity>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: 12,
    color: '#666',
  },
  etaTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
    marginBottom: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepDotActive: {
    backgroundColor: '#4CAF50',
  },
  stepDotText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  stepLine: {
    height: 2,
    backgroundColor: '#e0e0e0',
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 30,
  },
  routeSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
    marginRight: 15,
  },
  locationDotEnd: {
    backgroundColor: '#4CAF50',
  },
  locationLine: {
    width: 2,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginLeft: 10,
    marginVertical: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
  },
  contactSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contactRating: {
    fontSize: 14,
    color: '#FF9800',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  priceSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    marginHorizontal: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rateButton: {
    backgroundColor: '#FF9800',
    padding: 18,
    borderRadius: 12,
    marginHorizontal: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
