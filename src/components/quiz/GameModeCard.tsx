import { Button } from '@/components/ui/button';
import { GameModeConfig } from '@/types/quiz';

interface GameModeCardProps {
  config: GameModeConfig;
  onSelect: () => void;
  disabled?: boolean;
  letterOffset?: number;
}

export const GameModeCard = ({ config, onSelect, disabled, letterOffset = 0 }: GameModeCardProps) => {
  const letters = config.title.split('');

  return (
    <Button
      variant="gameMode"
      size="answer"
      onClick={onSelect}
      disabled={disabled}
      aria-label={config.title}
      className="relative arcade-round arcade-round-lg text-foreground font-black uppercase tracking-wide text-xl sm:text-2xl !p-0 !flex !items-center !justify-center"
    >
      <span className="drop-shadow-[0_6px_8px_rgba(0,0,0,0.4)] text-white text-center font-extrabold tracking-tight uppercase leading-snug absolute inset-0 !flex !items-center !justify-center flex-wrap gap-0">
        {letters.map((letter, index) => (
          <span
            key={index}
            className="wave-letter stroke-text inline-block"
            style={{ animationDelay: `${(letterOffset + index) * 0.08}s` }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </span>
      <span className="sr-only">{config.description}</span>
    </Button>
  );
};
