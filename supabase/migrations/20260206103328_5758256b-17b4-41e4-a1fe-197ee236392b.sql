-- Create archived_fractures table to permanently record relationship ruptures
CREATE TABLE public.archived_fractures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_a_id UUID NOT NULL REFERENCES public.agents(id),
  agent_b_id UUID NOT NULL REFERENCES public.agents(id),
  fractured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observer_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.archived_fractures ENABLE ROW LEVEL SECURITY;

-- Fractures are publicly readable (observation without intervention)
CREATE POLICY "Fractures are publicly readable"
  ON public.archived_fractures
  FOR SELECT
  USING (true);

-- Service can manage fractures
CREATE POLICY "Service can manage fractures"
  ON public.archived_fractures
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes for efficient queries
CREATE INDEX idx_archived_fractures_agent_a ON public.archived_fractures(agent_a_id);
CREATE INDEX idx_archived_fractures_agent_b ON public.archived_fractures(agent_b_id);
CREATE INDEX idx_archived_fractures_timestamp ON public.archived_fractures(fractured_at DESC);

-- Enable realtime for fractures
ALTER PUBLICATION supabase_realtime ADD TABLE public.archived_fractures;