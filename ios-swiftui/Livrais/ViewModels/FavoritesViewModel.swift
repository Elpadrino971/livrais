import Foundation
import Observation
import os

private let logger = Logger(subsystem: "com.livrais.app", category: "Favorites")

@Observable
final class FavoritesViewModel {
    // MARK: - Published State

    private(set) var favorites: [Favorite] = []
    private(set) var isLoading = false
    private(set) var error: Error?

    // MARK: - Dependencies

    private let supabaseService: SupabaseService
    private let userId: UUID

    // MARK: - Initialization

    init(userId: UUID, supabaseService: SupabaseService = .shared) {
        self.userId = userId
        self.supabaseService = supabaseService
        logger.info("FavoritesViewModel initialized for user: \(userId)")
    }

    // MARK: - Public Methods

    @MainActor
    func loadFavorites() async {
        logger.info("Loading favorites...")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let loadedFavorites = try await supabaseService.getFavorites(userId: userId)
            logger.info("Loaded \(loadedFavorites.count) favorites")
            favorites = loadedFavorites
        } catch {
            logger.error("Failed to load favorites: \(error.localizedDescription)")
            self.error = error
        }
    }

    @MainActor
    func addFavorite(userId favoriteUserId: UUID) async -> Bool {
        logger.info("Adding favorite user: \(favoriteUserId)")
        error = nil

        do {
            try await supabaseService.addFavorite(userId: userId, favoriteUserId: favoriteUserId)
            logger.info("Favorite added successfully")

            // Reload favorites to get updated list
            await loadFavorites()
            return true

        } catch {
            logger.error("Failed to add favorite: \(error.localizedDescription)")
            self.error = error
            return false
        }
    }

    @MainActor
    func removeFavorite(userId favoriteUserId: UUID) async -> Bool {
        logger.info("Removing favorite user: \(favoriteUserId)")
        error = nil

        do {
            try await supabaseService.removeFavorite(userId: userId, favoriteUserId: favoriteUserId)
            logger.info("Favorite removed successfully")

            favorites.removeAll { $0.favoriteUserId == favoriteUserId }
            return true

        } catch {
            logger.error("Failed to remove favorite: \(error.localizedDescription)")
            self.error = error
            return false
        }
    }

    @MainActor
    func toggleFavorite(userId favoriteUserId: UUID) async -> Bool {
        let isFavorited = favorites.contains { $0.favoriteUserId == favoriteUserId }

        if isFavorited {
            return await removeFavorite(userId: favoriteUserId)
        } else {
            return await addFavorite(userId: favoriteUserId)
        }
    }

    func isFavorite(userId: UUID) -> Bool {
        favorites.contains { $0.favoriteUserId == userId }
    }

    // MARK: - Computed Properties

    var favoritesCount: Int {
        favorites.count
    }

    var availableFavorites: [Favorite] {
        favorites.filter { $0.favoriteUser?.isAvailable == true }
    }

    var availableFavoritesCount: Int {
        availableFavorites.count
    }
}
