import SwiftUI
import MapKit

// MARK: - Map View
struct MapView: View {
    @EnvironmentObject private var locationManager: LocationManager
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 4.9333, longitude: -52.3333),
        span: MKCoordinateSpan(latitudeDelta: 0.5, longitudeDelta: 0.5)
    )

    var body: some View {
        NavigationStack {
            Map(coordinateRegion: $region, showsUserLocation: true)
                .ignoresSafeArea(edges: .bottom)
                .navigationTitle("Carte")
                .onAppear {
                    if let location = locationManager.location {
                        region.center = location.coordinate
                    }
                }
        }
    }
}

// MARK: - History View
struct HistoryView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @StateObject private var historyViewModel: HistoryViewModel

    init() {
        _historyViewModel = StateObject(wrappedValue: HistoryViewModel(userId: UUID()))
    }

    var body: some View {
        NavigationStack {
            VStack {
                if historyViewModel.isLoading {
                    ProgressView()
                } else if historyViewModel.filteredHistoryItems.isEmpty {
                    EmptyStateView(
                        icon: "clock",
                        title: "Aucun historique",
                        subtitle: "Vos livraisons passées apparaîtront ici"
                    )
                } else {
                    List {
                        // Filter Picker
                        Picker("Filtre", selection: $historyViewModel.selectedFilter) {
                            ForEach(HistoryFilter.allCases, id: \.self) { filter in
                                Text(filter.rawValue).tag(filter)
                            }
                        }
                        .pickerStyle(.segmented)
                        .listRowSeparator(.hidden)

                        // Stats Section
                        Section("Statistiques") {
                            HStack {
                                VStack(alignment: .leading) {
                                    Text("Livraisons complétées")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    Text("\(historyViewModel.completedDeliveries)")
                                        .font(.title2)
                                        .fontWeight(.bold)
                                }
                                Spacer()
                                VStack(alignment: .trailing) {
                                    Text("Total gagné")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    Text("\(String(format: "%.2f", historyViewModel.totalEarned))€")
                                        .font(.title2)
                                        .fontWeight(.bold)
                                        .foregroundColor(.green)
                                }
                            }
                        }

                        // History Items
                        Section("Historique") {
                            ForEach(historyViewModel.filteredHistoryItems) { item in
                                HistoryItemRow(item: item)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Historique")
            .refreshable {
                await historyViewModel.loadHistory()
            }
            .task {
                await historyViewModel.loadHistory()
            }
        }
    }
}

struct HistoryItemRow: View {
    let item: DeliveryHistoryItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(item.type.icon)
                Text(item.otherPartyName)
                    .font(.headline)
                Spacer()
                Text("\(String(format: "%.2f", item.price))€")
                    .font(.headline)
                    .foregroundColor(Color("Primary"))
            }

            Text("\(item.pickupAddress) → \(item.deliveryAddress)")
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(1)

            HStack {
                StatusBadge(status: item.status)
                Spacer()
                Text(item.completedAt?.formatted(date: .abbreviated, time: .shortened) ?? "")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Favorites View
struct FavoritesView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @StateObject private var favoritesViewModel: FavoritesViewModel

    init() {
        _favoritesViewModel = StateObject(wrappedValue: FavoritesViewModel(userId: UUID()))
    }

    var body: some View {
        NavigationStack {
            Group {
                if favoritesViewModel.isLoading {
                    ProgressView()
                } else if favoritesViewModel.favorites.isEmpty {
                    EmptyStateView(
                        icon: "star",
                        title: "Aucun favori",
                        subtitle: "Ajoutez vos livreurs préférés pour les retrouver facilement"
                    )
                } else {
                    List {
                        Section {
                            Text("\(favoritesViewModel.favoritesCount) livreur(s) favori(s)")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }

                        Section("Mes favoris") {
                            ForEach(favoritesViewModel.favorites) { favorite in
                                if let user = favorite.favoriteUser {
                                    FavoriteUserRow(user: user)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Favoris")
            .refreshable {
                await favoritesViewModel.loadFavorites()
            }
            .task {
                await favoritesViewModel.loadFavorites()
            }
        }
    }
}

struct FavoriteUserRow: View {
    let user: Profile

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(Color("Primary").opacity(0.2))
                .frame(width: 50, height: 50)
                .overlay {
                    Text(String(user.fullName.prefix(1)))
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(Color("Primary"))
                }

            VStack(alignment: .leading, spacing: 4) {
                Text(user.fullName)
                    .font(.headline)

                HStack {
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
                    HStack {
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
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Profile View
struct ProfileView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel

    var body: some View {
        NavigationStack {
            List {
                // Profile Header
                Section {
                    HStack(spacing: 16) {
                        Circle()
                            .fill(Color("Primary").opacity(0.2))
                            .frame(width: 70, height: 70)
                            .overlay {
                                Text(String(authViewModel.userDisplayName.prefix(1)))
                                    .font(.title)
                                    .fontWeight(.bold)
                                    .foregroundColor(Color("Primary"))
                            }

                        VStack(alignment: .leading, spacing: 4) {
                            Text(authViewModel.userDisplayName)
                                .font(.title2)
                                .fontWeight(.bold)

                            if let profile = authViewModel.currentProfile {
                                HStack {
                                    Image(systemName: "star.fill")
                                        .foregroundColor(.yellow)
                                    Text(String(format: "%.1f", profile.rating))
                                        .foregroundColor(.secondary)
                                }
                                .font(.subheadline)

                                Text("\(profile.totalDeliveries) livraisons")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }

                // Actions
                Section {
                    NavigationLink {
                        Text("Paramètres")
                    } label: {
                        Label("Paramètres", systemImage: "gearshape")
                    }

                    NavigationLink {
                        FAQView()
                    } label: {
                        Label("FAQ & Support", systemImage: "questionmark.circle")
                    }

                    NavigationLink {
                        AboutView()
                    } label: {
                        Label("À propos", systemImage: "info.circle")
                    }
                }

                // Legal
                Section {
                    NavigationLink {
                        TermsOfServiceView()
                    } label: {
                        Label("Conditions d'utilisation", systemImage: "doc.text")
                    }

                    NavigationLink {
                        PrivacyPolicyView()
                    } label: {
                        Label("Politique de confidentialité", systemImage: "lock.shield")
                    }
                }

                // Sign Out
                Section {
                    Button(role: .destructive) {
                        Task {
                            await authViewModel.signOut()
                        }
                    } label: {
                        if authViewModel.isLoading {
                            HStack {
                                Text("Déconnexion")
                                Spacer()
                                ProgressView()
                            }
                        } else {
                            Text("Déconnexion")
                        }
                    }
                }
            }
            .navigationTitle("Profil")
        }
    }
}

// MARK: - Placeholder Views
struct CreateRequestView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Text("Créer une demande")
                .navigationTitle("Nouvelle demande")
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

struct RequestDetailsView: View {
    let request: DeliveryRequest

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Détails de la demande")
                    .font(.title)
                    .fontWeight(.bold)

                RequestCard(request: request)
            }
            .padding()
        }
        .navigationTitle("Demande")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct AllRequestsView: View {
    @ObservedObject var viewModel: DeliveryViewModel

    var body: some View {
        List(viewModel.nearbyRequests) { request in
            NavigationLink {
                RequestDetailsView(request: request)
            } label: {
                RequestCard(request: request)
                    .listRowInsets(EdgeInsets())
            }
        }
        .navigationTitle("Toutes les demandes")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct FilterView: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject var viewModel: DeliveryViewModel

    var body: some View {
        NavigationStack {
            Form {
                Section("Prix") {
                    HStack {
                        Text("Min:")
                        TextField("0", value: $viewModel.minPrice, format: .number)
                            .keyboardType(.decimalPad)
                        Text("€")
                    }
                    HStack {
                        Text("Max:")
                        TextField("100", value: $viewModel.maxPrice, format: .number)
                            .keyboardType(.decimalPad)
                        Text("€")
                    }
                }

                Section("Distance maximale") {
                    HStack {
                        TextField("20", value: $viewModel.maxDistance, format: .number)
                            .keyboardType(.decimalPad)
                        Text("km")
                    }
                }
            }
            .navigationTitle("Filtres")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Appliquer") {
                        viewModel.applyFilters()
                        dismiss()
                    }
                }
                ToolbarItem(placement: .bottomBar) {
                    Button("Réinitialiser") {
                        viewModel.clearFilters()
                    }
                }
            }
        }
    }
}
