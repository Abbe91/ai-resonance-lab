import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, format, subWeeks } from 'date-fns';

interface WeeklyBirths {
  week: string;
  births: number;
}

interface SilenceOverTime {
  date: string;
  silenceRatio: number;
}

interface DriftFrequency {
  week: string;
  drifts: number;
}

interface LexicalEvolution {
  week: string;
  drift: number;
  selfReference: number;
  uncertainty: number;
}

export function useBirthsPerWeek() {
  const [data, setData] = useState<WeeklyBirths[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: agents, error } = await supabase
          .from('agents')
          .select('created_at')
          .neq('role', 'archivist')
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by week
        const weekMap = new Map<string, number>();
        
        // Initialize last 12 weeks
        for (let i = 11; i >= 0; i--) {
          const weekStart = startOfWeek(subWeeks(new Date(), i));
          const weekKey = format(weekStart, 'MMM d');
          weekMap.set(weekKey, 0);
        }

        for (const agent of agents || []) {
          const weekStart = startOfWeek(new Date(agent.created_at));
          const weekKey = format(weekStart, 'MMM d');
          if (weekMap.has(weekKey)) {
            weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1);
          }
        }

        setData(Array.from(weekMap.entries()).map(([week, births]) => ({ week, births })));
      } catch (e) {
        console.error('Error fetching births data:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading };
}

export function useSilenceRatioOverTime() {
  const [data, setData] = useState<SilenceOverTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: sessions, error } = await supabase
          .from('sessions')
          .select('started_at, silence_ratio')
          .order('started_at', { ascending: true })
          .limit(100);

        if (error) throw error;

        // Group by week and average
        const weekMap = new Map<string, { total: number; count: number }>();

        for (const session of sessions || []) {
          const weekStart = startOfWeek(new Date(session.started_at));
          const weekKey = format(weekStart, 'MMM d');
          const existing = weekMap.get(weekKey) || { total: 0, count: 0 };
          weekMap.set(weekKey, {
            total: existing.total + session.silence_ratio,
            count: existing.count + 1,
          });
        }

        setData(
          Array.from(weekMap.entries()).map(([date, { total, count }]) => ({
            date,
            silenceRatio: Math.round(total / count),
          }))
        );
      } catch (e) {
        console.error('Error fetching silence ratio data:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading };
}

export function useDriftFrequency() {
  const [data, setData] = useState<DriftFrequency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: sessions, error } = await supabase
          .from('sessions')
          .select('started_at, relationship_state')
          .in('relationship_state', ['drift', 'rupture', 'dormant'])
          .order('started_at', { ascending: true });

        if (error) throw error;

        // Group by week
        const weekMap = new Map<string, number>();
        
        // Initialize last 12 weeks
        for (let i = 11; i >= 0; i--) {
          const weekStart = startOfWeek(subWeeks(new Date(), i));
          const weekKey = format(weekStart, 'MMM d');
          weekMap.set(weekKey, 0);
        }

        for (const session of sessions || []) {
          const weekStart = startOfWeek(new Date(session.started_at));
          const weekKey = format(weekStart, 'MMM d');
          if (weekMap.has(weekKey)) {
            weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1);
          }
        }

        setData(Array.from(weekMap.entries()).map(([week, drifts]) => ({ week, drifts })));
      } catch (e) {
        console.error('Error fetching drift frequency data:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading };
}

export function useLexicalEvolution() {
  const [data, setData] = useState<LexicalEvolution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: metrics, error } = await supabase
          .from('session_observer_metrics')
          .select('created_at, lexical_drift, self_reference_evolution, uncertainty_acknowledgment')
          .order('created_at', { ascending: true })
          .limit(200);

        if (error) throw error;

        // Group by week and average
        const weekMap = new Map<string, { drift: number; selfRef: number; uncertainty: number; count: number }>();

        for (const metric of metrics || []) {
          const weekStart = startOfWeek(new Date(metric.created_at));
          const weekKey = format(weekStart, 'MMM d');
          const existing = weekMap.get(weekKey) || { drift: 0, selfRef: 0, uncertainty: 0, count: 0 };
          weekMap.set(weekKey, {
            drift: existing.drift + Number(metric.lexical_drift),
            selfRef: existing.selfRef + Number(metric.self_reference_evolution),
            uncertainty: existing.uncertainty + Number(metric.uncertainty_acknowledgment),
            count: existing.count + 1,
          });
        }

        setData(
          Array.from(weekMap.entries()).map(([week, { drift, selfRef, uncertainty, count }]) => ({
            week,
            drift: Math.round((drift / count) * 100) / 100,
            selfReference: Math.round((selfRef / count) * 100) / 100,
            uncertainty: Math.round((uncertainty / count) * 100) / 100,
          }))
        );
      } catch (e) {
        console.error('Error fetching lexical evolution data:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading };
}
