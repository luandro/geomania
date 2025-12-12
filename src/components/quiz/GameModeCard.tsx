import { Button } from '@/components/ui/button';
import { GameModeConfig } from '@/types/quiz';

interface GameModeCardProps {
  config: GameModeConfig;
  onSelect: () => void;
  disabled?: boolean;
  letterOffset?: number;
}

export const GameModeCard = ({ config, onSelect, disabled, letterOffset = 0 }: GameModeCardProps) => {
  const words = config.title.split(' ');

  return (
    <Button
      variant="gameMode"
      size="answer"
      onClick={onSelect}
      disabled={disabled}
      aria-label={config.title}
      className="relative arcade-round arcade-round-lg text-foreground font-black uppercase tracking-wide text-xl sm:text-2xl !p-0 !flex !items-center !justify-center"
    >
      <span className="absolute inset-0 flex items-center justify-center px-4">
        <span className="drop-shadow-[0_6px_8px_rgba(0,0,0,0.4)] text-white text-center font-extrabold tracking-tight uppercase leading-[0.9] flex flex-wrap items-center justify-center gap-x-2" style={{ rowGap: '0px' }}>
          {words.map((word, wordIndex) => {
            const previousLetters = words.slice(0, wordIndex).join('').length + wordIndex;
            return (
              <span key={wordIndex} className="inline-flex whitespace-nowrap">
                {word.split('').map((letter, letterIndex) => (
                  <span
                    key={letterIndex}
                    className="wave-letter stroke-text inline-block"
                    style={{ animationDelay: `${(letterOffset + previousLetters + letterIndex) * 0.08}s` }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            );
          })}
        </span>
      </span>
      <span className="sr-only">{config.description}</span>
    </Button>
  );
};
