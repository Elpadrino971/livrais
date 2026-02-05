import SwiftUI

struct EmptyStateView: View {
    let icon: String
    let title: String
    let subtitle: String?
    var action: (() -> Void)?
    var actionTitle: String?

    init(
        icon: String,
        title: String,
        subtitle: String? = nil,
        actionTitle: String? = nil,
        action: (() -> Void)? = nil
    ) {
        self.icon = icon
        self.title = title
        self.subtitle = subtitle
        self.actionTitle = actionTitle
        self.action = action
    }

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 60))
                .foregroundColor(.gray)

            Text(title)
                .font(.headline)
                .multilineTextAlignment(.center)

            if let subtitle = subtitle {
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            if let action = action, let actionTitle = actionTitle {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color("Primary"))
                        .cornerRadius(8)
                }
                .padding(.top, 8)
            }
        }
        .padding(40)
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    VStack {
        EmptyStateView(
            icon: "map",
            title: "Aucune demande",
            subtitle: "Les demandes apparaîtront ici"
        )

        EmptyStateView(
            icon: "star",
            title: "Aucun favori",
            subtitle: "Ajoutez vos livreurs préférés",
            actionTitle: "Explorer",
            action: {}
        )
    }
}
