import { useState, useEffect } from 'react';
import { getRelationships } from '@/data/repository';

export interface RealtimeRelationship {
  id: string;
  entityAId: string;
  entityBId: string;
  entityAName?: string;
  entityBName?: string;
  state: string;
  totalInteractions: number;
  lastInteraction: Date;
  history: string[];
}

export function useRealtimeRelationships() {
  const [relationships, setRelationships] = useState<RealtimeRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getRelationships()
      .then(data =>
        setRelationships(data.map(r => ({
          id: r.id,
          entityAId: r.agent_a_id,
          entityBId: r.agent_b_id,
          entityAName: r.agent_a?.name,
          entityBName: r.agent_b?.name,
          state: r.state,
          totalInteractions: r.total_interactions,
          lastInteraction: new Date(r.last_interaction),
          history: r.history || [],
        })))
      )
      .catch(e => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  return { relationships, loading, error, refetch: () => {} };
}

export function useEntityRelationships(entityId: string | undefined) {
  const { relationships, loading } = useRealtimeRelationships();

  const entityRelationships = entityId
    ? relationships.filter(r => r.entityAId === entityId || r.entityBId === entityId)
    : [];

  return { relationships: entityRelationships, loading, refetch: () => {} };
}
