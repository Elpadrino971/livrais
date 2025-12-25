import { create } from 'zustand';
import { DeliveryRequest, Delivery } from '@/types/database';
import { supabase } from '@/services/supabase';

export interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  vehicleTypes?: string[];
  requestTypes?: string[];
  maxDistance?: number;
  onlyAvailable?: boolean;
  minRating?: number;
}

interface DeliveryState {
  requests: DeliveryRequest[];
  filteredRequests: DeliveryRequest[];
  activeDeliveries: Delivery[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  pageSize: number;
  error: string | null;
  currentFilters: FilterOptions;
  fetchNearbyRequests: (latitude: number, longitude: number, radiusKm?: number, page?: number) => Promise<void>;
  fetchMyRequests: (userId: string, page?: number) => Promise<void>;
  fetchMyDeliveries: (userId: string, page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  createRequest: (request: Partial<DeliveryRequest>) => Promise<DeliveryRequest>;
  acceptRequest: (requestId: string, delivererId: string) => Promise<Delivery>;
  updateDeliveryStatus: (deliveryId: string, status: string) => Promise<void>;
  cancelDelivery: (deliveryId: string, reason: string) => Promise<void>;
  applyFilters: (filters: FilterOptions) => void;
  clearFilters: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  requests: [],
  filteredRequests: [],
  activeDeliveries: [],
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  currentPage: 0,
  pageSize: 20,
  error: null,
  currentFilters: {},

  fetchNearbyRequests: async (latitude, longitude, radiusKm = 20, page = 0) => {
    const { pageSize, requests: existingRequests } = get();
    const isFirstPage = page === 0;

    set({ isLoading: isFirstPage, isLoadingMore: !isFirstPage, error: null });

    try {
      // Using PostGIS ST_DWithin for geographic search with pagination
      const { data, error, count } = await supabase
        .rpc('get_nearby_requests', {
          user_lat: latitude,
          user_lng: longitude,
          radius_km: radiusKm,
        })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      const newRequests = isFirstPage ? data || [] : [...existingRequests, ...(data || [])];
      const hasMore = (data?.length || 0) === pageSize;

      set({
        requests: newRequests,
        filteredRequests: newRequests,
        currentPage: page,
        hasMore,
      });

      // Reapply current filters if any
      const { currentFilters } = get();
      if (Object.keys(currentFilters).length > 0) {
        get().applyFilters(currentFilters);
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error fetching nearby requests:', error);
    } finally {
      set({ isLoading: false, isLoadingMore: false });
    }
  },

  fetchMyRequests: async (userId, page = 0) => {
    const { pageSize, requests: existingRequests } = get();
    const isFirstPage = page === 0;

    set({ isLoading: isFirstPage, isLoadingMore: !isFirstPage, error: null });

    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*, user:profiles(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      const newRequests = isFirstPage ? data || [] : [...existingRequests, ...(data || [])];
      const hasMore = (data?.length || 0) === pageSize;

      set({
        requests: newRequests,
        filteredRequests: newRequests,
        currentPage: page,
        hasMore,
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error fetching my requests:', error);
    } finally {
      set({ isLoading: false, isLoadingMore: false });
    }
  },

  fetchMyDeliveries: async (userId, page = 0) => {
    const { pageSize } = get();
    const isFirstPage = page === 0;

    set({ isLoading: isFirstPage, isLoadingMore: !isFirstPage, error: null });

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
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;

      const newDeliveries = isFirstPage ? data || [] : [...get().activeDeliveries, ...(data || [])];
      const hasMore = (data?.length || 0) === pageSize;

      set({
        activeDeliveries: newDeliveries,
        currentPage: page,
        hasMore,
      });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error fetching my deliveries:', error);
    } finally {
      set({ isLoading: false, isLoadingMore: false });
    }
  },

  loadMore: async () => {
    const { hasMore, isLoadingMore, currentPage } = get();
    if (!hasMore || isLoadingMore) return;

    // This method would need context about what was last fetched
    // For now, it's a placeholder that consumers can call after determining context
    console.log('loadMore called - implement in component with proper context');
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

  applyFilters: (filters: FilterOptions) => {
    const { requests } = get();

    let filtered = [...requests];

    // Filter by price range
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(r => r.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(r => r.price <= filters.maxPrice!);
    }

    // Filter by vehicle type
    if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
      filtered = filtered.filter(r =>
        r.vehicle_type && filters.vehicleTypes!.includes(r.vehicle_type)
      );
    }

    // Filter by request type
    if (filters.requestTypes && filters.requestTypes.length > 0) {
      filtered = filtered.filter(r => filters.requestTypes!.includes(r.type));
    }

    // Filter by distance
    if (filters.maxDistance !== undefined) {
      filtered = filtered.filter(r =>
        r.distance_km && r.distance_km <= filters.maxDistance!
      );
    }

    // Filter by availability (would need to join with profiles in real implementation)
    // For now, this is a placeholder
    if (filters.onlyAvailable) {
      // This would require additional data from the profiles table
      // filtered = filtered.filter(r => r.user?.is_available);
    }

    // Filter by rating (would need to join with profiles in real implementation)
    if (filters.minRating !== undefined) {
      // This would require additional data from the profiles table
      // filtered = filtered.filter(r => r.user?.rating >= filters.minRating!);
    }

    set({
      filteredRequests: filtered,
      currentFilters: filters,
    });
  },

  clearFilters: () => {
    set({
      filteredRequests: get().requests,
      currentFilters: {},
    });
  },
}));
