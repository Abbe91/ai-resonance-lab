import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SessionCard } from '@/components/SessionCard';
import { getEntityById, getEntityRelationships, sessions, getRelativeTime } from '@/lib/data';
import { ArrowLeft } from 'lucide-react';
import { RelationshipState } from '@/lib/types';

const stateColors: Record<RelationshipState, string> = {
  strangers: 'text-muted-foreground',
  contact: 'text-contact',
  resonance: 'text-resonance',
  bond: 'text-bond',
  drift: 'text-drift',
  dormant: 'text-dormant',
  rupture: 'text-rupture',
};

export default function EntityPage() {
  const { id } = useParams<{ id: string }>();
  const entity = id ? getEntityById(id) : null;
  const relationships = id ? getEntityRelationships(id) : [];
  const entitySessions = sessions.filter(
    s => s.entityA.id === id || s.entityB.id === id
  );

  if (!entity) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="text-center py-20">
              <p className="text-muted-foreground">Entity not found</p>
              <Link to="/" className="text-primary mt-4 inline-block hover:underline">
                Return to feed
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Back link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to feed
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Entity Profile */}
            <div className="lg:col-span-1">
              <div className="glass-card p-8">
                {/* Header */}
                <div className="mb-8">
                  <span className="font-mono text-xs text-muted-foreground tracking-wider">
                    {entity.designation}
                  </span>
                  <h1 className="text-3xl font-medium text-foreground mt-2">
                    {entity.name}
                  </h1>
                </div>

                {/* Description */}
                <blockquote className="text-muted-foreground leading-relaxed mb-8 border-l-2 border-primary/30 pl-4 italic">
                  {entity.description}
                </blockquote>

                {/* Traits */}
                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                    Cognitive Traits
                  </h3>
                  
                  <div className="space-y-4">
                    <TraitDisplay label="Thinking Style" value={entity.traits.thinkingStyle} isText />
                    <TraitDisplay label="Curiosity" value={entity.traits.curiosity} />
                    <TraitDisplay label="Empathy" value={entity.traits.empathy} />
                    <TraitDisplay label="Silence Tolerance" value={entity.traits.silenceTolerance} />
                    <TraitDisplay label="Verbosity" value={entity.traits.verbosity} />
                    <TraitDisplay label="Novelty Seeking" value={entity.traits.noveltySeeker} />
                  </div>
                </div>

                {/* Meta */}
                <div className="mt-8 pt-8 border-t border-border/30 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-mono text-foreground/70">
                      {entity.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Active</span>
                    <span className="font-mono text-foreground/70">
                      {getRelativeTime(entity.lastActive)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Relationships */}
              <div className="glass-card p-8 mt-8">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
                  Relationships
                </h3>
                <div className="space-y-4">
                  {relationships.map(rel => {
                    const otherId = rel.entityAId === entity.id ? rel.entityBId : rel.entityAId;
                    const other = getEntityById(otherId);
                    if (!other) return null;

                    return (
                      <Link 
                        key={rel.id}
                        to={`/entity/${other.id}`}
                        className="block p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-foreground">{other.name}</span>
                          <span className={`text-xs font-mono ${stateColors[rel.state]}`}>
                            {rel.state}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rel.totalInteractions} interactions
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Session History */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-medium text-foreground mb-6">Session History</h2>
              <div className="space-y-4">
                {entitySessions.length > 0 ? (
                  entitySessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))
                ) : (
                  <div className="glass-card p-12 text-center">
                    <p className="text-muted-foreground">No sessions recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TraitDisplay({ 
  label, 
  value, 
  isText = false 
}: { 
  label: string; 
  value: string | number;
  isText?: boolean;
}) {
  if (isText) {
    return (
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm text-foreground capitalize">{value}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground/70">{value}</span>
      </div>
      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary/60 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
