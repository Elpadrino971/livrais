import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeliveryStatus } from '@/types/database';

interface StatusBadgeProps {
  status: DeliveryStatus;
  size?: 'small' | 'medium' | 'large';
}

const STATUS_CONFIG = {
  pending: {
    label: '⏳ En attente',
    color: '#FF9800',
    bg: '#FFF3E0',
  },
  accepted: {
    label: '✅ Acceptée',
    color: '#4CAF50',
    bg: '#E8F5E9',
  },
  in_progress: {
    label: '🚚 En cours',
    color: '#2196F3',
    bg: '#E3F2FD',
  },
  completed: {
    label: '✓ Terminée',
    color: '#4CAF50',
    bg: '#E8F5E9',
  },
  cancelled: {
    label: '✕ Annulée',
    color: '#f44336',
    bg: '#FFEBEE',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const config = STATUS_CONFIG[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        size === 'small' && styles.badgeSmall,
        size === 'large' && styles.badgeLarge,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.color },
          size === 'small' && styles.textSmall,
          size === 'large' && styles.textLarge,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
  textLarge: {
    fontSize: 14,
  },
});
