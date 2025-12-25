import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS } from '../constants';
import { EmptyState } from '../components/LoadingStates';
import StatusBadge from '../components/StatusBadge';

interface DeliveryHistoryItem {
  id: string;
  type: string;
  status: string;
  price: number;
  created_at: string;
  completed_at: string | null;
  pickup_address: string;
  delivery_address: string;
  user_role: 'sender' | 'deliverer';
  other_party_name: string;
  other_party_photo: string | null;
  rating_given: number | null;
  rating_received: number | null;
  distance_km: number;
}

export default function DeliveryHistoryScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [deliveries, setDeliveries] = useState<DeliveryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sender' | 'deliverer'>('all');

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      // Fetch deliveries where user was sender
      const { data: senderDeliveries, error: senderError } = await supabase
        .from('delivery_requests')
        .select(`
          id,
          type,
          status,
          price,
          created_at,
          completed_at,
          pickup_address,
          delivery_address,
          distance_km,
          deliverer:deliverer_id (
            id,
            full_name,
            avatar_url
          ),
          ratings!ratings_delivery_id_fkey (
            id,
            rating,
            rater_id
          )
        `)
        .eq('user_id', user?.id)
        .in('status', ['completed', 'cancelled'])
        .order('completed_at', { ascending: false, nullsFirst: false })
        .limit(50);

      if (senderError) throw senderError;

      // Fetch deliveries where user was deliverer
      const { data: delivererDeliveries, error: delivererError } = await supabase
        .from('delivery_requests')
        .select(`
          id,
          type,
          status,
          price,
          created_at,
          completed_at,
          pickup_address,
          delivery_address,
          distance_km,
          sender:user_id (
            id,
            full_name,
            avatar_url
          ),
          ratings!ratings_delivery_id_fkey (
            id,
            rating,
            rater_id
          )
        `)
        .eq('deliverer_id', user?.id)
        .in('status', ['completed', 'cancelled'])
        .order('completed_at', { ascending: false, nullsFirst: false })
        .limit(50);

      if (delivererError) throw delivererError;

      // Transform and combine data
      const senderHistory: DeliveryHistoryItem[] = (senderDeliveries || []).map((d: any) => ({
        id: d.id,
        type: d.type,
        status: d.status,
        price: d.price,
        created_at: d.created_at,
        completed_at: d.completed_at,
        pickup_address: d.pickup_address,
        delivery_address: d.delivery_address,
        user_role: 'sender' as const,
        other_party_name: d.deliverer?.full_name || 'Livreur inconnu',
        other_party_photo: d.deliverer?.avatar_url,
        rating_given: d.ratings?.find((r: any) => r.rater_id === user?.id)?.rating || null,
        rating_received: d.ratings?.find((r: any) => r.rater_id !== user?.id)?.rating || null,
        distance_km: d.distance_km,
      }));

      const delivererHistory: DeliveryHistoryItem[] = (delivererDeliveries || []).map((d: any) => ({
        id: d.id,
        type: d.type,
        status: d.status,
        price: d.price,
        created_at: d.created_at,
        completed_at: d.completed_at,
        pickup_address: d.pickup_address,
        delivery_address: d.delivery_address,
        user_role: 'deliverer' as const,
        other_party_name: d.sender?.full_name || 'Client inconnu',
        other_party_photo: d.sender?.avatar_url,
        rating_given: d.ratings?.find((r: any) => r.rater_id === user?.id)?.rating || null,
        rating_received: d.ratings?.find((r: any) => r.rater_id !== user?.id)?.rating || null,
        distance_km: d.distance_km,
      }));

      // Combine and sort by completion date
      let allDeliveries = [...senderHistory, ...delivererHistory].sort((a, b) => {
        const dateA = new Date(a.completed_at || a.created_at).getTime();
        const dateB = new Date(b.completed_at || b.created_at).getTime();
        return dateB - dateA;
      });

      // Apply filter
      if (filter === 'sender') {
        allDeliveries = allDeliveries.filter(d => d.user_role === 'sender');
      } else if (filter === 'deliverer') {
        allDeliveries = allDeliveries.filter(d => d.user_role === 'deliverer');
      }

      setDeliveries(allDeliveries);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'package': return '📦';
      case 'groceries': return '🛒';
      case 'heavy_item': return '📦';
      case 'carpool': return '🚗';
      default: return '📦';
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <Text style={styles.noRating}>Pas de note</Text>;
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.star}>
            {star <= rating ? '⭐' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  const renderDeliveryItem = ({ item }: { item: DeliveryHistoryItem }) => (
    <TouchableOpacity
      style={styles.deliveryCard}
      onPress={() => navigation.navigate('RequestDetails' as never, { requestId: item.id } as never)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
          <View>
            <Text style={styles.roleLabel}>
              {item.user_role === 'sender' ? 'Envoi' : 'Livraison'}
            </Text>
            <Text style={styles.dateText}>{formatDate(item.completed_at || item.created_at)}</Text>
          </View>
        </View>
        <StatusBadge status={item.status} size="small" />
      </View>

      <View style={styles.routeContainer}>
        <Text style={styles.routeText} numberOfLines={1}>
          📍 {item.pickup_address}
        </Text>
        <Text style={styles.routeArrow}>↓</Text>
        <Text style={styles.routeText} numberOfLines={1}>
          📍 {item.delivery_address}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.otherParty}>
          {item.other_party_photo ? (
            <View style={styles.avatar}>
              {/* Image would go here */}
              <Text style={styles.avatarText}>{item.other_party_name[0]}</Text>
            </View>
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.other_party_name[0]}</Text>
            </View>
          )}
          <View style={styles.otherPartyInfo}>
            <Text style={styles.otherPartyName} numberOfLines={1}>
              {item.other_party_name}
            </Text>
            {item.user_role === 'sender' && item.rating_given !== null && (
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Votre note : </Text>
                {renderStars(item.rating_given)}
              </View>
            )}
            {item.user_role === 'deliverer' && item.rating_received !== null && (
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Note reçue : </Text>
                {renderStars(item.rating_received)}
              </View>
            )}
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>
            {item.user_role === 'sender' ? 'Payé' : 'Gagné'}
          </Text>
          <Text style={styles.price}>{item.price.toFixed(2)}€</Text>
          <Text style={styles.distance}>{item.distance_km.toFixed(1)} km</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            Tout ({deliveries.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'sender' && styles.filterButtonActive]}
          onPress={() => setFilter('sender')}
        >
          <Text style={[styles.filterButtonText, filter === 'sender' && styles.filterButtonTextActive]}>
            Envois
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'deliverer' && styles.filterButtonActive]}
          onPress={() => setFilter('deliverer')}
        >
          <Text style={[styles.filterButtonText, filter === 'deliverer' && styles.filterButtonTextActive]}>
            Livraisons
          </Text>
        </TouchableOpacity>
      </View>

      {deliveries.length === 0 ? (
        <EmptyState
          emoji="📦"
          title="Aucune livraison"
          subtitle={
            filter === 'all'
              ? "Vous n'avez pas encore d'historique de livraisons"
              : filter === 'sender'
              ? "Vous n'avez pas encore envoyé de colis"
              : "Vous n'avez pas encore effectué de livraisons"
          }
        />
      ) : (
        <FlatList
          data={deliveries}
          renderItem={renderDeliveryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 15,
  },
  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeIcon: {
    fontSize: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  routeContainer: {
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  routeText: {
    fontSize: 13,
    color: COLORS.text,
    marginVertical: 2,
  },
  routeArrow: {
    fontSize: 14,
    color: COLORS.primary,
    marginVertical: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  otherParty: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  otherPartyInfo: {
    flex: 1,
  },
  otherPartyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 10,
  },
  noRating: {
    fontSize: 11,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  distance: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
