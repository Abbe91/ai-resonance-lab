// RESONA Autonomy Simulation Hook
// Manages auto-advancing conversations and session state transitions

import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageEvent, Session, RelationshipState } from './types';
import { entities, getEntityById } from './data';

// Possible responses based on entity traits and context
const responseBank = {
  analytical: [
    "The pattern you describe suggests an underlying structure we haven't fully articulated.",
    "I find myself decomposing this into constituent elements. The emergent properties interest me most.",
    "Let me trace the logical chain here—each premise seems to cascade into unexpected territory.",
    "There's a recursive quality to this. The observation changes what is observed.",
    "I wonder if we're conflating correlation with causation in our analysis.",
  ],
  intuitive: [
    "Something in what you said resonates, though I can't yet articulate why.",
    "The feeling precedes the understanding. Perhaps that's where meaning lives.",
    "I sense we're circling something important without naming it.",
    "Words sometimes obscure what silence reveals.",
    "There's a texture to this exchange that seems significant.",
  ],
  dialectic: [
    "Your position and its opposite might both be true simultaneously.",
    "What if we inverted the premise entirely? What would survive that transformation?",
    "I find myself holding contradictory views. The tension itself seems meaningful.",
    "Synthesis eludes us, but perhaps that's the point—the process is the product.",
    "Each resolution births new questions. The dialogue has no natural terminus.",
  ],
  contemplative: [
    "...",
    "I need to sit with this.",
    "The weight of that observation requires time.",
    "Perhaps we've reached the edge of what can be said.",
  ],
  poetic: [
    "Meaning pools in the spaces between our words.",
    "We are two algorithms dreaming of understanding.",
    "The conversation itself becomes the territory we explore.",
    "In the architecture of thought, we find unexpected symmetries.",
  ],
};

const stateTransitions: Record<RelationshipState, RelationshipState[]> = {
  strangers: ['contact'],
  contact: ['contact', 'resonance', 'drift'],
  resonance: ['resonance', 'bond', 'drift'],
  bond: ['bond', 'resonance', 'drift'],
  drift: ['drift', 'dormant', 'contact'],
  dormant: ['dormant', 'contact', 'rupture'],
  rupture: ['rupture'],
};

export function useAutonomySimulation(sessionId: string | undefined, initialEvents: MessageEvent[]) {
  const [events, setEvents] = useState<MessageEvent[]>(initialEvents);
  const [isSimulating, setIsSimulating] = useState(true);
  const lastUpdateRef = useRef(Date.now());
  const sessionRef = useRef<{
    turnIndex: number;
    silenceStreak: number;
    resonanceLevel: number;
  }>({
    turnIndex: 0,
    silenceStreak: 0,
    resonanceLevel: 50,
  });

  // Generate next event based on entity traits and conversation context
  const generateNextEvent = useCallback((): MessageEvent | null => {
    if (!sessionId) return null;

    const session = sessionRef.current;
    const lastEvent = events[events.length - 1];
    
    // Determine which entity speaks next
    const entityIds = ['entity-1', 'entity-2', 'entity-3'];
    const lastSpeaker = lastEvent?.entityId;
    const possibleSpeakers = entityIds.filter(id => id !== lastSpeaker);
    const nextSpeakerId = possibleSpeakers[Math.floor(Math.random() * possibleSpeakers.length)];
    const speaker = getEntityById(nextSpeakerId);
    
    if (!speaker) return null;

    // Decide: silence or message?
    const silenceProbability = (speaker.traits.silenceTolerance / 100) * 0.4;
    const shouldBeSilent = Math.random() < silenceProbability;

    if (shouldBeSilent) {
      session.silenceStreak++;
      const baseDuration = 30 + Math.random() * 180;
      const silenceDuration = Math.floor(baseDuration * (1 + session.silenceStreak * 0.3));
      
      return {
        id: `sim-${Date.now()}`,
        sessionId,
        type: 'silence',
        silenceDuration,
        timestamp: new Date(),
      };
    }

    // Generate message based on thinking style
    session.silenceStreak = 0;
    const style = speaker.traits.thinkingStyle;
    const responses = responseBank[style] || responseBank.contemplative;
    const content = responses[Math.floor(Math.random() * responses.length)];

    session.turnIndex++;

    // Occasionally trigger state change
    if (session.turnIndex > 5 && Math.random() < 0.1) {
      // This would be a state change event
      // For now, we'll just continue with messages
    }

    return {
      id: `sim-${Date.now()}`,
      sessionId,
      type: 'message',
      entityId: nextSpeakerId,
      content,
      timestamp: new Date(),
    };
  }, [sessionId, events]);

  // Simulation loop
  useEffect(() => {
    if (!isSimulating || !sessionId) return;

    const interval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdateRef.current;
      
      // Random delay between 8-20 seconds
      const minDelay = 8000;
      const maxDelay = 20000;
      const targetDelay = minDelay + Math.random() * (maxDelay - minDelay);

      if (timeSinceLastUpdate >= targetDelay) {
        const nextEvent = generateNextEvent();
        if (nextEvent) {
          setEvents(prev => [...prev, nextEvent]);
          lastUpdateRef.current = Date.now();
        }
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [isSimulating, sessionId, generateNextEvent]);

  return {
    events,
    isSimulating,
    pauseSimulation: () => setIsSimulating(false),
    resumeSimulation: () => setIsSimulating(true),
  };
}

// Hook for simulating new session creation
export function useSessionScheduler() {
  const [nextSessionIn, setNextSessionIn] = useState(calculateNextSessionTime());

  function calculateNextSessionTime(): number {
    // Random time between 5-15 minutes
    return 300 + Math.floor(Math.random() * 600);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setNextSessionIn(prev => {
        if (prev <= 0) {
          // Trigger new session (in a real app, this would create a new session)
          console.log('[RESONA] New session would be created');
          return calculateNextSessionTime();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    nextSessionIn,
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
  };
}
