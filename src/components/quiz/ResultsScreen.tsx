import { QuizSession, GameMode } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target, RotateCcw, Home } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatPopulation } from '@/i18n/translations';

interface ResultsScreenProps {
  session: QuizSession;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const ResultsScreen = ({ session, onPlayAgain, onGoHome }: ResultsScreenProps) => {
  const { t, language } = useLanguage();
  const percentage = Math.round((session.score / session.totalQuestions) * 100);

  const gameModeLabels: Record<GameMode, string> = {
    flag: t.gameModes.flag,
    capital: t.gameModes.capital,
    population: t.gameModes.population,
  };
  
  const getPerformanceMessage = () => {
    if (percentage === 100) return { emoji: '🏆', message: t.perfectScore, color: 'text-accent' };
    if (percentage >= 80) return { emoji: '🌟', message: t.excellent, color: 'text-success' };
    if (percentage >= 60) return { emoji: '👍', message: t.goodJob, color: 'text-primary' };
    if (percentage >= 40) return { emoji: '📚', message: t.keepLearning, color: 'text-muted-foreground' };
    return { emoji: '💪', message: t.keepPracticing, color: 'text-muted-foreground' };
  };

  const performance = getPerformanceMessage();

  // Render question review based on game mode
  const renderQuestionReview = () => {
    if (session.gameMode === 'population') {
      // For population mode: show both compared countries
      return session.questions.map((q, index) => {
        const [countryA, countryB] = q.comparedCountries || [q.options[0], q.options[1]];
        const isCountryACorrect = countryA.id === q.correctAnswer.id;
        
        return (
          <div
            key={q.id}
            className={`p-3 sm:p-4 rounded-lg ${
              q.isCorrect ? 'bg-success/10' : 'bg-destructive/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                q.isCorrect ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
              }`}>
                {index + 1}
              </span>
              <span className="text-lg">{q.isCorrect ? '✓' : '✗'}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm">
              {/* Country A */}
              <div className={`flex items-center gap-2 p-2 rounded ${
                isCountryACorrect ? 'bg-success/20' : ''
              } ${q.userAnswer?.id === countryA.id && !q.isCorrect ? 'ring-2 ring-destructive' : ''}`}>
                <img
                  src={countryA.flag_url}
                  alt={countryA.name}
                  className="w-8 h-5 object-contain rounded"
                />
                <div className="text-left">
                  <span className="font-medium text-foreground block">{countryA.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPopulation(countryA.population, language)}
                  </span>
                </div>
              </div>
              
              <span className="text-muted-foreground font-bold text-xs">{t.vs}</span>
              
              {/* Country B */}
              <div className={`flex items-center gap-2 p-2 rounded ${
                !isCountryACorrect ? 'bg-success/20' : ''
              } ${q.userAnswer?.id === countryB.id && !q.isCorrect ? 'ring-2 ring-destructive' : ''}`}>
                <img
                  src={countryB.flag_url}
                  alt={countryB.name}
                  className="w-8 h-5 object-contain rounded"
                />
                <div className="text-left">
                  <span className="font-medium text-foreground block">{countryB.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatPopulation(countryB.population, language)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      });
    }

    // For flag and capital modes: show correct answer
    return session.questions.map((q, index) => (
      <div
        key={q.id}
        className={`flex items-center justify-between p-3 rounded-lg ${
          q.isCorrect ? 'bg-success/10' : 'bg-destructive/10'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            q.isCorrect ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
          }`}>
            {index + 1}
          </span>
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={q.correctAnswer.flag_url}
              alt={q.correctAnswer.name}
              className="w-8 h-5 object-contain rounded shrink-0"
            />
            <span className="text-sm font-medium text-foreground truncate">
              {session.gameMode === 'capital' 
                ? `${q.correctAnswer.name}: ${q.correctAnswer.capital}`
                : q.correctAnswer.name
              }
            </span>
          </div>
        </div>
        <span className="text-lg shrink-0 ml-2">{q.isCorrect ? '✓' : '✗'}</span>
      </div>
    ));
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center fade-in px-2">
      <div className="bg-card rounded-2xl p-4 sm:p-8 quiz-card-shadow">
        <div className="bounce-in">
          <span className="text-5xl sm:text-6xl mb-4 block">{performance.emoji}</span>
          <h2 className={`text-2xl sm:text-3xl font-extrabold mb-2 ${performance.color}`}>
            {performance.message}
          </h2>
          <p className="text-muted-foreground mb-4 sm:mb-6">
            {gameModeLabels[session.gameMode]} {t.completed}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8 slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-muted rounded-xl p-3 sm:p-4">
            <Trophy className="w-6 sm:w-8 h-6 sm:h-8 text-accent mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-foreground">{session.score}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.score}</p>
          </div>
          <div className="bg-muted rounded-xl p-3 sm:p-4">
            <Target className="w-6 sm:w-8 h-6 sm:h-8 text-primary mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-foreground">{session.totalQuestions}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.questions}</p>
          </div>
          <div className="bg-muted rounded-xl p-3 sm:p-4">
            <Star className="w-6 sm:w-8 h-6 sm:h-8 text-success mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-foreground">{percentage}%</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.accuracy}</p>
          </div>
        </div>

        <div className="mb-6 sm:mb-8 slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">{t.questionReview}</h3>
          <div className="space-y-2 max-h-56 sm:max-h-64 overflow-y-auto">
            {renderQuestionReview()}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center slide-up" style={{ animationDelay: '0.4s' }}>
          <Button variant="hero" size="lg" onClick={onPlayAgain} className="w-full sm:w-auto">
            <RotateCcw className="w-5 h-5 mr-2" />
            {t.playAgain}
          </Button>
          <Button variant="outline" size="lg" onClick={onGoHome} className="w-full sm:w-auto">
            <Home className="w-5 h-5 mr-2" />
            {t.chooseMode}
          </Button>
        </div>
      </div>
    </div>
  );
};
