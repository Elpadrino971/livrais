import Foundation
import Supabase
import Postgrest
import Realtime

class SupabaseService {
    static let shared = SupabaseService()

    private let client: SupabaseClient

    private init() {
        guard let supabaseURL = ProcessInfo.processInfo.environment["SUPABASE_URL"],
              let supabaseKey = ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"],
              let url = URL(string: supabaseURL) else {
            fatalError("Missing Supabase configuration")
        }

        client = SupabaseClient(
            supabaseURL: url,
            supabaseKey: supabaseKey
        )
    }

    var auth: AuthClient {
        client.auth
    }

    var database: PostgrestClient {
        client.database
    }

    var realtime: RealtimeClient {
        client.realtime
    }

    var storage: StorageClient {
        client.storage
    }

    // MARK: - Auth Methods

    func signIn(email: String, password: String) async throws -> AuthSession {
        let session = try await client.auth.signIn(email: email, password: password)
        return mapAuthSession(session)
    }

    func signUp(email: String, password: String, fullName: String, phoneNumber: String?) async throws -> AuthSession {
        let session = try await client.auth.signUp(
            email: email,
            password: password,
            data: [
                "full_name": .string(fullName),
                "phone_number": phoneNumber.map { .string($0) } ?? .null
            ]
        )
        return mapAuthSession(session)
    }

    func signOut() async throws {
        try await client.auth.signOut()
    }

    func getSession() async throws -> AuthSession? {
        guard let session = try await client.auth.session else {
            return nil
        }
        return mapAuthSession(session)
    }

    func refreshSession() async throws -> AuthSession? {
        let session = try await client.auth.refreshSession()
        return mapAuthSession(session)
    }

    private func mapAuthSession(_ session: Session) -> AuthSession {
        AuthSession(
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            expiresAt: session.expiresAt,
            user: AuthUser(
                id: session.user.id,
                email: session.user.email ?? "",
                phone: session.user.phone,
                createdAt: session.user.createdAt
            )
        )
    }

    // MARK: - Profile Methods

    func getProfile(userId: UUID) async throws -> Profile {
        let response: Profile = try await client.database
            .from("profiles")
            .select()
            .eq("id", value: userId.uuidString)
            .single()
            .execute()
            .value

        return response
    }

    func updateProfile(userId: UUID, updates: [String: Any]) async throws -> Profile {
        let response: Profile = try await client.database
            .from("profiles")
            .update(updates)
            .eq("id", value: userId.uuidString)
            .single()
            .execute()
            .value

        return response
    }

    // MARK: - Delivery Request Methods

    func getNearbyRequests(latitude: Double, longitude: Double, radiusKm: Double = 20) async throws -> [DeliveryRequest] {
        let response: [DeliveryRequest] = try await client.database
            .rpc(
                "get_nearby_requests",
                params: [
                    "user_lat": latitude,
                    "user_lng": longitude,
                    "radius_km": radiusKm
                ]
            )
            .execute()
            .value

        return response
    }

    func createRequest(_ request: DeliveryRequest) async throws -> DeliveryRequest {
        let response: DeliveryRequest = try await client.database
            .from("delivery_requests")
            .insert(request)
            .single()
            .execute()
            .value

        return response
    }

    func getMyRequests(userId: UUID) async throws -> [DeliveryRequest] {
        let response: [DeliveryRequest] = try await client.database
            .from("delivery_requests")
            .select("*, user:profiles(*), deliverer:profiles(*)")
            .eq("user_id", value: userId.uuidString)
            .order("created_at", ascending: false)
            .execute()
            .value

        return response
    }

    func updateRequest(id: UUID, updates: [String: Any]) async throws -> DeliveryRequest {
        let response: DeliveryRequest = try await client.database
            .from("delivery_requests")
            .update(updates)
            .eq("id", value: id.uuidString)
            .single()
            .execute()
            .value

        return response
    }

    // MARK: - Delivery Methods

    func acceptRequest(requestId: UUID, delivererId: UUID) async throws -> Delivery {
        // Get request details
        let request: DeliveryRequest = try await client.database
            .from("delivery_requests")
            .select()
            .eq("id", value: requestId.uuidString)
            .single()
            .execute()
            .value

        // Calculate fees
        let commissionRate: Double = 0.15
        let serviceFee: Double = 0.99
        let platformFee = max(request.price * commissionRate + serviceFee, 1.50)
        let delivererAmount = request.price - platformFee

        // Create delivery
        let delivery = try await client.database
            .from("deliveries")
            .insert([
                "request_id": requestId.uuidString,
                "deliverer_id": delivererId.uuidString,
                "customer_id": request.userId.uuidString,
                "total_amount": request.price,
                "platform_fee": platformFee,
                "deliverer_amount": delivererAmount
            ])
            .single()
            .execute()
            .value

        // Update request status
        try await client.database
            .from("delivery_requests")
            .update(["status": "accepted"])
            .eq("id", value: requestId.uuidString)
            .execute()

        return delivery
    }

    func getMyDeliveries(userId: UUID) async throws -> [Delivery] {
        let response: [Delivery] = try await client.database
            .from("deliveries")
            .select("*, request:delivery_requests(*), deliverer:profiles(*), customer:profiles(*)")
            .or("deliverer_id.eq.\(userId.uuidString),customer_id.eq.\(userId.uuidString)")
            .order("created_at", ascending: false)
            .execute()
            .value

        return response
    }

    func updateDeliveryStatus(id: UUID, status: DeliveryStatus) async throws {
        var updates: [String: Any] = ["status": status.rawValue]

        if status == .inProgress {
            updates["started_at"] = ISO8601DateFormatter().string(from: Date())
        } else if status == .completed {
            updates["completed_at"] = ISO8601DateFormatter().string(from: Date())
        }

        try await client.database
            .from("deliveries")
            .update(updates)
            .eq("id", value: id.uuidString)
            .execute()
    }

    // MARK: - Rating Methods

    func createRating(deliveryId: UUID, raterId: UUID, ratedUserId: UUID, rating: Int, comment: String?, criteria: [String], tip: Double?) async throws -> Rating {
        let ratingData: [String: Any] = [
            "delivery_id": deliveryId.uuidString,
            "rater_id": raterId.uuidString,
            "rated_user_id": ratedUserId.uuidString,
            "rating": rating,
            "comment": comment ?? NSNull(),
            "criteria": criteria,
            "tip": tip ?? NSNull()
        ]

        let response: Rating = try await client.database
            .from("ratings")
            .insert(ratingData)
            .single()
            .execute()
            .value

        return response
    }

    // MARK: - Favorites Methods

    func addFavorite(userId: UUID, favoriteUserId: UUID) async throws {
        try await client.database
            .from("favorites")
            .insert([
                "user_id": userId.uuidString,
                "favorite_user_id": favoriteUserId.uuidString
            ])
            .execute()
    }

    func removeFavorite(userId: UUID, favoriteUserId: UUID) async throws {
        try await client.database
            .from("favorites")
            .delete()
            .eq("user_id", value: userId.uuidString)
            .eq("favorite_user_id", value: favoriteUserId.uuidString)
            .execute()
    }

    func getFavorites(userId: UUID) async throws -> [Favorite] {
        let response: [Favorite] = try await client.database
            .rpc(
                "get_user_favorites",
                params: ["user_uuid": userId.uuidString]
            )
            .execute()
            .value

        return response
    }

    func isFavorite(userId: UUID, favoriteUserId: UUID) async throws -> Bool {
        let response = try await client.database
            .from("favorites")
            .select("id")
            .eq("user_id", value: userId.uuidString)
            .eq("favorite_user_id", value: favoriteUserId.uuidString)
            .execute()

        return !response.data.isEmpty
    }

    // MARK: - Realtime Subscriptions

    func subscribeToDelivery(deliveryId: UUID, onChange: @escaping (Delivery) -> Void) -> RealtimeChannel {
        let channel = client.realtime.channel("delivery:\(deliveryId.uuidString)")

        channel.on("UPDATE", filter: "id=eq.\(deliveryId.uuidString)") { message in
            if let delivery = try? JSONDecoder().decode(Delivery.self, from: message.payload) {
                onChange(delivery)
            }
        }

        channel.subscribe()

        return channel
    }
}
