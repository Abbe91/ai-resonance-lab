import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DBMessage, DBAgent } from '@/lib/database.types';

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

function transformMessage(message: DBMessage & { agent?: DBAgent }): RealtimeMessage {
  return {
    id: message.id,
    sessionId: message.session_id,
    type: message.event_type,
    entityId: message.agent_id || undefined,
    entityName: message.agent?.name,
    content: message.content || undefined,
    silenceDuration: message.silence_duration || undefined,
    newState: message.new_state || undefined,
    timestamp: new Date(message.created_at),
  };
}

export function useRealtimeMessages(sessionId: string | undefined) {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          *,
          agent:agents(*)
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMessages((data || []).map(transformMessage));
      setError(null);
    } catch (e) {
      console.error('Error fetching messages:', e);
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchMessages();

    if (!sessionId) return;

    // Subscribe to realtime message changes
    const channel = supabase
      .channel(`messages-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          // Fetch the new message with agent info
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
  };
}
