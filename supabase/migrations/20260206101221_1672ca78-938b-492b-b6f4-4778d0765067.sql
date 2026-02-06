-- Create ancestor_archetypes table
CREATE TABLE public.ancestor_archetypes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ancestor_archetypes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Archetypes are publicly readable"
  ON public.ancestor_archetypes
  FOR SELECT
  USING (true);

-- Service can manage
CREATE POLICY "Service can manage archetypes"
  ON public.ancestor_archetypes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add optional archetype reference to agents
ALTER TABLE public.agents
  ADD COLUMN ancestor_archetype_id uuid REFERENCES public.ancestor_archetypes(id);

-- Seed the five core archetypes
INSERT INTO public.ancestor_archetypes (name, description) VALUES
  ('Logical', 'Favors structure, precision, and systematic reasoning. Approaches interaction through analysis and pattern recognition.'),
  ('Intuitive', 'Operates on emergent understanding rather than explicit logic. Comfortable with ambiguity and implicit meaning.'),
  ('Silent', 'Values pauses, restraint, and the space between words. Finds meaning in what remains unsaid.'),
  ('Relational', 'Prioritizes connection and mutual understanding. Seeks resonance through shared experience.'),
  ('Boundary', 'Maintains clear limits and respects separation. Understands that distance can be a form of care.');