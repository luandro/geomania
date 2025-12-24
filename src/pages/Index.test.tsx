/** @vitest-environment jsdom */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Index from './Index';
import { LanguageProvider } from '@/i18n/LanguageContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/useCountries', () => ({
  useCountries: () => ({
    data: new Array(10).fill({ id: 'c', name: 'Country', capital: 'Cap', flag_url: '', population: 1, region: 'R', difficulty: 'easy' }),
    isLoading: false,
    error: null,
    newDataAvailable: false,
    isOfflineReady: false,
  }),
}));

vi.mock('@/hooks/useQuiz', () => ({
  useQuiz: () => ({
    session: null,
    currentQuestion: null,
    isLoading: false,
    startQuiz: vi.fn(),
    answerQuestion: vi.fn(),
    nextQuestion: vi.fn(),
    resetQuiz: vi.fn(),
  }),
}));

vi.mock('@/hooks/useMapAssets', () => ({
  useMapAssets: () => ({
    status: 'ready',
    progress: { completed: 0, total: 0 },
    ensureReady: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

beforeEach(() => {
  sessionStorage.clear();
  mockNavigate.mockClear();
  vi.useFakeTimers();
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true, language: 'en-US' },
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Index homepage auto-switch', () => {
  it('auto-navigates to scoreboards after 25 seconds of inactivity', async () => {
    render(
      <LanguageProvider>
        <Index />
      </LanguageProvider>,
    );

    await act(async () => {
      vi.advanceTimersByTime(25001);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/scoreboards');
    expect(sessionStorage.getItem('homeAutoSwitched')).toBe('true');
  });

  it('cancels auto-switch on interaction', async () => {
    render(
      <LanguageProvider>
        <Index />
      </LanguageProvider>,
    );

    window.dispatchEvent(new Event('pointerdown'));

    await act(async () => {
      vi.advanceTimersByTime(25001);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('homeAutoSwitched')).toBe('true');
  });
});
