import { useCallback, useEffect, useRef, useState } from 'react';
import { areMapAssetsCached, MAP_ASSET_URLS, prefetchMapAssets } from '@/lib/mapData';

export type MapAssetsStatus =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'ready'
  | 'offline-missing'
  | 'error';

type Progress = {
  completed: number;
  total: number;
};

export const useMapAssets = () => {
  const [status, setStatus] = useState<MapAssetsStatus>('checking');
  const [progress, setProgress] = useState<Progress>({
    completed: 0,
    total: MAP_ASSET_URLS.length,
  });
  const prefetchPromise = useRef<Promise<boolean> | null>(null);

  const checkCached = useCallback(async () => {
    setStatus('checking');
    const cached = await areMapAssetsCached();
    if (cached) {
      setStatus('ready');
      setProgress({ completed: MAP_ASSET_URLS.length, total: MAP_ASSET_URLS.length });
    } else {
      setStatus('idle');
    }
    return cached;
  }, []);

  const ensureReady = useCallback(async () => {
    if (status === 'ready') return true;
    if (prefetchPromise.current) return prefetchPromise.current;

    const promise = (async () => {
      const cached = await areMapAssetsCached();
      if (cached) {
        setStatus('ready');
        setProgress({ completed: MAP_ASSET_URLS.length, total: MAP_ASSET_URLS.length });
        return true;
      }
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setStatus('offline-missing');
        return false;
      }

      setStatus('downloading');
      setProgress({ completed: 0, total: MAP_ASSET_URLS.length });
      try {
        await prefetchMapAssets((next) => setProgress(next));
        setStatus('ready');
        setProgress({ completed: MAP_ASSET_URLS.length, total: MAP_ASSET_URLS.length });
        return true;
      } catch (err) {
        setStatus('error');
        return false;
      }
    })();

    prefetchPromise.current = promise;
    try {
      return await promise;
    } finally {
      prefetchPromise.current = null;
    }
  }, [status]);

  useEffect(() => {
    checkCached().catch(() => setStatus('idle'));
  }, [checkCached]);

  return {
    status,
    progress,
    isReady: status === 'ready',
    ensureReady,
    refresh: checkCached,
  };
};
