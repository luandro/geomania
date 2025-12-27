import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DISMISS_KEY = 'pwaInstallDismissedAt';
const INSTALLED_KEY = 'pwaInstalled';
const SHOWN_SESSION_KEY = 'pwaInstallShownSession';
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const isIOSDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const iOSUA = /iPad|iPhone|iPod/.test(ua);
  const iPadOS = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSUA || iPadOS;
};

const isStandaloneMode = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || (navigator as { standalone?: boolean }).standalone === true;
};

const getStoredNumber = (key: string) => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const getSessionShown = () => {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SHOWN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(event: BeforeInstallPromptEvent | null) => void>();

const notifyPromptListeners = () => {
  promptListeners.forEach((listener) => listener(deferredPrompt));
};

const setDeferredPrompt = (event: BeforeInstallPromptEvent | null) => {
  deferredPrompt = event;
  notifyPromptListeners();
};

const ensureGlobalListeners = () => {
  if (typeof window === 'undefined') return;
  const globalScope = window as Window & { __pwaInstallListenersBound?: boolean };
  if (globalScope.__pwaInstallListenersBound) return;
  globalScope.__pwaInstallListenersBound = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    setDeferredPrompt(event);
  });

  window.addEventListener('appinstalled', () => {
    setDeferredPrompt(null);
    try {
      window.localStorage.setItem(INSTALLED_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  });
};

ensureGlobalListeners();

export const usePwaInstall = () => {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(deferredPrompt);
  const [promptReady, setPromptReady] = useState(() => Boolean(deferredPrompt));
  const [installed, setInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(INSTALLED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [dismissedAt, setDismissedAt] = useState<number | null>(() => getStoredNumber(DISMISS_KEY));
  const [standalone, setStandalone] = useState(() => isStandaloneMode());
  const [sessionShown, setSessionShown] = useState(() => getSessionShown());

  useEffect(() => {
    const handlePromptUpdate = (event: BeforeInstallPromptEvent | null) => {
      deferredPromptRef.current = event;
      setPromptReady(Boolean(event));
    };
    promptListeners.add(handlePromptUpdate);
    return () => {
      promptListeners.delete(handlePromptUpdate);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleInstalled = () => {
      setInstalled(true);
    };
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateStandalone = () => setStandalone(isStandaloneMode());
    updateStandalone();

    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)');

    const handleChange = () => updateStandalone();

    if (standaloneQuery.addEventListener) {
      standaloneQuery.addEventListener('change', handleChange);
      fullscreenQuery.addEventListener('change', handleChange);
    } else {
      standaloneQuery.addListener(handleChange);
      fullscreenQuery.addListener(handleChange);
    }

    return () => {
      if (standaloneQuery.removeEventListener) {
        standaloneQuery.removeEventListener('change', handleChange);
        fullscreenQuery.removeEventListener('change', handleChange);
      } else {
        standaloneQuery.removeListener(handleChange);
        fullscreenQuery.removeListener(handleChange);
      }
    };
  }, []);

  // React 19: Calculate cooldown status when dismissedAt changes
  const cooldownActive = useMemo(() => {
    if (!dismissedAt) return false;
    // eslint-disable-next-line react-hooks/purity -- Date.now() needed for cooldown logic, memoized and recalculated only when dismissedAt changes
    return Date.now() - dismissedAt < COOLDOWN_MS;
  }, [dismissedAt]);

  const canPrompt = !installed
    && !standalone
    && !cooldownActive
    && promptReady;

  const showIOSInstructions = isIOSDevice()
    && !installed
    && !standalone
    && !cooldownActive
    && !promptReady;

  const promptInstall = useCallback(async () => {
    const deferredPrompt = deferredPromptRef.current;
    if (!deferredPrompt) return;

    setPromptReady(false);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);

      if (choice.outcome === 'accepted') {
        setInstalled(true);
        try {
          window.localStorage.setItem(INSTALLED_KEY, 'true');
        } catch {
          // Ignore storage errors
        }
        return;
      }

      const now = Date.now();
      setDismissedAt(now);
      try {
        window.localStorage.setItem(DISMISS_KEY, String(now));
      } catch {
        // Ignore storage errors
      }
    } catch {
      deferredPromptRef.current = deferredPrompt;
      setPromptReady(true);
      setDeferredPrompt(deferredPrompt);
    }
  }, []);

  const dismiss = useCallback(() => {
    const now = Date.now();
    setDismissedAt(now);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(now));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const markShown = useCallback(() => {
    setSessionShown(true);
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(SHOWN_SESSION_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    canPrompt,
    showIOSInstructions,
    promptInstall,
    dismiss,
    markShown,
    sessionShown,
    installed,
    standalone,
  };
};
