import Foundation
import StripePaymentSheet
import StripePayments

/// Service for handling Stripe payments
final class StripeService {
    static let shared = StripeService()

    private var publishableKey: String {
        guard let key = ProcessInfo.processInfo.environment["STRIPE_PUBLISHABLE_KEY"] else {
            fatalError("Missing STRIPE_PUBLISHABLE_KEY environment variable")
        }
        return key
    }

    private init() {
        configureStripe()
    }

    // MARK: - Configuration

    private func configureStripe() {
        STPAPIClient.shared.publishableKey = publishableKey
        print("✅ Stripe configured with publishable key")
    }

    // MARK: - Payment Sheet

    /// Create a payment sheet for a delivery
    func createPaymentSheet(
        amount: Double,
        deliveryId: UUID,
        customerId: UUID
    ) async throws -> PaymentSheet {
        // Get payment intent from your backend
        let paymentIntentData = try await createPaymentIntent(
            amount: amount,
            deliveryId: deliveryId,
            customerId: customerId
        )

        // Configure payment sheet
        var configuration = PaymentSheet.Configuration()
        configuration.merchantDisplayName = "Livrais"
        configuration.allowsDelayedPaymentMethods = true
        configuration.returnURL = "livrais://payment-return"

        // Customer configuration
        if let customerConfig = paymentIntentData.customerConfig {
            configuration.customer = .init(
                id: customerConfig.id,
                ephemeralKeySecret: customerConfig.ephemeralKey
            )
        }

        // Apple Pay configuration
        configuration.applePay = .init(
            merchantId: "merchant.gf.livrais",
            merchantCountryCode: "GF"
        )

        // Primary button configuration
        configuration.primaryButtonLabel = "Payer \(formatAmount(amount))€"

        // Create payment sheet
        return PaymentSheet(
            paymentIntentClientSecret: paymentIntentData.clientSecret,
            configuration: configuration
        )
    }

    /// Present payment sheet
    @MainActor
    func presentPaymentSheet(
        paymentSheet: PaymentSheet,
        from viewController: UIViewController
    ) async throws -> PaymentSheetResult {
        return await withCheckedContinuation { continuation in
            paymentSheet.present(from: viewController) { result in
                continuation.resume(returning: result)
            }
        }
    }

    // MARK: - Payment Intent

    private func createPaymentIntent(
        amount: Double,
        deliveryId: UUID,
        customerId: UUID
    ) async throws -> PaymentIntentData {
        // Call your backend endpoint to create payment intent
        // This should be done server-side for security
        guard let url = URL(string: "\(SupabaseService.shared.baseURL)/functions/v1/create-payment-intent") else {
            throw StripeError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "amount": Int(amount * 100), // Convert to cents
            "currency": "eur",
            "delivery_id": deliveryId.uuidString,
            "customer_id": customerId.uuidString
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw StripeError.requestFailed
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(PaymentIntentData.self, from: data)
    }

    // MARK: - Confirm Payment

    func confirmPayment(
        clientSecret: String,
        paymentMethodId: String
    ) async throws -> STPPaymentIntent {
        return try await withCheckedThrowingContinuation { continuation in
            let paymentIntentParams = STPPaymentIntentParams(clientSecret: clientSecret)
            paymentIntentParams.paymentMethodId = paymentMethodId

            STPAPIClient.shared.confirmPaymentIntent(with: paymentIntentParams) { intent, error in
                if let error = error {
                    continuation.resume(throwing: error)
                } else if let intent = intent {
                    continuation.resume(returning: intent)
                } else {
                    continuation.resume(throwing: StripeError.confirmationFailed)
                }
            }
        }
    }

    // MARK: - Stripe Connect (for deliverers)

    /// Create a Stripe Connect account for a deliverer
    func createConnectedAccount(
        userId: UUID,
        email: String,
        firstName: String,
        lastName: String
    ) async throws -> ConnectedAccountData {
        guard let url = URL(string: "\(SupabaseService.shared.baseURL)/functions/v1/create-connected-account") else {
            throw StripeError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "user_id": userId.uuidString,
            "email": email,
            "first_name": firstName,
            "last_name": lastName,
            "country": "GF" // French Guiana
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw StripeError.requestFailed
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(ConnectedAccountData.self, from: data)
    }

    /// Get account link for onboarding
    func getAccountLink(accountId: String) async throws -> String {
        guard let url = URL(string: "\(SupabaseService.shared.baseURL)/functions/v1/create-account-link") else {
            throw StripeError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "account_id": accountId,
            "refresh_url": "livrais://stripe-refresh",
            "return_url": "livrais://stripe-return"
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw StripeError.requestFailed
        }

        let result = try JSONDecoder().decode([String: String].self, from: data)
        guard let link = result["url"] else {
            throw StripeError.missingData
        }

        return link
    }

    // MARK: - Payout

    /// Request payout for deliverer
    func requestPayout(
        accountId: String,
        amount: Double
    ) async throws {
        guard let url = URL(string: "\(SupabaseService.shared.baseURL)/functions/v1/create-payout") else {
            throw StripeError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "account_id": accountId,
            "amount": Int(amount * 100), // Convert to cents
            "currency": "eur"
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw StripeError.requestFailed
        }
    }

    // MARK: - Utility Methods

    private func formatAmount(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.minimumFractionDigits = 2
        formatter.maximumFractionDigits = 2
        return formatter.string(from: NSNumber(value: amount)) ?? String(format: "%.2f", amount)
    }
}

// MARK: - Data Models

struct PaymentIntentData: Codable {
    let clientSecret: String
    let customerConfig: CustomerConfig?

    struct CustomerConfig: Codable {
        let id: String
        let ephemeralKey: String
    }
}

struct ConnectedAccountData: Codable {
    let accountId: String
    let onboardingUrl: String?
}

// MARK: - Errors

enum StripeError: LocalizedError {
    case invalidURL
    case requestFailed
    case confirmationFailed
    case missingData
    case accountNotSetup

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL invalide pour la requête Stripe"
        case .requestFailed:
            return "La requête de paiement a échoué"
        case .confirmationFailed:
            return "La confirmation du paiement a échoué"
        case .missingData:
            return "Données manquantes dans la réponse"
        case .accountNotSetup:
            return "Compte Stripe Connect non configuré. Veuillez compléter votre profil de paiement."
        }
    }
}

// MARK: - SupabaseService Extension

extension SupabaseService {
    var baseURL: String {
        guard let url = ProcessInfo.processInfo.environment["SUPABASE_URL"] else {
            fatalError("Missing SUPABASE_URL")
        }
        return url
    }
}
