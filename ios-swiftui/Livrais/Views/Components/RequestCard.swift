import SwiftUI

struct RequestCard: View {
    let request: DeliveryRequest

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Text(request.type.icon)
                    .font(.title2)

                VStack(alignment: .leading, spacing: 4) {
                    Text(request.type.displayName)
                        .font(.headline)

                    Text("\(String(format: "%.1f", request.distanceKm)) km")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                StatusBadge(status: request.status)
            }

            // Route
            VStack(alignment: .leading, spacing: 6) {
                Label(request.pickupAddress, systemImage: "mappin.circle.fill")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)

                Image(systemName: "arrow.down")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .padding(.leading, 4)

                Label(request.deliveryAddress, systemImage: "mappin.circle.fill")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }

            // Footer
            HStack {
                if let vehicleType = request.vehicleType {
                    Label(vehicleType.displayName, systemImage: "car.fill")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                if request.needsTwoPeople {
                    Label("2 personnes", systemImage: "person.2.fill")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                VStack(alignment: .trailing) {
                    Text("\(String(format: "%.2f", request.price))€")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(Color("Primary"))

                    if request.isNegotiable {
                        Text("Négociable")
                            .font(.caption2)
                            .foregroundColor(.orange)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

struct StatusBadge: View {
    let status: DeliveryStatus

    var body: some View {
        Text(status.displayName)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(statusColor.opacity(0.2))
            .foregroundColor(statusColor)
            .cornerRadius(6)
    }

    private var statusColor: Color {
        switch status {
        case .pending:
            return .orange
        case .accepted:
            return .blue
        case .inProgress:
            return .purple
        case .completed:
            return .green
        case .cancelled:
            return .red
        }
    }
}

#Preview {
    VStack {
        RequestCard(request: DeliveryRequest(
            id: UUID(),
            userId: UUID(),
            type: .package,
            pickupLocation: LocationPoint(latitude: 4.9333, longitude: -52.3333),
            deliveryLocation: LocationPoint(latitude: 4.85, longitude: -52.3167),
            pickupAddress: "Cayenne, Place des Palmistes",
            deliveryAddress: "Matoury, Centre Commercial",
            price: 15.0,
            maxPrice: 20.0,
            distanceKm: 10.5,
            description: "Colis fragile",
            vehicleType: .car,
            needsTwoPeople: false,
            isNegotiable: true,
            status: .pending,
            createdAt: Date(),
            updatedAt: Date()
        ))
        .padding()
    }
}
