import SwiftUI
import MapKit

struct RequestDetailsView: View {
    let request: DeliveryRequest
    @EnvironmentObject private var authViewModel: AuthViewModel
    @EnvironmentObject private var locationManager: LocationManager
    @StateObject private var viewModel: RequestDetailsViewModel

    @State private var showNegotiateSheet = false
    @State private var showAcceptConfirmation = false
    @State private var showCancelConfirmation = false
    @State private var showContactSheet = false
    @State private var negotiatedPrice: Double?

    init(request: DeliveryRequest, userId: UUID) {
        self.request = request
        _viewModel = StateObject(wrappedValue: RequestDetailsViewModel(requestId: request.id, userId: userId))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Map preview
                mapSection

                // Request details card
                detailsCard

                // Route information
                routeCard

                // Description
                if let description = request.description, !description.isEmpty {
                    descriptionCard(description)
                }

                // Requirements
                requirementsCard

                // Price details
                priceCard

                // User info
                if let user = request.user {
                    userCard(user)
                }

                // Actions
                if isOwnRequest {
                    ownerActions
                } else {
                    delivererActions
                }
            }
            .padding()
        }
        .navigationTitle("Détails de la demande")
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
        .sheet(isPresented: $showNegotiateSheet) {
            NegotiateSheet(
                request: request,
                suggestedPrice: request.price,
                maxPrice: request.maxPrice ?? request.price * 1.5,
                onSubmit: { price in
                    negotiatedPrice = price
                    Task {
                        await viewModel.negotiatePrice(price: price)
                    }
                }
            )
        }
        .sheet(isPresented: $showContactSheet) {
            if let user = request.user {
                ContactSheet(user: user)
            }
        }
    }

    // MARK: - Map Section

    private var mapSection: some View {
        Map(coordinateRegion: .constant(mapRegion), annotationItems: mapAnnotations) { annotation in
            MapAnnotation(coordinate: annotation.coordinate) {
                Circle()
                    .fill(annotation.color)
                    .frame(width: 20, height: 20)
                    .overlay(
                        Circle()
                            .stroke(Color.white, lineWidth: 2)
                    )
            }
        }
        .frame(height: 200)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
        )
    }

    private var mapRegion: MKCoordinateRegion {
        let pickup = request.pickupLocation.coordinate
        let delivery = request.deliveryLocation.coordinate

        let centerLat = (pickup.latitude + delivery.latitude) / 2
        let centerLon = (pickup.longitude + delivery.longitude) / 2

        let latDelta = abs(pickup.latitude - delivery.latitude) * 2
        let lonDelta = abs(pickup.longitude - delivery.longitude) * 2

        return MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: centerLat, longitude: centerLon),
            span: MKCoordinateSpan(
                latitudeDelta: max(latDelta, 0.01),
                longitudeDelta: max(lonDelta, 0.01)
            )
        )
    }

    private var mapAnnotations: [MapAnnotation] {
        [
            MapAnnotation(id: "pickup", coordinate: request.pickupLocation.coordinate, color: .green),
            MapAnnotation(id: "delivery", coordinate: request.deliveryLocation.coordinate, color: .red)
        ]
    }

    // MARK: - Details Card

    private var detailsCard: some View {
        VStack(spacing: 16) {
            HStack {
                Text(request.type.icon)
                    .font(.system(size: 50))

                VStack(alignment: .leading, spacing: 4) {
                    Text(request.type.displayName)
                        .font(.title2)
                        .fontWeight(.bold)

                    HStack(spacing: 8) {
                        StatusBadge(status: request.status)

                        Text("•")
                            .foregroundColor(.secondary)

                        Text("\(String(format: "%.1f", request.distanceKm)) km")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    // MARK: - Route Card

    private var routeCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Itinéraire")
                .font(.headline)

            VStack(alignment: .leading, spacing: 16) {
                RoutePoint(
                    icon: "circle.fill",
                    iconColor: .green,
                    title: "Point de retrait",
                    address: request.pickupAddress
                )

                VStack(spacing: 4) {
                    ForEach(0..<3) { _ in
                        Circle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(width: 4, height: 4)
                    }
                }
                .padding(.leading, 8)

                RoutePoint(
                    icon: "circle.fill",
                    iconColor: .red,
                    title: "Point de livraison",
                    address: request.deliveryAddress
                )
            }

            // ETA
            HStack {
                Image(systemName: "clock")
                    .foregroundColor(Color("Primary"))
                Text("Temps estimé: \(locationManager.calculateETA(distanceKm: request.distanceKm)) min")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 8)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    // MARK: - Description Card

    private func descriptionCard(_ description: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Description")
                .font(.headline)

            Text(description)
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    // MARK: - Requirements Card

    private var requirementsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Exigences")
                .font(.headline)

            VStack(spacing: 12) {
                if let vehicle = request.vehicleType {
                    RequirementRow(
                        icon: vehicle.icon,
                        title: "Véhicule requis",
                        value: vehicle.displayName
                    )
                }

                if request.needsTwoPeople {
                    RequirementRow(
                        icon: "👥",
                        title: "Personnel",
                        value: "Deux personnes nécessaires"
                    )
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    // MARK: - Price Card

    private var priceCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Prix")
                .font(.headline)

            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(String(format: "%.2f", request.price))€")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(Color("Primary"))

                    if request.isNegotiable {
                        if let maxPrice = request.maxPrice {
                            Text("Négociable jusqu'à \(String(format: "%.2f", maxPrice))€")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        } else {
                            Text("Prix négociable")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    } else {
                        Text("Prix fixe")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 8) {
                    HStack {
                        Image(systemName: "chart.bar.fill")
                            .foregroundColor(.green)
                        Text("Votre gain estimé")
                            .font(.caption)
                    }

                    let delivererAmount = calculateDelivererAmount(request.price)
                    Text("\(String(format: "%.2f", delivererAmount))€")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                }
            }

            // Price breakdown
            VStack(alignment: .leading, spacing: 8) {
                Divider()

                PriceBreakdownRow(title: "Prix total", value: request.price)
                PriceBreakdownRow(title: "Frais de plateforme (15% + 0.99€)", value: calculatePlatformFee(request.price), isNegative: true)
                PriceBreakdownRow(title: "Votre gain", value: calculateDelivererAmount(request.price), isBold: true)
            }
            .font(.caption)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    // MARK: - User Card

    private func userCard(_ user: Profile) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Demandeur")
                .font(.headline)

            HStack(spacing: 16) {
                Circle()
                    .fill(Color("Primary").opacity(0.2))
                    .frame(width: 60, height: 60)
                    .overlay {
                        Text(String(user.fullName.prefix(1)))
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(Color("Primary"))
                    }

                VStack(alignment: .leading, spacing: 4) {
                    Text(user.fullName)
                        .font(.headline)

                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                            .font(.caption)
                        Text(String(format: "%.1f", user.rating))
                            .font(.subheadline)
                            .foregroundColor(.secondary)

                        Text("•")
                            .foregroundColor(.secondary)

                        Text("\(user.totalDeliveries) livraisons")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }

                    if user.isAvailable {
                        HStack(spacing: 4) {
                            Circle()
                                .fill(.green)
                                .frame(width: 8, height: 8)
                            Text("Disponible")
                                .font(.caption)
                                .foregroundColor(.green)
                        }
                    }
                }

                Spacer()

                Button(action: { showContactSheet = true }) {
                    Image(systemName: "message.fill")
                        .font(.title3)
                        .foregroundColor(Color("Primary"))
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    // MARK: - Actions

    private var isOwnRequest: Bool {
        request.userId == authViewModel.currentUser?.id
    }

    private var ownerActions: some View {
        VStack(spacing: 12) {
            if request.status == .pending {
                Button(action: { showCancelConfirmation = true }) {
                    Text("Annuler la demande")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .confirmationDialog("Annuler la demande", isPresented: $showCancelConfirmation) {
                    Button("Annuler la demande", role: .destructive) {
                        Task {
                            await viewModel.cancelRequest()
                        }
                    }
                } message: {
                    Text("Êtes-vous sûr de vouloir annuler cette demande ?")
                }
            }
        }
    }

    private var delivererActions: some View {
        VStack(spacing: 12) {
            if request.status == .pending {
                Button(action: { showAcceptConfirmation = true }) {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                        Text("Accepter la demande")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color("Primary"))
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .confirmationDialog("Accepter la demande", isPresented: $showAcceptConfirmation) {
                    Button("Confirmer") {
                        Task {
                            await viewModel.acceptRequest()
                        }
                    }
                } message: {
                    Text("Vous vous engagez à effectuer cette livraison pour \(String(format: "%.2f", request.price))€")
                }

                if request.isNegotiable {
                    Button(action: { showNegotiateSheet = true }) {
                        HStack {
                            Image(systemName: "bubble.left.and.bubble.right")
                            Text("Négocier le prix")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray5))
                        .foregroundColor(.primary)
                        .cornerRadius(12)
                    }
                }
            }
        }
    }

    // MARK: - Helper Methods

    private func calculatePlatformFee(_ price: Double) -> Double {
        return max(price * 0.15 + 0.99, 1.50)
    }

    private func calculateDelivererAmount(_ price: Double) -> Double {
        return price - calculatePlatformFee(price)
    }
}

// MARK: - Supporting Views

struct MapAnnotation: Identifiable {
    let id: String
    let coordinate: CLLocationCoordinate2D
    let color: Color
}

struct RoutePoint: View {
    let icon: String
    let iconColor: Color
    let title: String
    let address: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(iconColor)
                .font(.title3)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text(address)
                    .font(.body)
            }
        }
    }
}

struct RequirementRow: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        HStack {
            Text(icon)
            Text(title)
                .font(.subheadline)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline)
                .fontWeight(.semibold)
        }
    }
}

struct PriceBreakdownRow: View {
    let title: String
    let value: Double
    var isNegative: Bool = false
    var isBold: Bool = false

    var body: some View {
        HStack {
            Text(title)
                .foregroundColor(.secondary)
            Spacer()
            Text("\(isNegative ? "-" : "")\(String(format: "%.2f", value))€")
                .fontWeight(isBold ? .bold : .regular)
                .foregroundColor(isNegative ? .red : (isBold ? .green : .primary))
        }
    }
}

// MARK: - Negotiate Sheet

struct NegotiateSheet: View {
    @Environment(\.dismiss) private var dismiss
    let request: DeliveryRequest
    let suggestedPrice: Double
    let maxPrice: Double
    let onSubmit: (Double) -> Void

    @State private var proposedPrice: Double

    init(request: DeliveryRequest, suggestedPrice: Double, maxPrice: Double, onSubmit: @escaping (Double) -> Void) {
        self.request = request
        self.suggestedPrice = suggestedPrice
        self.maxPrice = maxPrice
        self.onSubmit = onSubmit
        _proposedPrice = State(initialValue: suggestedPrice)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                VStack(spacing: 12) {
                    Text("💰")
                        .font(.system(size: 60))

                    Text("Proposer un prix")
                        .font(.title2)
                        .fontWeight(.bold)

                    Text("Le demandeur accepte les négociations jusqu'à \(String(format: "%.2f", maxPrice))€")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()

                VStack(spacing: 16) {
                    HStack {
                        Text("Votre proposition")
                            .font(.headline)
                        Spacer()
                        HStack(spacing: 4) {
                            TextField("Prix", value: $proposedPrice, format: .number)
                                .keyboardType(.decimalPad)
                                .multilineTextAlignment(.trailing)
                                .frame(width: 100)
                            Text("€")
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    Slider(value: $proposedPrice, in: 0...maxPrice, step: 0.5)
                        .tint(Color("Primary"))

                    HStack {
                        Text("0€")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(String(format: "%.2f", maxPrice))€")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()

                VStack(alignment: .leading, spacing: 12) {
                    Text("Votre gain estimé")
                        .font(.headline)

                    let delivererAmount = proposedPrice - max(proposedPrice * 0.15 + 0.99, 1.50)

                    HStack {
                        VStack(alignment: .leading) {
                            Text("Prix proposé")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text("\(String(format: "%.2f", proposedPrice))€")
                                .font(.title3)
                                .fontWeight(.bold)
                        }

                        Spacer()

                        VStack(alignment: .trailing) {
                            Text("Votre gain")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text("\(String(format: "%.2f", delivererAmount))€")
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(.green)
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                Spacer()

                Button(action: {
                    onSubmit(proposedPrice)
                    dismiss()
                }) {
                    Text("Envoyer la proposition")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(proposedPrice > 0 && proposedPrice <= maxPrice ? Color("Primary") : Color.gray)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                .disabled(proposedPrice <= 0 || proposedPrice > maxPrice)
            }
            .padding()
            .navigationTitle("Négocier")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Contact Sheet

struct ContactSheet: View {
    @Environment(\.dismiss) private var dismiss
    let user: Profile

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Circle()
                    .fill(Color("Primary").opacity(0.2))
                    .frame(width: 80, height: 80)
                    .overlay {
                        Text(String(user.fullName.prefix(1)))
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(Color("Primary"))
                    }

                Text(user.fullName)
                    .font(.title2)
                    .fontWeight(.bold)

                VStack(spacing: 16) {
                    if let phone = user.phoneNumber {
                        ContactButton(
                            icon: "phone.fill",
                            title: "Appeler",
                            subtitle: phone,
                            action: {
                                if let url = URL(string: "tel://\(phone)") {
                                    UIApplication.shared.open(url)
                                }
                            }
                        )
                    }

                    ContactButton(
                        icon: "message.fill",
                        title: "Envoyer un message",
                        subtitle: "Chat direct",
                        action: {
                            // Open chat
                        }
                    )
                }
                .padding()

                Spacer()
            }
            .padding()
            .navigationTitle("Contact")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct ContactButton: View {
    let icon: String
    let title: String
    let subtitle: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(Color("Primary"))
                    .frame(width: 40)

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(.primary)
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }
}

// MARK: - ViewModel

@Observable
final class RequestDetailsViewModel {
    private let requestId: UUID
    private let userId: UUID
    private let supabaseService = SupabaseService.shared

    private(set) var isLoading = false
    var error: Error?

    init(requestId: UUID, userId: UUID) {
        self.requestId = requestId
        self.userId = userId
    }

    @MainActor
    func acceptRequest() async {
        isLoading = true
        defer { isLoading = false }

        do {
            _ = try await supabaseService.acceptRequest(requestId: requestId, delivererId: userId)
            print("✅ Request accepted successfully")
        } catch {
            print("❌ Error accepting request: \(error)")
            self.error = error
        }
    }

    @MainActor
    func negotiatePrice(price: Double) async {
        isLoading = true
        defer { isLoading = false }

        do {
            // Send negotiation through chat or notification
            print("💬 Negotiation sent: \(price)€")
            // TODO: Implement negotiation logic
        } catch {
            print("❌ Error negotiating: \(error)")
            self.error = error
        }
    }

    @MainActor
    func cancelRequest() async {
        isLoading = true
        defer { isLoading = false }

        do {
            _ = try await supabaseService.updateRequest(id: requestId, updates: ["status": "cancelled"])
            print("✅ Request cancelled successfully")
        } catch {
            print("❌ Error cancelling request: \(error)")
            self.error = error
        }
    }
}
