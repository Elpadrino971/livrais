import Foundation
import CoreLocation
import Combine

class LocationManager: NSObject, ObservableObject {
    private let locationManager = CLLocationManager()

    @Published var location: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus
    @Published var isTracking = false
    @Published var error: Error?

    private var deliveryId: UUID?
    private var trackingTimer: Timer?

    override init() {
        self.authorizationStatus = locationManager.authorizationStatus
        super.init()

        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 10 // 10 meters
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        locationManager.showsBackgroundLocationIndicator = true
    }

    // MARK: - Authorization

    func requestAuthorization() {
        switch authorizationStatus {
        case .notDetermined:
            locationManager.requestWhenInUseAuthorization()
        case .authorizedWhenInUse:
            locationManager.requestAlwaysAuthorization()
        default:
            break
        }
    }

    // MARK: - Location Tracking

    func startTracking(for deliveryId: UUID? = nil) {
        guard authorizationStatus == .authorizedAlways || authorizationStatus == .authorizedWhenInUse else {
            requestAuthorization()
            return
        }

        self.deliveryId = deliveryId
        isTracking = true
        locationManager.startUpdatingLocation()

        // Start background task for location updates
        if authorizationStatus == .authorizedAlways {
            locationManager.allowsBackgroundLocationUpdates = true
        }

        // Start timer for periodic location updates (every 5 seconds)
        trackingTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
            self?.sendLocationUpdate()
        }
    }

    func stopTracking() {
        isTracking = false
        locationManager.stopUpdatingLocation()
        trackingTimer?.invalidate()
        trackingTimer = nil
        deliveryId = nil
    }

    func getCurrentLocation() async throws -> CLLocation {
        if let location = location {
            return location
        }

        return try await withCheckedThrowingContinuation { continuation in
            var cancellable: AnyCancellable?

            cancellable = self.$location
                .compactMap { $0 }
                .first()
                .timeout(.seconds(10), scheduler: DispatchQueue.main)
                .sink(
                    receiveCompletion: { completion in
                        if case .failure(let error) = completion {
                            continuation.resume(throwing: error)
                        }
                        cancellable?.cancel()
                    },
                    receiveValue: { location in
                        continuation.resume(returning: location)
                        cancellable?.cancel()
                    }
                )

            // Request location if not already updating
            if !isTracking {
                locationManager.requestLocation()
            }
        }
    }

    private func sendLocationUpdate() {
        guard let location = location,
              let deliveryId = deliveryId else {
            return
        }

        Task {
            do {
                // Update location in Supabase
                try await SupabaseService.shared.database
                    .from("delivery_tracking")
                    .insert([
                        "delivery_id": deliveryId.uuidString,
                        "latitude": location.coordinate.latitude,
                        "longitude": location.coordinate.longitude,
                        "accuracy": location.horizontalAccuracy,
                        "speed": location.speed >= 0 ? location.speed : 0,
                        "heading": location.course >= 0 ? location.course : 0,
                        "timestamp": ISO8601DateFormatter().string(from: Date())
                    ])
                    .execute()
            } catch {
                print("Error sending location update: \(error)")
                self.error = error
            }
        }
    }

    // MARK: - Distance Calculations

    func calculateDistance(from: CLLocationCoordinate2D, to: CLLocationCoordinate2D) -> Double {
        let fromLocation = CLLocation(latitude: from.latitude, longitude: from.longitude)
        let toLocation = CLLocation(latitude: to.latitude, longitude: to.longitude)
        let distanceMeters = fromLocation.distance(from: toLocation)
        return distanceMeters / 1000.0 // Convert to kilometers
    }

    func calculateETA(distanceKm: Double, averageSpeedKmh: Double = 30.0) -> Int {
        let hours = distanceKm / averageSpeedKmh
        return Int(ceil(hours * 60)) // Convert to minutes
    }

    func calculateProgress(totalDistance: Double, remainingDistance: Double) -> Int {
        guard totalDistance > 0 else { return 100 }
        let progress = ((totalDistance - remainingDistance) / totalDistance) * 100
        return max(0, min(100, Int(progress)))
    }

    // MARK: - Geocoding

    func geocodeAddress(_ address: String) async throws -> CLLocationCoordinate2D {
        let geocoder = CLGeocoder()
        let placemarks = try await geocoder.geocodeAddressString(address)

        guard let coordinate = placemarks.first?.location?.coordinate else {
            throw LocationError.geocodingFailed
        }

        return coordinate
    }

    func reverseGeocode(coordinate: CLLocationCoordinate2D) async throws -> String {
        let geocoder = CLGeocoder()
        let location = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        let placemarks = try await geocoder.reverseGeocodeLocation(location)

        guard let placemark = placemarks.first else {
            throw LocationError.reverseGeocodingFailed
        }

        var addressComponents = [String]()

        if let street = placemark.thoroughfare {
            addressComponents.append(street)
        }
        if let number = placemark.subThoroughfare {
            addressComponents.insert(number, at: 0)
        }
        if let city = placemark.locality {
            addressComponents.append(city)
        }
        if let postalCode = placemark.postalCode {
            addressComponents.append(postalCode)
        }

        return addressComponents.joined(separator: ", ")
    }
}

// MARK: - CLLocationManagerDelegate

extension LocationManager: CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let newLocation = locations.last else { return }

        // Filter out old or inaccurate locations
        let age = newLocation.timestamp.timeIntervalSinceNow
        if abs(age) < 10 && newLocation.horizontalAccuracy <= 100 {
            self.location = newLocation
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error.localizedDescription)")
        self.error = error
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus

        switch authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            if isTracking {
                locationManager.startUpdatingLocation()
            }
        case .denied, .restricted:
            stopTracking()
            error = LocationError.authorizationDenied
        default:
            break
        }
    }
}

// MARK: - Location Error

enum LocationError: LocalizedError {
    case authorizationDenied
    case locationUnavailable
    case geocodingFailed
    case reverseGeocodingFailed
    case timeout

    var errorDescription: String? {
        switch self {
        case .authorizationDenied:
            return "L'accès à la localisation a été refusé. Veuillez activer la localisation dans les réglages."
        case .locationUnavailable:
            return "Impossible d'obtenir votre position actuelle."
        case .geocodingFailed:
            return "Impossible de trouver cette adresse."
        case .reverseGeocodingFailed:
            return "Impossible de déterminer l'adresse à cette position."
        case .timeout:
            return "Le délai d'attente pour obtenir votre position a expiré."
        }
    }
}
