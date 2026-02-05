import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @EnvironmentObject private var locationManager: LocationManager
    @StateObject private var deliveryViewModel: DeliveryViewModel
    @State private var showCreateRequest = false
    @State private var showFilters = false

    init() {
        // Initialize with placeholder - will be updated in onAppear
        _deliveryViewModel = StateObject(wrappedValue: DeliveryViewModel(
            userId: UUID(),
            locationManager: LocationManager()
        ))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Welcome Header
                    welcomeHeader

                    // Quick Actions
                    quickActionsSection

                    // Nearby Requests
                    nearbyRequestsSection
                }
                .padding()
            }
            .navigationTitle("Livrais")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showFilters = true
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                            .foregroundColor(Color("Primary"))
                    }
                }
            }
            .refreshable {
                await loadData()
            }
            .sheet(isPresented: $showCreateRequest) {
                CreateRequestView()
            }
            .sheet(isPresented: $showFilters) {
                FilterView(viewModel: deliveryViewModel)
            }
        }
        .onAppear {
            Task {
                await loadData()
            }
        }
    }

    // MARK: - View Components

    private var welcomeHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Bonjour, \(authViewModel.userDisplayName)!")
                .font(.title2)
                .fontWeight(.bold)

            if locationManager.authorizationStatus == .authorizedAlways ||
                locationManager.authorizationStatus == .authorizedWhenInUse {
                HStack {
                    Image(systemName: "location.fill")
                        .foregroundColor(.green)
                    Text("Localisation activée")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            } else {
                HStack {
                    Image(systemName: "location.slash")
                        .foregroundColor(.red)
                    Text("Localisation désactivée")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var quickActionsSection: some View {
        VStack(spacing: 12) {
            Button {
                showCreateRequest = true
            } label: {
                HStack {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                    Text("Créer une demande")
                        .font(.headline)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color("Primary"))
                .foregroundColor(.white)
                .cornerRadius(12)
            }

            HStack(spacing: 12) {
                StatCard(
                    title: "Demandes",
                    value: "\(deliveryViewModel.myRequests.count)",
                    icon: "doc.text.fill",
                    color: .blue
                )

                StatCard(
                    title: "Livraisons",
                    value: "\(deliveryViewModel.activeDeliveries.count)",
                    icon: "shippingbox.fill",
                    color: .orange
                )
            }
        }
    }

    private var nearbyRequestsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Demandes à proximité")
                    .font(.headline)
                Spacer()
                if deliveryViewModel.hasActiveFilters {
                    Text("\(deliveryViewModel.filteredRequestsCount) résultats")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            if deliveryViewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding()
            } else if deliveryViewModel.nearbyRequests.isEmpty {
                EmptyStateView(
                    icon: "map",
                    title: "Aucune demande à proximité",
                    subtitle: "Les nouvelles demandes apparaîtront ici"
                )
            } else {
                ForEach(deliveryViewModel.nearbyRequests.prefix(5)) { request in
                    NavigationLink {
                        RequestDetailsView(request: request)
                    } label: {
                        RequestCard(request: request)
                    }
                    .buttonStyle(.plain)
                }

                if deliveryViewModel.nearbyRequests.count > 5 {
                    NavigationLink {
                        AllRequestsView(viewModel: deliveryViewModel)
                    } label: {
                        Text("Voir toutes les demandes (\(deliveryViewModel.nearbyRequests.count))")
                            .font(.subheadline)
                            .foregroundColor(Color("Primary"))
                            .frame(maxWidth: .infinity)
                            .padding()
                    }
                }
            }
        }
    }

    // MARK: - Methods

    private func loadData() async {
        await deliveryViewModel.loadNearbyRequests()
        await deliveryViewModel.loadMyRequests()
        await deliveryViewModel.loadMyDeliveries()
    }
}

// MARK: - Supporting Views

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)

            Text(value)
                .font(.title2)
                .fontWeight(.bold)

            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

#Preview {
    HomeView()
        .environmentObject(AuthViewModel())
        .environmentObject(LocationManager())
}
