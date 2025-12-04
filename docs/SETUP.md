# Guide de Configuration - Livrais

Ce guide vous accompagne dans la configuration complète de la plateforme Livrais.

## Prérequis

- Node.js 18+ et npm
- Compte Supabase (gratuit)
- Compte Stripe (mode test gratuit)
- Compte Google Cloud (pour Maps API)
- Expo CLI : `npm install -g expo-cli`

## 1. Configuration Supabase

### 1.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **URL du projet** et **clé anon**

### 1.2 Configurer la base de données

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier votre projet
supabase link --project-ref YOUR_PROJECT_REF

# Appliquer les migrations
supabase db push
```

Ou manuellement dans l'interface Supabase :
1. Allez dans **SQL Editor**
2. Copiez le contenu de `supabase/migrations/20231204000000_initial_schema.sql`
3. Exécutez la requête

### 1.3 Activer l'extension PostGIS

Dans le SQL Editor de Supabase :

```sql
CREATE EXTENSION IF NOT EXISTS "postgis";
```

### 1.4 Configurer l'authentification

1. Allez dans **Authentication** > **Providers**
2. Activez **Email**
3. (Optionnel) Configurez **Google** et **Apple Sign-In**

### 1.5 Configurer le stockage

1. Allez dans **Storage**
2. Créez un bucket nommé `avatars` (public)
3. Créez un bucket nommé `delivery-photos` (public)

### 1.6 Déployer les Edge Functions

```bash
cd supabase/functions

# Déployer la fonction de recherche géographique
supabase functions deploy get-nearby-requests

# Déployer la fonction de notification
supabase functions deploy notify-nearby-deliverers
```

## 2. Configuration Stripe

### 2.1 Créer un compte Stripe

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Activez **Stripe Connect**
3. Notez vos clés API (mode test)

### 2.2 Configurer Stripe Connect

1. Allez dans **Connect** > **Settings**
2. Configurez votre plateforme
3. Définissez les **commission rates**
4. Activez **Express accounts** pour les livreurs

## 3. Configuration Google Maps

### 3.1 Créer un projet Google Cloud

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet
3. Activez les APIs suivantes :
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Geocoding API
   - Geolocation API

### 3.2 Créer une clé API

1. Allez dans **APIs & Services** > **Credentials**
2. Créez une clé API
3. Restreignez la clé aux APIs activées
4. Notez votre clé API

## 4. Configuration de l'application mobile

### 4.1 Installer les dépendances

```bash
cd mobile
npm install
```

### 4.2 Configurer les variables d'environnement

Créez un fichier `.env` dans `mobile/` :

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre-clé
STRIPE_SECRET_KEY=sk_test_votre-clé-secrète

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=votre-clé-google-maps

# Configuration
EXPO_PUBLIC_COMMISSION_RATE=0.15
EXPO_PUBLIC_SERVICE_FEE=0.99
```

### 4.3 Configurer app.json

Modifiez `mobile/app.json` :

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "VOTRE_CLE_GOOGLE_MAPS"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "VOTRE_CLE_GOOGLE_MAPS"
        }
      }
    }
  }
}
```

## 5. Démarrer l'application

### 5.1 Mode développement

```bash
cd mobile
npm start
```

Options :
- Appuyez sur `i` pour iOS (nécessite macOS + Xcode)
- Appuyez sur `a` pour Android (nécessite Android Studio)
- Scannez le QR code avec Expo Go

### 5.2 Tester sur un appareil physique

1. Installez **Expo Go** depuis l'App Store ou Google Play
2. Scannez le QR code affiché dans le terminal
3. L'app se rechargera automatiquement lors des modifications

## 6. Tests et débogage

### 6.1 Vérifier la connexion Supabase

```bash
# Dans mobile/
npx expo start
```

Dans l'app, essayez de vous inscrire. Si aucune erreur n'apparaît, la connexion fonctionne.

### 6.2 Vérifier la géolocalisation

Autorisez l'accès à la position et vérifiez que la carte s'affiche correctement.

### 6.3 Logs

```bash
# Voir les logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

## 7. Données de test

### 7.1 Créer des utilisateurs de test

Inscrivez-vous avec plusieurs comptes email pour tester :
- `client@test.com` (client)
- `livreur@test.com` (livreur)

### 7.2 Créer des demandes de test

1. Connectez-vous avec `client@test.com`
2. Créez une demande de livraison
3. Connectez-vous avec `livreur@test.com`
4. Acceptez la demande

## 8. Déploiement

### 8.1 Build Android

```bash
cd mobile
eas build --platform android
```

### 8.2 Build iOS

```bash
cd mobile
eas build --platform ios
```

### 8.3 Publication

```bash
# Soumettre à Google Play
eas submit --platform android

# Soumettre à l'App Store
eas submit --platform ios
```

## 9. Troubleshooting

### Problème : L'app ne se connecte pas à Supabase

**Solution** : Vérifiez que les variables d'environnement sont correctes dans `.env`

### Problème : La carte ne s'affiche pas

**Solution** :
1. Vérifiez que la clé Google Maps est correcte
2. Assurez-vous que les APIs Maps sont activées
3. Vérifiez les permissions de géolocalisation

### Problème : Les notifications ne fonctionnent pas

**Solution** :
1. Testez sur un appareil physique (pas dans le simulateur)
2. Vérifiez les permissions de notification
3. Consultez les logs Expo

## 10. Support

Pour toute question :
- Documentation Supabase : [supabase.com/docs](https://supabase.com/docs)
- Documentation Expo : [docs.expo.dev](https://docs.expo.dev)
- Documentation Stripe : [stripe.com/docs](https://stripe.com/docs)

## Prochaines étapes

Une fois la configuration terminée :
1. Testez toutes les fonctionnalités principales
2. Ajoutez des données de test
3. Invitez des beta testeurs
4. Collectez les retours
5. Itérez !

Bon développement ! 🚀
