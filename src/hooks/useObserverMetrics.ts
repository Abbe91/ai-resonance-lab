import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ObserverMetrics, 
  ObserverNote, 
  SessionClassification,
  SilenceDynamics,
  TensionStability,
} from '@/lib/observer.types';
import { Json } from '@/integrations/supabase/types';

function transformMetrics(data: {
  id: string;
  session_id: string;
  lexical_drift: number;
  self_reference_evolution: number;
  silence_dynamics: Json;
  concept_reentry: number;
  uncertainty_acknowledgment: number;
  tension_stability: Json;
  classification: string;
  messages_analyzed: number;
  last_analyzed_at: string;
  created_at: string;
}): ObserverMetrics {
  const silenceDynamics = data.silence_dynamics as unknown as SilenceDynamics;
  const tensionStability = data.tension_stability as unknown as TensionStability;
  
  return {
    id: data.id,
    session_id: data.session_id,
    lexical_drift: Number(data.lexical_drift),
    self_reference_evolution: Number(data.self_reference_evolution),
    silence_dynamics: silenceDynamics,
    concept_reentry: Number(data.concept_reentry),
    uncertainty_acknowledgment: Number(data.uncertainty_acknowledgment),
    tension_stability: tensionStability,
    classification: data.classification as SessionClassification,
    messages_analyzed: data.messages_analyzed,
    last_analyzed_at: new Date(data.last_analyzed_at),
    created_at: new Date(data.created_at),
  };
}

function transformNote(data: {
  id: string;
  session_id: string;
  observation_type: string;
  content: string;
  created_at: string;
}): ObserverNote {
  return {
    id: data.id,
    session_id: data.session_id,
    observation_type: data.observation_type as ObserverNote['observation_type'],
    content: data.content,
    created_at: new Date(data.created_at),
  };
}

export function useObserverMetrics(sessionId?: string) {
  const [metrics, setMetrics] = useState<ObserverMetrics | null>(null);
  const [notes, setNotes] = useState<ObserverNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch observer metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('session_observer_metrics')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (metricsError) throw metricsError;

      if (metricsData) {
        setMetrics(transformMetrics(metricsData));
      }

      // Fetch observer notes
      const { data: notesData, error: notesError } = await supabase
        .from('observer_notes')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (notesError) throw notesError;

      setNotes((notesData || []).map(n => transformNote(n)));
      setError(null);
    } catch (e) {
      console.error('Error fetching observer metrics:', e);
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchMetrics();

    if (!sessionId) return;

    // Subscribe to realtime changes
    const metricsChannel = supabase
      .channel(`observer-metrics-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_observer_metrics',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    const notesChannel = supabase
      .channel(`observer-notes-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'observer_notes',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(notesChannel);
    };
  }, [sessionId, fetchMetrics]);

  return {
    metrics,
    notes,
    loading,
    error,
    refetch: fetchMetrics,
  };
}

// Hook to fetch classification distribution across all sessions
export function useClassificationDistribution() {
  const [distribution, setDistribution] = useState<Record<SessionClassification, number>>({
    deep_recursive_resonance: 0,
    static_repetition: 0,
    exploratory_unstable: 0,
    dormant_meaningful: 0,
    undetermined: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDistribution() {
      try {
        const { data, error } = await supabase
          .from('session_observer_metrics')
          .select('classification');

        if (error) throw error;

        const counts: Record<SessionClassification, number> = {
          deep_recursive_resonance: 0,
          static_repetition: 0,
          exploratory_unstable: 0,
          dormant_meaningful: 0,
          undetermined: 0,
        };

        for (const row of data || []) {
          const classification = row.classification as SessionClassification;
          if (classification in counts) {
            counts[classification]++;
          }
        }

        setDistribution(counts);
      } catch (e) {
        console.error('Error fetching classification distribution:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchDistribution();

    // Subscribe to changes
    const channel = supabase
      .channel('observer-distribution')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_observer_metrics',
        },
        () => {
          fetchDistribution();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { distribution, loading };
}