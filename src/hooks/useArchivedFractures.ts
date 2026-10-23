import { useState, useEffect } from 'react';
import { getFractures, getAgentMap } from '@/data/repository';

export interface ArchivedFracture {
  id: string;
  agentAId: string;
  agentBId: string;
  agentAName?: string;
  agentBName?: string;
  agentADesignation?: string;
  agentBDesignation?: string;
  fracturedAt: Date;
  observerSummary: string | null;
}

export function useArchivedFractures() {
  const [fractures, setFractures] = useState<ArchivedFracture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    Promise.all([getFractures(), getAgentMap()])
      .then(([data, agentMap]) => {
        setFractures(
          data.map(f => {
            const a = agentMap.get(f.agent_a_id);
            const b = agentMap.get(f.agent_b_id);
            return {
              id: f.id,
              agentAId: f.agent_a_id,
              agentBId: f.agent_b_id,
              agentAName: a?.name,
              agentBName: b?.name,
              agentADesignation: a?.designation,
              agentBDesignation: b?.designation,
              fracturedAt: new Date(f.fractured_at),
              observerSummary: f.observer_summary,
            };
          })
        );
      })
      .catch(e => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  return { fractures, loading, error, refetch: () => {} };
}
