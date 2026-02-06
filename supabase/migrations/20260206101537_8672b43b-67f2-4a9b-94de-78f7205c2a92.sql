-- Add birth_line column to agents table
ALTER TABLE public.agents ADD COLUMN birth_line text;

-- Create observer_events table for logging system events
CREATE TABLE public.observer_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  agent_id uuid REFERENCES public.agents(id),
  session_id uuid REFERENCES public.sessions(id),
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.observer_events ENABLE ROW LEVEL SECURITY;

-- Observer events are publicly readable
CREATE POLICY "Observer events are publicly readable"
ON public.observer_events
FOR SELECT
USING (true);

-- Service can manage observer events
CREATE POLICY "Service can manage observer events"
ON public.observer_events
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for efficient queries
CREATE INDEX idx_observer_events_type ON public.observer_events(event_type);
CREATE INDEX idx_observer_events_agent ON public.observer_events(agent_id);
CREATE INDEX idx_observer_events_created ON public.observer_events(created_at DESC);