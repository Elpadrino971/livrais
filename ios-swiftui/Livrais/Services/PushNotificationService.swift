import Foundation
import UserNotifications
import UIKit
import os.log

/// Service for handling push notifications
final class PushNotificationService: NSObject {
    static let shared = PushNotificationService()

    private let logger = Logger(subsystem: "gf.livrais.app", category: "PushNotifications")
    private let notificationCenter = UNUserNotificationCenter.current()

    var deviceToken: String?
    var isAuthorized = false

    private override init() {
        super.init()
        notificationCenter.delegate = self
    }

    // MARK: - Authorization

    /// Request notification permissions
    func requestAuthorization() async throws -> Bool {
        let options: UNAuthorizationOptions = [.alert, .sound, .badge]

        do {
            let granted = try await notificationCenter.requestAuthorization(options: options)
            isAuthorized = granted

            if granted {
                logger.info("✅ Notification authorization granted")
                await registerForRemoteNotifications()
            } else {
                logger.warning("⚠️ Notification authorization denied")
            }

            return granted
        } catch {
            logger.error("❌ Failed to request authorization: \(error.localizedDescription)")
            throw error
        }
    }

    /// Check current authorization status
    func checkAuthorizationStatus() async -> UNAuthorizationStatus {
        let settings = await notificationCenter.notificationSettings()
        isAuthorized = settings.authorizationStatus == .authorized
        return settings.authorizationStatus
    }

    @MainActor
    private func registerForRemoteNotifications() {
        UIApplication.shared.registerForRemoteNotifications()
        logger.info("📱 Registered for remote notifications")
    }

    // MARK: - Device Token

    /// Handle device token registration
    func handleDeviceToken(_ deviceToken: Data) {
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        self.deviceToken = tokenString

        logger.info("📱 Device token: \(tokenString)")

        // Save token to Supabase
        Task {
            await saveDeviceToken(tokenString)
        }
    }

    /// Handle registration error
    func handleRegistrationError(_ error: Error) {
        logger.error("❌ Failed to register for notifications: \(error.localizedDescription)")
    }

    private func saveDeviceToken(_ token: String) async {
        do {
            guard let session = try await SupabaseService.shared.getSession() else {
                logger.warning("⚠️ No active session, cannot save device token")
                return
            }

            _ = try await SupabaseService.shared.updateProfile(
                userId: session.user.id,
                updates: ["push_token": token]
            )

            logger.info("✅ Device token saved to profile")
        } catch {
            logger.error("❌ Failed to save device token: \(error.localizedDescription)")
        }
    }

    // MARK: - Local Notifications

    /// Schedule a local notification
    func scheduleLocalNotification(
        title: String,
        body: String,
        timeInterval: TimeInterval = 1,
        identifier: String = UUID().uuidString
    ) async throws {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)

        try await notificationCenter.add(request)
        logger.info("📬 Local notification scheduled: \(title)")
    }

    /// Cancel notification
    func cancelNotification(identifier: String) {
        notificationCenter.removePendingNotificationRequests(withIdentifiers: [identifier])
        logger.info("🗑️ Cancelled notification: \(identifier)")
    }

    /// Cancel all notifications
    func cancelAllNotifications() {
        notificationCenter.removeAllPendingNotificationRequests()
        logger.info("🗑️ Cancelled all notifications")
    }

    // MARK: - Badge Management

    @MainActor
    func setBadgeCount(_ count: Int) {
        UIApplication.shared.applicationIconBadgeNumber = count
    }

    @MainActor
    func clearBadge() {
        UIApplication.shared.applicationIconBadgeNumber = 0
    }

    // MARK: - Notification Categories

    func setupNotificationCategories() {
        // Delivery request category
        let acceptAction = UNNotificationAction(
            identifier: "ACCEPT_REQUEST",
            title: "Accepter",
            options: [.foreground]
        )

        let declineAction = UNNotificationAction(
            identifier: "DECLINE_REQUEST",
            title: "Refuser",
            options: [.destructive]
        )

        let requestCategory = UNNotificationCategory(
            identifier: "DELIVERY_REQUEST",
            actions: [acceptAction, declineAction],
            intentIdentifiers: [],
            options: []
        )

        // Delivery update category
        let viewAction = UNNotificationAction(
            identifier: "VIEW_DELIVERY",
            title: "Voir",
            options: [.foreground]
        )

        let deliveryCategory = UNNotificationCategory(
            identifier: "DELIVERY_UPDATE",
            actions: [viewAction],
            intentIdentifiers: [],
            options: []
        )

        // Message category
        let replyAction = UNTextInputNotificationAction(
            identifier: "REPLY_MESSAGE",
            title: "Répondre",
            options: [],
            textInputButtonTitle: "Envoyer",
            textInputPlaceholder: "Votre message..."
        )

        let messageCategory = UNNotificationCategory(
            identifier: "MESSAGE",
            actions: [replyAction, viewAction],
            intentIdentifiers: [],
            options: []
        )

        notificationCenter.setNotificationCategories([requestCategory, deliveryCategory, messageCategory])
        logger.info("✅ Notification categories configured")
    }

    // MARK: - Handle Notification Actions

    func handleNotificationAction(
        identifier: String,
        notification: UNNotification,
        response: UNTextInputNotificationResponse? = nil
    ) {
        let userInfo = notification.request.content.userInfo

        switch identifier {
        case "ACCEPT_REQUEST":
            handleAcceptRequest(userInfo: userInfo)

        case "DECLINE_REQUEST":
            handleDeclineRequest(userInfo: userInfo)

        case "VIEW_DELIVERY":
            handleViewDelivery(userInfo: userInfo)

        case "REPLY_MESSAGE":
            if let response = response, let text = response.userText as? String {
                handleReplyMessage(userInfo: userInfo, text: text)
            }

        default:
            logger.warning("⚠️ Unknown notification action: \(identifier)")
        }
    }

    private func handleAcceptRequest(userInfo: [AnyHashable: Any]) {
        guard let requestIdString = userInfo["request_id"] as? String,
              let requestId = UUID(uuidString: requestIdString) else {
            logger.error("❌ Invalid request ID in notification")
            return
        }

        logger.info("✅ Accepting request: \(requestId)")
        // Navigate to request details or automatically accept
        NotificationCenter.default.post(
            name: .init("AcceptDeliveryRequest"),
            object: nil,
            userInfo: ["requestId": requestId]
        )
    }

    private func handleDeclineRequest(userInfo: [AnyHashable: Any]) {
        guard let requestIdString = userInfo["request_id"] as? String,
              let requestId = UUID(uuidString: requestIdString) else {
            logger.error("❌ Invalid request ID in notification")
            return
        }

        logger.info("❌ Declining request: \(requestId)")
        // No action needed, just dismiss
    }

    private func handleViewDelivery(userInfo: [AnyHashable: Any]) {
        guard let deliveryIdString = userInfo["delivery_id"] as? String,
              let deliveryId = UUID(uuidString: deliveryIdString) else {
            logger.error("❌ Invalid delivery ID in notification")
            return
        }

        logger.info("👁️ Viewing delivery: \(deliveryId)")
        NotificationCenter.default.post(
            name: .init("ViewDelivery"),
            object: nil,
            userInfo: ["deliveryId": deliveryId]
        )
    }

    private func handleReplyMessage(userInfo: [AnyHashable: Any], text: String) {
        guard let conversationIdString = userInfo["conversation_id"] as? String,
              let conversationId = UUID(uuidString: conversationIdString) else {
            logger.error("❌ Invalid conversation ID in notification")
            return
        }

        logger.info("💬 Replying to message in conversation: \(conversationId)")
        // Send message via API
        Task {
            // TODO: Implement message sending
            logger.info("📤 Sending message: \(text)")
        }
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension PushNotificationService: UNUserNotificationCenterDelegate {
    /// Handle notification when app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        logger.info("📬 Received notification in foreground")

        // Show banner, sound, and badge
        completionHandler([.banner, .sound, .badge])
    }

    /// Handle notification tap
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        logger.info("👆 User tapped notification")

        let actionIdentifier = response.actionIdentifier
        let notification = response.notification

        if actionIdentifier == UNNotificationDefaultActionIdentifier {
            // User tapped the notification itself
            handleNotificationTap(notification: notification)
        } else {
            // User tapped an action button
            let textResponse = response as? UNTextInputNotificationResponse
            handleNotificationAction(
                identifier: actionIdentifier,
                notification: notification,
                response: textResponse
            )
        }

        completionHandler()
    }

    private func handleNotificationTap(notification: UNNotification) {
        let userInfo = notification.request.content.userInfo
        let categoryIdentifier = notification.request.content.categoryIdentifier

        switch categoryIdentifier {
        case "DELIVERY_REQUEST":
            if let requestIdString = userInfo["request_id"] as? String,
               let requestId = UUID(uuidString: requestIdString) {
                NotificationCenter.default.post(
                    name: .init("ViewDeliveryRequest"),
                    object: nil,
                    userInfo: ["requestId": requestId]
                )
            }

        case "DELIVERY_UPDATE":
            if let deliveryIdString = userInfo["delivery_id"] as? String,
               let deliveryId = UUID(uuidString: deliveryIdString) {
                NotificationCenter.default.post(
                    name: .init("ViewDelivery"),
                    object: nil,
                    userInfo: ["deliveryId": deliveryId]
                )
            }

        case "MESSAGE":
            if let conversationIdString = userInfo["conversation_id"] as? String,
               let conversationId = UUID(uuidString: conversationIdString) {
                NotificationCenter.default.post(
                    name: .init("OpenChat"),
                    object: nil,
                    userInfo: ["conversationId": conversationId]
                )
            }

        default:
            logger.warning("⚠️ Unknown notification category: \(categoryIdentifier)")
        }
    }
}

// MARK: - Notification Types

enum NotificationType: String {
    case newRequest = "new_request"
    case requestAccepted = "request_accepted"
    case deliveryStarted = "delivery_started"
    case deliveryCompleted = "delivery_completed"
    case newMessage = "new_message"
    case newRating = "new_rating"
    case paymentReceived = "payment_received"

    var title: String {
        switch self {
        case .newRequest:
            return "Nouvelle demande"
        case .requestAccepted:
            return "Demande acceptée"
        case .deliveryStarted:
            return "Livraison commencée"
        case .deliveryCompleted:
            return "Livraison terminée"
        case .newMessage:
            return "Nouveau message"
        case .newRating:
            return "Nouvelle évaluation"
        case .paymentReceived:
            return "Paiement reçu"
        }
    }
}
