import { GameMode } from '@/types/quiz';
import { Globe, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizHeaderProps {
  gameMode?: GameMode;
  currentQuestion?: number;
  totalQuestions?: number;
  score?: number;
  onBack?: () => void;
  showBackButton?: boolean;
}

const gameModeLabels: Record<GameMode, string> = {
  flag: 'Flag Guess',
  capital: 'Capital Guess',
  population: 'Population Compare',
};

export const QuizHeader = ({
  gameMode,
  currentQuestion,
  totalQuestions,
  score,
  onBack,
  showBackButton = false,
}: QuizHeaderProps) => {
  return (
    <header className="w-full py-4 px-6 quiz-gradient">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-primary-foreground" />
            <h1 className="text-xl font-bold text-primary-foreground">GeoQuiz</h1>
          </div>
        </div>
        
        {gameMode && currentQuestion !== undefined && totalQuestions && (
          <div className="flex items-center gap-6">
            <span className="text-primary-foreground/80 text-sm font-medium">
              {gameModeLabels[gameMode]}
            </span>
            <div className="flex items-center gap-4 text-primary-foreground">
              <span className="text-sm font-semibold bg-primary-foreground/20 px-3 py-1 rounded-full">
                {currentQuestion + 1} / {totalQuestions}
              </span>
              <span className="text-sm font-bold bg-primary-foreground/30 px-3 py-1 rounded-full">
                Score: {score}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
