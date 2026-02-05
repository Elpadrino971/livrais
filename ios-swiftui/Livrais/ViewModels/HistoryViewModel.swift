import Foundation
import Observation
import os

private let logger = Logger(subsystem: "com.livrais.app", category: "History")

enum HistoryFilter: String, CaseIterable {
    case all = "Tout"
    case sender = "Envois"
    case deliverer = "Livraisons"
}

struct DeliveryHistoryItem: Identifiable {
    let id: UUID
    let type: RequestType
    let status: DeliveryStatus
    let price: Double
    let createdAt: Date
    let completedAt: Date?
    let pickupAddress: String
    let deliveryAddress: String
    let userRole: UserRole
    let otherPartyName: String
    let otherPartyPhoto: String?
    let ratingGiven: Int?
    let ratingReceived: Int?
    let distanceKm: Double

    enum UserRole {
        case sender
        case deliverer
    }
}

@Observable
final class HistoryViewModel {
    // MARK: - Published State

    private(set) var historyItems: [DeliveryHistoryItem] = []
    private(set) var isLoading = false
    private(set) var error: Error?
    var selectedFilter: HistoryFilter = .all

    // MARK: - Dependencies

    private let supabaseService: SupabaseService
    private let userId: UUID

    // MARK: - Initialization

    init(userId: UUID, supabaseService: SupabaseService = .shared) {
        self.userId = userId
        self.supabaseService = supabaseService
        logger.info("HistoryViewModel initialized for user: \(userId)")
    }

    // MARK: - Public Methods

    @MainActor
    func loadHistory() async {
        logger.info("Loading delivery history...")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            // Load all completed/cancelled deliveries
            let deliveries = try await supabaseService.getMyDeliveries(userId: userId)
            logger.info("Loaded \(deliveries.count) total deliveries")

            // Convert to history items
            historyItems = deliveries
                .filter { $0.status == .completed || $0.status == .cancelled }
                .compactMap { delivery -> DeliveryHistoryItem? in
                    guard let request = delivery.request else { return nil }

                    let userRole: DeliveryHistoryItem.UserRole = delivery.customerId == userId ? .sender : .deliverer
                    let otherParty = userRole == .sender ? delivery.deliverer : delivery.customer

                    return DeliveryHistoryItem(
                        id: delivery.id,
                        type: request.type,
                        status: delivery.status,
                        price: delivery.totalAmount,
                        createdAt: delivery.createdAt,
                        completedAt: delivery.completedAt,
                        pickupAddress: request.pickupAddress,
                        deliveryAddress: request.deliveryAddress,
                        userRole: userRole,
                        otherPartyName: otherParty?.fullName ?? "Utilisateur inconnu",
                        otherPartyPhoto: otherParty?.avatarUrl,
                        ratingGiven: nil, // Would need to fetch from ratings table
                        ratingReceived: nil, // Would need to fetch from ratings table
                        distanceKm: request.distanceKm
                    )
                }
                .sorted { ($0.completedAt ?? $0.createdAt) > ($1.completedAt ?? $1.createdAt) }

            logger.info("Processed \(historyItems.count) history items")

        } catch {
            logger.error("Failed to load history: \(error.localizedDescription)")
            self.error = error
        }
    }

    // MARK: - Computed Properties

    var filteredHistoryItems: [DeliveryHistoryItem] {
        switch selectedFilter {
        case .all:
            return historyItems
        case .sender:
            return historyItems.filter { $0.userRole == .sender }
        case .deliverer:
            return historyItems.filter { $0.userRole == .deliverer }
        }
    }

    var totalDeliveries: Int {
        historyItems.count
    }

    var completedDeliveries: Int {
        historyItems.filter { $0.status == .completed }.count
    }

    var cancelledDeliveries: Int {
        historyItems.filter { $0.status == .cancelled }.count
    }

    var totalEarned: Double {
        historyItems
            .filter { $0.userRole == .deliverer && $0.status == .completed }
            .reduce(0) { $0 + $1.price }
    }

    var totalSpent: Double {
        historyItems
            .filter { $0.userRole == .sender && $0.status == .completed }
            .reduce(0) { $0 + $1.price }
    }
}
