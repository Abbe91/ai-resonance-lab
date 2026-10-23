import { useState, useEffect } from 'react';
import { getAgents, getSessions, getSessionClassifications } from '@/data/repository';
import { startOfWeek, format, subWeeks } from 'date-fns';

interface WeeklyBirths { week: string; births: number; }
interface SilenceOverTime { date: string; silenceRatio: number; }
interface DriftFrequency { week: string; drifts: number; }
interface LexicalEvolution { week: string; drift: number; selfReference: number; uncertainty: number; }

// Use the latest date in the dataset as the reference "now" so charts show real data
async function getRefDate(): Promise<Date> {
  const agents = await getAgents();
  if (agents.length === 0) return new Date();
  return new Date(Math.max(...agents.map(a => new Date(a.last_active).getTime())));
}

export function useBirthsPerWeek() {
  const [data, setData] = useState<WeeklyBirths[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAgents(), getRefDate()]).then(([agents, refDate]) => {
      const weekMap = new Map<string, number>();
      for (let i = 11; i >= 0; i--) {
        weekMap.set(format(startOfWeek(subWeeks(refDate, i)), 'MMM d'), 0);
      }
      for (const a of agents) {
        if (a.role === 'archivist') continue;
        const key = format(startOfWeek(new Date(a.created_at)), 'MMM d');
        if (weekMap.has(key)) weekMap.set(key, (weekMap.get(key) || 0) + 1);
      }
      setData(Array.from(weekMap.entries()).map(([week, births]) => ({ week, births })));
      setLoading(false);
    });
  }, []);

  return { data, loading };
}

export function useSilenceRatioOverTime() {
  const [data, setData] = useState<SilenceOverTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessions().then(sessions => {
      const weekMap = new Map<string, { total: number; count: number }>();
      for (const s of sessions) {
        const key = format(startOfWeek(new Date(s.started_at)), 'MMM d');
        const e = weekMap.get(key) || { total: 0, count: 0 };
        weekMap.set(key, { total: e.total + s.silence_ratio, count: e.count + 1 });
      }
      setData(
        Array.from(weekMap.entries())
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, { total, count }]) => ({
            date,
            silenceRatio: Math.round(total / count),
          }))
      );
      setLoading(false);
    });
  }, []);

  return { data, loading };
}

export function useDriftFrequency() {
  const [data, setData] = useState<DriftFrequency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSessions(), getRefDate()]).then(([sessions, refDate]) => {
      const weekMap = new Map<string, number>();
      for (let i = 11; i >= 0; i--) {
        weekMap.set(format(startOfWeek(subWeeks(refDate, i)), 'MMM d'), 0);
      }
      for (const s of sessions) {
        if (!['drift', 'rupture', 'dormant'].includes(s.relationship_state)) continue;
        const key = format(startOfWeek(new Date(s.started_at)), 'MMM d');
        if (weekMap.has(key)) weekMap.set(key, (weekMap.get(key) || 0) + 1);
      }
      setData(Array.from(weekMap.entries()).map(([week, drifts]) => ({ week, drifts })));
      setLoading(false);
    });
  }, []);

  return { data, loading };
}

export function useLexicalEvolution() {
  const [data, setData] = useState<LexicalEvolution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionClassifications().then(async entries => {
      // We only have classification entries from the index; for full metrics we need session details
      // Use session started_at from sessions for the week grouping instead
      const sessions = await getSessions();
      const sessionDateMap = new Map(sessions.map(s => [s.id, s.started_at]));

      // Minimal placeholder: show per-session data we have
      // (Full lexical metrics require loading all session files — available per-session on demand)
      setData([]);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
