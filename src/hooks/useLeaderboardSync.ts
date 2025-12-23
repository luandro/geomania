import { useEffect } from 'react';
import { flushPendingScores } from '@/lib/leaderboard';

export const useLeaderboardSync = () => {
  useEffect(() => {
    const handleOnline = () => {
      flushPendingScores().catch(() => undefined);
    };

    if (navigator.onLine) {
      handleOnline();
    }

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);
};
