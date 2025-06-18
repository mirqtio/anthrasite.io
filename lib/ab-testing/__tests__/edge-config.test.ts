/**
 * Tests for Edge Config Integration
 */

import { get } from '@vercel/edge-config'
import {
  fetchExperiments,
  getExperiment,
  validateExperiment,
  clearCache,
} from '../edge-config'
import { EdgeConfigExperiment } from '../types'

// Mock Edge Config
jest.mock('@vercel/edge-config')

describe('Edge Config Integration', () => {
  const mockExperimentData: EdgeConfigExperiment = {
    experiments: {
      'homepage-hero': {
        id: 'homepage-hero',
        name: 'Homepage Hero Test',
        status: 'active',
        variants: [
          { id: 'control', name: 'Control', weight: 50 },
          { id: 'variant-a', name: 'New Hero', weight: 50 },
        ],
      },
      'cta-color': {
        id: 'cta-color',
        name: 'CTA Color Test',
        status: 'active',
        variants: [
          { id: 'blue', name: 'Blue', weight: 33 },
          { id: 'green', name: 'Green', weight: 33 },
          { id: 'red', name: 'Red', weight: 34 },
        ],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
    },
    lastUpdated: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    clearCache()
  })

  describe('fetchExperiments', () => {
    it('should fetch and parse experiments from Edge Config', async () => {
      ;(get as jest.Mock).mockResolvedValue(mockExperimentData)

      const experiments = await fetchExperiments()

      expect(get).toHaveBeenCalledWith('ab-experiments')
      expect(experiments.size).toBe(2)
      expect(experiments.has('homepage-hero')).toBe(true)
      expect(experiments.has('cta-color')).toBe(true)
    })

    it('should cache experiments for subsequent calls', async () => {
      ;(get as jest.Mock).mockResolvedValue(mockExperimentData)

      // First call
      await fetchExperiments()
      expect(get).toHaveBeenCalledTimes(1)

      // Second call should use cache
      await fetchExperiments()
      expect(get).toHaveBeenCalledTimes(1)
    })

    it('should force refresh when requested', async () => {
      ;(get as jest.Mock).mockResolvedValue(mockExperimentData)

      // First call
      await fetchExperiments()

      // Force refresh
      await fetchExperiments(true)

      expect(get).toHaveBeenCalledTimes(2)
    })

    it('should handle Edge Config errors gracefully', async () => {
      ;(get as jest.Mock).mockRejectedValue(new Error('Network error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const experiments = await fetchExperiments()

      expect(experiments.size).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch experiments from Edge Config:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should use cached data on error if available', async () => {
      ;(get as jest.Mock)
        .mockResolvedValueOnce(mockExperimentData)
        .mockRejectedValueOnce(new Error('Network error'))

      // First call succeeds
      const experiments1 = await fetchExperiments()
      expect(experiments1.size).toBe(2)

      // Second call fails but uses cache
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const experiments2 = await fetchExperiments(true)

      expect(experiments2.size).toBe(2)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Using stale cached experiments due to fetch error'
      )

      consoleSpy.mockRestore()
    })

    it('should parse date strings to Date objects', async () => {
      ;(get as jest.Mock).mockResolvedValue(mockExperimentData)

      const experiments = await fetchExperiments()
      const ctaExperiment = experiments.get('cta-color')

      expect(ctaExperiment?.startDate).toBeInstanceOf(Date)
      expect(ctaExperiment?.endDate).toBeInstanceOf(Date)
    })

    it('should skip invalid experiments', async () => {
      const invalidData: EdgeConfigExperiment = {
        experiments: {
          valid: mockExperimentData.experiments['homepage-hero'],
          invalid: {
            id: 'invalid',
            name: 'Invalid Experiment',
            status: 'active',
            variants: [], // No variants
          },
        },
        lastUpdated: new Date().toISOString(),
      }

      ;(get as jest.Mock).mockResolvedValue(invalidData)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const experiments = await fetchExperiments()

      expect(experiments.size).toBe(1)
      expect(experiments.has('valid')).toBe(true)
      expect(experiments.has('invalid')).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Experiment invalid has no variants'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('getExperiment', () => {
    it('should fetch a single experiment by ID', async () => {
      ;(get as jest.Mock).mockResolvedValue(mockExperimentData)

      const experiment = await getExperiment('homepage-hero')

      expect(experiment).not.toBeNull()
      expect(experiment?.id).toBe('homepage-hero')
      expect(experiment?.name).toBe('Homepage Hero Test')
    })

    it('should return null for non-existent experiment', async () => {
      ;(get as jest.Mock).mockResolvedValue(mockExperimentData)

      const experiment = await getExperiment('non-existent')

      expect(experiment).toBeNull()
    })
  })

  describe('validateExperiment', () => {
    it('should validate a valid experiment', () => {
      const validExperiment = mockExperimentData.experiments['homepage-hero']
      const errors = validateExperiment(validExperiment)

      expect(errors).toHaveLength(0)
    })

    it('should detect missing ID', () => {
      const experiment = {
        ...mockExperimentData.experiments['homepage-hero'],
        id: '',
      }

      const errors = validateExperiment(experiment)
      expect(errors).toContain('Experiment must have an ID')
    })

    it('should detect missing name', () => {
      const experiment = {
        ...mockExperimentData.experiments['homepage-hero'],
        name: '',
      }

      const errors = validateExperiment(experiment)
      expect(errors).toContain('Experiment must have a name')
    })

    it('should detect insufficient variants', () => {
      const experiment = {
        ...mockExperimentData.experiments['homepage-hero'],
        variants: [{ id: 'only-one', name: 'Only One', weight: 100 }],
      }

      const errors = validateExperiment(experiment)
      expect(errors).toContain('Experiment must have at least 2 variants')
    })

    it('should detect invalid variant weights', () => {
      const experiment = {
        ...mockExperimentData.experiments['homepage-hero'],
        variants: [
          { id: 'control', name: 'Control', weight: 40 },
          { id: 'variant', name: 'Variant', weight: 50 },
        ],
      }

      const errors = validateExperiment(experiment)
      expect(errors).toContain('Variant weights must sum to 100, but got 90')
    })

    it('should detect duplicate variant IDs', () => {
      const experiment = {
        ...mockExperimentData.experiments['homepage-hero'],
        variants: [
          { id: 'same', name: 'Control', weight: 50 },
          { id: 'same', name: 'Variant', weight: 50 },
        ],
      }

      const errors = validateExperiment(experiment)
      expect(errors).toContain('Variant IDs must be unique')
    })

    it('should detect invalid date constraints', () => {
      const experiment = {
        ...mockExperimentData.experiments['homepage-hero'],
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-01-01'),
      }

      const errors = validateExperiment(experiment)
      expect(errors).toContain('Start date must be before end date')
    })
  })
})
