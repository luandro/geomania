 
import { getAssetUrl } from '@/lib/assets';
import type { MapCapitalRecord, MapCountryMeta, MapData } from '@/types/map';
import type { Topology } from 'topojson-specification';
import { feature } from 'topojson-client';
import splitGeoJSON from 'geojson-antimeridian-cut';
import { normalizeAndSplitGeometry } from '@/lib/normalizeGeometry';
import { findLongSegments, printDiagnostics } from '@/lib/diagnostics';

const MAP_DATA_CACHE = 'geomania-map-data-v1';

export const MAP_TOPO_URL = getAssetUrl('/data/countries-110m.topo.json');
export const MAP_CAPITALS_URL = getAssetUrl('/data/capitals.json');
export const MAP_META_URL = getAssetUrl('/data/countries_meta.json');

export const MAP_ASSET_URLS = [MAP_TOPO_URL, MAP_CAPITALS_URL, MAP_META_URL];

type Progress = {
  completed: number;
  total: number;
};

const openCache = async () => {
  if (typeof window === 'undefined' || !('caches' in window)) return null;
  return caches.open(MAP_DATA_CACHE);
};

const matchAnyCache = async (url: string): Promise<Response | undefined> => {
  if (typeof window === 'undefined' || !('caches' in window)) return undefined;
  return caches.match(url) ?? undefined;
};

const fetchAndCache = async (url: string, cache: Cache | null) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  if (cache) {
    await cache.put(url, response.clone());
  }
  return response;
};

const readCachedOrFetch = async <T>(url: string): Promise<T> => {
  const anyMatch = await matchAnyCache(url);
  if (anyMatch) {
    return (await anyMatch.json()) as T;
  }
  const cache = await openCache();
  const response = await fetchAndCache(url, cache);
  return (await response.json()) as T;
};

export const areMapAssetsCached = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  const matches = await Promise.all(MAP_ASSET_URLS.map((url) => caches.match(url)));
  return matches.every(Boolean);
};

export const prefetchMapAssets = async (
  onProgress?: (progress: Progress) => void,
): Promise<void> => {
  const cache = await openCache();
  const total = MAP_ASSET_URLS.length;
  let completed = 0;

  for (const url of MAP_ASSET_URLS) {
    const match = await matchAnyCache(url);
    if (match) {
      completed += 1;
      onProgress?.({ completed, total });
      continue;
    }
    await fetchAndCache(url, cache);
    completed += 1;
    onProgress?.({ completed, total });
  }
};

export const loadMapCapitals = async (): Promise<MapCapitalRecord[]> => {
  return readCachedOrFetch<MapCapitalRecord[]>(MAP_CAPITALS_URL);
};

export const loadCountriesMeta = async (): Promise<MapCountryMeta[]> => {
  return readCachedOrFetch<MapCountryMeta[]>(MAP_META_URL);
};

export const buildNumericToIsoMap = (meta: MapCountryMeta[]) => {
  const numericToIso = new Map<string, string>();
  meta.forEach((entry) => {
    if (entry.iso_numeric && entry.iso_a3) {
      numericToIso.set(String(entry.iso_numeric).padStart(3, '0'), entry.iso_a3);
    }
  });
  return numericToIso;
};

export const loadMapData = async (): Promise<MapData> => {
  const [topologyRaw, meta] = await Promise.all([
    readCachedOrFetch<unknown>(MAP_TOPO_URL),
    loadCountriesMeta(),
  ]);

  const topology = topologyRaw as Topology;

  const geoJson = feature(topology, topology.objects.countries) as GeoJSON.FeatureCollection<
    GeoJSON.Geometry,
    { name?: string }
  >;

  const numericToIso = buildNumericToIsoMap(meta);

  const featuresWithIso = geoJson.features
    .map((featureItem) => {
      const rawId = featureItem.id != null ? String(featureItem.id) : '';
      const iso = numericToIso.get(rawId.padStart(3, '0'));
      if (!iso) return null;
      return {
        ...featureItem,
        properties: { iso_a3: iso },
      } as GeoJSON.Feature<GeoJSON.Geometry, { iso_a3: string }>;
    })
    .filter((item): item is GeoJSON.Feature<GeoJSON.Geometry, { iso_a3: string }> => Boolean(item));

  let split: GeoJSON.FeatureCollection<GeoJSON.Geometry, { iso_a3: string }>;
  try {
    split = splitGeoJSON({
      ...geoJson,
      features: featuresWithIso,
    }) as GeoJSON.FeatureCollection<GeoJSON.Geometry, { iso_a3: string }>;
  } catch {
    split = {
      ...geoJson,
      features: featuresWithIso,
    } as GeoJSON.FeatureCollection<GeoJSON.Geometry, { iso_a3: string }>;
  }

  const normalized = normalizeAndSplitGeometry(split);
  const diagnostics = findLongSegments(normalized);
  if (diagnostics.count > 0) {
    printDiagnostics(diagnostics);
  }

  const features = normalized.features.filter(
    (item): item is GeoJSON.Feature<GeoJSON.Geometry, { iso_a3: string }> => Boolean(item?.properties?.iso_a3),
  );

  const featureByIso: Record<string, GeoJSON.Feature<GeoJSON.Geometry, { iso_a3: string }>> = {};
  const isoSet = new Set<string>();
  features.forEach((featureItem) => {
    isoSet.add(featureItem.properties.iso_a3);
    featureByIso[featureItem.properties.iso_a3] = featureItem;
  });

  return {
    geoJson: {
      ...geoJson,
      features,
    },
    isoSet,
    featureByIso,
  };
};
