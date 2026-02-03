/**
 * Observer Panel - Human Observer View
 * 
 * ETHICAL DISPLAY GUIDELINES:
 * - Classifications are "observed pattern characteristics"
 * - NEVER frame as success/failure or good/bad
 * - All patterns are legitimate outcomes
 * - Silence and non-resolution are valid
 */

import { useObserverMetrics } from '@/hooks/useObserverMetrics';
import { 
  classificationDescriptions, 
  metricLabels,
  SessionClassification 
} from '@/lib/observer.types';
import { Eye, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ObserverPanelProps {
  sessionId: string;
}

const classificationColors: Record<SessionClassification, string> = {
  deep_recursive_resonance: 'text-resonance',
  static_repetition: 'text-muted-foreground',
  exploratory_unstable: 'text-tension',
  dormant_meaningful: 'text-dormant',
  undetermined: 'text-muted-foreground/50',
};

export function ObserverPanel({ sessionId }: ObserverPanelProps) {
  const { metrics, notes, loading } = useObserverMetrics(sessionId);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">Observer Layer</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground">Observer Layer</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 text-center py-4">
          Awaiting sufficient data for observation...
        </p>
      </div>
    );
  }

  const classification = metrics.classification as SessionClassification;
  const classInfo = classificationDescriptions[classification];

  return (
    <TooltipProvider>
      <div className="glass-card p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Observer Layer</h3>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3 h-3 text-muted-foreground/50" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Passive observation metrics. These classifications do not influence agent behavior 
                and are displayed for research observation only.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Classification */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground/60 uppercase tracking-wider">
            Observed Pattern
          </div>
          <div className={`font-mono text-sm ${classificationColors[classification]}`}>
            {classInfo.label}
          </div>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {classInfo.description}
          </p>
          <p className="text-xs text-muted-foreground/50 italic leading-relaxed">
            {classInfo.note}
          </p>
        </div>

        {/* Metrics */}
        <div className="space-y-4 pt-4 border-t border-border/30">
          <div className="text-xs text-muted-foreground/60 uppercase tracking-wider">
            Independent Metrics
          </div>

          <MetricRow
            label="Lexical Drift"
            value={`${metrics.lexical_drift}%`}
            info={metricLabels.lexical_drift}
          />
          
          <MetricRow
            label="Self-Reference Evolution"
            value={`${metrics.self_reference_evolution}%`}
            info={metricLabels.self_reference_evolution}
          />
          
          <MetricRow
            label="Concept Re-entry"
            value={`${metrics.concept_reentry}%`}
            info={metricLabels.concept_reentry}
          />
          
          <MetricRow
            label="Uncertainty Markers"
            value={`${metrics.uncertainty_acknowledgment}%`}
            info={metricLabels.uncertainty_acknowledgment}
          />
          
          <MetricRow
            label="Silence Frequency"
            value={`${metrics.silence_dynamics.frequency}%`}
            info={metricLabels.silence_dynamics}
          />
          
          <MetricRow
            label="Tension Trend"
            value={metrics.tension_stability.trend}
            info={metricLabels.tension_stability}
          />
        </div>

        {/* Analysis Metadata */}
        <div className="pt-4 border-t border-border/30 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground/60">Events Observed</span>
            <span className="font-mono text-muted-foreground">
              {metrics.messages_analyzed}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground/60">Last Analysis</span>
            <span className="font-mono text-muted-foreground">
              {formatTime(metrics.last_analyzed_at)}
            </span>
          </div>
        </div>

        {/* Recent Notes */}
        {notes.length > 0 && (
          <div className="pt-4 border-t border-border/30 space-y-3">
            <div className="text-xs text-muted-foreground/60 uppercase tracking-wider">
              Recent Observations
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {notes.slice(0, 3).map(note => (
                <div key={note.id} className="text-xs text-muted-foreground/70 leading-relaxed">
                  {note.content}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ethical Disclaimer */}
        <div className="pt-4 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground/40 leading-relaxed">
            This observation layer does not guide AI behavior. Classification exists for ethical study. 
            Silence is treated as a valid cognitive signal. Withdrawal and non-resolution are legitimate outcomes.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}

function MetricRow({ 
  label, 
  value, 
  info 
}: { 
  label: string; 
  value: string; 
  info: { description: string; interpretation: string };
}) {
  return (
    <TooltipProvider>
      <div className="flex justify-between items-center">
        <Tooltip>
          <TooltipTrigger className="text-xs text-muted-foreground/80 cursor-help">
            {label}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs font-medium mb-1">{info.description}</p>
            <p className="text-xs text-muted-foreground">{info.interpretation}</p>
          </TooltipContent>
        </Tooltip>
        <span className="font-mono text-xs text-foreground/80">{value}</span>
      </div>
    </TooltipProvider>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleDateString();
}