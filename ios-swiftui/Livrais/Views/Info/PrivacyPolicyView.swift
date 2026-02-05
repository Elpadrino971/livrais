import SwiftUI

struct PrivacyPolicyView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Header
                VStack(alignment: .leading, spacing: 12) {
                    Text("Politique de confidentialité")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Dernière mise à jour : 5 février 2026")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text("Conforme au RGPD (Règlement Général sur la Protection des Données)")
                        .font(.caption)
                        .foregroundColor(Color("Primary"))
                        .padding(.vertical, 4)
                }

                PrivacySection(
                    title: "1. Introduction",
                    content: """
                    Chez Livrais, nous prenons très au sérieux la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations.

                    Livrais est conforme au Règlement Général sur la Protection des Données (RGPD) et aux lois françaises sur la protection des données.
                    """
                )

                PrivacySection(
                    title: "2. Responsable du traitement",
                    content: """
                    Le responsable du traitement de vos données personnelles est :

                    Livrais
                    Cayenne, Guyane française
                    Email : privacy@livrais.gf
                    Téléphone : +594 694 XX XX XX

                    Notre Délégué à la Protection des Données (DPO) peut être contacté à dpo@livrais.gf
                    """
                )

                PrivacySection(
                    title: "3. Données collectées",
                    content: """
                    Nous collectons les types de données suivants :

                    Données d'identification :
                    • Nom et prénom
                    • Adresse email
                    • Numéro de téléphone
                    • Photo de profil (optionnelle)

                    Données de localisation :
                    • Position GPS en temps réel (uniquement pendant les livraisons)
                    • Adresses de retrait et de livraison
                    • Historique des trajets

                    Données financières :
                    • Informations de paiement (traitées par Stripe)
                    • Historique des transactions
                    • IBAN pour les paiements aux livreurs

                    Données d'utilisation :
                    • Historique des livraisons
                    • Notes et commentaires
                    • Favoris
                    • Statistiques d'utilisation

                    Données techniques :
                    • Adresse IP
                    • Type d'appareil et système d'exploitation
                    • Logs de connexion
                    • Données de crash et de performance
                    """
                )

                PrivacySection(
                    title: "4. Finalités du traitement",
                    content: """
                    Nous utilisons vos données pour :

                    Fourniture du service :
                    • Créer et gérer votre compte
                    • Faciliter la mise en relation entre utilisateurs
                    • Traiter les paiements
                    • Suivre les livraisons en temps réel
                    • Envoyer des notifications importantes

                    Amélioration du service :
                    • Analyser l'utilisation de l'application
                    • Développer de nouvelles fonctionnalités
                    • Corriger les bugs et problèmes techniques
                    • Améliorer l'expérience utilisateur

                    Sécurité et conformité :
                    • Prévenir la fraude
                    • Assurer la sécurité des transactions
                    • Respecter nos obligations légales
                    • Résoudre les litiges

                    Communication :
                    • Vous envoyer des notifications de service
                    • Répondre à vos demandes de support
                    • Vous informer des changements de service
                    """
                )

                PrivacySection(
                    title: "5. Base légale du traitement",
                    content: """
                    Nous traitons vos données sur les bases légales suivantes :

                    Exécution du contrat :
                    • Fourniture du service de mise en relation
                    • Traitement des paiements
                    • Gestion de votre compte

                    Intérêt légitime :
                    • Amélioration du service
                    • Sécurité et prévention de la fraude
                    • Analyses statistiques

                    Consentement :
                    • Localisation en temps réel
                    • Marketing et newsletters (si vous y avez consenti)
                    • Cookies non essentiels

                    Obligations légales :
                    • Conservation des données fiscales
                    • Réponse aux demandes des autorités
                    """
                )

                PrivacySection(
                    title: "6. Partage des données",
                    content: """
                    Nous ne vendons jamais vos données personnelles. Nous partageons vos données uniquement dans les cas suivants :

                    Avec les autres utilisateurs :
                    • Nom, photo et note (visibles sur votre profil)
                    • Numéro de téléphone (uniquement pour les livraisons en cours)
                    • Position GPS (uniquement pour le suivi des livraisons actives)

                    Avec nos prestataires de services :
                    • Stripe (traitement des paiements)
                    • Services d'hébergement cloud
                    • Services d'analytics
                    • Services de notifications push

                    Avec les autorités :
                    • Sur demande légale des autorités judiciaires
                    • Pour prévenir des activités illégales
                    • Pour protéger nos droits et notre sécurité

                    Tous nos prestataires sont conformes au RGPD et respectent la confidentialité de vos données.
                    """
                )

                PrivacySection(
                    title: "7. Conservation des données",
                    content: """
                    Nous conservons vos données pendant les durées suivantes :

                    Compte actif :
                    • Données du profil : tant que votre compte est actif
                    • Historique des livraisons : 3 ans après la dernière livraison
                    • Données de localisation en temps réel : supprimées après 24h

                    Compte supprimé :
                    • Données personnelles : supprimées immédiatement
                    • Données financières : conservées 10 ans (obligation légale)
                    • Données anonymisées : conservées pour les statistiques

                    Après ces durées, vos données sont automatiquement supprimées de nos systèmes.
                    """
                )

                PrivacySection(
                    title: "8. Vos droits (RGPD)",
                    content: """
                    Conformément au RGPD, vous disposez des droits suivants :

                    Droit d'accès :
                    • Obtenir une copie de vos données personnelles
                    • Savoir comment vos données sont utilisées

                    Droit de rectification :
                    • Corriger vos données inexactes
                    • Compléter vos données incomplètes

                    Droit à l'effacement (droit à l'oubli) :
                    • Demander la suppression de vos données
                    • Sous réserve de nos obligations légales

                    Droit à la limitation :
                    • Limiter le traitement de vos données dans certains cas
                    • Demander la vérification de vos données

                    Droit à la portabilité :
                    • Recevoir vos données dans un format structuré
                    • Transférer vos données à un autre service

                    Droit d'opposition :
                    • Vous opposer au traitement de vos données
                    • Notamment pour le marketing direct

                    Droit de retirer votre consentement :
                    • Retirer votre consentement à tout moment
                    • Sans affecter la licéité du traitement antérieur

                    Pour exercer ces droits, contactez-nous à privacy@livrais.gf avec une preuve d'identité.
                    """
                )

                PrivacySection(
                    title: "9. Sécurité des données",
                    content: """
                    Nous mettons en œuvre des mesures de sécurité robustes :

                    Mesures techniques :
                    • Chiffrement SSL/TLS pour toutes les communications
                    • Chiffrement des données sensibles en base de données
                    • Authentification forte et sécurisée
                    • Sauvegardes régulières et chiffrées
                    • Protection contre les attaques (firewall, anti-DDoS)

                    Mesures organisationnelles :
                    • Accès limité aux données personnelles
                    • Formation du personnel à la protection des données
                    • Politiques de sécurité strictes
                    • Audits de sécurité réguliers

                    En cas de violation de données, nous vous informerons dans les 72 heures conformément au RGPD.
                    """
                )

                PrivacySection(
                    title: "10. Cookies et technologies similaires",
                    content: """
                    Nous utilisons des cookies et technologies similaires :

                    Cookies essentiels :
                    • Authentification et sécurité
                    • Préférences de l'application
                    • Nécessaires au fonctionnement du service

                    Cookies analytiques :
                    • Mesure d'audience
                    • Amélioration du service
                    • Avec votre consentement

                    Vous pouvez gérer vos préférences de cookies dans les paramètres de l'application.
                    """
                )

                PrivacySection(
                    title: "11. Transferts internationaux",
                    content: """
                    Vos données sont principalement stockées en France et dans l'Union Européenne.

                    Certains de nos prestataires peuvent être situés hors de l'UE :
                    • Stripe (États-Unis) - couvert par les clauses contractuelles types
                    • Services cloud avec garanties RGPD

                    Tous les transferts sont sécurisés et conformes au RGPD.
                    """
                )

                PrivacySection(
                    title: "12. Données des mineurs",
                    content: """
                    Notre service est réservé aux personnes de 18 ans et plus.

                    Nous ne collectons pas sciemment de données de mineurs. Si vous pensez qu'un mineur a créé un compte, contactez-nous immédiatement à privacy@livrais.gf pour suppression.
                    """
                )

                PrivacySection(
                    title: "13. Modifications de la politique",
                    content: """
                    Nous pouvons modifier cette politique de confidentialité à tout moment.

                    En cas de modification importante :
                    • Vous serez informé par email et notification
                    • Les modifications prendront effet 30 jours après notification
                    • Vous pourrez refuser les modifications en supprimant votre compte

                    La date de dernière mise à jour est indiquée en haut de ce document.
                    """
                )

                PrivacySection(
                    title: "14. Contact et réclamations",
                    content: """
                    Pour toute question sur cette politique ou pour exercer vos droits :

                    Email : privacy@livrais.gf
                    Téléphone : +594 694 XX XX XX
                    DPO : dpo@livrais.gf

                    Vous avez également le droit de déposer une plainte auprès de la CNIL :
                    Commission Nationale de l'Informatique et des Libertés
                    3 Place de Fontenoy - TSA 80715
                    75334 PARIS CEDEX 07
                    Téléphone : 01 53 73 22 22
                    www.cnil.fr
                    """
                )

                // Footer
                VStack(spacing: 12) {
                    Divider()

                    Text("Nous nous engageons à protéger votre vie privée et à traiter vos données de manière transparente et sécurisée.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)

                    Text("🔒 Vos données sont en sécurité avec Livrais")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(Color("Primary"))
                }
                .padding(.top)
            }
            .padding()
        }
        .navigationTitle("Politique de confidentialité")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Privacy Section Component

struct PrivacySection: View {
    let title: String
    let content: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundColor(Color("Primary"))

            Text(content)
                .font(.body)
                .foregroundColor(.primary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

#Preview {
    NavigationStack {
        PrivacyPolicyView()
    }
}
