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

export function useRealtimeAgents() {
  const [agents, setAgents] = useState<RealtimeAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .order('last_active', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      setAgents((data || []).map(transformAgent));
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
    loading,
    error,
    refetch: fetchAgents,
  };
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
