import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export const LoadingScreen = () => (
  <View style={styles.container}>
    <Text style={styles.emoji}>🚚</Text>
    <ActivityIndicator size="large" color="#2196F3" />
    <Text style={styles.text}>Chargement...</Text>
  </View>
);

export const EmptyState = ({
  emoji,
  title,
  subtitle,
  action
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode
}) => (
  <View style={styles.container}>
    <Text style={styles.bigEmoji}>{emoji}</Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    {action}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  bigEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
