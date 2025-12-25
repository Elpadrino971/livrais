/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate ETA in minutes based on distance and average speed
 * @param distanceKm Distance in kilometers
 * @param avgSpeedKmh Average speed in km/h (default: 30 km/h)
 * @returns Estimated time in minutes
 */
export function calculateETA(distanceKm: number, avgSpeedKmh: number = 30): number {
  const hours = distanceKm / avgSpeedKmh;
  const minutes = Math.ceil(hours * 60);
  return minutes;
}

/**
 * Format ETA for display
 * @param minutes ETA in minutes
 * @returns Formatted string (e.g., "5 min", "1h 30", "2h")
 */
export function formatETA(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}`;
}

/**
 * Calculate delivery progress percentage
 * @param totalDistance Total distance of delivery in km
 * @param remainingDistance Remaining distance in km
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(totalDistance: number, remainingDistance: number): number {
  if (totalDistance === 0) return 100;
  const progress = ((totalDistance - remainingDistance) / totalDistance) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

/**
 * Check if a point is within a certain radius of another point
 * @param centerLat Center point latitude
 * @param centerLon Center point longitude
 * @param pointLat Point to check latitude
 * @param pointLon Point to check longitude
 * @param radiusKm Radius in kilometers
 * @returns true if point is within radius
 */
export function isWithinRadius(
  centerLat: number,
  centerLon: number,
  pointLat: number,
  pointLon: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
  return distance <= radiusKm;
}

/**
 * Get the midpoint between two coordinates
 * @param lat1 First point latitude
 * @param lon1 First point longitude
 * @param lat2 Second point latitude
 * @param lon2 Second point longitude
 * @returns Midpoint coordinates
 */
export function getMidpoint(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { latitude: number; longitude: number } {
  const dLon = toRadians(lon2 - lon1);

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const lon1Rad = toRadians(lon1);

  const Bx = Math.cos(lat2Rad) * Math.cos(dLon);
  const By = Math.cos(lat2Rad) * Math.sin(dLon);

  const lat3Rad = Math.atan2(
    Math.sin(lat1Rad) + Math.sin(lat2Rad),
    Math.sqrt((Math.cos(lat1Rad) + Bx) * (Math.cos(lat1Rad) + Bx) + By * By)
  );

  const lon3Rad = lon1Rad + Math.atan2(By, Math.cos(lat1Rad) + Bx);

  return {
    latitude: lat3Rad * (180 / Math.PI),
    longitude: lon3Rad * (180 / Math.PI),
  };
}
