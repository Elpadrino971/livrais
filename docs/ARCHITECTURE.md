# Architecture Technique - Livrais

Ce document décrit l'architecture complète de la plateforme Livrais.

## Vue d'ensemble

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────────────────────────┐
│         Supabase Backend            │
│                                     │
│  ┌──────────┐  ┌────────────────┐  │
│  │   Auth   │  │   PostgreSQL   │  │
│  └──────────┘  │   + PostGIS    │  │
│                └────────────────┘  │
│  ┌──────────┐  ┌────────────────┐  │
│  │ Storage  │  │ Edge Functions │  │
│  └──────────┘  └────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │    Realtime (WebSocket)      │  │
│  └──────────────────────────────┘  │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Services externes  │
│  - Stripe Connect   │
│  - Google Maps      │
│  - Expo Push        │
└─────────────────────┘
```

## Frontend (Mobile)

### Stack technique

- **React Native** : Framework mobile multiplateforme
- **Expo** : Outils de développement et déploiement
- **TypeScript** : Typage statique
- **React Navigation** : Navigation entre écrans
- **Zustand** : State management léger
- **React Native Maps** : Cartes interactives

### Structure des dossiers

```
mobile/src/
├── screens/          # Écrans de l'application
│   ├── AuthScreen.tsx
│   ├── HomeScreen.tsx
│   ├── MapScreen.tsx
│   └── ProfileScreen.tsx
├── components/       # Composants réutilisables
│   ├── DeliveryCard.tsx
│   ├── MapMarker.tsx
│   └── ChatBubble.tsx
├── navigation/       # Configuration de navigation
│   └── RootNavigator.tsx
├── services/         # Services API
│   ├── supabase.ts
│   ├── location.ts
│   ├── notifications.ts
│   └── stripe.ts
├── store/           # State management
│   ├── useAuthStore.ts
│   ├── useLocationStore.ts
│   └── useDeliveryStore.ts
├── types/           # Types TypeScript
│   └── database.ts
└── utils/           # Fonctions utilitaires
    ├── distance.ts
    └── formatters.ts
```

### Flux de données

```
User Action
    ↓
Component
    ↓
Store (Zustand)
    ↓
Service (Supabase)
    ↓
Backend
    ↓
Update Store
    ↓
Re-render Component
```

### State Management

Utilisation de **Zustand** pour 3 stores principaux :

1. **AuthStore** : Authentification et profil utilisateur
2. **LocationStore** : Géolocalisation en temps réel
3. **DeliveryStore** : Demandes et livraisons

### Optimisations

- **Lazy loading** des écrans
- **Memoization** avec `React.memo`
- **Virtualisation** des listes avec `FlatList`
- **Cache images** avec Fast Image
- **Debounce** des recherches géographiques

## Backend (Supabase)

### Base de données PostgreSQL

#### Extensions

- **PostGIS** : Calculs géographiques
- **uuid-ossp** : Génération d'UUIDs

#### Tables principales

```sql
profiles                 -- Profils utilisateurs
delivery_requests        -- Demandes de livraison
deliveries              -- Livraisons en cours
ratings                 -- Avis et notes
messages                -- Chat
notifications           -- Notifications
deliverer_availability  -- Disponibilité des livreurs
carpools                -- Trajets covoiturage
carpool_bookings        -- Réservations covoiturage
```

#### Indexes

- **GiST indexes** sur les colonnes géographiques
- **B-tree indexes** sur les clés étrangères
- **Partial indexes** sur les statuts

### Row Level Security (RLS)

Toutes les tables utilisent RLS pour sécuriser les données :

```sql
-- Exemple : Les utilisateurs peuvent voir les demandes en attente
CREATE POLICY "view_pending_requests"
ON delivery_requests FOR SELECT
USING (status = 'pending' OR user_id = auth.uid());
```

### Edge Functions

#### get-nearby-requests

Recherche les demandes de livraison à proximité en utilisant PostGIS.

```typescript
// Utilise ST_DWithin pour la recherche géographique
SELECT * FROM delivery_requests
WHERE ST_DWithin(
  pickup_location::geography,
  ST_MakePoint(lng, lat)::geography,
  radius_km * 1000
)
```

#### notify-nearby-deliverers

Notifie les livreurs disponibles à proximité d'une nouvelle demande.

```typescript
// 1. Trouve les livreurs à proximité
// 2. Crée des notifications en base
// 3. Envoie des push notifications via Expo
```

### Triggers et Functions

#### update_updated_at_column

Met à jour automatiquement `updated_at` lors des modifications.

```sql
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### update_profile_rating

Met à jour la note moyenne d'un profil après un nouvel avis.

```sql
CREATE TRIGGER update_rating_on_insert
AFTER INSERT ON ratings
FOR EACH ROW EXECUTE FUNCTION update_profile_rating();
```

#### handle_new_user

Crée automatiquement un profil lors de l'inscription.

```sql
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Realtime

Utilisation des **Postgres Changes** pour les mises à jour en temps réel :

```typescript
// Écouter les nouveaux messages
supabase
  .channel('messages')
  .on('postgres_changes',
    { event: 'INSERT', table: 'messages' },
    handleNewMessage
  )
  .subscribe();
```

## Services externes

### Stripe Connect

#### Architecture

```
Client → Plateforme → Stripe Connect → Livreur
         (15% + 0.99€)
```

#### Flux de paiement

1. Client crée une demande avec un prix
2. Livreur accepte la demande
3. **Payment Intent** créé via Stripe
4. Paiement effectué
5. Commission prélevée automatiquement
6. Montant transféré au livreur

#### Configuration

- **Express Accounts** pour les livreurs (onboarding simplifié)
- **Application Fee** pour les commissions
- **Payouts** automatiques vers les comptes livreurs

### Google Maps

#### APIs utilisées

- **Maps SDK** : Affichage de cartes
- **Places API** : Recherche d'adresses
- **Geocoding API** : Conversion adresse ↔ coordonnées
- **Geolocation API** : Position de l'utilisateur

#### Optimisations

- **Clustering** des markers pour les performances
- **Debounce** des recherches
- **Cache** des géocodages
- **Static Maps** pour les miniatures

### Expo Push Notifications

#### Flux

1. App demande le token Expo
2. Token sauvegardé dans le profil
3. Notification créée en base
4. Edge Function envoie via Expo Push API
5. Notification affichée sur l'appareil

#### Types de notifications

- `new_request` : Nouvelle demande à proximité
- `request_accepted` : Demande acceptée
- `delivery_started` : Livraison commencée
- `delivery_completed` : Livraison terminée
- `new_message` : Nouveau message dans le chat

## Sécurité

### Authentification

- **JWT tokens** via Supabase Auth
- **Refresh tokens** automatiques
- **Secure storage** des tokens

### Protection des données

- **RLS** sur toutes les tables
- **HTTPS** obligatoire
- **Validation** des entrées côté serveur
- **Sanitization** des données utilisateur

### Conformité RGPD

- **Consentement** explicite
- **Droit à l'oubli** : Suppression de compte
- **Export des données** personnelles
- **Anonymisation** des données supprimées

## Performance

### Base de données

- **Connection pooling** via Supabase
- **Prepared statements**
- **Indexes** optimisés
- **Partitioning** pour les grandes tables (futur)

### Application mobile

- **Code splitting** avec Metro
- **Image optimization** avec Fast Image
- **Lazy loading** des composants
- **Virtualization** des listes

### Caching

- **React Query** pour le cache API (futur)
- **AsyncStorage** pour les données locales
- **Redis** pour le cache serveur (production)

## Monitoring et Logs

### Supabase

- **Postgres logs** dans le dashboard
- **Edge Function logs** en temps réel
- **Metrics** d'utilisation

### Expo

- **Error tracking** avec Sentry (à configurer)
- **Analytics** avec Expo Analytics
- **Crash reports**

### Stripe

- **Dashboard Stripe** pour les paiements
- **Webhooks** pour les événements
- **Logs** des transactions

## Scalabilité

### Actuellement (MVP)

- **500 utilisateurs** simultanés
- **10,000 demandes/mois**
- **5,000 livraisons/mois**

### Optimisations futures

1. **CDN** pour les assets (Cloudflare)
2. **Redis** pour le cache
3. **Database replicas** pour la lecture
4. **Queue system** (Bull/BullMQ) pour les jobs
5. **Load balancing** avec Supabase Pro

## Déploiement

### Environnements

- **Development** : Local avec Expo Go
- **Staging** : TestFlight (iOS) + Internal Testing (Android)
- **Production** : App Store + Google Play

### CI/CD

```yaml
# Future: GitHub Actions workflow
- Run tests
- Build app (EAS Build)
- Deploy Edge Functions
- Run migrations
- Deploy to stores
```

## Coûts estimés

### MVP (gratuit / <50€/mois)

- Supabase : Gratuit
- Stripe : Gratuit (mode test)
- Google Maps : Gratuit (<28k requêtes/mois)
- Expo : Gratuit

### Production (500 utilisateurs)

- Supabase Pro : 25$/mois
- Stripe : 2.9% + 0.30€ par transaction
- Google Maps : ~50$/mois
- Expo EAS : 29$/mois
- **Total** : ~100-150€/mois

### Scale (10,000 utilisateurs)

- Supabase Team : 599$/mois
- Stripe : ~3% par transaction
- Google Maps : ~200$/mois
- Expo EAS : 99$/mois
- CDN : 20$/mois
- **Total** : ~1,000-1,500€/mois

## Évolutions futures

### Phase 2 (3-6 mois)

- [ ] Chat vocal
- [ ] Vidéo de vérification des produits
- [ ] Programme de fidélité
- [ ] Abonnement premium

### Phase 3 (6-12 mois)

- [ ] IA pour l'estimation des prix
- [ ] Routage optimisé pour plusieurs livraisons
- [ ] Application web (Next.js)
- [ ] API publique pour partenaires

### Expansion géographique

1. Martinique, Guadeloupe, Réunion
2. DOM-TOM complets
3. Zones rurales métropolitaines
4. International (Caraïbes, Afrique)
