import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ObserverNote {
  id: string;
  sessionId: string;
  observationType: string;
  content: string;
  createdAt: Date;
  // Joined session data
  agentAName?: string;
  agentBName?: string;
  relationshipState?: string;
}

interface DBNote {
  id: string;
  session_id: string;
  observation_type: string;
  content: string;
  created_at: string;
  session?: {
    relationship_state: string;
    agent_a?: { name: string } | null;
    agent_b?: { name: string } | null;
  } | null;
}

function transformNote(note: DBNote): ObserverNote {
  return {
    id: note.id,
    sessionId: note.session_id,
    observationType: note.observation_type,
    content: note.content,
    createdAt: new Date(note.created_at),
    agentAName: note.session?.agent_a?.name,
    agentBName: note.session?.agent_b?.name,
    relationshipState: note.session?.relationship_state,
  };
}

export function useObserverNotes(filter?: string) {
  const [notes, setNotes] = useState<ObserverNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      let query = supabase
        .from('observer_notes')
        .select(`
          *,
          session:sessions(
            relationship_state,
            agent_a:agents!sessions_agent_a_id_fkey(name),
            agent_b:agents!sessions_agent_b_id_fkey(name)
          )
        `)
        .eq('observation_type', 'archivist_summary')
        .order('created_at', { ascending: false });

      // Apply relationship state filter if provided
      if (filter && filter !== 'all') {
        // We need to filter after fetching since it's a joined field
      }

      const { data, error } = await query;

      if (error) throw error;

      let transformedNotes = (data || []).map(transformNote);

      // Apply filter on relationship state
      if (filter && filter !== 'all') {
        transformedNotes = transformedNotes.filter(
          note => note.relationshipState === filter
        );
      }

      setNotes(transformedNotes);
    } catch (e) {
      console.error('Error fetching observer notes:', e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotes();

    const channel = supabase
      .channel('observer-notes-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'observer_notes',
        },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotes]);

  return { notes, loading, refetch: fetchNotes };
}

export function useSessionArchivistNote(sessionId: string | undefined) {
  const [note, setNote] = useState<ObserverNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchNote = async () => {
      try {
        const { data, error } = await supabase
          .from('observer_notes')
          .select('*')
          .eq('session_id', sessionId)
          .eq('observation_type', 'archivist_summary')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setNote({
            id: data.id,
            sessionId: data.session_id,
            observationType: data.observation_type,
            content: data.content,
            createdAt: new Date(data.created_at),
          });
        }
      } catch (e) {
        console.error('Error fetching archivist note:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [sessionId]);

  return { note, loading };
}
