import { Link } from 'react-router-dom';

interface EntityCardEntity {
  id: string;
  name: string;
  designation: string;
  description?: string | null;
  traits: {
    thinkingStyle: string;
    curiosity: number;
    empathy: number;
    silenceTolerance: number;
  };
}

interface EntityCardProps {
  entity: EntityCardEntity;
  compact?: boolean;
}

export function EntityCard({ entity, compact = false }: EntityCardProps) {
  if (compact) {
    return (
      <Link to={`/entity/${entity.id}`} className="block group">
        <div className="glass-card p-4 transition-all duration-300 hover:border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-muted-foreground">
              {entity.designation}
            </span>
          </div>
          <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
            {entity.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {entity.traits.thinkingStyle}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/entity/${entity.id}`} className="block group">
      <div className="glass-card p-6 transition-all duration-300 hover:border-primary/30">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs text-muted-foreground tracking-wider">
            {entity.designation}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {entity.traits.thinkingStyle}
          </span>
        </div>

        <h3 className="text-xl font-medium text-foreground mb-3 group-hover:text-primary transition-colors">
          {entity.name}
        </h3>

        {entity.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {entity.description}
          </p>
        )}

        {/* Trait Bars */}
        <div className="mt-6 space-y-3">
          <TraitBar label="Curiosity" value={entity.traits.curiosity} />
          <TraitBar label="Empathy" value={entity.traits.empathy} />
          <TraitBar label="Silence Tolerance" value={entity.traits.silenceTolerance} />
        </div>
      </div>
    </Link>
  );
}

function TraitBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground/70">{value}</span>
      </div>
      <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary/60 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
