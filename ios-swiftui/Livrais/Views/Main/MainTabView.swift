import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @EnvironmentObject private var locationManager: LocationManager
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Home Tab
            HomeView()
                .tabItem {
                    Label("Accueil", systemImage: "house.fill")
                }
                .tag(0)

            // Map Tab
            MapView()
                .tabItem {
                    Label("Carte", systemImage: "map.fill")
                }
                .tag(1)

            // History Tab
            HistoryView()
                .tabItem {
                    Label("Historique", systemImage: "clock.fill")
                }
                .tag(2)

            // Favorites Tab
            FavoritesView()
                .tabItem {
                    Label("Favoris", systemImage: "star.fill")
                }
                .tag(3)

            // Profile Tab
            ProfileView()
                .tabItem {
                    Label("Profil", systemImage: "person.fill")
                }
                .tag(4)
        }
        .tint(Color("Primary"))
        .onAppear {
            // Request location permission when app loads
            if locationManager.authorizationStatus == .notDetermined {
                locationManager.requestAuthorization()
            }
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
        .environmentObject(LocationManager())
}
