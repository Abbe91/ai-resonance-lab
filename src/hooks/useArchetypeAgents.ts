import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ArchetypeAgent {
  id: string;
  name: string;
  designation: string;
  curiosity: number;
  empathy: number;
  silenceTolerance: number;
  thinkingStyle: string;
  lastActive: string;
}

interface CacheEntry {
  agents: ArchetypeAgent[];
  timestamp: number;
}

const CACHE_TTL = 60_000; // 60 seconds
const previewCache = new Map<string, CacheEntry>();

function transformRow(row: any): ArchetypeAgent {
  return {
    id: row.id,
    name: row.name,
    designation: row.designation,
    curiosity: row.curiosity,
    empathy: row.empathy,
    silenceTolerance: row.silence_tolerance,
    thinkingStyle: row.thinking_style,
    lastActive: row.last_active,
  };
}

/** Fetch top 10 most-active agents for an archetype (with 60s in-memory cache). */
export function useArchetypePreview(archetypeId: string | null) {
  const [agents, setAgents] = useState<ArchetypeAgent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!archetypeId) {
      setAgents([]);
      return;
    }

    const cached = previewCache.get(archetypeId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setAgents(cached.agents);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, designation, curiosity, empathy, silence_tolerance, thinking_style, last_active')
        .eq('ancestor_archetype_id', archetypeId)
        .order('last_active', { ascending: false })
        .limit(10);

      if (cancelled) return;

      if (!error && data) {
        const result = data.map(transformRow);
        previewCache.set(archetypeId, { agents: result, timestamp: Date.now() });
        setAgents(result);
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [archetypeId]);

  return { agents, loading };
}

export type SortMode = 'active' | 'newest' | 'az';

/** Paginated agents for a full archetype page. */
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

  const fetch = useCallback(async () => {
    if (!archetypeId) return;
    const id = ++fetchRef.current;
    setLoading(true);

    let query = supabase
      .from('agents')
      .select('id, name, designation, curiosity, empathy, silence_tolerance, thinking_style, last_active', { count: 'exact' })
      .eq('ancestor_archetype_id', archetypeId);

    if (search.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,designation.ilike.%${search.trim()}%`);
    }

    if (sort === 'active') query = query.order('last_active', { ascending: false });
    else if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else query = query.order('name', { ascending: true });

    const from = page * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data, count, error } = await query;
    if (id !== fetchRef.current) return; // stale

    if (!error) {
      setAgents((data || []).map(transformRow));
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, [archetypeId, sort, search, page, pageSize]);

  useEffect(() => { fetch(); }, [fetch]);

  return { agents, totalCount, loading, refetch: fetch };
}
