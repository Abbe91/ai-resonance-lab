import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useArchetypePreview, ArchetypeAgent } from '@/hooks/useArchetypeAgents';
import { useState } from 'react';

interface Props {
  archetypeId: string;
  archetypeSlug: string;
  children: React.ReactNode;
}

function MiniBar({ value, max = 100 }: { value: number; max?: number }) {
  return (
    <div className="h-1 w-10 bg-muted/50 rounded-full overflow-hidden">
      <div
        className="h-full bg-primary/60 rounded-full"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
}

function AgentRow({ agent }: { agent: ArchetypeAgent }) {
  return (
    <Link
      to={`/entity/${agent.id}`}
      className="flex items-center justify-between gap-3 py-2 px-1 rounded hover:bg-muted/30 transition-colors group"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
          {agent.name}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground truncate">
          {agent.designation}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <MiniBar value={agent.curiosity} />
        <MiniBar value={agent.empathy} />
        <MiniBar value={agent.silenceTolerance} />
      </div>
    </Link>
  );
}

export function ArchetypePreviewPopover({ archetypeId, archetypeSlug, children }: Props) {
  const [open, setOpen] = useState(false);
  const { agents, loading } = useArchetypePreview(open ? archetypeId : null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-3"
        side="right"
        sideOffset={8}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">
          Preview shows 10 most active entities.
        </p>

        {/* Mini bar legend */}
        <div className="flex items-center gap-3 mb-3 text-[10px] text-muted-foreground/50">
          <span>Curiosity</span>
          <span>Empathy</span>
          <span>Silence</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No entities recorded yet.
          </p>
        ) : (
          <div className="space-y-0.5 max-h-[340px] overflow-y-auto">
            {agents.map((a) => (
              <AgentRow key={a.id} agent={a} />
            ))}
          </div>
        )}

        <Link
          to={`/ancestors/${archetypeSlug}`}
          className="block mt-3 text-xs text-primary hover:text-primary/80 font-mono text-center transition-colors"
        >
          View all →
        </Link>
      </PopoverContent>
    </Popover>
  );
}
