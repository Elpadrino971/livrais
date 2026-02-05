import Foundation
import CoreLocation

// MARK: - Delivery Request
struct DeliveryRequest: Codable, Identifiable {
    let id: UUID
    let userId: UUID
    let type: RequestType
    let pickupLocation: LocationPoint
    let deliveryLocation: LocationPoint
    let pickupAddress: String
    let deliveryAddress: String
    var price: Double
    var maxPrice: Double?
    let distanceKm: Double
    let description: String?
    let vehicleType: VehicleType?
    let needsTwoPeople: Bool
    let isNegotiable: Bool
    var status: DeliveryStatus
    let createdAt: Date
    var updatedAt: Date

    // Relations
    var user: Profile?
    var deliverer: Profile?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case type
        case pickupLocation = "pickup_location"
        case deliveryLocation = "delivery_location"
        case pickupAddress = "pickup_address"
        case deliveryAddress = "delivery_address"
        case price
        case maxPrice = "max_price"
        case distanceKm = "distance_km"
        case description
        case vehicleType = "vehicle_type"
        case needsTwoPeople = "needs_two_people"
        case isNegotiable = "is_negotiable"
        case status
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case user
        case deliverer
    }
}

// MARK: - Location Point
struct LocationPoint: Codable {
    let type: String = "Point"
    let coordinates: [Double] // [longitude, latitude]

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: coordinates[1], longitude: coordinates[0])
    }

    init(coordinate: CLLocationCoordinate2D) {
        self.coordinates = [coordinate.longitude, coordinate.latitude]
    }

    init(latitude: Double, longitude: Double) {
        self.coordinates = [longitude, latitude]
    }
}

// MARK: - Request Type
enum RequestType: String, Codable, CaseIterable {
    case package
    case groceries
    case heavyItem = "heavy_item"
    case carpool

    var displayName: String {
        switch self {
        case .package: return "Colis"
        case .groceries: return "Courses"
        case .heavyItem: return "Objet lourd"
        case .carpool: return "Covoiturage"
        }
    }

    var icon: String {
        switch self {
        case .package: return "📦"
        case .groceries: return "🛒"
        case .heavyItem: return "🏋️"
        case .carpool: return "🚗"
        }
    }
}

// MARK: - Vehicle Type
enum VehicleType: String, Codable, CaseIterable {
    case car
    case van
    case truck
    case scooter

    var displayName: String {
        switch self {
        case .car: return "Voiture"
        case .van: return "Fourgonnette"
        case .truck: return "Camionnette"
        case .scooter: return "Scooter"
        }
    }

    var icon: String {
        switch self {
        case .car: return "🚗"
        case .van: return "🚐"
        case .truck: return "🚚"
        case .scooter: return "🛵"
        }
    }
}

// MARK: - Delivery Status
enum DeliveryStatus: String, Codable {
    case pending
    case accepted
    case inProgress = "in_progress"
    case completed
    case cancelled

    var displayName: String {
        switch self {
        case .pending: return "En attente"
        case .accepted: return "Acceptée"
        case .inProgress: return "En cours"
        case .completed: return "Terminée"
        case .cancelled: return "Annulée"
        }
    }

    var color: String {
        switch self {
        case .pending: return "Orange"
        case .accepted: return "Blue"
        case .inProgress: return "Purple"
        case .completed: return "Green"
        case .cancelled: return "Red"
        }
    }
}

// MARK: - Delivery (Active)
struct Delivery: Codable, Identifiable {
    let id: UUID
    let requestId: UUID
    let delivererId: UUID
    let customerId: UUID
    let totalAmount: Double
    let platformFee: Double
    let delivererAmount: Double
    var status: DeliveryStatus
    let createdAt: Date
    var startedAt: Date?
    var completedAt: Date?

    // Relations
    var request: DeliveryRequest?
    var deliverer: Profile?
    var customer: Profile?

    enum CodingKeys: String, CodingKey {
        case id
        case requestId = "request_id"
        case delivererId = "deliverer_id"
        case customerId = "customer_id"
        case totalAmount = "total_amount"
        case platformFee = "platform_fee"
        case delivererAmount = "deliverer_amount"
        case status
        case createdAt = "created_at"
        case startedAt = "started_at"
        case completedAt = "completed_at"
        case request
        case deliverer
        case customer
    }
}

// MARK: - Rating
struct Rating: Codable, Identifiable {
    let id: UUID
    let deliveryId: UUID
    let raterId: UUID
    let ratedUserId: UUID
    let rating: Int
    let comment: String?
    let criteria: [String]
    let tip: Double?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case deliveryId = "delivery_id"
        case raterId = "rater_id"
        case ratedUserId = "rated_user_id"
        case rating
        case comment
        case criteria
        case tip
        case createdAt = "created_at"
    }
}

// MARK: - Favorite
struct Favorite: Codable, Identifiable {
    let id: UUID
    let userId: UUID
    let favoriteUserId: UUID
    let createdAt: Date

    // Relations
    var favoriteUser: Profile?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case favoriteUserId = "favorite_user_id"
        case createdAt = "created_at"
        case favoriteUser = "favorite_user"
    }
}
