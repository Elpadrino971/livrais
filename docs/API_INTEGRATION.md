# 🔑 Guide d'Intégration des APIs

Ce guide vous accompagne pour configurer les 3 systèmes critiques : **Stripe**, **Notifications Push**, et **GPS Tracking**.

---

## 1️⃣ Stripe Connect (Paiements)

### Étape 1 : Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Créez un compte
3. Activez **Stripe Connect**

### Étape 2 : Récupérer les clés API

1. Allez dans **Développeurs** > **Clés API**
2. Copiez :
   - **Clé publiable** : `pk_test_...`
   - **Clé secrète** : `sk_test_...`

### Étape 3 : Configurer l'environnement

Ajoutez dans `mobile/.env` :
```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_ici
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
```

Et dans Supabase Dashboard > **Edge Functions** > **Secrets** :
```
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
```

### Étape 4 : Activer Stripe Connect

1. Dans Stripe Dashboard, allez dans **Connect** > **Settings**
2. Activez **Express accounts**
3. Configurez les paramètres :
   - Type : **Express**
   - Pays : **France** (pour la Guyane)
   - Devise : **EUR**

### Étape 5 : Déployer les Edge Functions

```bash
cd supabase/functions

# Déployer les fonctions Stripe
supabase functions deploy create-stripe-account
supabase functions deploy create-payment-intent
supabase functions deploy create-account-link
```

### Étape 6 : Tester

```typescript
import { createConnectedAccount } from '@/services/stripe';

// Créer un compte pour un livreur
const accountId = await createConnectedAccount(
  userId,
  'livreur@example.com',
  '+594694123456'
);

console.log('Account ID:', accountId);
```

### Webhooks Stripe (optionnel mais recommandé)

1. Dans Stripe Dashboard > **Développeurs** > **Webhooks**
2. Ajoutez un endpoint : `https://votre-projet.supabase.co/functions/v1/stripe-webhook`
3. Écoutez les événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`

---

## 2️⃣ Notifications Push (Expo)

### Étape 1 : Créer un projet Expo

```bash
cd mobile
npx expo login
npx eas init
```

Notez votre **Project ID** (dans `app.json` > `extra.eas.projectId`)

### Étape 2 : Configurer l'environnement

Ajoutez dans `mobile/.env` :
```env
EXPO_PUBLIC_EAS_PROJECT_ID=votre-project-id
```

### Étape 3 : Configurer les permissions

#### iOS (dans `app.json`)
```json
{
  "ios": {
    "infoPlist": {
      "NSUserTrackingUsageDescription": "Cette app a besoin d'accéder à votre localisation pour les livraisons.",
      "NSLocationWhenInUseUsageDescription": "Nous utilisons votre position pour afficher les demandes à proximité.",
      "NSLocationAlwaysAndWhenInUseUsageDescription": "Nous suivons votre position pendant les livraisons."
    }
  }
}
```

#### Android (dans `app.json`)
```json
{
  "android": {
    "permissions": [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "FOREGROUND_SERVICE",
      "POST_NOTIFICATIONS"
    ]
  }
}
```

### Étape 4 : Enregistrer l'appareil

Dans `App.tsx` :
```typescript
import { useEffect } from 'react';
import { registerForPushNotifications, savePushToken } from '@/services/pushNotifications';
import { useAuthStore } from '@/store/useAuthStore';

function App() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      registerForPushNotifications().then((token) => {
        if (token) {
          savePushToken(user.id, token);
        }
      });
    }
  }, [user]);

  // ...
}
```

### Étape 5 : Déployer l'Edge Function

```bash
supabase functions deploy send-push-notification
```

### Étape 6 : Tester

```typescript
import { sendPushNotification } from '@/services/pushNotifications';

// Envoyer une notification
await sendPushNotification(
  userId,
  'Nouvelle demande !',
  'Une demande de livraison est disponible près de vous',
  { type: 'new_request', request_id: 'xxx' }
);
```

### Tester localement

1. Installez l'app Expo Go
2. Scannez le QR code
3. Acceptez les permissions
4. Envoyez une notification de test depuis le dashboard Expo

---

## 3️⃣ GPS Tracking

### Étape 1 : Configurer les permissions

Déjà fait dans l'étape 2️⃣ ci-dessus.

### Étape 2 : Activer le tracking

**Pour le livreur** (quand il accepte une livraison) :
```typescript
import { startLocationTracking } from '@/services/gpsTracking';

// Démarrer le tracking
const success = await startLocationTracking(deliveryId);

if (!success) {
  Alert.alert('Erreur', 'Impossible de démarrer le suivi GPS');
}
```

**Pour arrêter** (quand la livraison est terminée) :
```typescript
import { stopLocationTracking } from '@/services/gpsTracking';

await stopLocationTracking();
```

### Étape 3 : Afficher en temps réel

**Pour le client** (suivre le livreur) :
```typescript
import { subscribeToDeliveryLocation } from '@/services/gpsTracking';

useEffect(() => {
  const unsubscribe = subscribeToDeliveryLocation(deliveryId, (location) => {
    console.log('Position du livreur:', location);
    // Mettre à jour la carte
  });

  return () => unsubscribe();
}, [deliveryId]);
```

### Étape 4 : Tester

1. Acceptez une livraison (mode livreur)
2. Le tracking démarre automatiquement
3. Ouvrez l'écran de suivi (mode client)
4. La position se met à jour en temps réel

---

## ✅ Checklist finale

### Stripe
- [ ] Compte Stripe créé
- [ ] Clés API copiées dans `.env`
- [ ] Stripe Connect activé (Express)
- [ ] Edge Functions déployées
- [ ] Test de création de compte
- [ ] Test de paiement

### Notifications Push
- [ ] Projet EAS créé
- [ ] Project ID dans `app.json`
- [ ] Permissions configurées
- [ ] Token enregistré dans profil
- [ ] Edge Function déployée
- [ ] Test de notification

### GPS Tracking
- [ ] Permissions configurées
- [ ] Test tracking en foreground
- [ ] Test tracking en background
- [ ] Test temps réel Supabase
- [ ] Calcul ETA fonctionnel

---

## 🧪 Tests complets

### Test 1 : Créer un compte livreur Stripe

```bash
# Dans Supabase SQL Editor
SELECT
  id,
  email,
  stripe_account_id,
  created_at
FROM profiles
WHERE stripe_account_id IS NOT NULL;
```

### Test 2 : Vérifier les tokens push

```bash
# Dans Supabase SQL Editor
SELECT
  id,
  full_name,
  push_token,
  created_at
FROM profiles
WHERE push_token IS NOT NULL;
```

### Test 3 : Voir les positions GPS

```bash
# Dans Supabase SQL Editor
SELECT
  id,
  status,
  current_location,
  ST_AsText(current_location::geometry) as location_text,
  updated_at
FROM deliveries
WHERE current_location IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;
```

---

## 🐛 Dépannage

### Stripe : "Invalid API Key"
**Solution** : Vérifiez que la clé secrète est bien dans les secrets Supabase :
```bash
supabase secrets list
```

### Notifications : "No push token"
**Solution** :
1. Vérifiez que l'appareil est physique (pas émulateur)
2. Vérifiez les permissions dans les paramètres
3. Relancez l'app

### GPS : "Permission refusée"
**Solution** :
1. Android : Paramètres > Apps > Livrais > Autorisations > Position > Toujours autoriser
2. iOS : Réglages > Livrais > Position > Toujours

### GPS : "Background tracking ne fonctionne pas"
**Solution** :
1. Vérifiez que `foregroundService` est configuré (Android)
2. Vérifiez `NSLocationAlwaysAndWhenInUseUsageDescription` (iOS)
3. Rebuilder l'app avec `eas build`

---

## 📊 Monitoring

### Dashboard Stripe
- Paiements : [dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)
- Connect : [dashboard.stripe.com/connect/accounts](https://dashboard.stripe.com/connect/accounts)
- Logs : [dashboard.stripe.com/logs](https://dashboard.stripe.com/logs)

### Expo Push Notifications
- Dashboard : [expo.dev/notifications](https://expo.dev/notifications)
- Logs : Dans Supabase Edge Functions

### Supabase Realtime
- Dashboard : Supabase > Database > Realtime
- Channels actifs : Vérifier dans les logs

---

## 💰 Coûts

### Stripe
- Gratuit en mode test
- Production : 2.9% + 0.30€ par transaction
- Connect : Pas de frais supplémentaires

### Expo Push
- Gratuit jusqu'à 600,000 notifications/mois
- Au-delà : 1$/1000 notifications

### Supabase
- Gratuit : 500 MB stockage, 2 GB transfert
- Pro (25$/mois) : 8 GB stockage, 50 GB transfert

---

## 🚀 Prochaines étapes

1. **Tester en local** avec Expo Go
2. **Builder l'app** : `eas build --platform android --profile preview`
3. **Tester sur appareil réel** (Android/iOS)
4. **Lancer beta test** avec 20-30 utilisateurs
5. **Collecter feedback**
6. **Itérer et améliorer**

---

## 📞 Support

- **Stripe** : [stripe.com/support](https://stripe.com/support)
- **Expo** : [expo.dev/support](https://expo.dev/support)
- **Supabase** : [supabase.com/support](https://supabase.com/support)

---

**Dernière mise à jour** : Décembre 2024
**Version** : 1.0
