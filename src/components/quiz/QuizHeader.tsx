import { GameMode } from '@/types/quiz';
import { Globe, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/i18n/use-language';
import { getAssetUrl } from '@/lib/assets';

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
    <header className="w-full py-3 px-3 sm:py-4 sm:px-6 quiz-gradient kuromi-spotlight">
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
            <div className="relative flex items-center gap-2">
              <img src={getAssetUrl('/kuromi.svg')} alt="Kuromi" className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow" />
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-primary-foreground truncate">
                  {t.appName}
                </h1>
                <p className="hidden sm:block text-xs text-primary-foreground/80">Cute goth geography chaos</p>
              </div>
            </div>
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
                <span className="text-xs sm:text-sm font-semibold bg-primary-foreground/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
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
