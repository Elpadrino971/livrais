import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';

export default function AboutScreen() {
  const navigation = useNavigation();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>À propos de Livrais</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>📦</Text>
          <Text style={styles.appName}>Livrais</Text>
          <Text style={styles.version}>Version 1.0.0 (Beta)</Text>
          <Text style={styles.tagline}>
            La plateforme collaborative de livraison en Guyane
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Notre mission</Text>
          <Text style={styles.paragraph}>
            Livrais a été créé pour répondre aux défis logistiques spécifiques de la Guyane
            française. Notre mission est de faciliter les livraisons entre particuliers en
            mettant en relation ceux qui ont besoin d'envoyer ou recevoir des colis avec des
            livreurs locaux de confiance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Pourquoi Livrais ?</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Local :</Text> Conçu spécifiquement pour la Guyane{'\n'}
            • <Text style={styles.bold}>Flexible :</Text> Prix négociables, horaires adaptables{'\n'}
            • <Text style={styles.bold}>Solidaire :</Text> Encourager l'économie collaborative locale{'\n'}
            • <Text style={styles.bold}>Transparent :</Text> Pas de frais cachés, système d'évaluation{'\n'}
            • <Text style={styles.bold}>Sécurisé :</Text> Paiements protégés, profils vérifiés
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Quelques chiffres</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Utilisateurs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2,000+</Text>
              <Text style={styles.statLabel}>Livraisons</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4.8/5</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Villes couvertes</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤝 Comment ça marche ?</Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Créez votre demande</Text>
                <Text style={styles.stepText}>
                  Décrivez ce que vous souhaitez envoyer, d'où et vers où
                </Text>
              </View>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Recevez des propositions</Text>
                <Text style={styles.stepText}>
                  Des livreurs à proximité vous contactent avec leurs tarifs
                </Text>
              </View>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Choisissez votre livreur</Text>
                <Text style={styles.stepText}>
                  Comparez les profils, notes et tarifs, puis validez
                </Text>
              </View>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>4</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Suivez en temps réel</Text>
                <Text style={styles.stepText}>
                  Suivez votre livraison sur la carte jusqu'à la réception
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌟 Nos valeurs</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Confiance :</Text> Système d'évaluation transparent{'\n'}
            • <Text style={styles.bold}>Équité :</Text> Commission minimale (15% + 0,99€){'\n'}
            • <Text style={styles.bold}>Respect :</Text> Des livreurs, des clients, de l'environnement{'\n'}
            • <Text style={styles.bold}>Innovation :</Text> Technologie au service du local{'\n'}
            • <Text style={styles.bold}>Communauté :</Text> Créer du lien entre Guyanais
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Nos engagements</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Confidentialité :</Text> Vos données ne sont jamais vendues{'\n\n'}
            <Text style={styles.bold}>Sécurité :</Text> Paiements cryptés via Stripe{'\n\n'}
            <Text style={styles.bold}>Support :</Text> Équipe disponible 7j/7 pour vous aider{'\n\n'}
            <Text style={styles.bold}>Amélioration continue :</Text> Nous écoutons vos retours
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Nous contacter</Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => openLink('mailto:support@livrais.gf')}
          >
            <Text style={styles.contactIcon}>📧</Text>
            <Text style={styles.contactText}>support@livrais.gf</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => openLink('tel:+594694000000')}
          >
            <Text style={styles.contactIcon}>📱</Text>
            <Text style={styles.contactText}>+594 694 XX XX XX</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => openLink('https://livrais.gf')}
          >
            <Text style={styles.contactIcon}>🌐</Text>
            <Text style={styles.contactText}>www.livrais.gf</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Informations légales</Text>
          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => navigation.navigate('TermsOfService' as never)}
          >
            <Text style={styles.legalButtonText}>Conditions d'utilisation</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.legalButton}
            onPress={() => navigation.navigate('PrivacyPolicy' as never)}
          >
            <Text style={styles.legalButtonText}>Politique de confidentialité</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Fait avec ❤️ en Guyane française
          </Text>
          <Text style={styles.copyright}>
            © 2024 Livrais. Tous droits réservés.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.text,
  },
  bold: {
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  stepContainer: {
    marginTop: 10,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 40,
    marginRight: 15,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginBottom: 10,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  legalButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginBottom: 10,
  },
  legalButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  arrow: {
    fontSize: 18,
    color: COLORS.textLight,
  },
  footer: {
    marginTop: 40,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 10,
  },
  copyright: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
