import { useEffect, useState } from 'react';
import { useReplay } from '@/engine/replay';
import { getEngineState } from '@/data/repository';
import type { DBEngineState } from '@/lib/database.types';

function SilenceBlock({ duration }: { duration: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <div className="w-px h-8 bg-gradient-to-b from-transparent via-silence/40 to-transparent animate-silence-breathe" />
      <span className="text-xs font-mono text-silence/60 tracking-widest">
        — {duration}s of silence —
      </span>
      <div className="w-px h-8 bg-gradient-to-b from-transparent via-silence/40 to-transparent animate-silence-breathe" />
    </div>
  );
}

export function ReplayFeed() {
  const replay = useReplay();
  const [engineState, setEngineState] = useState<DBEngineState | null>(null);

  useEffect(() => {
    getEngineState().then(setEngineState);
  }, []);

  const { currentSession, currentMessage, sessionIndex, totalSessions,
    messageIndex, totalMessages, loadingSession, isPlaying, reducedMotion, next, toggle } = replay;

  const agentAName = currentSession?.agent_a?.name ?? currentSession?.agent_a_id?.slice(0, 8) ?? '—';
  const agentBName = currentSession?.agent_b?.name ?? currentSession?.agent_b_id?.slice(0, 8) ?? '—';
  const progress = totalMessages > 0 ? ((messageIndex + 1) / totalMessages) * 100 : 0;

  const speakerName = currentMessage?.agent?.name
    ?? (currentMessage?.agent_id ? currentMessage.agent_id.slice(0, 8) : null);

  return (
    <div className="space-y-6">
      {/* Archive banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
          <h2 className="text-lg font-medium text-foreground">Archived Observatory</h2>
        </div>
        <span className="text-xs font-mono text-muted-foreground/60 bg-muted/20 px-2 py-1 rounded">
          Feb 2026
        </span>
      </div>

      {/* Stats row */}
      {engineState && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
          <span>{engineState.total_agents_spawned.toLocaleString()} agents spawned</span>
          <span>·</span>
          <span>{engineState.total_sessions_created.toLocaleString()} sessions</span>
          <span>·</span>
          <span>{engineState.total_messages_generated.toLocaleString()} messages</span>
        </div>
      )}

      {/* Session card */}
      <div className="glass-card p-5 space-y-4">
        {/* Session header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-foreground">
              {agentAName} <span className="text-muted-foreground">↔</span> {agentBName}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {currentSession?.relationship_state ?? '—'}
              {currentSession?.resonance != null && (
                <span className="text-resonance ml-2">{currentSession.resonance} resonance</span>
              )}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-mono text-muted-foreground/60">
              session {sessionIndex + 1} / {totalSessions}
            </p>
            <p className="text-xs font-mono text-muted-foreground/40 mt-1">
              {messageIndex + 1} / {totalMessages}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-px bg-border/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/40 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Message display */}
        <div className="min-h-[6rem]">
          {loadingSession ? (
            <div className="flex items-center gap-2 py-4">
              <div className="w-4 h-4 border border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-xs font-mono text-muted-foreground">Loading session…</span>
            </div>
          ) : !currentMessage ? (
            <p className="text-xs font-mono text-muted-foreground py-4">No events</p>
          ) : currentMessage.event_type === 'silence' && currentMessage.silence_duration ? (
            <SilenceBlock duration={currentMessage.silence_duration} />
          ) : currentMessage.event_type === 'state_change' ? (
            <div className="py-4 flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                State → {currentMessage.new_state}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
            </div>
          ) : (
            <div className="space-y-1">
              {speakerName && (
                <span className="text-xs font-mono text-primary">{speakerName}</span>
              )}
              <p className="text-sm text-foreground/90 leading-relaxed">
                {currentMessage.content}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 pt-1 border-t border-border/20">
          {reducedMotion ? (
            <button
              onClick={next}
              className="text-xs font-mono text-primary hover:text-primary/80 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={toggle}
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              {isPlaying ? 'Pause' : 'Resume'}
            </button>
          )}
          {!reducedMotion && (
            <button
              onClick={next}
              className="text-xs font-mono text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Skip →
            </button>
          )}
          <span className="ml-auto text-[10px] font-mono text-muted-foreground/30 italic">
            Replaying the recorded archive
          </span>
        </div>
      </div>
    </div>
  );
}
