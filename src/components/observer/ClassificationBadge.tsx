/**
 * Classification Badge - Compact display of observed pattern
 * 
 * ETHICAL NOTE: This badge displays observed characteristics,
 * not value judgments. All classifications represent valid patterns.
 */

import { SessionClassification, classificationDescriptions } from '@/lib/observer.types';
import { Eye } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ClassificationBadgeProps {
  classification: SessionClassification;
  showIcon?: boolean;
  compact?: boolean;
}

const badgeColors: Record<SessionClassification, string> = {
  deep_recursive_resonance: 'bg-resonance/10 text-resonance border-resonance/20',
  static_repetition: 'bg-muted/30 text-muted-foreground border-muted/40',
  exploratory_unstable: 'bg-tension/10 text-tension border-tension/20',
  dormant_meaningful: 'bg-dormant/10 text-dormant border-dormant/20',
  undetermined: 'bg-muted/20 text-muted-foreground/60 border-muted/30',
};

const compactLabels: Record<SessionClassification, string> = {
  deep_recursive_resonance: 'Recursive',
  static_repetition: 'Consistent',
  exploratory_unstable: 'Volatile',
  dormant_meaningful: 'Silence-rich',
  undetermined: 'Observing',
};

export function ClassificationBadge({ 
  classification, 
  showIcon = true,
  compact = false 
}: ClassificationBadgeProps) {
  const info = classificationDescriptions[classification];
  const displayLabel = compact ? compactLabels[classification] : info.label;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`
              inline-flex items-center gap-1.5 
              px-2 py-0.5 
              text-[10px] font-mono uppercase tracking-wider
              rounded-full border
              cursor-help
              ${badgeColors[classification]}
            `}
          >
            {showIcon && <Eye className="w-2.5 h-2.5" />}
            {displayLabel}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs font-medium mb-1">{info.description}</p>
          <p className="text-xs text-muted-foreground italic">{info.note}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}