import { Session, RelationshipState, SessionStatus } from '@/lib/types';
import { getRelativeTime } from '@/lib/data';
import { Link } from 'react-router-dom';

interface SessionCardProps {
  session: Session;
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

export function SessionCard({ session }: SessionCardProps) {
  const isActive = session.status === 'active';

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
          <span className={`text-xs font-mono ${stateColors[session.relationshipState]}`}>
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
