import { useState } from 'react';
import { useSessionArchivistNote } from '@/hooks/useObserverNotes';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatDistanceToNow } from 'date-fns';

interface ArchivistNoteIndicatorProps {
  sessionId: string;
}

export function ArchivistNoteIndicator({ sessionId }: ArchivistNoteIndicatorProps) {
  const { note, loading } = useSessionArchivistNote(sessionId);
  const [isOpen, setIsOpen] = useState(false);

  if (loading || !note) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-6">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-md border border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer">
          <span className="text-xs text-muted-foreground/60 font-mono">
            📜 Archivist note available
          </span>
          <span className="text-xs text-muted-foreground/40">
            {isOpen ? '−' : '+'}
          </span>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-3 p-4 rounded-md bg-muted/5 border border-border/20">
          <p className="text-sm text-foreground/70 italic leading-relaxed">
            "{note.content}"
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground/30 font-mono">
              — Archivist
            </span>
            <time className="text-xs text-muted-foreground/30">
              {formatDistanceToNow(note.createdAt, { addSuffix: true })}
            </time>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
