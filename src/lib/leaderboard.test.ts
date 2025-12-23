/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchLeaderboard,
  queuePendingScore,
  setSkipInitialsPrompt,
  shouldSkipInitialsPrompt,
  sortLeaderboardEntries,
  flushPendingScores,
} from './leaderboard';
import type { LeaderboardEntry } from '@/types/leaderboard';

const makeEntry = (overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry => ({
  mode: 'flag_guess',
  difficulty: 'easy',
  initials: 'AAA',
  score: 8,
  total: 8,
  accuracy: 1,
  ts: '2025-12-23T00:00:00.000Z',
  ...overrides,
});

describe('leaderboard utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: true },
      configurable: true,
    });
  });

  it('sorts entries by score, total, then ts desc', () => {
    const entries = [
      makeEntry({ score: 8, total: 8, ts: '2025-12-23T10:00:00.000Z', initials: 'AAA' }),
      makeEntry({ score: 8, total: 10, ts: '2025-12-23T09:00:00.000Z', initials: 'BBB' }),
      makeEntry({ score: 9, total: 8, ts: '2025-12-23T08:00:00.000Z', initials: 'CCC' }),
      makeEntry({ score: 8, total: 10, ts: '2025-12-23T12:00:00.000Z', initials: 'DDD' }),
      makeEntry({ score: 8, total: 10, ts: 'not-a-date', initials: 'EEE' }),
    ];

    const sorted = sortLeaderboardEntries(entries);

    expect(sorted.map((entry) => entry.initials)).toEqual(['CCC', 'DDD', 'BBB', 'EEE', 'AAA']);
  });

  it('stores skip prompt timestamps and expires them after 7 days', () => {
    vi.useFakeTimers();
    const now = new Date('2025-12-23T00:00:00.000Z');
    vi.setSystemTime(now);

    setSkipInitialsPrompt('flag_guess', 'easy', 7);
    expect(shouldSkipInitialsPrompt('flag_guess', 'easy')).toBe(true);

    vi.setSystemTime(new Date('2026-01-02T00:00:01.000Z'));
    expect(shouldSkipInitialsPrompt('flag_guess', 'easy')).toBe(false);
  });

  it('fetches leaderboard entries from top10 payloads', async () => {
    const entry = makeEntry({ initials: 'TOP' });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ top10: [entry] }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchLeaderboard('flag_guess', 10);
    expect(result).toEqual([entry]);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('queues pending scores and flushes them when online', async () => {
    const entries = [makeEntry({ initials: 'ONE' }), makeEntry({ initials: 'TWO' })];
    entries.forEach(queuePendingScore);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false }) });
    vi.stubGlobal('fetch', fetchMock);

    const result = await flushPendingScores();

    expect(result.flushed).toBe(1);
    expect(result.remaining).toBe(1);
    const stored = JSON.parse(localStorage.getItem('pendingScores') ?? '[]');
    expect(stored).toHaveLength(1);
  });
});
