import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocationStore } from '@/store/useLocationStore';
import { supabase } from '@/services/supabase';

export const AvailabilityToggle = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuthStore();
  const { currentLocation } = useLocationStore();

  const toggleAvailability = async (value: boolean) => {
    if (!currentLocation) {
      Alert.alert('Erreur', 'Impossible de récupérer votre position');
      return;
    }

    setIsLoading(true);
    try {
      if (value) {
        // Activer la disponibilité
        await supabase.from('deliverer_availability').insert({
          user_id: profile!.id,
          is_available: true,
          current_location: `POINT(${currentLocation.longitude} ${currentLocation.latitude})`,
          activity_type: 'available',
          expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4h
        });
      } else {
        // Désactiver la disponibilité
        await supabase
          .from('deliverer_availability')
          .delete()
          .eq('user_id', profile!.id)
          .eq('is_available', true);
      }
      setIsAvailable(value);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>💼 Mode livreur</Text>
          <Text style={styles.subtitle}>
            {isAvailable
              ? 'Vous recevrez des notifications pour les demandes proches'
              : 'Activez pour recevoir des propositions de livraison'}
          </Text>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={toggleAvailability}
          disabled={isLoading}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={isAvailable ? '#fff' : '#f4f3f4'}
        />
      </View>
      {isAvailable && (
        <Text style={styles.activeText}>🟢 Vous êtes disponible</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f9ff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    maxWidth: '80%',
  },
  activeText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
});
