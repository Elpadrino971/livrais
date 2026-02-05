import SwiftUI

struct RateDeliveryView: View {
    let delivery: Delivery
    let ratedUserId: UUID
    let isRatingCustomer: Bool

    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel: RateDeliveryViewModel

    @State private var rating: Int = 5
    @State private var comment: String = ""
    @State private var selectedCriteria: Set<RatingCriterion> = []
    @State private var tipAmount: Double = 0
    @State private var showTipOptions = false

    init(delivery: Delivery, ratedUserId: UUID, isRatingCustomer: Bool) {
        self.delivery = delivery
        self.ratedUserId = ratedUserId
        self.isRatingCustomer = isRatingCustomer
        _viewModel = StateObject(wrappedValue: RateDeliveryViewModel(
            deliveryId: delivery.id,
            ratedUserId: ratedUserId
        ))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 16) {
                    Text("⭐️")
                        .font(.system(size: 60))

                    Text(isRatingCustomer ? "Noter le client" : "Noter le livreur")
                        .font(.title2)
                        .fontWeight(.bold)

                    if let user = isRatingCustomer ? delivery.customer : delivery.deliverer {
                        Text(user.fullName)
                            .font(.headline)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()

                // Star rating
                starRatingSection

                // Criteria selection
                criteriaSection

                // Comment
                commentSection

                // Tip (for deliverer only)
                if !isRatingCustomer {
                    tipSection
                }

                // Submit button
                Button(action: {
                    Task {
                        await submitRating()
                    }
                }) {
                    if viewModel.isLoading {
                        ProgressView()
                            .tint(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                    } else {
                        Text("Envoyer l'évaluation")
                            .frame(maxWidth: .infinity)
                            .padding()
                    }
                }
                .background(Color("Primary"))
                .foregroundColor(.white)
                .cornerRadius(12)
                .disabled(viewModel.isLoading)
            }
            .padding()
        }
        .navigationTitle("Évaluation")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Erreur", isPresented: .constant(viewModel.error != nil)) {
            Button("OK") {
                viewModel.error = nil
            }
        } message: {
            if let error = viewModel.error {
                Text(error.localizedDescription)
            }
        }
        .alert("Merci !", isPresented: $viewModel.showSuccessAlert) {
            Button("OK") {
                dismiss()
            }
        } message: {
            Text("Votre évaluation a été envoyée avec succès")
        }
    }

    // MARK: - Star Rating Section

    private var starRatingSection: some View {
        VStack(spacing: 16) {
            Text("Comment s'est passée la livraison ?")
                .font(.headline)

            HStack(spacing: 12) {
                ForEach(1...5, id: \.self) { index in
                    Button(action: {
                        withAnimation(.spring(response: 0.3)) {
                            rating = index
                        }
                    }) {
                        Image(systemName: index <= rating ? "star.fill" : "star")
                            .font(.system(size: 40))
                            .foregroundColor(index <= rating ? .yellow : .gray.opacity(0.3))
                    }
                }
            }

            Text(ratingDescription)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var ratingDescription: String {
        switch rating {
        case 1: return "Très mauvais"
        case 2: return "Mauvais"
        case 3: return "Correct"
        case 4: return "Bon"
        case 5: return "Excellent"
        default: return ""
        }
    }

    // MARK: - Criteria Section

    private var criteriaSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Qu'avez-vous apprécié ?")
                .font(.headline)

            Text("Sélectionnez un ou plusieurs critères")
                .font(.caption)
                .foregroundColor(.secondary)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(availableCriteria, id: \.self) { criterion in
                    CriterionChip(
                        criterion: criterion,
                        isSelected: selectedCriteria.contains(criterion),
                        action: {
                            if selectedCriteria.contains(criterion) {
                                selectedCriteria.remove(criterion)
                            } else {
                                selectedCriteria.insert(criterion)
                            }
                        }
                    )
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    private var availableCriteria: [RatingCriterion] {
        if isRatingCustomer {
            return [
                .friendly,
                .punctual,
                .goodCommunication,
                .respectful,
                .generous,
                .flexible
            ]
        } else {
            return [
                .fast,
                .careful,
                .friendly,
                .punctual,
                .professional,
                .goodCommunication
            ]
        }
    }

    // MARK: - Comment Section

    private var commentSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Commentaire (optionnel)")
                .font(.headline)

            TextEditor(text: $comment)
                .frame(height: 120)
                .padding(8)
                .background(Color(.systemGray6))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )

            Text("Partagez votre expérience avec la communauté")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }

    // MARK: - Tip Section

    private var tipSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Pourboire")
                    .font(.headline)

                Spacer()

                Toggle("", isOn: $showTipOptions)
                    .labelsHidden()
                    .tint(Color("Primary"))
            }

            if showTipOptions {
                VStack(spacing: 12) {
                    Text("Montrer votre appréciation")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    // Quick tip buttons
                    HStack(spacing: 12) {
                        ForEach([1.0, 2.0, 5.0, 10.0], id: \.self) { amount in
                            TipButton(
                                amount: amount,
                                isSelected: tipAmount == amount,
                                action: { tipAmount = amount }
                            )
                        }
                    }

                    // Custom tip amount
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Montant personnalisé")
                            .font(.subheadline)

                        HStack {
                            TextField("Montant", value: $tipAmount, format: .number)
                                .keyboardType(.decimalPad)
                                .textFieldStyle(.roundedBorder)
                            Text("€")
                                .foregroundColor(.secondary)
                        }
                    }

                    if tipAmount > 0 {
                        HStack {
                            Image(systemName: "heart.fill")
                                .foregroundColor(.red)
                            Text("Le livreur recevra \(String(format: "%.2f", tipAmount))€ de pourboire")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding()
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    // MARK: - Actions

    private func submitRating() async {
        await viewModel.submitRating(
            rating: rating,
            comment: comment.isEmpty ? nil : comment,
            criteria: Array(selectedCriteria).map { $0.rawValue },
            tip: showTipOptions && tipAmount > 0 ? tipAmount : nil
        )
    }
}

// MARK: - Supporting Views

struct CriterionChip: View {
    let criterion: RatingCriterion
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Text(criterion.icon)
                Text(criterion.displayName)
                    .font(.subheadline)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .padding(.horizontal, 8)
            .background(isSelected ? Color("Primary") : Color.white)
            .foregroundColor(isSelected ? .white : .primary)
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isSelected ? Color("Primary") : Color.gray.opacity(0.3), lineWidth: 1)
            )
        }
    }
}

struct TipButton: View {
    let amount: Double
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text("\(String(format: "%.0f", amount))€")
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(isSelected ? Color("Primary") : Color.white)
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(isSelected ? Color("Primary") : Color.gray.opacity(0.3), lineWidth: 1)
                )
        }
    }
}

// MARK: - Rating Criterion Enum

enum RatingCriterion: String, Hashable {
    case fast = "fast"
    case careful = "careful"
    case friendly = "friendly"
    case punctual = "punctual"
    case professional = "professional"
    case goodCommunication = "good_communication"
    case respectful = "respectful"
    case generous = "generous"
    case flexible = "flexible"

    var displayName: String {
        switch self {
        case .fast: return "Rapide"
        case .careful: return "Soigneux"
        case .friendly: return "Sympa"
        case .punctual: return "Ponctuel"
        case .professional: return "Pro"
        case .goodCommunication: return "Bonne comm."
        case .respectful: return "Respectueux"
        case .generous: return "Généreux"
        case .flexible: return "Flexible"
        }
    }

    var icon: String {
        switch self {
        case .fast: return "⚡️"
        case .careful: return "✨"
        case .friendly: return "😊"
        case .punctual: return "⏰"
        case .professional: return "👔"
        case .goodCommunication: return "💬"
        case .respectful: return "🙏"
        case .generous: return "💰"
        case .flexible: return "🔄"
        }
    }
}

// MARK: - ViewModel

@Observable
final class RateDeliveryViewModel {
    private let deliveryId: UUID
    private let ratedUserId: UUID
    private let supabaseService = SupabaseService.shared

    private(set) var isLoading = false
    var error: Error?
    var showSuccessAlert = false

    init(deliveryId: UUID, ratedUserId: UUID) {
        self.deliveryId = deliveryId
        self.ratedUserId = ratedUserId
    }

    @MainActor
    func submitRating(
        rating: Int,
        comment: String?,
        criteria: [String],
        tip: Double?
    ) async {
        isLoading = true
        defer { isLoading = false }

        do {
            // Get current user from auth
            guard let session = try await supabaseService.getSession() else {
                throw NSError(domain: "RateDelivery", code: 401, userInfo: [NSLocalizedDescriptionKey: "Not authenticated"])
            }

            _ = try await supabaseService.createRating(
                deliveryId: deliveryId,
                raterId: session.user.id,
                ratedUserId: ratedUserId,
                rating: rating,
                comment: comment,
                criteria: criteria,
                tip: tip
            )

            print("✅ Rating submitted successfully")
            showSuccessAlert = true
        } catch {
            print("❌ Error submitting rating: \(error)")
            self.error = error
        }
    }
}
