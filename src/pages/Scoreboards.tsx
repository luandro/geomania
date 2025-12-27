import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { useLanguage } from '@/i18n/use-language';
import {
  fetchLeaderboard,
  probeLeaderboardEndpoint,
  readCachedLeaderboard,
  sortLeaderboardEntries,
  writeCachedLeaderboard,
} from '@/lib/leaderboard';
import { isLeaderboardMode, type LeaderboardEntry, type LeaderboardMode } from '@/types/leaderboard';

const DIFFICULTY_BADGES: Record<string, string> = {
  easy: 'E',
  medium: 'M',
  hard: 'H',
  super_hard: 'SH',
  god_mode: 'G',
};

const Scoreboards = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const initialMode = isLeaderboardMode(modeParam) ? modeParam : 'flag_guess';

  const [activeMode, setActiveMode] = useState<LeaderboardMode>(initialMode);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'offline' | 'empty' | 'error' | 'stale'>('loading');
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [endpointReachable, setEndpointReachable] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const skipDebounceRef = useRef(false);

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!modeParam || !isLeaderboardMode(modeParam)) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('mode', initialMode);
      setSearchParams(nextParams, { replace: true });
    }
  }, [initialMode, modeParam, searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    const debounceDelay = skipDebounceRef.current ? 0 : 200;
    skipDebounceRef.current = false;

    const load = async () => {
      const cached = readCachedLeaderboard(activeMode);

      if (!navigator.onLine) {
        if (!cancelled) setEndpointReachable(false);
        if (cached?.data?.length) {
          if (cancelled) return;
          setEntries(sortLeaderboardEntries(cached.data).slice(0, 10));
          setFetchedAt(cached.fetchedAt);
          setStatus('offline');
        } else {
          if (cancelled) return;
          setEntries([]);
          setFetchedAt(null);
          setStatus('empty');
        }
        return;
      }

      if (!cancelled) {
        setStatus('loading');
        setEndpointReachable(true);
      }

      try {
        const data = await fetchLeaderboard(activeMode, 10);
        const sorted = sortLeaderboardEntries(data).slice(0, 10);
        if (cancelled) return;
        setEntries(sorted);
        setFetchedAt(new Date().toISOString());
        writeCachedLeaderboard(activeMode, sorted);
        setStatus(sorted.length ? 'loaded' : 'empty');
      } catch (error) {
        if (cached?.data?.length) {
          if (cancelled) return;
          setEntries(sortLeaderboardEntries(cached.data).slice(0, 10));
          setFetchedAt(cached.fetchedAt);
          setStatus('stale');
        } else {
          const reachable = await probeLeaderboardEndpoint();
          if (cancelled) return;
          setEntries([]);
          setFetchedAt(null);
          setEndpointReachable(reachable);
          setStatus(reachable ? 'error' : 'empty');
        }
      }
    };

    const timerId = window.setTimeout(() => {
      load();
    }, debounceDelay);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [activeMode, reloadToken]);

  const modeTabs = useMemo(
    () => [
      { id: 'flag_guess' as const, label: t.gameModes.flag },
      { id: 'capital_guess' as const, label: t.gameModes.capital },
      { id: 'population_compare' as const, label: t.gameModes.population },
      { id: 'map_guess' as const, label: t.gameModes.map },
    ],
    [t],
  );

  // Display function for relative dates
  const formatRelativeDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    // eslint-disable-next-line react-hooks/purity -- Date.now() needed for display, acceptable for user-facing relative time
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return t.today;
    return t.daysAgo.replace('{days}', String(diffDays));
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col kuromi-grid">
      <QuizHeader />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-foreground">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold">{t.scoreboards}</h1>
                <p className="text-sm text-muted-foreground">{t.scoreboardsSubtitle}</p>
              </div>
            </div>
            <Button variant="default" size="default" onClick={() => navigate('/')}>
              {t.backToHome}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {modeTabs.map((mode) => (
              <Button
                key={mode.id}
                variant={activeMode === mode.id ? 'hero' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveMode(mode.id);
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set('mode', mode.id);
                  setSearchParams(nextParams, { replace: true });
                }}
              >
                {mode.label}
              </Button>
            ))}
          </div>

          <div className="bg-foreground text-background rounded-3xl border border-primary/30 shadow-2xl p-4 sm:p-6 font-mono">
            {status === 'loading' && (
              <div className="py-10 text-center text-sm tracking-widest">{t.loadingScoreboards}</div>
            )}
            {status === 'error' && (
              <div className="py-10 text-center text-sm tracking-widest space-y-4">
                <p>{t.scoreboardsError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    skipDebounceRef.current = true;
                    setReloadToken((prev) => prev + 1);
                  }}
                >
                  {t.retry}
                </Button>
              </div>
            )}
            {status === 'empty' && !endpointReachable && (
              <div className="py-10 text-center text-sm tracking-widest">{t.scoreboardsEmptyOffline}</div>
            )}
            {status === 'empty' && endpointReachable && (
              <div className="py-10 text-center text-sm tracking-widest">{t.scoreboardsEmpty}</div>
            )}
            {(status === 'loaded' || status === 'offline' || status === 'stale') && (
              <div className="space-y-4">
                {status === 'offline' && (
                  <div className="text-xs uppercase tracking-[0.3em] text-primary">
                    {t.scoreboardsOfflineNotice}
                  </div>
                )}
                {status === 'stale' && (
                  <div className="text-xs uppercase tracking-[0.3em] text-primary">
                    {t.scoreboardsStaleNotice}
                  </div>
                )}
                <div className="grid grid-cols-[50px_1fr_90px_120px] sm:grid-cols-[60px_1fr_110px_140px_140px] gap-2 text-xs uppercase tracking-[0.3em] text-primary/80 border-b border-primary/20 pb-2">
                  <span>#</span>
                  <span>{t.initials}</span>
                  <span>{t.difficultyShort}</span>
                  <span>{t.score}</span>
                  <span className="hidden sm:block">{t.date}</span>
                </div>
                <div className="space-y-2">
                  {entries.map((entry, index) => (
                    <div
                      key={`${entry.initials}-${entry.ts}-${index}`}
                      className="grid grid-cols-[50px_1fr_90px_120px] sm:grid-cols-[60px_1fr_110px_140px_140px] gap-2 items-center rounded-xl px-3 py-2 bg-background/10 border border-primary/10"
                    >
                      <span className="text-sm">{index + 1}</span>
                      <span className="text-lg tracking-[0.2em]">{entry.initials}</span>
                      <span className="text-sm uppercase">
                        {DIFFICULTY_BADGES[entry.difficulty] ?? entry.difficulty}
                      </span>
                      <span className="text-sm">
                        {entry.score}/{entry.total}
                      </span>
                      <span className="hidden sm:block text-xs uppercase text-primary/80">
                        {formatRelativeDate(entry.ts)}
                      </span>
                    </div>
                  ))}
                </div>
                {fetchedAt && (
                  <div className="text-[10px] uppercase tracking-[0.3em] text-primary/60">
                    {t.scoreboardsUpdated.replace('{time}', formatRelativeDate(fetchedAt))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Scoreboards;
