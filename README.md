# Livrais 📦

**Plateforme collaborative de livraison pour la Guyane française**

Livrais met en relation des personnes souhaitant envoyer ou recevoir des colis avec des livreurs indépendants locaux. Conçu spécifiquement pour répondre aux défis logistiques de la Guyane.

## 🌟 Caractéristiques principales

### Pour les clients
- ✅ Créer des demandes de livraison avec prix négociable
- 📍 Suivre la livraison en temps réel sur carte
- ⭐ Noter et commenter les livreurs
- 💬 Chat rapide avec messages prédéfinis
- 📦 Historique complet des livraisons
- ⭐ Système de favoris pour retrouver ses livreurs préférés

### Pour les livreurs
- 🗺️ Voir les demandes de livraison à proximité
- 💰 Négocier les prix avant d'accepter
- 📍 Partage de position GPS en temps réel
- 💳 Paiements sécurisés via Stripe Connect
- ⭐ Profil avec système de notation
- 📊 Statistiques et historique des gains

### Fonctionnalités techniques
- 🔐 Authentification sécurisée (Supabase Auth)
- 💳 Paiements (Stripe Connect - 15% + 0,99€)
- 📱 Notifications push (Expo)
- 🗺️ Tracking GPS en arrière-plan
- 🌐 Mode hors-ligne avec synchronisation
- 🔍 Filtres avancés (prix, distance, type)
- 📄 Pagination des résultats
- 🧪 Tests unitaires (Jest)

## 📋 Prérequis

- **Node.js** 18+ et npm/yarn
- **Expo CLI**: \`npm install -g expo-cli\`
- **Compte Supabase** (backend)
- **Compte Stripe** (paiements)
- **Compte Expo** (notifications push)

## 🚀 Installation

### 1. Cloner le repository

\`\`\`bash
git clone https://github.com/Elpadrino971/livrais.git
cd livrais
\`\`\`

### 2. Installation des dépendances

\`\`\`bash
cd mobile
npm install
\`\`\`

### 3. Configuration de Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Copier \`.env.example\` vers \`.env\`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
3. Remplir les variables Supabase dans \`.env\`:
   \`\`\`env
   EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   \`\`\`

4. Exécuter les migrations:
   \`\`\`bash
   cd ../supabase
   npx supabase login
   npx supabase link --project-ref votre-project-ref
   npx supabase db push
   \`\`\`

### 4. Configuration de Stripe

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Activer Stripe Connect
3. Ajouter les clés dans \`.env\`:
   \`\`\`env
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   \`\`\`

4. Déployer les Edge Functions Stripe:
   \`\`\`bash
   cd ../supabase/functions
   supabase functions deploy create-stripe-account
   supabase functions deploy create-payment-intent
   supabase functions deploy create-account-link
   \`\`\`

### 5. Configuration des notifications push

1. Créer un compte Expo: \`npx expo login\`
2. Initialiser EAS: \`npx eas init\`
3. Copier le Project ID dans \`.env\`:
   \`\`\`env
   EXPO_PUBLIC_PROJECT_ID=votre-project-id
   \`\`\`

4. Déployer les fonctions de notification:
   \`\`\`bash
   supabase functions deploy send-push-notification
   supabase functions deploy notify-nearby-deliverers
   \`\`\`

### 6. Lancer l'application

\`\`\`bash
cd mobile
npm start
\`\`\`

Scannez le QR code avec l'app Expo Go sur votre téléphone.

## 🧪 Tests

Exécuter les tests unitaires:

\`\`\`bash
npm test
\`\`\`

Exécuter les tests avec couverture:

\`\`\`bash
npm test -- --coverage
\`\`\`

## 📱 Build Production

### Android

\`\`\`bash
npx eas build --platform android
\`\`\`

### iOS

\`\`\`bash
npx eas build --platform ios
\`\`\`

## 📁 Structure du projet

\`\`\`
livrais/
├── mobile/                    # Application React Native
│   ├── src/
│   │   ├── screens/          # Écrans de l'app
│   │   ├── components/       # Composants réutilisables
│   │   ├── services/         # Services API
│   │   ├── store/            # State management (Zustand)
│   │   ├── constants/        # Constantes et config
│   │   ├── utils/            # Utilitaires
│   │   └── navigation/       # Navigation
│   ├── __tests__/           # Tests unitaires
│   └── package.json
├── supabase/
│   ├── migrations/          # Migrations SQL
│   └── functions/           # Edge Functions
└── docs/                    # Documentation
\`\`\`

## 🗺️ Architecture

### Frontend
- **React Native** 0.73.2 + **Expo** SDK 50
- **TypeScript** 5.3.3 (100% coverage)
- **Zustand** pour la gestion d'état
- **React Navigation** pour la navigation
- **React Native Maps** pour les cartes

### Backend
- **Supabase** (PostgreSQL + PostGIS)
- **Row Level Security** sur toutes les tables
- **Realtime** pour les mises à jour en temps réel
- **Edge Functions** (Deno) pour la logique serveur

### Paiements
- **Stripe Connect** (comptes Express)
- Commission: **15% + 0,99€** (min 1,50€)
- **0% commission** sur les pourboires

## 💰 Coûts estimés

### Phase MVP (500 utilisateurs)
- **Supabase Pro**: 25$/mois
- **Stripe fees**: ~80$/mois (variable)
- **Expo Push**: Gratuit (< 600k notifications/mois)
- **Total**: ~110$/mois

### Phase Croissance (5000 utilisateurs)
- **Supabase Pro**: 25$/mois
- **Stripe fees**: ~800$/mois
- **Expo Push**: Gratuit
- **Total**: ~830$/mois

## 🔒 Sécurité

- ✅ Chiffrement HTTPS/TLS sur toutes les communications
- ✅ Mots de passe hashés (bcrypt)
- ✅ Tokens JWT avec expiration
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Données bancaires gérées par Stripe (PCI DSS)
- ✅ Validation côté client et serveur
- ✅ Rate limiting sur les API
- ✅ CORS configuré

## 🧭 Roadmap

### ✅ Phase 1 - MVP (Q1 2025)
- [x] Authentification
- [x] Création de demandes
- [x] Acceptation et suivi
- [x] Paiements Stripe
- [x] Notifications push
- [x] GPS tracking
- [x] Système de notation
- [x] Historique
- [x] Favoris
- [x] FAQ et support

### 🚧 Phase 2 - UX (Q2 2025)
- [ ] Chat en temps réel
- [ ] Upload de photos de colis
- [ ] Assurance optionnelle
- [ ] Programme de fidélité
- [ ] Notifications SMS

### 🔮 Phase 3 - Scale (Q3-Q4 2025)
- [ ] App web (PWA)
- [ ] API publique
- [ ] Tableaux de bord analytics
- [ ] Programme d'affiliation
- [ ] Expansion Antilles

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche (\`git checkout -b feature/AmazingFeature\`)
3. Commit les changements (\`git commit -m 'Add AmazingFeature'\`)
4. Push vers la branche (\`git push origin feature/AmazingFeature\`)
5. Ouvrir une Pull Request

## 📄 License

Copyright © 2024 Livrais. Tous droits réservés.

## 📞 Support

- **Email**: support@livrais.gf
- **Téléphone**: +594 694 XX XX XX
- **GitHub Issues**: https://github.com/Elpadrino971/livrais/issues

## 🙏 Remerciements

- Communauté Expo
- Équipe Supabase
- Stripe pour les outils de paiement
- Tous les contributeurs

---

Fait avec ❤️ en Guyane française
