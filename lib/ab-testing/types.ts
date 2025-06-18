/**
 * A/B Testing Framework Types
 * Defines the structure for experiments, variants, and configurations
 */

export interface ExperimentVariant {
  id: string;
  name: string;
  weight: number; // 0-100, represents percentage allocation
  config?: Record<string, any>; // Optional variant-specific configuration
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  variants: ExperimentVariant[];
  startDate?: Date;
  endDate?: Date;
  targetingRules?: TargetingRule[];
  minimumSampleSize?: number;
}

export interface TargetingRule {
  type: 'url' | 'cookie' | 'header' | 'custom';
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
  value: string;
}

export interface VariantAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  userId: string;
}

export interface ExperimentExposure {
  experimentId: string;
  variantId: string;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface EdgeConfigExperiment {
  experiments: Record<string, Experiment>;
  lastUpdated: string;
}

export interface ABTestContextValue {
  experiments: Map<string, Experiment>;
  assignments: Map<string, VariantAssignment>;
  getVariant: (experimentId: string) => string | null;
  trackExposure: (experimentId: string, metadata?: Record<string, any>) => void;
  isInVariant: (experimentId: string, variantId: string) => boolean;
  refreshExperiments: () => Promise<void>;
}