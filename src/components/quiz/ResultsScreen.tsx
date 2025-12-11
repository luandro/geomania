import { QuizSession, GameMode } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target, RotateCcw, Home } from 'lucide-react';

interface ResultsScreenProps {
  session: QuizSession;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

const gameModeLabels: Record<GameMode, string> = {
  flag: 'Flag Guess',
  capital: 'Capital Guess',
  population: 'Population Compare',
};

export const ResultsScreen = ({ session, onPlayAgain, onGoHome }: ResultsScreenProps) => {
  const percentage = Math.round((session.score / session.totalQuestions) * 100);
  
  const getPerformanceMessage = () => {
    if (percentage === 100) return { emoji: '🏆', message: 'Perfect Score!', color: 'text-accent' };
    if (percentage >= 80) return { emoji: '🌟', message: 'Excellent!', color: 'text-success' };
    if (percentage >= 60) return { emoji: '👍', message: 'Good Job!', color: 'text-primary' };
    if (percentage >= 40) return { emoji: '📚', message: 'Keep Learning!', color: 'text-muted-foreground' };
    return { emoji: '💪', message: 'Keep Practicing!', color: 'text-muted-foreground' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="w-full max-w-2xl mx-auto text-center fade-in">
      <div className="bg-card rounded-2xl p-8 quiz-card-shadow">
        <div className="bounce-in">
          <span className="text-6xl mb-4 block">{performance.emoji}</span>
          <h2 className={`text-3xl font-extrabold mb-2 ${performance.color}`}>
            {performance.message}
          </h2>
          <p className="text-muted-foreground mb-6">
            {gameModeLabels[session.gameMode]} completed!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-muted rounded-xl p-4">
            <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{session.score}</p>
            <p className="text-sm text-muted-foreground">Score</p>
          </div>
          <div className="bg-muted rounded-xl p-4">
            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{session.totalQuestions}</p>
            <p className="text-sm text-muted-foreground">Questions</p>
          </div>
          <div className="bg-muted rounded-xl p-4">
            <Star className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{percentage}%</p>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>
        </div>

        <div className="mb-8 slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-lg font-semibold mb-4 text-foreground">Question Review</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {session.questions.map((q, index) => (
              <div
                key={q.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  q.isCorrect ? 'bg-success/10' : 'bg-destructive/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    q.isCorrect ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <img
                      src={q.correctAnswer.flag_url}
                      alt={q.correctAnswer.name}
                      className="w-8 h-5 object-contain rounded"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {q.correctAnswer.name}
                    </span>
                  </div>
                </div>
                <span className="text-lg">{q.isCorrect ? '✓' : '✗'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up" style={{ animationDelay: '0.4s' }}>
          <Button variant="hero" size="lg" onClick={onPlayAgain}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
          <Button variant="outline" size="lg" onClick={onGoHome}>
            <Home className="w-5 h-5 mr-2" />
            Choose Mode
          </Button>
        </div>
      </div>
    </div>
  );
};
