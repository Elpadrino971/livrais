import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Dernière mise à jour : 25 décembre 2024</Text>

        <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
        <Text style={styles.paragraph}>
          En utilisant l'application Livrais, vous acceptez d'être lié par les présentes
          conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas
          utiliser l'application.
        </Text>

        <Text style={styles.sectionTitle}>2. Description du service</Text>
        <Text style={styles.paragraph}>
          Livrais est une plateforme de mise en relation entre des particuliers souhaitant
          envoyer ou recevoir des colis/courses en Guyane française et des livreurs indépendants.
          Livrais n'est pas un service de livraison mais une plateforme technologique facilitant
          ces mises en relation.
        </Text>

        <Text style={styles.sectionTitle}>3. Inscription et compte utilisateur</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>3.1</Text> Vous devez avoir au moins 18 ans pour utiliser ce service.{'\n\n'}
          <Text style={styles.bold}>3.2</Text> Vous êtes responsable de la confidentialité de votre compte
          et de votre mot de passe.{'\n\n'}
          <Text style={styles.bold}>3.3</Text> Vous acceptez de fournir des informations exactes,
          actuelles et complètes lors de votre inscription.{'\n\n'}
          <Text style={styles.bold}>3.4</Text> Vous acceptez de notifier immédiatement Livrais de toute
          utilisation non autorisée de votre compte.
        </Text>

        <Text style={styles.sectionTitle}>4. Utilisation du service</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>4.1 Pour les expéditeurs :</Text>{'\n'}
          • Vous devez décrire avec précision les articles à livrer{'\n'}
          • Vous êtes responsable du contenu de vos colis{'\n'}
          • Vous ne pouvez pas envoyer d'articles illégaux, dangereux ou interdits{'\n'}
          • Vous devez être présent aux heures convenues pour la prise en charge{'\n\n'}
          <Text style={styles.bold}>4.2 Pour les livreurs :</Text>{'\n'}
          • Vous devez posséder un véhicule en bon état et une assurance valide{'\n'}
          • Vous devez traiter les colis avec soin{'\n'}
          • Vous devez respecter les horaires convenus{'\n'}
          • Vous êtes responsable de la sécurité des articles pendant le transport
        </Text>

        <Text style={styles.sectionTitle}>5. Tarification et paiements</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>5.1</Text> Les prix sont librement négociés entre expéditeurs et livreurs.{'\n\n'}
          <Text style={styles.bold}>5.2</Text> Livrais prélève une commission de 15% + 0,99€ par transaction
          (minimum 1,50€).{'\n\n'}
          <Text style={styles.bold}>5.3</Text> Les paiements sont traités de manière sécurisée via Stripe.{'\n\n'}
          <Text style={styles.bold}>5.4</Text> Les remboursements sont possibles en cas de litige
          justifié, selon notre politique de remboursement.{'\n\n'}
          <Text style={styles.bold}>5.5</Text> Les pourboires sont reversés à 100% au livreur (aucune commission).
        </Text>

        <Text style={styles.sectionTitle}>6. Annulations et remboursements</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>6.1</Text> Annulation gratuite jusqu'à 2 heures avant la prise en charge.{'\n\n'}
          <Text style={styles.bold}>6.2</Text> Annulation entre 2h et 30 minutes avant : frais de 30%.{'\n\n'}
          <Text style={styles.bold}>6.3</Text> Annulation moins de 30 minutes avant : frais de 50%.{'\n\n'}
          <Text style={styles.bold}>6.4</Text> En cas de non-présentation sans annulation : aucun remboursement.
        </Text>

        <Text style={styles.sectionTitle}>7. Responsabilités</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>7.1</Text> Livrais agit uniquement comme intermédiaire et n'est pas
          responsable des dommages, pertes ou retards.{'\n\n'}
          <Text style={styles.bold}>7.2</Text> Les livreurs sont des indépendants, non des employés de Livrais.{'\n\n'}
          <Text style={styles.bold}>7.3</Text> Nous recommandons de souscrire une assurance pour les objets
          de valeur supérieure à 100€.{'\n\n'}
          <Text style={styles.bold}>7.4</Text> En cas de litige, contactez notre service client dans les
          48 heures suivant la livraison.
        </Text>

        <Text style={styles.sectionTitle}>8. Articles interdits</Text>
        <Text style={styles.paragraph}>
          Il est strictement interdit de transporter :{'\n'}
          • Substances illégales ou dangereuses{'\n'}
          • Armes ou munitions{'\n'}
          • Animaux vivants (sauf accord préalable){'\n'}
          • Denrées périssables sans emballage approprié{'\n'}
          • Objets volés ou contrefaits{'\n'}
          • Tout article dont le transport est illégal
        </Text>

        <Text style={styles.sectionTitle}>9. Vie privée et données personnelles</Text>
        <Text style={styles.paragraph}>
          Vos données personnelles sont traitées conformément à notre Politique de confidentialité.
          Nous collectons uniquement les données nécessaires au fonctionnement du service et ne les
          partageons jamais avec des tiers sans votre consentement.
        </Text>

        <Text style={styles.sectionTitle}>10. Modification des conditions</Text>
        <Text style={styles.paragraph}>
          Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs
          seront notifiés des changements importants par email ou notification. L'utilisation
          continue du service après modification vaut acceptation des nouvelles conditions.
        </Text>

        <Text style={styles.sectionTitle}>11. Résiliation</Text>
        <Text style={styles.paragraph}>
          Nous pouvons suspendre ou résilier votre compte en cas de violation de ces conditions,
          d'activité frauduleuse, ou de comportement inapproprié. Vous pouvez également fermer
          votre compte à tout moment depuis les paramètres.
        </Text>

        <Text style={styles.sectionTitle}>12. Droit applicable</Text>
        <Text style={styles.paragraph}>
          Ces conditions sont régies par le droit français. Tout litige sera soumis aux tribunaux
          compétents de Cayenne, Guyane française.
        </Text>

        <Text style={styles.sectionTitle}>13. Contact</Text>
        <Text style={styles.paragraph}>
          Pour toute question concernant ces conditions :{'\n\n'}
          Email: support@livrais.gf{'\n'}
          Téléphone: +594 694 XX XX XX{'\n'}
          Adresse: Cayenne, Guyane française
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            En utilisant Livrais, vous reconnaissez avoir lu et accepté ces conditions d'utilisation.
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
  lastUpdated: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text,
    marginBottom: 16,
  },
  bold: {
    fontWeight: '600',
  },
  footer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
