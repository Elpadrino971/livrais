# Documentation API - Livrais

Cette documentation décrit les principales opérations de l'API Supabase utilisées par l'application.

## Base de données

### Tables principales

#### `profiles`
Profils utilisateurs étendant `auth.users`

```typescript
interface Profile {
  id: string;              // UUID de l'utilisateur
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  city?: string;
  bio?: string;
  is_verified: boolean;    // Identité vérifiée
  is_premium: boolean;     // Compte premium
  rating: number;          // Note moyenne (0-5)
  total_ratings: number;   // Nombre d'avis
  total_deliveries: number;
  total_requests: number;
  stripe_customer_id?: string;
  stripe_account_id?: string;
  created_at: string;
  updated_at: string;
}
```

#### `delivery_requests`
Demandes de livraison

```typescript
interface DeliveryRequest {
  id: string;
  user_id: string;
  type: 'heavy_item' | 'groceries' | 'package' | 'carpool';
  title: string;
  description?: string;
  pickup_location: { latitude: number; longitude: number };
  pickup_address: string;
  delivery_location: { latitude: number; longitude: number };
  delivery_address: string;
  photos?: string[];
  price: number;
  vehicle_type_required?: 'car' | 'van' | 'pickup' | 'truck' | 'motorcycle';
  needs_two_people: boolean;
  preferred_datetime?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
```

#### `deliveries`
Livraisons acceptées

```typescript
interface Delivery {
  id: string;
  request_id: string;
  deliverer_id: string;
  customer_id: string;
  status: 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  accepted_at: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  current_location?: { latitude: number; longitude: number };
  stripe_payment_intent_id?: string;
  total_amount: number;
  platform_fee: number;
  deliverer_amount: number;
  created_at: string;
  updated_at: string;
}
```

## Opérations CRUD

### Profils

#### Récupérer le profil de l'utilisateur connecté

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

#### Mettre à jour le profil

```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'Jean Dupont',
    city: 'Cayenne',
    bio: 'Livreur expérimenté',
  })
  .eq('id', user.id);
```

### Demandes de livraison

#### Créer une demande

```typescript
const { data, error } = await supabase
  .from('delivery_requests')
  .insert({
    user_id: user.id,
    type: 'heavy_item',
    title: 'Livraison réfrigérateur',
    description: 'Réfrigérateur neuf à livrer',
    pickup_location: 'POINT(-52.3333 4.9333)',
    pickup_address: 'Cayenne Centre',
    delivery_location: 'POINT(-52.2833 4.8833)',
    delivery_address: 'Matoury',
    price: 50.00,
    needs_two_people: true,
  })
  .select()
  .single();
```

#### Rechercher les demandes à proximité

```typescript
const { data, error } = await supabase.rpc('get_nearby_requests', {
  user_lat: 4.9333,
  user_lng: -52.3333,
  radius_km: 10,
});
```

#### Récupérer mes demandes

```typescript
const { data, error } = await supabase
  .from('delivery_requests')
  .select('*, user:profiles(*)')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

### Livraisons

#### Accepter une demande

```typescript
// 1. Créer la livraison
const { data: delivery, error } = await supabase
  .from('deliveries')
  .insert({
    request_id: requestId,
    deliverer_id: user.id,
    customer_id: customerId,
    total_amount: 50.00,
    platform_fee: 8.49,    // 15% + 0.99€
    deliverer_amount: 41.51,
  })
  .select()
  .single();

// 2. Mettre à jour le statut de la demande
await supabase
  .from('delivery_requests')
  .update({ status: 'accepted' })
  .eq('id', requestId);
```

#### Mettre à jour le statut

```typescript
const { error } = await supabase
  .from('deliveries')
  .update({
    status: 'in_progress',
    started_at: new Date().toISOString(),
  })
  .eq('id', deliveryId);
```

#### Suivre la position en temps réel

```typescript
const { error } = await supabase
  .from('deliveries')
  .update({
    current_location: 'POINT(-52.3000 4.9000)',
  })
  .eq('id', deliveryId);
```

#### Récupérer mes livraisons

```typescript
const { data, error } = await supabase
  .from('deliveries')
  .select(`
    *,
    request:delivery_requests(*),
    deliverer:profiles!deliverer_id(*),
    customer:profiles!customer_id(*)
  `)
  .or(`deliverer_id.eq.${user.id},customer_id.eq.${user.id}`)
  .order('created_at', { ascending: false });
```

### Notifications

#### Créer une notification

```typescript
const { error } = await supabase
  .from('notifications')
  .insert({
    user_id: targetUserId,
    title: 'Nouvelle demande',
    message: 'Une demande a été créée près de vous',
    type: 'new_request',
    related_id: requestId,
  });
```

#### Récupérer les notifications non lues

```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user.id)
  .eq('is_read', false)
  .order('created_at', { ascending: false });
```

#### Marquer comme lue

```typescript
const { error } = await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId);
```

### Avis et notes

#### Créer un avis

```typescript
const { error } = await supabase
  .from('ratings')
  .insert({
    delivery_id: deliveryId,
    rater_id: user.id,
    rated_id: delivererId,
    rating: 5,
    comment: 'Excellent service !',
  });
```

#### Récupérer les avis d'un utilisateur

```typescript
const { data, error } = await supabase
  .from('ratings')
  .select('*, rater:profiles!rater_id(*)')
  .eq('rated_id', userId)
  .order('created_at', { ascending: false });
```

### Chat

#### Envoyer un message

```typescript
const { error } = await supabase
  .from('messages')
  .insert({
    delivery_id: deliveryId,
    sender_id: user.id,
    content: 'J\'arrive dans 5 minutes',
  });
```

#### Récupérer les messages d'une livraison

```typescript
const { data, error } = await supabase
  .from('messages')
  .select('*, sender:profiles(*)')
  .eq('delivery_id', deliveryId)
  .order('created_at', { ascending: true });
```

#### Écouter les nouveaux messages (temps réel)

```typescript
const channel = supabase
  .channel(`messages:${deliveryId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `delivery_id=eq.${deliveryId}`,
    },
    (payload) => {
      console.log('Nouveau message:', payload.new);
    }
  )
  .subscribe();
```

### Covoiturage

#### Créer un trajet

```typescript
const { data, error } = await supabase
  .from('carpools')
  .insert({
    driver_id: user.id,
    departure_location: 'POINT(-52.3333 4.9333)',
    departure_address: 'Cayenne',
    arrival_location: 'POINT(-54.0333 5.5)',
    arrival_address: 'Saint-Laurent-du-Maroni',
    departure_time: '2024-01-15T08:00:00Z',
    available_seats: 3,
    price_per_seat: 30.00,
    description: 'Trajet tranquille',
  })
  .select()
  .single();
```

#### Réserver une place

```typescript
const { data, error } = await supabase
  .from('carpool_bookings')
  .insert({
    carpool_id: carpoolId,
    passenger_id: user.id,
    seats_booked: 1,
    amount: 30.00,
  })
  .select()
  .single();
```

## Edge Functions

### get-nearby-requests

Recherche les demandes de livraison à proximité.

**Endpoint**: `https://[project-ref].supabase.co/functions/v1/get-nearby-requests`

**Méthode**: POST

**Body**:
```json
{
  "user_lat": 4.9333,
  "user_lng": -52.3333,
  "radius_km": 20
}
```

**Réponse**:
```json
[
  {
    "id": "uuid",
    "title": "Livraison réfrigérateur",
    "price": 50.00,
    "distance_km": 3.2,
    ...
  }
]
```

### notify-nearby-deliverers

Notifie les livreurs à proximité d'une nouvelle demande.

**Endpoint**: `https://[project-ref].supabase.co/functions/v1/notify-nearby-deliverers`

**Méthode**: POST

**Body**:
```json
{
  "request_id": "uuid",
  "latitude": 4.9333,
  "longitude": -52.3333,
  "radius_km": 10
}
```

**Réponse**:
```json
{
  "success": true,
  "notified_count": 5
}
```

## Temps réel (Realtime)

### Écouter les nouvelles demandes

```typescript
const channel = supabase
  .channel('delivery_requests')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'delivery_requests',
    },
    (payload) => {
      console.log('Nouvelle demande:', payload.new);
    }
  )
  .subscribe();
```

### Écouter les mises à jour de livraison

```typescript
const channel = supabase
  .channel(`delivery:${deliveryId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'deliveries',
      filter: `id=eq.${deliveryId}`,
    },
    (payload) => {
      console.log('Mise à jour:', payload.new);
    }
  )
  .subscribe();
```

## Sécurité (Row Level Security)

Toutes les tables utilisent RLS. Les politiques principales :

- **Profiles**: Lecture publique, modification uniquement par le propriétaire
- **Delivery Requests**: Lecture des demandes en attente, modification par le créateur
- **Deliveries**: Lecture/modification uniquement par le client ou le livreur
- **Messages**: Lecture/écriture uniquement par les participants de la livraison
- **Notifications**: Lecture/modification uniquement par le destinataire

## Limites et quotas

- **Supabase gratuit**: 500 MB stockage, 2 GB transfert/mois
- **Stripe test**: Illimité
- **Google Maps**: 28,000 requêtes/mois gratuites

Pour la production, prévoyez un upgrade des plans.
