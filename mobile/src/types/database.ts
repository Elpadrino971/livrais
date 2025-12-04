export type VehicleType = 'car' | 'van' | 'pickup' | 'truck' | 'motorcycle';

export type DeliveryStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export type RequestType = 'heavy_item' | 'groceries' | 'package' | 'carpool';

export type CarpoolStatus = 'available' | 'full' | 'completed' | 'cancelled';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  city?: string;
  bio?: string;
  is_verified: boolean;
  is_premium: boolean;
  rating: number;
  total_ratings: number;
  total_deliveries: number;
  total_requests: number;
  stripe_customer_id?: string;
  stripe_account_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface DeliveryRequest {
  id: string;
  user_id: string;
  type: RequestType;
  title: string;
  description?: string;
  pickup_location: Location;
  pickup_address: string;
  delivery_location: Location;
  delivery_address: string;
  photos?: string[];
  price: number;
  vehicle_type_required?: VehicleType;
  needs_two_people: boolean;
  preferred_datetime?: string;
  status: DeliveryStatus;
  created_at: string;
  updated_at: string;
  user?: Profile; // Joined data
}

export interface Delivery {
  id: string;
  request_id: string;
  deliverer_id: string;
  customer_id: string;
  status: DeliveryStatus;
  accepted_at: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  current_location?: Location;
  stripe_payment_intent_id?: string;
  total_amount: number;
  platform_fee: number;
  deliverer_amount: number;
  created_at: string;
  updated_at: string;
  request?: DeliveryRequest; // Joined data
  deliverer?: Profile; // Joined data
  customer?: Profile; // Joined data
}

export interface Rating {
  id: string;
  delivery_id: string;
  rater_id: string;
  rated_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  rater?: Profile; // Joined data
}

export interface Message {
  id: string;
  delivery_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile; // Joined data
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_id?: string;
  is_read: boolean;
  is_sent: boolean;
  created_at: string;
}

export interface DelivererAvailability {
  id: string;
  user_id: string;
  is_available: boolean;
  current_location?: Location;
  destination_location?: Location;
  destination_address?: string;
  activity_type?: 'shopping' | 'trip' | 'available';
  message?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  user?: Profile; // Joined data
}

export interface Carpool {
  id: string;
  driver_id: string;
  departure_location: Location;
  departure_address: string;
  arrival_location: Location;
  arrival_address: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  description?: string;
  vehicle_type?: VehicleType;
  status: CarpoolStatus;
  created_at: string;
  updated_at: string;
  driver?: Profile; // Joined data
  bookings?: CarpoolBooking[]; // Joined data
}

export interface CarpoolBooking {
  id: string;
  carpool_id: string;
  passenger_id: string;
  seats_booked: number;
  status: BookingStatus;
  stripe_payment_intent_id?: string;
  amount: number;
  created_at: string;
  updated_at: string;
  passenger?: Profile; // Joined data
  carpool?: Carpool; // Joined data
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      delivery_requests: {
        Row: DeliveryRequest;
        Insert: Omit<DeliveryRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DeliveryRequest, 'id'>>;
      };
      deliveries: {
        Row: Delivery;
        Insert: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Delivery, 'id'>>;
      };
      ratings: {
        Row: Rating;
        Insert: Omit<Rating, 'id' | 'created_at'>;
        Update: Partial<Omit<Rating, 'id'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id'>>;
      };
      deliverer_availability: {
        Row: DelivererAvailability;
        Insert: Omit<DelivererAvailability, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DelivererAvailability, 'id'>>;
      };
      carpools: {
        Row: Carpool;
        Insert: Omit<Carpool, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Carpool, 'id'>>;
      };
      carpool_bookings: {
        Row: CarpoolBooking;
        Insert: Omit<CarpoolBooking, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CarpoolBooking, 'id'>>;
      };
    };
  };
}
