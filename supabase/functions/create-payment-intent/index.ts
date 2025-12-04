import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      delivery_id,
      amount,
      platform_fee,
      connected_account,
      currency,
      description,
    } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // En centimes
      currency: currency || 'eur',
      application_fee_amount: platform_fee,
      transfer_data: {
        destination: connected_account,
      },
      metadata: {
        delivery_id: delivery_id,
        description: description || 'Livraison Livrais',
      },
    });

    // Sauvegarder l'ID dans la base de données
    if (delivery_id) {
      await supabase
        .from('deliveries')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('id', delivery_id);
    }

    return new Response(
      JSON.stringify({
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
