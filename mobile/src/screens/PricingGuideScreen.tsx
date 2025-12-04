import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  QUICK_PRICES,
  PRICE_EXAMPLES,
  PRICING_TIPS,
  PLATFORM_FEES,
  calculatePlatformFee,
} from '@/constants/pricing';

export default function PricingGuideScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Guide des tarifs</Text>
        <Text style={styles.headerSubtitle}>
          Prix indicatifs - négociables avec le livreur
        </Text>
      </View>

      <View style={styles.content}>
        {/* Grille de prix rapide */}
        <Text style={styles.sectionTitle}>Grille de prix indicative</Text>
        {QUICK_PRICES.map((category, index) => (
          <View key={index} style={styles.categoryCard}>
            <Text style={styles.categoryTitle}>
              {category.icon} {category.category}
            </Text>
            {category.ranges.map((range, i) => (
              <View key={i} style={styles.priceRow}>
                <Text style={styles.distanceText}>{range.distance}</Text>
                <View style={styles.priceDots} />
                <Text style={styles.priceText}>{range.price}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Exemples concrets */}
        <Text style={styles.sectionTitle}>Exemples de tarifs</Text>
        {PRICE_EXAMPLES.map((example, index) => (
          <View key={index} style={styles.exampleCard}>
            <View style={styles.exampleHeader}>
              <Text style={styles.exampleTitle}>{example.title}</Text>
              <Text style={styles.examplePrice}>{example.price}</Text>
            </View>
            <Text style={styles.exampleDescription}>
              {example.description}
            </Text>
            <Text style={styles.exampleDistance}>
              📏 Distance: {example.distance} km
            </Text>
          </View>
        ))}

        {/* Commission plateforme */}
        <View style={styles.feesCard}>
          <Text style={styles.feesTitle}>💳 Frais de plateforme</Text>
          <Text style={styles.feesText}>
            • Commission: {(PLATFORM_FEES.commission * 100).toFixed(0)}%
          </Text>
          <Text style={styles.feesText}>
            • Frais fixe: {PLATFORM_FEES.fixedFee.toFixed(2)}€
          </Text>
          <Text style={styles.feesText}>
            • Minimum: {PLATFORM_FEES.minFee.toFixed(2)}€
          </Text>

          <View style={styles.feesDivider} />

          <Text style={styles.feesExample}>Exemple pour 50€:</Text>
          {(() => {
            const { platformFee, delivererAmount } = calculatePlatformFee(50);
            return (
              <>
                <Text style={styles.feesBreakdown}>
                  • Client paie: <Text style={styles.bold}>50.00€</Text>
                </Text>
                <Text style={styles.feesBreakdown}>
                  • Frais plateforme: <Text style={styles.bold}>{platformFee.toFixed(2)}€</Text>
                </Text>
                <Text style={styles.feesBreakdown}>
                  • Livreur reçoit: <Text style={styles.green}>{delivererAmount.toFixed(2)}€</Text>
                </Text>
              </>
            );
          })()}
        </View>

        {/* Conseils */}
        <Text style={styles.sectionTitle}>💡 Bon à savoir</Text>
        <View style={styles.tipsCard}>
          {PRICING_TIPS.map((tip, index) => (
            <Text key={index} style={styles.tipText}>
              {tip}
            </Text>
          ))}
        </View>

        {/* Facteurs de prix */}
        <View style={styles.factorsCard}>
          <Text style={styles.factorsTitle}>📊 Ce qui influence le prix</Text>

          <View style={styles.factorRow}>
            <Text style={styles.factorIcon}>📏</Text>
            <View style={styles.factorContent}>
              <Text style={styles.factorName}>Distance</Text>
              <Text style={styles.factorDescription}>
                Plus la distance est longue, plus le prix augmente
              </Text>
            </View>
          </View>

          <View style={styles.factorRow}>
            <Text style={styles.factorIcon}>📦</Text>
            <View style={styles.factorContent}>
              <Text style={styles.factorName}>Type d'objet</Text>
              <Text style={styles.factorDescription}>
                Objets lourds ou encombrants coûtent plus cher
              </Text>
            </View>
          </View>

          <View style={styles.factorRow}>
            <Text style={styles.factorIcon}>👥</Text>
            <View style={styles.factorContent}>
              <Text style={styles.factorName}>Nombre de personnes</Text>
              <Text style={styles.factorDescription}>
                2 personnes = +50% sur le prix
              </Text>
            </View>
          </View>

          <View style={styles.factorRow}>
            <Text style={styles.factorIcon}>🚗</Text>
            <View style={styles.factorContent}>
              <Text style={styles.factorName}>Véhicule spécial</Text>
              <Text style={styles.factorDescription}>
                Camionnette ou pick-up = +10€
              </Text>
            </View>
          </View>

          <View style={styles.factorRow}>
            <Text style={styles.factorIcon}>⏰</Text>
            <View style={styles.factorContent}>
              <Text style={styles.factorName}>Urgence</Text>
              <Text style={styles.factorDescription}>
                Livraison immédiate peut coûter plus cher
              </Text>
            </View>
          </View>

          <View style={styles.factorRow}>
            <Text style={styles.factorIcon}>⭐</Text>
            <View style={styles.factorContent}>
              <Text style={styles.factorName}>Expérience livreur</Text>
              <Text style={styles.factorDescription}>
                Livreurs bien notés peuvent demander un prix supérieur
              </Text>
            </View>
          </View>
        </View>

        {/* Info négociation */}
        <View style={styles.negotiationCard}>
          <Text style={styles.negotiationTitle}>💬 Négociation</Text>
          <Text style={styles.negotiationText}>
            Tous les prix sont <Text style={styles.bold}>négociables</Text> entre
            le client et le livreur.
          </Text>
          <Text style={styles.negotiationText}>
            Le client fixe un <Text style={styles.bold}>prix de départ</Text> et
            peut accepter des contre-propositions jusqu'à un{' '}
            <Text style={styles.bold}>prix maximum</Text>.
          </Text>
          <Text style={styles.negotiationText}>
            Le premier livreur qui accepte (ou dont l'offre est acceptée)
            obtient la mission.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ces prix sont donnés à titre indicatif.
          </Text>
          <Text style={styles.footerText}>
            Les tarifs réels dépendent de la négociation entre le client et le livreur.
          </Text>
        </View>
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
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  content: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  priceDots: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderStyle: 'dotted',
    marginHorizontal: 10,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    width: 80,
    textAlign: 'right',
  },
  exampleCard: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  examplePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  exampleDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  exampleDistance: {
    fontSize: 12,
    color: '#888',
  },
  feesCard: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  feesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feesText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  feesDivider: {
    height: 1,
    backgroundColor: '#FFE0B2',
    marginVertical: 10,
  },
  feesExample: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  feesBreakdown: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  green: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tipsCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 8,
    lineHeight: 20,
  },
  factorsCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  factorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  factorRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  factorIcon: {
    fontSize: 24,
    width: 40,
  },
  factorContent: {
    flex: 1,
  },
  factorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  factorDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  negotiationCard: {
    backgroundColor: '#F3E5F5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  negotiationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#7B1FA2',
  },
  negotiationText: {
    fontSize: 14,
    color: '#4A148C',
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 3,
  },
});
