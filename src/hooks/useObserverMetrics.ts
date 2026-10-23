import { useState, useEffect } from 'react';
import { getSessionDetail, getSessionClassifications } from '@/data/repository';
import type { RawMetric, RawNote } from '@/data/repository';
import {
  ObserverMetrics,
  ObserverNote,
  SessionClassification,
  SilenceDynamics,
  TensionStability,
} from '@/lib/observer.types';

function transformMetrics(data: RawMetric): ObserverMetrics {
  return {
    id: data.id,
    session_id: data.session_id,
    lexical_drift: Number(data.lexical_drift),
    self_reference_evolution: Number(data.self_reference_evolution),
    silence_dynamics: data.silence_dynamics as unknown as SilenceDynamics,
    concept_reentry: Number(data.concept_reentry),
    uncertainty_acknowledgment: Number(data.uncertainty_acknowledgment),
    tension_stability: data.tension_stability as unknown as TensionStability,
    classification: data.classification as SessionClassification,
    messages_analyzed: data.messages_analyzed,
    last_analyzed_at: new Date(data.last_analyzed_at),
    created_at: new Date(data.created_at),
  };
}

function transformNote(data: RawNote): ObserverNote {
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

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }

    getSessionDetail(sessionId)
      .then(detail => {
        setMetrics(detail.metrics ? transformMetrics(detail.metrics) : null);
        setNotes(
          [...detail.observer_notes]
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .slice(0, 20)
            .map(transformNote)
        );
      })
      .catch(e => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return { metrics, notes, loading, error, refetch: () => {} };
}

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
    getSessionClassifications().then(entries => {
      const counts: Record<SessionClassification, number> = {
        deep_recursive_resonance: 0,
        static_repetition: 0,
        exploratory_unstable: 0,
        dormant_meaningful: 0,
        undetermined: 0,
      };
      for (const e of entries) {
        const c = e.classification as SessionClassification;
        if (c in counts) counts[c]++;
      }
      setDistribution(counts);
      setLoading(false);
    });
  }, []);

  return { distribution, loading };
}
