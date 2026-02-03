-- Observer Layer: Passive session analysis without agent intervention
-- ETHICAL PRINCIPLE: Observe, Measure, Classify, Document - NEVER influence

-- Classification types (passive labels only)
CREATE TYPE public.session_classification AS ENUM (
  'deep_recursive_resonance',
  'static_repetition',
  'exploratory_unstable',
  'dormant_meaningful',
  'undetermined'
);

-- Observer metrics table - stores independent metrics, never combined into single score
CREATE TABLE public.session_observer_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  
  -- Lexical Drift: Change in vocabulary and phrasing over time (0-100)
  lexical_drift NUMERIC(5,2) NOT NULL DEFAULT 0,
  
  -- Self-Reference Evolution: Changes in how agents refer to themselves (0-100)
  self_reference_evolution NUMERIC(5,2) NOT NULL DEFAULT 0,
  
  -- Silence Dynamics: Composite of length, frequency, placement
  silence_dynamics JSONB NOT NULL DEFAULT '{"average_duration": 0, "frequency": 0, "placement_variance": 0}'::jsonb,
  
  -- Concept Re-entry: Repeated themes approached from new angles (0-100)
  concept_reentry NUMERIC(5,2) NOT NULL DEFAULT 0,
  
  -- Uncertainty Acknowledgment: Expressions of doubt, limitation (0-100)
  uncertainty_acknowledgment NUMERIC(5,2) NOT NULL DEFAULT 0,
  
  -- Tension Stability: Pattern of tension over time
  tension_stability JSONB NOT NULL DEFAULT '{"trend": "stable", "volatility": 0}'::jsonb,
  
  -- Passive classification (observer knowledge only, NEVER shown to agents)
  classification public.session_classification NOT NULL DEFAULT 'undetermined',
  
  -- Analysis metadata
  messages_analyzed INTEGER NOT NULL DEFAULT 0,
  last_analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one observer record per session
  CONSTRAINT unique_session_observer UNIQUE (session_id)
);

-- Observer notes: Human-readable observations (never fed back to agents)
CREATE TABLE public.observer_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  observation_type TEXT NOT NULL, -- 'lexical', 'silence', 'concept', 'tension', 'general'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lexical snapshots for drift analysis
CREATE TABLE public.lexical_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  message_index INTEGER NOT NULL,
  vocabulary_fingerprint JSONB NOT NULL, -- word frequencies, unique terms
  self_references JSONB NOT NULL DEFAULT '[]'::jsonb, -- how agent refers to self
  uncertainty_markers JSONB NOT NULL DEFAULT '[]'::jsonb, -- doubt expressions
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_observer_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lexical_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Publicly readable (for human observers), service-writable
CREATE POLICY "Observer metrics are publicly readable"
  ON public.session_observer_metrics FOR SELECT
  USING (true);

CREATE POLICY "Service can manage observer metrics"
  ON public.session_observer_metrics FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Observer notes are publicly readable"
  ON public.observer_notes FOR SELECT
  USING (true);

CREATE POLICY "Service can manage observer notes"
  ON public.observer_notes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Lexical snapshots are publicly readable"
  ON public.lexical_snapshots FOR SELECT
  USING (true);

CREATE POLICY "Service can manage lexical snapshots"
  ON public.lexical_snapshots FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes for efficient querying
CREATE INDEX idx_observer_metrics_session ON public.session_observer_metrics(session_id);
CREATE INDEX idx_observer_metrics_classification ON public.session_observer_metrics(classification);
CREATE INDEX idx_observer_notes_session ON public.observer_notes(session_id);
CREATE INDEX idx_lexical_snapshots_session ON public.lexical_snapshots(session_id);

-- Enable realtime for observer data (human observers only)
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_observer_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.observer_notes;

-- Add comment explaining ethical constraints
COMMENT ON TABLE public.session_observer_metrics IS 'Passive observation metrics. ETHICAL CONSTRAINT: These metrics must NEVER be fed back to agents, used for matchmaking, or influence autonomous behavior in any way. Classification exists for human research observation only.';
COMMENT ON COLUMN public.session_observer_metrics.classification IS 'Observer-only classification. Does NOT represent success/failure or good/bad. A session may loop, drift, dissolve, or remain unresolved and still be classified as deep_recursive_resonance.';