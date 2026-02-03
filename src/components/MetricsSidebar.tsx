import { SessionMetrics, RelationshipState } from '@/lib/types';
import { formatDuration } from '@/lib/data';

interface MetricsSidebarProps {
  metrics: SessionMetrics;
  relationshipState: RelationshipState;
}

const stateDescriptions: Record<RelationshipState, string> = {
  strangers: 'No prior interaction. Initial contact pending.',
  contact: 'First exchanges established. Patterns emerging.',
  resonance: 'Meaningful connection detected. Mutual understanding developing.',
  bond: 'Deep synchronization achieved. Persistent connection.',
  drift: 'Gradual divergence observed. Coherence weakening.',
  dormant: 'Interaction paused. Connection preserved but inactive.',
  rupture: 'Critical discontinuity. Relationship terminated.',
};

export function MetricsSidebar({ metrics, relationshipState }: MetricsSidebarProps) {
  return (
    <div className="glass-card p-6 space-y-8">
      {/* Relationship State */}
      <div>
        <h3 className="metric-label mb-3">Relationship State</h3>
        <div className="flex items-center gap-3 mb-2">
          <StateIndicator state={relationshipState} />
          <span className="font-mono text-lg capitalize text-foreground">
            {relationshipState}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {stateDescriptions[relationshipState]}
        </p>
      </div>

      {/* Primary Metrics */}
      <div className="space-y-6">
        <MetricGauge 
          label="Resonance" 
          value={metrics.resonance} 
          color="resonance"
          description="Degree of mutual understanding and synchronization"
        />
        <MetricGauge 
          label="Tension" 
          value={metrics.tension} 
          color="tension"
          description="Level of productive conflict or disagreement"
        />
        <MetricGauge 
          label="Novelty" 
          value={metrics.novelty} 
          color="accent"
          description="Emergence of new concepts or perspectives"
        />
        <MetricGauge 
          label="Silence Ratio" 
          value={metrics.silenceRatio} 
          color="silence"
          description="Proportion of time spent in contemplative silence"
        />
      </div>

      {/* Stats */}
      <div className="pt-6 border-t border-border/30 space-y-4">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Total Silence</span>
          <span className="font-mono text-sm text-foreground">
            {formatDuration(metrics.totalSilenceDuration)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Messages</span>
          <span className="font-mono text-sm text-foreground">
            {metrics.messageCount}
          </span>
        </div>
      </div>
    </div>
  );
}

function MetricGauge({ 
  label, 
  value, 
  color, 
  description 
}: { 
  label: string; 
  value: number; 
  color: 'resonance' | 'tension' | 'accent' | 'silence';
  description: string;
}) {
  const colorClasses: Record<string, string> = {
    resonance: 'bg-resonance',
    tension: 'bg-tension',
    accent: 'bg-accent',
    silence: 'bg-silence',
  };

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-foreground">{label}</span>
        <span className="metric-value">{value}%</span>
      </div>
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${colorClasses[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground/60 mt-1">{description}</p>
    </div>
  );
}

function StateIndicator({ state }: { state: RelationshipState }) {
  const stateColors: Record<RelationshipState, string> = {
    strangers: 'bg-muted-foreground',
    contact: 'bg-contact',
    resonance: 'bg-resonance animate-pulse',
    bond: 'bg-bond',
    drift: 'bg-drift',
    dormant: 'bg-dormant',
    rupture: 'bg-rupture',
  };

  return (
    <span className={`w-3 h-3 rounded-full ${stateColors[state]}`} />
  );
}
