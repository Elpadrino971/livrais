import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 12,
  color = '#4CAF50',
  backgroundColor = '#e0e0e0',
  showPercentage = true,
  animated = true,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View>
      <View
        style={[
          styles.container,
          {
            height,
            backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.bar,
            {
              width: `${clampedProgress}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={[styles.percentage, { color }]}>
          {clampedProgress.toFixed(0)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: {
    height: '100%',
    borderRadius: 6,
  },
  percentage: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
