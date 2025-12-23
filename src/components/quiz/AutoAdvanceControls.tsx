import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AutoAdvanceControlsProps {
  answered: boolean;
  isLastQuestion: boolean;
  autoAdvance: boolean;
  onToggleAutoAdvance: (value: boolean) => void;
  onNext: () => void;
  autoAdvancingLabel: string;
  autoAdvanceLabel: string;
  nextLabel: string;
  resultsLabel: string;
}

export const AutoAdvanceControls = ({
  answered,
  isLastQuestion,
  autoAdvance,
  onToggleAutoAdvance,
  onNext,
  autoAdvancingLabel,
  autoAdvanceLabel,
  nextLabel,
  resultsLabel,
}: AutoAdvanceControlsProps) => {
  const switchId = useId();

  return (
    <div className="mt-4 sm:mt-6 flex flex-col items-center gap-3">
      {answered && autoAdvance && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-full sm:w-64 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[shrink_1s_linear_forwards]" style={{ width: '100%' }} />
          </div>
          <p className="text-xs text-muted-foreground">{autoAdvancingLabel}</p>
        </div>
      )}

      {answered && (
        <Button variant="hero" size="lg" onClick={onNext} className="w-full sm:w-auto">
          {isLastQuestion ? resultsLabel : nextLabel}
        </Button>
      )}

      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <Switch
          id={switchId}
          checked={autoAdvance}
          onCheckedChange={onToggleAutoAdvance}
        />
        <Label htmlFor={switchId}>{autoAdvanceLabel}</Label>
      </div>
    </div>
  );
};
