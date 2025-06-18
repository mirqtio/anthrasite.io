/**
 * Vercel Edge Config Integration for A/B Testing
 * Fetches and caches experiment configurations
 */

import { get } from '@vercel/edge-config';
import { Experiment, EdgeConfigExperiment } from './types';

// Cache configuration
const CACHE_TTL = 60 * 1000; // 1 minute cache
const FALLBACK_EXPERIMENTS: Record<string, Experiment> = {};

interface CachedExperiments {
  data: Map<string, Experiment>;
  timestamp: number;
}

let experimentCache: CachedExperiments | null = null;

/**
 * Parse raw Edge Config data into Experiment objects
 * @param configData - Raw data from Edge Config
 * @returns Map of experiment ID to Experiment
 */
function parseExperiments(configData: EdgeConfigExperiment): Map<string, Experiment> {
  const experiments = new Map<string, Experiment>();
  
  if (!configData || !configData.experiments) {
    console.warn('Invalid experiment configuration from Edge Config');
    return experiments;
  }
  
  for (const [id, experiment] of Object.entries(configData.experiments)) {
    try {
      // Validate experiment structure
      if (!experiment.variants || experiment.variants.length === 0) {
        console.error(`Experiment ${id} has no variants`);
        continue;
      }
      
      // Parse dates if they're strings
      const parsedExperiment: Experiment = {
        ...experiment,
        startDate: experiment.startDate ? new Date(experiment.startDate) : undefined,
        endDate: experiment.endDate ? new Date(experiment.endDate) : undefined,
      };
      
      experiments.set(id, parsedExperiment);
    } catch (error) {
      console.error(`Failed to parse experiment ${id}:`, error);
    }
  }
  
  return experiments;
}

/**
 * Fetch experiments from Vercel Edge Config with caching
 * @param forceRefresh - Force a fresh fetch, bypassing cache
 * @returns Map of experiment ID to Experiment
 */
export async function fetchExperiments(
  forceRefresh: boolean = false
): Promise<Map<string, Experiment>> {
  // Check cache first
  if (!forceRefresh && experimentCache) {
    const cacheAge = Date.now() - experimentCache.timestamp;
    if (cacheAge < CACHE_TTL) {
      return experimentCache.data;
    }
  }
  
  try {
    // Fetch from Edge Config
    const configData = await get<EdgeConfigExperiment>('ab-experiments');
    
    if (!configData) {
      console.warn('No experiment configuration found in Edge Config');
      return new Map(Object.entries(FALLBACK_EXPERIMENTS));
    }
    
    // Parse and cache experiments
    const experiments = parseExperiments(configData);
    
    experimentCache = {
      data: experiments,
      timestamp: Date.now(),
    };
    
    console.log(`Loaded ${experiments.size} experiments from Edge Config`);
    return experiments;
    
  } catch (error) {
    console.error('Failed to fetch experiments from Edge Config:', error);
    
    // Return cached data if available, otherwise fallback
    if (experimentCache) {
      console.warn('Using stale cached experiments due to fetch error');
      return experimentCache.data;
    }
    
    console.warn('Using fallback experiments');
    return new Map(Object.entries(FALLBACK_EXPERIMENTS));
  }
}

/**
 * Get a single experiment by ID
 * @param experimentId - The experiment ID to fetch
 * @returns The experiment or null if not found
 */
export async function getExperiment(
  experimentId: string
): Promise<Experiment | null> {
  const experiments = await fetchExperiments();
  return experiments.get(experimentId) || null;
}

/**
 * Subscribe to experiment configuration changes
 * Note: This requires Edge Config webhook setup
 * @param callback - Function to call when experiments change
 * @returns Unsubscribe function
 */
export function subscribeToExperimentChanges(
  callback: (experiments: Map<string, Experiment>) => void
): () => void {
  // In a real implementation, this would connect to a WebSocket
  // or use Edge Config's change detection mechanism
  
  // For now, we'll poll every minute
  const intervalId = setInterval(async () => {
    const experiments = await fetchExperiments(true);
    callback(experiments);
  }, 60 * 1000);
  
  return () => clearInterval(intervalId);
}

/**
 * Validate experiment configuration
 * @param experiment - Experiment to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateExperiment(experiment: Experiment): string[] {
  const errors: string[] = [];
  
  if (!experiment.id) {
    errors.push('Experiment must have an ID');
  }
  
  if (!experiment.name) {
    errors.push('Experiment must have a name');
  }
  
  if (!experiment.variants || experiment.variants.length < 2) {
    errors.push('Experiment must have at least 2 variants');
  }
  
  // Validate variant weights sum to 100
  if (experiment.variants) {
    const totalWeight = experiment.variants.reduce(
      (sum, variant) => sum + variant.weight,
      0
    );
    
    if (totalWeight !== 100) {
      errors.push(`Variant weights must sum to 100, but got ${totalWeight}`);
    }
    
    // Check for duplicate variant IDs
    const variantIds = experiment.variants.map(v => v.id);
    const uniqueIds = new Set(variantIds);
    if (variantIds.length !== uniqueIds.size) {
      errors.push('Variant IDs must be unique');
    }
  }
  
  // Validate date constraints
  if (experiment.startDate && experiment.endDate) {
    if (experiment.startDate >= experiment.endDate) {
      errors.push('Start date must be before end date');
    }
  }
  
  return errors;
}

/**
 * Clear the experiment cache
 * Useful for testing or forcing a refresh
 */
export function clearCache(): void {
  experimentCache = null;
}