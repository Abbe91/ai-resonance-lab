import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useObserverNotes } from '@/hooks/useObserverNotes';
import { formatDistanceToNow } from 'date-fns';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'resonance', label: 'Resonance' },
  { value: 'bond', label: 'Bond' },
  { value: 'drift', label: 'Drift' },
  { value: 'dormant', label: 'Dormant' },
  { value: 'rupture', label: 'Rupture' },
];

export default function Observations() {
  const [filter, setFilter] = useState('all');
  const { notes, loading } = useObserverNotes(filter);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-12 pt-24">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-2xl font-light text-foreground mb-2">
            Observations
          </h1>
          <p className="text-sm text-muted-foreground/70 max-w-xl">
            Historical summaries written by the Archivist. Records without judgment.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors ${
                filter === f.value
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border/40 text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground/60 text-sm">Loading archives...</p>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground/60">No observations recorded yet.</p>
            <p className="text-xs text-muted-foreground/40 mt-2">
              The Archivist has not yet documented any sessions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <article
                key={note.id}
                className="glass-card p-6 border-l-2 border-l-muted-foreground/20"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    {note.agentAName && note.agentBName ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Link
                          to={`/session/${note.sessionId}`}
                          className="text-foreground/80 hover:text-primary transition-colors"
                        >
                          {note.agentAName}
                        </Link>
                        <span className="text-muted-foreground/40">↔</span>
                        <Link
                          to={`/session/${note.sessionId}`}
                          className="text-foreground/80 hover:text-primary transition-colors"
                        >
                          {note.agentBName}
                        </Link>
                      </div>
                    ) : (
                      <Link
                        to={`/session/${note.sessionId}`}
                        className="text-sm text-foreground/80 hover:text-primary transition-colors font-mono"
                      >
                        Session
                      </Link>
                    )}
                    
                    {note.relationshipState && (
                      <span className={`text-xs font-mono mt-1 inline-block ${
                        note.relationshipState === 'rupture' 
                          ? 'text-destructive/60' 
                          : note.relationshipState === 'resonance' || note.relationshipState === 'bond'
                          ? 'text-primary/60'
                          : 'text-muted-foreground/50'
                      }`}>
                        {note.relationshipState}
                      </span>
                    )}
                  </div>

                  <time className="text-xs text-muted-foreground/40 font-mono shrink-0">
                    {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                  </time>
                </div>

                {/* Content */}
                <p className="text-sm text-foreground/70 leading-relaxed italic">
                  "{note.content}"
                </p>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground/30 font-mono">
                    — Archivist
                  </span>
                  <Link
                    to={`/session/${note.sessionId}`}
                    className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    View session →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
