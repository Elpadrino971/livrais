# Cahier des Charges - Plateforme de Livraison Collaborative (Guyane)

## 1. Objectif du projet

Créer une plateforme qui permet :
- À des clients d'envoyer/livrer des produits volumineux (ex : réfrigérateur) ou des courses
- À des particuliers proches (géolocalisés) de proposer leur aide contre rémunération
- À la plateforme de prendre une commission
- D'améliorer la logistique sur un territoire où les distances sont longues et les livraisons coûteuses

## 2. Fonctionnalités principales

### 2.1. Compte utilisateur
- Inscription (mail, téléphone, ou Google/Apple)
- Profil avec photo, nom, ville, notes/avis
- Vérification d'identité (optionnelle mais recommandée)

### 2.2. Géolocalisation
- Carte montrant les livreurs disponibles à proximité
- Possibilité d'activer un statut : "Je suis en déplacement" (courses, trajet, déplacement prévu)
- Notification push automatique aux personnes proches

### 2.3. Création d'une demande

Le client peut créer :
1. Demande de livraison lourde (ex : frigo, machine à laver)
2. Demande de courses / petits colis
3. Transport d'un objet d'un point A à B
4. Demande de covoiturage

Chaque demande contient :
- Lieu de départ / arrivée (GPS)
- Type de produit
- Photo du produit (facultatif)
- Prix proposé (ou prix estimé automatiquement par la plateforme)
- Heure souhaitée
- Besoin d'un véhicule spécifique (pick-up, camionnette, voiture simple…)
- Option : besoin de deux personnes pour porter

### 2.4. Mise en relation
- Les livreurs proches reçoivent un push leur annonçant une nouvelle demande
- Le premier qui accepte verrouille la mission
- Chat intégré pour détails rapides

### 2.5. Paiements
- Paiement sécurisé via Stripe
- Commission plateforme (ex : 10–20 %)
- Versement au livreur après validation de la livraison

### 2.6. Notifications push

Pushs dans ces cas :
- Quelqu'un du quartier déclare "Je vais faire des courses"
- Une nouvelle demande apparaît dans un rayon défini
- Le livreur arrive
- La livraison est terminée

## 3. Fonctionnalités secondaires (mais utiles)

- Notation du livreur (fiabilité, ponctualité, politesse)
- Badge "Livreur premium" pour rassurer les clients
- Historique des courses / livraisons
- Suivi en temps réel (GPS simple)
- Possibilité pour un livreur de proposer :
  - "Je passe au supermarché."
  - "Je vais à Saint-Laurent."
  - "Trajet Matoury → Cayenne en cours."
  Les riverains reçoivent un push s'ils sont proches.

## 4. Architecture technique

### 4.1. Front-end
- Application mobile (React Native avec Expo)
- Interface simple, minimaliste, ultra lisible
- Support iOS et Android

### 4.2. Back-end
- Supabase (auth, DB, stockage, realtime)
- PostgreSQL + PostGIS pour la géolocalisation
- Edge Functions pour automatiser :
  - notifications push
  - matching automatique
  - calcul des distances/prix

### 4.3. Géolocalisation
- React Native Maps
- Google Maps API
- Realtime tracking via Supabase

## 5. Modèle économique

- Commission plateforme (10–20 %)
- Frais de service fixes (ex : 0,99 €)
- Badges premium (optionnel)
- Abonnement livreurs (optionnel et à valider plus tard)

## 6. Sécurité & conformité

- Validation identité (optionnelle)
- Assurance responsabilité (à prévoir si le projet grossit)
- Protection des données (RGPD)
- Traçabilité des courses (journalisation des actions)

## 7. Design / UX

Objectif : simple, efficace, zéro complication.

Éléments clés :
- Bouton principal "Créer une demande"
- Carte géolocalisée avec livreurs proches
- Onglet "Je rends service" pour activer le mode livreur
- Notifications push au centre du concept

## 8. Roadmap MVP (version minimale pour lancer rapidement)

### MVP obligatoire
1. ✅ Création de compte
2. ✅ Géolocalisation
3. ✅ Création d'une demande
4. ✅ Acceptation par un livreur
5. ⏳ Paiement Stripe
6. ✅ Commission automatique
7. ⏳ Notation
8. ✅ Notifications push

### MVP+ (si tu veux impressionner mais sans complexité)
- ⏳ Déclaration "Je vais faire des courses"
- ⏳ Suivi en temps réel de la livraison
- ✅ Recevoir des push selon distance
- ⏳ Covoiturage

## 9. Points critiques à anticiper

- Vérification de fiabilité des livreurs (minimum obligatoire)
- Gestion des annulations (conditions claires)
- Définir un prix minimum par km pour éviter les abus
- Éviter que les livreurs se battent pour les courses → premier accepté = réservé

## 10. Évolution future

Une fois la Guyane validée, le modèle peut s'étendre :
- Réunion, Martinique, Guadeloupe
- Zones rurales de France
- Pays où la logistique est fragile

## 11. Conclusion

Ton idée est solide, exploitable, et clairement différenciante en Guyane.
Ce cahier des charges te donne une base sérieuse et opérationnelle pour lancer réellement ton MVP.

## 12. Prochaines étapes

1. ✅ Structure du projet créée
2. ✅ Base de données configurée
3. ✅ Écrans principaux développés
4. ⏳ Intégration Stripe Connect
5. ⏳ Tests utilisateurs
6. ⏳ Déploiement MVP

---

**Version**: 1.0
**Date**: Décembre 2024
**Statut**: En développement
