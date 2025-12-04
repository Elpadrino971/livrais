import { Alert } from 'react-native';
import { supabase } from './supabase';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  status: string;
}

interface ConnectedAccount {
  id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

/**
 * Crée un compte Stripe Connect pour un livreur
 */
export const createConnectedAccount = async (
  userId: string,
  email: string,
  phone?: string
): Promise<string> => {
  try {
    // Appel à l'Edge Function Supabase
    const { data, error } = await supabase.functions.invoke('create-stripe-account', {
      body: {
        user_id: userId,
        email,
        phone,
        country: 'FR', // Guyane = France
      },
    });

    if (error) throw error;

    // Sauvegarder l'account ID dans le profil
    await supabase
      .from('profiles')
      .update({ stripe_account_id: data.account_id })
      .eq('id', userId);

    return data.account_id;
  } catch (error: any) {
    console.error('Error creating Stripe account:', error);
    throw new Error('Impossible de créer le compte de paiement');
  }
};

/**
 * Génère un lien d'onboarding Stripe Connect
 */
export const createAccountLink = async (accountId: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-account-link', {
      body: {
        account_id: accountId,
        refresh_url: 'livrais://stripe/refresh',
        return_url: 'livrais://stripe/return',
      },
    });

    if (error) throw error;

    return data.url;
  } catch (error: any) {
    console.error('Error creating account link:', error);
    throw new Error('Impossible de générer le lien d\'inscription');
  }
};

/**
 * Vérifie le statut d'un compte Connect
 */
export const getAccountStatus = async (accountId: string): Promise<ConnectedAccount> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-account-status', {
      body: { account_id: accountId },
    });

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error('Error getting account status:', error);
    throw error;
  }
};

/**
 * Crée un Payment Intent pour une livraison
 */
export const createPaymentIntent = async (
  deliveryId: string,
  amount: number,
  delivererAccountId: string
): Promise<PaymentIntent> => {
  try {
    // Calculer les frais de plateforme
    const platformFee = Math.max(
      amount * 0.15 + 0.99, // 15% + 0.99€
      1.50 // Minimum 1.50€
    );

    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        delivery_id: deliveryId,
        amount: Math.round(amount * 100), // Convertir en centimes
        platform_fee: Math.round(platformFee * 100),
        connected_account: delivererAccountId,
        currency: 'eur',
      },
    });

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    throw new Error('Impossible de créer le paiement');
  }
};

/**
 * Confirme un paiement
 */
export const confirmPayment = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('confirm-payment', {
      body: {
        payment_intent_id: paymentIntentId,
        payment_method_id: paymentMethodId,
      },
    });

    if (error) throw error;

    return data.success;
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    throw new Error('Impossible de confirmer le paiement');
  }
};

/**
 * Crée un paiement pour un pourboire
 */
export const createTipPayment = async (
  deliveryId: string,
  delivererAccountId: string,
  tipAmount: number
): Promise<PaymentIntent> => {
  try {
    // Pas de frais de plateforme sur les pourboires
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        delivery_id: deliveryId,
        amount: Math.round(tipAmount * 100),
        platform_fee: 0,
        connected_account: delivererAccountId,
        currency: 'eur',
        description: 'Pourboire',
      },
    });

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error('Error creating tip payment:', error);
    throw new Error('Impossible de créer le pourboire');
  }
};

/**
 * Rembourse une livraison
 */
export const refundPayment = async (
  paymentIntentId: string,
  reason: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('refund-payment', {
      body: {
        payment_intent_id: paymentIntentId,
        reason,
      },
    });

    if (error) throw error;

    return data.success;
  } catch (error: any) {
    console.error('Error refunding payment:', error);
    throw new Error('Impossible de rembourser');
  }
};

/**
 * Récupère les informations de paiement d'une livraison
 */
export const getPaymentInfo = async (deliveryId: string) => {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select('stripe_payment_intent_id, total_amount, platform_fee, deliverer_amount')
      .eq('id', deliveryId)
      .single();

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error('Error getting payment info:', error);
    throw error;
  }
};

/**
 * Vérifie si un utilisateur peut recevoir des paiements
 */
export const canReceivePayments = async (userId: string): Promise<boolean> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();

    if (error || !profile.stripe_account_id) {
      return false;
    }

    const accountStatus = await getAccountStatus(profile.stripe_account_id);
    return accountStatus.charges_enabled && accountStatus.payouts_enabled;
  } catch (error) {
    return false;
  }
};
