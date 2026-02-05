import SwiftUI
import MapKit

struct LocationPickerView: View {
    @Binding var coordinate: CLLocationCoordinate2D?
    @Binding var address: String
    @Binding var isPresented: Bool
    @EnvironmentObject private var locationManager: LocationManager

    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 4.9333, longitude: -52.3333),
        span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
    )
    @State private var centerCoordinate: CLLocationCoordinate2D?
    @State private var isLoadingAddress = false
    @State private var searchText = ""
    @State private var searchResults: [MKMapItem] = []
    @State private var isSearching = false

    var body: some View {
        NavigationStack {
            ZStack {
                // Map
                Map(coordinateRegion: $region, interactionModes: .all)
                    .ignoresSafeArea()
                    .onChange(of: region.center) { oldValue, newValue in
                        centerCoordinate = newValue
                        debouncedGeocode()
                    }

                // Center pin
                VStack {
                    Spacer()
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 50))
                        .foregroundColor(Color("Primary"))
                        .shadow(radius: 5)
                    Spacer()
                        .frame(height: 50)
                }

                // Search bar
                VStack {
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.secondary)

                        TextField("Rechercher une adresse", text: $searchText)
                            .textFieldStyle(.plain)
                            .onSubmit {
                                searchAddress()
                            }

                        if !searchText.isEmpty {
                            Button(action: {
                                searchText = ""
                                searchResults = []
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(radius: 5)
                    .padding()

                    // Search results
                    if !searchResults.isEmpty {
                        ScrollView {
                            VStack(spacing: 0) {
                                ForEach(searchResults, id: \.self) { item in
                                    Button(action: {
                                        selectSearchResult(item)
                                    }) {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(item.name ?? "")
                                                .font(.headline)
                                            if let address = item.placemark.title {
                                                Text(address)
                                                    .font(.subheadline)
                                                    .foregroundColor(.secondary)
                                            }
                                        }
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .padding()
                                        .background(Color(.systemBackground))
                                    }
                                    Divider()
                                }
                            }
                        }
                        .frame(maxHeight: 250)
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                        .shadow(radius: 5)
                        .padding(.horizontal)
                    }

                    Spacer()
                }

                // Bottom card with address
                VStack {
                    Spacer()

                    VStack(spacing: 16) {
                        if isLoadingAddress {
                            HStack {
                                ProgressView()
                                Text("Chargement de l'adresse...")
                                    .foregroundColor(.secondary)
                            }
                        } else if !address.isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Adresse sélectionnée")
                                    .font(.caption)
                                    .foregroundColor(.secondary)

                                Text(address)
                                    .font(.body)

                                if let coord = centerCoordinate {
                                    Text("\(String(format: "%.6f", coord.latitude)), \(String(format: "%.6f", coord.longitude))")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                        } else {
                            Text("Déplacez la carte pour sélectionner un emplacement")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }

                        Button(action: confirmLocation) {
                            Text("Confirmer l'emplacement")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(!address.isEmpty ? Color("Primary") : Color.gray)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                        }
                        .disabled(address.isEmpty)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16, corners: [.topLeft, .topRight])
                    .shadow(radius: 10)
                }
            }
            .navigationTitle("Sélectionner l'emplacement")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        isPresented = false
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: {
                        Task {
                            await useCurrentLocation()
                        }
                    }) {
                        Image(systemName: "location.fill")
                    }
                }
            }
            .onAppear {
                if let existing = coordinate {
                    region.center = existing
                    centerCoordinate = existing
                } else if let current = locationManager.location {
                    region.center = current.coordinate
                    centerCoordinate = current.coordinate
                }
            }
        }
    }

    // MARK: - Helper Methods

    private func debouncedGeocode() {
        // Cancel previous geocoding task
        Task {
            try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds

            guard let coord = centerCoordinate else { return }

            await MainActor.run {
                isLoadingAddress = true
            }

            do {
                let fetchedAddress = try await locationManager.reverseGeocode(coordinate: coord)
                await MainActor.run {
                    address = fetchedAddress
                    isLoadingAddress = false
                }
            } catch {
                print("❌ Error geocoding: \(error)")
                await MainActor.run {
                    isLoadingAddress = false
                }
            }
        }
    }

    private func searchAddress() {
        guard !searchText.isEmpty else { return }

        isSearching = true

        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = searchText
        request.region = region

        let search = MKLocalSearch(request: request)
        search.start { response, error in
            isSearching = false

            if let error = error {
                print("❌ Search error: \(error)")
                return
            }

            searchResults = response?.mapItems ?? []
        }
    }

    private func selectSearchResult(_ item: MKMapItem) {
        let coordinate = item.placemark.coordinate

        withAnimation {
            region.center = coordinate
            centerCoordinate = coordinate
            address = item.placemark.title ?? ""
            searchResults = []
            searchText = ""
        }
    }

    private func useCurrentLocation() async {
        do {
            let location = try await locationManager.getCurrentLocation()
            await MainActor.run {
                withAnimation {
                    region.center = location.coordinate
                    centerCoordinate = location.coordinate
                }
            }
        } catch {
            print("❌ Error getting current location: \(error)")
        }
    }

    private func confirmLocation() {
        coordinate = centerCoordinate
        isPresented = false
    }
}

// MARK: - Custom Corner Radius Extension

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}
