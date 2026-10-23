import { useState, useEffect } from 'react';
import { getArchivistNotes, getSessionDetail } from '@/data/repository';

export interface ObserverNote {
  id: string;
  sessionId: string;
  observationType: string;
  content: string;
  createdAt: Date;
  agentAName?: string;
  agentBName?: string;
  relationshipState?: string;
}

export function useObserverNotes(filter?: string) {
  const [notes, setNotes] = useState<ObserverNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArchivistNotes().then(data => {
      let transformed = data.map(n => ({
        id: n.id,
        sessionId: n.session_id,
        observationType: 'archivist_summary',
        content: n.content,
        createdAt: new Date(n.created_at),
        agentAName: n.agent_a_name || undefined,
        agentBName: n.agent_b_name || undefined,
        relationshipState: n.relationship_state,
      }));

      if (filter && filter !== 'all') {
        transformed = transformed.filter(n => n.relationshipState === filter);
      }

      setNotes(transformed);
      setLoading(false);
    });
  }, [filter]);

  return { notes, loading, refetch: () => {} };
}

export function useSessionArchivistNote(sessionId: string | undefined) {
  const [note, setNote] = useState<ObserverNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }

    getSessionDetail(sessionId).then(detail => {
      const raw = detail.observer_notes.find(n => n.observation_type === 'archivist_summary');
      setNote(
        raw
          ? {
              id: raw.id,
              sessionId: raw.session_id,
              observationType: raw.observation_type,
              content: raw.content,
              createdAt: new Date(raw.created_at),
            }
          : null
      );
      setLoading(false);
    });
  }, [sessionId]);

  return { note, loading };
}
