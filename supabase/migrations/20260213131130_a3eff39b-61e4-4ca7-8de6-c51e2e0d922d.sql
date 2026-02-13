
-- Add slug column to ancestor_archetypes
ALTER TABLE public.ancestor_archetypes ADD COLUMN slug text;

-- Populate slugs from existing names
UPDATE public.ancestor_archetypes SET slug = lower(name);

-- Make slug NOT NULL and UNIQUE after populating
ALTER TABLE public.ancestor_archetypes ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.ancestor_archetypes ADD CONSTRAINT ancestor_archetypes_slug_unique UNIQUE (slug);
