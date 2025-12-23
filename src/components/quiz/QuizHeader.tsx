import { GameMode } from '@/types/quiz';
import { ArrowLeft, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/i18n/use-language';
import { getAssetUrl } from '@/lib/assets';
import { HelpDialog } from './HelpDialog';

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
    <header className="w-full py-2 px-2 sm:py-3 sm:px-4 md:py-4 md:px-6 quiz-gradient kuromi-spotlight">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left side: Back button + Logo */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0 flex-1">
          {showBackButton && onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-primary-foreground hover:bg-primary-foreground/10 shrink-0 h-8 w-8 sm:h-10 sm:w-10"
              aria-label={t.back}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
            <img 
              src={getAssetUrl('/kuromi.svg')} 
              alt="Kuromi" 
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 drop-shadow shrink-0" 
            />
            <div className="min-w-0">
              {/* Hide h1 on extra small screens (< 380px), show abbreviated on small, full on larger */}
              <h1 className="hidden xs:block sm:text-lg md:text-xl font-extrabold text-primary-foreground truncate text-base">
                <span className="hidden sm:inline">{t.appName}</span>
                <span className="sm:hidden">Geomania</span>
              </h1>
              <p className="hidden md:block text-xs text-primary-foreground/80 truncate">Cute goth geography chaos</p>
            </div>
          </div>
        </div>

        {/* Right side: Game info + Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
          {gameMode && currentQuestion !== undefined && totalQuestions && (
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              {/* Hide mode label on screens smaller than lg */}
              <span className="hidden lg:block text-primary-foreground/80 text-sm font-medium">
                {gameModeLabels[gameMode]}
              </span>
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 text-primary-foreground">
                <span className="text-xs sm:text-sm font-semibold bg-primary-foreground/20 px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 rounded-full whitespace-nowrap flex items-center gap-0.5 sm:gap-1">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {currentQuestion + 1}/{totalQuestions}
                </span>
                <span className="text-xs sm:text-sm font-bold bg-primary-foreground/30 px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 rounded-full whitespace-nowrap">
                  {score}
                </span>
              </div>
            </div>
          )}
          <HelpDialog
            trigger={(
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 sm:h-10 sm:w-10"
                aria-label={t.help}
              >
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
          />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
