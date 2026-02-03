import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DBRelationship, DBAgent } from '@/lib/database.types';

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

function transformRelationship(rel: DBRelationship & { agent_a?: DBAgent; agent_b?: DBAgent }): RealtimeRelationship {
  return {
    id: rel.id,
    entityAId: rel.agent_a_id,
    entityBId: rel.agent_b_id,
    entityAName: rel.agent_a?.name,
    entityBName: rel.agent_b?.name,
    state: rel.state,
    totalInteractions: rel.total_interactions,
    lastInteraction: new Date(rel.last_interaction),
    history: rel.history || [],
  };
}

export function useRealtimeRelationships() {
  const [relationships, setRelationships] = useState<RealtimeRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRelationships = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('relationships')
        .select(`
          *,
          agent_a:agents!relationships_agent_a_id_fkey(*),
          agent_b:agents!relationships_agent_b_id_fkey(*)
        `)
        .order('last_interaction', { ascending: false });

      if (fetchError) throw fetchError;

      setRelationships((data || []).map(transformRelationship));
      setError(null);
    } catch (e) {
      console.error('Error fetching relationships:', e);
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRelationships();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('relationships-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'relationships',
        },
        () => {
          fetchRelationships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRelationships]);

  return {
    relationships,
    loading,
    error,
    refetch: fetchRelationships,
  };
}

export function useEntityRelationships(entityId: string | undefined) {
  const [relationships, setRelationships] = useState<RealtimeRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRelationships = useCallback(async () => {
    if (!entityId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('relationships')
        .select(`
          *,
          agent_a:agents!relationships_agent_a_id_fkey(*),
          agent_b:agents!relationships_agent_b_id_fkey(*)
        `)
        .or(`agent_a_id.eq.${entityId},agent_b_id.eq.${entityId}`)
        .order('last_interaction', { ascending: false });

      if (fetchError) throw fetchError;

      setRelationships((data || []).map(transformRelationship));
    } catch (e) {
      console.error('Error fetching entity relationships:', e);
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  return {
    relationships,
    loading,
    refetch: fetchRelationships,
  };
}
