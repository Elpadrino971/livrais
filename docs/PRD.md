# 📋 PRD - Livrais
## Product Requirements Document

**Version** : 1.0
**Date** : Décembre 2024
**Statut** : En développement (MVP)
**Auteur** : Équipe Livrais

---

## Table des matières

1. [Vision du produit](#vision-du-produit)
2. [Problème](#problème)
3. [Solution](#solution)
4. [Public cible](#public-cible)
5. [Objectifs](#objectifs)
6. [Fonctionnalités](#fonctionnalités)
7. [User Stories](#user-stories)
8. [Exigences techniques](#exigences-techniques)
9. [Design et UX](#design-et-ux)
10. [Métriques de succès](#métriques-de-succès)
11. [Roadmap](#roadmap)
12. [Risques et mitigation](#risques-et-mitigation)

---

## Vision du produit

### Énoncé de vision

> **Livrais** est la première plateforme collaborative de livraison en Guyane qui connecte les particuliers ayant besoin de faire livrer des objets avec des livreurs particuliers disponibles à proximité, rendant la logistique accessible, économique et rapide pour tous.

### Proposition de valeur

**Pour les clients** :
- Livraison rapide et économique d'objets volumineux
- Prix transparents et négociables
- Livreurs de confiance avec système de notation
- Disponibilité 7j/7

**Pour les livreurs** :
- Source de revenus complémentaire flexible
- Liberté de choisir ses missions
- Paiements sécurisés et immédiats
- Interface simple et intuitive

**Pour la Guyane** :
- Amélioration de la logistique locale
- Création d'emplois flexibles
- Réduction des coûts de livraison
- Optimisation des trajets (covoiturage)

---

## Problème

### Contexte

La Guyane française fait face à des défis logistiques uniques :

1. **Distances importantes** : Territoire vaste (83,534 km²)
2. **Population dispersée** : 290,000 habitants sur un grand territoire
3. **Coûts de livraison élevés** : Peu de services professionnels
4. **Délais longs** : Livraisons qui prennent plusieurs jours
5. **Objets volumineux** : Difficile de transporter sans véhicule adapté

### Problèmes spécifiques

#### Pour les clients :
- ❌ "J'ai acheté un réfrigérateur mais je n'ai pas de camionnette"
- ❌ "Les professionnels demandent 150€ pour livrer à 15km"
- ❌ "Je dois attendre 3 jours pour une livraison"
- ❌ "Personne ne livre à Macouria/Roura/Saint-Laurent"

#### Pour les particuliers avec véhicule :
- ❌ "Je fais le trajet Cayenne-Kourou tous les jours à vide"
- ❌ "Je pourrais gagner de l'argent avec mes trajets quotidiens"
- ❌ "Je vais au supermarché, je pourrais livrer des courses"

---

## Solution

### Concept principal

**Marketplace collaborative** qui met en relation :
- Des **clients** ayant besoin de livrer quelque chose
- Des **livreurs particuliers** disponibles et proches géographiquement

### Fonctionnement simplifié

```
1. CLIENT crée une demande
   ↓
2. LIVREURS PROCHES reçoivent notification
   ↓
3. PREMIER qui accepte → Mission verrouillée
   ↓
4. LIVRAISON avec suivi GPS temps réel
   ↓
5. PAIEMENT automatique + Commission plateforme
   ↓
6. NOTATION mutuelle
```

### Différenciateurs

1. **Géolocalisation intelligente** : Notifications aux livreurs dans un rayon défini
2. **Prix négociables** : Flexibilité client-livreur
3. **Temps réel** : Suivi GPS en direct
4. **Covoiturage intégré** : Double usage de la plateforme
5. **Paiement sécurisé** : Via Stripe Connect
6. **Confiance** : Système de notation et vérification

---

## Public cible

### Segment primaire : Clients

**Profil démographique** :
- Âge : 25-55 ans
- Localisation : Villes principales de Guyane (Cayenne, Kourou, Saint-Laurent)
- CSP : Classes moyennes et populaires
- Équipement : Smartphone Android/iOS

**Besoins** :
- Livrer des objets volumineux (électroménager, meubles)
- Courses alimentaires pour personnes âgées/malades
- Colis entre particuliers
- Transport urgent de documents

**Comportements** :
- Utilisent régulièrement leur smartphone
- Actifs sur réseaux sociaux
- Sensibles au prix
- Recherchent la rapidité

### Segment secondaire : Livreurs

**Profil démographique** :
- Âge : 20-50 ans
- Localisation : Guyane (tous)
- Situation : Salariés, étudiants, indépendants
- Véhicule : Voiture, camionnette, pick-up

**Motivations** :
- Revenu complémentaire
- Flexibilité horaire
- Optimiser leurs trajets quotidiens
- Rendre service à la communauté

**Comportements** :
- Font régulièrement les mêmes trajets
- Disposent de temps libre
- Recherchent des revenus flexibles

### Segment tertiaire : Covoitureurs

**Profil** :
- Trajets longue distance réguliers (Cayenne ↔ Kourou, Saint-Laurent)
- Coûts d'essence élevés à partager
- Recherchent compagnie de voyage

---

## Objectifs

### Objectifs business (3 mois)

| Métrique | Objectif Q1 | Objectif Q2 | Objectif Q3 |
|----------|-------------|-------------|-------------|
| Utilisateurs inscrits | 500 | 2,000 | 5,000 |
| Livreurs actifs | 50 | 200 | 500 |
| Livraisons complétées | 100 | 500 | 1,500 |
| GMV (volume) | 5,000€ | 25,000€ | 75,000€ |
| Taux de conversion | 30% | 40% | 50% |
| Note moyenne | 4.0/5 | 4.3/5 | 4.5/5 |

### Objectifs utilisateurs

**Pour les clients** :
- Réduire les coûts de livraison de 50% vs professionnels
- Délai moyen < 2h pour livraisons locales
- Taux de satisfaction > 85%

**Pour les livreurs** :
- Revenu moyen 150€/mois
- 3-5 livraisons/semaine
- Flexibilité totale des horaires

### Objectifs stratégiques

1. **Phase 1 (Mois 1-3)** : Lancement Cayenne + Matoury
2. **Phase 2 (Mois 4-6)** : Extension Kourou + Remire-Montjoly
3. **Phase 3 (Mois 7-12)** : Toute la Guyane
4. **Phase 4 (An 2)** : Martinique, Guadeloupe, Réunion

---

## Fonctionnalités

### MVP (Priorité P0 - Critique)

#### 1. Authentification
- [x] Inscription email/mot de passe
- [x] Connexion
- [x] Mot de passe oublié
- [ ] Vérification email
- [ ] Connexion Google/Apple (P1)

#### 2. Profil utilisateur
- [x] Création profil
- [x] Photo de profil
- [x] Informations personnelles
- [x] Système de notation (affichage)
- [x] Historique
- [ ] Vérification d'identité (P1)

#### 3. Création de demande
- [x] Types de demande (colis, courses, objet lourd, covoiturage)
- [x] Point de départ / arrivée
- [x] Prix suggéré automatique
- [x] Prix négociable (oui/non + max)
- [x] Options (2 personnes, véhicule requis)
- [ ] Photos du produit (P1)
- [ ] Horaire préféré (P1)

#### 4. Géolocalisation
- [x] Localisation utilisateur
- [x] Carte interactive
- [x] Recherche géographique (PostGIS)
- [x] Calcul de distance
- [x] Rayon ajustable (5-50km)

#### 5. Matching et notifications
- [x] Notification des livreurs proches
- [x] Premier accepté = mission verrouillée
- [ ] Notifications push actives (P0 - En cours)
- [ ] Expiration automatique après 24h (P1)

#### 6. Négociation
- [x] Messages rapides prédéfinis
- [x] Proposition de prix alternatif
- [x] Acceptation/refus instantané
- [ ] Chat complet (P1)

#### 7. Paiements
- [ ] Intégration Stripe Connect (P0 - En cours)
- [ ] Paiement par carte
- [ ] Commission automatique (15% + 0.99€)
- [ ] Paiement livreur après livraison
- [ ] Pourboires optionnels
- [ ] Remboursements (P1)

#### 8. Suivi de livraison
- [x] Statuts (acceptée, en cours, terminée)
- [x] Barre de progression
- [x] ETA (temps d'arrivée estimé)
- [ ] GPS tracking temps réel (P0 - En cours)
- [x] Bouton "Appeler le livreur"

#### 9. Notation
- [x] Notation 1-5 étoiles
- [x] Critères rapides (ponctuel, sympathique, etc.)
- [x] Commentaire optionnel
- [x] Pourboire optionnel
- [x] Notation mutuelle

### Post-MVP (Priorité P1 - Important)

#### 10. Chat
- [ ] Messages texte temps réel
- [ ] Indicateur "en train d'écrire"
- [ ] Notifications de nouveaux messages
- [ ] Photos dans le chat

#### 11. Disponibilité livreur
- [x] Toggle "Mode livreur"
- [ ] Déclaration "Je vais faire des courses"
- [ ] Déclaration "Je fais un trajet"
- [ ] Notifications automatiques riverains

#### 12. Amélioration UX
- [ ] Filtres de recherche avancés
- [ ] Tri (prix, distance, date)
- [ ] Favoris / Sauvegardes
- [ ] Historique des adresses
- [ ] Mode sombre

#### 13. Sécurité
- [ ] Vérification identité (Stripe Identity)
- [ ] Badge "Identité vérifiée"
- [ ] Signalement d'utilisateur
- [ ] Blocage d'utilisateur
- [ ] Assistance 24/7

### Futures fonctionnalités (Priorité P2 - Nice to have)

#### 14. Programme de fidélité
- [ ] Points par livraison
- [ ] Badges (50, 100, 500 livraisons)
- [ ] Réductions pour bons livreurs
- [ ] Livreur du mois

#### 15. Social
- [ ] Partage sur réseaux sociaux
- [ ] Parrainage (5€ offerts)
- [ ] Profil public livreur
- [ ] Témoignages clients

#### 16. Business
- [ ] Comptes professionnels
- [ ] Facturation automatique
- [ ] API pour e-commerce
- [ ] Intégration magasins

---

## User Stories

### En tant que CLIENT

**US-1 : Créer une demande de livraison**
```
En tant que client,
Je veux créer une demande de livraison d'un réfrigérateur,
Afin de trouver quelqu'un pour le livrer chez moi.

Critères d'acceptation :
- Je peux choisir le type "Objet lourd"
- Je peux entrer l'adresse de départ et d'arrivée
- Le prix est calculé automatiquement
- Je peux cocher "2 personnes requises"
- Je peux choisir un véhicule spécifique (camionnette)
- Je reçois une confirmation après création
```

**US-2 : Recevoir des propositions**
```
En tant que client,
Je veux recevoir des notifications quand un livreur accepte ma demande,
Afin de savoir que ma livraison est prise en charge.

Critères d'acceptation :
- Je reçois une notification push
- Je vois le profil du livreur (photo, nom, note)
- Je peux appeler le livreur
- Je peux envoyer un message rapide
```

**US-3 : Suivre ma livraison**
```
En tant que client,
Je veux voir où se trouve le livreur en temps réel,
Afin de savoir quand il va arriver.

Critères d'acceptation :
- Je vois la position du livreur sur une carte
- Je vois le temps d'arrivée estimé
- La barre de progression se met à jour
- Je peux appeler le livreur à tout moment
```

**US-4 : Noter le livreur**
```
En tant que client,
Je veux donner une note au livreur après la livraison,
Afin d'aider les futurs clients.

Critères d'acceptation :
- Je peux donner de 1 à 5 étoiles
- Je peux choisir des critères (ponctuel, sympathique)
- Je peux laisser un commentaire
- Je peux donner un pourboire optionnel
```

### En tant que LIVREUR

**US-5 : Recevoir des demandes proches**
```
En tant que livreur,
Je veux recevoir des notifications pour les demandes près de moi,
Afin de trouver des livraisons à faire.

Critères d'acceptation :
- Je reçois uniquement les demandes dans un rayon de 10km
- Je vois le titre, le prix et la distance
- Je peux accepter en un clic
- Le premier qui accepte obtient la mission
```

**US-6 : Démarrer une livraison**
```
En tant que livreur,
Je veux démarrer le suivi GPS quand je commence la livraison,
Afin que le client puisse me suivre.

Critères d'acceptation :
- Je clique sur "Démarrer"
- Le GPS se lance automatiquement en arrière-plan
- Ma position est envoyée toutes les 5 secondes
- Je vois le trajet sur la carte
```

**US-7 : Recevoir mon paiement**
```
En tant que livreur,
Je veux recevoir mon paiement automatiquement après la livraison,
Afin d'être payé rapidement.

Critères d'acceptation :
- Le paiement est automatique quand je marque "Livré"
- Je reçois 85% du montant (après commission)
- L'argent arrive sur mon compte en 2-3 jours
- Je reçois les pourboires à 100%
```

**US-8 : Déclarer ma disponibilité**
```
En tant que livreur,
Je veux activer le "mode livreur" quand je suis disponible,
Afin de recevoir des propositions.

Critères d'acceptation :
- Je peux activer/désactiver d'un clic
- Quand actif, je reçois toutes les demandes proches
- Quand inactif, je ne reçois rien
- L'état se désactive automatiquement après 4h
```

---

## Exigences techniques

### Architecture

**Frontend** :
- React Native 0.73
- TypeScript
- Expo SDK 50
- Zustand (state management)
- React Navigation 6

**Backend** :
- Supabase
- PostgreSQL 15 + PostGIS
- Edge Functions (Deno)
- Realtime WebSocket

**Paiements** :
- Stripe Connect (Express accounts)
- Commission : 15% + 0.99€

**Notifications** :
- Expo Push Notifications
- 3 canaux Android

**GPS** :
- Expo Location
- Background tracking
- PostGIS POINT storage

### Performance

- **Temps de chargement** : < 2s
- **Temps de recherche** : < 500ms
- **Mise à jour GPS** : 5s
- **Envoi notification** : < 1s
- **Paiement** : < 3s

### Sécurité

- **Authentification** : JWT via Supabase Auth
- **RLS** : Row Level Security sur toutes les tables
- **HTTPS** : Obligatoire
- **Validation** : Côté serveur + client
- **Données sensibles** : Chiffrement
- **RGPD** : Conformité totale

### Scalabilité

**Phase 1** (500 utilisateurs) :
- Supabase gratuit OK
- Stripe mode test
- Google Maps gratuit

**Phase 2** (5,000 utilisateurs) :
- Supabase Pro (25$/mois)
- Stripe production
- Google Maps ~50$/mois

**Phase 3** (50,000 utilisateurs) :
- Supabase Team (599$/mois)
- Stripe volume
- Google Maps ~500$/mois
- CDN Cloudflare

### Compatibilité

- **iOS** : 13.0+
- **Android** : 8.0+ (API 26+)
- **Langues** : Français uniquement (Phase 1)
- **Zones** : Guyane uniquement (Phase 1)

---

## Design et UX

### Principes de design

1. **Simplicité** : Maximum 3 clics pour toute action
2. **Clarté** : Informations essentielles visibles
3. **Rapidité** : Actions instantanées
4. **Confiance** : Notes, badges, vérifications
5. **Accessibilité** : Contrastes, tailles de police

### Parcours principaux

**Parcours client** :
```
1. Ouvrir app → Voir demandes proches (0 clic)
2. Créer demande → 5 étapes → Publier (5 clics)
3. Recevoir notification → Voir profil livreur (1 clic)
4. Suivre livraison → Carte temps réel (1 clic)
5. Noter → 5 étoiles + commentaire (2 clics)
```

**Parcours livreur** :
```
1. Ouvrir app → Activer mode livreur (1 clic)
2. Recevoir notification → Accepter (1 clic)
3. Démarrer livraison → GPS auto (1 clic)
4. Marquer livrée → Paiement auto (1 clic)
5. Recevoir note → Consulter (0 clic)
```

### Wireframes clés

**Écran d'accueil** :
```
┌─────────────────────────┐
│ 🏠 Accueil   🗺️   👤    │
├─────────────────────────┤
│ Bonjour Jean 👋         │
│ Demandes à proximité    │
├─────────────────────────┤
│ [Mode livreur ○]        │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 📦 Livraison frigo  │ │
│ │ Cayenne → Matoury   │ │
│ │ 55€  •  12km        │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🛒 Courses          │ │
│ │ ...                 │ │
└─────────────────────────┘
│ [+ Créer une demande]   │
└─────────────────────────┘
```

---

## Métriques de succès

### Métriques d'acquisition

- **CAC (Coût d'acquisition client)** : < 5€
- **Taux de conversion inscription** : > 40%
- **Taux d'activation (1ère action)** : > 60%
- **Temps jusqu'à 1ère demande** : < 24h

### Métriques d'engagement

- **DAU/MAU** : > 30%
- **Fréquence d'utilisation** : 2x/semaine
- **Taux de rétention J7** : > 40%
- **Taux de rétention J30** : > 20%

### Métriques business

- **GMV (Gross Merchandise Value)** : Volume total
- **Take rate** : 15% + 0.99€
- **AOV (Average Order Value)** : 30-40€
- **Taux d'annulation** : < 5%
- **Taux de remboursement** : < 2%

### Métriques qualité

- **Note moyenne plateforme** : > 4.3/5
- **Taux de satisfaction** : > 85%
- **NPS (Net Promoter Score)** : > 50
- **Temps de résolution support** : < 24h

---

## Roadmap

### Q1 2025 - MVP (Janvier-Mars)

**Objectif** : Lancer en beta à Cayenne

- ✅ Semaine 1-4 : Développement core (FAIT)
- ⏳ Semaine 5-6 : Intégration APIs (EN COURS)
- 🔜 Semaine 7-8 : Tests internes
- 🔜 Semaine 9-10 : Beta fermée (30 utilisateurs)
- 🔜 Semaine 11-12 : Ajustements + lancement

**Livrables** :
- Application iOS/Android
- 500 utilisateurs
- 100 livraisons
- Note moyenne 4.0/5

### Q2 2025 - Growth (Avril-Juin)

**Objectif** : Scale Cayenne + extension Kourou

- Chat complet
- Vérification identité
- Programme de fidélité
- Marketing agressif
- Extension Kourou/Remire

**Livrables** :
- 2,000 utilisateurs
- 500 livraisons
- 3 villes couvertes

### Q3 2025 - Expansion (Juillet-Septembre)

**Objectif** : Toute la Guyane

- Comptes professionnels
- API pour e-commerce
- Mode sombre
- Filtres avancés
- 10+ villes couvertes

**Livrables** :
- 5,000 utilisateurs
- 1,500 livraisons
- Toute la Guyane

### Q4 2025 - Préparation scale (Octobre-Décembre)

**Objectif** : Préparer expansion DOM-TOM

- Optimisations performance
- Support client renforcé
- Partenariats stratégiques
- Levée de fonds

---

## Risques et mitigation

### Risques techniques

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| GPS imprécis | Élevé | Moyenne | Améliorer précision, tester zones |
| Notifications non reçues | Élevé | Faible | Tests exhaustifs, fallback SMS |
| Bug paiement | Critique | Faible | Tests rigoureux, monitoring Stripe |
| Crash app | Moyen | Faible | Sentry, tests automatisés |

### Risques business

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Peu d'adoption | Critique | Moyenne | Marketing ciblé, ambassadeurs |
| Fraude | Élevé | Moyenne | Vérification identité, signalements |
| Livreurs peu fiables | Élevé | Moyenne | Système de notation, bannissements |
| Concurrence | Moyen | Faible | First mover advantage, communauté |

### Risques légaux

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Responsabilité dommages | Critique | Moyenne | Assurance, CGU claires |
| RGPD | Élevé | Faible | Conformité totale, DPO |
| Statut livreurs | Moyen | Moyenne | Clarifier "particuliers" dans CGU |
| Accident | Critique | Faible | Assurance, disclaimers |

---

## Annexes

### A. Calcul des prix

**Formule** :
```
Prix = Base + (Distance × Prix/km) × Multiplicateur

Exemples :
- Colis 10km = 5€ + (10 × 1€) = 15€
- Objet lourd 12km, 2p = (15€ + 12×2.5€) × 1.5 = 67.50€
- Covoiturage 65km = 10€ + (65 × 0.5€) = 42.50€
```

### B. Commission plateforme

**Formule** :
```
Frais = max((Prix × 15%) + 0.99€, 1.50€)

Exemples :
- Livraison 50€ → 8.49€ (17%)
- Livraison 10€ → 2.49€ (25%)
- Pourboire 5€ → 0€ (0%)
```

### C. Personas

**Persona 1 : Marie, 32 ans, Cliente**
- Vit à Cayenne, travaille en bureau
- A acheté un réfrigérateur en ligne
- N'a pas de camionnette
- Budget limité
- Veut une livraison rapide et pas chère

**Persona 2 : David, 28 ans, Livreur**
- Fait Cayenne-Kourou quotidien pour le travail
- Possède un pick-up
- Cherche revenu complémentaire
- Flexible sur horaires
- Veut optimiser ses trajets

**Persona 3 : Sophie, 45 ans, Cliente régulière**
- Personne âgée à mobilité réduite
- Besoin de courses livrées 2x/semaine
- Fidèle aux mêmes livreurs
- Sensible à la qualité de service

---

## Validation et approbation

| Rôle | Nom | Statut | Date |
|------|-----|--------|------|
| Product Owner | - | ✅ Approuvé | 2024-12-04 |
| Lead Developer | - | ✅ Approuvé | 2024-12-04 |
| Designer | - | 🔄 En revue | - |
| Business | - | 🔄 En revue | - |

---

**Dernière mise à jour** : 4 décembre 2024
**Prochaine revue** : 15 janvier 2025
**Version** : 1.0
