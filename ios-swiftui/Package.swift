// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Livrais",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "Livrais",
            targets: ["Livrais"]
        )
    ],
    dependencies: [
        // Supabase Swift SDK
        .package(
            url: "https://github.com/supabase/supabase-swift.git",
            from: "2.0.0"
        ),

        // Stripe iOS SDK
        .package(
            url: "https://github.com/stripe/stripe-ios-spm.git",
            from: "23.0.0"
        )
    ],
    targets: [
        .target(
            name: "Livrais",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
                .product(name: "StripePaymentSheet", package: "stripe-ios-spm"),
                .product(name: "StripePayments", package: "stripe-ios-spm")
            ]
        ),
        .testTarget(
            name: "LivraisTests",
            dependencies: ["Livrais"]
        )
    ]
)
