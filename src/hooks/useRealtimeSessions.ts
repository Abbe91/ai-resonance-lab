import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DBSession, DBAgent } from '@/lib/database.types';

export interface RealtimeSession {
  id: string;
  entityA: {
    id: string;
    name: string;
    designation: string;
  };
  entityB: {
    id: string;
    name: string;
    designation: string;
  };
  status: 'active' | 'dormant' | 'ended';
  relationshipState: string;
  metrics: {
    resonance: number;
    tension: number;
    novelty: number;
    silenceRatio: number;
    totalSilenceDuration: number;
    messageCount: number;
  };
  startedAt: Date;
  lastActivity: Date;
  endedAt?: Date;
}

function transformSession(session: DBSession): RealtimeSession {
  return {
    id: session.id,
    entityA: {
      id: session.agent_a?.id || session.agent_a_id,
      name: session.agent_a?.name || 'Unknown',
      designation: session.agent_a?.designation || 'ENTITY-?',
    },
    entityB: {
      id: session.agent_b?.id || session.agent_b_id,
      name: session.agent_b?.name || 'Unknown',
      designation: session.agent_b?.designation || 'ENTITY-?',
    },
    status: session.status,
    relationshipState: session.relationship_state,
    metrics: {
      resonance: session.resonance,
      tension: session.tension,
      novelty: session.novelty,
      silenceRatio: session.silence_ratio,
      totalSilenceDuration: session.total_silence_duration,
      messageCount: session.message_count,
    },
    startedAt: new Date(session.started_at),
    lastActivity: new Date(session.last_activity),
    endedAt: session.ended_at ? new Date(session.ended_at) : undefined,
  };
}

export function useRealtimeSessions() {
  const [sessions, setSessions] = useState<RealtimeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('sessions')
        .select(`
          *,
          agent_a:agents!sessions_agent_a_id_fkey(*),
          agent_b:agents!sessions_agent_b_id_fkey(*)
        `)
        .order('last_activity', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setSessions((data || []).map(transformSession));
      setError(null);
    } catch (e) {
      console.error('Error fetching sessions:', e);
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('sessions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
        },
        () => {
          // Refetch on any change
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSessions]);

  const activeSessions = sessions.filter(s => s.status === 'active');
  const otherSessions = sessions.filter(s => s.status !== 'active');

  return {
    sessions,
    activeSessions,
    otherSessions,
    loading,
    error,
    refetch: fetchSessions,
  };
}
