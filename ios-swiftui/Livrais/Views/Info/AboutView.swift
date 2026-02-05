import SwiftUI

struct AboutView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                // Logo and App Info
                VStack(spacing: 16) {
                    Text("📦")
                        .font(.system(size: 80))

                    Text("Livrais")
                        .font(.system(size: 36, weight: .bold))

                    Text("La livraison entre particuliers en Guyane")
                        .font(.headline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)

                    Text("Version 1.0.0 (Build 1)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()

                // Mission
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(icon: "target", title: "Notre mission")

                    Text("""
                    Livrais connecte les personnes ayant besoin de faire livrer quelque chose avec des livreurs locaux disponibles, créant ainsi une communauté d'entraide et de services en Guyane française.

                    Notre objectif est de rendre la livraison accessible à tous, rapide, économique et respectueuse de l'environnement, tout en créant des opportunités de revenus pour les livreurs indépendants.
                    """)
                    .font(.body)
                    .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)

                // Values
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(icon: "heart.fill", title: "Nos valeurs")

                    VStack(spacing: 16) {
                        ValueRow(
                            icon: "👥",
                            title: "Communauté",
                            description: "Nous créons des liens entre les habitants de la Guyane"
                        )

                        ValueRow(
                            icon: "🤝",
                            title: "Confiance",
                            description: "Un système de notation transparent et des paiements sécurisés"
                        )

                        ValueRow(
                            icon: "⚡️",
                            title: "Rapidité",
                            description: "Des livraisons en temps réel pour répondre à tous vos besoins"
                        )

                        ValueRow(
                            icon: "💚",
                            title: "Écologie",
                            description: "Optimisation des trajets et promotion du covoiturage"
                        )

                        ValueRow(
                            icon: "🔒",
                            title: "Sécurité",
                            description: "Protection des données et des transactions"
                        )
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)

                // Stats
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(icon: "chart.bar.fill", title: "Livrais en chiffres")

                    HStack(spacing: 16) {
                        StatCard(
                            number: "1000+",
                            label: "Utilisateurs",
                            color: Color("Primary")
                        )

                        StatCard(
                            number: "5000+",
                            label: "Livraisons",
                            color: .green
                        )
                    }

                    HStack(spacing: 16) {
                        StatCard(
                            number: "4.8",
                            label: "Note moyenne",
                            color: .yellow
                        )

                        StatCard(
                            number: "300+",
                            label: "Livreurs actifs",
                            color: .blue
                        )
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)

                // Features
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(icon: "star.fill", title: "Fonctionnalités")

                    VStack(spacing: 12) {
                        FeatureRow(icon: "location.fill", title: "Suivi GPS en temps réel")
                        FeatureRow(icon: "creditcard.fill", title: "Paiements sécurisés via Stripe")
                        FeatureRow(icon: "bell.fill", title: "Notifications push instantanées")
                        FeatureRow(icon: "bubble.left.and.bubble.right.fill", title: "Chat direct entre utilisateurs")
                        FeatureRow(icon: "star.fill", title: "Système de notation et favoris")
                        FeatureRow(icon: "chart.line.uptrend.xyaxis", title: "Négociation des prix")
                        FeatureRow(icon: "doc.text.fill", title: "Historique complet des livraisons")
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)

                // Contact
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(icon: "envelope.fill", title: "Contact")

                    VStack(spacing: 12) {
                        ContactRow(
                            icon: "envelope.fill",
                            label: "Email",
                            value: "contact@livrais.gf",
                            action: {
                                if let url = URL(string: "mailto:contact@livrais.gf") {
                                    UIApplication.shared.open(url)
                                }
                            }
                        )

                        ContactRow(
                            icon: "phone.fill",
                            label: "Téléphone",
                            value: "+594 694 XX XX XX",
                            action: {
                                if let url = URL(string: "tel:+594694XXXXXX") {
                                    UIApplication.shared.open(url)
                                }
                            }
                        )

                        ContactRow(
                            icon: "mappin.circle.fill",
                            label: "Adresse",
                            value: "Cayenne, Guyane française",
                            action: nil
                        )
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)

                // Social
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(icon: "globe", title: "Suivez-nous")

                    HStack(spacing: 20) {
                        SocialButton(icon: "globe", label: "Site web", url: "https://livrais.gf")
                        SocialButton(icon: "photo", label: "Instagram", url: "https://instagram.com/livrais.gf")
                        SocialButton(icon: "bubble.left.fill", label: "Facebook", url: "https://facebook.com/livrais.gf")
                        SocialButton(icon: "play.rectangle.fill", label: "TikTok", url: "https://tiktok.com/@livrais.gf")
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal)

                // Legal Links
                VStack(spacing: 12) {
                    NavigationLink {
                        TermsOfServiceView()
                    } label: {
                        HStack {
                            Image(systemName: "doc.text")
                            Text("Conditions d'utilisation")
                            Spacer()
                            Image(systemName: "chevron.right")
                        }
                        .foregroundColor(.primary)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }

                    NavigationLink {
                        PrivacyPolicyView()
                    } label: {
                        HStack {
                            Image(systemName: "lock.shield")
                            Text("Politique de confidentialité")
                            Spacer()
                            Image(systemName: "chevron.right")
                        }
                        .foregroundColor(.primary)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                }
                .padding(.horizontal)

                // Footer
                VStack(spacing: 8) {
                    Text("Fait avec ❤️ en Guyane française")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Text("© 2026 Livrais. Tous droits réservés.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical)
            }
            .padding(.vertical)
        }
        .navigationTitle("À propos")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Supporting Views

struct SectionHeader: View {
    let icon: String
    let title: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(Color("Primary"))
            Text(title)
                .font(.title3)
                .fontWeight(.bold)
        }
    }
}

struct ValueRow: View {
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text(icon)
                .font(.title2)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct StatCard: View {
    let number: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Text(number)
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(color)
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.white)
        .cornerRadius(12)
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(Color("Primary"))
                .frame(width: 24)
            Text(title)
                .font(.subheadline)
            Spacer()
        }
    }
}

struct ContactRow: View {
    let icon: String
    let label: String
    let value: String
    let action: (() -> Void)?

    var body: some View {
        Button(action: action ?? {}) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundColor(Color("Primary"))
                    .frame(width: 24)

                VStack(alignment: .leading, spacing: 2) {
                    Text(label)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(value)
                        .font(.subheadline)
                        .foregroundColor(.primary)
                }

                Spacer()

                if action != nil {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.secondary)
                        .font(.caption)
                }
            }
        }
        .disabled(action == nil)
    }
}

struct SocialButton: View {
    let icon: String
    let label: String
    let url: String

    var body: some View {
        Button(action: {
            if let url = URL(string: url) {
                UIApplication.shared.open(url)
            }
        }) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(Color("Primary"))
                    .frame(width: 50, height: 50)
                    .background(Color("Primary").opacity(0.1))
                    .clipShape(Circle())

                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

#Preview {
    NavigationStack {
        AboutView()
    }
}
