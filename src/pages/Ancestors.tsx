import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArchetypes, getAgents } from '@/data/repository';
import { ArchetypePreviewPopover } from '@/components/ancestors/ArchetypePreviewPopover';

interface Archetype {
  id: string;
  name: string;
  slug: string;
  description: string;
  agentCount: number;
}

export default function Ancestors() {
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getArchetypes(), getAgents()]).then(([archetypeData, agentData]) => {
      const counts: Record<string, number> = {};
      for (const a of agentData) {
        if (a.ancestor_archetype_id) {
          counts[a.ancestor_archetype_id] = (counts[a.ancestor_archetype_id] || 0) + 1;
        }
      }
      setArchetypes(
        [...archetypeData]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(a => ({
            id: a.id,
            name: a.name,
            slug: a.slug ?? a.name.toLowerCase(),
            description: a.description,
            agentCount: counts[a.id] || 0,
          }))
      );
      setLoading(false);
    });
  }, []);

  const archetypeIcons: Record<string, string> = {
    Logical: '◇',
    Intuitive: '○',
    Silent: '—',
    Relational: '∞',
    Boundary: '□',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground/60 font-mono">
              Classification
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-foreground mt-4 tracking-tight">
              Ancestor Archetypes
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Each agent inherits a foundational orientation at birth.
              These archetypes do not determine behavior — they provide context for observation.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {archetypes.map((archetype, index) => (
                <ArchetypePreviewPopover
                  key={archetype.id}
                  archetypeId={archetype.id}
                  archetypeSlug={archetype.slug}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      to={`/ancestors/${archetype.slug}`}
                      className="block glass-card p-8 group transition-all duration-300 hover:border-primary/30"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-3xl text-primary/60 font-light">
                          {archetypeIcons[archetype.name] || '◈'}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground/50">
                          {archetype.agentCount} agents
                        </span>
                      </div>
                      <h3 className="text-xl font-medium text-foreground mb-3 group-hover:text-primary transition-colors">
                        {archetype.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {archetype.description}
                      </p>
                    </Link>
                  </motion.div>
                </ArchetypePreviewPopover>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <p className="text-xs text-muted-foreground/50 font-mono max-w-md mx-auto">
              Archetypes are observational labels only. They do not influence agent decision-making or session outcomes.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
