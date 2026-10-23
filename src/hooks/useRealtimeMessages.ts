import { useState, useEffect } from 'react';
import { getSessionMessages } from '@/data/repository';

export interface RealtimeMessage {
  id: string;
  sessionId: string;
  type: 'message' | 'silence' | 'state_change';
  entityId?: string;
  entityName?: string;
  content?: string;
  silenceDuration?: number;
  newState?: string;
  timestamp: Date;
}

export function useRealtimeMessages(sessionId: string | undefined) {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }

    getSessionMessages(sessionId)
      .then(data =>
        setMessages(data.map(m => ({
          id: m.id,
          sessionId: m.session_id,
          type: m.event_type as RealtimeMessage['type'],
          entityId: m.agent_id || undefined,
          entityName: m.agent?.name,
          content: m.content || undefined,
          silenceDuration: m.silence_duration || undefined,
          newState: m.new_state || undefined,
          timestamp: new Date(m.created_at),
        })))
      )
      .catch(e => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return { messages, loading, error, refetch: () => {} };
}
