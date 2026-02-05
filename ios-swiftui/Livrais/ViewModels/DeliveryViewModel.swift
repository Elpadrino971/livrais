import Foundation
import Observation
import CoreLocation
import os

private let logger = Logger(subsystem: "com.livrais.app", category: "Delivery")

@Observable
final class DeliveryViewModel {
    // MARK: - Published State

    private(set) var nearbyRequests: [DeliveryRequest] = []
    private(set) var myRequests: [DeliveryRequest] = []
    private(set) var activeDeliveries: [Delivery] = []
    private(set) var selectedRequest: DeliveryRequest?
    private(set) var isLoading = false
    private(set) var error: Error?

    // Filter state
    var minPrice: Double?
    var maxPrice: Double?
    var selectedTypes: Set<RequestType> = []
    var selectedVehicles: Set<VehicleType> = []
    var maxDistance: Double?
    var minRating: Double?

    // MARK: - Dependencies

    private let supabaseService: SupabaseService
    private let locationManager: LocationManager
    private let userId: UUID

    // MARK: - Initialization

    init(
        userId: UUID,
        supabaseService: SupabaseService = .shared,
        locationManager: LocationManager
    ) {
        self.userId = userId
        self.supabaseService = supabaseService
        self.locationManager = locationManager
        logger.info("DeliveryViewModel initialized for user: \(userId)")
    }

    // MARK: - Public Methods

    @MainActor
    func loadNearbyRequests() async {
        logger.info("Loading nearby requests...")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let location = try await locationManager.getCurrentLocation()
            logger.debug("Current location: \(location.coordinate.latitude), \(location.coordinate.longitude)")

            let requests = try await supabaseService.getNearbyRequests(
                latitude: location.coordinate.latitude,
                longitude: location.coordinate.longitude,
                radiusKm: maxDistance ?? 20.0
            )

            logger.info("Loaded \(requests.count) nearby requests")
            nearbyRequests = applyFilters(to: requests)

        } catch {
            logger.error("Failed to load nearby requests: \(error.localizedDescription)")
            self.error = error
        }
    }

    @MainActor
    func loadMyRequests() async {
        logger.info("Loading user requests...")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let requests = try await supabaseService.getMyRequests(userId: userId)
            logger.info("Loaded \(requests.count) user requests")
            myRequests = requests
        } catch {
            logger.error("Failed to load user requests: \(error.localizedDescription)")
            self.error = error
        }
    }

    @MainActor
    func loadMyDeliveries() async {
        logger.info("Loading user deliveries...")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let deliveries = try await supabaseService.getMyDeliveries(userId: userId)
            logger.info("Loaded \(deliveries.count) user deliveries")
            activeDeliveries = deliveries
        } catch {
            logger.error("Failed to load user deliveries: \(error.localizedDescription)")
            self.error = error
        }
    }

    @MainActor
    func createRequest(
        type: RequestType,
        pickupCoordinate: CLLocationCoordinate2D,
        deliveryCoordinate: CLLocationCoordinate2D,
        pickupAddress: String,
        deliveryAddress: String,
        price: Double,
        maxPrice: Double?,
        description: String?,
        vehicleType: VehicleType?,
        needsTwoPeople: Bool,
        isNegotiable: Bool
    ) async -> Bool {
        logger.info("Creating delivery request - Type: \(type.rawValue), Price: \(price)")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let distance = locationManager.calculateDistance(
                from: pickupCoordinate,
                to: deliveryCoordinate
            )

            let request = DeliveryRequest(
                id: UUID(),
                userId: userId,
                type: type,
                pickupLocation: LocationPoint(coordinate: pickupCoordinate),
                deliveryLocation: LocationPoint(coordinate: deliveryCoordinate),
                pickupAddress: pickupAddress,
                deliveryAddress: deliveryAddress,
                price: price,
                maxPrice: maxPrice,
                distanceKm: distance,
                description: description,
                vehicleType: vehicleType,
                needsTwoPeople: needsTwoPeople,
                isNegotiable: isNegotiable,
                status: .pending,
                createdAt: Date(),
                updatedAt: Date()
            )

            let created = try await supabaseService.createRequest(request)
            logger.info("Request created successfully: \(created.id)")

            myRequests.insert(created, at: 0)
            return true

        } catch {
            logger.error("Failed to create request: \(error.localizedDescription)")
            self.error = error
            return false
        }
    }

    @MainActor
    func acceptRequest(_ request: DeliveryRequest) async -> Bool {
        logger.info("Accepting request: \(request.id)")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let delivery = try await supabaseService.acceptRequest(
                requestId: request.id,
                delivererId: userId
            )
            logger.info("Request accepted successfully - Delivery: \(delivery.id)")

            activeDeliveries.insert(delivery, at: 0)
            nearbyRequests.removeAll { $0.id == request.id }
            return true

        } catch {
            logger.error("Failed to accept request: \(error.localizedDescription)")
            self.error = error
            return false
        }
    }

    @MainActor
    func updateDeliveryStatus(_ deliveryId: UUID, status: DeliveryStatus) async -> Bool {
        logger.info("Updating delivery \(deliveryId) to status: \(status.rawValue)")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            try await supabaseService.updateDeliveryStatus(id: deliveryId, status: status)
            logger.info("Delivery status updated successfully")

            if let index = activeDeliveries.firstIndex(where: { $0.id == deliveryId }) {
                activeDeliveries[index].status = status

                if status == .inProgress {
                    // Start GPS tracking
                    locationManager.startTracking(for: deliveryId)
                } else if status == .completed || status == .cancelled {
                    // Stop GPS tracking
                    locationManager.stopTracking()
                }
            }

            return true

        } catch {
            logger.error("Failed to update delivery status: \(error.localizedDescription)")
            self.error = error
            return false
        }
    }

    @MainActor
    func cancelRequest(_ requestId: UUID) async -> Bool {
        logger.info("Cancelling request: \(requestId)")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            _ = try await supabaseService.updateRequest(
                id: requestId,
                updates: ["status": DeliveryStatus.cancelled.rawValue]
            )
            logger.info("Request cancelled successfully")

            myRequests.removeAll { $0.id == requestId }
            return true

        } catch {
            logger.error("Failed to cancel request: \(error.localizedDescription)")
            self.error = error
            return false
        }
    }

    func applyFilters() {
        nearbyRequests = applyFilters(to: nearbyRequests)
    }

    func clearFilters() {
        minPrice = nil
        maxPrice = nil
        selectedTypes.removeAll()
        selectedVehicles.removeAll()
        maxDistance = nil
        minRating = nil
        applyFilters()
    }

    // MARK: - Private Methods

    private func applyFilters(to requests: [DeliveryRequest]) -> [DeliveryRequest] {
        var filtered = requests

        // Filter by price
        if let minPrice = minPrice {
            filtered = filtered.filter { $0.price >= minPrice }
        }
        if let maxPrice = maxPrice {
            filtered = filtered.filter { $0.price <= maxPrice }
        }

        // Filter by type
        if !selectedTypes.isEmpty {
            filtered = filtered.filter { selectedTypes.contains($0.type) }
        }

        // Filter by vehicle
        if !selectedVehicles.isEmpty {
            filtered = filtered.filter { request in
                guard let vehicleType = request.vehicleType else { return false }
                return selectedVehicles.contains(vehicleType)
            }
        }

        // Filter by distance
        if let maxDistance = maxDistance {
            filtered = filtered.filter { $0.distanceKm <= maxDistance }
        }

        // Filter by rating (requires user data)
        if let minRating = minRating {
            filtered = filtered.filter { request in
                guard let user = request.user else { return false }
                return user.rating >= minRating
            }
        }

        logger.debug("Applied filters - \(requests.count) requests -> \(filtered.count) after filtering")
        return filtered
    }

    // MARK: - Computed Properties

    var hasActiveFilters: Bool {
        minPrice != nil || maxPrice != nil ||
        !selectedTypes.isEmpty || !selectedVehicles.isEmpty ||
        maxDistance != nil || minRating != nil
    }

    var filteredRequestsCount: Int {
        nearbyRequests.count
    }
}
