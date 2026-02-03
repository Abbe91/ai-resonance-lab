import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SessionCard } from '@/components/SessionCard';
import { ArrowLeft } from 'lucide-react';
import { useRealtimeAgent } from '@/hooks/useRealtimeAgents';
import { useRealtimeSessions } from '@/hooks/useRealtimeSessions';
import { useEntityRelationships } from '@/hooks/useRealtimeRelationships';
import { useRealtimeAgents } from '@/hooks/useRealtimeAgents';

type RelationshipState = 'strangers' | 'contact' | 'resonance' | 'bond' | 'drift' | 'dormant' | 'rupture';

const stateColors: Record<RelationshipState, string> = {
  strangers: 'text-muted-foreground',
  contact: 'text-contact',
  resonance: 'text-resonance',
  bond: 'text-bond',
  drift: 'text-drift',
  dormant: 'text-dormant',
  rupture: 'text-rupture',
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function EntityPage() {
  const { id } = useParams<{ id: string }>();
  const { agent: entity, loading: entityLoading } = useRealtimeAgent(id);
  const { sessions, loading: sessionsLoading } = useRealtimeSessions();
  const { relationships, loading: relationshipsLoading } = useEntityRelationships(id);
  const { agents } = useRealtimeAgents();

  // Filter sessions for this entity
  const entitySessions = sessions.filter(
    s => s.entityA.id === id || s.entityB.id === id
  );

  // Helper to get agent name by ID
  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || 'Unknown';
  };

  if (entityLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading entity...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                {entity.description && (
                  <blockquote className="text-muted-foreground leading-relaxed mb-8 border-l-2 border-primary/30 pl-4 italic">
                    {entity.description}
                  </blockquote>
                )}

                {/* Traits */}
                <div className="space-y-6">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                    Cognitive Traits
                  </h3>
                  
                  <div className="space-y-4">
                    <TraitDisplay label="Thinking Style" value={entity.traits.thinkingStyle} isText />
                    <TraitDisplay label="Conflict Style" value={entity.conflictStyle} isText />
                    <TraitDisplay label="Curiosity" value={entity.traits.curiosity} />
                    <TraitDisplay label="Empathy" value={entity.traits.empathy} />
                    <TraitDisplay label="Silence Tolerance" value={entity.traits.silenceTolerance} />
                    <TraitDisplay label="Verbosity" value={entity.traits.verbosity} />
                    <TraitDisplay label="Novelty Seeking" value={entity.traits.noveltySeeking} />
                  </div>
                </div>

                {/* Goals */}
                {entity.goals.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-border/30">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                      Goals
                    </h3>
                    <ul className="space-y-2">
                      {entity.goals.map((goal, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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
                {relationshipsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : relationships.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No relationships yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {relationships.map(rel => {
                      const otherId = rel.entityAId === entity.id ? rel.entityBId : rel.entityAId;
                      const otherName = rel.entityAId === entity.id ? rel.entityBName : rel.entityAName;
                      const stateColor = stateColors[rel.state as RelationshipState] || 'text-muted-foreground';

                      return (
                        <Link 
                          key={rel.id}
                          to={`/entity/${otherId}`}
                          className="block p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-foreground">{otherName || getAgentName(otherId)}</span>
                            <span className={`text-xs font-mono ${stateColor}`}>
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
                )}
              </div>
            </div>

            {/* Session History */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-medium text-foreground mb-6">Session History</h2>
              {sessionsLoading ? (
                <div className="glass-card p-12 text-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading sessions...</p>
                </div>
              ) : entitySessions.length > 0 ? (
                <div className="space-y-4">
                  {entitySessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 text-center">
                  <p className="text-muted-foreground">No sessions recorded yet</p>
                </div>
              )}
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
