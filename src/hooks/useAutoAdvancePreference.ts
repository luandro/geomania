import { useEffect, useState } from 'react';

const STORAGE_KEY = 'geomania:autoAdvance';
const DEFAULT_AUTO_ADVANCE = true;

const readStoredPreference = (): boolean => {
  if (typeof window === 'undefined') return DEFAULT_AUTO_ADVANCE;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) return DEFAULT_AUTO_ADVANCE;
    return stored === 'true';
  } catch {
    return DEFAULT_AUTO_ADVANCE;
  }
};

export const useAutoAdvancePreference = () => {
  const [autoAdvance, setAutoAdvance] = useState<boolean>(readStoredPreference);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(autoAdvance));
    } catch {
      // Ignore storage errors (e.g. private mode)
    }
  }, [autoAdvance]);

  return { autoAdvance, setAutoAdvance };
};
