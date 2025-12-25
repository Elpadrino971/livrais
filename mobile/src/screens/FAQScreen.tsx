import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    category: '💰 Paiements',
    question: 'Comment fonctionne le paiement ?',
    answer: 'Les paiements sont sécurisés via Stripe. Le montant est bloqué lors de l\'acceptation de la livraison et n\'est transféré au livreur qu\'après confirmation de la livraison. Vous pouvez payer par carte bancaire.',
  },
  {
    category: '💰 Paiements',
    question: 'Quelle est la commission de Livrais ?',
    answer: 'Livrais prélève 15% + 0,99€ par transaction (minimum 1,50€). Les pourboires sont reversés à 100% au livreur sans commission.',
  },
  {
    category: '💰 Paiements',
    question: 'Comment recevoir mes gains ?',
    answer: 'Les gains sont transférés sur votre compte bancaire via Stripe Connect sous 2-7 jours ouvrés après chaque livraison complétée.',
  },
  {
    category: '📦 Livraisons',
    question: 'Puis-je annuler une demande ?',
    answer: 'Oui, vous pouvez annuler gratuitement jusqu\'à 2h avant la prise en charge. Entre 2h et 30 min : 30% de frais. Moins de 30 min : 50% de frais.',
  },
  {
    category: '📦 Livraisons',
    question: 'Que faire si le colis est endommagé ?',
    answer: 'Prenez des photos immédiatement et contactez le support via l\'app. Ne confirmez pas la livraison. Nous ouvrirons une procédure de résolution de litige sous 48h.',
  },
  {
    category: '📦 Livraisons',
    question: 'Quels objets sont interdits ?',
    answer: 'Substances illégales, armes, animaux vivants (sans accord), denrées périssables sans emballage, objets volés ou contrefaits. Consultez les Conditions d\'utilisation pour la liste complète.',
  },
  {
    category: '📦 Livraisons',
    question: 'Comment suivre ma livraison ?',
    answer: 'Une fois la livraison acceptée, vous pouvez suivre le livreur en temps réel sur la carte. Vous recevrez aussi des notifications à chaque étape (prise en charge, en route, livraison).',
  },
  {
    category: '🚗 Pour les livreurs',
    question: 'Ai-je besoin d\'une assurance spéciale ?',
    answer: 'Oui, vous devez avoir une assurance véhicule valide. Nous recommandons de vérifier avec votre assureur que les livraisons occasionnelles sont couvertes.',
  },
  {
    category: '🚗 Pour les livreurs',
    question: 'Comment devenir livreur ?',
    answer: 'Inscrivez-vous sur l\'app, complétez votre profil, ajoutez vos informations bancaires via Stripe, et activez le "Mode livreur" pour commencer à recevoir des demandes.',
  },
  {
    category: '🚗 Pour les livreurs',
    question: 'Puis-je refuser une demande ?',
    answer: 'Oui, vous êtes totalement libre d\'accepter ou refuser les demandes. Il n\'y a aucune pénalité. Vous pouvez aussi négocier le prix avant d\'accepter.',
  },
  {
    category: '⭐ Compte',
    question: 'Comment améliorer ma note ?',
    answer: 'Soyez ponctuel, soigneux avec les colis, communiquez avec vos clients, soyez aimable. Les critères évalués sont : ponctualité, soin, professionnalisme, et amabilité.',
  },
  {
    category: '⭐ Compte',
    question: 'Puis-je supprimer mon compte ?',
    answer: 'Oui, rendez-vous dans Paramètres > Compte > Supprimer mon compte. Attention : cette action est irréversible et toutes vos données seront supprimées sous 30 jours.',
  },
  {
    category: '🔒 Sécurité',
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Oui, toutes les communications sont chiffrées (HTTPS/TLS), les mots de passe sont hashés, et les données bancaires sont gérées par Stripe (certifié PCI DSS). Nous ne vendons jamais vos données.',
  },
  {
    category: '🔒 Sécurité',
    question: 'Comment signaler un utilisateur ?',
    answer: 'Sur le profil de l\'utilisateur, appuyez sur "⋮" puis "Signaler". Décrivez le problème. Notre équipe examinera sous 24h et prendra les mesures appropriées.',
  },
];

export default function FAQScreen() {
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });

  const categories = Array.from(new Set(FAQ_DATA.map(item => item.category)));

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSendMessage = () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // In real implementation, this would send to support API
    Alert.alert(
      'Message envoyé',
      'Nous avons bien reçu votre message. Notre équipe vous répondra sous 24h.',
      [{ text: 'OK', onPress: () => {
        setShowContactForm(false);
        setContactForm({ subject: '', message: '' });
      }}]
    );
  };

  if (showContactForm) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowContactForm(false)}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contactez-nous</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.formContent}>
          <Text style={styles.formDescription}>
            Notre équipe vous répondra sous 24 heures (jours ouvrés).
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sujet</Text>
            <TextInput
              style={styles.input}
              value={contactForm.subject}
              onChangeText={(text) => setContactForm({ ...contactForm, subject: text })}
              placeholder="Ex: Problème de paiement"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={contactForm.message}
              onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
              placeholder="Décrivez votre problème en détail..."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Envoyer le message</Text>
          </TouchableOpacity>

          <View style={styles.alternativeContact}>
            <Text style={styles.alternativeTitle}>Autres moyens de contact :</Text>
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => Linking.openURL('mailto:support@livrais.gf')}
            >
              <Text style={styles.contactOptionIcon}>📧</Text>
              <Text style={styles.contactOptionText}>support@livrais.gf</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => Linking.openURL('tel:+594694000000')}
            >
              <Text style={styles.contactOptionIcon}>📱</Text>
              <Text style={styles.contactOptionText}>+594 694 XX XX XX</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>👋 Comment pouvons-nous vous aider ?</Text>
          <Text style={styles.welcomeText}>
            Consultez notre FAQ ou contactez notre équipe
          </Text>
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => setShowContactForm(true)}
        >
          <Text style={styles.contactButtonIcon}>💬</Text>
          <View style={styles.contactButtonContent}>
            <Text style={styles.contactButtonTitle}>Contactez le support</Text>
            <Text style={styles.contactButtonSubtitle}>Réponse sous 24h</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {FAQ_DATA.filter(item => item.category === category).map((item, index) => {
              const globalIndex = FAQ_DATA.indexOf(item);
              const isExpanded = expandedIndex === globalIndex;

              return (
                <TouchableOpacity
                  key={globalIndex}
                  style={styles.faqItem}
                  onPress={() => toggleExpanded(globalIndex)}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={styles.faqQuestionText}>{item.question}</Text>
                    <Text style={styles.faqIcon}>{isExpanded ? '▼' : '▶'}</Text>
                  </View>
                  {isExpanded && (
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Vous ne trouvez pas de réponse ?</Text>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => setShowContactForm(true)}
          >
            <Text style={styles.footerButtonText}>Contactez-nous</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 24,
    color: COLORS.text,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  contactButtonIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  contactButtonContent: {
    flex: 1,
  },
  contactButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  contactButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  arrow: {
    fontSize: 20,
    color: '#fff',
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    paddingRight: 10,
  },
  faqIcon: {
    fontSize: 12,
    color: COLORS.primary,
  },
  faqAnswer: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textLight,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  footerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  formContent: {
    padding: 20,
  },
  formDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  alternativeContact: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  alternativeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  contactOptionIcon: {
    fontSize: 20,
  },
  contactOptionText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
