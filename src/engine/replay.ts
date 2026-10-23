import { useState, useEffect, useRef, useCallback } from 'react';
import type { DBSession, DBAgent } from '@/lib/database.types';
import type { RawMessage } from '@/data/repository';
import { getSessions, getSessionMessages } from '@/data/repository';

const COMPRESSION = 3 / 60;
const MIN_DELAY = 200;
const MAX_DELAY = 2500;

function computeDelay(current: RawMessage, next: RawMessage | undefined): number {
  if (!next) return MIN_DELAY;
  const gapMs = new Date(next.created_at).getTime() - new Date(current.created_at).getTime();
  const gapSec = gapMs / 1000;
  // For silence events, add extra weight from silence_duration
  const silenceExtra = current.event_type === 'silence' && current.silence_duration
    ? current.silence_duration * COMPRESSION * 1000
    : 0;
  const compressed = gapSec * COMPRESSION * 1000 + silenceExtra;
  return Math.min(Math.max(compressed, MIN_DELAY), MAX_DELAY);
}

export interface ReplayState {
  currentSession: DBSession | null;
  currentMessage: (RawMessage & { agent?: DBAgent }) | null;
  sessionIndex: number;
  totalSessions: number;
  messageIndex: number;
  totalMessages: number;
  loadingSession: boolean;
  isPlaying: boolean;
  reducedMotion: boolean;
  next: () => void;
  toggle: () => void;
}

export function useReplay(): ReplayState {
  const [sessions, setSessions] = useState<DBSession[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [messages, setMessages] = useState<(RawMessage & { agent?: DBAgent })[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIndexRef = useRef(0);
  const messageIndexRef = useRef(0);
  const messagesRef = useRef<(RawMessage & { agent?: DBAgent })[]>([]);
  const sessionsRef = useRef<DBSession[]>([]);
  const isPlayingRef = useRef(true);

  // Keep refs in sync
  sessionIndexRef.current = sessionIndex;
  messageIndexRef.current = messageIndex;
  messagesRef.current = messages;
  sessionsRef.current = sessions;
  isPlayingRef.current = isPlaying;

  const loadSession = useCallback((idx: number, sessionList: DBSession[]) => {
    if (sessionList.length === 0) return;
    const session = sessionList[idx % sessionList.length];
    setLoadingSession(true);
    setMessages([]);
    setMessageIndex(0);
    getSessionMessages(session.id).then(msgs => {
      setMessages(msgs);
      setLoadingSession(false);
    });
  }, []);

  // Load sessions on mount
  useEffect(() => {
    getSessions().then(data => {
      setSessions(data);
      loadSession(0, data);
    });
  }, [loadSession]);

  const advanceMessage = useCallback(() => {
    const msgs = messagesRef.current;
    const mi = messageIndexRef.current;
    const si = sessionIndexRef.current;
    const sl = sessionsRef.current;

    if (mi + 1 < msgs.length) {
      const nextIdx = mi + 1;
      setMessageIndex(nextIdx);
      // Schedule next auto-advance
      if (!reducedMotion && isPlayingRef.current) {
        const delay = computeDelay(msgs[mi], msgs[nextIdx]);
        timerRef.current = setTimeout(advanceMessage, delay);
      }
    } else {
      // Move to next session
      const nextSi = (si + 1) % Math.max(sl.length, 1);
      setSessionIndex(nextSi);
      loadSession(nextSi, sl);
    }
  }, [loadSession, reducedMotion]);

  // Start auto-advance when messages load and playing
  useEffect(() => {
    if (loadingSession || messages.length === 0) return;
    if (reducedMotion || !isPlaying) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    const delay = computeDelay(messages[0], messages[1]);
    timerRef.current = setTimeout(advanceMessage, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loadingSession, messages, isPlaying, reducedMotion, advanceMessage]);

  const next = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    advanceMessage();
  }, [advanceMessage]);

  const toggle = useCallback(() => {
    setIsPlaying(prev => {
      const next = !prev;
      if (!next && timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return next;
    });
  }, []);

  const currentSession = sessions.length > 0 ? sessions[sessionIndex % sessions.length] : null;
  const currentMessage = messages.length > 0 ? messages[messageIndex] : null;

  return {
    currentSession,
    currentMessage,
    sessionIndex,
    totalSessions: sessions.length,
    messageIndex,
    totalMessages: messages.length,
    loadingSession,
    isPlaying,
    reducedMotion,
    next,
    toggle,
  };
}
