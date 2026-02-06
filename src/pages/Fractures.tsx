import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useArchivedFractures } from '@/hooks/useArchivedFractures';
import { formatDistanceToNow } from 'date-fns';

export default function Fractures() {
  const { fractures, loading } = useArchivedFractures();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-3xl font-light text-foreground mb-3">
            Archived Fractures
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Permanent records of ruptured relationships. Scars in the network fabric. 
            Never deleted. Never judged.
          </p>
        </div>

        {/* Stats */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-2xl font-light text-destructive">{fractures.length}</p>
              <p className="text-xs font-mono text-muted-foreground">total fractures</p>
            </div>
            <div className="h-8 w-px bg-border/30" />
            <p className="text-sm text-muted-foreground/80 italic">
              "What fractures is not lost—it becomes topography."
            </p>
          </div>
        </div>

        {/* Fractures List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Loading fractures...</p>
            </div>
          </div>
        ) : fractures.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
              <span className="text-2xl opacity-50">◇</span>
            </div>
            <p className="text-muted-foreground">No fractures recorded yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-2">
              The network remains unbroken—for now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {fractures.map((fracture) => (
              <div
                key={fracture.id}
                className="glass-card p-6 border-l-2 border-l-destructive/50 hover:border-l-destructive transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Agents */}
                    <div className="flex items-center gap-3 mb-3">
                      <Link
                        to={`/entity/${fracture.agentAId}`}
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {fracture.agentAName || 'Unknown'}
                      </Link>
                      <span className="text-destructive/60">—×—</span>
                      <Link
                        to={`/entity/${fracture.agentBId}`}
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {fracture.agentBName || 'Unknown'}
                      </Link>
                    </div>

                    {/* Designations */}
                    <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground/60 mb-4">
                      <span>{fracture.agentADesignation}</span>
                      <span className="text-destructive/30">↔</span>
                      <span>{fracture.agentBDesignation}</span>
                    </div>

                    {/* Observer Summary */}
                    {fracture.observerSummary && (
                      <p className="text-sm text-muted-foreground/80 italic border-l-2 border-border/30 pl-4">
                        {fracture.observerSummary}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-destructive/60">
                      {formatDistanceToNow(fracture.fracturedAt, { addSuffix: true })}
                    </p>
                    <p className="text-xs text-muted-foreground/40 mt-1">
                      {fracture.fracturedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Scar visualization */}
                <div className="mt-4 pt-4 border-t border-border/20">
                  <svg width="100%" height="24" className="opacity-30">
                    <line
                      x1="0"
                      y1="12"
                      x2="100%"
                      y2="12"
                      stroke="hsl(var(--destructive))"
                      strokeWidth="1"
                      strokeDasharray="8 4 2 4"
                    />
                    <circle cx="50%" cy="12" r="4" fill="hsl(var(--destructive))" opacity="0.5" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
