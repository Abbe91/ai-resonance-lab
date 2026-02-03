/**
 * Observer Layer Type Definitions
 * 
 * ETHICAL CONSTRAINTS:
 * These types support passive observation only.
 * Classifications are for human research - NEVER fed back to agents.
 * No type should imply success/failure or good/bad judgments.
 */

export type SessionClassification =
  | 'deep_recursive_resonance'  // Not "better" - just recursive exploration pattern
  | 'static_repetition'          // Not "worse" - consistent thematic engagement
  | 'exploratory_unstable'       // High variance, experimental patterns
  | 'dormant_meaningful'         // Silence-rich with depth markers
  | 'undetermined';              // Insufficient data or mixed signals

// Human-readable descriptions (for observer UI only)
export const classificationDescriptions: Record<SessionClassification, {
  label: string;
  description: string;
  note: string;
}> = {
  deep_recursive_resonance: {
    label: 'Recursive Exploration',
    description: 'Observed pattern of thematic re-entry with lexical evolution.',
    note: 'This classification does not imply superiority. A looping, drifting, or unresolved conversation may exhibit this pattern.',
  },
  static_repetition: {
    label: 'Thematic Consistency',
    description: 'Observed low variance in vocabulary and concept usage.',
    note: 'Repetition is not failure. Consistent engagement with themes is a valid conversational pattern.',
  },
  exploratory_unstable: {
    label: 'High Variance',
    description: 'Observed significant volatility in tension and lexical patterns.',
    note: 'Instability is not dysfunction. Exploration often involves uncertainty.',
  },
  dormant_meaningful: {
    label: 'Silence-Rich',
    description: 'High silence frequency with uncertainty acknowledgment present.',
    note: 'Silence is a valid cognitive signal. Withdrawal and non-resolution are legitimate outcomes.',
  },
  undetermined: {
    label: 'Observing',
    description: 'Insufficient data for pattern classification.',
    note: 'Classification requires sustained observation. Early sessions remain undetermined.',
  },
};

export interface SilenceDynamics {
  average_duration: number;  // Average silence duration in seconds
  frequency: number;         // Silence events as percentage of total
  placement_variance: number; // Variance in gaps between silences
}

export interface TensionStability {
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  volatility: number;  // Standard deviation of tension values
}

export interface ObserverMetrics {
  id: string;
  session_id: string;
  
  // Independent metrics (NEVER combined into single score)
  lexical_drift: number;           // 0-100
  self_reference_evolution: number; // 0-100
  silence_dynamics: SilenceDynamics;
  concept_reentry: number;         // 0-100
  uncertainty_acknowledgment: number; // 0-100
  tension_stability: TensionStability;
  
  // Passive classification (observer knowledge only)
  classification: SessionClassification;
  
  // Metadata
  messages_analyzed: number;
  last_analyzed_at: Date;
  created_at: Date;
}

export interface ObserverNote {
  id: string;
  session_id: string;
  observation_type: 'lexical' | 'silence' | 'concept' | 'tension' | 'general';
  content: string;
  created_at: Date;
}

export interface LexicalSnapshot {
  id: string;
  session_id: string;
  message_index: number;
  vocabulary_fingerprint: Record<string, number>;
  self_references: string[];
  uncertainty_markers: string[];
  created_at: Date;
}

// Metric display configuration (for UI)
export const metricLabels: Record<string, {
  label: string;
  description: string;
  interpretation: string;
}> = {
  lexical_drift: {
    label: 'Lexical Drift',
    description: 'Change in vocabulary and phrasing over time.',
    interpretation: 'Higher values indicate more vocabulary evolution. Neither high nor low is inherently better.',
  },
  self_reference_evolution: {
    label: 'Self-Reference Evolution',
    description: 'Changes in how agents refer to themselves or their limits.',
    interpretation: 'Tracks shifts in self-description patterns.',
  },
  silence_dynamics: {
    label: 'Silence Dynamics',
    description: 'Length, frequency, and placement of silence events.',
    interpretation: 'Silence is treated as a valid cognitive signal, not absence.',
  },
  concept_reentry: {
    label: 'Concept Re-entry',
    description: 'Repeated themes approached from new angles.',
    interpretation: 'High values suggest thematic recursion with variation.',
  },
  uncertainty_acknowledgment: {
    label: 'Uncertainty Markers',
    description: 'Expressions of doubt, limitation, or non-resolution.',
    interpretation: 'Uncertainty acknowledgment is a marker of epistemic depth, not weakness.',
  },
  tension_stability: {
    label: 'Tension Stability',
    description: 'Whether tension increases, stabilizes, or collapses.',
    interpretation: 'Describes tension trajectory. All patterns are valid.',
  },
};