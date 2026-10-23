import { useState, useEffect, useRef } from 'react';
import {
  getArchetypePreview,
  getArchetypeAgentsPaginated,
  type ArchetypeAgentRow,
  type SortMode,
} from '@/data/repository';

export type { SortMode };

export interface ArchetypeAgent {
  id: string; name: string; designation: string;
  curiosity: number; empathy: number; silenceTolerance: number;
  thinkingStyle: string; lastActive: string;
}

/** Top 10 most-recently-active agents for an archetype. */
export function useArchetypePreview(archetypeId: string | null) {
  const [agents, setAgents] = useState<ArchetypeAgent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!archetypeId) { setAgents([]); return; }
    setLoading(true);
    getArchetypePreview(archetypeId)
      .then(setAgents)
      .finally(() => setLoading(false));
  }, [archetypeId]);

  return { agents, loading };
}

/** Paginated, sorted, searched agents for the full archetype page. */
export function useArchetypeAgentsPaginated(
  archetypeId: string | null,
  sort: SortMode,
  search: string,
  page: number,
  pageSize = 24,
) {
  const [agents, setAgents] = useState<ArchetypeAgent[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRef = useRef(0);

  useEffect(() => {
    if (!archetypeId) return;
    const id = ++fetchRef.current;
    setLoading(true);

    getArchetypeAgentsPaginated(archetypeId, sort, search, page, pageSize).then(result => {
      if (id !== fetchRef.current) return; // stale
      setAgents(result.agents);
      setTotalCount(result.totalCount);
      setLoading(false);
    });
  }, [archetypeId, sort, search, page, pageSize]);

  return { agents, totalCount, loading, refetch: () => {} };
}
