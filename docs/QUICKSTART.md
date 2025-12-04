# Démarrage Rapide - Livrais

Guide pour démarrer rapidement avec Livrais en 10 minutes.

## Installation Express

### 1. Cloner le projet

```bash
git clone https://github.com/Elpadrino971/livrais.git
cd livrais
```

### 2. Installer les dépendances

```bash
cd mobile
npm install
```

### 3. Configurer les clés API

Créez `mobile/.env` :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=votre-clé
```

### 4. Lancer l'application

```bash
npm start
```

Scannez le QR code avec **Expo Go** !

## Configuration Supabase (5 minutes)

### 1. Créer un projet

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Choisissez un nom et un mot de passe

### 2. Exécuter le SQL

1. Allez dans **SQL Editor**
2. Copiez le contenu de `supabase/migrations/20231204000000_initial_schema.sql`
3. Cliquez sur "Run"

### 3. Récupérer les clés

1. Allez dans **Settings** > **API**
2. Copiez :
   - URL du projet
   - Clé `anon/public`
3. Collez dans `mobile/.env`

C'est tout ! 🎉

## Première utilisation

### 1. Créer un compte

1. Lancez l'app
2. Cliquez sur "S'inscrire"
3. Entrez vos informations

### 2. Autoriser la géolocalisation

Acceptez la permission de localisation pour voir les demandes à proximité.

### 3. Créer une demande de test

1. Cliquez sur "Créer une demande"
2. Remplissez les informations
3. Validez

### 4. Tester avec un second compte

1. Créez un second compte (avec un autre email)
2. Acceptez la demande
3. Testez le chat et la livraison

## Structure du projet

```
livrais/
├── mobile/              # Application React Native
│   ├── src/
│   │   ├── screens/    # Écrans de l'app
│   │   ├── services/   # API Supabase, Location, etc.
│   │   ├── store/      # State management (Zustand)
│   │   └── types/      # Types TypeScript
│   └── App.tsx         # Point d'entrée
├── supabase/           # Backend
│   ├── migrations/     # Schéma de BDD
│   └── functions/      # Edge Functions
└── docs/               # Documentation
```

## Prochaines étapes

1. **Configuration complète** : Lisez [SETUP.md](./SETUP.md)
2. **Documentation API** : Consultez [API.md](./API.md)
3. **Contribuer** : Voir [CONTRIBUTING.md](./CONTRIBUTING.md)

## Résolution des problèmes courants

### L'app ne démarre pas

```bash
# Nettoyer le cache
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

### Erreur de connexion Supabase

Vérifiez que :
- L'URL est correcte (avec `https://`)
- La clé anon est complète
- Le fichier `.env` est bien dans `mobile/`

### La carte ne s'affiche pas

- Ajoutez une clé Google Maps valide
- Activez les APIs Maps dans Google Cloud Console
- Testez sur un appareil physique

## Support

- 📧 Email : support@livrais.app
- 💬 Issues : [GitHub Issues](https://github.com/Elpadrino971/livrais/issues)
- 📚 Docs : [Documentation complète](./SETUP.md)

Bonne livraison ! 🚚
