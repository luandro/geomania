import { useCountries } from '@/hooks/useCountries';
import { useQuiz } from '@/hooks/useQuiz';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { GameModeCard } from '@/components/quiz/GameModeCard';
import { FlagQuestion } from '@/components/quiz/FlagQuestion';
import { CapitalQuestion } from '@/components/quiz/CapitalQuestion';
import { PopulationQuestion } from '@/components/quiz/PopulationQuestion';
import { ResultsScreen } from '@/components/quiz/ResultsScreen';
import { LoadingSpinner } from '@/components/quiz/LoadingSpinner';
import { GameModeConfig, GameMode } from '@/types/quiz';
import { Globe } from 'lucide-react';

const gameModes: GameModeConfig[] = [
  {
    mode: 'flag',
    title: 'Flag Guess',
    description: 'Identify countries by their flags',
    icon: 'flag',
    color: 'primary',
  },
  {
    mode: 'capital',
    title: 'Capital Guess',
    description: 'Match countries with their capital cities',
    icon: 'capital',
    color: 'secondary',
  },
  {
    mode: 'population',
    title: 'Population Compare',
    description: 'Guess which country has more people',
    icon: 'population',
    color: 'accent',
  },
];

const Index = () => {
  const { data: countries, isLoading: countriesLoading, error } = useCountries();
  const { session, currentQuestion, isLoading, startQuiz, answerQuestion, nextQuestion, resetQuiz } = useQuiz(countries || []);

  const handleStartQuiz = async (mode: GameMode) => {
    await startQuiz(mode);
  };

  const handlePlayAgain = async () => {
    if (session) {
      await startQuiz(session.gameMode);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Oops!</h2>
          <p className="text-muted-foreground">Failed to load countries. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  // Show results screen
  if (session?.completed) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <QuizHeader
          gameMode={session.gameMode}
          currentQuestion={session.currentQuestionIndex}
          totalQuestions={session.totalQuestions}
          score={session.score}
          onBack={resetQuiz}
          showBackButton
        />
        <main className="flex-1 flex items-center justify-center p-6">
          <ResultsScreen
            session={session}
            onPlayAgain={handlePlayAgain}
            onGoHome={resetQuiz}
          />
        </main>
      </div>
    );
  }

  // Show quiz question
  if (session && currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <QuizHeader
          gameMode={session.gameMode}
          currentQuestion={session.currentQuestionIndex}
          totalQuestions={session.totalQuestions}
          score={session.score}
          onBack={resetQuiz}
          showBackButton
        />
        <main className="flex-1 flex items-center justify-center p-6">
          {session.gameMode === 'flag' && (
            <FlagQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={answerQuestion}
              onNext={nextQuestion}
            />
          )}
          {session.gameMode === 'capital' && (
            <CapitalQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={answerQuestion}
              onNext={nextQuestion}
            />
          )}
          {session.gameMode === 'population' && (
            <PopulationQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={answerQuestion}
              onNext={nextQuestion}
            />
          )}
        </main>
      </div>
    );
  }

  // Show landing page
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <QuizHeader />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center">
          {countriesLoading || isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="fade-in">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full quiz-gradient mb-6 bounce-in">
                  <Globe className="w-10 h-10 text-primary-foreground" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
                  Welcome to <span className="text-primary">GeoQuiz</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Test your geography knowledge! Identify flags, capitals, and compare populations
                  from {countries?.length || 0} countries around the world.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 slide-up" style={{ animationDelay: '0.2s' }}>
                {gameModes.map((config, index) => (
                  <GameModeCard
                    key={config.mode}
                    config={config}
                    onSelect={() => handleStartQuiz(config.mode)}
                    disabled={!countries || countries.length < 10}
                  />
                ))}
              </div>

              <p className="mt-8 text-sm text-muted-foreground">
                Each quiz has 10 questions. Good luck! 🌍
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
