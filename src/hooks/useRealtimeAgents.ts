import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DBAgent, ThinkingStyle } from '@/lib/database.types';

export interface RealtimeAgent {
  id: string;
  name: string;
  designation: string;
  description: string | null;
  traits: {
    thinkingStyle: ThinkingStyle;
    curiosity: number;
    empathy: number;
    silenceTolerance: number;
    verbosity: number;
    noveltySeeking: number;
  };
  conflictStyle: string;
  goals: string[];
  boundaries: string[];
  createdAt: Date;
  lastActive: Date;
  ancestorArchetypeId: string | null;
}

function transformAgent(agent: DBAgent): RealtimeAgent {
  return {
    id: agent.id,
    name: agent.name,
    designation: agent.designation,
    description: agent.description,
    traits: {
      thinkingStyle: agent.thinking_style,
      curiosity: agent.curiosity,
      empathy: agent.empathy,
      silenceTolerance: agent.silence_tolerance,
      verbosity: agent.verbosity,
      noveltySeeking: agent.novelty_seeker,
    },
    conflictStyle: agent.conflict_style,
    goals: agent.goals || [],
    boundaries: agent.boundaries || [],
    createdAt: new Date(agent.created_at),
    lastActive: new Date(agent.last_active),
    ancestorArchetypeId: agent.ancestor_archetype_id || null,
  };
}

const PAGE_SIZE = 500;

// Fetch ALL agents using pagination
async function fetchAllAgentsPaginated(): Promise<DBAgent[]> {
  const allAgents: DBAgent[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;

    if (data && data.length > 0) {
      allAgents.push(...data);
      offset += PAGE_SIZE;
      hasMore = data.length === PAGE_SIZE;
    } else {
      hasMore = false;
    }
  }

  return allAgents;
}

// Get total count without fetching all data
async function getTotalAgentCount(): Promise<number> {
  const { count, error } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
}

export function useRealtimeAgents() {
  const [agents, setAgents] = useState<RealtimeAgent[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const [allAgents, count] = await Promise.all([
        fetchAllAgentsPaginated(),
        getTotalAgentCount(),
      ]);

      setAgents(allAgents.map(transformAgent));
      setTotalCount(count);
      setError(null);
    } catch (e) {
      console.error('Error fetching agents:', e);
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('agents-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents',
        },
        () => {
          fetchAgents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAgents]);

  return {
    agents,
    totalCount,
    loading,
    error,
    refetch: fetchAgents,
  };
}

// Hook for performance mode - samples or limits agents
export function useAgentsPerformanceMode(mode: 'full' | 'sample300' | 'last500') {
  const [agents, setAgents] = useState<RealtimeAgent[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      const count = await getTotalAgentCount();
      setTotalCount(count);

      let data: DBAgent[] = [];

      if (mode === 'full') {
        data = await fetchAllAgentsPaginated();
      } else if (mode === 'sample300') {
        // Fetch all and sample 300 evenly distributed
        const allAgents = await fetchAllAgentsPaginated();
        if (allAgents.length <= 300) {
          data = allAgents;
        } else {
          const step = Math.floor(allAgents.length / 300);
          data = allAgents.filter((_, i) => i % step === 0).slice(0, 300);
        }
      } else if (mode === 'last500') {
        // Fetch only last 500 newborns
        const { data: recent, error } = await supabase
          .from('agents')
          .select('*')
          .order('created_at', { ascending: false })
          .range(0, 499);

        if (error) throw error;
        data = recent || [];
      }

      setAgents(data.map(transformAgent));
    } catch (e) {
      console.error('Error fetching agents (performance mode):', e);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return { agents, totalCount, loading, refetch: fetchAgents };
}

export function useRealtimeAgent(agentId: string | undefined) {
  const [agent, setAgent] = useState<RealtimeAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgent = useCallback(async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (fetchError) throw fetchError;

      setAgent(data ? transformAgent(data) : null);
      setError(null);
    } catch (e) {
      console.error('Error fetching agent:', e);
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgent();

    if (!agentId) return;

    // Subscribe to realtime changes for this specific agent
    const channel = supabase
      .channel(`agent-${agentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agents',
          filter: `id=eq.${agentId}`,
        },
        () => {
          fetchAgent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId, fetchAgent]);

  return {
    agent,
    loading,
    error,
    refetch: fetchAgent,
  };
}
