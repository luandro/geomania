import { useEffect, useState } from "react";
import type { Country } from "@/types/quiz";
import {
  getLocalDataVersion,
  prefetchFlagsIfNeeded,
  readCachedCountries,
  refreshCountriesIfNeeded,
} from "@/lib/offlineData";

export const useCountries = () => {
  const [data, setData] = useState<Country[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [dataVersion, setDataVersion] = useState<string | null>(() => getLocalDataVersion());
  const [newDataAvailable, setNewDataAvailable] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const cached = await readCachedCountries();
        if (!cancelled && cached?.length) {
          setData(cached);
          setIsLoading(false);
        }

        if (navigator.onLine) {
          const { countries, version, updated } = await refreshCountriesIfNeeded(cached);
          if (!cancelled && countries?.length) {
            setData(countries);
            if (updated) setNewDataAvailable(true);
          }
          if (!cancelled && version) {
            setDataVersion(version);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    const handleOnline = async () => {
      try {
        const cached = await readCachedCountries();
        const { countries, version, updated } = await refreshCountriesIfNeeded(cached);
        if (!cancelled && countries?.length) {
          setData(countries);
          if (updated) setNewDataAvailable(true);
        }
        if (!cancelled && version) {
          setDataVersion(version);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      }
    };

    init();
    window.addEventListener("online", handleOnline);

    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (!data?.length) return;
    prefetchFlagsIfNeeded(data, dataVersion)
      .then((status) => {
        if (status === "BECAME_READY") {
          setIsOfflineReady(true);
        }
      })
      .catch(() => undefined);
  }, [data, dataVersion]);

  return {
    data: data ?? [],
    isLoading,
    error,
    newDataAvailable,
    isOfflineReady,
  };
};