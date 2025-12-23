import type { Difficulty, GameMode } from '@/types/quiz';

export type LeaderboardMode = 'flag_guess' | 'capital_guess' | 'population_compare' | 'map_guess';

export interface LeaderboardEntry {
  mode: LeaderboardMode;
  difficulty: Difficulty;
  initials: string;
  score: number;
  total: number;
  accuracy: number;
  ts: string;
}

export const leaderboardModes: LeaderboardMode[] = [
  'flag_guess',
  'capital_guess',
  'population_compare',
  'map_guess',
];

export const getLeaderboardModeForGameMode = (mode: GameMode): LeaderboardMode => {
  switch (mode) {
    case 'flag':
      return 'flag_guess';
    case 'capital':
      return 'capital_guess';
    case 'population':
      return 'population_compare';
    case 'map_country':
    case 'map_capital':
      return 'map_guess';
    default:
      return 'flag_guess';
  }
};

export const isLeaderboardMode = (mode: string | null): mode is LeaderboardMode =>
  !!mode && leaderboardModes.includes(mode as LeaderboardMode);
