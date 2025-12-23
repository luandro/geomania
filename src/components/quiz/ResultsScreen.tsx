import { useEffect, useState } from 'react';
import { Trophy, Star, Target, RotateCcw, Home, Medal } from 'lucide-react';
import { QuizSession, GameMode } from '@/types/quiz';
import { getLeaderboardModeForGameMode, type LeaderboardEntry } from '@/types/leaderboard';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/use-language';
import { formatPopulation } from '@/i18n/translations';
import { getLocalizedCapital, getLocalizedCountryName } from '@/lib/localization';
import { getAssetUrl } from '@/lib/assets';
import { queuePendingScore, setSkipInitialsPrompt, shouldSkipInitialsPrompt, submitScoreToBackend } from '@/lib/leaderboard';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { PwaInstallBanner } from '@/components/quiz/PwaInstallBanner';

interface ResultsScreenProps {
  session: QuizSession;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onViewLeaderboard: () => void;
}

export const ResultsScreen = ({ session, onPlayAgain, onGoHome, onViewLeaderboard }: ResultsScreenProps) => {
  const { t, language } = useLanguage();
  const percentage = Math.round((session.score / session.totalQuestions) * 100);
  const performanceImage = percentage >= 60 ? '/kuromi_celebrate.png' : '/kuromi_sad.png';
  const performanceImageAlt = percentage >= 60 ? 'Kuromi celebrate' : 'Kuromi sad';
  const isPerfect = session.score === session.totalQuestions;
  const leaderboardMode = getLeaderboardModeForGameMode(session.gameMode);
  const {
    canPrompt,
    showIOSInstructions,
    promptInstall,
    dismiss,
    markShown,
    sessionShown,
    installed,
    standalone,
  } = usePwaInstall();
  const [installVisible, setInstallVisible] = useState(false);
  const [initials, setInitials] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'saved-offline'>('idle');
  const [promptDismissed, setPromptDismissed] = useState(false);

  useEffect(() => {
    if (!installVisible && !sessionShown && (canPrompt || showIOSInstructions)) {
      setInstallVisible(true);
      markShown();
    }
  }, [installVisible, sessionShown, canPrompt, showIOSInstructions, markShown]);

  useEffect(() => {
    if (installVisible && (installed || standalone)) {
      setInstallVisible(false);
    }
  }, [installVisible, installed, standalone]);

  useEffect(() => {
    setInitials('');
    setSaveState('idle');
    setPromptDismissed(false);
  }, [session.id]);

  const handleDismissInstall = () => {
    dismiss();
    setInstallVisible(false);
  };

  const handleInstall = async () => {
    await promptInstall();
    setInstallVisible(false);
  };

  const gameModeLabels: Record<GameMode, string> = {
    flag: t.gameModes.flag,
    capital: t.gameModes.capital,
    population: t.gameModes.population,
    map_country: t.gameModes.mapCountry,
    map_capital: t.gameModes.mapCapital,
  };
  
  const getPerformanceMessage = () => {
    if (percentage === 100) return { message: t.perfectScore, color: 'text-accent' };
    if (percentage >= 80) return { message: t.excellent, color: 'text-success' };
    if (percentage >= 60) return { message: t.goodJob, color: 'text-primary' };
    if (percentage >= 40) return { message: t.keepLearning, color: 'text-muted-foreground' };
    return { message: t.keepPracticing, color: 'text-muted-foreground' };
  };

  const performance = getPerformanceMessage();

  const shouldSkipPrompt = shouldSkipInitialsPrompt(leaderboardMode, session.difficulty);
  const showInitialsPrompt = isPerfect && !shouldSkipPrompt && !promptDismissed;
  const isSaveComplete = saveState === 'saved' || saveState === 'saved-offline';
  const canSave = initials.length === 3 && !isSaveComplete && saveState !== 'saving';

  const handleInitialsChange = (value: string) => {
    const normalized = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    setInitials(normalized);
  };

  const handleSaveScore = async () => {
    if (!canSave) return;

    const entry: LeaderboardEntry = {
      mode: leaderboardMode,
      difficulty: session.difficulty,
      initials,
      score: session.score,
      total: session.totalQuestions,
      accuracy: session.totalQuestions > 0 ? session.score / session.totalQuestions : 0,
      ts: new Date().toISOString(),
    };

    setSaveState('saving');

    if (!navigator.onLine) {
      queuePendingScore(entry);
      setSaveState('saved-offline');
      return;
    }

    try {
      await submitScoreToBackend(entry);
      setSaveState('saved');
    } catch (error) {
      queuePendingScore(entry);
      setSaveState('saved-offline');
    }
  };

  const handleSkipPrompt = () => {
    setSkipInitialsPrompt(leaderboardMode, session.difficulty, 7);
    setPromptDismissed(true);
  };

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
              <div className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded ${
                isCountryACorrect ? 'bg-success/20' : ''
              } ${q.userAnswer?.id === countryA.id && !q.isCorrect ? 'ring-2 ring-destructive' : ''}`}>
                <img
                  src={getAssetUrl(countryA.flag_url)}
                  alt={getLocalizedCountryName(countryA, language)}
                  className="w-10 sm:w-12 h-6 sm:h-8 object-contain rounded shadow-sm"
                />
                <div className="text-left">
                  <span className="font-medium text-foreground block">
                    {getLocalizedCountryName(countryA, language)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatPopulation(countryA.population, language)}
                  </span>
                </div>
              </div>

              <span className="text-muted-foreground font-bold text-xs">{t.vs}</span>

              {/* Country B */}
              <div className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded ${
                !isCountryACorrect ? 'bg-success/20' : ''
              } ${q.userAnswer?.id === countryB.id && !q.isCorrect ? 'ring-2 ring-destructive' : ''}`}>
                <img
                  src={getAssetUrl(countryB.flag_url)}
                  alt={getLocalizedCountryName(countryB, language)}
                  className="w-10 sm:w-12 h-6 sm:h-8 object-contain rounded shadow-sm"
                />
                <div className="text-left">
                  <span className="font-medium text-foreground block">
                    {getLocalizedCountryName(countryB, language)}
                  </span>
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

    // For flag, capital, and map modes: show correct answer
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
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src={getAssetUrl(q.correctAnswer.flag_url)}
              alt={getLocalizedCountryName(q.correctAnswer, language)}
              className="w-10 sm:w-12 h-6 sm:h-8 object-contain rounded shrink-0 shadow-sm"
            />
            <span className="text-sm font-medium text-foreground truncate">
              {session.gameMode === 'capital' || session.gameMode === 'map_capital'
                ? `${getLocalizedCountryName(q.correctAnswer, language)}: ${getLocalizedCapital(q.correctAnswer, language)}`
                : getLocalizedCountryName(q.correctAnswer, language)
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
      <div className="bg-card rounded-2xl p-4 sm:p-8 quiz-card-shadow kuromi-spotlight">
        <div className="bounce-in">
          <img
            src={getAssetUrl(performanceImage)}
            alt={performanceImageAlt}
            className="mx-auto mb-4 h-40 w-40 sm:h-56 sm:w-56 object-contain drop-shadow-lg"
            loading="eager"
          />
          {isPerfect && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-widest mb-3">
              <Medal className="w-4 h-4" />
              {t.perfectScoreBadge}
            </div>
          )}
          <h2 className={`text-2xl sm:text-3xl font-extrabold mb-2 ${performance.color}`}>
            {performance.message}
          </h2>
          <p className="text-muted-foreground mb-4 sm:mb-6">
            {gameModeLabels[session.gameMode]} {t.completed}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8 slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="bg-muted rounded-xl p-3 sm:p-4 border border-primary/20 shadow-inner">
            <Trophy className="w-6 sm:w-8 h-6 sm:h-8 text-accent mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-foreground">{session.score}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.score}</p>
          </div>
          <div className="bg-muted rounded-xl p-3 sm:p-4 border border-primary/20 shadow-inner">
            <Target className="w-6 sm:w-8 h-6 sm:h-8 text-primary mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-foreground">{session.totalQuestions}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.questions}</p>
          </div>
          <div className="bg-muted rounded-xl p-3 sm:p-4 border border-primary/20 shadow-inner">
            <Star className="w-6 sm:w-8 h-6 sm:h-8 text-success mx-auto mb-1 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-foreground">{percentage}%</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.accuracy}</p>
          </div>
        </div>

        {showInitialsPrompt && (
          <div className="mb-6 sm:mb-8 bg-muted rounded-2xl p-4 sm:p-6 border border-primary/30 text-center">
            <p className="text-sm sm:text-base font-semibold text-foreground mb-4">
              {t.perfectScorePrompt}
            </p>
            <div className="flex flex-col items-center gap-4">
              {!isSaveComplete ? (
                <>
                  <input
                    type="text"
                    inputMode="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={3}
                    pattern="[A-Za-z]{3}"
                    value={initials}
                    onChange={(event) => handleInitialsChange(event.target.value)}
                    className="w-32 sm:w-40 text-center font-mono text-2xl sm:text-3xl tracking-[0.5em] bg-background text-foreground rounded-lg border-2 border-primary/40 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={t.perfectScorePrompt}
                    disabled={saveState === 'saving'}
                  />
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleSaveScore}
                      disabled={!canSave}
                      className="w-full sm:w-auto"
                    >
                      {saveState === 'saving' ? t.savingScore : t.saveScore}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSkipPrompt}
                      className="w-full sm:w-auto"
                      disabled={saveState === 'saving'}
                    >
                      {t.skipScore}
                    </Button>
                  </div>
                  {saveState === 'saving' && (
                    <p className="text-xs text-muted-foreground font-semibold">{t.savingScore}</p>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">{initials}</p>
                  <p
                    className={`text-xs font-semibold ${
                      saveState === 'saved' ? 'text-success' : 'text-muted-foreground'
                    }`}
                  >
                    {saveState === 'saved' ? t.savedScore : t.savedScoreOffline}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {installVisible && (
          <PwaInstallBanner
            canPrompt={canPrompt}
            showIOSInstructions={showIOSInstructions}
            onInstall={handleInstall}
            onDismiss={handleDismissInstall}
          />
        )}

        <div className="mb-6 sm:mb-8 slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">{t.questionReview}</h3>
          <div className="space-y-2">
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
          <Button variant="outline" size="lg" onClick={onViewLeaderboard} className="w-full sm:w-auto">
            <Trophy className="w-5 h-5 mr-2" />
            {t.viewLeaderboard}
          </Button>
        </div>
      </div>
    </div>
  );
};
