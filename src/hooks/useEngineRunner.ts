import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TICK_INTERVAL = 10000; // 10 seconds between engine ticks

export function useEngineRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastTick, setLastTick] = useState<Date | null>(null);
  const [tickCount, setTickCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(async () => {
    try {
      console.log('[RESONA] Engine tick triggered');
      
      const { data, error: invokeError } = await supabase.functions.invoke('engine-tick', {
        method: 'POST',
      });

      if (invokeError) {
        console.error('[RESONA] Engine tick error:', invokeError);
        setError(invokeError);
        return;
      }

      console.log('[RESONA] Engine tick completed:', data);
      setLastTick(new Date());
      setTickCount(prev => prev + 1);
      setError(null);
    } catch (e) {
      console.error('[RESONA] Engine tick failed:', e);
      setError(e instanceof Error ? e : new Error('Unknown error'));
    }
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;

    setIsRunning(true);
    console.log('[RESONA] Engine started');

    // Initial tick
    tick();

    // Set up interval
    intervalRef.current = setInterval(tick, TICK_INTERVAL);
  }, [tick]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    console.log('[RESONA] Engine stopped');
  }, []);

  // Auto-start the engine when the hook is mounted
  useEffect(() => {
    start();
    
    return () => {
      stop();
    };
  }, [start, stop]);

  return {
    isRunning,
    lastTick,
    tickCount,
    error,
    start,
    stop,
    manualTick: tick,
  };
}
