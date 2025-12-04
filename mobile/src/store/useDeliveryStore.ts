import { create } from 'zustand';
import { DeliveryRequest, Delivery } from '@/types/database';
import { supabase } from '@/services/supabase';

interface DeliveryState {
  requests: DeliveryRequest[];
  activeDeliveries: Delivery[];
  isLoading: boolean;
  error: string | null;
  fetchNearbyRequests: (latitude: number, longitude: number, radiusKm?: number) => Promise<void>;
  fetchMyRequests: (userId: string) => Promise<void>;
  fetchMyDeliveries: (userId: string) => Promise<void>;
  createRequest: (request: Partial<DeliveryRequest>) => Promise<DeliveryRequest>;
  acceptRequest: (requestId: string, delivererId: string) => Promise<Delivery>;
  updateDeliveryStatus: (deliveryId: string, status: string) => Promise<void>;
  cancelDelivery: (deliveryId: string, reason: string) => Promise<void>;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  requests: [],
  activeDeliveries: [],
  isLoading: false,
  error: null,

  fetchNearbyRequests: async (latitude, longitude, radiusKm = 20) => {
    set({ isLoading: true, error: null });
    try {
      // Using PostGIS ST_DWithin for geographic search
      const { data, error } = await supabase.rpc('get_nearby_requests', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: radiusKm,
      });

      if (error) throw error;
      set({ requests: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error fetching nearby requests:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyRequests: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*, user:profiles(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ requests: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error fetching my requests:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyDeliveries: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          request:delivery_requests(*),
          deliverer:profiles!deliveries_deliverer_id_fkey(*),
          customer:profiles!deliveries_customer_id_fkey(*)
        `)
        .or(`deliverer_id.eq.${userId},customer_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ activeDeliveries: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error fetching my deliveries:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createRequest: async (request) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      set({ requests: [data, ...get().requests] });

      return data;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  acceptRequest: async (requestId, delivererId) => {
    set({ isLoading: true, error: null });
    try {
      // Get the request details
      const { data: request, error: requestError } = await supabase
        .from('delivery_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Calculate fees
      const commissionRate = parseFloat(process.env.EXPO_PUBLIC_COMMISSION_RATE || '0.15');
      const serviceFee = parseFloat(process.env.EXPO_PUBLIC_SERVICE_FEE || '0.99');
      const platformFee = request.price * commissionRate + serviceFee;
      const delivererAmount = request.price - platformFee;

      // Create delivery
      const { data: delivery, error: deliveryError } = await supabase
        .from('deliveries')
        .insert({
          request_id: requestId,
          deliverer_id: delivererId,
          customer_id: request.user_id,
          total_amount: request.price,
          platform_fee: platformFee,
          deliverer_amount: delivererAmount,
        })
        .select()
        .single();

      if (deliveryError) throw deliveryError;

      // Update request status
      await supabase
        .from('delivery_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      // Update local state
      set({
        activeDeliveries: [delivery, ...get().activeDeliveries],
        requests: get().requests.filter(r => r.id !== requestId),
      });

      return delivery;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateDeliveryStatus: async (deliveryId, status) => {
    try {
      const updateData: any = { status };

      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('deliveries')
        .update(updateData)
        .eq('id', deliveryId);

      if (error) throw error;

      // Update local state
      set({
        activeDeliveries: get().activeDeliveries.map(d =>
          d.id === deliveryId ? { ...d, ...updateData } : d
        ),
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  cancelDelivery: async (deliveryId, reason) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
        })
        .eq('id', deliveryId);

      if (error) throw error;

      // Update local state
      set({
        activeDeliveries: get().activeDeliveries.filter(d => d.id !== deliveryId),
      });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
