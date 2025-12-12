import { Button } from '@/components/ui/button';
import { GameModeConfig } from '@/types/quiz';

interface GameModeCardProps {
  config: GameModeConfig;
  onSelect: () => void;
  disabled?: boolean;
}

export const GameModeCard = ({ config, onSelect, disabled }: GameModeCardProps) => {
  return (
    <Button
      variant="gameMode"
      size="answer"
      onClick={onSelect}
      disabled={disabled}
      aria-label={config.title}
      className="relative arcade-round arcade-round-lg text-foreground font-black uppercase tracking-wide text-xl sm:text-2xl !p-0 !flex !items-center !justify-center"
    >
      <span className="drop-shadow-[0_6px_8px_rgba(0,0,0,0.4)] text-white text-center font-extrabold tracking-tight uppercase leading-snug stroke-text absolute inset-0 !flex !items-center !justify-center">
        {config.title}
      </span>
      <span className="sr-only">{config.description}</span>
    </Button>
  );
};
