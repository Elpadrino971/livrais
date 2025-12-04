/**
 * Grille tarifaire de référence pour Livrais
 * Prix ajustables selon la distance, le type, et les options
 */

export interface PricingRule {
  type: string;
  label: string;
  basePrice: number;      // Prix de base
  pricePerKm: number;     // Prix par km supplémentaire
  twoPeopleMultiplier: number; // Multiplicateur pour 2 personnes
  vehicleBonus?: number;  // Bonus pour véhicule spécifique
  minPrice: number;       // Prix minimum
  maxPrice: number;       // Prix maximum conseillé
  examples: string[];     // Exemples de produits
}

/**
 * Grille tarifaire de référence
 */
export const PRICING_GRID: Record<string, PricingRule> = {
  // 📦 Colis et petits objets (5-30€)
  package: {
    type: 'package',
    label: 'Colis / Petit objet',
    basePrice: 5,
    pricePerKm: 1,
    twoPeopleMultiplier: 1.0, // Pas de supplément
    minPrice: 5,
    maxPrice: 30,
    examples: [
      'Documents',
      'Petit colis',
      'Vêtements',
      'Livres',
    ],
  },

  // 🛒 Courses (8-50€)
  groceries: {
    type: 'groceries',
    label: 'Courses / Achats',
    basePrice: 8,
    pricePerKm: 1.5,
    twoPeopleMultiplier: 1.2,
    minPrice: 8,
    maxPrice: 50,
    examples: [
      'Courses alimentaires',
      'Achats supermarché',
      'Produits frais',
      'Plusieurs sacs',
    ],
  },

  // 📦 Objets lourds (15-100€)
  heavy_item: {
    type: 'heavy_item',
    label: 'Objet lourd / Encombrant',
    basePrice: 15,
    pricePerKm: 2.5,
    twoPeopleMultiplier: 1.5,
    vehicleBonus: 10,
    minPrice: 15,
    maxPrice: 100,
    examples: [
      'Réfrigérateur',
      'Machine à laver',
      'Canapé',
      'Meubles',
      'Électroménager',
    ],
  },

  // 🚗 Covoiturage (10-80€)
  carpool: {
    type: 'carpool',
    label: 'Covoiturage',
    basePrice: 10,
    pricePerKm: 0.5,
    twoPeopleMultiplier: 1.8, // 1.8x pour 2 passagers
    minPrice: 10,
    maxPrice: 80,
    examples: [
      'Trajet Cayenne-Kourou',
      'Trajet quotidien',
      'Déplacement longue distance',
      'Saint-Laurent-du-Maroni',
    ],
  },
};

/**
 * Trajets prédéfinis en Guyane avec distances
 */
export const COMMON_ROUTES = [
  { from: 'Cayenne', to: 'Matoury', km: 12 },
  { from: 'Cayenne', to: 'Remire-Montjoly', km: 8 },
  { from: 'Cayenne', to: 'Kourou', km: 65 },
  { from: 'Cayenne', to: 'Saint-Laurent-du-Maroni', km: 250 },
  { from: 'Kourou', to: 'Sinnamary', km: 25 },
  { from: 'Matoury', to: 'Roura', km: 18 },
];

/**
 * Calcule le prix selon les paramètres
 */
export const calculatePrice = (
  type: string,
  distanceKm: number,
  needsTwoPeople: boolean = false,
  hasSpecialVehicle: boolean = false
): {
  suggested: number;
  min: number;
  max: number;
  breakdown: string[];
} => {
  const rule = PRICING_GRID[type];

  if (!rule) {
    return {
      suggested: 10,
      min: 5,
      max: 100,
      breakdown: ['Type inconnu'],
    };
  }

  const breakdown: string[] = [];

  // Prix de base
  let total = rule.basePrice;
  breakdown.push(`Base: ${rule.basePrice}€`);

  // Prix par km
  const distancePrice = distanceKm * rule.pricePerKm;
  total += distancePrice;
  breakdown.push(`Distance (${distanceKm}km × ${rule.pricePerKm}€): ${distancePrice.toFixed(2)}€`);

  // Bonus véhicule spécial
  if (hasSpecialVehicle && rule.vehicleBonus) {
    total += rule.vehicleBonus;
    breakdown.push(`Véhicule spécial: +${rule.vehicleBonus}€`);
  }

  // Multiplicateur pour 2 personnes
  if (needsTwoPeople && rule.twoPeopleMultiplier > 1) {
    const multiplier = rule.twoPeopleMultiplier;
    const before = total;
    total *= multiplier;
    breakdown.push(`2 personnes (×${multiplier}): ${(total - before).toFixed(2)}€`);
  }

  // Arrondir
  total = Math.round(total * 100) / 100;

  // S'assurer que c'est dans la fourchette
  const suggested = Math.max(rule.minPrice, Math.min(total, rule.maxPrice));

  return {
    suggested,
    min: rule.minPrice,
    max: rule.maxPrice,
    breakdown,
  };
};

/**
 * Grille de prix prédéfinie pour affichage rapide
 */
export const QUICK_PRICES = [
  {
    category: 'Colis / Petit objet',
    icon: '📮',
    ranges: [
      { distance: '< 5 km', price: '5-10€' },
      { distance: '5-10 km', price: '10-15€' },
      { distance: '10-20 km', price: '15-25€' },
      { distance: '> 20 km', price: '25-30€' },
    ],
  },
  {
    category: 'Courses',
    icon: '🛒',
    ranges: [
      { distance: '< 5 km', price: '8-15€' },
      { distance: '5-10 km', price: '15-25€' },
      { distance: '10-20 km', price: '25-35€' },
      { distance: '> 20 km', price: '35-50€' },
    ],
  },
  {
    category: 'Objet lourd (1 personne)',
    icon: '📦',
    ranges: [
      { distance: '< 5 km', price: '15-25€' },
      { distance: '5-10 km', price: '25-40€' },
      { distance: '10-20 km', price: '40-65€' },
      { distance: '> 20 km', price: '65-80€' },
    ],
  },
  {
    category: 'Objet lourd (2 personnes)',
    icon: '📦👥',
    ranges: [
      { distance: '< 5 km', price: '25-40€' },
      { distance: '5-10 km', price: '40-60€' },
      { distance: '10-20 km', price: '60-80€' },
      { distance: '> 20 km', price: '80-100€' },
    ],
  },
  {
    category: 'Covoiturage (1 passager)',
    icon: '🚗',
    ranges: [
      { distance: '< 20 km', price: '10-15€' },
      { distance: '20-50 km', price: '15-30€' },
      { distance: '50-100 km', price: '30-50€' },
      { distance: '> 100 km', price: '50-80€' },
    ],
  },
];

/**
 * Exemples de prix pour les trajets courants
 */
export const PRICE_EXAMPLES = [
  {
    title: 'Colis Cayenne → Matoury',
    type: 'package',
    distance: 12,
    price: '15-18€',
    description: 'Petit colis, sans véhicule spécial',
  },
  {
    title: 'Courses Cayenne → Remire-Montjoly',
    type: 'groceries',
    distance: 8,
    price: '20-25€',
    description: '3-4 sacs de courses',
  },
  {
    title: 'Réfrigérateur Cayenne → Matoury',
    type: 'heavy_item',
    distance: 12,
    price: '55-65€',
    description: 'Avec camionnette, 2 personnes',
  },
  {
    title: 'Covoiturage Cayenne → Kourou',
    type: 'carpool',
    distance: 65,
    price: '35-45€',
    description: 'Par passager',
  },
  {
    title: 'Meuble Matoury → Cayenne',
    type: 'heavy_item',
    distance: 12,
    price: '45-55€',
    description: 'Canapé, avec pick-up, 2 personnes',
  },
];

/**
 * Tips pour les utilisateurs
 */
export const PRICING_TIPS = [
  '💡 Les prix sont négociables entre le client et le livreur',
  '💰 Prix plus élevés pour objets lourds ou 2 personnes nécessaires',
  '🚗 Véhicule spécial (camionnette, pick-up) = supplément',
  '📏 Prix basés sur la distance réelle du trajet',
  '⏰ Disponibilité immédiate peut justifier un prix supérieur',
  '⭐ Livreurs bien notés peuvent demander un prix plus élevé',
];

/**
 * Commission de la plateforme
 */
export const PLATFORM_FEES = {
  commission: 0.15, // 15%
  fixedFee: 0.99,   // 0.99€
  minFee: 1.50,     // Minimum 1.50€
};

/**
 * Calcule les frais de plateforme
 */
export const calculatePlatformFee = (price: number): {
  platformFee: number;
  delivererAmount: number;
} => {
  const commission = price * PLATFORM_FEES.commission;
  const platformFee = Math.max(
    commission + PLATFORM_FEES.fixedFee,
    PLATFORM_FEES.minFee
  );
  const delivererAmount = price - platformFee;

  return {
    platformFee: Math.round(platformFee * 100) / 100,
    delivererAmount: Math.round(delivererAmount * 100) / 100,
  };
};
