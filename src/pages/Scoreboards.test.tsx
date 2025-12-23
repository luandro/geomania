/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '@/i18n/LanguageContext';
import Scoreboards from './Scoreboards';

vi.mock('@/lib/leaderboard', () => ({
  fetchLeaderboard: vi.fn().mockResolvedValue([]),
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
});
