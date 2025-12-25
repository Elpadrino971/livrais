import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { isFavorite, toggleFavorite } from '../services/favorites';
import { COLORS } from '../constants';

interface FavoriteButtonProps {
  userId: string;
  userName: string;
  variant?: 'icon' | 'button';
  size?: 'small' | 'medium' | 'large';
  onToggle?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({
  userId,
  userName,
  variant = 'icon',
  size = 'medium',
  onToggle,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkFavoriteStatus();
  }, [userId]);

  const checkFavoriteStatus = async () => {
    try {
      setChecking(true);
      const status = await isFavorite(userId);
      setFavorited(status);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleToggle = async () => {
    try {
      setLoading(true);

      const { isFavorite: newStatus, success, error } = await toggleFavorite(userId);

      if (success) {
        setFavorited(newStatus);
        onToggle?.(newStatus);

        // Show feedback
        const message = newStatus
          ? `${userName} ajouté à vos favoris`
          : `${userName} retiré de vos favoris`;
        Alert.alert('Succès', message);
      } else {
        Alert.alert('Erreur', error || 'Impossible de modifier les favoris');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <ActivityIndicator
        size={size === 'small' ? 'small' : 'large'}
        color={COLORS.primary}
      />
    );
  }

  if (variant === 'button') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          favorited ? styles.buttonFavorited : styles.buttonNotFavorited,
          size === 'small' && styles.buttonSmall,
          size === 'large' && styles.buttonLarge,
        ]}
        onPress={handleToggle}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={favorited ? '#fff' : COLORS.primary} />
        ) : (
          <>
            <Text style={[styles.buttonIcon, favorited && styles.buttonIconFavorited]}>
              {favorited ? '❤️' : '🤍'}
            </Text>
            <Text style={[styles.buttonText, favorited && styles.buttonTextFavorited]}>
              {favorited ? 'Favori' : 'Ajouter aux favoris'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Icon variant (default)
  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        size === 'small' && styles.iconButtonSmall,
        size === 'large' && styles.iconButtonLarge,
      ]}
      onPress={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <Text
          style={[
            styles.icon,
            size === 'small' && styles.iconSmall,
            size === 'large' && styles.iconLarge,
          ]}
        >
          {favorited ? '❤️' : '🤍'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Icon variant styles
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  iconButtonLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  icon: {
    fontSize: 24,
  },
  iconSmall: {
    fontSize: 18,
  },
  iconLarge: {
    fontSize: 28,
  },

  // Button variant styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
    minWidth: 160,
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 120,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 200,
  },
  buttonNotFavorited: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonFavorited: {
    backgroundColor: COLORS.primary,
    borderWidth: 0,
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonIconFavorited: {
    fontSize: 18,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  buttonTextFavorited: {
    color: '#fff',
  },
});
