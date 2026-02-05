import Foundation
import Observation
import os

private let logger = Logger(subsystem: "com.livrais.app", category: "Auth")

@Observable
final class AuthViewModel {
    // MARK: - Published State

    private(set) var isAuthenticated = false
    private(set) var isLoading = false
    private(set) var currentUser: AuthUser?
    private(set) var currentProfile: Profile?
    private(set) var error: Error?

    // MARK: - Dependencies

    private let authService: SupabaseService

    // MARK: - Initialization

    init(authService: SupabaseService = .shared) {
        self.authService = authService
        logger.info("AuthViewModel initialized")
    }

    // MARK: - Public Methods

    @MainActor
    func checkAuthStatus() async {
        logger.info("Checking auth status...")
        isLoading = true
        defer { isLoading = false }

        do {
            if let session = try await authService.getSession() {
                logger.info("Active session found for user: \(session.user.id)")
                currentUser = session.user
                await loadProfile(userId: session.user.id)
                isAuthenticated = true
            } else {
                logger.info("No active session found")
                isAuthenticated = false
                currentUser = nil
                currentProfile = nil
            }
        } catch {
            logger.error("Error checking auth status: \(error.localizedDescription)")
            self.error = error
            isAuthenticated = false
        }
    }

    @MainActor
    func signIn(email: String, password: String) async {
        logger.info("Attempting sign in for email: \(email)")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let session = try await authService.signIn(email: email, password: password)
            logger.info("Sign in successful for user: \(session.user.id)")

            currentUser = session.user
            await loadProfile(userId: session.user.id)
            isAuthenticated = true
        } catch {
            logger.error("Sign in failed: \(error.localizedDescription)")
            self.error = error
        }
    }

    @MainActor
    func signUp(email: String, password: String, fullName: String, phoneNumber: String?) async {
        logger.info("Attempting sign up for email: \(email)")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let session = try await authService.signUp(
                email: email,
                password: password,
                fullName: fullName,
                phoneNumber: phoneNumber
            )
            logger.info("Sign up successful for user: \(session.user.id)")

            currentUser = session.user
            await loadProfile(userId: session.user.id)
            isAuthenticated = true
        } catch {
            logger.error("Sign up failed: \(error.localizedDescription)")
            self.error = error
        }
    }

    @MainActor
    func signOut() async {
        logger.info("Attempting sign out...")
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            try await authService.signOut()
            logger.info("Sign out successful")

            currentUser = nil
            currentProfile = nil
            isAuthenticated = false
        } catch {
            logger.error("Sign out failed: \(error.localizedDescription)")
            self.error = error
        }
    }

    @MainActor
    func refreshProfile() async {
        guard let userId = currentUser?.id else {
            logger.warning("Cannot refresh profile: no current user")
            return
        }

        await loadProfile(userId: userId)
    }

    // MARK: - Private Methods

    @MainActor
    private func loadProfile(userId: UUID) async {
        logger.debug("Loading profile for user: \(userId)")

        do {
            let profile = try await authService.getProfile(userId: userId)
            logger.info("Profile loaded successfully - User: \(profile.fullName), Rating: \(profile.rating)")
            currentProfile = profile
        } catch {
            logger.error("Failed to load profile: \(error.localizedDescription)")
            self.error = error
        }
    }

    // MARK: - Computed Properties

    var userId: UUID? {
        currentUser?.id
    }

    var userDisplayName: String {
        currentProfile?.fullName ?? currentUser?.email ?? "User"
    }
}
