import { VehicleType, RequestType } from '@/types/database';

// Configuration de l'application
export const APP_CONFIG = {
  COMMISSION_RATE: parseFloat(process.env.EXPO_PUBLIC_COMMISSION_RATE || '0.15'),
  SERVICE_FEE: parseFloat(process.env.EXPO_PUBLIC_SERVICE_FEE || '0.99'),
  DEFAULT_RADIUS_KM: 10,
  MAX_RADIUS_KM: 50,
  MIN_RADIUS_KM: 5,
  LOCATION_UPDATE_INTERVAL: 5000, // 5 secondes
  LOCATION_DISTANCE_INTERVAL: 10, // 10 mètres
  NOTIFICATION_EXPIRE_HOURS: 4,
};

// Ville de Guyane pour la recherche d'adresse
export const GUYANE_CITIES = [
  'Cayenne',
  'Matoury',
  'Remire-Montjoly',
  'Kourou',
  'Saint-Laurent-du-Maroni',
  'Macouria',
  'Roura',
  'Sinnamary',
  'Iracoubo',
  'Mana',
  'Apatou',
  'Grand-Santi',
  'Maripasoula',
  'Papaichton',
  'Saül',
];

// Position initiale (Cayenne)
export const INITIAL_REGION = {
  latitude: 4.9333,
  longitude: -52.3333,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

// Types de véhicules avec icônes
export const VEHICLE_TYPES: Record<VehicleType, { label: string; icon: string; emoji: string }> = {
  car: { label: 'Voiture', icon: '🚗', emoji: '🚗' },
  van: { label: 'Camionnette', icon: '🚐', emoji: '🚐' },
  pickup: { label: 'Pick-up', icon: '🛻', emoji: '🛻' },
  truck: { label: 'Camion', icon: '🚛', emoji: '🚛' },
  motorcycle: { label: 'Moto', icon: '🏍️', emoji: '🏍️' },
};

// Types de demande avec icônes
export const REQUEST_TYPES: Record<RequestType, { label: string; icon: string; description: string }> = {
  heavy_item: {
    label: 'Objet lourd',
    icon: '📦',
    description: 'Électroménager, meubles, objets volumineux',
  },
  groceries: {
    label: 'Courses',
    icon: '🛒',
    description: 'Livraison de courses ou petits achats',
  },
  package: {
    label: 'Colis',
    icon: '📮',
    description: 'Petits colis ou documents',
  },
  carpool: {
    label: 'Covoiturage',
    icon: '🚗',
    description: 'Partage de trajet',
  },
};

// Prix recommandés par type et distance
export const PRICE_SUGGESTIONS = {
  base: {
    heavy_item: 15,
    groceries: 8,
    package: 5,
    carpool: 10,
  },
  perKm: {
    heavy_item: 2.5,
    groceries: 1.5,
    package: 1,
    carpool: 0.5,
  },
};

// Calcul du prix suggéré
export const calculateSuggestedPrice = (
  type: RequestType,
  distanceKm: number,
  needsTwoPeople: boolean = false
): number => {
  const basePrice = PRICE_SUGGESTIONS.base[type];
  const pricePerKm = PRICE_SUGGESTIONS.perKm[type];
  let total = basePrice + distanceKm * pricePerKm;

  if (needsTwoPeople) {
    total *= 1.5; // +50% pour deux personnes
  }

  return Math.round(total * 100) / 100; // Arrondir à 2 décimales
};

// Messages d'erreur courants
export const ERROR_MESSAGES = {
  LOCATION_DENIED: 'Veuillez autoriser l\'accès à votre position',
  NO_NETWORK: 'Pas de connexion internet',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé',
  WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 6 caractères',
  REQUIRED_FIELDS: 'Veuillez remplir tous les champs obligatoires',
  INVALID_EMAIL: 'Email invalide',
  GENERIC_ERROR: 'Une erreur est survenue. Veuillez réessayer.',
};

// Thème de couleurs
export const COLORS = {
  primary: '#2196F3',
  secondary: '#4CAF50',
  accent: '#FF9800',
  error: '#f44336',
  warning: '#FF9800',
  success: '#4CAF50',
  info: '#2196F3',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  textLighter: '#999999',
  border: '#e0e0e0',
};

// Durées d'animation
export const ANIMATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
};
