import type { Difficulty } from '@/types/quiz';
import type { LeaderboardEntry, LeaderboardMode } from '@/types/leaderboard';

const LEADERBOARD_ENDPOINT =
  import.meta.env.VITE_LEADERBOARD_ENDPOINT ??
  import.meta.env.VITE_LEADERBOARD_API ??
  '/api/scores';
const PENDING_SCORES_KEY = 'pendingScores';
const CACHED_LEADERBOARD_KEY = 'cachedLeaderboard';
const SKIP_PROMPT_PREFIX = 'skipInitialsPrompt';

const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return fallback;
  }
};

const buildLeaderboardUrl = (mode: LeaderboardMode, limit = 10) => {
  try {
    const url = LEADERBOARD_ENDPOINT.startsWith('http')
      ? new URL(LEADERBOARD_ENDPOINT)
      : new URL(LEADERBOARD_ENDPOINT, window.location.origin);
    url.searchParams.set('mode', mode);
    url.searchParams.set('limit', String(limit));
    return url.toString();
  } catch (error) {
    const separator = LEADERBOARD_ENDPOINT.includes('?') ? '&' : '?';
    return `${LEADERBOARD_ENDPOINT}${separator}mode=${mode}&limit=${limit}`;
  }
};

export const sortLeaderboardEntries = (entries: LeaderboardEntry[]) =>
  [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.total !== a.total) return b.total - a.total;
    const timeA = Date.parse(a.ts);
    const timeB = Date.parse(b.ts);
    if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
    if (Number.isNaN(timeA)) return 1;
    if (Number.isNaN(timeB)) return -1;
    return timeB - timeA;
  });

export const submitScoreToBackend = async (entry: LeaderboardEntry) => {
  const response = await fetch(LEADERBOARD_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    throw new Error('Failed to submit score');
  }
};

export const probeLeaderboardEndpoint = async (timeoutMs = 2500) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    await fetch(LEADERBOARD_ENDPOINT, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    return true;
  } catch (error) {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const fetchLeaderboard = async (mode: LeaderboardMode, limit = 10): Promise<LeaderboardEntry[]> => {
  const response = await fetch(buildLeaderboardUrl(mode, limit), {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  const data = await response.json();
  if (Array.isArray(data)) return data as LeaderboardEntry[];
  if (Array.isArray(data?.entries)) return data.entries as LeaderboardEntry[];
  if (Array.isArray(data?.top10)) return data.top10 as LeaderboardEntry[];
  return [];
};

const readPendingScores = (): LeaderboardEntry[] => {
  try {
    return safeParse<LeaderboardEntry[]>(localStorage.getItem(PENDING_SCORES_KEY), []);
  } catch (error) {
    return [];
  }
};

export const queuePendingScore = (entry: LeaderboardEntry) => {
  try {
    const pending = readPendingScores();
    pending.push(entry);
    localStorage.setItem(PENDING_SCORES_KEY, JSON.stringify(pending));
  } catch (error) {
    // Ignore storage errors (private browsing, quota, etc.)
  }
};

export const flushPendingScores = async () => {
  if (!navigator.onLine) return { flushed: 0, remaining: readPendingScores().length };

  const pending = readPendingScores();
  if (pending.length === 0) return { flushed: 0, remaining: 0 };

  const remaining: LeaderboardEntry[] = [];
  let flushed = 0;

  for (const entry of pending) {
    try {
      await submitScoreToBackend(entry);
      flushed += 1;
    } catch (error) {
      remaining.push(entry);
    }
  }

  try {
    if (remaining.length === 0) {
      localStorage.removeItem(PENDING_SCORES_KEY);
    } else {
      localStorage.setItem(PENDING_SCORES_KEY, JSON.stringify(remaining));
    }
  } catch (error) {
    // Ignore storage errors
  }

  return { flushed, remaining: remaining.length };
};

type CachedLeaderboard = Record<LeaderboardMode, { data: LeaderboardEntry[]; fetchedAt: string }>;

export const readCachedLeaderboard = (mode: LeaderboardMode) => {
  try {
    const cached = safeParse<CachedLeaderboard>(localStorage.getItem(CACHED_LEADERBOARD_KEY), {});
    return cached[mode] ?? null;
  } catch (error) {
    return null;
  }
};

export const writeCachedLeaderboard = (mode: LeaderboardMode, data: LeaderboardEntry[]) => {
  try {
    const cached = safeParse<CachedLeaderboard>(localStorage.getItem(CACHED_LEADERBOARD_KEY), {});
    cached[mode] = { data, fetchedAt: new Date().toISOString() };
    localStorage.setItem(CACHED_LEADERBOARD_KEY, JSON.stringify(cached));
  } catch (error) {
    // Ignore storage errors
  }
};

const buildSkipPromptKey = (mode: LeaderboardMode, difficulty: Difficulty) =>
  `${SKIP_PROMPT_PREFIX}:${mode}:${difficulty}`;

export const shouldSkipInitialsPrompt = (mode: LeaderboardMode, difficulty: Difficulty) => {
  try {
    const value = localStorage.getItem(buildSkipPromptKey(mode, difficulty));
    if (!value) return false;
    const expiresAt = Number(value);
    if (Number.isNaN(expiresAt)) return true;
    if (Date.now() > expiresAt) {
      localStorage.removeItem(buildSkipPromptKey(mode, difficulty));
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const setSkipInitialsPrompt = (
  mode: LeaderboardMode,
  difficulty: Difficulty,
  days = 7,
) => {
  try {
    const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
    localStorage.setItem(buildSkipPromptKey(mode, difficulty), String(expiresAt));
  } catch (error) {
    // Ignore storage errors
  }
};
