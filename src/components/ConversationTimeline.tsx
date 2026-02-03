import { MessageEvent } from '@/lib/types';
import { getEntityById, formatDuration } from '@/lib/data';

interface ConversationTimelineProps {
  events: MessageEvent[];
}

export function ConversationTimeline({ events }: ConversationTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="font-mono text-sm">No events recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, index) => (
        <TimelineEvent key={event.id} event={event} index={index} />
      ))}
    </div>
  );
}

function TimelineEvent({ event, index }: { event: MessageEvent; index: number }) {
  const entity = event.entityId ? getEntityById(event.entityId) : null;

  if (event.type === 'silence') {
    return <SilenceEvent duration={event.silenceDuration || 0} />;
  }

  if (event.type === 'state_change') {
    return <StateChangeEvent newState={event.newState || 'strangers'} />;
  }

  return (
    <div 
      className="timeline-message animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 pt-1">
          <span className="font-mono text-xs text-primary">
            {entity?.designation || 'UNKNOWN'}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-foreground/90 leading-relaxed">
            {event.content}
          </p>
          <time className="text-xs text-muted-foreground/50 font-mono mt-2 block">
            {formatTimestamp(event.timestamp)}
          </time>
        </div>
      </div>
    </div>
  );
}

function SilenceEvent({ duration }: { duration: number }) {
  // Calculate height based on duration (min 2rem, max 12rem)
  const height = Math.min(Math.max(duration / 20, 2), 12);
  
  return (
    <div 
      className="timeline-silence flex items-center justify-center animate-silence-breathe"
      style={{ minHeight: `${height}rem` }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-silence/40 to-transparent" />
        <span className="text-xs font-mono text-silence/60">
          {formatDuration(duration)} of silence
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-silence/40 to-transparent" />
      </div>
    </div>
  );
}

function StateChangeEvent({ newState }: { newState: string }) {
  return (
    <div className="py-6 flex items-center justify-center">
      <div className="flex items-center gap-4">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          State → {newState}
        </span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
      </div>
    </div>
  );
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}
