import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { FormInput } from '@/components/FormInput';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocationStore } from '@/store/useLocationStore';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import { calculateSuggestedPrice, REQUEST_TYPES, VEHICLE_TYPES } from '@/constants';
import { RequestType, VehicleType } from '@/types/database';

export default function CreateRequestScreen({ navigation }: any) {
  const { profile } = useAuthStore();
  const { currentLocation } = useLocationStore();
  const { createRequest } = useDeliveryStore();

  // Formulaire
  const [type, setType] = useState<RequestType>('package');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState(10);
  const [maxPrice, setMaxPrice] = useState(100);
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [needsTwoPeople, setNeedsTwoPeople] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleType | undefined>();
  const [distance, setDistance] = useState(5);

  // Recalculer le prix suggéré quand les paramètres changent
  useEffect(() => {
    const price = calculateSuggestedPrice(type, distance, needsTwoPeople);
    setSuggestedPrice(price);
    if (price > maxPrice) {
      setMaxPrice(Math.min(price + 20, 100));
    }
  }, [type, distance, needsTwoPeople]);

  const handleSubmit = async () => {
    if (!title || !pickupAddress || !deliveryAddress) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Erreur', 'Impossible de récupérer votre position');
      return;
    }

    try {
      await createRequest({
        user_id: profile!.id,
        type,
        title,
        description: description || `${REQUEST_TYPES[type].description}. ${
          isNegotiable
            ? `Prix négociable jusqu'à ${maxPrice}€.`
            : `Prix fixe: ${suggestedPrice}€.`
        }`,
        pickup_location: currentLocation,
        pickup_address: pickupAddress,
        delivery_location: currentLocation, // À remplacer par géocodage
        delivery_address: deliveryAddress,
        price: suggestedPrice,
        vehicle_type_required: vehicleType,
        needs_two_people: needsTwoPeople,
        status: 'pending',
      });

      Alert.alert('Succès', 'Votre demande a été créée !', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Créer une demande</Text>

        {/* Type de demande */}
        <Text style={styles.sectionTitle}>Type de service</Text>
        <View style={styles.typeGrid}>
          {Object.entries(REQUEST_TYPES).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.typeButton,
                type === key && styles.typeButtonActive,
              ]}
              onPress={() => setType(key as RequestType)}
            >
              <Text style={styles.typeIcon}>{config.icon}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  type === key && styles.typeLabelActive,
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Titre */}
        <FormInput
          label="Titre"
          icon="📝"
          required
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Livraison d'un réfrigérateur"
        />

        {/* Description */}
        <FormInput
          label="Description"
          icon="💬"
          value={description}
          onChangeText={setDescription}
          placeholder="Détails supplémentaires..."
          multiline
          numberOfLines={3}
        />

        {/* Adresses */}
        <FormInput
          label="Point de départ"
          icon="📍"
          required
          value={pickupAddress}
          onChangeText={setPickupAddress}
          placeholder="Ex: Cayenne Centre"
        />

        <FormInput
          label="Point d'arrivée"
          icon="🎯"
          required
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          placeholder="Ex: Matoury"
        />

        {/* Distance estimée */}
        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Distance estimée: {distance} km</Text>
          <View style={styles.distanceButtons}>
            {[5, 10, 15, 20, 30].map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.distanceButton,
                  distance === d && styles.distanceButtonActive,
                ]}
                onPress={() => setDistance(d)}
              >
                <Text
                  style={[
                    styles.distanceText,
                    distance === d && styles.distanceTextActive,
                  ]}
                >
                  {d}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prix */}
        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>💰 Tarification</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Prix suggéré:</Text>
            <Text style={styles.priceSuggested}>{suggestedPrice.toFixed(2)}€</Text>
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>💬 Négociable</Text>
              <Text style={styles.switchSubtext}>
                Les livreurs peuvent proposer un autre prix
              </Text>
            </View>
            <Switch
              value={isNegotiable}
              onValueChange={setIsNegotiable}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
            />
          </View>

          {isNegotiable && (
            <View style={styles.maxPriceContainer}>
              <Text style={styles.label}>Prix maximum accepté:</Text>
              <View style={styles.priceButtons}>
                {[
                  suggestedPrice + 10,
                  suggestedPrice + 20,
                  suggestedPrice + 30,
                  100,
                ].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priceButton,
                      maxPrice === p && styles.priceButtonActive,
                    ]}
                    onPress={() => setMaxPrice(p)}
                  >
                    <Text
                      style={[
                        styles.priceButtonText,
                        maxPrice === p && styles.priceButtonTextActive,
                      ]}
                    >
                      {p}€
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.priceInfo}>
                Vous accepterez les offres jusqu'à {maxPrice}€
              </Text>
            </View>
          )}
        </View>

        {/* Options */}
        <Text style={styles.sectionTitle}>Options</Text>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>👥 Besoin de 2 personnes</Text>
            <Text style={styles.switchSubtext}>Pour porter des objets lourds</Text>
          </View>
          <Switch
            value={needsTwoPeople}
            onValueChange={setNeedsTwoPeople}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
          />
        </View>

        {/* Type de véhicule */}
        {type !== 'package' && (
          <>
            <Text style={styles.label}>Véhicule requis (optionnel)</Text>
            <View style={styles.vehicleGrid}>
              <TouchableOpacity
                style={[
                  styles.vehicleButton,
                  !vehicleType && styles.vehicleButtonActive,
                ]}
                onPress={() => setVehicleType(undefined)}
              >
                <Text style={styles.vehicleIcon}>❌</Text>
                <Text style={styles.vehicleLabel}>Aucun</Text>
              </TouchableOpacity>
              {Object.entries(VEHICLE_TYPES).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.vehicleButton,
                    vehicleType === key && styles.vehicleButtonActive,
                  ]}
                  onPress={() => setVehicleType(key as VehicleType)}
                >
                  <Text style={styles.vehicleIcon}>{config.emoji}</Text>
                  <Text style={styles.vehicleLabel}>{config.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Résumé */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📋 Résumé</Text>
          <Text style={styles.summaryText}>
            {title || 'Sans titre'} • {REQUEST_TYPES[type].label}
          </Text>
          <Text style={styles.summaryText}>
            📍 {pickupAddress || '?'} → 🎯 {deliveryAddress || '?'}
          </Text>
          <Text style={styles.summaryText}>📏 Distance: ~{distance} km</Text>
          {needsTwoPeople && (
            <Text style={styles.summaryText}>👥 2 personnes requises</Text>
          )}
          {vehicleType && (
            <Text style={styles.summaryText}>
              🚗 Véhicule: {VEHICLE_TYPES[vehicleType].label}
            </Text>
          )}
          <View style={styles.summaryDivider} />
          <Text style={styles.summaryPrice}>
            💰 {suggestedPrice.toFixed(2)}€
            {isNegotiable && ` (négociable jusqu'à ${maxPrice}€)`}
          </Text>
        </View>

        {/* Bouton de soumission */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Publier la demande</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          💡 Votre demande sera visible par tous les livreurs à proximité
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  typeButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    color: '#666',
  },
  typeLabelActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  distanceButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  distanceButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  distanceButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
  distanceTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  priceCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceSuggested: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  maxPriceContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  priceButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  priceButtonActive: {
    backgroundColor: '#4CAF50',
  },
  priceButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  priceButtonTextActive: {
    color: '#fff',
  },
  priceInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  vehicleButton: {
    width: '30%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  vehicleButtonActive: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  vehicleIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  vehicleLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#FFE0B2',
    marginVertical: 10,
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
});
