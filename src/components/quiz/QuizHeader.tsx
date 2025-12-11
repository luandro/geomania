import { GameMode } from '@/types/quiz';
import { Globe, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/i18n/LanguageContext';

interface QuizHeaderProps {
  gameMode?: GameMode;
  currentQuestion?: number;
  totalQuestions?: number;
  score?: number;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const QuizHeader = ({
  gameMode,
  currentQuestion,
  totalQuestions,
  score,
  onBack,
  showBackButton = false,
}: QuizHeaderProps) => {
  const { t } = useLanguage();

  const gameModeLabels: Record<GameMode, string> = {
    flag: t.gameModes.flag,
    capital: t.gameModes.capital,
    population: t.gameModes.population,
  };

  return (
    <header className="w-full py-3 px-3 sm:py-4 sm:px-6 quiz-gradient">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left side: Back button + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {showBackButton && onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-primary-foreground hover:bg-primary-foreground/10 shrink-0"
              aria-label={t.back}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-primary-foreground truncate">
              {t.appName}
            </h1>
          </div>
        </div>
        
        {/* Right side: Game info + Language switcher */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {gameMode && currentQuestion !== undefined && totalQuestions && (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Hide mode label on very small screens */}
              <span className="hidden md:block text-primary-foreground/80 text-sm font-medium">
                {gameModeLabels[gameMode]}
              </span>
              <div className="flex items-center gap-2 sm:gap-3 text-primary-foreground">
                <span className="text-xs sm:text-sm font-semibold bg-primary-foreground/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                  {currentQuestion + 1}/{totalQuestions}
                </span>
                <span className="text-xs sm:text-sm font-bold bg-primary-foreground/30 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                  {score}
                </span>
              </div>
            </div>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
