import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProfileScreen({ navigation }: any) {
  const { profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert('Erreur', error.message);
          }
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {profile.full_name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}

        <Text style={styles.name}>{profile.full_name || 'Utilisateur'}</Text>
        <Text style={styles.email}>{profile.email}</Text>

        {profile.city && (
          <Text style={styles.city}>📍 {profile.city}</Text>
        )}

        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {profile.rating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>
            ({profile.total_ratings} avis)
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.total_deliveries}</Text>
          <Text style={styles.statLabel}>Livraisons</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile.total_requests}</Text>
          <Text style={styles.statLabel}>Demandes</Text>
        </View>
      </View>

      {profile.is_premium && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>⭐ Membre Premium</Text>
        </View>
      )}

      {profile.is_verified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Identité vérifiée</Text>
        </View>
      )}

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.menuText}>✏️ Modifier le profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyDeliveries')}
        >
          <Text style={styles.menuText}>📦 Mes livraisons</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyRequests')}
        >
          <Text style={styles.menuText}>📝 Mes demandes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Payments')}
        >
          <Text style={styles.menuText}>💳 Paiements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.menuText}>⚙️ Paramètres</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>🚪 Déconnexion</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  city: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 15,
    paddingVertical: 20,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    marginHorizontal: 15,
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 15,
    marginTop: 15,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  menu: {
    marginTop: 15,
    marginBottom: 30,
  },
  menuItem: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  signOutButton: {
    marginTop: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 0,
  },
  signOutText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '600',
  },
});
