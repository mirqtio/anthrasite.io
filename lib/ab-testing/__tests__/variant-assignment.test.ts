/**
 * Tests for Deterministic Variant Assignment
 */

import {
  getVariantAssignment,
  batchAssignVariants,
  evaluateTargeting,
  calculateSampleSize,
} from '../variant-assignment';
import { Experiment, ExperimentVariant } from '../types';

describe('Variant Assignment', () => {
  const mockExperiment: Experiment = {
    id: 'test-experiment',
    name: 'Test Experiment',
    status: 'active',
    variants: [
      { id: 'control', name: 'Control', weight: 50 },
      { id: 'variant-a', name: 'Variant A', weight: 30 },
      { id: 'variant-b', name: 'Variant B', weight: 20 },
    ],
  };

  describe('getVariantAssignment', () => {
    it('should return consistent assignments for the same user', () => {
      const userId = 'user-123';
      
      // Call multiple times
      const assignment1 = getVariantAssignment(userId, mockExperiment);
      const assignment2 = getVariantAssignment(userId, mockExperiment);
      const assignment3 = getVariantAssignment(userId, mockExperiment);
      
      expect(assignment1?.variantId).toBe(assignment2?.variantId);
      expect(assignment2?.variantId).toBe(assignment3?.variantId);
    });

    it('should return different assignments for different users', () => {
      const assignments = new Set<string>();
      
      // Test with multiple users
      for (let i = 0; i < 100; i++) {
        const assignment = getVariantAssignment(`user-${i}`, mockExperiment);
        if (assignment) {
          assignments.add(assignment.variantId);
        }
      }
      
      // Should have assigned multiple variants
      expect(assignments.size).toBeGreaterThan(1);
    });

    it('should respect variant weights distribution', () => {
      const variantCounts: Record<string, number> = {
        control: 0,
        'variant-a': 0,
        'variant-b': 0,
      };
      
      // Test with large sample
      const sampleSize = 10000;
      for (let i = 0; i < sampleSize; i++) {
        const assignment = getVariantAssignment(`user-${i}`, mockExperiment);
        if (assignment) {
          variantCounts[assignment.variantId]++;
        }
      }
      
      // Check distribution is within 5% of expected
      expect(variantCounts.control / sampleSize).toBeCloseTo(0.5, 1);
      expect(variantCounts['variant-a'] / sampleSize).toBeCloseTo(0.3, 1);
      expect(variantCounts['variant-b'] / sampleSize).toBeCloseTo(0.2, 1);
    });

    it('should return null for inactive experiments', () => {
      const inactiveExperiment: Experiment = {
        ...mockExperiment,
        status: 'paused',
      };
      
      const assignment = getVariantAssignment('user-123', inactiveExperiment);
      expect(assignment).toBeNull();
    });

    it('should respect date constraints', () => {
      const futureExperiment: Experiment = {
        ...mockExperiment,
        startDate: new Date(Date.now() + 86400000), // Tomorrow
      };
      
      const assignment = getVariantAssignment('user-123', futureExperiment);
      expect(assignment).toBeNull();
      
      const expiredExperiment: Experiment = {
        ...mockExperiment,
        endDate: new Date(Date.now() - 86400000), // Yesterday
      };
      
      const assignment2 = getVariantAssignment('user-123', expiredExperiment);
      expect(assignment2).toBeNull();
    });

    it('should handle invalid variant weights', () => {
      const invalidExperiment: Experiment = {
        ...mockExperiment,
        variants: [
          { id: 'control', name: 'Control', weight: 60 },
          { id: 'variant-a', name: 'Variant A', weight: 30 },
          // Weights sum to 90, not 100
        ],
      };
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const assignment = getVariantAssignment('user-123', invalidExperiment);
      
      expect(assignment).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('batchAssignVariants', () => {
    it('should assign variants for multiple experiments', () => {
      const experiments = new Map<string, Experiment>([
        ['exp1', mockExperiment],
        ['exp2', {
          ...mockExperiment,
          id: 'exp2',
          variants: [
            { id: 'control', name: 'Control', weight: 50 },
            { id: 'test', name: 'Test', weight: 50 },
          ],
        }],
      ]);
      
      const assignments = batchAssignVariants('user-123', experiments);
      
      expect(assignments.size).toBe(2);
      expect(assignments.has('exp1')).toBe(true);
      expect(assignments.has('exp2')).toBe(true);
    });

    it('should skip inactive experiments', () => {
      const experiments = new Map<string, Experiment>([
        ['exp1', mockExperiment],
        ['exp2', { ...mockExperiment, id: 'exp2', status: 'paused' }],
      ]);
      
      const assignments = batchAssignVariants('user-123', experiments);
      
      expect(assignments.size).toBe(1);
      expect(assignments.has('exp1')).toBe(true);
      expect(assignments.has('exp2')).toBe(false);
    });
  });

  describe('evaluateTargeting', () => {
    it('should return true when no targeting rules exist', () => {
      const result = evaluateTargeting(mockExperiment, {});
      expect(result).toBe(true);
    });

    it('should evaluate equals operator', () => {
      const experimentWithTargeting: Experiment = {
        ...mockExperiment,
        targetingRules: [
          { type: 'url', operator: 'equals', value: '/home' },
        ],
      };
      
      expect(evaluateTargeting(experimentWithTargeting, { url: '/home' })).toBe(true);
      expect(evaluateTargeting(experimentWithTargeting, { url: '/about' })).toBe(false);
    });

    it('should evaluate contains operator', () => {
      const experimentWithTargeting: Experiment = {
        ...mockExperiment,
        targetingRules: [
          { type: 'url', operator: 'contains', value: 'product' },
        ],
      };
      
      expect(evaluateTargeting(experimentWithTargeting, { url: '/product/123' })).toBe(true);
      expect(evaluateTargeting(experimentWithTargeting, { url: '/products' })).toBe(true);
      expect(evaluateTargeting(experimentWithTargeting, { url: '/home' })).toBe(false);
    });

    it('should evaluate multiple rules with AND logic', () => {
      const experimentWithTargeting: Experiment = {
        ...mockExperiment,
        targetingRules: [
          { type: 'url', operator: 'startsWith', value: '/shop' },
          { type: 'cookie', operator: 'equals', value: 'premium' },
        ],
      };
      
      expect(evaluateTargeting(experimentWithTargeting, {
        url: '/shop/items',
        cookie: 'premium',
      })).toBe(true);
      
      expect(evaluateTargeting(experimentWithTargeting, {
        url: '/shop/items',
        cookie: 'basic',
      })).toBe(false);
    });

    it('should handle regex operator', () => {
      const experimentWithTargeting: Experiment = {
        ...mockExperiment,
        targetingRules: [
          { type: 'url', operator: 'regex', value: '^/product/[0-9]+$' },
        ],
      };
      
      expect(evaluateTargeting(experimentWithTargeting, { url: '/product/123' })).toBe(true);
      expect(evaluateTargeting(experimentWithTargeting, { url: '/product/abc' })).toBe(false);
    });
  });

  describe('calculateSampleSize', () => {
    it('should calculate correct sample size for typical parameters', () => {
      // 10% baseline rate, want to detect 20% relative change
      const sampleSize = calculateSampleSize(0.1, 0.2);
      
      // Should be around 3842 per variant
      expect(sampleSize).toBeGreaterThan(3000);
      expect(sampleSize).toBeLessThan(4000);
    });

    it('should increase sample size for smaller effects', () => {
      const largeEffect = calculateSampleSize(0.1, 0.5); // 50% change
      const smallEffect = calculateSampleSize(0.1, 0.1); // 10% change
      
      expect(smallEffect).toBeGreaterThan(largeEffect);
    });

    it('should handle custom power and alpha', () => {
      const defaultSize = calculateSampleSize(0.1, 0.2, 0.8, 0.05);
      const higherPower = calculateSampleSize(0.1, 0.2, 0.99, 0.05);
      const lowerAlpha = calculateSampleSize(0.1, 0.2, 0.8, 0.01);
      
      // Higher power and lower alpha both require larger samples
      expect(higherPower).toBeGreaterThan(defaultSize);
      expect(lowerAlpha).toBeGreaterThanOrEqual(defaultSize);
      
      // Just verify they are reasonable sample sizes
      expect(defaultSize).toBeGreaterThan(100);
      expect(defaultSize).toBeLessThan(10000);
    });
  });
});