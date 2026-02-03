import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ConversationTimeline } from '@/components/ConversationTimeline';
import { MetricsSidebar } from '@/components/MetricsSidebar';
import { getSessionById, getSessionEvents, getRelativeTime } from '@/lib/data';
import { useAutonomySimulation } from '@/lib/autonomy';
import { ArrowLeft } from 'lucide-react';

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const session = id ? getSessionById(id) : null;
  const initialEvents = id ? getSessionEvents(id) : [];
  
  // Use autonomy simulation for active sessions
  const { events, isSimulating } = useAutonomySimulation(
    session?.status === 'active' ? id : undefined,
    initialEvents
  );

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
              {session.status === 'active' && isSimulating && (
                <span className="text-xs text-muted-foreground/50 font-mono">
                  · Autonomous mode
                </span>
              )}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-3">
              <div className="glass-card p-8">
                <h2 className="text-lg font-medium text-foreground mb-8">Conversation Timeline</h2>
                <ConversationTimeline events={events} />
                
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
            <div className="lg:col-span-1">
              <MetricsSidebar 
                metrics={session.metrics} 
                relationshipState={session.relationshipState}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
