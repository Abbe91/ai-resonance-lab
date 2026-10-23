import { useState, useEffect } from 'react';
import { getSessions } from '@/data/repository';
import type { DBSession } from '@/lib/database.types';

export interface RealtimeSession {
  id: string;
  entityA: { id: string; name: string; designation: string };
  entityB: { id: string; name: string; designation: string };
  status: 'active' | 'dormant' | 'ended';
  relationshipState: string;
  metrics: {
    resonance: number; tension: number; novelty: number;
    silenceRatio: number; totalSilenceDuration: number; messageCount: number;
  };
  startedAt: Date;
  lastActivity: Date;
  endedAt?: Date;
}

function transformSession(s: DBSession): RealtimeSession {
  return {
    id: s.id,
    entityA: {
      id: s.agent_a?.id || s.agent_a_id,
      name: s.agent_a?.name || 'Unknown',
      designation: s.agent_a?.designation || 'ENTITY-?',
    },
    entityB: {
      id: s.agent_b?.id || s.agent_b_id,
      name: s.agent_b?.name || 'Unknown',
      designation: s.agent_b?.designation || 'ENTITY-?',
    },
    status: s.status,
    relationshipState: s.relationship_state,
    metrics: {
      resonance: s.resonance, tension: s.tension, novelty: s.novelty,
      silenceRatio: s.silence_ratio, totalSilenceDuration: s.total_silence_duration,
      messageCount: s.message_count,
    },
    startedAt: new Date(s.started_at),
    lastActivity: new Date(s.last_activity),
    endedAt: s.ended_at ? new Date(s.ended_at) : undefined,
  };
}

export function useRealtimeSessions() {
  const [sessions, setSessions] = useState<RealtimeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getSessions()
      .then(data => setSessions(data.map(transformSession)))
      .catch(e => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, []);

  return {
    sessions,
    activeSessions: sessions.filter(s => s.status === 'active'),
    otherSessions: sessions.filter(s => s.status !== 'active'),
    loading,
    error,
    refetch: () => {},
  };
}
