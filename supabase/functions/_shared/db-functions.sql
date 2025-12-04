-- Database function to get nearby delivery requests
CREATE OR REPLACE FUNCTION get_nearby_delivery_requests(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_km FLOAT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type request_type,
  title TEXT,
  description TEXT,
  pickup_location GEOGRAPHY,
  pickup_address TEXT,
  delivery_location GEOGRAPHY,
  delivery_address TEXT,
  photos TEXT[],
  price DECIMAL,
  vehicle_type_required vehicle_type,
  needs_two_people BOOLEAN,
  preferred_datetime TIMESTAMP WITH TIME ZONE,
  status delivery_status,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  distance_km FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dr.*,
    ST_Distance(
      dr.pickup_location::geography,
      ST_MakePoint(user_lng, user_lat)::geography
    ) / 1000 AS distance_km
  FROM delivery_requests dr
  WHERE
    dr.status = 'pending'
    AND ST_DWithin(
      dr.pickup_location::geography,
      ST_MakePoint(user_lng, user_lat)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;
