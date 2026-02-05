import SwiftUI

struct FAQView: View {
    @State private var expandedItems: Set<UUID> = []
    @State private var searchText = ""
    @State private var showContactForm = false

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 12) {
                    Text("❓")
                        .font(.system(size: 60))

                    Text("Foire Aux Questions")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text("Trouvez rapidement des réponses à vos questions")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()

                // Search bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)

                    TextField("Rechercher...", text: $searchText)

                    if !searchText.isEmpty {
                        Button(action: { searchText = "" }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)

                // FAQ Categories
                ForEach(faqCategories, id: \.category) { categoryData in
                    if !categoryData.items.filter({ matchesSearch($0) }).isEmpty {
                        FAQCategory(
                            categoryData: categoryData,
                            expandedItems: $expandedItems,
                            searchText: searchText
                        )
                    }
                }

                // Contact section
                VStack(alignment: .leading, spacing: 16) {
                    Text("Vous ne trouvez pas votre réponse ?")
                        .font(.headline)

                    Text("Notre équipe de support est là pour vous aider")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    VStack(spacing: 12) {
                        ContactMethodButton(
                            icon: "envelope.fill",
                            title: "Email",
                            subtitle: "support@livrais.gf",
                            action: {
                                if let url = URL(string: "mailto:support@livrais.gf") {
                                    UIApplication.shared.open(url)
                                }
                            }
                        )

                        ContactMethodButton(
                            icon: "phone.fill",
                            title: "Téléphone",
                            subtitle: "+594 694 XX XX XX",
                            action: {
                                if let url = URL(string: "tel:+594694XXXXXX") {
                                    UIApplication.shared.open(url)
                                }
                            }
                        )

                        Button(action: { showContactForm = true }) {
                            HStack {
                                Image(systemName: "bubble.left.and.bubble.right.fill")
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Formulaire de contact")
                                        .font(.headline)
                                    Text("Envoyez-nous un message")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                Spacer()
                                Image(systemName: "chevron.right")
                            }
                            .padding()
                            .background(Color("Primary").opacity(0.1))
                            .foregroundColor(Color("Primary"))
                            .cornerRadius(12)
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .navigationTitle("FAQ & Support")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showContactForm) {
            ContactFormView()
        }
    }

    private func matchesSearch(_ item: FAQItem) -> Bool {
        if searchText.isEmpty { return true }
        let search = searchText.lowercased()
        return item.question.lowercased().contains(search) ||
               item.answer.lowercased().contains(search)
    }
}

// MARK: - FAQ Category View

struct FAQCategory: View {
    let categoryData: FAQCategoryData
    @Binding var expandedItems: Set<UUID>
    let searchText: String

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(categoryData.category)
                .font(.title3)
                .fontWeight(.bold)
                .padding(.horizontal)

            ForEach(categoryData.items.filter { matchesSearch($0) }) { item in
                FAQItemView(
                    item: item,
                    isExpanded: expandedItems.contains(item.id),
                    onTap: {
                        withAnimation {
                            if expandedItems.contains(item.id) {
                                expandedItems.remove(item.id)
                            } else {
                                expandedItems.insert(item.id)
                            }
                        }
                    }
                )
            }
        }
    }

    private func matchesSearch(_ item: FAQItem) -> Bool {
        if searchText.isEmpty { return true }
        let search = searchText.lowercased()
        return item.question.lowercased().contains(search) ||
               item.answer.lowercased().contains(search)
    }
}

// MARK: - FAQ Item View

struct FAQItemView: View {
    let item: FAQItem
    let isExpanded: Bool
    let onTap: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            Button(action: onTap) {
                HStack(alignment: .top, spacing: 12) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(item.question)
                            .font(.headline)
                            .foregroundColor(.primary)
                            .multilineTextAlignment(.leading)

                        if isExpanded {
                            Text(item.answer)
                                .font(.body)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.leading)
                                .transition(.opacity)
                        }
                    }

                    Spacer()

                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundColor(Color("Primary"))
                        .font(.caption)
                }
                .padding()
            }

            Divider()
        }
        .background(Color(.systemBackground))
    }
}

// MARK: - Contact Method Button

struct ContactMethodButton: View {
    let icon: String
    let title: String
    let subtitle: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(Color("Primary"))
                    .frame(width: 40)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(.primary)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
            )
        }
    }
}

// MARK: - Contact Form View

struct ContactFormView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var email = ""
    @State private var subject = ""
    @State private var message = ""
    @State private var isSubmitting = false
    @State private var showSuccessAlert = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Vos informations") {
                    TextField("Nom complet", text: $name)
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                }

                Section("Votre message") {
                    TextField("Sujet", text: $subject)

                    TextEditor(text: $message)
                        .frame(height: 150)
                }

                Section {
                    Button(action: submitForm) {
                        if isSubmitting {
                            HStack {
                                Spacer()
                                ProgressView()
                                Spacer()
                            }
                        } else {
                            Text("Envoyer le message")
                                .frame(maxWidth: .infinity)
                                .foregroundColor(isFormValid ? Color("Primary") : .gray)
                        }
                    }
                    .disabled(!isFormValid || isSubmitting)
                }
            }
            .navigationTitle("Nous contacter")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        dismiss()
                    }
                }
            }
            .alert("Message envoyé", isPresented: $showSuccessAlert) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Nous vous répondrons dans les plus brefs délais")
            }
        }
    }

    private var isFormValid: Bool {
        !name.isEmpty && !email.isEmpty && !subject.isEmpty && !message.isEmpty
    }

    private func submitForm() {
        isSubmitting = true

        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            isSubmitting = false
            showSuccessAlert = true
            print("📧 Contact form submitted: \(name), \(email), \(subject)")
        }
    }
}

// MARK: - Data Models

struct FAQCategoryData {
    let category: String
    let items: [FAQItem]
}

struct FAQItem: Identifiable {
    let id = UUID()
    let question: String
    let answer: String
}

// MARK: - FAQ Data

let faqCategories: [FAQCategoryData] = [
    FAQCategoryData(
        category: "💰 Paiements",
        items: [
            FAQItem(
                question: "Comment fonctionne le paiement ?",
                answer: "Les paiements sont sécurisés via Stripe. Vous payez uniquement lorsque votre demande est acceptée par un livreur. Le montant est bloqué sur votre compte et transféré au livreur une fois la livraison terminée."
            ),
            FAQItem(
                question: "Quels sont les frais de service ?",
                answer: "Notre commission est de 15% + 0,99€ par livraison, avec un minimum de 1,50€. Ce montant est déduit du prix que vous proposez, donc vous savez exactement combien vous allez payer ou gagner."
            ),
            FAQItem(
                question: "Quand suis-je débité ?",
                answer: "Le prélèvement est effectué dès qu'un livreur accepte votre demande. Si la livraison est annulée, vous êtes remboursé automatiquement sous 3 à 5 jours ouvrés."
            ),
            FAQItem(
                question: "Comment puis-je être payé en tant que livreur ?",
                answer: "Vos gains sont transférés sur votre compte bancaire tous les lundis. Vous devez configurer vos informations bancaires dans votre profil pour recevoir vos paiements."
            )
        ]
    ),
    FAQCategoryData(
        category: "📦 Livraisons",
        items: [
            FAQItem(
                question: "Quels types d'objets puis-je faire livrer ?",
                answer: "Vous pouvez faire livrer des colis, des courses, des objets lourds et même proposer du covoiturage. Les objets illégaux, dangereux ou périssables sans emballage approprié sont interdits."
            ),
            FAQItem(
                question: "Quelle est la limite de poids ?",
                answer: "Cela dépend du type de véhicule choisi. Les scooters peuvent transporter jusqu'à 30kg, les voitures jusqu'à 100kg, et les fourgonnettes jusqu'à 500kg. Pour les objets très lourds, activez l'option 'Nécessite deux personnes'."
            ),
            FAQItem(
                question: "Puis-je suivre ma livraison en temps réel ?",
                answer: "Oui ! Dès que le livreur commence la livraison, vous pouvez suivre sa position en temps réel sur la carte et voir une estimation de l'heure d'arrivée."
            ),
            FAQItem(
                question: "Que faire si ma livraison est en retard ?",
                answer: "Vous pouvez contacter directement le livreur via le chat intégré. Si le retard est important sans justification, vous pouvez annuler la livraison et être remboursé."
            )
        ]
    ),
    FAQCategoryData(
        category: "🚗 Pour les livreurs",
        items: [
            FAQItem(
                question: "Comment devenir livreur ?",
                answer: "Il suffit de créer un compte et de compléter votre profil. Vous pouvez immédiatement commencer à accepter des demandes dans votre zone. Aucune inscription préalable ou validation n'est nécessaire."
            ),
            FAQItem(
                question: "Puis-je refuser une demande ?",
                answer: "Oui, vous êtes libre d'accepter ou de refuser toute demande. Il n'y a aucune obligation d'acceptation. Cependant, un taux d'acceptation élevé améliore votre visibilité."
            ),
            FAQItem(
                question: "Comment fonctionne la négociation ?",
                answer: "Si le demandeur a activé l'option 'Prix négociable', vous pouvez proposer un prix différent. Le demandeur peut alors accepter, refuser ou faire une contre-proposition."
            ),
            FAQItem(
                question: "Puis-je livrer avec n'importe quel véhicule ?",
                answer: "Oui ! Vous pouvez utiliser un scooter, une voiture, une fourgonnette ou même un vélo. Assurez-vous simplement que votre véhicule correspond aux exigences de la demande."
            )
        ]
    ),
    FAQCategoryData(
        category: "👤 Compte et profil",
        items: [
            FAQItem(
                question: "Comment modifier mes informations personnelles ?",
                answer: "Allez dans l'onglet 'Profil', puis 'Paramètres'. Vous pouvez modifier votre nom, numéro de téléphone, photo de profil et informations bancaires."
            ),
            FAQItem(
                question: "Comment ajouter un livreur en favori ?",
                answer: "Cliquez sur l'icône étoile sur le profil d'un livreur après une livraison réussie. Vos favoris apparaîtront en priorité dans vos recherches futures."
            ),
            FAQItem(
                question: "Puis-je supprimer mon compte ?",
                answer: "Oui, vous pouvez supprimer votre compte à tout moment depuis les paramètres. Attention, cette action est irréversible et supprimera toutes vos données."
            )
        ]
    ),
    FAQCategoryData(
        category: "🔒 Sécurité",
        items: [
            FAQItem(
                question: "Comment signaler un comportement inapproprié ?",
                answer: "Utilisez le bouton 'Signaler' sur le profil de l'utilisateur ou contactez notre support. Nous prenons très au sérieux toute violation de nos conditions d'utilisation."
            ),
            FAQItem(
                question: "Mes données personnelles sont-elles protégées ?",
                answer: "Oui, nous utilisons un cryptage de niveau bancaire pour protéger vos données. Nous ne partageons jamais vos informations avec des tiers sans votre consentement. Consultez notre politique de confidentialité pour plus de détails."
            ),
            FAQItem(
                question: "Que faire en cas de problème avec une livraison ?",
                answer: "Contactez immédiatement notre support via le chat ou par email. Nous médiatiserons la situation et, si nécessaire, vous rembourserons ou compenserons le livreur selon les circonstances."
            )
        ]
    )
]
