import SwiftUI
import MapKit
import CoreLocation

struct CreateRequestView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var locationManager: LocationManager
    @EnvironmentObject private var authViewModel: AuthViewModel
    @StateObject private var viewModel: CreateRequestViewModel

    @State private var currentStep = 1
    @State private var selectedType: RequestType = .package
    @State private var pickupAddress = ""
    @State private var deliveryAddress = ""
    @State private var pickupCoordinate: CLLocationCoordinate2D?
    @State private var deliveryCoordinate: CLLocationCoordinate2D?
    @State private var description = ""
    @State private var selectedVehicle: VehicleType?
    @State private var needsTwoPeople = false
    @State private var isNegotiable = false
    @State private var suggestedPrice: Double = 0
    @State private var maxPrice: Double?
    @State private var showLocationPicker = false
    @State private var isPickingPickup = true

    init(userId: UUID) {
        _viewModel = StateObject(wrappedValue: CreateRequestViewModel(userId: userId))
    }

    var body: some View {
        NavigationStack {
            ZStack {
                ScrollView {
                    VStack(spacing: 24) {
                        // Progress indicator
                        progressIndicator

                        // Step content
                        Group {
                            switch currentStep {
                            case 1:
                                typeSelectionStep
                            case 2:
                                locationSelectionStep
                            case 3:
                                detailsStep
                            case 4:
                                priceStep
                            case 5:
                                reviewStep
                            default:
                                EmptyView()
                            }
                        }
                        .padding(.horizontal)

                        // Navigation buttons
                        navigationButtons
                    }
                    .padding(.vertical)
                }

                if viewModel.isLoading {
                    LoadingOverlay()
                }
            }
            .navigationTitle("Nouvelle demande")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        dismiss()
                    }
                }
            }
            .alert("Erreur", isPresented: .constant(viewModel.error != nil)) {
                Button("OK") {
                    viewModel.error = nil
                }
            } message: {
                if let error = viewModel.error {
                    Text(error.localizedDescription)
                }
            }
            .sheet(isPresented: $showLocationPicker) {
                LocationPickerView(
                    coordinate: isPickingPickup ? $pickupCoordinate : $deliveryCoordinate,
                    address: isPickingPickup ? $pickupAddress : $deliveryAddress,
                    isPresented: $showLocationPicker
                )
            }
        }
    }

    // MARK: - Progress Indicator

    private var progressIndicator: some View {
        HStack(spacing: 8) {
            ForEach(1...5, id: \.self) { step in
                Circle()
                    .fill(step <= currentStep ? Color("Primary") : Color.gray.opacity(0.3))
                    .frame(width: 10, height: 10)
            }
        }
        .padding()
    }

    // MARK: - Step 1: Type Selection

    private var typeSelectionStep: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Quel type de livraison ?")
                .font(.title2)
                .fontWeight(.bold)

            Text("Sélectionnez le type de service dont vous avez besoin")
                .font(.subheadline)
                .foregroundColor(.secondary)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                ForEach(RequestType.allCases, id: \.self) { type in
                    TypeCard(
                        type: type,
                        isSelected: selectedType == type,
                        action: { selectedType = type }
                    )
                }
            }
        }
    }

    // MARK: - Step 2: Location Selection

    private var locationSelectionStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Points de retrait et livraison")
                .font(.title2)
                .fontWeight(.bold)

            // Pickup location
            LocationInputCard(
                title: "Point de retrait",
                icon: "mappin.circle.fill",
                iconColor: .green,
                address: pickupAddress,
                coordinate: pickupCoordinate,
                onTap: {
                    isPickingPickup = true
                    showLocationPicker = true
                },
                onUseCurrentLocation: {
                    Task {
                        await useCurrentLocationForPickup()
                    }
                }
            )

            // Distance indicator
            if let pickup = pickupCoordinate, let delivery = deliveryCoordinate {
                HStack {
                    Spacer()
                    Image(systemName: "arrow.down")
                        .foregroundColor(Color("Primary"))
                    Text("\(String(format: "%.1f", locationManager.calculateDistance(from: pickup, to: delivery))) km")
                        .font(.headline)
                        .foregroundColor(Color("Primary"))
                    Spacer()
                }
            }

            // Delivery location
            LocationInputCard(
                title: "Point de livraison",
                icon: "mappin.circle.fill",
                iconColor: .red,
                address: deliveryAddress,
                coordinate: deliveryCoordinate,
                onTap: {
                    isPickingPickup = false
                    showLocationPicker = true
                },
                onUseCurrentLocation: nil
            )
        }
    }

    // MARK: - Step 3: Details

    private var detailsStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Détails de la livraison")
                .font(.title2)
                .fontWeight(.bold)

            // Description
            VStack(alignment: .leading, spacing: 8) {
                Text("Description")
                    .font(.headline)

                TextEditor(text: $description)
                    .frame(height: 100)
                    .padding(8)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    )

                Text("Décrivez l'objet à livrer, sa taille, son poids, etc.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Vehicle type
            VStack(alignment: .leading, spacing: 8) {
                Text("Type de véhicule requis")
                    .font(.headline)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(VehicleType.allCases, id: \.self) { vehicle in
                            VehicleChip(
                                vehicle: vehicle,
                                isSelected: selectedVehicle == vehicle,
                                action: { selectedVehicle = vehicle }
                            )
                        }
                    }
                }
            }

            // Two people needed
            Toggle(isOn: $needsTwoPeople) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Nécessite deux personnes")
                        .font(.headline)
                    Text("Objet lourd ou volumineux nécessitant de l'aide")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .tint(Color("Primary"))
        }
    }

    // MARK: - Step 4: Price

    private var priceStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Prix de la livraison")
                .font(.title2)
                .fontWeight(.bold)

            // Suggested price
            if suggestedPrice > 0 {
                VStack(spacing: 12) {
                    HStack {
                        Image(systemName: "lightbulb.fill")
                            .foregroundColor(.yellow)
                        Text("Prix suggéré")
                            .font(.headline)
                        Spacer()
                        Text("\(String(format: "%.2f", suggestedPrice))€")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(Color("Primary"))
                    }

                    Text("Basé sur la distance et le type de livraison")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color.yellow.opacity(0.1))
                .cornerRadius(12)
            }

            // Negotiable toggle
            Toggle(isOn: $isNegotiable) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Prix négociable")
                        .font(.headline)
                    Text("Permettre aux livreurs de proposer un prix")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .tint(Color("Primary"))

            // Max price (if negotiable)
            if isNegotiable {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Prix maximum acceptable")
                        .font(.headline)

                    HStack {
                        TextField("Prix max", value: $maxPrice, format: .number)
                            .keyboardType(.decimalPad)
                            .textFieldStyle(.roundedBorder)
                        Text("€")
                            .foregroundColor(.secondary)
                    }

                    if let max = maxPrice {
                        Text("Les livreurs pourront proposer jusqu'à \(String(format: "%.2f", max))€")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }

            // Price breakdown
            VStack(alignment: .leading, spacing: 12) {
                Text("Détails du prix")
                    .font(.headline)

                HStack {
                    Text("Prix de base")
                    Spacer()
                    Text("\(String(format: "%.2f", suggestedPrice))€")
                }
                .font(.subheadline)

                if needsTwoPeople {
                    HStack {
                        Text("Deux personnes (+20%)")
                        Spacer()
                        Text("+\(String(format: "%.2f", suggestedPrice * 0.2))€")
                    }
                    .font(.subheadline)
                }

                Divider()

                HStack {
                    Text("Total")
                        .fontWeight(.bold)
                    Spacer()
                    Text("\(String(format: "%.2f", calculateTotalPrice()))€")
                        .fontWeight(.bold)
                        .foregroundColor(Color("Primary"))
                }
                .font(.headline)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }

    // MARK: - Step 5: Review

    private var reviewStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Récapitulatif")
                .font(.title2)
                .fontWeight(.bold)

            VStack(spacing: 16) {
                // Type
                SummaryRow(
                    icon: selectedType.icon,
                    title: "Type",
                    value: selectedType.displayName
                )

                // Route
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "location.fill")
                            .foregroundColor(Color("Primary"))
                        Text("Itinéraire")
                            .font(.headline)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Circle()
                                .fill(Color.green)
                                .frame(width: 8, height: 8)
                            Text(pickupAddress)
                                .font(.subheadline)
                        }

                        HStack {
                            Circle()
                                .fill(Color.red)
                                .frame(width: 8, height: 8)
                            Text(deliveryAddress)
                                .font(.subheadline)
                        }

                        if let pickup = pickupCoordinate, let delivery = deliveryCoordinate {
                            Text("\(String(format: "%.1f", locationManager.calculateDistance(from: pickup, to: delivery))) km")
                                .font(.caption)
                                .foregroundColor(Color("Primary"))
                                .fontWeight(.semibold)
                        }
                    }
                    .padding(.leading, 20)
                }

                // Details
                if !description.isEmpty {
                    SummaryRow(
                        icon: "📝",
                        title: "Description",
                        value: description
                    )
                }

                if let vehicle = selectedVehicle {
                    SummaryRow(
                        icon: vehicle.icon,
                        title: "Véhicule",
                        value: vehicle.displayName
                    )
                }

                if needsTwoPeople {
                    SummaryRow(
                        icon: "👥",
                        title: "Personnel",
                        value: "Deux personnes requises"
                    )
                }

                // Price
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "eurosign.circle.fill")
                            .foregroundColor(Color("Primary"))
                        Text("Prix")
                            .font(.headline)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(String(format: "%.2f", calculateTotalPrice()))€")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(Color("Primary"))

                        if isNegotiable {
                            if let max = maxPrice {
                                Text("Négociable jusqu'à \(String(format: "%.2f", max))€")
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
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
    }

    // MARK: - Navigation Buttons

    private var navigationButtons: some View {
        HStack(spacing: 16) {
            if currentStep > 1 {
                Button(action: {
                    withAnimation {
                        currentStep -= 1
                    }
                }) {
                    Text("Retour")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray5))
                        .foregroundColor(.primary)
                        .cornerRadius(12)
                }
            }

            Button(action: {
                if currentStep < 5 {
                    if canProceedToNextStep() {
                        withAnimation {
                            currentStep += 1
                            if currentStep == 4 {
                                calculateSuggestedPrice()
                            }
                        }
                    }
                } else {
                    Task {
                        await createRequest()
                    }
                }
            }) {
                Text(currentStep < 5 ? "Suivant" : "Créer la demande")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(canProceedToNextStep() ? Color("Primary") : Color.gray)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .disabled(!canProceedToNextStep())
        }
        .padding(.horizontal)
    }

    // MARK: - Helper Methods

    private func canProceedToNextStep() -> Bool {
        switch currentStep {
        case 1:
            return true // Type is always selected
        case 2:
            return pickupCoordinate != nil && deliveryCoordinate != nil && !pickupAddress.isEmpty && !deliveryAddress.isEmpty
        case 3:
            return !description.isEmpty
        case 4:
            return suggestedPrice > 0 && (!isNegotiable || maxPrice != nil)
        case 5:
            return true
        default:
            return false
        }
    }

    private func useCurrentLocationForPickup() async {
        do {
            let location = try await locationManager.getCurrentLocation()
            pickupCoordinate = location.coordinate
            let address = try await locationManager.reverseGeocode(coordinate: location.coordinate)
            pickupAddress = address
        } catch {
            viewModel.error = error
        }
    }

    private func calculateSuggestedPrice() {
        guard let pickup = pickupCoordinate, let delivery = deliveryCoordinate else { return }

        let distance = locationManager.calculateDistance(from: pickup, to: delivery)

        // Base price calculation
        let basePrice: Double
        switch selectedType {
        case .package:
            basePrice = 5 + (distance * 1.5)
        case .groceries:
            basePrice = 8 + (distance * 1.8)
        case .heavyItem:
            basePrice = 15 + (distance * 2.5)
        case .carpool:
            basePrice = 3 + (distance * 1.2)
        }

        // Adjustments
        var finalPrice = basePrice

        if needsTwoPeople {
            finalPrice *= 1.2
        }

        if let vehicle = selectedVehicle {
            switch vehicle {
            case .scooter:
                finalPrice *= 0.8
            case .car:
                finalPrice *= 1.0
            case .van:
                finalPrice *= 1.3
            case .truck:
                finalPrice *= 1.5
            }
        }

        suggestedPrice = round(finalPrice * 100) / 100

        if isNegotiable && maxPrice == nil {
            maxPrice = round(suggestedPrice * 1.5 * 100) / 100
        }
    }

    private func calculateTotalPrice() -> Double {
        var total = suggestedPrice

        if needsTwoPeople {
            total += suggestedPrice * 0.2
        }

        return round(total * 100) / 100
    }

    private func createRequest() async {
        guard let pickup = pickupCoordinate,
              let delivery = deliveryCoordinate else { return }

        await viewModel.createRequest(
            type: selectedType,
            pickupLocation: LocationPoint(coordinate: pickup),
            deliveryLocation: LocationPoint(coordinate: delivery),
            pickupAddress: pickupAddress,
            deliveryAddress: deliveryAddress,
            price: calculateTotalPrice(),
            maxPrice: isNegotiable ? maxPrice : nil,
            description: description,
            vehicleType: selectedVehicle,
            needsTwoPeople: needsTwoPeople,
            isNegotiable: isNegotiable
        )

        if viewModel.error == nil {
            dismiss()
        }
    }
}

// MARK: - Supporting Views

struct TypeCard: View {
    let type: RequestType
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Text(type.icon)
                    .font(.system(size: 40))

                Text(type.displayName)
                    .font(.headline)
                    .foregroundColor(isSelected ? .white : .primary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
            .background(isSelected ? Color("Primary") : Color(.systemGray6))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color("Primary") : Color.clear, lineWidth: 2)
            )
        }
    }
}

struct LocationInputCard: View {
    let title: String
    let icon: String
    let iconColor: Color
    let address: String
    let coordinate: CLLocationCoordinate2D?
    let onTap: () -> Void
    let onUseCurrentLocation: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(iconColor)
                Text(title)
                    .font(.headline)
            }

            Button(action: onTap) {
                HStack {
                    if address.isEmpty {
                        Text("Sélectionner l'adresse")
                            .foregroundColor(.secondary)
                    } else {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(address)
                                .foregroundColor(.primary)
                            if let coord = coordinate {
                                Text("\(String(format: "%.6f", coord.latitude)), \(String(format: "%.6f", coord.longitude))")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    Spacer()
                    Image(systemName: "chevron.right")
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }

            if let onUseCurrent = onUseCurrentLocation {
                Button(action: onUseCurrent) {
                    HStack {
                        Image(systemName: "location.fill")
                        Text("Utiliser ma position actuelle")
                    }
                    .font(.subheadline)
                    .foregroundColor(Color("Primary"))
                }
            }
        }
    }
}

struct VehicleChip: View {
    let vehicle: VehicleType
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Text(vehicle.icon)
                Text(vehicle.displayName)
                    .font(.subheadline)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(isSelected ? Color("Primary") : Color(.systemGray6))
            .foregroundColor(isSelected ? .white : .primary)
            .cornerRadius(20)
        }
    }
}

struct SummaryRow: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(icon)
                Text(title)
                    .font(.headline)
            }
            Text(value)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .padding(.leading, 28)
        }
    }
}

struct LoadingOverlay: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .scaleEffect(1.5)
                Text("Création en cours...")
                    .foregroundColor(.white)
            }
            .padding(32)
            .background(Color(.systemBackground))
            .cornerRadius(16)
        }
    }
}

// MARK: - ViewModel

@Observable
final class CreateRequestViewModel {
    private let userId: UUID
    private let supabaseService = SupabaseService.shared

    private(set) var isLoading = false
    var error: Error?

    init(userId: UUID) {
        self.userId = userId
    }

    @MainActor
    func createRequest(
        type: RequestType,
        pickupLocation: LocationPoint,
        deliveryLocation: LocationPoint,
        pickupAddress: String,
        deliveryAddress: String,
        price: Double,
        maxPrice: Double?,
        description: String,
        vehicleType: VehicleType?,
        needsTwoPeople: Bool,
        isNegotiable: Bool
    ) async {
        isLoading = true
        defer { isLoading = false }

        do {
            let distance = LocationManager().calculateDistance(
                from: pickupLocation.coordinate,
                to: deliveryLocation.coordinate
            )

            let request = DeliveryRequest(
                id: UUID(),
                userId: userId,
                type: type,
                pickupLocation: pickupLocation,
                deliveryLocation: deliveryLocation,
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

            _ = try await supabaseService.createRequest(request)
            print("✅ Request created successfully")
        } catch {
            print("❌ Error creating request: \(error)")
            self.error = error
        }
    }
}
