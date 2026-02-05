# Livrais iOS (SwiftUI)

Application iOS native pour la plateforme de livraison entre particuliers en Guyane française.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Fonctionnalités](#fonctionnalités)
- [Développement](#développement)
- [Tests](#tests)
- [Déploiement](#déploiement)

## 🔧 Prérequis

- macOS 14.0 ou supérieur
- Xcode 15.0 ou supérieur
- iOS 17.0 SDK
- Swift 5.9+
- CocoaPods ou Swift Package Manager
- Compte Apple Developer (pour tester sur appareil)

## 📦 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/votre-org/livrais.git
cd livrais/ios-swiftui
```

### 2. Installer les dépendances

Le projet utilise Swift Package Manager. Les dépendances seront automatiquement récupérées lors de l'ouverture du projet dans Xcode.

Dépendances principales :
- **Supabase Swift SDK** (v2.0+) - Base de données et authentification
- **Stripe iOS SDK** (v23.0+) - Paiements sécurisés

### 3. Ouvrir le projet

```bash
open Livrais.xcodeproj
```

## ⚙️ Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_cle_anon
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle
```

### 2. Configuration Xcode

Dans Xcode, ajoutez ces variables dans :
**Project Settings → Livrais → Build Settings → User-Defined**

Ou via le schéma :
**Product → Scheme → Edit Scheme → Run → Arguments → Environment Variables**

### 3. Bundle Identifier

Modifiez le Bundle Identifier dans Xcode :
- Cible : `gf.livrais.app`
- Ou personnalisez selon votre équipe

### 4. Signing & Capabilities

1. Sélectionnez votre équipe de développement
2. Activez les capabilities :
   - ✅ Background Modes (Location, Remote notifications)
   - ✅ Push Notifications
   - ✅ In-App Purchase (Stripe)
   - ✅ Maps
   - ✅ Location Updates

### 5. Configuration Stripe

1. Créez un compte sur [Stripe](https://stripe.com)
2. Obtenez vos clés API (mode test d'abord)
3. Configurez Stripe Connect pour les paiements aux livreurs
4. Ajoutez la clé publishable dans les variables d'environnement

### 6. Configuration Supabase

Le projet utilise Supabase pour :
- Authentification
- Base de données PostgreSQL avec PostGIS
- Storage (photos de profil)
- Realtime (suivi GPS)

Configuration requise :
1. Créez un projet sur [Supabase](https://supabase.com)
2. Exécutez les migrations SQL (voir `/supabase/migrations/`)
3. Configurez les RLS policies
4. Obtenez l'URL et la clé anon

## 🏗 Architecture

### Structure du projet

```
Livrais/
├── App/
│   ├── LivraisApp.swift          # Point d'entrée
│   └── ContentView.swift          # Navigation racine
├── Models/
│   ├── User.swift                 # Profile, AuthSession, AuthUser
│   └── Delivery.swift             # DeliveryRequest, Delivery, Rating
├── ViewModels/
│   ├── AuthViewModel.swift        # Authentification
│   ├── DeliveryViewModel.swift    # Gestion des livraisons
│   ├── FavoritesViewModel.swift   # Favoris
│   └── HistoryViewModel.swift     # Historique
├── Views/
│   ├── Auth/
│   │   └── AuthView.swift         # Login/Signup
│   ├── Main/
│   │   ├── MainTabView.swift      # Navigation par onglets
│   │   ├── HomeView.swift         # Écran d'accueil
│   │   └── SimpleViews.swift      # Map, History, Favorites, Profile
│   ├── Delivery/
│   │   ├── CreateRequestView.swift      # Création de demande
│   │   ├── LocationPickerView.swift     # Sélection de lieu
│   │   ├── RequestDetailsView.swift     # Détails demande
│   │   ├── DeliveryTrackingView.swift   # Suivi GPS
│   │   └── RateDeliveryView.swift       # Notation
│   ├── Info/
│   │   ├── FAQView.swift
│   │   ├── AboutView.swift
│   │   ├── TermsOfServiceView.swift
│   │   └── PrivacyPolicyView.swift
│   └── Components/
│       ├── EmptyStateView.swift
│       └── RequestCard.swift
├── Services/
│   ├── SupabaseService.swift     # API Supabase
│   ├── LocationManager.swift     # GPS et géolocalisation
│   ├── StripeService.swift       # Paiements (à créer)
│   └── PushNotificationService.swift  # Notifications (à créer)
└── Resources/
    ├── Assets.xcassets/          # Images et couleurs
    └── Info.plist                # Configuration app
```

### Patterns utilisés

- **MVVM** (Model-View-ViewModel) avec SwiftUI
- **@Observable** (iOS 17+) pour la gestion d'état
- **Async/Await** pour les opérations asynchrones
- **Protocol-Oriented Programming** pour les services
- **Dependency Injection** via EnvironmentObject
- **Combine** pour les streams de données

## ✨ Fonctionnalités

### ✅ Implémentées

- [x] Authentification (email/password)
- [x] Profils utilisateur avec notes
- [x] Création de demandes de livraison (wizard 5 étapes)
- [x] Sélection de lieu sur carte interactive
- [x] Liste des demandes à proximité (PostGIS)
- [x] Filtres avancés (prix, distance, type, véhicule)
- [x] Acceptation et négociation de prix
- [x] Suivi GPS en temps réel
- [x] Système de notation avec critères
- [x] Pourboires pour les livreurs
- [x] Favoris
- [x] Historique des livraisons
- [x] Chat direct (UI prête, à connecter)
- [x] FAQ et support
- [x] CGU et politique de confidentialité (RGPD)

### 🔜 À implémenter

- [ ] Service Stripe pour paiements
- [ ] Service Push Notifications
- [ ] Tests unitaires et UI
- [ ] Internationalisation (i18n)
- [ ] Mode sombre complet
- [ ] Widgets iOS
- [ ] Apple Pay integration
- [ ] Siri Shortcuts

## 👨‍💻 Développement

### Conventions de code

- **Nommage** : camelCase pour variables, PascalCase pour types
- **Indentation** : 4 espaces
- **Ligne max** : 120 caractères
- **Documentation** : commentaires SwiftDoc pour APIs publiques
- **Logging** : `os.Logger` avec catégories

### Lancer l'app

1. Sélectionnez un simulateur ou appareil
2. Appuyez sur **Cmd+R** ou cliquez sur ▶️ Play

### Debug

- **Console** : Cmd+Shift+Y
- **View Hierarchy** : Cmd+Shift+M (pendant l'exécution)
- **Memory Graph** : Utilisez Instruments

### Simulateur recommandé

- iPhone 15 Pro (iOS 17.0+)
- Localisation simulée : Custom Location → Cayenne (4.9333, -52.3333)

## 🧪 Tests

### Tests unitaires

```bash
# Via Xcode
Cmd+U

# Via ligne de commande
xcodebuild test -scheme Livrais -destination 'platform=iOS Simulator,name=iPhone 15 Pro'
```

### Tests UI

```bash
# Enregistrer un test UI
Xcode → Test Navigator → New UI Test
```

### Coverage

Activez Code Coverage dans Scheme → Test → Options → Code Coverage

## 🚀 Déploiement

### TestFlight (Beta)

1. **Archive** : Product → Archive
2. **Validate** : Vérifiez l'app
3. **Distribute** : Upload to App Store Connect
4. **TestFlight** : Invitez des testeurs

### App Store

1. Créez l'app dans App Store Connect
2. Remplissez les métadonnées (description, screenshots)
3. Soumettez pour review
4. Attendez l'approbation (1-3 jours généralement)

### Checklist avant soumission

- [ ] Version de build incrémentée
- [ ] Mode Release testé
- [ ] Screenshots à jour (tous les écrans requis)
- [ ] Description et mots-clés optimisés
- [ ] Privacy Policy URL configurée
- [ ] Clés de production Stripe configurées
- [ ] Push notifications testées
- [ ] Crash reports vérifiés (Firebase Crashlytics recommandé)

## 📱 Compatibilité

- **iOS** : 17.0+
- **Appareils** : iPhone et iPad
- **Orientations** : Portrait (iPhone), toutes (iPad)
- **Langues** : Français (actuellement)

## 🔐 Sécurité

- Authentification via Supabase Auth
- Paiements sécurisés via Stripe (PCI-DSS compliant)
- HTTPS obligatoire (App Transport Security)
- Données sensibles chiffrées
- Conformité RGPD

## 📄 Licence

Copyright © 2026 Livrais. Tous droits réservés.

## 🤝 Contribution

Contributions bienvenues ! Voir [CONTRIBUTING.md](../CONTRIBUTING.md) pour les guidelines.

## 📞 Support

- Email : support@livrais.gf
- Documentation : https://docs.livrais.gf
- Issues GitHub : https://github.com/votre-org/livrais/issues

## 🙏 Remerciements

- [Supabase](https://supabase.com) - Backend as a Service
- [Stripe](https://stripe.com) - Plateforme de paiement
- [SwiftUI](https://developer.apple.com/xcode/swiftui/) - Framework UI

---

**Note** : Cette application est optimisée pour la Guyane française. Les coordonnées par défaut sont celles de Cayenne (4.9333, -52.3333).
