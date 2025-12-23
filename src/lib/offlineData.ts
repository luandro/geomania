import { getAssetUrl } from "@/lib/assets";
import type { Country } from "@/types/quiz";

const COUNTRIES_URL = getAssetUrl("/data/countries.json");
const VERSION_URL = getAssetUrl("/data/data-version.json");

const DATA_CACHE = "geomania-data-v1";
const FLAGS_CACHE = "geomania-flags";

const VERSION_KEY = "geomania-data-version";
const FLAGS_PREFETCH_KEY = "geomania-flags-prefetch-version";
const LOCAL_COUNTRIES_KEY = "geomania-countries-json";

type VersionPayload = {
  version?: string;
};

const openCache = async (name: string): Promise<Cache | null> => {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  return caches.open(name);
};

export const getLocalDataVersion = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(VERSION_KEY);
};

const setLocalDataVersion = (version: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VERSION_KEY, version);
  } catch {
    // Ignore localStorage errors (Safari private mode, quota exceeded, etc.)
  }
};

const setFlagsPrefetchVersion = (version: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FLAGS_PREFETCH_KEY, version);
  } catch {
    // Ignore localStorage errors (Safari private mode, quota exceeded, etc.)
  }
};

const getFlagsPrefetchVersion = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(FLAGS_PREFETCH_KEY);
};

const readLocalCountries = (): Country[] | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_COUNTRIES_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Country[];
  } catch {
    return null;
  }
};

const writeLocalCountries = (countries: Country[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_COUNTRIES_KEY, JSON.stringify(countries));
  } catch {
    // Ignore localStorage quota errors.
  }
};

export const readCachedCountries = async (): Promise<Country[] | null> => {
  const cache = await openCache(DATA_CACHE);
  if (!cache) return readLocalCountries();
  const match = await cache.match(COUNTRIES_URL);
  if (!match) return readLocalCountries();
  const data = (await match.json()) as Country[];
  writeLocalCountries(data);
  return data;
};

export const fetchCountriesAndCache = async (): Promise<Country[]> => {
  const response = await fetch(COUNTRIES_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch countries data");
  }

  const cache = await openCache(DATA_CACHE);
  if (cache) {
    await cache.put(COUNTRIES_URL, response.clone());
  }

  const data = (await response.json()) as Country[];
  writeLocalCountries(data);
  return data;
};

export const fetchRemoteVersion = async (): Promise<string | null> => {
  try {
    const response = await fetch(VERSION_URL, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as VersionPayload;
    return payload.version ?? null;
  } catch {
    return null;
  }
};

export const refreshCountriesIfNeeded = async (
  current: Country[] | null
): Promise<{ countries: Country[] | null; version: string | null; updated: boolean }> => {
  const remoteVersion = await fetchRemoteVersion();
  const localVersion = getLocalDataVersion();
  const hasCached = Boolean(current && current.length);

  if (!remoteVersion) {
    // If version check fails but we have no data, try fetching countries.json directly
    if (!hasCached) {
      try {
        const fresh = await fetchCountriesAndCache();
        return { countries: fresh, version: null, updated: true };
      } catch {
        // If both version and countries fetch fail, return what we have
        return { countries: current, version: localVersion, updated: false };
      }
    }
    return { countries: current, version: localVersion, updated: false };
  }

  if (remoteVersion === localVersion && hasCached) {
    return { countries: current, version: remoteVersion, updated: false };
  }

  try {
    const fresh = await fetchCountriesAndCache();
    setLocalDataVersion(remoteVersion);
    return { countries: fresh, version: remoteVersion, updated: remoteVersion !== localVersion };
  } catch {
    // If fetch fails but we have cached data, keep using it
    return { countries: current, version: localVersion, updated: false };
  }
};

const cacheFlag = async (cache: Cache, url: string) => {
  const existing = await cache.match(url);
  if (existing) return;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (response.ok) {
      await cache.put(url, response);
    }
  } catch {
    // Ignore individual flag failures; remaining flags can still be cached.
  }
};

const prefetchFlags = async (urls: string[], concurrency = 8) => {
  const cache = await openCache(FLAGS_CACHE);
  if (!cache) return;

  const uniqueUrls = Array.from(new Set(urls));
  let index = 0;

  const worker = async () => {
    while (index < uniqueUrls.length) {
      const url = uniqueUrls[index];
      index += 1;
      await cacheFlag(cache, url);
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, uniqueUrls.length) }, () => worker());
  await Promise.all(workers);
};

export const prefetchFlagsIfNeeded = async (
  countries: Country[],
  version: string | null
): Promise<"ALREADY_READY" | "BECAME_READY" | "FAILED"> => {
  if (typeof window === "undefined" || !navigator.onLine) return "FAILED";
  if (!countries.length) return "FAILED";

  const cacheVersion = version ?? "unknown";
  if (getFlagsPrefetchVersion() === cacheVersion) return "ALREADY_READY";

  const cache = await openCache(FLAGS_CACHE);
  if (!cache) return "FAILED"; // Don't mark as complete if cache is unavailable

  const flagUrls = countries.map((country) => getAssetUrl(country.flag_url));
  await prefetchFlags(flagUrls);
  setFlagsPrefetchVersion(cacheVersion);
  return "BECAME_READY";
};
