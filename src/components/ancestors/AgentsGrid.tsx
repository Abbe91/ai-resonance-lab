import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArchetypeAgent, SortMode } from '@/hooks/useArchetypeAgents';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  agents: ArchetypeAgent[];
  totalCount: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  sort: SortMode;
  onSortChange: (s: SortMode) => void;
  search: string;
  onSearchChange: (s: string) => void;
}

function TraitBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground/70">{value}</span>
      </div>
      <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

const sortOptions: { value: SortMode; label: string }[] = [
  { value: 'active', label: 'Most active' },
  { value: 'newest', label: 'Newest' },
  { value: 'az', label: 'A–Z' },
];

export function AgentsGrid({
  agents, totalCount, loading, page, pageSize,
  onPageChange, sort, onSortChange, search, onSearchChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search by name or entity ID…"
          value={search}
          onChange={(e) => { onSearchChange(e.target.value); onPageChange(0); }}
          className="flex-1 bg-secondary/50 border border-border/50 rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <div className="flex gap-1 bg-secondary/30 rounded-lg p-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onSortChange(opt.value); onPageChange(0); }}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors font-mono ${
                sort === opt.value
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs font-mono text-muted-foreground/60 mb-4">
        {totalCount} entities
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          No entities recorded yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Link
                to={`/entity/${agent.id}`}
                className="block glass-card p-5 group transition-all duration-300 hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
                    {agent.designation}
                  </span>
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {agent.thinkingStyle}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                  {agent.name}
                </h3>
                <p className="text-[10px] font-mono text-muted-foreground/40 mb-4">
                  Last active {formatDistanceToNow(new Date(agent.lastActive), { addSuffix: true })}
                </p>
                <div className="space-y-2">
                  <TraitBar label="Curiosity" value={agent.curiosity} />
                  <TraitBar label="Empathy" value={agent.empathy} />
                  <TraitBar label="Silence" value={agent.silenceTolerance} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              {page > 0 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => onPageChange(page - 1)} href="#" />
                </PaginationItem>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                let p: number;
                if (totalPages <= 7) p = i;
                else if (page < 4) p = i;
                else if (page > totalPages - 5) p = totalPages - 7 + i;
                else p = page - 3 + i;

                return (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => { e.preventDefault(); onPageChange(p); }}
                    >
                      {p + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {page < totalPages - 1 && (
                <PaginationItem>
                  <PaginationNext onClick={() => onPageChange(page + 1)} href="#" />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
