import { calculatePrice, PRICING_GRID, calculatePlatformFee } from '../src/constants/pricing';
import { calculateSuggestedPrice } from '../src/constants';

describe('Pricing Calculations', () => {
  describe('calculatePrice', () => {
    it('should calculate correct price for package delivery', () => {
      const result = calculatePrice('package', 10, false, false);

      expect(result.breakdown.basePrice).toBe(8);
      expect(result.breakdown.pricePerKm).toBe(10); // 10km * 1€/km
      expect(result.breakdown.twoPeopleMultiplier).toBe(0);
      expect(result.breakdown.vehicleBonus).toBe(0);
      expect(result.total).toBe(18);
    });

    it('should apply two people multiplier correctly', () => {
      const result = calculatePrice('heavy_item', 10, true, false);

      // base: 15, distance: 10*2.5=25, total: 40, with multiplier: 40*1.5=60
      expect(result.breakdown.twoPeopleMultiplier).toBeGreaterThan(0);
      expect(result.total).toBe(60);
    });

    it('should add vehicle bonus when required', () => {
      const result = calculatePrice('heavy_item', 10, false, true);

      // base: 15, distance: 25, vehicle: 10, total: 50
      expect(result.breakdown.vehicleBonus).toBe(10);
      expect(result.total).toBe(50);
    });

    it('should respect minimum price', () => {
      const result = calculatePrice('package', 0.5, false, false);
      const minPrice = PRICING_GRID.package.minPrice;

      expect(result.total).toBeGreaterThanOrEqual(minPrice);
    });

    it('should respect maximum price', () => {
      const result = calculatePrice('package', 200, false, false);
      const maxPrice = PRICING_GRID.package.maxPrice;

      expect(result.total).toBeLessThanOrEqual(maxPrice);
    });

    it('should calculate groceries delivery correctly', () => {
      const result = calculatePrice('groceries', 5, false, false);

      // base: 10, distance: 5*1.2=6, total: 16
      expect(result.breakdown.basePrice).toBe(10);
      expect(result.breakdown.pricePerKm).toBe(6);
      expect(result.total).toBe(16);
    });

    it('should calculate carpool correctly', () => {
      const result = calculatePrice('carpool', 20, false, false);

      // base: 5, distance: 20*0.8=16, total: 21
      expect(result.breakdown.basePrice).toBe(5);
      expect(result.breakdown.pricePerKm).toBe(16);
      expect(result.total).toBe(21);
    });
  });

  describe('calculateSuggestedPrice', () => {
    it('should suggest correct price for package', () => {
      const price = calculateSuggestedPrice('package', 10, false);
      expect(price).toBe(18); // base 8 + 10km*1
    });

    it('should suggest correct price with two people', () => {
      const price = calculateSuggestedPrice('heavy_item', 10, true);
      expect(price).toBe(60); // (15 + 25) * 1.5
    });

    it('should handle zero distance', () => {
      const price = calculateSuggestedPrice('package', 0, false);
      expect(price).toBeGreaterThanOrEqual(PRICING_GRID.package.minPrice);
    });

    it('should handle very long distance', () => {
      const price = calculateSuggestedPrice('package', 1000, false);
      expect(price).toBeLessThanOrEqual(PRICING_GRID.package.maxPrice);
    });
  });

  describe('calculatePlatformFee', () => {
    it('should calculate correct fee for standard delivery', () => {
      const fee = calculatePlatformFee(20);
      // 20 * 0.15 + 0.99 = 3.99
      expect(fee).toBeCloseTo(3.99, 2);
    });

    it('should apply minimum fee', () => {
      const fee = calculatePlatformFee(1);
      // 1 * 0.15 + 0.99 = 1.14, but minimum is 1.50
      expect(fee).toBe(1.50);
    });

    it('should not apply fee on tips', () => {
      const fee = calculatePlatformFee(5, true);
      expect(fee).toBe(0);
    });

    it('should calculate fee for large amount', () => {
      const fee = calculatePlatformFee(100);
      // 100 * 0.15 + 0.99 = 15.99
      expect(fee).toBeCloseTo(15.99, 2);
    });

    it('should handle zero amount', () => {
      const fee = calculatePlatformFee(0);
      expect(fee).toBe(1.50); // minimum fee
    });

    it('should handle negative amount gracefully', () => {
      const fee = calculatePlatformFee(-10);
      expect(fee).toBe(1.50); // minimum fee
    });
  });
});
