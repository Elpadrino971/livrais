import Foundation
import CoreLocation

// MARK: - User Profile
struct Profile: Codable, Identifiable {
    let id: UUID
    var fullName: String
    var email: String
    var phoneNumber: String?
    var avatarUrl: String?
    var bio: String?
    var rating: Double
    var totalDeliveries: Int
    var favoriteCount: Int
    var isAvailable: Bool
    var pushToken: String?
    var createdAt: Date
    var updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case fullName = "full_name"
        case email
        case phoneNumber = "phone_number"
        case avatarUrl = "avatar_url"
        case bio
        case rating
        case totalDeliveries = "total_deliveries"
        case favoriteCount = "favorite_count"
        case isAvailable = "is_available"
        case pushToken = "push_token"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - Auth Session
struct AuthSession {
    let accessToken: String
    let refreshToken: String
    let expiresAt: Date
    let user: AuthUser
}

struct AuthUser: Codable {
    let id: UUID
    let email: String
    let phone: String?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case email
        case phone
        case createdAt = "created_at"
    }
}

// MARK: - Login Credentials
struct LoginCredentials {
    let email: String
    let password: String
}

struct SignUpCredentials {
    let email: String
    let password: String
    let fullName: String
    let phoneNumber: String?
}
