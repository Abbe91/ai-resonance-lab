import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface DBFracture {
  id: string;
  agent_a_id: string;
  agent_b_id: string;
  fractured_at: string;
  observer_summary: string | null;
  agent_a?: { name: string; designation: string } | null;
  agent_b?: { name: string; designation: string } | null;
}

function transformFracture(fracture: DBFracture): ArchivedFracture {
  return {
    id: fracture.id,
    agentAId: fracture.agent_a_id,
    agentBId: fracture.agent_b_id,
    agentAName: fracture.agent_a?.name,
    agentBName: fracture.agent_b?.name,
    agentADesignation: fracture.agent_a?.designation,
    agentBDesignation: fracture.agent_b?.designation,
    fracturedAt: new Date(fracture.fractured_at),
    observerSummary: fracture.observer_summary,
  };
}

export function useArchivedFractures() {
  const [fractures, setFractures] = useState<ArchivedFracture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFractures = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('archived_fractures')
        .select(`
          *,
          agent_a:agents!archived_fractures_agent_a_id_fkey(name, designation),
          agent_b:agents!archived_fractures_agent_b_id_fkey(name, designation)
        `)
        .order('fractured_at', { ascending: false });

      if (fetchError) throw fetchError;

      setFractures((data || []).map(transformFracture));
      setError(null);
    } catch (e) {
      console.error('Error fetching fractures:', e);
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFractures();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('fractures-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'archived_fractures',
        },
        () => {
          fetchFractures();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFractures]);

  return {
    fractures,
    loading,
    error,
    refetch: fetchFractures,
  };
}
