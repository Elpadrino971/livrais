import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, VEHICLE_TYPES, REQUEST_TYPES } from '../constants';

export interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  vehicleTypes?: string[];
  requestTypes?: string[];
  maxDistance?: number;
  onlyAvailable?: boolean;
  minRating?: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters, visible]);

  const handleReset = () => {
    setFilters({});
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const toggleVehicleType = (vehicleType: string) => {
    const current = filters.vehicleTypes || [];
    if (current.includes(vehicleType)) {
      setFilters({
        ...filters,
        vehicleTypes: current.filter(v => v !== vehicleType),
      });
    } else {
      setFilters({
        ...filters,
        vehicleTypes: [...current, vehicleType],
      });
    }
  };

  const toggleRequestType = (requestType: string) => {
    const current = filters.requestTypes || [];
    if (current.includes(requestType)) {
      setFilters({
        ...filters,
        requestTypes: current.filter(t => t !== requestType),
      });
    } else {
      setFilters({
        ...filters,
        requestTypes: [...current, requestType],
      });
    }
  };

  const PRICE_RANGES = [
    { label: 'Moins de 10€', min: 0, max: 10 },
    { label: '10€ - 20€', min: 10, max: 20 },
    { label: '20€ - 50€', min: 20, max: 50 },
    { label: '50€ - 100€', min: 50, max: 100 },
    { label: 'Plus de 100€', min: 100, max: 1000 },
  ];

  const DISTANCE_OPTIONS = [
    { label: 'Moins de 5 km', value: 5 },
    { label: 'Moins de 10 km', value: 10 },
    { label: 'Moins de 20 km', value: 20 },
    { label: 'Moins de 30 km', value: 30 },
    { label: 'Toutes distances', value: undefined },
  ];

  const RATING_OPTIONS = [
    { label: 'Toutes notes', value: undefined },
    { label: '4+ ⭐', value: 4 },
    { label: '4.5+ ⭐', value: 4.5 },
  ];

  const isPriceRangeSelected = (min: number, max: number) => {
    return filters.minPrice === min && filters.maxPrice === max;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Filtres</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetButton}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Prix</Text>
              <View style={styles.optionsGrid}>
                {PRICE_RANGES.map((range) => (
                  <TouchableOpacity
                    key={range.label}
                    style={[
                      styles.optionChip,
                      isPriceRangeSelected(range.min, range.max) && styles.optionChipActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        minPrice: range.min,
                        maxPrice: range.max,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        isPriceRangeSelected(range.min, range.max) && styles.optionChipTextActive,
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Distance maximale</Text>
              <View style={styles.optionsGrid}>
                {DISTANCE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.optionChip,
                      filters.maxDistance === option.value && styles.optionChipActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        maxDistance: option.value,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        filters.maxDistance === option.value && styles.optionChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Vehicle Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚗 Type de véhicule</Text>
              <View style={styles.optionsGrid}>
                {Object.entries(VEHICLE_TYPES).map(([key, vehicle]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.optionChip,
                      (filters.vehicleTypes || []).includes(key) && styles.optionChipActive,
                    ]}
                    onPress={() => toggleVehicleType(key)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        (filters.vehicleTypes || []).includes(key) && styles.optionChipTextActive,
                      ]}
                    >
                      {vehicle.emoji} {vehicle.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Request Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📦 Type de demande</Text>
              <View style={styles.optionsGrid}>
                {Object.entries(REQUEST_TYPES).map(([key, type]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.optionChip,
                      (filters.requestTypes || []).includes(key) && styles.optionChipActive,
                    ]}
                    onPress={() => toggleRequestType(key)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        (filters.requestTypes || []).includes(key) && styles.optionChipTextActive,
                      ]}
                    >
                      {type.icon} {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⭐ Note minimale</Text>
              <View style={styles.optionsGrid}>
                {RATING_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.optionChip,
                      filters.minRating === option.value && styles.optionChipActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        minRating: option.value,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        filters.minRating === option.value && styles.optionChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Only Available */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() =>
                  setFilters({
                    ...filters,
                    onlyAvailable: !filters.onlyAvailable,
                  })
                }
              >
                <View>
                  <Text style={styles.toggleLabel}>Uniquement disponibles</Text>
                  <Text style={styles.toggleSubtitle}>
                    Afficher seulement les livreurs actuellement disponibles
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggle,
                    filters.onlyAvailable && styles.toggleActive,
                  ]}
                >
                  <View style={[
                    styles.toggleThumb,
                    filters.onlyAvailable && styles.toggleThumbActive,
                  ]} />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Appliquer les filtres</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.text,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  resetButton: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  optionChipTextActive: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    maxWidth: '80%',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
