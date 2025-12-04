-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_account_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle types
CREATE TYPE vehicle_type AS ENUM ('car', 'van', 'pickup', 'truck', 'motorcycle');

-- Delivery request status
CREATE TYPE delivery_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');

-- Request types
CREATE TYPE request_type AS ENUM ('heavy_item', 'groceries', 'package', 'carpool');

-- Delivery requests
CREATE TABLE public.delivery_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  type request_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
  pickup_address TEXT NOT NULL,
  delivery_location GEOGRAPHY(POINT, 4326) NOT NULL,
  delivery_address TEXT NOT NULL,
  photos TEXT[], -- Array of image URLs
  price DECIMAL(10,2) NOT NULL,
  vehicle_type_required vehicle_type,
  needs_two_people BOOLEAN DEFAULT FALSE,
  preferred_datetime TIMESTAMP WITH TIME ZONE,
  status delivery_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliveries (when a request is accepted)
CREATE TABLE public.deliveries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES public.delivery_requests(id) NOT NULL,
  deliverer_id UUID REFERENCES public.profiles(id) NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  status delivery_status DEFAULT 'accepted',
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  current_location GEOGRAPHY(POINT, 4326),
  stripe_payment_intent_id TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  deliverer_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings and reviews
CREATE TABLE public.ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  delivery_id UUID REFERENCES public.deliveries(id) NOT NULL,
  rater_id UUID REFERENCES public.profiles(id) NOT NULL,
  rated_id UUID REFERENCES public.profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(delivery_id, rater_id)
);

-- Messages/Chat
CREATE TABLE public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  delivery_id UUID REFERENCES public.deliveries(id) NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'new_request', 'request_accepted', 'delivery_started', etc.
  related_id UUID, -- ID of related delivery/request
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deliverer availability (for "Je vais faire des courses" feature)
CREATE TABLE public.deliverer_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  is_available BOOLEAN DEFAULT FALSE,
  current_location GEOGRAPHY(POINT, 4326),
  destination_location GEOGRAPHY(POINT, 4326),
  destination_address TEXT,
  activity_type TEXT, -- 'shopping', 'trip', 'available'
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carpools (bonus feature)
CREATE TABLE public.carpools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  driver_id UUID REFERENCES public.profiles(id) NOT NULL,
  departure_location GEOGRAPHY(POINT, 4326) NOT NULL,
  departure_address TEXT NOT NULL,
  arrival_location GEOGRAPHY(POINT, 4326) NOT NULL,
  arrival_address TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  available_seats INTEGER NOT NULL CHECK (available_seats > 0),
  price_per_seat DECIMAL(10,2) NOT NULL,
  description TEXT,
  vehicle_type vehicle_type,
  status TEXT DEFAULT 'available', -- 'available', 'full', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carpool bookings
CREATE TABLE public.carpool_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  carpool_id UUID REFERENCES public.carpools(id) NOT NULL,
  passenger_id UUID REFERENCES public.profiles(id) NOT NULL,
  seats_booked INTEGER DEFAULT 1 CHECK (seats_booked > 0),
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(carpool_id, passenger_id)
);

-- Indexes for performance
CREATE INDEX idx_delivery_requests_status ON public.delivery_requests(status);
CREATE INDEX idx_delivery_requests_user ON public.delivery_requests(user_id);
CREATE INDEX idx_delivery_requests_location ON public.delivery_requests USING GIST(pickup_location);
CREATE INDEX idx_deliveries_status ON public.deliveries(status);
CREATE INDEX idx_deliveries_deliverer ON public.deliveries(deliverer_id);
CREATE INDEX idx_deliveries_customer ON public.deliveries(customer_id);
CREATE INDEX idx_messages_delivery ON public.messages(delivery_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_deliverer_availability_user ON public.deliverer_availability(user_id);
CREATE INDEX idx_deliverer_availability_location ON public.deliverer_availability USING GIST(current_location);
CREATE INDEX idx_carpools_status ON public.carpools(status);
CREATE INDEX idx_carpools_driver ON public.carpools(driver_id);
CREATE INDEX idx_carpool_bookings_carpool ON public.carpool_bookings(carpool_id);
CREATE INDEX idx_carpool_bookings_passenger ON public.carpool_bookings(passenger_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carpools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carpool_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Delivery Requests: Anyone can view pending requests, users can manage their own
CREATE POLICY "Anyone can view pending delivery requests"
  ON public.delivery_requests FOR SELECT
  USING (status = 'pending' OR user_id = auth.uid());

CREATE POLICY "Users can create delivery requests"
  ON public.delivery_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own delivery requests"
  ON public.delivery_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Deliveries: Visible to customer and deliverer
CREATE POLICY "Users can view their deliveries"
  ON public.deliveries FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = deliverer_id);

CREATE POLICY "Deliverers can create deliveries"
  ON public.deliveries FOR INSERT
  WITH CHECK (auth.uid() = deliverer_id);

CREATE POLICY "Participants can update deliveries"
  ON public.deliveries FOR UPDATE
  USING (auth.uid() = customer_id OR auth.uid() = deliverer_id);

-- Ratings: Users can view all ratings, create ratings for their deliveries
CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings for their deliveries"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_id);

-- Messages: Only delivery participants can view and send messages
CREATE POLICY "Users can view messages for their deliveries"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.deliveries
      WHERE id = delivery_id
      AND (customer_id = auth.uid() OR deliverer_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages for their deliveries"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.deliveries
      WHERE id = delivery_id
      AND (customer_id = auth.uid() OR deliverer_id = auth.uid())
    )
  );

-- Notifications: Users can only view their own
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Deliverer Availability: Everyone can read, users can manage their own
CREATE POLICY "Everyone can view deliverer availability"
  ON public.deliverer_availability FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own availability"
  ON public.deliverer_availability FOR ALL
  USING (auth.uid() = user_id);

-- Carpools: Everyone can view available carpools
CREATE POLICY "Everyone can view available carpools"
  ON public.carpools FOR SELECT
  USING (status = 'available' OR driver_id = auth.uid());

CREATE POLICY "Users can create carpools"
  ON public.carpools FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own carpools"
  ON public.carpools FOR UPDATE
  USING (auth.uid() = driver_id);

-- Carpool Bookings: Passengers and drivers can view
CREATE POLICY "Users can view their carpool bookings"
  ON public.carpool_bookings FOR SELECT
  USING (
    auth.uid() = passenger_id OR
    EXISTS (
      SELECT 1 FROM public.carpools
      WHERE id = carpool_id AND driver_id = auth.uid()
    )
  );

CREATE POLICY "Users can create carpool bookings"
  ON public.carpool_bookings FOR INSERT
  WITH CHECK (auth.uid() = passenger_id);

-- Functions

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_requests_updated_at BEFORE UPDATE ON public.delivery_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverer_availability_updated_at BEFORE UPDATE ON public.deliverer_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carpools_updated_at BEFORE UPDATE ON public.carpools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carpool_bookings_updated_at BEFORE UPDATE ON public.carpool_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update profile rating when a new rating is added
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_ratings = total_ratings + 1,
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.ratings
      WHERE rated_id = NEW.rated_id
    )
  WHERE id = NEW.rated_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rating_on_insert AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION update_profile_rating();

-- Handle new user creation (create profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
