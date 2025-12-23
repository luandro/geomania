/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '@/i18n/LanguageContext';
import Scoreboards from './Scoreboards';
import { fetchLeaderboard } from '@/lib/leaderboard';

vi.mock('@/lib/leaderboard', () => ({
  fetchLeaderboard: vi.fn().mockResolvedValue([]),
  probeLeaderboardEndpoint: vi.fn().mockResolvedValue(true),
  readCachedLeaderboard: vi.fn(() => null),
  writeCachedLeaderboard: vi.fn(),
  sortLeaderboardEntries: (entries: unknown[]) => entries,
}));

beforeEach(() => {
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true, language: 'en-US' },
    configurable: true,
  });
});

describe('Scoreboards', () => {
  it('renders scoreboards header and empty state', async () => {
    render(
      <LanguageProvider>
        <MemoryRouter initialEntries={['/scoreboards?mode=flag_guess']}>
          <Routes>
            <Route path="/scoreboards" element={<Scoreboards />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>,
    );

    expect(screen.getByText('Scoreboards')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Home' })).toBeInTheDocument();
    expect(await screen.findByText('No scores yet. Be the first!')).toBeInTheDocument();
  });

  it('shows retry button on error state', async () => {
    vi.mocked(fetchLeaderboard).mockRejectedValueOnce(new Error('fail'));

    render(
      <LanguageProvider>
        <MemoryRouter initialEntries={['/scoreboards?mode=flag_guess']}>
          <Routes>
            <Route path="/scoreboards" element={<Scoreboards />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>,
    );

    expect(await screen.findByText('Could not load scoreboards.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
