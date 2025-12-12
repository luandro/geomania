import { useState } from 'react';
import { useCountries } from '@/hooks/useCountries';
import { useQuiz } from '@/hooks/useQuiz';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { GameModeCard } from '@/components/quiz/GameModeCard';
import { DifficultySelector } from '@/components/quiz/DifficultySelector';
import { FlagQuestion } from '@/components/quiz/FlagQuestion';
import { CapitalQuestion } from '@/components/quiz/CapitalQuestion';
import { PopulationQuestion } from '@/components/quiz/PopulationQuestion';
import { ResultsScreen } from '@/components/quiz/ResultsScreen';
import { LoadingSpinner } from '@/components/quiz/LoadingSpinner';
import { GameModeConfig, GameMode, Difficulty } from '@/types/quiz';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const Index = () => {
  const { t } = useLanguage();
  const { data: countries, isLoading: countriesLoading, error } = useCountries();
  const { session, currentQuestion, isLoading, startQuiz, answerQuestion, nextQuestion, resetQuiz } = useQuiz(countries || []);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  // Game mode configs - titles/descriptions come from translations
  const gameModes: GameModeConfig[] = [
    {
      mode: 'flag',
      title: t.gameModes.flag,
      description: t.gameModeDescriptions.flag,
      icon: 'flag',
      color: 'primary',
    },
    {
      mode: 'capital',
      title: t.gameModes.capital,
      description: t.gameModeDescriptions.capital,
      icon: 'capital',
      color: 'secondary',
    },
    {
      mode: 'population',
      title: t.gameModes.population,
      description: t.gameModeDescriptions.population,
      icon: 'population',
      color: 'accent',
    },
  ];

  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode);
  };

  const handleSelectDifficulty = async (difficulty: Difficulty) => {
    if (selectedMode) {
      await startQuiz(selectedMode, difficulty);
    }
  };

  const handleBackToModes = () => {
    setSelectedMode(null);
  };

  const handleReset = () => {
    resetQuiz();
    setSelectedMode(null);
  };

  const handlePlayAgain = async () => {
    if (session) {
      await startQuiz(session.gameMode, session.difficulty);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-destructive mb-2">{t.oops}</h2>
          <p className="text-muted-foreground text-sm sm:text-base">{t.failedToLoad}</p>
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
          onBack={handleReset}
          showBackButton
        />
        <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
          <ResultsScreen
            session={session}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleReset}
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
          onBack={handleReset}
          showBackButton
        />
        <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
          {session.gameMode === 'flag' && (
            <FlagQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={answerQuestion}
              onNext={nextQuestion}
              difficulty={session.difficulty}
              allCountries={countries || []}
            />
          )}
          {session.gameMode === 'capital' && (
            <CapitalQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={answerQuestion}
              onNext={nextQuestion}
              difficulty={session.difficulty}
              allCountries={countries || []}
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

  // Show Difficulty Selection
  if (selectedMode && !session) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <QuizHeader onBack={handleBackToModes} showBackButton />
        <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-4xl mx-auto">
            <DifficultySelector onSelect={handleSelectDifficulty} disabled={isLoading} />
          </div>
        </main>
      </div>
    );
  }

  // Show landing page (Game Mode Selection)
  return (
    <div className="min-h-screen bg-background flex flex-col kuromi-grid">
      <QuizHeader />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-5xl mx-auto text-center bg-card/80 border border-primary/20 rounded-3xl shadow-2xl backdrop-blur kuromi-spotlight p-4 sm:p-8">
          {countriesLoading || isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="fade-in">
              <div className="mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-40 h-40 sm:w-56 sm:h-56 rounded-full quiz-gradient mb-4 sm:mb-6 bounce-in ring-4 ring-primary/40 shadow-2xl overflow-hidden">
                  <img src="/kuromi_map.svg" alt="Kuromi map" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 text-foreground drop-shadow">
                  {t.welcome} <span className="text-primary">{t.welcomeHighlight}</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto px-2">
                  {t.landingDescription.replace('{count}', String(countries?.length || 0))}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 slide-up px-2" style={{ animationDelay: '0.2s' }}>
                {gameModes.map((config) => (
                  <GameModeCard
                    key={config.mode}
                    config={config}
                    onSelect={() => handleSelectMode(config.mode)}
                    disabled={!countries || countries.length < 10}
                  />
                ))}
              </div>

              <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground kuromi-pill max-w-md mx-auto px-4 py-2 rounded-full">
                <Globe className="w-4 h-4 text-primary" />
                <span>{t.quizInfo}</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
