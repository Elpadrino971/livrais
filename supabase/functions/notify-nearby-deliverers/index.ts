import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { request_id, latitude, longitude, radius_km = 10 } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the delivery request details
    const { data: request, error: requestError } = await supabase
      .from('delivery_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (requestError) throw requestError;

    // Find nearby deliverers who are available
    const { data: nearbyDeliverers, error: deliverersError } = await supabase.rpc(
      'get_nearby_available_deliverers',
      {
        user_lat: latitude,
        user_lng: longitude,
        radius_km,
      }
    );

    if (deliverersError) throw deliverersError;

    // Create notifications for nearby deliverers
    const notifications = nearbyDeliverers.map((deliverer: any) => ({
      user_id: deliverer.user_id,
      title: 'Nouvelle demande à proximité',
      message: `${request.title} - ${request.price.toFixed(2)} €`,
      type: 'new_request',
      related_id: request_id,
    }));

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) throw notifError;
    }

    // TODO: Send actual push notifications via Expo Push Notifications

    return new Response(
      JSON.stringify({
        success: true,
        notified_count: notifications.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
