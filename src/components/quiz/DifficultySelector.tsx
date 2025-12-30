import { Difficulty } from "@/types/quiz";
import { useLanguage } from "@/i18n/use-language";

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

const DIFFICULTIES: { id: Difficulty; iconSrc: string; ring: string; pulseDelay: string }[] = [
  { id: 'easy', iconSrc: '/levels/easy.png', ring: 'arcade-round-dark', pulseDelay: '0s' },
  { id: 'medium', iconSrc: '/levels/merdium.png', ring: '', pulseDelay: '1s' },
  { id: 'hard', iconSrc: '/levels/hard.png', ring: '', pulseDelay: '2s' },
  { id: 'super_hard', iconSrc: '/levels/superhard.png', ring: '', pulseDelay: '3s' },
  { id: 'god_mode', iconSrc: '/levels/god.png', ring: 'arcade-round-dark', pulseDelay: '4s' },
];

export const DifficultySelector = ({ onSelect, disabled }: DifficultySelectorProps) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 animate-in fade-in zoom-in duration-300">
      <div className="col-span-full text-center mb-4">
        <h2 className="text-2xl font-bold mb-2 text-foreground">{t.selectDifficulty}</h2>
        <p className="text-muted-foreground">{t.difficultyDescription}</p>
      </div>
      
      {DIFFICULTIES.map((diff) => (
        <button
          key={diff.id}
          type="button"
          className="cursor-pointer transition-all duration-200 hover:scale-105 rounded-lg border bg-card text-card-foreground shadow-xs flex flex-col items-center gap-3 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          onClick={() => onSelect(diff.id)}
          disabled={disabled}
        >
          <div className={`arcade-round arcade-round-md ${diff.ring}`}>
            <div className="flex flex-col items-center justify-center h-full w-full text-white font-extrabold uppercase tracking-wide text-lg relative">
              <img
                src={diff.iconSrc}
                alt={`${t.difficulty[diff.id]} level`}
                className="h-24 w-24 mb-1 drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] level-icon-pulse"
                style={{ animationDelay: diff.pulseDelay }}
              />
              <span className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] px-3 leading-tight stroke-text">
                {t.difficulty[diff.id]}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-[180px] text-center px-2">
            {t.difficultyDescriptions[diff.id]}
          </p>
        </button>
      ))}
    </div>
  );
};
