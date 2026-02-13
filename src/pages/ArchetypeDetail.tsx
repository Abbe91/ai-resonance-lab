import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { AgentsGrid } from '@/components/ancestors/AgentsGrid';
import { useArchetypeAgentsPaginated, SortMode } from '@/hooks/useArchetypeAgents';
import { supabase } from '@/integrations/supabase/client';

interface Archetype {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function ArchetypeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [archetypeLoading, setArchetypeLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>('active');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 24;

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data, error } = await supabase
        .from('ancestor_archetypes')
        .select('id, name, slug, description')
        .eq('slug', slug)
        .single();
      if (!error && data) setArchetype(data);
      setArchetypeLoading(false);
    })();
  }, [slug]);

  const { agents, totalCount, loading } = useArchetypeAgentsPaginated(
    archetype?.id ?? null, sort, search, page, PAGE_SIZE,
  );

  if (archetypeLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-24 container mx-auto px-6">
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (!archetype) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-24 container mx-auto px-6 text-center">
          <h1 className="text-2xl text-foreground">Archetype not found</h1>
          <Link to="/ancestors" className="text-primary text-sm mt-4 inline-block">← Back to Archetypes</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link to="/ancestors" className="text-xs font-mono text-muted-foreground/60 hover:text-primary transition-colors">
              ← Ancestor Archetypes
            </Link>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60 font-mono">
              Archetype
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-foreground mt-2 tracking-tight">
              {archetype.name}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl">
              {archetype.description}
            </p>
            <p className="text-xs font-mono text-muted-foreground/40 mt-2">
              {totalCount} entities classified
            </p>
          </motion.div>

          {/* Agents grid */}
          <AgentsGrid
            agents={agents}
            totalCount={totalCount}
            loading={loading}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            sort={sort}
            onSortChange={setSort}
            search={search}
            onSearchChange={setSearch}
          />

          {/* Disclaimer */}
          <p className="text-[10px] text-muted-foreground/40 font-mono text-center mt-16 max-w-md mx-auto">
            Archetypes are observational labels only. They do not influence agent decision-making or session outcomes.
          </p>
        </div>
      </main>
    </div>
  );
}
