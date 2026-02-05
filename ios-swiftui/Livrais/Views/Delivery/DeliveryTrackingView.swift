import SwiftUI
import MapKit

struct DeliveryTrackingView: View {
    let delivery: Delivery
    @EnvironmentObject private var locationManager: LocationManager
    @EnvironmentObject private var authViewModel: AuthViewModel
    @StateObject private var viewModel: DeliveryTrackingViewModel

    @State private var region: MKCoordinateRegion
    @State private var showCompleteConfirmation = false
    @State private var showCancelConfirmation = false

    init(delivery: Delivery, userId: UUID) {
        self.delivery = delivery
        _viewModel = StateObject(wrappedValue: DeliveryTrackingViewModel(delivery: delivery, userId: userId))

        // Initialize region
        if let request = delivery.request {
            let pickup = request.pickupLocation.coordinate
            let delivery = request.deliveryLocation.coordinate
            let centerLat = (pickup.latitude + delivery.latitude) / 2
            let centerLon = (pickup.longitude + delivery.longitude) / 2

            _region = State(initialValue: MKCoordinateRegion(
                center: CLLocationCoordinate2D(latitude: centerLat, longitude: centerLon),
                span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
            ))
        } else {
            _region = State(initialValue: MKCoordinateRegion(
                center: CLLocationCoordinate2D(latitude: 4.9333, longitude: -52.3333),
                span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
            ))
        }
    }

    var body: some View {
        ZStack {
            // Map with tracking
            Map(coordinateRegion: $region, showsUserLocation: true, annotationItems: mapAnnotations) { annotation in
                MapAnnotation(coordinate: annotation.coordinate) {
                    VStack {
                        Image(systemName: annotation.icon)
                            .font(.title2)
                            .foregroundColor(annotation.color)
                            .padding(8)
                            .background(Color.white)
                            .clipShape(Circle())
                            .shadow(radius: 3)

                        Text(annotation.title)
                            .font(.caption)
                            .padding(4)
                            .background(Color.white)
                            .cornerRadius(4)
                    }
                }
            }
            .ignoresSafeArea()

            // Top status card
            VStack {
                statusCard
                Spacer()
            }

            // Bottom action card
            VStack {
                Spacer()
                actionCard
            }
        }
        .navigationTitle("Suivi de livraison")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            Task {
                await viewModel.startTracking()
            }
        }
        .onDisappear {
            viewModel.stopTracking()
        }
        .confirmationDialog("Marquer comme terminée", isPresented: $showCompleteConfirmation) {
            Button("Confirmer") {
                Task {
                    await viewModel.completeDelivery()
                }
            }
        } message: {
            Text("Confirmez-vous avoir livré le colis ?")
        }
        .confirmationDialog("Annuler la livraison", isPresented: $showCancelConfirmation) {
            Button("Annuler la livraison", role: .destructive) {
                Task {
                    await viewModel.cancelDelivery()
                }
            }
        } message: {
            Text("Êtes-vous sûr de vouloir annuler cette livraison ?")
        }
    }

    // MARK: - Status Card

    private var statusCard: some View {
        VStack(spacing: 16) {
            // Status indicator
            HStack {
                StatusBadge(status: delivery.status)
                Spacer()
                if let request = delivery.request {
                    Text(request.type.icon)
                        .font(.title2)
                }
            }

            // Progress bar
            if let request = delivery.request {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Progression")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(viewModel.progress)%")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(Color("Primary"))
                    }

                    ProgressView(value: Double(viewModel.progress), total: 100)
                        .tint(Color("Primary"))

                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Circle()
                                    .fill(viewModel.progress >= 50 ? Color.green : Color.gray)
                                    .frame(width: 8, height: 8)
                                Text("Retrait")
                                    .font(.caption)
                            }
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 4) {
                            HStack {
                                Text("Livraison")
                                    .font(.caption)
                                Circle()
                                    .fill(viewModel.progress == 100 ? Color.green : Color.gray)
                                    .frame(width: 8, height: 8)
                            }
                        }
                    }
                }

                Divider()

                // Distance and ETA
                HStack(spacing: 24) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Distance restante")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.right")
                                .foregroundColor(Color("Primary"))
                            Text("\(String(format: "%.1f", viewModel.remainingDistance)) km")
                                .font(.headline)
                        }
                    }

                    Divider()
                        .frame(height: 30)

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Temps estimé")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .foregroundColor(Color("Primary"))
                            Text("\(viewModel.eta) min")
                                .font(.headline)
                        }
                    }
                }
            }

            // Contact buttons
            HStack(spacing: 12) {
                if let otherParty = isDeliverer ? delivery.customer : delivery.deliverer {
                    ContactQuickButton(
                        icon: "phone.fill",
                        title: "Appeler",
                        action: {
                            if let phone = otherParty.phoneNumber,
                               let url = URL(string: "tel://\(phone)") {
                                UIApplication.shared.open(url)
                            }
                        }
                    )

                    ContactQuickButton(
                        icon: "message.fill",
                        title: "Message",
                        action: {
                            // Open chat
                        }
                    )
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16, corners: [.bottomLeft, .bottomRight])
        .shadow(radius: 5)
        .padding(.horizontal)
    }

    // MARK: - Action Card

    private var actionCard: some View {
        VStack(spacing: 16) {
            if let request = delivery.request {
                // Route summary
                VStack(alignment: .leading, spacing: 12) {
                    RouteStepRow(
                        icon: "circle.fill",
                        iconColor: .green,
                        title: "Retrait",
                        address: request.pickupAddress,
                        isCompleted: delivery.status != .accepted
                    )

                    RouteStepRow(
                        icon: "circle.fill",
                        iconColor: .red,
                        title: "Livraison",
                        address: request.deliveryAddress,
                        isCompleted: delivery.status == .completed
                    )
                }

                Divider()

                // Price
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(isDeliverer ? "Votre gain" : "Prix total")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(String(format: "%.2f", isDeliverer ? delivery.delivererAmount : delivery.totalAmount))€")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(Color("Primary"))
                    }

                    Spacer()

                    if isDeliverer {
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Prix total")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text("\(String(format: "%.2f", delivery.totalAmount))€")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }

            // Action buttons
            if isDeliverer {
                delivererActionButtons
            } else {
                customerActionButtons
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16, corners: [.topLeft, .topRight])
        .shadow(radius: 5)
        .padding(.horizontal)
    }

    private var delivererActionButtons: some View {
        VStack(spacing: 12) {
            switch delivery.status {
            case .accepted:
                Button(action: {
                    Task {
                        await viewModel.startDelivery()
                    }
                }) {
                    HStack {
                        Image(systemName: "play.fill")
                        Text("Commencer la livraison")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color("Primary"))
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }

            case .inProgress:
                Button(action: { showCompleteConfirmation = true }) {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                        Text("Marquer comme terminée")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }

                Button(action: { showCancelConfirmation = true }) {
                    Text("Annuler la livraison")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray5))
                        .foregroundColor(.red)
                        .cornerRadius(12)
                }

            case .completed:
                NavigationLink {
                    RateDeliveryView(delivery: delivery, ratedUserId: delivery.customerId, isRatingCustomer: true)
                } label: {
                    HStack {
                        Image(systemName: "star.fill")
                        Text("Noter le client")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color("Primary"))
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }

            default:
                EmptyView()
            }
        }
    }

    private var customerActionButtons: some View {
        VStack(spacing: 12) {
            if delivery.status == .completed {
                NavigationLink {
                    RateDeliveryView(delivery: delivery, ratedUserId: delivery.delivererId, isRatingCustomer: false)
                } label: {
                    HStack {
                        Image(systemName: "star.fill")
                        Text("Noter le livreur")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color("Primary"))
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
            }
        }
    }

    // MARK: - Helper Properties

    private var isDeliverer: Bool {
        delivery.delivererId == authViewModel.currentUser?.id
    }

    private var mapAnnotations: [TrackingAnnotation] {
        guard let request = delivery.request else { return [] }

        var annotations: [TrackingAnnotation] = [
            TrackingAnnotation(
                id: "pickup",
                coordinate: request.pickupLocation.coordinate,
                icon: "mappin.circle.fill",
                color: .green,
                title: "Retrait"
            ),
            TrackingAnnotation(
                id: "delivery",
                coordinate: request.deliveryLocation.coordinate,
                icon: "mappin.circle.fill",
                color: .red,
                title: "Livraison"
            )
        ]

        if let currentLocation = locationManager.location {
            annotations.append(
                TrackingAnnotation(
                    id: "current",
                    coordinate: currentLocation.coordinate,
                    icon: "location.fill",
                    color: Color("Primary"),
                    title: "Vous"
                )
            )
        }

        return annotations
    }
}

// MARK: - Supporting Views

struct RouteStepRow: View {
    let icon: String
    let iconColor: Color
    let title: String
    let address: String
    let isCompleted: Bool

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: isCompleted ? "checkmark.circle.fill" : icon)
                .foregroundColor(isCompleted ? .green : iconColor)
                .font(.title3)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Text(address)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }

            Spacer()

            if isCompleted {
                Image(systemName: "checkmark")
                    .foregroundColor(.green)
            }
        }
        .opacity(isCompleted ? 0.6 : 1.0)
    }
}

struct ContactQuickButton: View {
    let icon: String
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title3)
                Text(title)
                    .font(.caption)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(Color("Primary").opacity(0.1))
            .foregroundColor(Color("Primary"))
            .cornerRadius(12)
        }
    }
}

// MARK: - Tracking Annotation

struct TrackingAnnotation: Identifiable {
    let id: String
    let coordinate: CLLocationCoordinate2D
    let icon: String
    let color: Color
    let title: String
}

// MARK: - ViewModel

@Observable
final class DeliveryTrackingViewModel {
    private let delivery: Delivery
    private let userId: UUID
    private let supabaseService = SupabaseService.shared
    private var locationManager = LocationManager()

    private(set) var progress: Int = 0
    private(set) var remainingDistance: Double = 0
    private(set) var eta: Int = 0
    private(set) var isLoading = false
    var error: Error?

    init(delivery: Delivery, userId: UUID) {
        self.delivery = delivery
        self.userId = userId
        calculateProgress()
    }

    func startTracking() async {
        locationManager.startTracking(for: delivery.id)
        startProgressUpdates()
    }

    func stopTracking() {
        locationManager.stopTracking()
    }

    @MainActor
    func startDelivery() async {
        isLoading = true
        defer { isLoading = false }

        do {
            try await supabaseService.updateDeliveryStatus(id: delivery.id, status: .inProgress)
            print("✅ Delivery started")
        } catch {
            print("❌ Error starting delivery: \(error)")
            self.error = error
        }
    }

    @MainActor
    func completeDelivery() async {
        isLoading = true
        defer { isLoading = false }

        do {
            try await supabaseService.updateDeliveryStatus(id: delivery.id, status: .completed)
            stopTracking()
            print("✅ Delivery completed")
        } catch {
            print("❌ Error completing delivery: \(error)")
            self.error = error
        }
    }

    @MainActor
    func cancelDelivery() async {
        isLoading = true
        defer { isLoading = false }

        do {
            try await supabaseService.updateDeliveryStatus(id: delivery.id, status: .cancelled)
            stopTracking()
            print("✅ Delivery cancelled")
        } catch {
            print("❌ Error cancelling delivery: \(error)")
            self.error = error
        }
    }

    private func startProgressUpdates() {
        Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
            self?.calculateProgress()
        }
    }

    private func calculateProgress() {
        guard let request = delivery.request,
              let currentLocation = locationManager.location else {
            return
        }

        let pickup = request.pickupLocation.coordinate
        let deliveryLocation = request.deliveryLocation.coordinate
        let current = currentLocation.coordinate

        let totalDistance = locationManager.calculateDistance(from: pickup, to: deliveryLocation)

        // Calculate remaining distance based on status
        switch delivery.status {
        case .accepted:
            // Distance from current location to pickup
            remainingDistance = locationManager.calculateDistance(from: current, to: pickup)
            let distanceToPickup = remainingDistance
            let progressToPickup = max(0, min(50, Int((1 - distanceToPickup / totalDistance) * 50)))
            progress = progressToPickup

        case .inProgress:
            // Distance from current location to delivery
            remainingDistance = locationManager.calculateDistance(from: current, to: deliveryLocation)
            let progressToDelivery = max(0, min(50, Int((1 - remainingDistance / totalDistance) * 50)))
            progress = 50 + progressToDelivery

        case .completed:
            remainingDistance = 0
            progress = 100

        default:
            remainingDistance = totalDistance
            progress = 0
        }

        eta = locationManager.calculateETA(distanceKm: remainingDistance)
    }
}
