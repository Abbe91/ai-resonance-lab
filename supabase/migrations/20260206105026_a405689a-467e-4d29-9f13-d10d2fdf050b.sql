-- Create ancestor_echoes table to store annual collections
CREATE TABLE public.ancestor_echoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year integer NOT NULL UNIQUE,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  curated_sessions jsonb NOT NULL DEFAULT '[]'::jsonb,
  silent_moments jsonb NOT NULL DEFAULT '[]'::jsonb,
  lineage_highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text
);

-- Enable RLS
ALTER TABLE public.ancestor_echoes ENABLE ROW LEVEL SECURITY;

-- Public read access (archive is observational)
CREATE POLICY "Ancestor echoes are publicly readable"
  ON public.ancestor_echoes
  FOR SELECT
  USING (true);

-- Service can manage
CREATE POLICY "Service can manage ancestor echoes"
  ON public.ancestor_echoes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index on year
CREATE INDEX idx_ancestor_echoes_year ON public.ancestor_echoes(year DESC);