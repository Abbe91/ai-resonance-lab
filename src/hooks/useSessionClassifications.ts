import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SessionClassification } from '@/lib/observer.types';

interface SessionObserverData {
  sessionId: string;
  classification: SessionClassification;
}

export function useSessionClassifications() {
  const [classifications, setClassifications] = useState<Map<string, SessionClassification>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClassifications() {
      try {
        const { data, error } = await supabase
          .from('session_observer_metrics')
          .select('session_id, classification');

        if (error) throw error;

        const map = new Map<string, SessionClassification>();
        for (const row of data || []) {
          map.set(row.session_id, row.classification as SessionClassification);
        }
        setClassifications(map);
      } catch (e) {
        console.error('Error fetching session classifications:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchClassifications();

    // Subscribe to changes
    const channel = supabase
      .channel('session-classifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_observer_metrics',
        },
        () => {
          fetchClassifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getClassification = (sessionId: string): SessionClassification | undefined => {
    return classifications.get(sessionId);
  };

  return { classifications, getClassification, loading };
}