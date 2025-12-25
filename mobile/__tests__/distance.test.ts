import {
  calculateDistance,
  calculateETA,
  formatETA,
  calculateProgress,
  isWithinRadius,
  getMidpoint,
} from '../src/utils/distance';

describe('Distance Utilities', () => {
  describe('calculateDistance', () => {
    // Cayenne to Matoury (approx 10km)
    const cayenneLat = 4.9333;
    const cayenneLon = -52.3333;
    const matouryLat = 4.85;
    const matouryLon = -52.3167;

    it('should calculate distance between Cayenne and Matoury correctly', () => {
      const distance = calculateDistance(cayenneLat, cayenneLon, matouryLat, matouryLon);
      // Expected distance is approximately 9-11 km
      expect(distance).toBeGreaterThan(8);
      expect(distance).toBeLessThan(12);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(cayenneLat, cayenneLon, cayenneLat, cayenneLon);
      expect(distance).toBe(0);
    });

    it('should return same distance regardless of order', () => {
      const distance1 = calculateDistance(cayenneLat, cayenneLon, matouryLat, matouryLon);
      const distance2 = calculateDistance(matouryLat, matouryLon, cayenneLat, cayenneLon);
      expect(distance1).toBe(distance2);
    });

    it('should handle long distances correctly', () => {
      // Paris to Cayenne (approximately 7000km)
      const parisLat = 48.8566;
      const parisLon = 2.3522;
      const distance = calculateDistance(parisLat, parisLon, cayenneLat, cayenneLon);
      expect(distance).toBeGreaterThan(6500);
      expect(distance).toBeLessThan(7500);
    });

    it('should round to 1 decimal place', () => {
      const distance = calculateDistance(4.0, -52.0, 4.001, -52.001);
      const decimals = (distance.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateETA', () => {
    it('should calculate ETA with default speed (30 km/h)', () => {
      const eta = calculateETA(10);
      expect(eta).toBe(20); // 10km at 30km/h = 20 minutes
    });

    it('should calculate ETA with custom speed', () => {
      const eta = calculateETA(10, 60); // 60 km/h
      expect(eta).toBe(10); // 10km at 60km/h = 10 minutes
    });

    it('should round up to nearest minute', () => {
      const eta = calculateETA(5, 30); // 5km at 30km/h = 10 minutes exactly
      expect(eta).toBe(10);
    });

    it('should handle zero distance', () => {
      const eta = calculateETA(0);
      expect(eta).toBe(0);
    });

    it('should handle very long distances', () => {
      const eta = calculateETA(300, 30); // 300km at 30km/h = 600 minutes (10 hours)
      expect(eta).toBe(600);
    });
  });

  describe('formatETA', () => {
    it('should format minutes under 1 hour', () => {
      expect(formatETA(5)).toBe('5 min');
      expect(formatETA(30)).toBe('30 min');
      expect(formatETA(59)).toBe('59 min');
    });

    it('should format exact hours', () => {
      expect(formatETA(60)).toBe('1h');
      expect(formatETA(120)).toBe('2h');
      expect(formatETA(180)).toBe('3h');
    });

    it('should format hours with minutes', () => {
      expect(formatETA(65)).toBe('1h 5');
      expect(formatETA(90)).toBe('1h 30');
      expect(formatETA(125)).toBe('2h 5');
    });

    it('should handle zero minutes', () => {
      expect(formatETA(0)).toBe('0 min');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress correctly', () => {
      expect(calculateProgress(10, 5)).toBe(50); // 50% done
      expect(calculateProgress(10, 2)).toBe(80); // 80% done
      expect(calculateProgress(10, 8)).toBe(20); // 20% done
    });

    it('should return 100 when destination is reached', () => {
      expect(calculateProgress(10, 0)).toBe(100);
    });

    it('should return 0 when at start', () => {
      expect(calculateProgress(10, 10)).toBe(0);
    });

    it('should handle zero total distance', () => {
      expect(calculateProgress(0, 0)).toBe(100);
    });

    it('should cap at 100%', () => {
      expect(calculateProgress(10, -5)).toBe(100);
    });

    it('should cap at 0%', () => {
      expect(calculateProgress(10, 15)).toBe(0);
    });
  });

  describe('isWithinRadius', () => {
    const cayenneLat = 4.9333;
    const cayenneLon = -52.3333;
    const matouryLat = 4.85;
    const matouryLon = -52.3167;

    it('should return true when point is within radius', () => {
      // Matoury is approximately 10km from Cayenne
      const result = isWithinRadius(cayenneLat, cayenneLon, matouryLat, matouryLon, 15);
      expect(result).toBe(true);
    });

    it('should return false when point is outside radius', () => {
      // Matoury is approximately 10km from Cayenne
      const result = isWithinRadius(cayenneLat, cayenneLon, matouryLat, matouryLon, 5);
      expect(result).toBe(false);
    });

    it('should return true for same coordinates', () => {
      const result = isWithinRadius(cayenneLat, cayenneLon, cayenneLat, cayenneLon, 1);
      expect(result).toBe(true);
    });

    it('should handle zero radius', () => {
      const result = isWithinRadius(cayenneLat, cayenneLon, matouryLat, matouryLon, 0);
      expect(result).toBe(false);
    });
  });

  describe('getMidpoint', () => {
    it('should calculate midpoint correctly', () => {
      const point1 = { lat: 0, lon: 0 };
      const point2 = { lat: 2, lon: 2 };
      const midpoint = getMidpoint(point1.lat, point1.lon, point2.lat, point2.lon);

      // Midpoint should be approximately (1, 1)
      expect(midpoint.latitude).toBeCloseTo(1, 1);
      expect(midpoint.longitude).toBeCloseTo(1, 1);
    });

    it('should return same point when coordinates are identical', () => {
      const lat = 4.9333;
      const lon = -52.3333;
      const midpoint = getMidpoint(lat, lon, lat, lon);

      expect(midpoint.latitude).toBeCloseTo(lat, 4);
      expect(midpoint.longitude).toBeCloseTo(lon, 4);
    });

    it('should calculate midpoint between Cayenne and Matoury', () => {
      const cayenneLat = 4.9333;
      const cayenneLon = -52.3333;
      const matouryLat = 4.85;
      const matouryLon = -52.3167;

      const midpoint = getMidpoint(cayenneLat, cayenneLon, matouryLat, matouryLon);

      // Midpoint should be between the two coordinates
      expect(midpoint.latitude).toBeGreaterThan(matouryLat);
      expect(midpoint.latitude).toBeLessThan(cayenneLat);
      expect(midpoint.longitude).toBeGreaterThan(cayenneLon);
      expect(midpoint.longitude).toBeLessThan(matouryLon);
    });
  });
});
