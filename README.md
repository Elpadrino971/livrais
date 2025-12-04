# 🚚 Livrais - Plateforme de Livraison Collaborative (Guyane)

Plateforme permettant aux clients d'envoyer/livrer des produits volumineux ou des courses, et aux particuliers proches de proposer leur aide contre rémunération.

## 🎯 Objectifs

- Faciliter les livraisons de produits volumineux (réfrigérateurs, meubles, etc.)
- Permettre aux particuliers de rendre service et gagner de l'argent
- Optimiser la logistique sur un territoire où les distances sont longues
- Inclure le covoiturage pour les trajets longue distance

## 🚀 Fonctionnalités MVP

### ✅ Essentielles
- [x] Authentification (Email, Google, Apple)
- [x] Profils utilisateurs avec photo et avis
- [x] Géolocalisation en temps réel
- [x] Création de demandes de livraison
- [x] Matching automatique livreur/client
- [x] Paiements sécurisés via Stripe Connect
- [x] Commission automatique (10-20%)
- [x] Notifications push
- [x] Système de notation

### 🌟 Bonus
- [ ] Déclaration "Je vais faire des courses"
- [ ] Suivi GPS en temps réel
- [ ] Chat intégré
- [ ] Covoiturage
- [ ] Badge "Livreur premium"

## 🛠 Stack Technique

### Frontend
- **React Native** avec **Expo** (iOS & Android)
- **TypeScript** pour la sécurité du code
- **React Navigation** pour la navigation
- **React Native Maps** pour la géolocalisation
- **Expo Notifications** pour les push

### Backend
- **Supabase** (Auth, Database, Storage, Realtime)
- **PostgreSQL** pour la base de données
- **Supabase Edge Functions** pour la logique métier

### Paiements
- **Stripe Connect** pour gérer les paiements et commissions

### Géolocalisation
- **Google Maps API** / **OpenStreetMap**
- **Geolocation API** native

## 📁 Structure du Projet

```
livrais/
├── mobile/                 # Application React Native
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── screens/       # Écrans de l'app
│   │   ├── navigation/    # Configuration navigation
│   │   ├── services/      # API, Supabase, Stripe
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utilitaires
│   │   └── types/         # Types TypeScript
│   ├── assets/            # Images, fonts
│   └── app.json           # Config Expo
├── supabase/              # Backend Supabase
│   ├── migrations/        # Migrations DB
│   ├── functions/         # Edge Functions
│   └── seed.sql           # Données de test
└── docs/                  # Documentation
```

## 🗄 Schéma de Base de Données

### Tables principales
- **users** : Profils utilisateurs
- **delivery_requests** : Demandes de livraison
- **deliveries** : Livraisons en cours/terminées
- **ratings** : Notes et avis
- **messages** : Chat
- **notifications** : Historique des notifications
- **carpools** : Trajets de covoiturage

## 💰 Modèle Économique

- Commission plateforme : 10-20%
- Frais de service fixes : 0,99 €
- Badge premium (optionnel)

## 🔐 Sécurité

- Authentification sécurisée via Supabase Auth
- Validation d'identité (optionnelle)
- Protection des données (RGPD)
- Paiements sécurisés via Stripe

## 🚀 Démarrage

### Prérequis
- Node.js 18+
- Expo CLI
- Compte Supabase
- Compte Stripe

### Installation

```bash
# Installer les dépendances
cd mobile
npm install

# Démarrer l'app
npm start
```

### Configuration

1. Créer un projet Supabase
2. Copier les clés API dans `.env`
3. Configurer Stripe Connect
4. Activer Google Maps API

## 📱 Captures d'écran

(À venir)

## 🗺 Roadmap

### Phase 1 - MVP (2-3 mois)
- Authentification
- Géolocalisation
- Demandes de livraison
- Paiements
- Notifications

### Phase 2 - Amélioration (1-2 mois)
- Chat en temps réel
- Suivi GPS
- Covoiturage
- Badge premium

### Phase 3 - Expansion
- Martinique, Guadeloupe, Réunion
- Zones rurales de France métropolitaine

## 📄 Licence

MIT

## 👥 Contact

Pour toute question ou suggestion, contactez-nous.
