import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuthStore } from '@/store/useAuthStore';
import { useDeliveryStore } from '@/store/useDeliveryStore';
import { REQUEST_TYPES, VEHICLE_TYPES } from '@/constants';

export default function RequestDetailsScreen({ route, navigation }: any) {
  const { requestId } = route.params;
  const { profile } = useAuthStore();
  const { acceptRequest } = useDeliveryStore();

  // Mock data - à remplacer par les vraies données
  const request = {
    id: requestId,
    user_id: 'customer-id',
    type: 'heavy_item',
    title: 'Livraison d\'un réfrigérateur',
    description: 'Réfrigérateur neuf à livrer. Prix négociable jusqu\'à 80€.',
    pickup_address: 'Cayenne Centre',
    delivery_address: 'Matoury',
    price: 50,
    needs_two_people: true,
    vehicle_type_required: 'van',
    status: 'pending',
    distance_km: 12,
    is_negotiable: true,
    max_price: 80,
  };

  const [showNegotiation, setShowNegotiation] = useState(false);
  const [proposedPrice, setProposedPrice] = useState(request.price.toString());
  const [message, setMessage] = useState('');
  const [showQuickMessages, setShowQuickMessages] = useState(false);

  const isMyRequest = request.user_id === profile?.id;

  const QUICK_MESSAGES = [
    '👋 Bonjour, je suis intéressé',
    '🚗 J\'ai le véhicule adapté',
    '💪 Je peux vous aider aujourd\'hui',
    '📍 Je passe par là régulièrement',
    '❓ C\'est à quel étage ?',
    '⏰ À quelle heure ?',
    '💰 Quel est votre budget ?',
    '📸 Pouvez-vous m\'envoyer une photo ?',
  ];

  const handleAcceptOriginalPrice = async () => {
    Alert.alert(
      'Confirmer',
      `Accepter cette livraison pour ${request.price}€ ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: async () => {
            try {
              await acceptRequest(request.id, profile!.id);
              Alert.alert('Succès', 'Livraison acceptée !', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  const handlePropose = () => {
    const price = parseFloat(proposedPrice);

    if (isNaN(price) || price < request.price || price > request.max_price) {
      Alert.alert(
        'Prix invalide',
        `Le prix doit être entre ${request.price}€ et ${request.max_price}€`
      );
      return;
    }

    Alert.alert(
      'Proposer un prix',
      `Proposer ${price}€ pour cette livraison ?\n\nLe client recevra votre proposition.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: () => {
            // TODO: Envoyer la proposition au client
            Alert.alert(
              'Proposition envoyée',
              'Le client va recevoir votre proposition et pourra l\'accepter ou refuser.'
            );
            setShowNegotiation(false);
          },
        },
      ]
    );
  };

  const handleSendMessage = (text: string) => {
    // TODO: Envoyer le message via Supabase
    Alert.alert('Message envoyé', text);
    setMessage('');
    setShowQuickMessages(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <StatusBadge status={request.status} size="large" />
        <Text style={styles.distance}>📏 {request.distance_km} km</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{request.title}</Text>
        <Text style={styles.type}>{REQUEST_TYPES[request.type].icon} {REQUEST_TYPES[request.type].label}</Text>

        {/* Prix */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Prix proposé</Text>
          <Text style={styles.price}>{request.price.toFixed(2)}€</Text>
          {request.is_negotiable && (
            <Text style={styles.negotiable}>
              💬 Négociable jusqu'à {request.max_price}€
            </Text>
          )}
        </View>

        {/* Trajet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Trajet</Text>
          <View style={styles.locationRow}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>{request.pickup_address}</Text>
          </View>
          <View style={styles.locationLine} />
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, styles.locationDotEnd]} />
            <Text style={styles.locationText}>{request.delivery_address}</Text>
          </View>
        </View>

        {/* Description */}
        {request.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💬 Description</Text>
            <Text style={styles.description}>{request.description}</Text>
          </View>
        )}

        {/* Détails */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Détails</Text>
          {request.needs_two_people && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailText}>2 personnes requises</Text>
            </View>
          )}
          {request.vehicle_type_required && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>
                {VEHICLE_TYPES[request.vehicle_type_required].emoji}
              </Text>
              <Text style={styles.detailText}>
                Véhicule: {VEHICLE_TYPES[request.vehicle_type_required].label}
              </Text>
            </View>
          )}
        </View>

        {/* Messages rapides */}
        {!isMyRequest && !showQuickMessages && (
          <TouchableOpacity
            style={styles.quickMessagesButton}
            onPress={() => setShowQuickMessages(true)}
          >
            <Text style={styles.quickMessagesButtonText}>
              💬 Poser une question rapide
            </Text>
          </TouchableOpacity>
        )}

        {showQuickMessages && (
          <View style={styles.quickMessagesContainer}>
            <Text style={styles.quickMessagesTitle}>Messages rapides:</Text>
            {QUICK_MESSAGES.map((msg, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickMessageButton}
                onPress={() => handleSendMessage(msg)}
              >
                <Text style={styles.quickMessageText}>{msg}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.customMessageRow}>
              <TextInput
                style={styles.customMessageInput}
                placeholder="Ou écrivez votre message..."
                value={message}
                onChangeText={setMessage}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => message && handleSendMessage(message)}
              >
                <Text style={styles.sendButtonText}>📤</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowQuickMessages(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actions (pour les livreurs) */}
        {!isMyRequest && request.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAcceptOriginalPrice}
            >
              <Text style={styles.acceptButtonText}>
                ✅ Accepter à {request.price}€
              </Text>
            </TouchableOpacity>

            {request.is_negotiable && !showNegotiation && (
              <TouchableOpacity
                style={styles.negotiateButton}
                onPress={() => setShowNegotiation(true)}
              >
                <Text style={styles.negotiateButtonText}>
                  💰 Proposer un autre prix
                </Text>
              </TouchableOpacity>
            )}

            {showNegotiation && (
              <View style={styles.negotiationCard}>
                <Text style={styles.negotiationTitle}>
                  Proposer un prix
                </Text>
                <Text style={styles.negotiationInfo}>
                  Entre {request.price}€ et {request.max_price}€
                </Text>

                <View style={styles.priceInputRow}>
                  <TextInput
                    style={styles.priceInput}
                    value={proposedPrice}
                    onChangeText={setProposedPrice}
                    keyboardType="numeric"
                    placeholder="Prix"
                  />
                  <Text style={styles.euro}>€</Text>
                </View>

                <View style={styles.quickPrices}>
                  {[60, 65, 70, 75, 80].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={styles.quickPriceButton}
                      onPress={() => setProposedPrice(p.toString())}
                    >
                      <Text style={styles.quickPriceText}>{p}€</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.proposeButton}
                  onPress={handlePropose}
                >
                  <Text style={styles.proposeButtonText}>
                    Envoyer ma proposition
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelNegotiationButton}
                  onPress={() => setShowNegotiation(false)}
                >
                  <Text style={styles.cancelNegotiationButtonText}>
                    Annuler
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Info pour le créateur */}
        {isMyRequest && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              📱 Vous recevrez une notification quand un livreur accepte votre demande
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
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
  distance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  type: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  priceCard: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  negotiable: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 5,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
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
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 10,
    marginVertical: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 10,
    width: 30,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  quickMessagesButton: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  quickMessagesButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  quickMessagesContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  quickMessagesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quickMessageButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  quickMessageText: {
    fontSize: 14,
    color: '#333',
  },
  customMessageRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  customMessageInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 20,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 14,
  },
  actions: {
    marginTop: 20,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  negotiateButton: {
    backgroundColor: '#FF9800',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  negotiateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  negotiationCard: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  negotiationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  negotiationInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  priceInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  euro: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 10,
  },
  quickPrices: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  quickPriceButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickPriceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  proposeButton: {
    backgroundColor: '#FF9800',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  proposeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelNegotiationButton: {
    padding: 10,
    alignItems: 'center',
  },
  cancelNegotiationButtonText: {
    color: '#999',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
});
