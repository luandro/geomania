import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountries } from '@/hooks/useCountries';
import { useToast } from '@/hooks/use-toast';
import { useQuiz } from '@/hooks/useQuiz';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { GameModeCard } from '@/components/quiz/GameModeCard';
import { DifficultySelector } from '@/components/quiz/DifficultySelector';
import { FlagQuestion } from '@/components/quiz/FlagQuestion';
import { CapitalQuestion } from '@/components/quiz/CapitalQuestion';
import { PopulationQuestion } from '@/components/quiz/PopulationQuestion';
import { MapQuestion } from '@/components/quiz/MapQuestion';
import { ResultsScreen } from '@/components/quiz/ResultsScreen';
import { LoadingSpinner } from '@/components/quiz/LoadingSpinner';
import { HelpDialog } from '@/components/quiz/HelpDialog';
import { Button } from '@/components/ui/button';
import { GameModeConfig, GameMode, Difficulty } from '@/types/quiz';
import { MapCapitalRecord, MapData } from '@/types/map';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/i18n/use-language';
import { getAssetUrl } from '@/lib/assets';
import { useMapAssets } from '@/hooks/useMapAssets';
import { loadMapCapitals, loadMapData } from '@/lib/mapData';
import { getLeaderboardModeForGameMode } from '@/types/leaderboard';

const Index = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: countries, isLoading: countriesLoading, error, newDataAvailable, isOfflineReady } = useCountries();
  const { session, currentQuestion, isLoading, startQuiz, answerQuestion, nextQuestion, resetQuiz } = useQuiz(countries || []);
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const { status: mapAssetStatus, progress: mapAssetProgress, ensureReady: ensureMapAssetsReady } = useMapAssets();
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [mapCapitals, setMapCapitals] = useState<MapCapitalRecord[] | null>(null);
  const [isMapDataLoading, setIsMapDataLoading] = useState(false);
  
  // Refs to track if notifications have been shown
  const hasShownUpdateToast = useRef(false);
  const hasShownOfflineToast = useRef(false);

  useEffect(() => {
    if (newDataAvailable && !hasShownUpdateToast.current) {
      toast({
        title: t.dataUpdated,
        description: t.dataUpdatedDesc,
      });
      hasShownUpdateToast.current = true;
    }
  }, [newDataAvailable, t, toast]);

  useEffect(() => {
    if (isOfflineReady && !hasShownOfflineToast.current) {
      toast({
        title: t.offlineReady,
        description: t.offlineReadyDesc,
      });
      hasShownOfflineToast.current = true;
    }
  }, [isOfflineReady, t, toast]);

  useEffect(() => {
    if (navigator.onLine) {
      ensureMapAssetsReady().catch(() => undefined);
    }
  }, [ensureMapAssetsReady]);

  const getSessionStorageItem = useCallback((key: string) => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }, []);

  const setSessionStorageItem = useCallback((key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage errors (private browsing, quota, etc.)
    }
  }, []);

  useEffect(() => {
    if (session || selectedMode) return;

    const hasAutoSwitched = getSessionStorageItem('homeAutoSwitched');
    if (hasAutoSwitched) return;

    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
    let timeoutId: number | null = null;

    const clearAutoSwitch = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
      setSessionStorageItem('homeAutoSwitched', 'true');
      events.forEach((event) => window.removeEventListener(event, clearAutoSwitch));
    };

    events.forEach((event) =>
      window.addEventListener(event, clearAutoSwitch, { passive: true, once: true }),
    );

    timeoutId = window.setTimeout(() => {
      setSessionStorageItem('homeAutoSwitched', 'true');
      navigate('/scoreboards');
    }, 25000);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, clearAutoSwitch));
    };
  }, [getSessionStorageItem, navigate, selectedMode, session, setSessionStorageItem]);

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
    {
      mode: 'map_country',
      title: t.gameModes.map,
      description: t.gameModeDescriptions.map,
      icon: 'map',
      color: 'secondary',
    },
  ];

  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode);
    if (mode === 'map_country' || mode === 'map_capital') {
      ensureMapAssetsReady().catch(() => undefined);
    }
  };

  const handleSelectDifficulty = async (difficulty: Difficulty) => {
    if (selectedMode) {
      if (selectedMode === 'map_country' || selectedMode === 'map_capital') {
        const ready = await ensureMapAssetsReady();
        if (!ready) {
          toast({
            title: t.mapOfflineTitle,
            description: t.mapOfflineBody,
            variant: "destructive",
          });
          return;
        }
        if (!mapData || !mapCapitals) {
          setIsMapDataLoading(true);
          try {
            const [loadedMap, loadedCapitals] = await Promise.all([
              loadMapData(),
              loadMapCapitals(),
            ]);
            setMapData(loadedMap);
            setMapCapitals(loadedCapitals);
            await startQuiz(selectedMode, difficulty, {
              eligibleIsoA3: loadedMap.isoSet,
              capitals: loadedCapitals,
            });
          } catch (err) {
            toast({
              title: t.oops,
              description: t.mapLoadFailed,
              variant: "destructive",
            });
          } finally {
            setIsMapDataLoading(false);
          }
          return;
        }
        await startQuiz(selectedMode, difficulty, {
          eligibleIsoA3: mapData.isoSet,
          capitals: mapCapitals,
        });
        return;
      }
      await startQuiz(selectedMode, difficulty);
    }
  };

  const handleBackToModes = () => {
    setSelectedMode(null);
  };

  const isMapMode = selectedMode === 'map_country' || selectedMode === 'map_capital';

  const handleMapVariantChange = useCallback((variant: GameMode) => {
    setSelectedMode(variant);
  }, []);

  const handleReset = () => {
    resetQuiz();
    setSelectedMode(null);
  };

  const handlePlayAgain = async () => {
    if (session) {
      if (session.gameMode === 'map_country' || session.gameMode === 'map_capital') {
        if (mapData && mapCapitals) {
          await startQuiz(session.gameMode, session.difficulty, {
            eligibleIsoA3: mapData.isoSet,
            capitals: mapCapitals,
          });
        } else {
          await startQuiz(session.gameMode, session.difficulty);
        }
        return;
      }
      await startQuiz(session.gameMode, session.difficulty);
    }
  };

  const handleViewScoreboards = useCallback(() => {
    setSessionStorageItem('homeAutoSwitched', 'true');
    navigate('/scoreboards');
  }, [navigate, setSessionStorageItem]);

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
            onViewLeaderboard={() => {
              const mode = getLeaderboardModeForGameMode(session.gameMode);
              navigate(`/scoreboards?mode=${mode}`);
            }}
          />
        </main>
      </div>
    );
  }

  // Show quiz question
  if (session && currentQuestion) {
    const isMapSession = session.gameMode === 'map_country' || session.gameMode === 'map_capital';
    return (
      <div className={`min-h-[100dvh] bg-background flex flex-col ${isMapSession ? 'relative overflow-hidden' : ''}`}>
        <div className={isMapSession ? 'absolute inset-x-0 top-0 z-[500]' : undefined}>
          <QuizHeader
            gameMode={session.gameMode}
            currentQuestion={session.currentQuestionIndex}
            totalQuestions={session.totalQuestions}
            score={session.score}
            onBack={handleReset}
            showBackButton
          />
        </div>
        <main
          className={`flex-1 flex ${
            isMapSession ? 'p-0 min-h-[100dvh] items-stretch justify-stretch' : 'items-center justify-center p-3 sm:p-6'
          }`}
        >
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
          {(session.gameMode === 'map_country' || session.gameMode === 'map_capital') && (
            <MapQuestion
              question={currentQuestion}
              onAnswer={answerQuestion}
              onNext={nextQuestion}
              mapData={mapData}
              allCountries={countries || []}
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
            {isMapMode && mapAssetStatus !== 'ready' ? (
              <div className="bg-card border border-primary/20 rounded-3xl p-6 sm:p-10 text-center kuromi-spotlight">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  {t.mapDownloadingTitle}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-6">
                  {mapAssetStatus === 'offline-missing'
                    ? t.mapOfflineBody
                    : mapAssetStatus === 'error'
                      ? t.mapLoadFailed
                      : t.mapDownloadingBody}
                </p>
                <div className="w-full max-w-md mx-auto">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${Math.round((mapAssetProgress.completed / mapAssetProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t.mapDownloadProgress
                      .replace('{current}', String(mapAssetProgress.completed))
                      .replace('{total}', String(mapAssetProgress.total))}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {isMapMode && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      variant={selectedMode === 'map_country' ? 'hero' : 'outline'}
                      size="sm"
                      onClick={() => handleMapVariantChange('map_country')}
                    >
                      {t.mapModeCountry}
                    </Button>
                    <Button
                      variant={selectedMode === 'map_capital' ? 'hero' : 'outline'}
                      size="sm"
                      onClick={() => handleMapVariantChange('map_capital')}
                    >
                      {t.mapModeCapital}
                    </Button>
                  </div>
                )}
                <DifficultySelector onSelect={handleSelectDifficulty} disabled={isLoading || isMapDataLoading} />
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Show landing page (Game Mode Selection)
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col kuromi-grid">
      <QuizHeader />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-0">
        <div className="w-full max-w-5xl mx-auto text-center bg-card/80 border border-primary/20 rounded-3xl shadow-2xl backdrop-blur kuromi-spotlight p-4 sm:p-8">
          {countriesLoading || isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="fade-in">
              <div className="mb-6 sm:mb-8 flex flex-col items-center">
                <div className="inline-flex items-center justify-center w-40 h-40 sm:w-56 sm:h-56 rounded-full quiz-gradient mb-4 sm:mb-6 bounce-in ring-4 ring-primary/40 shadow-2xl overflow-hidden">
                  <img src={getAssetUrl('/kuromi_map.svg')} alt="Kuromi map" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 text-foreground drop-shadow">
                  {t.welcome} <span className="text-primary">{t.welcomeHighlight}</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto px-2">
                  {t.landingDescription.replace('{count}', String(countries?.length || 0))}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 justify-items-center slide-up px-2" style={{ animationDelay: '0.2s' }}>
                {gameModes.map((config, index) => {
                  const letterOffset = gameModes.slice(0, index).reduce((acc, mode) => acc + mode.title.length, 0);
                  return (
                    <GameModeCard
                      key={config.mode}
                      config={config}
                      onSelect={() => handleSelectMode(config.mode)}
                      disabled={!countries || countries.length < 10}
                      letterOffset={letterOffset}
                    />
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-center">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <HelpDialog
                    trigger={(
                      <Button variant="link" size="sm" className="text-primary">
                        {t.helpTitle}
                      </Button>
                    )}
                  />
                  <Button variant="outline" size="sm" onClick={handleViewScoreboards}>
                    {t.scoreboards}
                  </Button>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground kuromi-pill max-w-md mx-auto px-4 py-2 rounded-full">
                <Globe className="w-4 h-4 text-primary" />
                <span>{t.quizInfo}</span>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="py-4 pb-8 text-center text-muted-foreground text-xs sm:text-sm fade-in" style={{ animationDelay: '0.4s' }}>
        {t.madeWith}
      </footer>
    </div>
  );
};

export default Index;
