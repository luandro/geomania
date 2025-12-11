import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Difficulty } from "@/types/quiz";
import { useLanguage } from "@/i18n/LanguageContext";

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

const DIFFICULTIES: { id: Difficulty; icon: string; color: string }[] = [
  { id: 'easy', icon: '🟢', color: 'bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30' },
  { id: 'medium', icon: '🟡', color: 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30' },
  { id: 'hard', icon: '🟠', color: 'bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30' },
  { id: 'super_hard', icon: '🔴', color: 'bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30' },
  { id: 'god_mode', icon: '😈', color: 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30' },
];

export const DifficultySelector = ({ onSelect, disabled }: DifficultySelectorProps) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 animate-in fade-in zoom-in duration-300">
      <div className="col-span-full text-center mb-4">
        <h2 className="text-2xl font-bold mb-2">{t.selectDifficulty}</h2>
        <p className="text-muted-foreground">{t.difficultyDescription}</p>
      </div>
      
      {DIFFICULTIES.map((diff) => (
        <Card
          key={diff.id}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 border-2 hover:border-primary/50 ${diff.color}`}
          onClick={() => !disabled && onSelect(diff.id)}
        >
          <div className="p-6 text-center space-y-4">
            <div className="text-4xl">{diff.icon}</div>
            <div>
              <h3 className="font-bold text-xl mb-2">{t.difficulty[diff.id]}</h3>
              <p className="text-sm text-muted-foreground">
                {t.difficultyDescriptions[diff.id]}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
