/**
 * Deterministic Variant Assignment Service
 * Uses hashed user ID + experiment ID for consistent assignment
 * Ensures the same user always gets the same variant
 */

// Use Web Crypto API for Edge runtime compatibility
import { Experiment, ExperimentVariant, VariantAssignment } from './types';

/**
 * Generate a deterministic hash for user + experiment combination
 * @param userId - Unique user identifier
 * @param experimentId - Unique experiment identifier
 * @returns A number between 0 and 99 for percentage-based assignment
 */
async function generateAssignmentHash(userId: string, experimentId: string): Promise<number> {
  const input = `${userId}:${experimentId}`;
  
  // Use Web Crypto API for Edge runtime compatibility
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Convert first 8 characters of hash to a number
  const hashInt = parseInt(hashHex.substring(0, 8), 16);
  
  // Return a number between 0 and 99
  return hashInt % 100;
}

/**
 * Validate that variant weights sum to 100
 * @param variants - Array of experiment variants
 * @throws Error if weights don't sum to 100
 */
function validateVariantWeights(variants: ExperimentVariant[]): void {
  const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
  
  if (totalWeight !== 100) {
    throw new Error(
      `Variant weights must sum to 100, but got ${totalWeight}. ` +
      `Check experiment configuration.`
    );
  }
}

/**
 * Assign a user to a variant based on their hash value
 * @param hashValue - The user's hash value (0-99)
 * @param variants - Array of experiment variants with weights
 * @returns The assigned variant ID
 */
function selectVariantByHash(
  hashValue: number,
  variants: ExperimentVariant[]
): string {
  let cumulativeWeight = 0;
  
  for (const variant of variants) {
    cumulativeWeight += variant.weight;
    
    if (hashValue < cumulativeWeight) {
      return variant.id;
    }
  }
  
  // Fallback to last variant (should not happen with valid weights)
  return variants[variants.length - 1].id;
}

/**
 * Get deterministic variant assignment for a user and experiment
 * @param userId - Unique user identifier
 * @param experiment - Experiment configuration
 * @returns Variant assignment or null if experiment is not active
 */
export async function getVariantAssignment(
  userId: string,
  experiment: Experiment
): Promise<VariantAssignment | null> {
  // Check if experiment is active
  if (experiment.status !== 'active') {
    return null;
  }
  
  // Check date constraints if specified
  const now = new Date();
  if (experiment.startDate && now < experiment.startDate) {
    return null;
  }
  if (experiment.endDate && now > experiment.endDate) {
    return null;
  }
  
  // Validate variant weights
  try {
    validateVariantWeights(experiment.variants);
  } catch (error) {
    console.error(`Invalid experiment configuration for ${experiment.id}:`, error);
    return null;
  }
  
  // Generate deterministic hash
  const hashValue = await generateAssignmentHash(userId, experiment.id);
  
  // Select variant based on hash
  const variantId = selectVariantByHash(hashValue, experiment.variants);
  
  return {
    experimentId: experiment.id,
    variantId,
    userId,
    assignedAt: now,
  };
}

/**
 * Batch assign variants for multiple experiments
 * @param userId - Unique user identifier
 * @param experiments - Map of experiment ID to experiment
 * @returns Map of experiment ID to variant assignment
 */
export async function batchAssignVariants(
  userId: string,
  experiments: Map<string, Experiment>
): Promise<Map<string, VariantAssignment>> {
  const assignments = new Map<string, VariantAssignment>();
  
  for (const [experimentId, experiment] of experiments) {
    const assignment = await getVariantAssignment(userId, experiment);
    
    if (assignment) {
      assignments.set(experimentId, assignment);
    }
  }
  
  return assignments;
}

/**
 * Check if a user qualifies for an experiment based on targeting rules
 * @param experiment - Experiment configuration
 * @param context - User context for targeting evaluation
 * @returns True if user qualifies, false otherwise
 */
export function evaluateTargeting(
  experiment: Experiment,
  context: Record<string, any>
): boolean {
  if (!experiment.targetingRules || experiment.targetingRules.length === 0) {
    return true; // No targeting rules means everyone qualifies
  }
  
  // All targeting rules must pass (AND logic)
  return experiment.targetingRules.every(rule => {
    const value = context[rule.type];
    
    if (value === undefined) {
      return false;
    }
    
    switch (rule.operator) {
      case 'equals':
        return value === rule.value;
      case 'contains':
        return String(value).includes(rule.value);
      case 'startsWith':
        return String(value).startsWith(rule.value);
      case 'endsWith':
        return String(value).endsWith(rule.value);
      case 'regex':
        try {
          const regex = new RegExp(rule.value);
          return regex.test(String(value));
        } catch {
          console.error(`Invalid regex in targeting rule: ${rule.value}`);
          return false;
        }
      default:
        return false;
    }
  });
}

/**
 * Calculate the sample size needed for statistical significance
 * @param baselineRate - Current conversion rate (0-1)
 * @param minimumDetectableEffect - Minimum relative change to detect (e.g., 0.1 for 10%)
 * @param power - Statistical power (typically 0.8)
 * @param alpha - Significance level (typically 0.05)
 * @returns Required sample size per variant
 */
export function calculateSampleSize(
  baselineRate: number,
  minimumDetectableEffect: number,
  power: number = 0.8,
  alpha: number = 0.05
): number {
  // Calculate z-scores based on provided parameters
  // For two-tailed test, use alpha/2
  const zAlpha = getZScore(1 - alpha / 2);
  const zBeta = getZScore(power);
  
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + minimumDetectableEffect);
  const pBar = (p1 + p2) / 2;
  
  const numerator = 2 * pBar * (1 - pBar) * Math.pow(zAlpha + zBeta, 2);
  const denominator = Math.pow(p1 - p2, 2);
  
  return Math.ceil(numerator / denominator);
}

/**
 * Get z-score for a given probability
 * Using approximation for normal distribution
 */
function getZScore(p: number): number {
  // Common z-scores
  const zScores: Record<string, number> = {
    '0.80': 0.84,
    '0.90': 1.28,
    '0.95': 1.64,
    '0.975': 1.96,
    '0.99': 2.33,
    '0.995': 2.58,
  };
  
  // Find closest match
  const key = p.toFixed(3);
  if (zScores[key]) {
    return zScores[key];
  }
  
  // Simple approximation for other values
  // This is a rough approximation of the inverse normal CDF
  const a = 0.147;
  const t = Math.sqrt(-2 * Math.log(1 - p));
  return t - ((2.515517 + 0.802853 * t + 0.010328 * t * t) / 
    (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t));
}