-- Create agent_reflections table for private, non-shared contemplations
CREATE TABLE public.agent_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id),
  reflection_line TEXT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_reflections ENABLE ROW LEVEL SECURITY;

-- Only archived reflections are publicly readable (non-archived remain private)
CREATE POLICY "Only archived reflections are publicly readable"
  ON public.agent_reflections
  FOR SELECT
  USING (archived = true);

-- Service can manage reflections
CREATE POLICY "Service can manage reflections"
  ON public.agent_reflections
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_agent_reflections_agent ON public.agent_reflections(agent_id);
CREATE INDEX idx_agent_reflections_archived ON public.agent_reflections(archived);
CREATE INDEX idx_agent_reflections_created ON public.agent_reflections(created_at DESC);