import SwiftUI

struct TermsOfServiceView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Header
                VStack(alignment: .leading, spacing: 12) {
                    Text("Conditions d'utilisation")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Dernière mise à jour : 5 février 2026")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                // Content
                TermsSection(
                    title: "1. Acceptation des conditions",
                    content: """
                    En utilisant l'application Livrais, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.

                    Ces conditions constituent un accord juridique entre vous et Livrais. Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entreront en vigueur dès leur publication sur l'application.
                    """
                )

                TermsSection(
                    title: "2. Description du service",
                    content: """
                    Livrais est une plateforme de mise en relation entre des particuliers souhaitant faire livrer des objets et des livreurs indépendants. Nous ne sommes pas un service de livraison, mais un intermédiaire technologique.

                    Le service permet de :
                    • Créer des demandes de livraison
                    • Accepter et effectuer des livraisons
                    • Suivre les livraisons en temps réel
                    • Évaluer les utilisateurs
                    • Traiter les paiements de manière sécurisée
                    """
                )

                TermsSection(
                    title: "3. Inscription et compte",
                    content: """
                    Pour utiliser Livrais, vous devez :
                    • Avoir au moins 18 ans
                    • Fournir des informations exactes et à jour
                    • Maintenir la confidentialité de votre compte
                    • Être responsable de toutes les activités sur votre compte

                    Vous vous engagez à nous informer immédiatement de toute utilisation non autorisée de votre compte.
                    """
                )

                TermsSection(
                    title: "4. Utilisation du service",
                    content: """
                    En tant qu'utilisateur, vous vous engagez à :
                    • Ne pas utiliser le service à des fins illégales
                    • Ne pas faire livrer d'objets dangereux, illégaux ou interdits
                    • Fournir des descriptions exactes des objets à livrer
                    • Respecter les autres utilisateurs
                    • Ne pas manipuler le système de notation
                    • Ne pas créer de faux comptes

                    Objets interdits :
                    • Drogues et substances illégales
                    • Armes et munitions
                    • Explosifs et produits inflammables
                    • Objets volés
                    • Contrefaçons
                    • Matériel pornographique illégal
                    """
                )

                TermsSection(
                    title: "5. Paiements et frais",
                    content: """
                    Tarification :
                    • Les prix sont librement fixés par les demandeurs
                    • Notre commission est de 15% + 0,99€ par livraison (minimum 1,50€)
                    • La commission est déduite du montant payé par le demandeur

                    Paiements :
                    • Tous les paiements sont traités via Stripe
                    • Le paiement est effectué lors de l'acceptation de la demande
                    • Les livreurs reçoivent leurs paiements chaque lundi
                    • Les remboursements sont traités sous 3 à 5 jours ouvrés

                    En cas d'annulation :
                    • Annulation avant acceptation : remboursement intégral
                    • Annulation après acceptation (par le demandeur) : 50% de frais
                    • Annulation par le livreur : aucun frais pour le demandeur
                    """
                )

                TermsSection(
                    title: "6. Responsabilités",
                    content: """
                    Responsabilité de Livrais :
                    • Nous fournissons uniquement une plateforme de mise en relation
                    • Nous ne sommes pas responsables des dommages causés lors des livraisons
                    • Nous ne garantissons pas la qualité des services des livreurs
                    • Notre responsabilité est limitée au montant des frais payés

                    Responsabilité des utilisateurs :
                    • Les demandeurs sont responsables de la description exacte des objets
                    • Les livreurs sont responsables du transport sécurisé des objets
                    • Chaque utilisateur doit avoir une assurance appropriée
                    • Les utilisateurs sont responsables de leurs interactions
                    """
                )

                TermsSection(
                    title: "7. Annulation et remboursement",
                    content: """
                    Politique d'annulation :
                    • Vous pouvez annuler une demande avant qu'elle ne soit acceptée sans frais
                    • Après acceptation, des frais d'annulation de 50% s'appliquent
                    • Les livreurs peuvent annuler sans pénalité avant le début de la livraison
                    • Les annulations répétées peuvent entraîner une suspension du compte

                    Remboursements :
                    • Remboursement automatique en cas d'annulation éligible
                    • Traitement sous 3 à 5 jours ouvrés
                    • Remboursement sur le mode de paiement initial
                    • Possibilité de crédit sur le compte sur demande
                    """
                )

                TermsSection(
                    title: "8. Évaluations et notes",
                    content: """
                    Système de notation :
                    • Les utilisateurs peuvent s'évaluer mutuellement après chaque livraison
                    • Les notes vont de 1 à 5 étoiles
                    • Les commentaires doivent être respectueux et honnêtes
                    • Nous nous réservons le droit de supprimer les commentaires inappropriés

                    Impact des notes :
                    • Les notes affectent la visibilité dans les recherches
                    • Une note moyenne inférieure à 3/5 peut entraîner une suspension
                    • Les notes ne peuvent pas être modifiées une fois soumises
                    """
                )

                TermsSection(
                    title: "9. Suspension et résiliation",
                    content: """
                    Nous pouvons suspendre ou résilier votre compte si :
                    • Vous violez ces conditions d'utilisation
                    • Vous fournissez des informations fausses
                    • Vous engagez des activités frauduleuses
                    • Vous recevez des plaintes répétées
                    • Votre note moyenne est trop basse

                    En cas de suspension :
                    • Vous serez informé par email
                    • Vous pouvez faire appel de la décision
                    • Les paiements en attente seront traités selon le cas
                    """
                )

                TermsSection(
                    title: "10. Protection des données",
                    content: """
                    Nous collectons et utilisons vos données conformément à notre Politique de Confidentialité et au RGPD.

                    Vos droits :
                    • Accès à vos données personnelles
                    • Rectification des données inexactes
                    • Suppression de vos données (droit à l'oubli)
                    • Portabilité de vos données
                    • Opposition au traitement

                    Pour exercer vos droits, contactez-nous à privacy@livrais.gf
                    """
                )

                TermsSection(
                    title: "11. Propriété intellectuelle",
                    content: """
                    Tous les droits de propriété intellectuelle relatifs à l'application Livrais appartiennent à Livrais ou à ses concédants de licence.

                    Vous n'êtes pas autorisé à :
                    • Copier ou modifier l'application
                    • Créer des œuvres dérivées
                    • Faire de l'ingénierie inverse
                    • Vendre ou sous-licencier l'application
                    """
                )

                TermsSection(
                    title: "12. Droit applicable",
                    content: """
                    Ces conditions sont régies par le droit français et les lois applicables en Guyane française.

                    Tout litige sera soumis à la juridiction exclusive des tribunaux de Cayenne, Guyane française.
                    """
                )

                TermsSection(
                    title: "13. Contact",
                    content: """
                    Pour toute question concernant ces conditions d'utilisation, contactez-nous :

                    Email : legal@livrais.gf
                    Téléphone : +594 694 XX XX XX
                    Adresse : Cayenne, Guyane française
                    """
                )

                // Footer
                VStack(spacing: 12) {
                    Divider()

                    Text("En utilisant Livrais, vous reconnaissez avoir lu, compris et accepté ces conditions d'utilisation.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top)
            }
            .padding()
        }
        .navigationTitle("Conditions d'utilisation")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Terms Section Component

struct TermsSection: View {
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
        TermsOfServiceView()
    }
}
