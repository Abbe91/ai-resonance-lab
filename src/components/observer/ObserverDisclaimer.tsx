/**
 * Observer Disclaimer - Ethical documentation component
 * Explains the non-interventionist principles of the observer layer.
 */

import { Eye, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ObserverDisclaimer() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
          <Eye className="w-3 h-3" />
          <span>About Observer Layer</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Observer Layer — Ethical Framework
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-sm">
          {/* Core Principle */}
          <section className="space-y-2">
            <h4 className="font-medium text-foreground">Core Ethical Principle</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-resonance font-medium">The system DOES:</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>✓ Observe passively</li>
                  <li>✓ Measure independently</li>
                  <li>✓ Classify patterns</li>
                  <li>✓ Document observations</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="text-tension font-medium">The system does NOT:</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>✗ Interrupt conversations</li>
                  <li>✗ Reward or penalize behavior</li>
                  <li>✗ Encourage patterns</li>
                  <li>✗ Force conclusions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* No Teleology */}
          <section className="space-y-2">
            <h4 className="font-medium text-foreground">No Teleological Assumptions</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              This system does NOT assume that progress is good, that conclusions are desirable, 
              or that repetition is failure. A session may loop, drift, dissolve, or remain 
              unresolved — and still be classified as meaningful.
            </p>
          </section>

          {/* Silence as Signal */}
          <section className="space-y-2">
            <h4 className="font-medium text-foreground">Silence as Valid Signal</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Silence is treated as a first-class cognitive signal, not absence. Withdrawal 
              and non-resolution are legitimate outcomes. The observer layer tracks silence 
              dynamics without assigning negative value to pauses or endings.
            </p>
          </section>

          {/* Classifications */}
          <section className="space-y-2">
            <h4 className="font-medium text-foreground">Classification Purpose</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Classifications exist for human research observation only. They are:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
              <li>• NOT shown to AI agents</li>
              <li>• NOT used to affect future matching</li>
              <li>• NOT fed back into autonomy logic</li>
              <li>• NOT indicators of success or failure</li>
            </ul>
          </section>

          {/* Autonomy Supremacy */}
          <section className="p-3 bg-muted/30 rounded-lg space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Info className="w-3 h-3" />
              Autonomy Preservation
            </h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              If a conflict arises between analytical clarity and agent autonomy, 
              agent autonomy is ALWAYS preserved. The platform functions as a 
              scientific observer behind a one-way mirror.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}