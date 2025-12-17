# GuyaneConnect - Plateforme de Livraison Collaborative

## Problème Original
Créer une plateforme de livraison collaborative pour la Guyane française permettant :
- Aux clients d'envoyer/livrer des produits volumineux ou courses
- Aux particuliers proches de proposer leur aide contre rémunération
- À la plateforme de prendre une commission (15%)

## Choix Utilisateur
- **Authentification** : Non pour le MVP
- **Paiement** : Stripe (clé test)
- **Cartes** : OpenStreetMap
- **Notifications** : Préparées pour Firebase (simulation frontend)
- **Thème** : Automatique (clair/sombre selon système)
- **Langues** : FR, EN, ES, PT, ZH

## Architecture Réalisée

### Backend (FastAPI + MongoDB)
- **Models** : DeliveryRequest, Deliverer, ChatMessage, Rating, PaymentTransaction, Notification
- **API Endpoints** :
  - `/api/requests` - CRUD demandes de livraison
  - `/api/deliverers` - Gestion des livreurs
  - `/api/chat` - Messagerie
  - `/api/ratings` - Système de notation
  - `/api/payments` - Stripe checkout avec commission
  - `/api/estimate-price` - Estimation de prix basée sur distance
  - `/api/notifications` - Notifications

### Frontend (React + Tailwind + Shadcn)
- **Pages** : Home, CreateRequest, RequestDetail, DelivererMode, History, Settings, PaymentSuccess
- **Composants** : Map (Leaflet), RequestCard, DelivererCard, BottomNav
- **i18n** : Support 5 langues
- **Design** : "Tropical Utility" - Jungle Deep (#064E3B), Rocou (#F59E0B)

## Fonctionnalités Implémentées
✅ Carte interactive avec livreurs/demandes
✅ Création de demande en 3 étapes
✅ Sélection de lieu sur carte
✅ Estimation automatique du prix
✅ Mode livreur (inscription, statut, annonce trajet)
✅ Acceptation de demande
✅ Chat intégré
✅ Système de notation
✅ Paiement Stripe avec commission 15%
✅ Historique des demandes
✅ Paramètres (langue, thème, notifications)
✅ Design mobile-first responsive

## Fonctionnalités Ajoutées (Phase 2)
✅ **Recherche d'adresse** avec autocomplétion OpenStreetMap Nominatim
✅ **Upload photo produit** avec drag & drop
✅ **Panneau de notifications** avec badge et panneau latéral
✅ **Suivi GPS temps réel** avec page de tracking dédiée
✅ **API de tracking** pour mise à jour position livreur

## Prochaines Étapes
1. **Firebase Push Notifications** : Intégrer FCM pour notifications réelles sur mobile
2. **Authentification** : Ajouter Google OAuth / email pour sécuriser les comptes
3. **Vérification identité** : KYC pour les livreurs (confiance)
4. **Stripe Connect** : Paiements directs aux livreurs (actuellement simulé)
5. **Système d'assurance** : Option assurance pour livraisons lourdes
