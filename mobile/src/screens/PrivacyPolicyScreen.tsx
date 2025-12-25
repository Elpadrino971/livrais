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

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Politique de confidentialité</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Dernière mise à jour : 25 décembre 2024</Text>

        <Text style={styles.intro}>
          Chez Livrais, nous prenons la protection de vos données personnelles très au sérieux.
          Cette politique explique quelles données nous collectons, pourquoi, et comment nous
          les protégeons.
        </Text>

        <Text style={styles.sectionTitle}>1. Données collectées</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>1.1 Informations d'inscription :</Text>{'\n'}
          • Nom et prénom{'\n'}
          • Adresse email{'\n'}
          • Numéro de téléphone{'\n'}
          • Photo de profil (optionnelle){'\n\n'}
          <Text style={styles.bold}>1.2 Données de localisation :</Text>{'\n'}
          • Position GPS pendant les livraisons{'\n'}
          • Adresses de prise en charge et de livraison{'\n'}
          • Historique des trajets (uniquement pour les livraisons effectuées){'\n\n'}
          <Text style={styles.bold}>1.3 Données de paiement :</Text>{'\n'}
          • Informations bancaires (stockées de manière sécurisée par Stripe, pas par Livrais){'\n'}
          • Historique des transactions{'\n\n'}
          <Text style={styles.bold}>1.4 Données d'utilisation :</Text>{'\n'}
          • Demandes de livraison créées{'\n'}
          • Livraisons acceptées et effectuées{'\n'}
          • Évaluations et commentaires{'\n'}
          • Messages échangés via l'application{'\n\n'}
          <Text style={styles.bold}>1.5 Données techniques :</Text>{'\n'}
          • Type d'appareil et système d'exploitation{'\n'}
          • Version de l'application{'\n'}
          • Logs d'erreurs et de performances{'\n'}
          • Adresse IP
        </Text>

        <Text style={styles.sectionTitle}>2. Utilisation des données</Text>
        <Text style={styles.paragraph}>
          Nous utilisons vos données uniquement pour :{'\n\n'}
          <Text style={styles.bold}>2.1 Fournir le service :</Text>{'\n'}
          • Mettre en relation expéditeurs et livreurs{'\n'}
          • Géolocaliser les demandes et livreurs disponibles{'\n'}
          • Traiter les paiements{'\n'}
          • Envoyer des notifications de statut{'\n\n'}
          <Text style={styles.bold}>2.2 Améliorer l'expérience :</Text>{'\n'}
          • Personnaliser les recommandations{'\n'}
          • Analyser l'utilisation pour améliorer l'app{'\n'}
          • Détecter et corriger les bugs{'\n\n'}
          <Text style={styles.bold}>2.3 Sécurité et conformité :</Text>{'\n'}
          • Prévenir la fraude{'\n'}
          • Résoudre les litiges{'\n'}
          • Respecter nos obligations légales{'\n\n'}
          <Text style={styles.bold}>2.4 Communication :</Text>{'\n'}
          • Notifications liées aux livraisons{'\n'}
          • Mises à jour importantes du service{'\n'}
          • Support client
        </Text>

        <Text style={styles.sectionTitle}>3. Partage des données</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>3.1 Avec d'autres utilisateurs :</Text>{'\n'}
          Lors d'une livraison, nous partageons :{'\n'}
          • Votre nom et photo avec l'autre partie{'\n'}
          • Votre numéro de téléphone (uniquement pour la livraison en cours){'\n'}
          • Votre position GPS en temps réel (uniquement pendant la livraison){'\n\n'}
          <Text style={styles.bold}>3.2 Avec nos partenaires :</Text>{'\n'}
          • <Text style={styles.bold}>Stripe</Text> : pour le traitement des paiements{'\n'}
          • <Text style={styles.bold}>Supabase</Text> : pour l'hébergement sécurisé des données{'\n'}
          • <Text style={styles.bold}>Expo</Text> : pour les notifications push{'\n\n'}
          <Text style={styles.bold}>3.3 Nous ne vendons JAMAIS vos données</Text> à des tiers
          à des fins marketing.{'\n\n'}
          <Text style={styles.bold}>3.4 Obligations légales :</Text>{'\n'}
          Nous pouvons divulguer vos données si la loi l'exige (demande judiciaire,
          prévention de crimes, etc.).
        </Text>

        <Text style={styles.sectionTitle}>4. Protection des données</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>4.1 Chiffrement :</Text>{'\n'}
          • Toutes les communications sont chiffrées (HTTPS/TLS){'\n'}
          • Les mots de passe sont hashés et jamais stockés en clair{'\n'}
          • Les données bancaires sont tokenisées par Stripe{'\n\n'}
          <Text style={styles.bold}>4.2 Accès restreint :</Text>{'\n'}
          • Seuls les employés autorisés peuvent accéder aux données{'\n'}
          • Authentification à deux facteurs obligatoire{'\n'}
          • Logs d'audit de tous les accès{'\n\n'}
          <Text style={styles.bold}>4.3 Sauvegardes :</Text>{'\n'}
          • Sauvegardes quotidiennes automatiques{'\n'}
          • Conservation dans des centres de données sécurisés (Europe)
        </Text>

        <Text style={styles.sectionTitle}>5. Localisation des données</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>5.1</Text> Vos données sont stockées dans l'Union Européenne
          (serveurs Supabase en Allemagne).{'\n\n'}
          <Text style={styles.bold}>5.2</Text> Pendant une livraison active, votre position GPS
          est partagée en temps réel uniquement avec l'autre partie de la transaction.{'\n\n'}
          <Text style={styles.bold}>5.3</Text> L'historique de vos positions GPS est supprimé
          automatiquement 7 jours après la livraison.
        </Text>

        <Text style={styles.sectionTitle}>6. Conservation des données</Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Compte actif :</Text> données conservées tant que le compte existe{'\n'}
          • <Text style={styles.bold}>Après suppression :</Text> données anonymisées sous 30 jours{'\n'}
          • <Text style={styles.bold}>Transactions :</Text> conservées 5 ans (obligation légale comptable){'\n'}
          • <Text style={styles.bold}>GPS tracking :</Text> supprimé après 7 jours{'\n'}
          • <Text style={styles.bold}>Messages :</Text> conservés 90 jours après la livraison
        </Text>

        <Text style={styles.sectionTitle}>7. Vos droits</Text>
        <Text style={styles.paragraph}>
          Conformément au RGPD, vous avez le droit de :{'\n\n'}
          <Text style={styles.bold}>7.1 Accès :</Text> Demander une copie de toutes vos données{'\n\n'}
          <Text style={styles.bold}>7.2 Rectification :</Text> Corriger des données inexactes{'\n\n'}
          <Text style={styles.bold}>7.3 Suppression :</Text> Supprimer votre compte et vos données
          (sauf obligations légales){'\n\n'}
          <Text style={styles.bold}>7.4 Portabilité :</Text> Recevoir vos données dans un format
          exploitable{'\n\n'}
          <Text style={styles.bold}>7.5 Opposition :</Text> Vous opposer au traitement de vos données{'\n\n'}
          <Text style={styles.bold}>7.6 Limitation :</Text> Limiter certains traitements{'\n\n'}
          Pour exercer ces droits, contactez-nous à : privacy@livrais.gf
        </Text>

        <Text style={styles.sectionTitle}>8. Cookies et traceurs</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>8.1</Text> L'application mobile n'utilise pas de cookies.{'\n\n'}
          <Text style={styles.bold}>8.2</Text> Nous utilisons des outils d'analyse (anonymisés)
          pour comprendre l'utilisation de l'app.{'\n\n'}
          <Text style={styles.bold}>8.3</Text> Aucun tracker publicitaire tiers n'est installé.
        </Text>

        <Text style={styles.sectionTitle}>9. Données des mineurs</Text>
        <Text style={styles.paragraph}>
          Livrais est réservé aux personnes de 18 ans et plus. Nous ne collectons pas
          sciemment de données de mineurs. Si nous découvrons qu'un mineur utilise le service,
          nous supprimerons immédiatement son compte.
        </Text>

        <Text style={styles.sectionTitle}>10. Notifications push</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>10.1</Text> Vous pouvez activer/désactiver les notifications
          à tout moment.{'\n\n'}
          <Text style={styles.bold}>10.2</Text> Nous envoyons uniquement des notifications liées
          au service (nouvelles demandes, statut de livraison, messages).{'\n\n'}
          <Text style={styles.bold}>10.3</Text> Aucune notification marketing sans votre consentement explicite.
        </Text>

        <Text style={styles.sectionTitle}>11. Modifications de la politique</Text>
        <Text style={styles.paragraph}>
          Nous pouvons mettre à jour cette politique. En cas de changement important, vous
          serez notifié par email ou notification. La date de "Dernière mise à jour" en haut
          de cette page indique la version actuelle.
        </Text>

        <Text style={styles.sectionTitle}>12. Contact</Text>
        <Text style={styles.paragraph}>
          Pour toute question sur cette politique ou vos données :{'\n\n'}
          <Text style={styles.bold}>Délégué à la protection des données (DPO) :</Text>{'\n'}
          Email: privacy@livrais.gf{'\n'}
          Courrier: Livrais - DPO, Cayenne, Guyane française{'\n\n'}
          <Text style={styles.bold}>Autorité de contrôle :</Text>{'\n'}
          Vous pouvez également contacter la CNIL (Commission Nationale de l'Informatique
          et des Libertés) si vous estimez que vos droits ne sont pas respectés.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Vos données sont protégées et ne seront jamais vendues à des tiers.
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
    marginBottom: 15,
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text,
    marginBottom: 20,
    fontStyle: 'italic',
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 8,
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
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});
