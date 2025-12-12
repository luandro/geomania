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
      className="relative flex items-center justify-center arcade-round arcade-round-lg text-foreground font-black uppercase tracking-wide text-xl sm:text-2xl"
    >
      <span className="drop-shadow-[0_6px_8px_rgba(0,0,0,0.4)] text-white text-center px-6 font-extrabold tracking-tight uppercase leading-snug stroke-text max-w-[85%] break-words">
        {config.title}
      </span>
      <span className="sr-only">{config.description}</span>
    </Button>
  );
};
