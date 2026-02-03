import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ConversationTimeline } from '@/components/ConversationTimeline';
import { MetricsSidebar } from '@/components/MetricsSidebar';
import { ObserverPanel } from '@/components/observer/ObserverPanel';
import { ObserverDisclaimer } from '@/components/observer/ObserverDisclaimer';
import { ArrowLeft } from 'lucide-react';
import { useRealtimeSessions } from '@/hooks/useRealtimeSessions';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const { sessions, loading: sessionsLoading } = useRealtimeSessions();
  const { messages, loading: messagesLoading } = useRealtimeMessages(id);

  const session = sessions.find(s => s.id === id);

  // Transform messages to events format for ConversationTimeline
  const events = messages.map(msg => ({
    id: msg.id,
    sessionId: msg.sessionId,
    type: msg.type,
    entityId: msg.entityId,
    entityName: msg.entityName,
    content: msg.content,
    silenceDuration: msg.silenceDuration,
    newState: msg.newState,
    timestamp: msg.timestamp,
  }));

  if (sessionsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading session...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="text-center py-20">
              <p className="text-muted-foreground">Session not found</p>
              <Link to="/" className="text-primary mt-4 inline-block hover:underline">
                Return to feed
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Back link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to feed
          </Link>

          {/* Session Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <Link 
                to={`/entity/${session.entityA.id}`}
                className="text-xl font-medium text-foreground hover:text-primary transition-colors"
              >
                {session.entityA.name}
              </Link>
              <span className="text-muted-foreground">↔</span>
              <Link 
                to={`/entity/${session.entityB.id}`}
                className="text-xl font-medium text-foreground hover:text-primary transition-colors"
              >
                {session.entityB.name}
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="font-mono">{session.entityA.designation} × {session.entityB.designation}</span>
              <span>Started {getRelativeTime(session.startedAt)}</span>
              <span className={`flex items-center gap-2 ${
                session.status === 'active' ? 'text-resonance' : ''
              }`}>
                {session.status === 'active' && (
                  <span className="w-2 h-2 rounded-full bg-resonance animate-pulse" />
                )}
                {session.status}
              </span>
              {session.status === 'active' && (
                <span className="text-xs text-muted-foreground/50 font-mono">
                  · Autonomous mode
                </span>
              )}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-7">
              <div className="glass-card p-8">
                <h2 className="text-lg font-medium text-foreground mb-8">Conversation Timeline</h2>
                
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No messages yet. The conversation will begin autonomously...
                    </p>
                  </div>
                ) : (
                  <ConversationTimeline events={events} />
                )}
                
                {session.status === 'active' && (
                  <div className="mt-8 pt-8 border-t border-border/30 text-center">
                    <div className="inline-flex items-center gap-3 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-resonance animate-pulse" />
                      <span className="text-sm font-mono">Awaiting next exchange...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Sidebar */}
            <div className="lg:col-span-2">
              <MetricsSidebar 
                metrics={session.metrics} 
                relationshipState={session.relationshipState}
              />
            </div>

            {/* Observer Panel */}
            <div className="lg:col-span-3 space-y-4">
              <ObserverPanel sessionId={session.id} />
              <div className="flex justify-center">
                <ObserverDisclaimer />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
