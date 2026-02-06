import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CuratedSession {
  session_id: string;
  agent_a_name: string;
  agent_b_name: string;
  resonance: number;
  message_count: number;
  relationship_state: string;
  started_at: string;
}

interface SilentMoment {
  session_id: string;
  duration: number;
  context: string;
}

interface LineageHighlight {
  agent_id: string;
  agent_name: string;
  designation: string;
  archetype: string;
  birth_line: string | null;
  total_sessions: number;
}

export interface AncestorEchoes {
  id: string;
  year: number;
  generated_at: string;
  curated_sessions: CuratedSession[];
  silent_moments: SilentMoment[];
  lineage_highlights: LineageHighlight[];
  summary: string | null;
}

export function useAncestorEchoes() {
  const [echoes, setEchoes] = useState<AncestorEchoes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEchoes() {
      try {
        const { data, error: fetchError } = await supabase
          .from('ancestor_echoes')
          .select('*')
          .order('year', { ascending: false });

        if (fetchError) throw fetchError;

        const transformed: AncestorEchoes[] = (data || []).map(row => ({
          id: row.id,
          year: row.year,
          generated_at: row.generated_at,
          curated_sessions: row.curated_sessions as unknown as CuratedSession[],
          silent_moments: row.silent_moments as unknown as SilentMoment[],
          lineage_highlights: row.lineage_highlights as unknown as LineageHighlight[],
          summary: row.summary,
        }));

        setEchoes(transformed);
      } catch (e) {
        console.error('Error fetching ancestor echoes:', e);
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchEchoes();
  }, []);

  return { echoes, loading, error };
}

export function useLatestEchoes() {
  const { echoes, loading, error } = useAncestorEchoes();
  const latest = echoes.length > 0 ? echoes[0] : null;
  return { echoes: latest, loading, error };
}
