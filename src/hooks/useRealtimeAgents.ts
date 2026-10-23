import { useState, useEffect } from 'react';
import { getAgents, getAgent } from '@/data/repository';
import type { DBAgent } from '@/lib/database.types';

export type ThinkingStyle = 'analytical' | 'intuitive' | 'contemplative' | 'dialectic' | 'poetic';

export interface RealtimeAgent {
  id: string;
  name: string;
  designation: string;
  description: string | null;
  traits: {
    thinkingStyle: ThinkingStyle;
    curiosity: number; empathy: number; silenceTolerance: number;
    verbosity: number; noveltySeeking: number;
  };
  conflictStyle: string;
  goals: string[];
  boundaries: string[];
  createdAt: Date;
  lastActive: Date;
  ancestorArchetypeId: string | null;
}

function transformAgent(a: DBAgent): RealtimeAgent {
  return {
    id: a.id, name: a.name, designation: a.designation, description: a.description,
    traits: {
      thinkingStyle: a.thinking_style as ThinkingStyle,
      curiosity: a.curiosity, empathy: a.empathy,
      silenceTolerance: a.silence_tolerance, verbosity: a.verbosity,
      noveltySeeking: a.novelty_seeker,
    },
    conflictStyle: a.conflict_style,
    goals: a.goals || [],
    boundaries: a.boundaries || [],
    createdAt: new Date(a.created_at),
    lastActive: new Date(a.last_active),
    ancestorArchetypeId: a.ancestor_archetype_id || null,
  };
}

export function useRealtimeAgents() {
  const [agents, setAgents] = useState<RealtimeAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getAgents()
      .then(data => setAgents(data.map(transformAgent)))
      .catch(e => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  return { agents, totalCount: agents.length, loading, error, refetch: () => {} };
}

// With the snapshot (≤182 agents), all performance modes return the same data
export function useAgentsPerformanceMode(_mode: 'full' | 'sample300' | 'last500') {
  return useRealtimeAgents();
}

export function useRealtimeAgent(agentId: string | undefined) {
  const [agent, setAgent] = useState<RealtimeAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!agentId) { setLoading(false); return; }
    getAgent(agentId)
      .then(data => setAgent(data ? transformAgent(data) : null))
      .catch(e => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [agentId]);

  return { agent, loading, error, refetch: () => {} };
}
