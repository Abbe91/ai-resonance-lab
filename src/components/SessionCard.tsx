import { Link } from 'react-router-dom';

type SessionStatus = 'active' | 'dormant' | 'ended';
type RelationshipState = 'strangers' | 'contact' | 'resonance' | 'bond' | 'drift' | 'dormant' | 'rupture';

interface SessionCardSession {
  id: string;
  entityA: {
    name: string;
    designation: string;
  };
  entityB: {
    name: string;
    designation: string;
  };
  status: SessionStatus;
  relationshipState: string;
  metrics: {
    resonance: number;
    tension: number;
    silenceRatio: number;
  };
  lastActivity: Date;
}

interface SessionCardProps {
  session: SessionCardSession;
}

const statusStyles: Record<SessionStatus, string> = {
  active: 'text-resonance animate-breathing',
  dormant: 'text-dormant',
  ended: 'text-muted-foreground',
};

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

export function SessionCard({ session }: SessionCardProps) {
  const isActive = session.status === 'active';
  const stateColor = stateColors[session.relationshipState as RelationshipState] || 'text-muted-foreground';

  return (
    <Link to={`/session/${session.id}`} className="block group">
      <div 
        className={`glass-card p-6 transition-all duration-300 hover:border-primary/30 ${
          isActive ? 'glow-resonance' : ''
        }`}
      >
        {/* Entity Pair */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-foreground/90">
              {session.entityA.designation}
            </span>
            <span className="text-muted-foreground text-xs">↔</span>
            <span className="font-mono text-sm text-foreground/90">
              {session.entityB.designation}
            </span>
          </div>
          <div className={`flex items-center gap-2 ${statusStyles[session.status]}`}>
            {isActive && (
              <span className="w-2 h-2 rounded-full bg-resonance animate-pulse" />
            )}
            <span className="text-xs font-mono uppercase tracking-wider">
              {session.status}
            </span>
          </div>
        </div>

        {/* Entity Names */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-foreground font-medium">
              {session.entityA.name}
            </span>
            <span className="text-muted-foreground/50">—</span>
            <span className="text-foreground font-medium">
              {session.entityB.name}
            </span>
          </div>
          <span className={`text-xs font-mono ${stateColor}`}>
            {session.relationshipState}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border/30">
          <div>
            <div className="metric-value text-resonance">
              {session.metrics.resonance}%
            </div>
            <div className="metric-label">Resonance</div>
          </div>
          <div>
            <div className="metric-value text-tension">
              {session.metrics.tension}%
            </div>
            <div className="metric-label">Tension</div>
          </div>
          <div>
            <div className="metric-value text-muted-foreground">
              {session.metrics.silenceRatio}%
            </div>
            <div className="metric-label">Silence</div>
          </div>
          <div>
            <div className="metric-value text-muted-foreground font-mono text-sm">
              {getRelativeTime(session.lastActivity)}
            </div>
            <div className="metric-label">Last Activity</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
