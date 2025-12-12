import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Difficulty } from "@/types/quiz";
import { useLanguage } from "@/i18n/LanguageContext";

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

const DIFFICULTIES: { id: Difficulty; icon: string; ring: string }[] = [
  { id: 'easy', icon: '💜', ring: 'arcade-round-dark' },
  { id: 'medium', icon: '🖤', ring: '' },
  { id: 'hard', icon: '💗', ring: '' },
  { id: 'super_hard', icon: '💀', ring: '' },
  { id: 'god_mode', icon: '😈', ring: 'arcade-round-dark' },
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
        <Card
          key={diff.id}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 border-0 bg-transparent`}
          onClick={() => !disabled && onSelect(diff.id)}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`arcade-round arcade-round-md ${diff.ring}`}>
              <div className="flex flex-col items-center justify-center h-full w-full text-white font-extrabold uppercase tracking-wide text-lg relative">
                <span className="text-3xl mb-1 drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]">{diff.icon}</span>
                <span className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] px-3 leading-tight stroke-text">
                  {t.difficulty[diff.id]}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-[180px] text-center px-2">
              {t.difficultyDescriptions[diff.id]}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};
