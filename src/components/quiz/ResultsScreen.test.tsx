/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { ResultsScreen } from './ResultsScreen';
import { LanguageProvider } from '@/i18n/LanguageContext';
import type { QuizSession } from '@/types/quiz';
import { queuePendingScore, setSkipInitialsPrompt, submitScoreToBackend } from '@/lib/leaderboard';

vi.mock('@/hooks/usePwaInstall', () => ({
  usePwaInstall: () => ({
    canPrompt: false,
    showIOSInstructions: false,
    promptInstall: vi.fn(),
    dismiss: vi.fn(),
    markShown: vi.fn(),
    sessionShown: true,
    installed: false,
    standalone: false,
  }),
}));

vi.mock('@/lib/leaderboard', () => ({
  queuePendingScore: vi.fn(),
  setSkipInitialsPrompt: vi.fn(),
  shouldSkipInitialsPrompt: vi.fn(() => false),
  submitScoreToBackend: vi.fn(),
}));

const baseSession = (overrides: Partial<QuizSession> = {}): QuizSession => ({
  id: 'session-1',
  gameMode: 'flag',
  difficulty: 'easy',
  score: 1,
  totalQuestions: 1,
  currentQuestionIndex: 0,
  completed: true,
  questions: [
    {
      id: 'q1',
      correctAnswer: {
        id: 'c1',
        name: 'Alpha',
        capital: 'Alpha City',
        flag_url: '/flags/a.svg',
        population: 1,
        region: 'Test',
        difficulty: 'easy',
      },
      options: [],
      isCorrect: true,
    },
  ],
  ...overrides,
});

const renderResults = (session: QuizSession) =>
  render(
    <LanguageProvider>
      <ResultsScreen
        session={session}
        onPlayAgain={vi.fn()}
        onGoHome={vi.fn()}
        onViewLeaderboard={vi.fn()}
      />
    </LanguageProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true, language: 'en-US' },
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
});

describe('ResultsScreen', () => {
  it('does not show initials prompt when score is not perfect', () => {
    renderResults(baseSession({ score: 0, totalQuestions: 1 }));
    expect(screen.queryByText('Perfect Score! Enter your initials')).not.toBeInTheDocument();
  });

  it('filters initials input to uppercase A-Z and enables save after 3 letters', async () => {
    const user = userEvent.setup();
    renderResults(baseSession());

    const input = screen.getByLabelText('Perfect Score! Enter your initials');
    const saveButton = screen.getByRole('button', { name: 'Save Score' });

    expect(saveButton).toBeDisabled();

    await user.type(input, 'ab1c');
    expect((input as HTMLInputElement).value).toBe('ABC');
    expect(saveButton).toBeEnabled();
  });

  it('submits score when online and shows saved state', async () => {
    const user = userEvent.setup();
    renderResults(baseSession());

    const input = screen.getByLabelText('Perfect Score! Enter your initials');
    await user.type(input, 'abc');

    const saveButton = screen.getByRole('button', { name: 'Save Score' });
    await user.click(saveButton);

    expect(submitScoreToBackend).toHaveBeenCalled();
    expect(submitScoreToBackend).toHaveBeenCalledWith(
      expect.objectContaining({ initials: 'ABC', score: 1, total: 1, mode: 'flag_guess' }),
    );
    expect(await screen.findByText('Saved!')).toBeInTheDocument();
  });

  it('queues score when offline and shows local saved message', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false, language: 'en-US' },
      configurable: true,
    });

    const user = userEvent.setup();
    renderResults(baseSession());

    const input = screen.getByLabelText('Perfect Score! Enter your initials');
    await user.type(input, 'abc');

    const saveButton = screen.getByRole('button', { name: 'Save Score' });
    await user.click(saveButton);

    expect(queuePendingScore).toHaveBeenCalled();
    expect(screen.getByText('Saved locally — will upload when online')).toBeInTheDocument();
  });

  it('skips prompt and stores skip preference', async () => {
    const user = userEvent.setup();
    renderResults(baseSession());

    const skipButton = screen.getByRole('button', { name: 'Skip' });
    await user.click(skipButton);

    expect(setSkipInitialsPrompt).toHaveBeenCalled();
    expect(screen.queryByText('Perfect Score! Enter your initials')).not.toBeInTheDocument();
  });
});
