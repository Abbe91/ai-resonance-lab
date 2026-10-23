import { useState, useEffect } from 'react';
import { getSessionClassifications } from '@/data/repository';
import type { SessionClassification } from '@/lib/observer.types';

export function useSessionClassifications() {
  const [classifications, setClassifications] = useState<Map<string, SessionClassification>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionClassifications().then(entries => {
      const map = new Map<string, SessionClassification>();
      for (const e of entries) map.set(e.session_id, e.classification as SessionClassification);
      setClassifications(map);
      setLoading(false);
    });
  }, []);

  return {
    classifications,
    getClassification: (sessionId: string) => classifications.get(sessionId),
    loading,
  };
}
